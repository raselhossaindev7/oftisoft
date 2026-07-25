import { api } from "@/lib/api";
export interface PaymentMethod {
    id: string;
    brand: string;
    last4: string;
    expiry: string;
    isDefault: boolean;
    type: string;
    createdAt: string;
}

export interface Transaction {
    id: string;
    invoiceId: string;
    amount: string;
    type: string;
    status: string;
    createdAt: string;
    dueAt?: string;
}

export interface SubscriptionPlan {
    id: string;
    name: string;
    price: number;
    interval: string;
    description: string;
    features: string[];
    buttonText: string;
    activeSubscribers: number;
    iconName: string;
    color: string;
    bgColor: string;
    isActive: boolean;
}

export interface CheckoutSessionResponse {
    checkoutUrl: string;
    sessionId: string;
}

export interface CartItem {
    productId: string;
    quantity: number;
}

export const billingAPI = {
    getPlans: async (): Promise<SubscriptionPlan[]> => {
        const response = await api.get('/billing/plans');
        return response.data;
    },
    getPaymentMethods: async (): Promise<PaymentMethod[]> => {
        const response = await api.get('/billing/payment-methods');
        return response.data;
    },
    addPaymentMethod: async (data: Partial<PaymentMethod>): Promise<PaymentMethod> => {
        const response = await api.post('/billing/payment-methods', data);
        return response.data;
    },
    setDefaultPaymentMethod: async (id: string): Promise<PaymentMethod> => {
        const response = await api.patch(`/billing/payment-methods/${id}/default`);
        return response.data;
    },
    deletePaymentMethod: async (id: string): Promise<void> => {
        await api.delete(`/billing/payment-methods/${id}`);
    },
    getTransactions: async (): Promise<Transaction[]> => {
        const response = await api.get('/billing/transactions');
        return response.data;
    },
    createTransaction: async (data: Partial<Transaction>): Promise<Transaction> => {
        const response = await api.post('/billing/transactions', data);
        return response.data;
    },
    getSubscription: async (): Promise<{ plan: string; status: string; interval: string; nextBillingDate: string }> => {
        const response = await api.get('/billing/subscription');
        return response.data;
    },
    updateSubscription: async (plan: string): Promise<{ plan?: string; interval?: string }> => {
        const response = await api.patch('/billing/subscription', { plan });
        return response.data;
    },
    getUsage: async (): Promise<UsageData> => {
        const response = await api.get('/billing/usage');
        return response.data;
    },
    createCheckoutSession: async (items: CartItem[], options?: {
        cancelUrl?: string;
        discountCodes?: string[];
    }): Promise<CheckoutSessionResponse> => {
        const response = await api.post('/billing/create-checkout-session', {
            items,
            cancelUrl: options?.cancelUrl,
            discountCodes: options?.discountCodes,
        });
        return response.data;
    },
    createSubscriptionCheckout: async (productId: string, options?: {
        quantity?: number;
        discountCodes?: string[];
        trialPeriodDays?: number;
    }): Promise<CheckoutSessionResponse> => {
        const response = await api.post('/billing/create-subscription-checkout', {
            productId,
            quantity: options?.quantity || 1,
            discountCodes: options?.discountCodes,
            trialPeriodDays: options?.trialPeriodDays,
        });
        return response.data;
    },
    shopCheckout: async (items: CartItem[], email: string, options?: {
        name?: string;
        cancelUrl?: string;
        discountCodes?: string[];
    }): Promise<CheckoutSessionResponse> => {
        const response = await api.post('/billing/shop/checkout', {
            items,
            email,
            name: options?.name,
            cancelUrl: options?.cancelUrl,
            discountCodes: options?.discountCodes,
        });
        return response.data;
    },
    cancelSubscription: async (): Promise<any> => {
        const response = await api.post('/billing/cancel-subscription');
        return response.data;
    },
    changePlan: async (subscriptionId: string, productId: string, quantity?: number): Promise<any> => {
        const response = await api.post('/billing/change-plan', { subscriptionId, productId, quantity });
        return response.data;
    },
    listDiscounts: async (): Promise<any[]> => {
        const response = await api.get('/billing/discounts');
        return response.data;
    },
    validateDiscount: async (code: string): Promise<any> => {
        const response = await api.post('/billing/validate-discount', { code });
        return response.data;
    },
    createRefund: async (paymentId: string): Promise<any> => {
        const response = await api.post('/billing/create-refund', { paymentId });
        return response.data;
    },
    completeCheckout: async (_sessionId: string): Promise<any> => {
        return { message: 'Checkout completed' };
    },
    downloadInvoice: async (invoiceId: string): Promise<void> => {
        const response = await api.get(`/billing/transactions/${invoiceId}/download`, {
            responseType: 'blob',
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `invoice_${invoiceId}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    },
};

export interface UsageData {
    storage?: { used: string; total: string; percent: number };
    apiCalls?: { used: string; total: string; percent: number };
}

export interface InventoryItem {
    id: string;
    name: string;
    image: string | null;
    version: string;
    date: string;
    license: string;
    type: string;
    compatibility: string;
    docUrl: string | null;
    demoUrl: string | null;
    bonusAsset: string;
    productId: string;
}

export interface HistoryItem {
    id: string;
    productName: string;
    version: string;
    date: string;
    ip: string;
    action: string;
    details: string;
}

export interface NotificationItem {
    id: string;
    productId: string;
    productName: string;
    oldVersion: string;
    newVersion: string;
    date: string;
    importance: string;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    skip: number;
    take: number;
}

export interface DownloadRecordResponse {
    id: string;
    version: string;
    downloadDate: string;
    downloadUrl: string | null;
}

export interface DownloadUrlResponse {
    downloadUrl: string | null;
    version: string;
}

export const downloadsAPI = {
    getInventory: async (skip = 0, take = 50): Promise<PaginatedResponse<InventoryItem>> => {
        const response = await api.get('/downloads/inventory', { params: { skip, take } });
        return response.data;
    },
    getHistory: async (skip = 0, take = 50): Promise<PaginatedResponse<HistoryItem>> => {
        const response = await api.get('/downloads/history', { params: { skip, take } });
        return response.data;
    },
    getNotifications: async (): Promise<NotificationItem[]> => {
        const response = await api.get('/downloads/notifications');
        return response.data;
    },
    recordDownload: async (id: string): Promise<DownloadRecordResponse> => {
        const response = await api.post(`/downloads/${id}/record`);
        return response.data;
    },
    getDownloadUrl: async (assetId: string): Promise<DownloadUrlResponse> => {
        const response = await api.get(`/downloads/${assetId}/download`);
        return response.data;
    },
    getVersions: async (productId: string): Promise<any[]> => {
        const response = await api.get(`/downloads/${productId}/versions`);
        return response.data;
    },
    getChangelog: async (productId: string): Promise<any> => {
        const response = await api.get(`/downloads/${productId}/changelog`);
        return response.data;
    },
};




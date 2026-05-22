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

export const billingAPI = {
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
    getPlans: async (interval?: string): Promise<SubscriptionPlan[]> => {
        const params = interval ? { interval } : {};
        const response = await api.get('/billing/plans', { params });
        return response.data;
    },
    getGroupedPlans: async (interval?: string): Promise<Record<string, SubscriptionPlan[]>> => {
        const params: any = { grouped: 'true' };
        if (interval) params.interval = interval;
        const response = await api.get('/billing/plans', { params });
        return response.data;
    },
    getSubscription: async (): Promise<{ plan: string; status: string; interval: string; nextBillingDate: string }> => {
        const response = await api.get('/billing/subscription');
        return response.data;
    },
    updateSubscription: async (plan: string, paymentIntentId?: string, interval?: string): Promise<{ requiresPayment?: boolean; clientSecret?: string; plan?: string; interval?: string }> => {
        const response = await api.patch('/billing/subscription', { plan, paymentIntentId, interval });
        return response.data;
    },
    getUsage: async (): Promise<UsageData> => {
        const response = await api.get('/billing/usage');
        return response.data;
    },
    createPaymentIntent: async (amount: number, currency: string = 'usd'): Promise<{ clientSecret: string; id: string }> => {
        const response = await api.post('/billing/create-payment-intent', { amount, currency });
        return response.data;
    },
    completeCheckout: async (sessionId: string): Promise<any> => {
      const response = await api.post('/billing/complete-checkout', { sessionId });
      return response.data;
    },
    createCheckoutSession: async (amount: number, currency?: string, items?: { productId: string; productName: string; price: number; quantity: number; licenseType?: string }[]): Promise<{ url: string; sessionId: string }> => {
        const successUrl = `${window.location.origin}/shop/success?session_id={CHECKOUT_SESSION_ID}`;
        const cancelUrl = `${window.location.origin}/shop/checkout`;
        const response = await api.post('/billing/create-checkout-session', { amount, currency, successUrl, cancelUrl, items });
        return response.data;
    },
    createSetupIntent: async (): Promise<{ clientSecret: string }> => {
        const response = await api.post('/billing/create-setup-intent');
        return response.data;
    },
    attachPaymentMethod: async (paymentMethodId: string): Promise<PaymentMethod> => {
        const response = await api.post('/billing/payment-methods/attach', { paymentMethodId });
        return response.data;
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

export const downloadsAPI = {
    getInventory: async (skip = 0, take = 50): Promise<{ items: any[]; total: number; skip: number; take: number }> => {
        const response = await api.get('/downloads/inventory', { params: { skip, take } });
        return response.data;
    },
    getHistory: async (skip = 0, take = 50): Promise<{ items: any[]; total: number; skip: number; take: number }> => {
        const response = await api.get('/downloads/history', { params: { skip, take } });
        return response.data;
    },
    getNotifications: async (): Promise<any[]> => {
        const response = await api.get('/downloads/notifications');
        return response.data;
    },
    recordDownload: async (id: string): Promise<any> => {
        const response = await api.post(`/downloads/${id}/record`);
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

export const favoritesAPI = {
    getFavorites: async (): Promise<any[]> => {
        const response = await api.get('/favorites');
        return response.data;
    },
    addFavorite: async (productId: string): Promise<any> => {
        const response = await api.post(`/favorites/${productId}`);
        return response.data;
    },
    removeFavorite: async (productId: string): Promise<any> => {
        const response = await api.delete(`/favorites/${productId}`);
        return response.data;
    },
    checkFavorite: async (productId: string): Promise<{ isFavorite: boolean }> => {
        const response = await api.get(`/favorites/${productId}/check`);
        return response.data;
    },
};


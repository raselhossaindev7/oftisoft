import { api } from "@/lib/api";
import type { User } from "./auth";
export const adminUserAPI = {
    getUsers: async (params?: { search?: string; role?: string; isActive?: boolean }) => {
        const response = await api.get<User[]>("/admin/users", { params });
        return response.data;
    },
    getUser: async (id: string) => {
        const response = await api.get<User>(`/admin/users/${id}`);
        return response.data;
    },
    getUserStats: async (id: string) => {
        const response = await api.get<{ ltv: string; orderCount: number; ticketCount: number }>(`/admin/users/${id}/stats`);
        return response.data;
    },
    createUser: async (data: any) => {
        const response = await api.post<User>("/admin/users", data);
        return response.data;
    },
    updateUser: async (id: string, data: Partial<User>) => {
        const response = await api.patch<User>(`/admin/users/${id}`, data);
        return response.data;
    },
    deleteUser: async (id: string) => {
        await api.delete(`/admin/users/${id}`);
    },
    toggleUserStatus: async (id: string) => {
        const response = await api.patch<User>(`/admin/users/${id}/toggle-status`);
        return response.data;
    },
    getActivity: async (id: string) => {
        const response = await api.get<any[]>(`/admin/users/${id}/activity`);
        return response.data;
    }
};

export const adminFinanceAPI = {
    getTransactions: async (params?: { status?: string; dateFrom?: string; dateTo?: string }) => {
        const response = await api.get<any[]>("/admin/billing/transactions", { params });
        return response.data;
    },
    getStats: async () => {
        const response = await api.get<any>("/admin/billing/stats");
        return response.data;
    },
    getPayouts: async () => {
        const response = await api.get<any[]>("/admin/billing/payouts");
        return response.data;
    },
    processPayout: async (data: any) => {
        const response = await api.post("/admin/billing/process-payout", data);
        return response.data;
    },
    getConfig: async () => {
        const response = await api.get<any>("/admin/billing/config");
        return response.data;
    },
    updateConfig: async (config: any) => {
        const response = await api.patch("/admin/billing/config", config);
        return response.data;
    },
    getTaxRates: async () => {
        const response = await api.get<any[]>("/admin/billing/tax-rates");
        return response.data;
    },
    createTaxRate: async (data: any) => {
        const response = await api.post("/admin/billing/tax-rates", data);
        return response.data;
    },
    updateTaxRate: async (id: string, data: any) => {
        const response = await api.patch(`/admin/billing/tax-rates/${id}`, data);
        return response.data;
    },
    deleteTaxRate: async (id: string) => {
        await api.delete(`/admin/billing/tax-rates/${id}`);
    },

    // Dodo Payments
    getDodoProducts: async () => {
        const response = await api.get<any[]>("/admin/billing/dodo/products");
        return response.data;
    },
    getDodoPayments: async (customerId?: string) => {
        const response = await api.get<any[]>("/admin/billing/dodo/payments", { params: { customerId } });
        return response.data;
    },
    getDodoSubscriptions: async (customerId?: string) => {
        const response = await api.get<any[]>("/admin/billing/dodo/subscriptions", { params: { customerId } });
        return response.data;
    },
    getDodoCustomers: async () => {
        const response = await api.get<any[]>("/admin/billing/dodo/customers");
        return response.data;
    },
    getDodoDiscounts: async () => {
        const response = await api.get<any[]>("/admin/billing/dodo/discounts");
        return response.data;
    },
};

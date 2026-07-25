import { api } from "@/lib/api";
export const affiliateAdminAPI = {
    // Dashboard
    getDashboardStats: async (): Promise<any> => {
        const response = await api.get('/affiliate/admin/dashboard');
        return response.data;
    },

    // Affiliates
    getAffiliates: async (params?: { page?: number; status?: string; tier?: string; search?: string }): Promise<any> => {
        const response = await api.get('/affiliate/admin/affiliates', { params });
        return response.data;
    },
    getAffiliateById: async (id: string): Promise<any> => {
        const response = await api.get(`/affiliate/admin/affiliates/${id}`);
        return response.data;
    },
    approveAffiliate: async (id: string): Promise<any> => {
        const response = await api.post(`/affiliate/admin/affiliates/${id}/approve`);
        return response.data;
    },
    suspendAffiliate: async (id: string, reason?: string): Promise<any> => {
        const response = await api.post(`/affiliate/admin/affiliates/${id}/suspend`, { reason });
        return response.data;
    },
    banAffiliate: async (id: string, reason?: string): Promise<any> => {
        const response = await api.post(`/affiliate/admin/affiliates/${id}/ban`, { reason });
        return response.data;
    },
    updateAffiliateTier: async (id: string, tier: string): Promise<any> => {
        const response = await api.patch(`/affiliate/admin/affiliates/${id}/tier`, { tier });
        return response.data;
    },
    updateAffiliateRate: async (id: string, rate: number): Promise<any> => {
        const response = await api.patch(`/affiliate/admin/affiliates/${id}/rate`, { rate });
        return response.data;
    },
    addAffiliateNote: async (id: string, note: string): Promise<any> => {
        const response = await api.post(`/affiliate/admin/affiliates/${id}/notes`, { note });
        return response.data;
    },

    // Commissions
    getCommissions: async (params?: { page?: number; status?: string; affiliateId?: string }): Promise<any> => {
        const response = await api.get('/affiliate/admin/commissions', { params });
        return response.data;
    },
    approveCommission: async (id: string): Promise<any> => {
        const response = await api.post(`/affiliate/admin/commissions/${id}/approve`);
        return response.data;
    },
    rejectCommission: async (id: string, reason?: string): Promise<any> => {
        const response = await api.post(`/affiliate/admin/commissions/${id}/reject`, { reason });
        return response.data;
    },
    bulkApproveCommissions: async (ids: string[]): Promise<any> => {
        const response = await api.post('/affiliate/admin/commissions/bulk-approve', { ids });
        return response.data;
    },

    // Withdrawals
    getWithdrawals: async (params?: { page?: number; status?: string; affiliateId?: string }): Promise<any> => {
        const response = await api.get('/affiliate/admin/withdrawals', { params });
        return response.data;
    },
    approveWithdrawal: async (id: string): Promise<any> => {
        const response = await api.post(`/affiliate/admin/withdrawals/${id}/approve`);
        return response.data;
    },
    processWithdrawal: async (id: string): Promise<any> => {
        const response = await api.post(`/affiliate/admin/withdrawals/${id}/process`);
        return response.data;
    },
    completeWithdrawal: async (id: string, transactionId?: string): Promise<any> => {
        const response = await api.post(`/affiliate/admin/withdrawals/${id}/complete`, { transactionId });
        return response.data;
    },
    rejectWithdrawal: async (id: string, reason?: string): Promise<any> => {
        const response = await api.post(`/affiliate/admin/withdrawals/${id}/reject`, { reason });
        return response.data;
    },

    // Settings
    getSettings: async (): Promise<any> => {
        const response = await api.get('/affiliate/admin/settings');
        return response.data;
    },
    updateSettings: async (settings: any): Promise<any> => {
        const response = await api.patch('/affiliate/admin/settings', settings);
        return response.data;
    },

    // Enums
    getEnums: async (): Promise<any> => {
        const response = await api.get('/affiliate/admin/enums');
        return response.data;
    },

    // Audit Logs
    getAuditLogs: async (params?: { page?: number; limit?: number; affiliateId?: string; action?: string; dateFrom?: string; dateTo?: string }): Promise<any> => {
        const response = await api.get('/affiliate/admin/audit-logs', { params });
        return response.data;
    },
    getAuditStats: async (days?: number): Promise<any> => {
        const response = await api.get('/affiliate/admin/audit-stats', { params: { days } });
        return response.data;
    },
};


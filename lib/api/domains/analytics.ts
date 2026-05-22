import { api } from "@/lib/api";
export const analyticsAPI = {
    trackVisit: async (data: { page: string; referrer?: string; userId?: string }): Promise<void> => {
        await api.post('/analytics/track/visit', data);
    },
    trackEvent: async (data: { eventType: string; eventLabel?: string; page?: string; metadata?: any }): Promise<void> => {
        await api.post('/analytics/track/event', data);
    },
    getStats: async (timeRange?: 'day' | 'week' | 'month'): Promise<any> => {
        const params = timeRange ? { timeRange } : {};
        const response = await api.get('/analytics/stats', { params });
        return response.data;
    },
};

export const affiliateAPI = {
    getStats: async (): Promise<any> => {
        const response = await api.get('/affiliate/stats');
        return response.data;
    },
    withdraw: async (data: { amount: number; method: string; paymentDetails?: any }): Promise<any> => {
        const response = await api.post('/affiliate/withdraw', data);
        return response.data;
    },
    getWithdrawalMethods: async (): Promise<any> => {
        const response = await api.get('/affiliate/methods');
        return response.data;
    },
    cancelWithdrawal: async (id: string): Promise<any> => {
        const response = await api.post(`/affiliate/withdraw/${id}/cancel`);
        return response.data;
    },
};


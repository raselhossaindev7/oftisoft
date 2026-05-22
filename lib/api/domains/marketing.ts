import { api } from "@/lib/api";
import type { User } from "./auth";
export const marketingAPI = {
    getCoupons: async (): Promise<any[]> => {
        const response = await api.get('/marketing/coupons');
        return response.data;
    },
    createCoupon: async (data: any): Promise<any> => {
        const response = await api.post('/marketing/coupons', data);
        return response.data;
    },
    deleteCoupon: async (id: string): Promise<any> => {
        const response = await api.delete(`/marketing/coupons/${id}`);
        return response.data;
    },
    getBundles: async (): Promise<any[]> => {
        const response = await api.get('/marketing/bundles');
        return response.data;
    },
    createBundle: async (data: any): Promise<any> => {
        const response = await api.post('/marketing/bundles', data);
        return response.data;
    },
    getProducts: async (): Promise<any[]> => {
        const response = await api.get('/marketing/products');
        return response.data;
    },
    deleteBundle: async (id: string): Promise<any> => {
        const response = await api.delete(`/marketing/bundles/${id}`);
        return response.data;
    },
    updateCoupon: async (id: string, data: any): Promise<any> => {
        const response = await api.put(`/marketing/coupons/${id}`, data);
        return response.data;
    },
    updateBundle: async (id: string, data: any): Promise<any> => {
        const response = await api.put(`/marketing/bundles/${id}`, data);
        return response.data;
    },
    getSubscriptionPlans: async (interval?: string): Promise<any[]> => {
        const params = interval ? { interval } : {};
        const response = await api.get('/marketing/subscription-plans', { params });
        return response.data;
    },
    createSubscriptionPlan: async (data: any): Promise<any> => {
        const response = await api.post('/marketing/subscription-plans', data);
        return response.data;
    },
    updateSubscriptionPlan: async (id: string, data: any): Promise<any> => {
        const response = await api.put(`/marketing/subscription-plans/${id}`, data);
        return response.data;
    },
    deleteSubscriptionPlan: async (id: string): Promise<any> => {
        const response = await api.delete(`/marketing/subscription-plans/${id}`);
        return response.data;
    },
};

export interface SystemConfig {
    id: number;
    shopName: string;
    supportEmail: string;
    description: string;
    currency: string;
    timezone: string;
    dateFormat: string;
    maintenanceMode: boolean;
    passwordPolicy: 'low' | 'medium' | 'high';
    allowedIps: string;
    stripePublishableKey?: string;
    stripeSecretKey?: string;
    paypalClientId?: string;
    paypalClientSecret?: string;
    updatedAt: string;
}

export interface ApiKey {
    id: string;
    name: string;
    key: string;
    status: 'active' | 'revoked';
    createdAt: string;
    lastUsedAt?: string;
}

export interface EmailTemplate {
    id: string;
    name: string;
    subject: string;
    body: string;
    status: 'active' | 'draft';
    createdAt: string;
    updatedAt: string;
}

export const systemAPI = {
    getConfig: async (): Promise<SystemConfig> => {
        const response = await api.get('/system/config');
        return response.data;
    },
    getPublicConfig: async (): Promise<{ stripePublishableKey?: string; paypalClientId?: string; shopName: string; currency: string }> => {
        const response = await api.get('/system/public/config');
        return response.data;
    },
    updateConfig: async (data: Partial<SystemConfig>): Promise<SystemConfig> => {
        const response = await api.post('/system/config', data);
        return response.data;
    },
    getAllStaff: async (): Promise<User[]> => {
        const response = await api.get('/system/staff');
        return response.data;
    },
    updateStaffRole: async (id: string, role: string): Promise<User> => {
        const response = await api.patch(`/system/staff/${id}/role`, { role });
        return response.data;
    },
    removeStaff: async (id: string): Promise<void> => {
        await api.delete(`/system/staff/${id}`);
    },
    getApiKeys: async (): Promise<ApiKey[]> => {
        const response = await api.get('/system/api-keys');
        return response.data;
    },
    createApiKey: async (name: string): Promise<ApiKey> => {
        const response = await api.post('/system/api-keys', { name });
        return response.data;
    },
    revokeApiKey: async (id: string): Promise<void> => {
        await api.patch(`/system/api-keys/${id}/revoke`);
    },
    getEmailTemplates: async (): Promise<EmailTemplate[]> => {
        const response = await api.get('/system/email-templates');
        return response.data;
    },
    createEmailTemplate: async (data: Partial<EmailTemplate>): Promise<EmailTemplate> => {
        const response = await api.post('/system/email-templates', data);
        return response.data;
    },
    updateEmailTemplate: async (id: string, data: Partial<EmailTemplate>): Promise<EmailTemplate> => {
        const response = await api.patch(`/system/email-templates/${id}`, data);
        return response.data;
    },
    deleteEmailTemplate: async (id: string): Promise<void> => {
        await api.delete(`/system/email-templates/${id}`);
    },
};

export const integrationsAPI = {
    getIntegrations: async (): Promise<any[]> => {
        const response = await api.get('/integrations');
        return response.data;
    },
    toggleIntegration: async (id: string, connected: boolean): Promise<any> => {
        const response = await api.post(`/integrations/${id}/toggle`, { connected });
        return response.data;
    }
};


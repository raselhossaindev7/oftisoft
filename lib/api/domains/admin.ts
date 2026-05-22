import { api } from "@/lib/api";

export const adminAPI = {
  getLicenses: async (search?: string) => {
    const params = search ? { search } : {};
    const res = await api.get('/admin/licenses', { params });
    return res.data;
  },
  grantLicense: async (data: { userId: string; productId: string; licenseType?: string; bonusAsset?: string }) => {
    const res = await api.post('/admin/licenses/grant', data);
    return res.data;
  },
  revokeLicense: async (id: string) => {
    const res = await api.delete(`/admin/licenses/${id}`);
    return res.data;
  },
  getProductVersions: async (productId: string) => {
    const res = await api.get(`/admin/products/${productId}/versions`);
    return res.data;
  },
  createVersion: async (productId: string, data: { version: string; changelog: string; downloadUrl?: string; importance?: string }) => {
    const res = await api.post(`/admin/products/${productId}/versions`, data);
    return res.data;
  },
  getDownloadAnalytics: async (days?: number, productId?: string) => {
    const params: any = {};
    if (days) params.days = days;
    if (productId) params.productId = productId;
    const res = await api.get('/admin/analytics/downloads', { params });
    return res.data;
  },
  refundOrder: async (id: string) => {
    const res = await api.post(`/orders/${id}/refund`);
    return res.data;
  },
};

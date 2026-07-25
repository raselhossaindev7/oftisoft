import { api } from "@/lib/api";
import type { ServicesPageContent } from "@/lib/store/services-content";

export const servicesContentAPI = {
  getAll: async (): Promise<ServicesPageContent> => {
    const response = await api.get<any>("/services-content");
    return response?.data ?? response;
  },

  saveAll: async (data: ServicesPageContent): Promise<{ success: boolean; lastUpdated: string }> => {
    const response = await api.put<any>("/services-content", { data });
    return { success: true, lastUpdated: response?.data?.lastUpdated ?? new Date().toISOString() };
  },
};

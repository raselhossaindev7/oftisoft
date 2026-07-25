import { api } from "@/lib/api";

export interface AuditLog {
  id: string;
  userId: string;
  userEmail: string;
  userRole: string;
  action: string;
  targetType: string;
  targetId?: string;
  oldValue?: any;
  newValue?: any;
  description?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface AuditStats {
  totalEvents: number;
  uniqueUsers: number;
  actionsToday: number;
  dateRange: { earliest: string | null; latest: string | null };
  byAction: Record<string, number>;
  byUser: Record<string, number>;
  byDay: Record<string, number>;
}

export interface AuditLogsResponse {
  data: AuditLog[];
  total: number;
}

export const auditAPI = {
  getAll: async (params?: {
    limit?: number;
    offset?: number;
    action?: string;
    userId?: string;
    targetType?: string;
    since?: string;
    until?: string;
  }): Promise<AuditLogsResponse> => {
    const response = await api.get('/audit/logs', { params });
    return response.data;
  },

  getStats: async (days?: number): Promise<AuditStats> => {
    const response = await api.get('/audit/stats', { params: { days } });
    return response.data;
  },

  getMyActivity: async (limit?: number): Promise<AuditLog[]> => {
    const response = await api.get('/audit/my-activity', { params: { limit } });
    return response.data;
  },
};

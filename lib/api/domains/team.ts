import { api } from "@/lib/api";

export interface TeamMember {
    id: string;
    name: string;
    role: string;
    bio?: string;
    avatar?: string;
    email?: string;
    socialLinks?: string;
    tags?: string | string[];
    order: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface TeamMembersResponse {
    items: TeamMember[];
    total: number;
    skip: number;
    take: number;
}

export interface TeamStats {
    total: number;
    active: number;
    inactive: number;
}

export interface TeamFilters {
    skip?: number;
    take?: number;
    search?: string;
    status?: string;
    sortField?: string;
    sortDirection?: 'ASC' | 'DESC';
}

export const teamMembersAPI = {
    getAll: async (filters?: TeamFilters): Promise<TeamMembersResponse> => {
        const response = await api.get('/team-members', { params: filters });
        return response.data;
    },
    getActive: async (): Promise<TeamMember[]> => {
        const response = await api.get('/team-members/active');
        return response.data;
    },
    getOne: async (id: string): Promise<TeamMember> => {
        const response = await api.get(`/team-members/${id}`);
        return response.data;
    },
    getStats: async (): Promise<TeamStats> => {
        const response = await api.get('/team-members/stats');
        return response.data;
    },
    create: async (data: Partial<TeamMember>): Promise<TeamMember> => {
        const response = await api.post('/team-members', data);
        return response.data;
    },
    update: async (id: string, data: Partial<TeamMember>): Promise<TeamMember> => {
        const response = await api.patch(`/team-members/${id}`, data);
        return response.data;
    },
    delete: async (id: string): Promise<void> => {
        await api.delete(`/team-members/${id}`);
    },
    bulkDelete: async (ids: string[]): Promise<void> => {
        await api.post('/team-members/bulk-delete', { ids });
    },
    bulkUpdateStatus: async (ids: string[], isActive: boolean): Promise<void> => {
        await api.post('/team-members/bulk-status', { ids, isActive });
    },
    reorder: async (updates: { id: string; order: number }[]): Promise<void> => {
        await api.post('/team-members/reorder', { updates });
    },
};

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

export const teamMembersAPI = {
    getAll: async (params?: { search?: string; isActive?: boolean }): Promise<TeamMember[]> => {
        const response = await api.get('/team-members', { params });
        return response.data;
    },
    getActive: async (): Promise<TeamMember[]> => {
        const response = await api.get('/team-members/active');
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
};

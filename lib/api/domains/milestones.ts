import { api } from "@/lib/api";
import type { Milestone } from "./projects";

export const milestonesAPI = {
    getByProject: async (projectId: string): Promise<Milestone[]> => {
        const response = await api.get(`/milestones/project/${projectId}`);
        return response.data;
    },
    getOne: async (id: string): Promise<Milestone> => {
        const response = await api.get(`/milestones/${id}`);
        return response.data;
    },
    create: async (data: { title: string; description?: string; dueDate?: string; projectId: string }): Promise<Milestone> => {
        const response = await api.post('/milestones', data);
        return response.data;
    },
    update: async (id: string, data: Partial<Milestone>): Promise<Milestone> => {
        const response = await api.patch(`/milestones/${id}`, data);
        return response.data;
    },
    delete: async (id: string): Promise<void> => {
        await api.delete(`/milestones/${id}`);
    },
    reorder: async (projectId: string, milestoneIds: string[]): Promise<Milestone[]> => {
        const response = await api.post(`/milestones/reorder/${projectId}`, { milestoneIds });
        return response.data;
    }
};

import { api } from "@/lib/api";

export interface Event {
    id: string;
    title: string;
    slug: string;
    description: string;
    shortDescription?: string;
    type: 'webinar' | 'workshop' | 'conference' | 'meetup' | 'hackathon' | 'training';
    status: 'draft' | 'published' | 'cancelled' | 'completed';
    startDate: string;
    endDate: string;
    timezone?: string;
    location?: string;
    venue?: string;
    address?: string;
    onlinePlatform?: string;
    meetingUrl?: string;
    capacity: number;
    registeredCount: number;
    price: number;
    isFree: boolean;
    image?: string;
    tags?: string[];
    agenda?: Array<{ time: string; title: string; description: string; speaker?: string }>;
    speakers?: Array<{ id: string; name: string; bio: string; avatar: string; role: string; company: string }>;
    registrationDeadline?: string;
    requiresApproval: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface EventResponse {
    items: Event[];
    total: number;
    skip: number;
    take: number;
}

export interface EventStats {
    total: number;
    published: number;
    draft: number;
    cancelled: number;
    completed: number;
}

export interface EventFilters {
    skip?: number;
    take?: number;
    search?: string;
    status?: string;
    type?: string;
    upcoming?: string;
    sortField?: string;
    sortDirection?: 'ASC' | 'DESC';
}

export const eventsAPI = {
    getAll: async (filters?: EventFilters): Promise<EventResponse> => {
        const response = await api.get('/events', { params: filters });
        return response.data;
    },
    getUpcoming: async (): Promise<Event[]> => {
        const response = await api.get('/events/upcoming');
        return response.data;
    },
    getOne: async (id: string): Promise<Event> => {
        const response = await api.get(`/events/${id}`);
        return response.data;
    },
    getStats: async (): Promise<EventStats> => {
        const response = await api.get('/events/stats');
        return response.data;
    },
    create: async (data: Partial<Event>): Promise<Event> => {
        const response = await api.post('/events', data);
        return response.data;
    },
    update: async (id: string, data: Partial<Event>): Promise<Event> => {
        const response = await api.put(`/events/${id}`, data);
        return response.data;
    },
    delete: async (id: string): Promise<void> => {
        await api.delete(`/events/${id}`);
    },
    publish: async (id: string): Promise<Event> => {
        const response = await api.put(`/events/${id}/publish`);
        return response.data;
    },
    bulkDelete: async (ids: string[]): Promise<void> => {
        await api.post('/events/bulk-delete', { ids });
    },
    bulkUpdateStatus: async (ids: string[], status: string): Promise<void> => {
        await api.post('/events/bulk-status', { ids, status });
    },
};

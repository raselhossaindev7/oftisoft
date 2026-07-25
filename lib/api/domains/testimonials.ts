import { api } from "@/lib/api";

export interface Testimonial {
    id: string;
    name: string;
    role?: string;
    company?: string;
    quote: string;
    avatar?: string;
    rating: number;
    gradient?: string;
    isActive: boolean;
    order: number;
    createdAt: string;
    updatedAt: string;
}

export interface TestimonialsResponse {
    items: Testimonial[];
    total: number;
    skip: number;
    take: number;
}

export interface TestimonialStats {
    total: number;
    active: number;
    averageRating: number;
    highRatedCount: number;
}

export interface TestimonialsFilters {
    skip?: number;
    take?: number;
    search?: string;
    status?: string;
    rating?: string;
    sortField?: string;
    sortDirection?: 'ASC' | 'DESC';
}

export const testimonialsAPI = {
    getAll: async (filters?: TestimonialsFilters): Promise<TestimonialsResponse> => {
        const response = await api.get('/testimonials', { params: filters });
        return response.data;
    },
    getActive: async (): Promise<Testimonial[]> => {
        const response = await api.get('/testimonials/active');
        return response.data;
    },
    getOne: async (id: string): Promise<Testimonial> => {
        const response = await api.get(`/testimonials/${id}`);
        return response.data;
    },
    getStats: async (): Promise<TestimonialStats> => {
        const response = await api.get('/testimonials/stats');
        return response.data;
    },
    create: async (data: Partial<Testimonial>): Promise<Testimonial> => {
        const response = await api.post('/testimonials', data);
        return response.data;
    },
    update: async (id: string, data: Partial<Testimonial>): Promise<Testimonial> => {
        const response = await api.patch(`/testimonials/${id}`, data);
        return response.data;
    },
    delete: async (id: string): Promise<void> => {
        await api.delete(`/testimonials/${id}`);
    },
    bulkDelete: async (ids: string[]): Promise<void> => {
        await api.post('/testimonials/bulk-delete', { ids });
    },
    bulkUpdateStatus: async (ids: string[], isActive: boolean): Promise<void> => {
        await api.post('/testimonials/bulk-status', { ids, isActive });
    },
    reorder: async (updates: { id: string; order: number }[]): Promise<void> => {
        await api.post('/testimonials/reorder', { updates });
    },
};

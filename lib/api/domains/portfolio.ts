import { api } from "@/lib/api";

export interface PortfolioItem {
    id: string;
    title: string;
    slug: string;
    category: string;
    client: string;
    description: string;
    longDescription?: string;
    image?: string;
    screenshots?: string[];
    tags?: string[];
    gradient?: string;
    stats?: string;
    demoUrl?: string;
    featured: boolean;
    status: string;
    order: number;
    userId?: string;
    createdAt: string;
    updatedAt: string;
}

export interface PortfolioResponse {
    items: PortfolioItem[];
    total: number;
    skip: number;
    take: number;
}

export interface PortfolioStats {
    total: number;
    published: number;
    draft: number;
    featured: number;
}

export interface PortfolioFilters {
    skip?: number;
    take?: number;
    search?: string;
    status?: string;
    featured?: string;
    sortField?: string;
    sortDirection?: 'ASC' | 'DESC';
}

export const portfolioAPI = {
    getAll: async (filters?: PortfolioFilters): Promise<PortfolioResponse> => {
        const response = await api.get('/portfolio', { params: filters });
        return response.data;
    },
    getPublished: async (): Promise<PortfolioItem[]> => {
        const response = await api.get('/portfolio/published');
        return response.data;
    },
    getBySlug: async (slug: string): Promise<PortfolioItem> => {
        const response = await api.get(`/portfolio/slug/${slug}`);
        return response.data;
    },
    getOne: async (id: string): Promise<PortfolioItem> => {
        const response = await api.get(`/portfolio/${id}`);
        return response.data;
    },
    getStats: async (): Promise<PortfolioStats> => {
        const response = await api.get('/portfolio/stats');
        return response.data;
    },
    create: async (data: Partial<PortfolioItem>): Promise<PortfolioItem> => {
        const response = await api.post('/portfolio', data);
        return response.data;
    },
    update: async (id: string, data: Partial<PortfolioItem>): Promise<PortfolioItem> => {
        const response = await api.patch(`/portfolio/${id}`, data);
        return response.data;
    },
    delete: async (id: string): Promise<void> => {
        await api.delete(`/portfolio/${id}`);
    },
    bulkDelete: async (ids: string[]): Promise<void> => {
        await api.post('/portfolio/bulk-delete', { ids });
    },
    bulkUpdateStatus: async (ids: string[], status: string): Promise<void> => {
        await api.post('/portfolio/bulk-status', { ids, status });
    },
    bulkUpdateFeatured: async (ids: string[], featured: boolean): Promise<void> => {
        await api.post('/portfolio/bulk-featured', { ids, featured });
    },
    reorder: async (updates: { id: string; order: number }[]): Promise<void> => {
        await api.post('/portfolio/reorder', { updates });
    },
};

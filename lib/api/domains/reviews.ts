import { api } from "@/lib/api";

export enum ReviewStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected',
}

export interface Review {
    id: string;
    user: { id: string; name: string; avatar?: string };
    product: { id: string; name: string; image?: string };
    rating: number;
    comment: string;
    status: ReviewStatus;
    helpfulCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface ReviewProductInfo {
    id: string;
    rating: number;
    comment: string;
    createdAt: string;
    helpfulCount: number;
    user: { id: string; name: string };
}

export interface PaginatedReviews {
    items: Review[];
    total: number;
    skip: number;
    take: number;
}

export const reviewsAPI = {
    createReview: async (data: { productId: string; rating: number; comment: string }): Promise<Review> => {
        const response = await api.post('/reviews', data);
        return response.data;
    },
    getReviews: async (skip = 0, take = 50): Promise<PaginatedReviews> => {
        const response = await api.get('/reviews', { params: { skip, take } });
        return response.data;
    },
    getReviewsForModeration: async (skip = 0, take = 50): Promise<PaginatedReviews> => {
        const response = await api.get('/reviews/moderation', { params: { skip, take } });
        return response.data;
    },
    getByProduct: async (productId: string): Promise<ReviewProductInfo[]> => {
        const response = await api.get(`/reviews/${productId}`);
        return response.data;
    },
    updateReview: async (id: string, data: Partial<Review>): Promise<Review> => {
        const response = await api.patch(`/reviews/${id}`, data);
        return response.data;
    },
    deleteReview: async (id: string): Promise<void> => {
        await api.delete(`/reviews/${id}`);
    },
};

import { api } from "@/lib/api";
import { PaginatedResponse } from "./billing";

export interface FavoriteItem {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    rating: number;
    reviews: number;
    category: string;
    subcategory: string;
    image: string;
    tags: string[];
    features: string[];
    version: string;
    updatePolicy: string;
    addedAt: string;
}

export const favoritesAPI = {
    getFavorites: async (skip = 0, take = 50): Promise<PaginatedResponse<FavoriteItem>> => {
        const response = await api.get('/favorites', { params: { skip, take } });
        return response.data;
    },
    addFavorite: async (productId: string): Promise<{ message: string }> => {
        const response = await api.post(`/favorites/${productId}`);
        return response.data;
    },
    removeFavorite: async (productId: string): Promise<{ message: string }> => {
        const response = await api.delete(`/favorites/${productId}`);
        return response.data;
    },
    checkFavorite: async (productId: string): Promise<{ isFavorite: boolean }> => {
        const response = await api.get(`/favorites/${productId}/check`);
        return response.data;
    },
};

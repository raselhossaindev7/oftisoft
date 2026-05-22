import { api } from "@/lib/api";
export interface Product {
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
    screenshots: string[];
    demoUrl?: string;
    docUrl?: string;
    compatibility: string[];
    version: string;
    updatePolicy: string;
    licenseRegular: number;
    licenseExtended: number;
    lastUpdated?: string;
    status: string;
    vendorId?: string;
    rejectionReason?: string | null;
    approvedAt?: string;
    createdAt: string;
    updatedAt: string;
}

export const productsAPI = {
    getProducts: async (search?: string, category?: string): Promise<Product[]> => {
        const params: any = {};
        if (search) params.search = search;
        if (category) params.category = category;
        const response = await api.get('/products', { params });
        return response.data;
    },
    getProduct: async (id: string): Promise<Product> => {
        const response = await api.get(`/products/${id}`);
        return response.data;
    },
    createProduct: async (data: Partial<Product>): Promise<Product> => {
        const response = await api.post('/products', data);
        return response.data;
    },
    updateProduct: async (id: string, data: Partial<Product>): Promise<Product> => {
        const response = await api.patch(`/products/${id}`, data);
        return response.data;
    },
    deleteProduct: async (id: string): Promise<void> => {
        await api.delete(`/products/${id}`);
    },
    getStats: async (): Promise<any> => {
        const response = await api.get('/products/stats');
        return response.data;
    }
};

export interface Category {
    id: string;
    name: string;
    slug: string;
    description?: string;
    subcategories: string[];
    productCount: number;
    order: number;
    createdAt: string;
    updatedAt: string;
}

export const categoriesAPI = {
    getCategories: async (): Promise<Category[]> => {
        const response = await api.get('/categories');
        return response.data;
    },
    getCategory: async (id: string): Promise<Category> => {
        const response = await api.get(`/categories/${id}`);
        return response.data;
    },
    createCategory: async (data: Partial<Category>): Promise<Category> => {
        const response = await api.post('/categories', data);
        return response.data;
    },
    updateCategory: async (id: string, data: Partial<Category>): Promise<Category> => {
        const response = await api.patch(`/categories/${id}`, data);
        return response.data;
    },
    deleteCategory: async (id: string): Promise<void> => {
        await api.delete(`/categories/${id}`);
    },
    addSubcategory: async (id: string, subcategory: string): Promise<Category> => {
        const response = await api.post(`/categories/${id}/subcategories`, { subcategory });
        return response.data;
    },
    removeSubcategory: async (id: string, subcategory: string): Promise<Category> => {
        const response = await api.delete(`/categories/${id}/subcategories/${encodeURIComponent(subcategory)}`);
        return response.data;
    }
};


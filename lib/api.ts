import axios from 'axios';
import { getIsLoggingOut } from '@/store/useAuthStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (!originalRequest) return Promise.reject(error);

        const isLoggingOut = getIsLoggingOut();

        // Suppress 401 errors during logout — cookies are intentionally cleared
        if (error.response?.status === 401 && isLoggingOut) {
            return Promise.resolve({ data: null });
        }

        const isRefreshRequest = originalRequest.url?.includes('/auth/refresh');

        if (error.response?.status === 401 && !originalRequest._retry && !isRefreshRequest && !isLoggingOut) {
            originalRequest._retry = true;
            try {
                await api.post('/auth/refresh');
                return api(originalRequest);
            } catch {
                // useProtectedRoute handles auth redirects
            }
        }

        return Promise.reject(error);
    }
);

export const axiosClient = api;
export { api };
export default api;

// Domain API modules
export * from './api/domains';

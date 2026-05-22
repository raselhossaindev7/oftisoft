/**
 * React Query Configuration & Hooks
 * Provides caching, background refetching, and optimistic updates
 */

'use client';

import { QueryClient, QueryClientProvider, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { api, endpoints } from './client';

/**
 * Query Client Configuration
 * Optimized for performance with smart caching
 */
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5,
            gcTime: 1000 * 60 * 30,
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,
            retry: 1,
        },
        mutations: {
            retry: 0,
        },
    },
});

/**
 * Query Provider Component
 */
export function QueryProvider({ children }: { children: ReactNode }) {
    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}

/**
 * Custom Hooks for Data Fetching
 */

// ============= PRODUCTS =============

export function useProducts(filters?: any) {
    return useQuery({
        queryKey: ['products', filters],
        queryFn: () => api.get(endpoints.products.list, { searchParams: filters }),
        staleTime: 1000 * 60 * 10, // 10 minutes for product list
    });
}

export function useProduct(id: string) {
    return useQuery({
        queryKey: ['product', id],
        queryFn: () => api.get(endpoints.products.detail(id)),
        enabled: !!id, // Only fetch if ID exists
    });
}

export function useCreateProduct() {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (data: any) => api.post(endpoints.products.create, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });
}

export function useUpdateProduct() {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => 
            api.put(endpoints.products.update(id), data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['product', variables.id] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });
}

export function useDeleteProduct() {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (id: string) => api.delete(endpoints.products.delete(id)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });
}

// ============= ORDERS =============

export function useOrders(filters?: any) {
    return useQuery({
        queryKey: ['orders', filters],
        queryFn: () => api.get(endpoints.orders.list, { searchParams: filters }),
    });
}

export function useOrder(id: string) {
    return useQuery({
        queryKey: ['order', id],
        queryFn: () => api.get(endpoints.orders.detail(id)),
        enabled: !!id,
    });
}

export function useCreateOrder() {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (data: any) => api.post(endpoints.orders.create, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            queryClient.invalidateQueries({ queryKey: ['analytics'] });
        },
    });
}

// ============= USERS =============

export function useUsers(filters?: any) {
    return useQuery({
        queryKey: ['users', filters],
        queryFn: () => api.get(endpoints.users.list, { searchParams: filters }),
    });
}

export function useUser(id: string) {
    return useQuery({
        queryKey: ['user', id],
        queryFn: () => api.get(endpoints.users.detail(id)),
        enabled: !!id,
    });
}

export function useUpdateUser() {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => 
            api.put(endpoints.users.update(id), data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['user', variables.id] });
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });
}

// ============= ANALYTICS =============

export function useAnalyticsOverview() {
    return useQuery({
        queryKey: ['analytics-overview'],
        queryFn: () => api.get(endpoints.analytics.overview),
        staleTime: 1000 * 60 * 5, // 5 minutes, refetchInterval: 1000 * 60 * 5, // Auto-refetch every 5 minutes
    });
}

export function useRevenueAnalytics(period?: string) {
    return useQuery({
        queryKey: ['analytics-revenue', period],
        queryFn: () => api.get(endpoints.analytics.revenue, { searchParams: { period } }),
        staleTime: 1000 * 60 * 10,
    });
}

// ============= AUTH =============

export function useCurrentUser() {
    return useQuery({
        queryKey: ['current-user'],
        queryFn: () => api.get(endpoints.auth.profile),
        staleTime: Infinity,
        retry: false,
    });
}

export function useLogin() {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (credentials: { email: string; password: string }) => 
            api.post(endpoints.auth.login, credentials),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['current-user'] });
        },
    });
}

export function useLogout() {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: () => api.post(endpoints.auth.logout),
        onSuccess: () => {
            queryClient.clear();
        },
    });
}

// ============= TEAM =============

export function useTeamMembers(filters?: { search?: string; isActive?: boolean }) {
    return useQuery({
        queryKey: ['team-members', filters],
        queryFn: () => api.get(endpoints.team.list, { searchParams: filters }),
        staleTime: 1000 * 60 * 5,
    });
}

export function useCreateTeamMember() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => api.post(endpoints.team.create, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['team-members'] });
        },
    });
}

export function useUpdateTeamMember() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) =>
            api.patch(endpoints.team.update(id), data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['team-members'] });
        },
    });
}

export function useDeleteTeamMember() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => api.delete(endpoints.team.delete(id)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['team-members'] });
        },
    });
}

// ============= TESTIMONIALS =============

export function useTestimonials() {
    return useQuery({
        queryKey: ['testimonials'],
        queryFn: () => api.get(endpoints.testimonials.list),
        staleTime: 1000 * 60 * 5,
    });
}

export function useTestimonial(id: string) {
    return useQuery({
        queryKey: ['testimonial', id],
        queryFn: () => api.get(endpoints.testimonials.detail(id)),
        enabled: !!id,
    });
}

export function useCreateTestimonial() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => api.post(endpoints.testimonials.create, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['testimonials'] });
        },
    });
}

export function useUpdateTestimonial() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) =>
            api.patch(endpoints.testimonials.update(id), data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['testimonials'] });
        },
    });
}

export function useDeleteTestimonial() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => api.delete(endpoints.testimonials.delete(id)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['testimonials'] });
        },
    });
}

// ============= PORTFOLIO =============

export function usePortfolioItems(status?: string) {
    return useQuery({
        queryKey: ['portfolio', status],
        queryFn: () => api.get(endpoints.portfolio.list, { searchParams: { status } }),
        staleTime: 1000 * 60 * 5,
    });
}

export function usePortfolioItem(id: string) {
    return useQuery({
        queryKey: ['portfolio-item', id],
        queryFn: () => api.get(endpoints.portfolio.detail(id)),
        enabled: !!id,
    });
}

export function useCreatePortfolioItem() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => api.post(endpoints.portfolio.create, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['portfolio'] });
        },
    });
}

export function useUpdatePortfolioItem() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) =>
            api.patch(endpoints.portfolio.update(id), data),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['portfolio'] });
            queryClient.invalidateQueries({ queryKey: ['portfolio-item', variables.id] });
        },
    });
}

export function useDeletePortfolioItem() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => api.delete(endpoints.portfolio.delete(id)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['portfolio'] });
        },
    });
}

// ============= TICKETS / SUPPORT =============

export function useTickets(status?: string) {
    return useQuery({
        queryKey: ['tickets', status],
        queryFn: () => api.get(endpoints.tickets.list, { searchParams: { status } }),
        staleTime: 1000 * 60 * 2,
    });
}

export function useTicket(id: string) {
    return useQuery({
        queryKey: ['ticket', id],
        queryFn: () => api.get(endpoints.tickets.detail(id)),
        enabled: !!id,
    });
}

export function useCreateTicket() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => api.post(endpoints.tickets.create, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tickets'] });
        },
    });
}

export function useUpdateTicketStatus() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) =>
            api.patch(endpoints.tickets.updateStatus(id), { status }),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['ticket', variables.id] });
            queryClient.invalidateQueries({ queryKey: ['tickets'] });
        },
    });
}

export function useAddTicketMessage() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, content }: { id: string; content: string }) =>
            api.post(endpoints.tickets.addMessage(id), { content }),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['ticket', variables.id] });
        },
    });
}

export function useTicketStats() {
    return useQuery({
        queryKey: ['ticket-stats'],
        queryFn: () => api.get(endpoints.tickets.stats),
        staleTime: 1000 * 60 * 5,
    });
}

/**
 * Prefetch Utilities
 * Use these for faster page transitions
 */
export const prefetch = {
    products: () => queryClient.prefetchQuery({
        queryKey: ['products'],
        queryFn: () => api.get(endpoints.products.list),
    }),
    
    orders: () => queryClient.prefetchQuery({
        queryKey: ['orders'],
        queryFn: () => api.get(endpoints.orders.list),
    }),
    
    analytics: () => queryClient.prefetchQuery({
        queryKey: ['analytics-overview'],
        queryFn: () => api.get(endpoints.analytics.overview),
    }),
};

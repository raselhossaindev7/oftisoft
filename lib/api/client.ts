/**
 * API Client - Relies on httpOnly cookies for auth.
 * Unified client using axios (delegates to the shared instance in lib/api.ts).
 */

import { axiosClient } from "../api";

export const api = {
    get: async <T>(url: string, options?: any): Promise<T> => {
        const params = options?.searchParams || options?.params;
        const res = await axiosClient.get(url, { params, ...options });
        return res.data;
    },
    post: async <T>(url: string, data?: any, options?: any): Promise<T> => {
        const res = await axiosClient.post(url, data, options);
        return res.data;
    },
    put: async <T>(url: string, data?: any, options?: any): Promise<T> => {
        const res = await axiosClient.put(url, data, options);
        return res.data;
    },
    patch: async <T>(url: string, data?: any, options?: any): Promise<T> => {
        const res = await axiosClient.patch(url, data, options);
        return res.data;
    },
    delete: async <T>(url: string, options?: any): Promise<T> => {
        const res = await axiosClient.delete(url, options);
        return res.data;
    },
};

export const endpoints = {
    auth: {
        login: 'auth/login',
        register: 'auth/register',
        logout: 'auth/logout',
        profile: 'auth/profile',
        check: 'auth/check',
        refresh: 'auth/refresh',
        changePassword: 'auth/change-password',
        sessions: 'auth/sessions',
        revokeSession: (id: string) => `auth/sessions/revoke/${id}`,
        revokeAll: 'auth/revoke-all',
        verifyEmail: 'auth/verify-email',
        resendVerification: 'auth/resend-verification',
        forgotPassword: 'auth/forgot-password',
        resetPassword: 'auth/reset-password',
        verifyResetToken: 'auth/verify-reset-token',
        setup2FA: 'auth/2fa/setup',
        verify2FA: 'auth/2fa/verify',
        disable2FA: 'auth/2fa/disable',
        verify2FALogin: 'auth/2fa/verify-login',
        exportData: 'auth/export-data',
        deleteAccount: 'auth/delete-account',
        cancelDeletion: 'auth/cancel-deletion',
        google: 'auth/google',
        github: 'auth/github',
    },
    users: {
        list: 'admin/users',
        detail: (id: string) => `admin/users/${id}`,
        create: 'admin/users',
        update: (id: string) => `admin/users/${id}`,
        delete: (id: string) => `admin/users/${id}`,
        stats: (id: string) => `admin/users/${id}/stats`,
        activity: (id: string) => `admin/users/${id}/activity`,
        toggleStatus: (id: string) => `admin/users/${id}/toggle-status`,
    },
    products: {
        list: 'products',
        detail: (id: string) => `products/${id}`,
        create: 'products',
        update: (id: string) => `products/${id}`,
        delete: (id: string) => `products/${id}`,
        stats: 'products/stats',
    },
    categories: {
        list: 'categories',
        detail: (id: string) => `categories/${id}`,
        create: 'categories',
        update: (id: string) => `categories/${id}`,
        delete: (id: string) => `categories/${id}`,
        addSubcategory: (id: string) => `categories/${id}/subcategories`,
        removeSubcategory: (id: string, sub: string) => `categories/${id}/subcategories/${sub}`,
    },
    orders: {
        list: 'orders',
        detail: (id: string) => `orders/${id}`,
        create: 'orders',
        update: (id: string) => `orders/${id}`,
        updateStatus: (id: string) => `orders/${id}/status`,
        invoice: (id: string) => `orders/${id}/invoice`,
        export: 'orders/export',
    },
    analytics: {
        overview: 'analytics/overview',
        revenue: 'analytics/revenue',
        traffic: 'analytics/traffic',
    },
    team: {
        list: 'team-members',
        active: 'team-members/active',
        detail: (id: string) => `team-members/${id}`,
        create: 'team-members',
        update: (id: string) => `team-members/${id}`,
        delete: (id: string) => `team-members/${id}`,
        stats: 'team-members/stats',
        bulkDelete: 'team-members/bulk-delete',
        bulkStatus: 'team-members/bulk-status',
        reorder: 'team-members/reorder',
    },
    testimonials: {
        list: 'testimonials',
        active: 'testimonials/active',
        detail: (id: string) => `testimonials/${id}`,
        create: 'testimonials',
        update: (id: string) => `testimonials/${id}`,
        delete: (id: string) => `testimonials/${id}`,
        stats: 'testimonials/stats',
        bulkDelete: 'testimonials/bulk-delete',
        bulkStatus: 'testimonials/bulk-status',
        reorder: 'testimonials/reorder',
    },
    portfolio: {
        list: 'portfolio',
        published: 'portfolio/published',
        detail: (id: string) => `portfolio/${id}`,
        create: 'portfolio',
        update: (id: string) => `portfolio/${id}`,
        delete: (id: string) => `portfolio/${id}`,
        stats: 'portfolio/stats',
        bulkDelete: 'portfolio/bulk-delete',
        bulkStatus: 'portfolio/bulk-status',
        bulkFeatured: 'portfolio/bulk-featured',
        reorder: 'portfolio/reorder',
    },
    events: {
        list: 'events',
        upcoming: 'events/upcoming',
        detail: (id: string) => `events/${id}`,
        create: 'events',
        update: (id: string) => `events/${id}`,
        delete: (id: string) => `events/${id}`,
        publish: (id: string) => `events/${id}/publish`,
        stats: 'events/stats',
        bulkDelete: 'events/bulk-delete',
        bulkStatus: 'events/bulk-status',
    },
    tickets: {
        list: 'support/tickets',
        detail: (id: string) => `support/tickets/${id}`,
        create: 'support/tickets',
        updateStatus: (id: string) => `support/tickets/${id}/status`,
        addMessage: (id: string) => `support/tickets/${id}/messages`,
        stats: 'support/stats',
    },
    billing: {
        paymentMethods: 'billing/payment-methods',
        setDefaultPaymentMethod: (id: string) => `billing/payment-methods/${id}/default`,
        deletePaymentMethod: (id: string) => `billing/payment-methods/${id}`,
        transactions: 'billing/transactions',
        subscription: 'billing/subscription',
        usage: 'billing/usage',
        createPaymentIntent: 'billing/create-payment-intent',
        validateCoupon: 'billing/validate-coupon',
        createSubscription: 'billing/create-subscription',
        cancelSubscription: 'billing/cancel-subscription',
        updateSubscription: 'billing/update-subscription',
        createRefund: 'billing/create-refund',
    },
};

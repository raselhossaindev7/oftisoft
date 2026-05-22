import { api } from "@/lib/api";

/**
 * Auth API - Profile & Settings Management (axios)
 *
 * LAYER NOTE: Core auth ops (login/register/logout/checkAuth/refresh/2FA/forgotPassword/resetPassword)
 * go through auth.service.ts (raw fetch with custom auto-refresh logic).
 * Those endpoints are duplicated here but SHOULD NOT be used for auth flow -
 * they're included for completeness but bypass the auth store.
 * Use this module for: getProfile, updateProfile, uploadAvatar, changePassword, getSessions,
 * revokeSession, exportData, deleteAccount, cancelDeletion, OAuth URLs.
 */
export interface RegisterData {
    name: string;
    email: string;
    phone: string;
    password: string;
}

export interface LoginData {
    email: string;
    password: string;
    remember?: boolean;
}

export interface UpdateProfileData {
    name?: string;
    phone?: string;
    jobTitle?: string;
    bio?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    unit?: string;
    emailNotifications?: boolean;
    pushNotifications?: boolean;
    smsNotifications?: boolean;
    marketingNotifications?: boolean;
    avatarUrl?: string;
    artifactDeploymentNotifications?: boolean;
    mentionNotifications?: boolean;
    milestoneNotifications?: boolean;
    allocationNotifications?: boolean;
    ledgerNotifications?: boolean;
    transactionNotifications?: boolean;
    loginAlertNotifications?: boolean;
    securityAlertNotifications?: boolean;
    kernelUpdateNotifications?: boolean;
}

export interface User {
    id: string;
    email: string;
    name: string;
    avatar?: string;
    image?: string;
    avatarUrl?: string;
    phone: string;
    jobTitle?: string;
    bio?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    unit?: string;
    emailNotifications: boolean;
    pushNotifications: boolean;
    smsNotifications: boolean;
    marketingNotifications: boolean;
    artifactDeploymentNotifications: boolean;
    mentionNotifications: boolean;
    milestoneNotifications: boolean;
    allocationNotifications: boolean;
    ledgerNotifications: boolean;
    transactionNotifications: boolean;
    loginAlertNotifications: boolean;
    securityAlertNotifications: boolean;
    kernelUpdateNotifications: boolean;
    isActive: boolean;
    isEmailVerified: boolean;
    isTwoFactorEnabled: boolean;
    role: string;
    password?: string;
    createdAt: string;
    updatedAt: string;
}

export interface LoginResponse {
    message: string;
    user: User;
    accessToken?: string;
    requires2FA?: boolean;
    tempToken?: string;
}

export interface AuthResponse {
    message: string;
    user: User;
    accessToken?: string;
}

// Session interface
export interface Session {
    id: string;
    token: string;
    userId: string;
    userAgent?: string;
    ipAddress?: string;
    isRevoked: boolean;
    expiresAt: string;
    createdAt: string;
    updatedAt: string;
}

// Auth API functions
export const authAPI = {
    // Register new user
    register: async (data: RegisterData): Promise<AuthResponse> => {
        const response = await api.post('/auth/register', data);
        return response.data;
    },

    // Login user
    login: async (data: LoginData): Promise<AuthResponse> => {
        const response = await api.post('/auth/login', data);
        return response.data;
    },

    // Logout user
    logout: async (): Promise<{ message: string }> => {
        const response = await api.post('/auth/logout');
        return response.data;
    },

    // Get current user profile
    getProfile: async (): Promise<User> => {
        const response = await api.get('/auth/profile');
        return response.data;
    },

    // Update user profile
    updateProfile: async (data: Partial<User>): Promise<User> => {
        const response = await api.post('/auth/profile', data);
        return response.data;
    },

    uploadAvatar: async (file: File): Promise<User> => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post('/auth/avatar', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // Change password
    changePassword: async (data: { oldPassword: string; newPassword: string }): Promise<{ message: string }> => {
        const response = await api.post('/auth/change-password', data);
        return response.data;
    },

    // Get active sessions
    getSessions: async (): Promise<Session[]> => {
        const response = await api.get('/auth/sessions');
        return response.data;
    },

    // Revoke a session
    revokeSession: async (id: string): Promise<{ message: string }> => {
        const response = await api.post(`/auth/sessions/revoke/${id}`);
        return response.data;
    },

    // Check if user is authenticated
    checkAuth: async (): Promise<{ authenticated: boolean; user: User }> => {
        const response = await api.get('/auth/check');
        return response.data;
    },

    // Refresh access token
    refreshToken: async (): Promise<{ message: string; accessToken: string }> => {
        const response = await api.post('/auth/refresh');
        return response.data;
    },

    // Revoke all tokens (logout from all devices)
    revokeAllTokens: async (): Promise<{ message: string }> => {
        const response = await api.post('/auth/revoke-all');
        return response.data;
    },

    // 2FA Endpoints
    setup2FA: async (): Promise<{ message: string; secret: string; qrCode: string }> => {
        const response = await api.post('/auth/2fa/setup');
        return response.data;
    },

    verify2FA: async (code: string): Promise<{ message: string; enabled: boolean }> => {
        const response = await api.post('/auth/2fa/verify', { code });
        return response.data;
    },

    disable2FA: async (code: string): Promise<{ message: string; enabled: boolean }> => {
        const response = await api.post('/auth/2fa/disable', { code });
        return response.data;
    },

    // Email Verification
    verifyEmail: async (token: string): Promise<{ message: string }> => {
        const response = await api.get(`/auth/verify-email?token=${encodeURIComponent(token)}`);
        return response.data;
    },

    resendVerification: async (): Promise<{ message: string }> => {
        const response = await api.post('/auth/resend-verification');
        return response.data;
    },

    // 2FA Login (used when 2FA is required during login)
    verify2FALogin: async (tempToken: string, code: string, remember?: boolean): Promise<LoginResponse> => {
        const response = await api.post('/auth/2fa/verify-login', { tempToken, code, remember });
        return response.data;
    },

    // OAuth URLs
    getGoogleOAuthUrl: (): string => {
        return `${api.defaults.baseURL}/auth/google`;
    },

    getGithubOAuthUrl: (): string => {
        return `${api.defaults.baseURL}/auth/github`;
    },

    // Forgot Password
    forgotPassword: async (email: string): Promise<{ message: string }> => {
        const response = await api.post('/auth/forgot-password', { email });
        return response.data;
    },

    resetPassword: async (token: string, password: string): Promise<{ message: string }> => {
        const response = await api.post('/auth/reset-password', { token, password });
        return response.data;
    },

    verifyResetToken: async (token: string): Promise<{ valid: boolean }> => {
        const response = await api.get(`/auth/verify-reset-token?token=${encodeURIComponent(token)}`);
        return response.data;
    },

    // Account Privacy & Deletion
    exportData: async (): Promise<Blob> => {
        const response = await api.get('/auth/export-data', { responseType: 'blob' });
        return response.data;
    },

    deleteAccount: async (): Promise<{ message: string }> => {
        const response = await api.post('/auth/delete-account');
        return response.data;
    },

    cancelDeletion: async (): Promise<{ message: string }> => {
        const response = await api.post('/auth/cancel-deletion');
        return response.data;
    },
};


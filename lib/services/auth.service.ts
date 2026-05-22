/**
 * Auth Service - API layer for authentication
 * Uses httpOnly cookies (tokens never touch JS) via raw fetch
 * All requests include credentials for cookie transmission
 * 
 * LAYER NOTE: This handles login/register/checkAuth/logout/refresh/2FA only.
 * For profile/settings management, see lib/api/domains/auth.ts (authAPI via axios).
 * The separation exists because auth ops need fine-grained control over
 * refresh logic and timeout handling, while profile APIs use standard axios.
 */

import { getIsLoggingOut } from "@/store/useAuthStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  avatar?: string;
  image?: string;
  phone: string;
  jobTitle?: string;
  bio?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  unit?: string;
  isEmailVerified: boolean;
  isActive: boolean;
  isTwoFactorEnabled: boolean;
  role: string;
  tokenVersion: number;
  subscriptionPlan?: string;
  subscriptionStatus?: string;
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  smsNotifications?: boolean;
  marketingNotifications?: boolean;
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

export interface RegisterResponse {
  message: string;
  user: User;
  accessToken?: string;
  isAutoLogin?: boolean;
}

export interface AuthCheckResponse {
  authenticated: boolean;
  user: User | null;
}

export interface ApiError {
  statusCode: number;
  message: string | string[];
  error?: string;
}

function getErrorMessage(error: ApiError | unknown): string {
  if (!error || typeof error !== "object") return "Something went wrong";
  const err = error as ApiError;
  if (typeof err.message === "string") return err.message;
  if (Array.isArray(err.message)) return err.message[0] || "Validation failed";
  return "Something went wrong";
}

async function authFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  isRetry = false
): Promise<T> {
  // No early return — httpOnly cookies aren't readable by JS,
  // so we must let the actual fetch determine auth status.
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      credentials: "include",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    clearTimeout(timeout);

    if (res.status === 401 && !isRetry && endpoint !== "/auth/login" && endpoint !== "/auth/refresh" && endpoint !== "/auth/check" && (!getIsLoggingOut() || endpoint === "/auth/logout")) {
      try {
        const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
          method: "POST",
          credentials: "include",
        });

        if (refreshRes.ok) {
          return authFetch<T>(endpoint, options, true);
        } else if (refreshRes.status === 401) {
          throw new Error("Session expired. Please log in again.");
        }
      } catch (error: unknown) {
        if (error instanceof Error && (error.message.includes("Session expired") || error.message.includes("invalidated"))) {
          throw error;
        }
      }
    }

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(getErrorMessage(data));
    }

    return data as T;
  } finally {
    clearTimeout(timeout);
  }
}

export const authService = {
  async login(
    email: string,
    password: string,
    remember = false
  ): Promise<LoginResponse> {
    return authFetch<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password, remember }),
    });
  },

  async register(
    name: string,
    email: string,
    phone: string,
    password: string
  ): Promise<RegisterResponse & { isAutoLogin?: boolean }> {
    return authFetch<RegisterResponse & { isAutoLogin?: boolean }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, phone, password }),
    });
  },

  async logout(): Promise<{ message: string }> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    try {
      const res = await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
        signal: controller.signal,
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(getErrorMessage(data));
      }
      return data as { message: string };
    } finally {
      clearTimeout(timeout);
    }
  },

  async checkAuth(): Promise<AuthCheckResponse> {
    try {
      return await authFetch<AuthCheckResponse>("/auth/check", { method: "GET" });
    } catch {
      return { authenticated: false, user: null };
    }
  },

  async verify2FALogin(tempToken: string, code: string, remember?: boolean): Promise<LoginResponse> {
    return authFetch<LoginResponse>("/auth/2fa/verify-login", {
      method: "POST",
      body: JSON.stringify({ tempToken, code, remember }),
    });
  },

  async refreshToken(): Promise<{ message: string; accessToken: string }> {
    return authFetch("/auth/refresh", { method: "POST" });
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    return authFetch<{ message: string }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  async resetPassword(
    token: string,
    password: string
  ): Promise<{ message: string }> {
    return authFetch<{ message: string }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password }),
    });
  },

  async verifyResetToken(token: string): Promise<{ valid: boolean }> {
    const data = await authFetch<{ valid: boolean }>(
      `/auth/verify-reset-token?token=${encodeURIComponent(token)}`,
      { method: "GET" }
    );
    return data;
  },

  async setup2FA(): Promise<{ secret: string; qrCode: string }> {
    return authFetch("/auth/2fa/setup", { method: "POST" });
  },

  async verify2FA(code: string): Promise<{ message: string; enabled: boolean }> {
    return authFetch<{ message: string; enabled: boolean }>("/auth/2fa/verify", {
      method: "POST",
      body: JSON.stringify({ code }),
    });
  },

  async disable2FA(code: string): Promise<{ message: string; enabled: boolean }> {
    return authFetch<{ message: string; enabled: boolean }>("/auth/2fa/disable", {
      method: "POST",
      body: JSON.stringify({ code }),
    });
  },

  async verifyEmail(token: string): Promise<{ message: string }> {
    return authFetch<{ message: string }>(
      `/auth/verify-email?token=${encodeURIComponent(token)}`,
      { method: "GET" }
    );
  },

  async resendVerification(): Promise<{ message: string }> {
    return authFetch<{ message: string }>("/auth/resend-verification", {
      method: "POST",
    });
  },
};

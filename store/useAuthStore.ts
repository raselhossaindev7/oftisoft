import { create } from "zustand";
import {
  authService,
  type User,
} from "@/lib/services/auth.service";

// Global flag to prevent token refresh during logout
let isLoggingOut = false;
let authCheckComplete = false;

export function setLoggingOut(value: boolean) {
  isLoggingOut = value;
}

export function getIsLoggingOut() {
  return isLoggingOut;
}

export function setAuthCheckComplete(value: boolean) {
  authCheckComplete = value;
}

export function getAuthCheckComplete() {
  return authCheckComplete;
}

const SESSION_CACHE_KEY = 'auth_user_cache';

function clearAuthCookies() {
  try {
    const cookieOptions = 'Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
    document.cookie = `access_token=; ${cookieOptions}`;
    document.cookie = `refresh_token=; ${cookieOptions}`;
  } catch {}
}

function cacheUserData(user: User | null) {
  try {
    if (user) {
      sessionStorage.setItem(SESSION_CACHE_KEY, JSON.stringify({ user, isAuthenticated: true }));
    } else {
      sessionStorage.removeItem(SESSION_CACHE_KEY);
    }
  } catch {}
}

function getCachedUserData(): { user: User; isAuthenticated: boolean } | null {
  try {
    const cached = sessionStorage.getItem(SESSION_CACHE_KEY);
    if (cached) return JSON.parse(cached);
  } catch {}
  return null;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  authCheckComplete: boolean;

  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;

  login: (
    email: string,
    password: string,
    remember?: boolean
  ) => Promise<{ requires2FA: boolean; tempToken?: string; user?: User } | void>;
  register: (
    name: string,
    email: string,
    phone: string,
    password: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;

  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  verifyResetToken: (token: string) => Promise<boolean>;

  setup2FA: () => Promise<{ secret: string; qrCode: string }>;
  verify2FA: (code: string) => Promise<void>;
  disable2FA: (code: string) => Promise<void>;
  verify2FALogin: (tempToken: string, code: string, remember?: boolean) => Promise<void>;
}

export type { User };

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  authCheckComplete: false,

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  login: async (email, password, remember = false) => {
    set({ isLoading: true, error: null });
    try {
      const result = await authService.login(email, password, remember);
      
      // Check if 2FA is required
      if (result.requires2FA) {
        set({
          isLoading: false,
          error: null,
        });
        // Return a special result for 2FA
        return { requires2FA: true, tempToken: result.tempToken, user: result.user };
      }
      
      cacheUserData(result.user);
      set({
        user: result.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        authCheckComplete: true,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Login failed";
      set({
        error: message,
        isLoading: false,
        isAuthenticated: false,
        user: null,
      });
      throw err;
    }
  },

  verify2FALogin: async (tempToken: string, code: string, remember = false) => {
    set({ isLoading: true, error: null });
    try {
      const { user } = await authService.verify2FALogin(tempToken, code, remember);
      cacheUserData(user);
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        authCheckComplete: true,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "2FA verification failed";
      set({
        error: message,
        isLoading: false,
      });
      throw err;
    }
  },

  register: async (name, email, phone, password) => {
    set({ isLoading: true, error: null });
    try {
      const result = await authService.register(name, email, phone, password);
      // If auto-login is enabled, set user and authenticated state
      if (result.isAutoLogin && result.user) {
        cacheUserData(result.user);
        set({
          user: result.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          authCheckComplete: true,
        });
      } else {
        set({ isLoading: false, error: null });
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Registration failed";
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      // Set flag to prevent token refresh attempts
      setLoggingOut(true);

      // Clear all React Query caches to prevent stale API calls
      const { queryClient } = await import("@/lib/api/queries");
      queryClient.cancelQueries(); // Cancel any in-flight requests
      queryClient.clear(); // Clear all query caches

      await authService.logout();
      clearAuthCookies();
      cacheUserData(null);
      setAuthCheckComplete(false);
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        authCheckComplete: false,
      });
    } catch {
      clearAuthCookies();
      cacheUserData(null);
      setAuthCheckComplete(false);
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        authCheckComplete: false,
      });
    } finally {
      // Reset the logging out flag after a short delay to ensure cleanup
      setTimeout(() => setLoggingOut(false), 500);
    }
  },

  checkAuth: async () => {
    const { isLoading, isAuthenticated } = get();
    if (isLoading) return;

    const cached = getCachedUserData();
    if (cached) {
      set({
        user: cached.user,
        isAuthenticated: cached.isAuthenticated,
        isLoading: false,
        authCheckComplete: true,
      });
      setAuthCheckComplete(true);
      return;
    }

    if (!isAuthenticated) {
      set({ isLoading: true });
    }
    try {
      const { authenticated, user } = await authService.checkAuth();
      if (authenticated && user) {
        cacheUserData(user);
        setAuthCheckComplete(true);
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          authCheckComplete: true,
        });
      } else {
        cacheUserData(null);
        setAuthCheckComplete(true);
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          authCheckComplete: true,
        });
      }
    } catch {
      cacheUserData(null);
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        authCheckComplete: true,
      });
      setAuthCheckComplete(true);
    }
  },

  forgotPassword: async (email) => {
    set({ isLoading: true, error: null });
    try {
      await authService.forgotPassword(email);
      set({ isLoading: false, error: null });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to send reset email";
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  resetPassword: async (token, password) => {
    set({ isLoading: true, error: null });
    try {
      await authService.resetPassword(token, password);
      set({ isLoading: false, error: null });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Password reset failed";
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  verifyResetToken: async (token) => {
    set({ isLoading: true, error: null });
    try {
      const { valid } = await authService.verifyResetToken(token);
      set({ isLoading: false });
      return valid;
    } catch {
      set({ isLoading: false });
      return false;
    }
  },

  setup2FA: async () => {
    set({ isLoading: true, error: null });
    try {
      const result = await authService.setup2FA();
      set({ isLoading: false, error: null });
      return result;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "2FA setup failed";
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  verify2FA: async (code) => {
    set({ isLoading: true, error: null });
    try {
      await authService.verify2FA(code);
      const { user } = get();
      if (user) {
        set({
          user: { ...user, isTwoFactorEnabled: true },
          isLoading: false,
          error: null,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Invalid 2FA code";
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  disable2FA: async (code) => {
    set({ isLoading: true, error: null });
    try {
      await authService.disable2FA(code);
      const { user } = get();
      if (user) {
        set({
          user: { ...user, isTwoFactorEnabled: false },
          isLoading: false,
          error: null,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to disable 2FA";
      set({ error: message, isLoading: false });
      throw err;
    }
  },
}));

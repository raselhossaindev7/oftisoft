import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore, type AuthState } from "@/store/useAuthStore";

type AuthSelector<T> = (state: AuthState) => T;

type UseAuthReturn = {
  user: AuthState["user"];
  isAuthenticated: AuthState["isAuthenticated"];
  isLoading: AuthState["isLoading"];
  error: AuthState["error"];
  authCheckComplete: AuthState["authCheckComplete"];
  login: (email: string, password: string, remember?: boolean) => Promise<{ success: boolean; requires2FA?: boolean; tempToken?: string; error?: string }>;
  register: (name: string, email: string, phone: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkAuth: AuthState["checkAuth"];
  clearError: AuthState["clearError"];
  forgotPassword: AuthState["forgotPassword"];
  resetPassword: AuthState["resetPassword"];
  verifyResetToken: AuthState["verifyResetToken"];
  setup2FA: AuthState["setup2FA"];
  verify2FA: AuthState["verify2FA"];
  disable2FA: AuthState["disable2FA"];
  verify2FALogin: (tempToken: string, code: string, remember?: boolean) => Promise<{ success: boolean; error?: string }>;
};

export function useAuth(): UseAuthReturn;
export function useAuth<T>(selector: AuthSelector<T>): T;
export function useAuth<T>(selector?: AuthSelector<T>): UseAuthReturn | T {
  const router = useRouter();

  if (selector) {
    return useAuthStore(selector);
  }

  const store = useAuthStore();

  const handleLogin = async (
    email: string,
    password: string,
    remember?: boolean
  ): Promise<{ success: boolean; requires2FA?: boolean; tempToken?: string; error?: string }> => {
    try {
      const result = await store.login(email, password, remember);
      if (result && 'requires2FA' in result && result.requires2FA) {
        return { success: false, requires2FA: true, tempToken: result.tempToken };
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Login failed" };
    }
  };

  const handleRegister = async (
    name: string, email: string, phone: string, password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      await store.register(name, email, phone, password);
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Registration failed" };
    }
  };

  const handleVerify2FALogin = async (
    tempToken: string, code: string, remember?: boolean
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      await store.verify2FALogin(tempToken, code, remember);
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "2FA verification failed" };
    }
  };

  const handleLogout = async () => {
    try {
      await store.logout();
      toast.success("Signed out successfully");
    } catch {
      toast.error("Sign out failed");
    }
    router.push("/login");
  };

  return {
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    error: store.error,
    authCheckComplete: store.authCheckComplete,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    checkAuth: store.checkAuth,
    clearError: store.clearError,
    forgotPassword: store.forgotPassword,
    resetPassword: store.resetPassword,
    verifyResetToken: store.verifyResetToken,
    setup2FA: store.setup2FA,
    verify2FA: store.verify2FA,
    disable2FA: store.disable2FA,
    verify2FALogin: handleVerify2FALogin,
  };
}

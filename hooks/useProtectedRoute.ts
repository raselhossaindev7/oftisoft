import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore, getAuthCheckComplete, setAuthCheckComplete, getIsLoggingOut } from "@/store/useAuthStore";

const LOGIN_PATH = "/login";

export function useProtectedRoute() {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const checkAuth = useAuthStore((s) => s.checkAuth);
  const hasRedirected = useRef(false);
  const authRef = useRef(isAuthenticated);
  authRef.current = isAuthenticated;

  useEffect(() => {
    if (pathname === LOGIN_PATH) return;

    const abortController = new AbortController();
    let cancelled = false;

    const verify = async () => {
      if (authRef.current) {
        setAuthCheckComplete(true);
        return;
      }

      if (!getAuthCheckComplete() && !getIsLoggingOut() && !cancelled) {
        await checkAuth();
        if (cancelled) return;
        setAuthCheckComplete(true);
      }

      const state = useAuthStore.getState();
      if (!state.isLoading && !state.isAuthenticated && !hasRedirected.current && !cancelled) {
        hasRedirected.current = true;
        router.replace(LOGIN_PATH);
      }
    };

    verify();

    return () => {
      cancelled = true;
      abortController.abort();
    };
  }, [pathname, router, checkAuth, isAuthenticated, isLoading]);

  return { isAuthenticated, isLoading };
}
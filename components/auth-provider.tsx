"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  useAuthStore,
  getAuthCheckComplete,
  getIsLoggingOut,
} from "@/store/useAuthStore";

const AUTH_PATHS = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/dashboard/2fa",
];

function isAuthPath(path: string | null) {
  return path && AUTH_PATHS.some((p) => path.startsWith(p));
}

/**
 * AuthProvider only handles non-auth page initialization.
 * Protected routes use useProtectedRoute for auth checking.
 * This avoids duplicate checkAuth calls.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const checkAuth = useAuthStore((s) => s.checkAuth);

  useEffect(() => {
    // Skip auth pages - useProtectedRoute handles those
    if (isAuthPath(pathname)) return;

    // Don't re-check auth during logout transition — cookies may still be clearing
    if (getIsLoggingOut()) return;

    // Only check auth once globally per session
    if (getAuthCheckComplete()) return;

    checkAuth();
  }, [checkAuth, pathname]);

  return <>{children}</>;
}

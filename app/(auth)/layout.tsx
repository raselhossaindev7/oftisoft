"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, getAuthCheckComplete, getIsLoggingOut } from "@/store/useAuthStore";
import { Loader2 } from "lucide-react";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const isLoading = useAuthStore((s) => s.isLoading);
    const hasRedirected = useRef(false);

    useEffect(() => {
        if (!isLoading && isAuthenticated && getAuthCheckComplete() && !hasRedirected.current) {
            hasRedirected.current = true;
            router.replace("/dashboard");
        }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return <>{children}</>;
}
"use client";

import { DashboardProvider } from "@/lib/dashboard-context";
import Sidebar from "@/components/dashboard/sidebar";
import Header from "@/components/dashboard/header";
import BottomNav from "@/components/dashboard/bottom-nav";
import OnboardingTutorial from "@/components/dashboard/onboarding";
import { ErrorBoundary } from "@/components/error-boundary";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import { useRouteGuard } from "@/hooks/useRouteGuard";
import { useAuthStore } from "@/store/useAuthStore";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isAuthenticated, isLoading } = useProtectedRoute();
    const authCheckComplete = useAuthStore((s) => s.authCheckComplete);

    useRouteGuard();

    if (!authCheckComplete || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return (
        <DashboardProvider>
        <div className="flex h-dvh bg-background text-foreground font-sans">
            <Sidebar />
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                <Header />
                <div data-lenis-prevent className="flex-1 overflow-y-auto bg-muted/10">
                    <div className="min-h-full p-4 md:p-6 pb-32 md:pb-6">
                        <ErrorBoundary>{children}</ErrorBoundary>
                    </div>
                </div>
                <BottomNav />
            </div>
            <OnboardingTutorial />
        </div>
        </DashboardProvider>
    );
}

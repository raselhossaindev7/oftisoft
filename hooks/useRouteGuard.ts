"use client"

import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useRef } from "react";

const ROLE_HIERARCHY: Record<string, number> = {
  SuperAdmin: 5,
  Admin: 4,
  Editor: 3,
  Support: 2,
  Viewer: 1,
};

const ROUTE_ROLES: Record<string, number> = {
  // Overview
  "/dashboard": 1,
  "/dashboard/analytics": 3,
  "/dashboard/messages": 1,
  "/dashboard/projects": 3,
  // Commerce
  "/dashboard/orders": 1,
  "/dashboard/products": 3,
  "/dashboard/services": 1,
  "/dashboard/quotes": 1,
  "/dashboard/purchases": 1,
  // Marketing
  "/dashboard/marketing": 4,
  "/dashboard/marketing/campaigns": 3,
  "/dashboard/marketing/ads": 3,
  "/dashboard/marketing/leads": 2,
  // Personal
  "/dashboard/downloads": 1,
  "/dashboard/favorites": 1,
  "/dashboard/reviews": 1,
  "/dashboard/affiliate": 1,
  // Management
  "/dashboard/users": 4,
  "/dashboard/finance": 4,
  "/dashboard/posts": 3,
  "/dashboard/posts/comments": 3,
  "/dashboard/posts/tags": 3,
  "/dashboard/posts/categories": 3,
  "/dashboard/settings/system": 4,
  "/dashboard/billing": 1,
  "/dashboard/billing/subscription": 1,
  "/dashboard/billing/invoices": 1,
  "/dashboard/settings": 1,
  "/dashboard/settings/profile": 1,
  "/dashboard/settings/security": 1,
  "/dashboard/settings/notifications": 1,
  "/dashboard/settings/payments": 1,
  "/dashboard/settings/privacy": 1,
  "/dashboard/settings/integrations": 1,
  "/dashboard/settings/billing": 3,
  "/dashboard/support": 1,
  // Admin
  "/dashboard/portfolio": 4,
  "/dashboard/team": 4,
  "/dashboard/testimonials": 4,
  "/dashboard/tickets": 4,
  "/dashboard/events": 4,
  "/dashboard/audit": 4,
  "/dashboard/notifications": 1,
  "/dashboard/help": 1,
};

function getRequiredRoleLevel(pathname: string): number {
  const path = pathname.replace(/\/$/, "");
  if (ROUTE_ROLES[path] !== undefined) return ROUTE_ROLES[path];
  for (const [route, level] of Object.entries(ROUTE_ROLES)) {
    if (path.startsWith(route + "/")) return level;
  }
  return 1;
}

export function useRouteGuard() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const lastCheckedPath = useRef("");

  useEffect(() => {
    if (!user?.role) return;
    if (lastCheckedPath.current === pathname) return;
    lastCheckedPath.current = pathname;

    const userLevel = ROLE_HIERARCHY[user.role] || 1;
    const requiredLevel = getRequiredRoleLevel(pathname);
    if (userLevel < requiredLevel) {
      router.replace("/dashboard");
    }
  }, [pathname, user?.role, router]);
}

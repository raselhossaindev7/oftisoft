"use client"
import { AnimatedDiv, AnimatedSpan, AnimatedAside } from "@/lib/animated";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  MessageSquare,
  PieChart,
  CreditCard,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Code2,
  Users,
  Package,
  Briefcase,
  Megaphone,
  Wallet,
  MessageCircle,
  ShieldCheck,
  ShoppingBag,
  Library,
  Heart,
  TrendingUp,
  Star,
  FileText,
  Layout,
  Tag,
  Folder,
  ShoppingCart,
  HomeIcon,
  GalleryVerticalEnd,
  UserCircle,
  Quote,
  ClipboardCheck,
  Calendar,
  ScrollText,
  Store,
  Ticket,
  Flag,
  Key,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/ui/logo";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useDashboard } from "@/lib/dashboard-context";
import { useAuth } from "@/hooks/useAuth";
import { useBadgeCounts } from "@/hooks/useBadgeCounts";
import { useUIStore } from "@/lib/store";

const NAV_GROUPS = [
  {
    label: "Overview",
    items: [
      { icon: HomeIcon, label: "Home", href: "/dashboard", roles: ["Viewer", "Editor", "Support", "Admin", "SuperAdmin"] },
      { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard", roles: ["Viewer", "Editor", "Support", "Admin", "SuperAdmin"] },
      { icon: PieChart, label: "Analytics", href: "/dashboard/analytics", roles: ["Editor", "Admin", "SuperAdmin"] },
      { icon: MessageSquare, label: "Messages", href: "/dashboard/messages", badgeKey: "messages", roles: ["Viewer", "Editor", "Support", "Admin", "SuperAdmin"] },
      { icon: FolderKanban, label: "Projects", href: "/dashboard/projects", roles: ["Editor", "Admin", "SuperAdmin"] },
    ]
  },
  {
    label: "Commerce",
    items: [
      { icon: ShoppingCart, label: "Orders", href: "/dashboard/orders", badgeKey: "orders", roles: ["Viewer", "Editor", "Admin", "SuperAdmin", "Support"] },
      { icon: Package, label: "Products", href: "/dashboard/products", roles: ["Admin", "Editor", "SuperAdmin"] },
      { icon: ClipboardCheck, label: "Service Queue", href: "/dashboard/service-orders", roles: ["Admin", "Editor", "SuperAdmin"] },
      { icon: Briefcase, label: "Services", href: "/dashboard/services", roles: ["Viewer", "Editor", "Admin", "SuperAdmin", "Support"] },
      { icon: FileText, label: "Quotes", href: "/dashboard/quotes", roles: ["Viewer", "Editor", "Admin", "SuperAdmin", "Support"] },
      { icon: ShoppingBag, label: "Purchases", href: "/dashboard/purchases", roles: ["Viewer", "Editor", "Admin", "SuperAdmin", "Support"] },
      { icon: Flag, label: "Disputes", href: "/dashboard/disputes", roles: ["Admin", "SuperAdmin"] },
    ]

  },
  {
    label: "Marketing",
    items: [
      { icon: Megaphone, label: "Campaigns", href: "/dashboard/marketing/campaigns", roles: ["Admin", "Editor", "SuperAdmin"] },
      { icon: Layout, label: "Ads", href: "/dashboard/marketing/ads", roles: ["Admin", "Editor", "SuperAdmin"] },
      { icon: Users, label: "Leads", href: "/dashboard/marketing/leads", badgeKey: "leads", roles: ["Admin", "Editor", "SuperAdmin", "Support"] },
    ]
  },
  {
    label: "Personal",

    items: [
      { icon: Library, label: "Downloads", href: "/dashboard/downloads", roles: ["Viewer", "Editor", "Admin", "SuperAdmin"] },
      { icon: Heart, label: "Favorites", href: "/dashboard/favorites", roles: ["Viewer", "Editor", "Admin", "SuperAdmin"] },
      { icon: Star, label: "Reviews", href: "/dashboard/reviews", roles: ["Viewer", "Editor", "Admin", "SuperAdmin"] },
      { icon: TrendingUp, label: "Affiliate", href: "/dashboard/affiliate", roles: ["Viewer", "Editor", "Admin", "SuperAdmin"] },
    ]
  },
  {
    label: "Management",
    items: [
      { icon: Users, label: "Users", href: "/dashboard/users", roles: ["Admin", "SuperAdmin"] },
      { icon: Wallet, label: "Finance", href: "/dashboard/finance", roles: ["Admin", "SuperAdmin"] },
      { icon: FileText, label: "Posts", href: "/dashboard/posts", roles: ["Admin", "Editor", "SuperAdmin"] },
      { icon: MessageCircle, label: "Comments", href: "/dashboard/posts/comments", roles: ["Admin", "Editor", "SuperAdmin"] },
      { icon: Tag, label: "Tags", href: "/dashboard/posts/tags", roles: ["Admin", "Editor", "SuperAdmin"] },
      { icon: Folder, label: "Categories", href: "/dashboard/posts/categories", roles: ["Admin", "Editor", "SuperAdmin"] },
      { icon: ShieldCheck, label: "System", href: "/dashboard/settings/system", roles: ["Admin", "SuperAdmin"] },
      { icon: CreditCard, label: "Billing", href: "/dashboard/billing", roles: ["Editor", "Admin", "SuperAdmin"] },
      { icon: Settings, label: "Settings", href: "/dashboard/settings", roles: ["Viewer", "Editor", "Admin", "SuperAdmin"] },
      { icon: MessageCircle, label: "Support", href: "/dashboard/support", roles: ["Viewer", "Editor", "Admin", "SuperAdmin", "Support"] },
      { icon: Key, label: "Licenses", href: "/dashboard/licenses", roles: ["Admin", "SuperAdmin"] },
    ]
  },
  {
    label: "Admin",
    items: [
      { icon: Download, label: "Download Analytics", href: "/dashboard/analytics/downloads", roles: ["Admin", "SuperAdmin"] },
      { icon: GalleryVerticalEnd, label: "Portfolio", href: "/dashboard/portfolio", roles: ["Admin", "SuperAdmin"] },
      { icon: UserCircle, label: "Team", href: "/dashboard/team", roles: ["Admin", "SuperAdmin"] },
      { icon: Star, label: "Testimonials", href: "/dashboard/testimonials", roles: ["Admin", "SuperAdmin"] },
      { icon: Ticket, label: "Tickets", href: "/dashboard/tickets", roles: ["Admin", "SuperAdmin"] },
      { icon: Calendar, label: "Events", href: "/dashboard/events", roles: ["Admin", "SuperAdmin"] },
      { icon: ScrollText, label: "Audit", href: "/dashboard/audit", roles: ["Admin", "SuperAdmin"] },
      { icon: Megaphone, label: "Marketing", href: "/dashboard/marketing", roles: ["Admin", "SuperAdmin"] },
    ]
  }
];

type SidebarContentProps = {
  collapsed?: boolean;
  onNavClick?: () => void;
};

function SidebarContent({ collapsed = false, onNavClick }: SidebarContentProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const ROLE_HIERARCHY: Record<string, number> = {
    SuperAdmin: 5,
    Admin: 4,
    Editor: 3,
    Support: 2,
    Viewer: 1,
  };
  const activeRole = user?.role || "Viewer";
  const userRoleLevel = ROLE_HIERARCHY[activeRole] || 1;
  const hasAccess = (requiredRoles: string[]) =>
    requiredRoles.some((r) => ROLE_HIERARCHY[r] <= userRoleLevel);

  const badgeCounts = useBadgeCounts();

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div data-lenis-prevent className="flex-1 min-h-0 px-3 overflow-y-auto overflow-x-hidden overscroll-contain">
        <div className="space-y-6 py-4">
          {NAV_GROUPS.map((group) => {
            const filteredItems = group.items.filter((item) => hasAccess(item.roles));
            if (filteredItems.length === 0) return null;

            return (
              <div key={group.label} className="space-y-2">
                {!collapsed && (
                  <h4 className="px-4 text-xs font-semibold uppercase text-muted-foreground/60 mb-3">
                    {group.label}
                  </h4>
                )}
                <nav className="space-y-1">
                  {filteredItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                    const badgeCount = (item as any).badgeKey ? badgeCounts[(item as any).badgeKey as keyof typeof badgeCounts] : 0;
                    const hasBadge = badgeCount > 0;

                    return (
                      <Link key={item.href + item.label}
                        href={item.href}
                        onClick={onNavClick}
                        className={cn(
                          "flex items-center gap-3 px-4 py-2.5 rounded-2xl transition-all relative group",
                          isActive
                            ? "bg-primary/10 text-primary font-semibold shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]"
                            : "text-muted-foreground/70 hover:bg-muted/50 hover:text-foreground"
                        )}
                      >
                        <item.icon className={cn(
                            "w-5 h-5 shrink-0 transition-all duration-300",
                            isActive ? "text-primary scale-110" : "group-hover:text-foreground group-hover:scale-110"
                          )}
                        />

                        {!collapsed && (
                          <AnimatedSpan initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="whitespace-nowrap flex-1 truncate text-sm font-medium tracking-tight"
                          >
                            {item.label}
                          </AnimatedSpan>
                        )}

                        {hasBadge && !collapsed && (
                          <Badge className={cn(
                              "text-[10px] font-semibold px-1.5 py-0 h-4 min-w-[16px] flex items-center justify-center rounded-full border-none",
                              isActive ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                            )}
                          >
                            {badgeCount}
                          </Badge>
                        )}

                        {hasBadge && collapsed && (
                          <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border border-card shadow-[0_0_10px_rgba(37,99,235,0.5)]" />
                        )}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            );
          })}
        </div>
      </div>

      <div className="shrink-0 p-4 border-t border-border/40 bg-muted/5 space-y-2">
        {/* Show upgrade banner only for users on the free/Starter plan */}
        {!collapsed && (!user?.subscriptionPlan || user?.subscriptionPlan === "Starter") && (
          <div className="mb-4 p-5 rounded-2xl bg-gradient-to-br from-primary/10 via-purple-500/5 to-transparent border border-primary/10 relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 blur-[40px] rounded-full group-hover:bg-primary/20 transition-colors" />
            <p className="font-semibold text-sm mb-1">Upgrade Plan</p>
            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
              Unlock premium features and unlimited access.
            </p>
            <Button asChild size="sm" className="w-full h-9 rounded-xl text-xs font-semibold uppercase tracking-wide bg-primary hover:scale-[1.02] active:scale-[0.98] transition-all">
              <Link href="/dashboard/billing/subscription">Upgrade Now</Link>
            </Button>
          </div>
        )}

        {/* User Info Card */}
        {!collapsed && (
          <div className="mb-4 p-4 rounded-2xl bg-muted/30 border border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-semibold text-xs shrink-0">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{user?.name || 'User'}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">{activeRole}</p>
              </div>
            </div>
          </div>
        )}

        <Button variant="ghost"
          size="sm"
          onClick={() => void logout()}
          className={cn(
            "w-full justify-start gap-4 h-12 rounded-2xl font-medium text-red-500 hover:bg-red-500/10 hover:text-red-500",
            collapsed && "justify-center px-0"
          )}
        >
          <div className="w-8 h-8 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 shrink-0">
            <LogOut className="w-4 h-4" />
          </div>
          {!collapsed && <span className="text-xs">Logout</span>}
        </Button>
      </div>
    </div>
  );
}

export default function Sidebar() {
  const collapsed = !useUIStore((s) => s.sidebarOpen);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const { mobileSidebarOpen, setMobileSidebarOpen } = useDashboard();

  return (
    <>
      {/* Desktop Sidebar */}
      <AnimatedAside
        className={cn(
          "h-screen sticky top-0 bg-[#050505]/60 backdrop-blur-2xl border-r border-white/5 flex flex-col z-40 hidden lg:flex transition-all duration-300",
          collapsed ? "w-[100px]" : "w-72"
        )}
      >
        <div className="h-20 flex items-center justify-between px-6 border-b border-white/5 shrink-0 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

          {!collapsed ? (
            <AnimatedDiv initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4 font-semibold overflow-hidden"
            >
              <Logo variant="white" size="lg" />
            </AnimatedDiv>
          ) : (
            <Logo showText={false} size="lg" className="mx-auto" />
          )}

          <Button variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="absolute -right-3 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full border border-white/10 bg-[#0A0A0A] shadow-xl text-muted-foreground hover:text-white transition-all z-50 invisible lg:visible"
          >
            {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
          </Button>
        </div>

        <SidebarContent collapsed={collapsed} />
      </AnimatedAside>

      {/* Mobile Sidebar Sheet */}
      <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetContent side="left" className="w-[300px] p-0 border-none bg-[#050505]/95 backdrop-blur-3xl flex flex-col shadow-[0_0_100px_rgba(0,0,0,0.5)]">
          <SheetHeader className="p-6 border-b border-white/5 shrink-0 relative">
             <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <div className="flex items-center gap-4">
              <Logo variant="white" size="lg" />
            </div>
          </SheetHeader>
          <div className="flex-1 flex flex-col min-h-0">
            <SidebarContent onNavClick={() => setMobileSidebarOpen(false)} />
          </div>
          <div className="p-6 text-center">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground/40">Oftisoft v2.0</p>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

"use client"
import { AnimatedDiv, AnimatePresence } from "@/lib/animated";

import { useState, useEffect } from "react";
import {
  Search,
  Menu,
  ChevronRight,
  Settings,
  LogOut,
  User,
  Zap,
  LifeBuoy,
  X,
  ShoppingCart,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDashboard } from "@/lib/dashboard-context";
import { useAuth } from "@/hooks/useAuth";
import { NotificationCenter } from "./notification-center";
import { CartDrawer } from "@/components/cart-drawer";
import { useCart } from "@/hooks/use-cart";

export default function Header() {
  const pathname = usePathname();
  const { setMobileSidebarOpen } = useDashboard();
  const { user, logout } = useAuth();
  const { items: cartItems } = useCart();
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const breadcrumbs = pathname
    .split("/")
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1));

  const avatarSrc = user?.avatarUrl
    ? (user.avatarUrl.startsWith('http')
        ? user.avatarUrl
        : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000'}${user.avatarUrl}`)
    : `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'User'}`;

  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const cartItemCount = cartItems.length;
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.querySelector<HTMLInputElement>('input[type="text"]')?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="h-16 sm:h-18 border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-40 px-4 sm:px-6 flex items-center justify-between gap-4 transition-all duration-300">
      {/* Left: Mobile Menu & Search */}
      <div className="flex items-center gap-3 sm:gap-6 flex-1 min-w-0">
        <Button variant="ghost"
          size="icon"
          className="lg:hidden shrink-0 h-9 w-9"
          onClick={() => setMobileSidebarOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </Button>

        <div className={cn(
            "relative transition-all duration-500 ease-out flex items-center gap-2 sm:gap-4 flex-1 min-w-0",
            isSearchFocused ? "max-w-2xl" : "max-w-md"
          )}
        >
          <div className="relative w-full max-w-md group">
            <AnimatedDiv layout className={cn(
                "absolute inset-0 bg-primary/5 rounded-xl sm:rounded-2xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity",
                isSearchFocused && "opacity-100 bg-primary/10 ring-2 ring-primary/20"
              )}
            />
            <Search className={cn(
                "absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors shrink-0",
                isSearchFocused ? "text-primary" : "text-muted-foreground"
              )}
            />
            <Input type="text"
              placeholder="Search... (Ctrl+K)"
              value={searchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => {
                if (!searchQuery) setIsSearchFocused(false);
              }}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchQuery.trim()) {
                  router.push(`/dashboard?q=${encodeURIComponent(searchQuery.trim())}`);
                }
              }}
              className="pl-9 sm:pl-11 pr-10 sm:pr-12 h-9 sm:h-10 bg-muted/30 border-border rounded-xl sm:rounded-2xl text-sm focus:bg-background"
            />
            <div className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {isSearchFocused && searchQuery ? (
                <Button variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="w-3 h-3" />
                </Button>
              ) : (
                <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                  <span className="text-xs">Ctrl</span>K
                </kbd>
              )}
            </div>
          </div>

          <AnimatePresence>
            {!isSearchFocused && (
              <AnimatedDiv initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="hidden xl:flex items-center gap-2 text-sm text-muted-foreground whitespace-nowrap shrink-0"
              >
                <Separator orientation="vertical" className="h-5" />
                {breadcrumbs.map((item, index) => (
                  <div key={item} className="flex items-center gap-2">
                    {index > 0 && <ChevronRight className="w-3 h-3" />}
                    <span className={cn(
                        index === breadcrumbs.length - 1
                          ? "font-semibold text-foreground"
                          : "hover:text-foreground transition-colors"
                      )}
                    >
                      {item}
                    </span>
                  </div>
                ))}
              </AnimatedDiv>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Right: Actions & Profile */}
      <div className="flex items-center gap-2 sm:gap-4 lg:gap-6 pl-2 shrink-0">
        <Badge variant="outline"
          className="hidden lg:flex items-center gap-2 px-2.5 py-1 border-green-500/20 bg-green-500/10 text-green-600 text-xs font-medium"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
          All Systems Online
        </Badge>

        <Separator orientation="vertical" className="h-6 sm:h-8 hidden lg:block" />

        {/* Cart */}
        <CartDrawer>
          <Button variant="ghost"
            size="icon"
            className={cn(
              "relative h-9 w-9 sm:h-10 sm:w-10 rounded-xl",
              "text-muted-foreground hover:text-foreground"
            )}
          >
            <ShoppingCart className="w-5 h-5" />
            {cartItemCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-semibold rounded-full flex items-center justify-center">
                {cartItemCount > 9 ? '9+' : cartItemCount}
              </span>
            )}
          </Button>
        </CartDrawer>

        {/* Notifications */}
        <NotificationCenter />

        <Separator orientation="vertical" className="h-6 sm:h-8 hidden sm:block" />

        {/* Profile Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost"
              className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-4 h-auto py-2"
            >
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold leading-none">{user?.name || "User"}</p>
                <p className="text-xs text-muted-foreground">{user?.role || "Member"}</p>
              </div>
              <div className="relative">
                <Avatar className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl border-2 border-background">
                  <AvatarImage src={avatarSrc} className="object-cover" />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-white font-semibold rounded-xl">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-card" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 rounded-2xl p-2">
            <div className="p-3 mb-2 bg-muted/30 rounded-xl flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase">
                  Account
                </p>
                <p className="font-semibold text-sm">{user?.role || "Member"}</p>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings/profile" className="flex items-center gap-3 cursor-pointer">
                <User className="w-4 h-4" /> Profile Details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings" className="flex items-center gap-3 cursor-pointer">
                <Settings className="w-4 h-4" /> Account Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/support" className="flex items-center gap-3 cursor-pointer">
                <LifeBuoy className="w-4 h-4" /> Help & Support
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive"
              className="cursor-pointer"
              onClick={() => void logout()}
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

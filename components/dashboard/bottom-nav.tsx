"use client"
import { AnimatedDiv } from "@/lib/animated";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Folder, MessageSquare, Bell, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRole, type UserRole } from "@/hooks/useRole";

interface NavLink {
  href: string;
  icon: any;
  label: string;
  roles: UserRole[];
}

const ALL_LINKS: NavLink[] = [
  { href: "/dashboard", icon: Home, label: "Home", roles: ["Viewer", "Editor", "Support", "Admin", "SuperAdmin"] },
  { href: "/dashboard/projects", icon: Folder, label: "Projects", roles: ["Editor", "Admin", "SuperAdmin"] },
  { href: "/dashboard/messages", icon: MessageSquare, label: "Chat", roles: ["Viewer", "Editor", "Support", "Admin", "SuperAdmin"] },
  { href: "/dashboard/notifications", icon: Bell, label: "Alerts", roles: ["Viewer", "Editor", "Support", "Admin", "SuperAdmin"] },
  { href: "/dashboard/settings", icon: Settings, label: "Menu", roles: ["Viewer", "Editor", "Support", "Admin", "SuperAdmin"] },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { hasRole } = useRole();
  const LINKS = ALL_LINKS.filter((link) => hasRole(link.roles));

  const activeIndex = LINKS.findIndex(
    (link) =>
      pathname === link.href ||
      (link.href !== "/dashboard" && pathname.startsWith(link.href)),
  );

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 pb-[env(safe-area-inset-bottom,0px)]">
      <nav className="relative flex items-center justify-around h-[72px] bg-[#050505] border-t border-white/[0.06] shadow-[0_-8px_30px_rgba(0,0,0,0.5)] px-2">
        {LINKS.map((link, i) => {
          const isActive = i === activeIndex;

          return (
            <Link
              key={link.href}
              href={link.href}
              className="relative flex items-center justify-center flex-1 h-full"
            >
              <div className="relative flex items-center justify-center w-full max-w-[72px]">
                {isActive && (
                  <AnimatedDiv
                    layoutId="nav-pill"
                    className="absolute inset-0 h-11 rounded-2xl bg-primary/15 shadow-[inset_0_0_0_1px_rgba(99,102,241,0.2),0_0_20px_rgba(99,102,241,0.08)]"
                    transition={{ type: "spring", bounce: 0.3, duration: 0.5 }}
                  />
                )}

                <div
                  className={cn(
                    "relative z-10 flex flex-col items-center justify-center gap-[3px] transition-all duration-200",
                    isActive ? "scale-100" : "scale-100",
                  )}
                >
                  <div
                    className={cn(
                      "flex items-center justify-center transition-all duration-200",
                      isActive
                        ? "text-primary"
                        : "text-muted-foreground hover:text-muted-foreground/80",
                    )}
                  >
                    <link.icon
                      className={cn(
                        "transition-all duration-200",
                        isActive ? "w-[22px] h-[22px] stroke-[2.5px]" : "w-[22px] h-[22px] stroke-[1.5px]",
                      )}
                    />
                  </div>

                  <span
                    className={cn(
                      "text-[10px] font-medium leading-none transition-all duration-200",
                      isActive
                        ? "text-primary/90"
                        : "text-muted-foreground/60",
                    )}
                  >
                    {link.label}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

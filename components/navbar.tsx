"use client";
import { AnimatedDiv } from "@/lib/animated";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight, ShoppingBag, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/useAuth";
import { Logo } from "@/components/ui/logo";

const navLinks = [
  { id: "about", href: "/about", label: "About" },
  { id: "services", href: "/services", label: "Services" },
  { id: "portfolio", href: "/portfolio", label: "Portfolio" },
  { id: "shop", href: "/shop", label: "Shop" },
  { id: "blog", href: "/blog", label: "Blog" },
  { id: "pricing", href: "/pricing", label: "Pricing" },
  { id: "contact", href: "/contact", label: "Contact" },
];

function MobileMenu({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (isOpen) setMounted(true);
  }, [isOpen]);

  useEffect(() => {
    if (!mounted) return;
    const ctx = gsap.context(() => {
      if (isOpen) {
        const tl = gsap.timeline();
        tl.set([overlayRef.current, panelRef.current], { clearProps: "all" })
          .fromTo(
            overlayRef.current,
            { opacity: 0 },
            { opacity: 1, duration: 0.3 },
          )
          .fromTo(
            panelRef.current,
            { x: "100%" },
            { x: "0%", duration: 0.5, ease: "power3.out" },
            "-=0.2",
          )
          .fromTo(
            linksRef.current?.children || [],
            { opacity: 0, x: 30 },
            {
              opacity: 1,
              x: 0,
              stagger: 0.04,
              duration: 0.4,
              ease: "power2.out",
            },
            "-=0.3",
          )
          .fromTo(
            ctaRef.current?.children || [],
            { opacity: 0, y: 15 },
            {
              opacity: 1,
              y: 0,
              stagger: 0.06,
              duration: 0.35,
              ease: "power2.out",
            },
            "-=0.2",
          );
      } else {
        const tl = gsap.timeline({
          onComplete: () => setMounted(false),
        });
        tl.to(linksRef.current?.children || [], {
          opacity: 0,
          x: 20,
          duration: 0.12,
          stagger: 0.02,
        })
          .to(
            ctaRef.current?.children || [],
            { opacity: 0, y: 10, duration: 0.1 },
            "-=0.1",
          )
          .to(
            panelRef.current,
            { x: "100%", duration: 0.35, ease: "power2.in" },
            "-=0.15",
          )
          .to(overlayRef.current, { opacity: 0, duration: 0.25 }, "-=0.2");
      }
    });
    return () => ctx.revert();
  }, [isOpen, mounted]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        className="absolute right-0 top-0 h-full w-[300px] sm:w-[400px] bg-background/95 backdrop-blur-xl border-l border-primary/10 shadow-2xl flex flex-col"
      >
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <Logo />
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div
          ref={linksRef}
          className="flex-1 flex flex-col items-center justify-center gap-1 px-6"
        >
          {navLinks.map((link, i) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.id || link.href || i}
                href={link.href}
                onClick={onClose}
                className={cn(
                  "block w-full text-center text-2xl font-bold py-3 rounded-xl transition-colors",
                  isActive
                    ? "text-primary bg-primary/5"
                    : "text-foreground/70 hover:text-foreground hover:bg-white/5",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
        <MobileMenuCTA onClose={onClose} />
      </div>
    </div>,
    document.body,
  );
}

function MobileMenuCTA({ onClose }: { onClose: () => void }) {
  const { isAuthenticated, logout } = useAuth();
  const cart = useCart();
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div ref={ref} className="p-6 border-t border-white/5 space-y-3">
      {isAuthenticated ? (
        <>
          <Button
            size="lg"
            className="w-full font-bold rounded-xl shadow-xl shadow-primary/20"
            asChild
          >
            <Link href="/dashboard" onClick={onClose}>
              Dashboard
            </Link>
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-full font-semibold rounded-xl"
            onClick={() => {
              logout();
              onClose();
            }}
          >
            Logout
          </Button>
        </>
      ) : (
        <>
          <Button
            size="lg"
            className="w-full font-bold rounded-xl shadow-xl shadow-primary/20"
            asChild
          >
            <Link href="/register" onClick={onClose}>
              Get Started Now
            </Link>
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-full font-semibold rounded-xl"
            asChild
          >
            <Link href="/login" onClick={onClose}>
              Client Login
            </Link>
          </Button>
        </>
      )}
      <button
        onClick={cart.openCart}
        className="w-full flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors pt-2"
      >
        <ShoppingBag className="w-4 h-4" />
        Cart {cart.items.length > 0 && `(${cart.items.length})`}
      </button>
    </div>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const cart = useCart();

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 flex justify-center transition-all duration-300",
        scrolled ? "py-4" : "py-6",
      )}
    >
      <div
        className={cn(
          "relative flex items-center justify-between transition-all duration-300",
          scrolled
            ? "w-[95%] md:w-[88%] lg:w-[90%] xl:max-w-[1280px] 2xl:max-w-[1440px] bg-background/60 backdrop-blur-xl border border-white/10 shadow-lg shadow-black/5 rounded-full px-4 sm:px-6 py-3"
            : "w-full container px-4 bg-transparent border-transparent",
        )}
      >
        <Link href="/" className="relative z-50 flex items-center gap-2 group">
          <Logo size="lg" />
        </Link>

        <div className="hidden lg:flex items-center gap-1 bg-secondary/5 rounded-full p-1 border border-white/5 mx-4">
          {navLinks.map((link, i) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.id || link.href || i}
                href={link.href}
                className={cn(
                  "relative px-3 xl:px-5 py-2 text-sm font-medium rounded-full transition-all duration-300",
                  isActive
                    ? "text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {isActive && (
                  <AnimatedDiv
                    layoutId="navbar-pill"
                    className="absolute inset-0 bg-primary rounded-full shadow-md"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  {link.label}
                  {link.label === "Shop" && cart.items.length > 0 && (
                    <span className="flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50">
                      {cart.items.length}
                    </span>
                  )}
                </span>
              </Link>
            );
          })}
        </div>

        <div className="hidden lg:flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-full hover:bg-white/10 text-muted-foreground hover:text-primary transition-colors"
            onClick={cart.openCart}
          >
            <ShoppingBag className="w-5 h-5" />
            {cart.items.length > 0 && (
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-primary rounded-full ring-2 ring-background animate-pulse" />
            )}
          </Button>
          <div className="w-px h-6 bg-white/10 mx-2" />

          {isAuthenticated ? (
            <>
              <Button
                variant="ghost"
                asChild
                className="text-muted-foreground hover:text-primary font-semibold"
              >
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <Button
                onClick={logout}
                className="rounded-full font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all"
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                asChild
                className="text-muted-foreground hover:text-primary font-semibold"
              >
                <Link href="/login">Log in</Link>
              </Button>
              <Button
                asChild
                className="rounded-full font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all"
              >
                <Link href="/register">
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </>
          )}
        </div>

        <div className="lg:hidden flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-full hover:bg-white/10 text-muted-foreground hover:text-primary transition-colors"
            onClick={cart.openCart}
          >
            <ShoppingBag className="w-5 h-5" />
            {cart.items.length > 0 && (
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-primary rounded-full ring-2 ring-background animate-pulse" />
            )}
          </Button>
          <button
            ref={btnRef}
            onClick={() => setIsOpen(true)}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-foreground"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <line x1="4" y1="7" x2="20" y2="7" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="17" x2="20" y2="17" />
            </svg>
          </button>
        </div>
      </div>

      <MobileMenu isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </nav>
  );
}

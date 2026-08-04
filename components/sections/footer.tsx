"use client";

import Link from "next/link";
import { Facebook, Twitter, Instagram, Linkedin, Mail, MapPin, Phone, ArrowRight, Github, ArrowUp } from "lucide-react";
import { useState } from "react";
import { useLeads } from "@/hooks/useLeads";

const iconMap: Record<string, any> = {
    Github, Twitter, Linkedin, Instagram, Facebook, Mail, MapPin, Phone,
};

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const isExternalHref = (href: string) =>
    /^(https?:\/\/|mailto:|tel:)/i.test(href);

const footerData = {
    brandName: "Oftisoft",
    newsletterTitle: "Stay ahead of the curve",
    newsletterDescription: "Get weekly insights on software engineering, AI, and digital transformation. No spam, ever.",
    newsletterPlaceholder: "Enter your email",
    newsletterButtonText: "Subscribe",
    newsletterDisclaimer: "Join 5,000+ subscribers. Unsubscribe anytime.",
    tagline: "Premium software engineering,",
    description: "delivered globally. Based in Bangladesh, serving clients across 4 continents.",
    socialLinks: [
        { id: "github", icon: "Github", href: "https://github.com/oftisoft", label: "GitHub" },
        { id: "linkedin", icon: "Linkedin", href: "https://linkedin.com/company/oftisoft", label: "LinkedIn" },
        { id: "twitter", icon: "Twitter", href: "https://twitter.com/oftisoft", label: "Twitter" },
        { id: "facebook", icon: "Facebook", href: "https://facebook.com/oftisoft", label: "Facebook" },
        { id: "instagram", icon: "Instagram", href: "https://instagram.com/oftisoft", label: "Instagram" },
    ],
    contactInfo: [
        { icon: "Mail", href: "mailto:oftisoft@gmail.com", text: "oftisoft@gmail.com" },
        { icon: "Phone", href: "tel:+8801757220402", text: "+880 1757-220402" },
        { icon: "MapPin", text: "Satkhira, Bangladesh 9400" },
    ],
    columns: [
        {
            id: "services",
            title: "Services",
            links: [
                { id: "web", href: "/services", label: "Web Development" },
                { id: "mobile", href: "/services", label: "Mobile Apps" },
                { id: "ai", href: "/services", label: "AI Solutions" },
                { id: "saas", href: "/services", label: "SaaS Development" },
            ],
        },
        {
            id: "company",
            title: "Company",
            links: [
                { id: "about", href: "/about", label: "About Us" },
                { id: "portfolio", href: "/portfolio", label: "Portfolio" },
                { id: "blog", href: "/blog", label: "Blog" },
                { id: "careers", href: "/careers", label: "Careers" },
                { id: "changelog", href: "/changelog", label: "Changelog" },
                { id: "partners", href: "/partners", label: "Partners" },
            ],
        },
        {
            id: "resources",
            title: "Resources",
            links: [
                { id: "docs", href: "/docs", label: "Documentation" },
                { id: "tools", href: "/tools", label: "Recommended Tools" },
                { id: "status", href: "/status", label: "System Status" },
                { id: "community", href: "/community", label: "Community" },
                { id: "reviews", href: "https://www.trustpilot.com/review/oftisoft.com", label: "Trustpilot Reviews" },
            ],
        },
        {
            id: "legal",
            title: "Legal",
            links: [
                { id: "terms", href: "/terms", label: "Terms of Service" },
                { id: "privacy", href: "/privacy", label: "Privacy Policy" },
                { id: "refund", href: "/refund", label: "Refund Policy" },
                { id: "support", href: "/support", label: "Help Center" },
                { id: "faq", href: "/docs", label: "FAQ" },
            ],
        },
    ],
    statusText: "All systems operational",
};

export default function Footer() {
    const { subscribe, isSubscribing } = useLeads();
    const [email, setEmail] = useState("");
    const content = footerData;

    const handleSubscribe = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        subscribe(email, {
            onSuccess: () => setEmail(""),
        });
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <footer className="relative bg-[#020202] pt-0 pb-12 overflow-hidden z-10 border-t border-white/5">
            {/* Background Texture */}
            <div className="absolute inset-0 bg-grain opacity-[0.03] pointer-events-none" />

            {/* Gradient Orb */}
            <div className="absolute -top-[300px] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />

            <div className="container px-4 mx-auto relative z-10">

                {/* Newsletter Banner */}
                <div className="border-b border-white/5">
                    <div className="py-12 md:py-16 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-16">
                        <div className="text-center lg:text-left max-w-lg">
                            <h3 className="type-h2 text-white mb-2">
                                {content.newsletterTitle}
                            </h3>
                            <p className="text-muted-foreground type-body-sm">
                                {content.newsletterDescription}
                            </p>
                        </div>

                        <form
                            className="relative max-w-md w-full flex flex-col sm:flex-row gap-3"
                            onSubmit={handleSubscribe}
                        >
                            <Input
                                type="email"
                                required
                                placeholder={content.newsletterPlaceholder}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full h-12 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-primary/50 focus-visible:bg-white/10 transition-all"
                            />
                            <Button
                                size="icon"
                                type="submit"
                                disabled={isSubscribing}
                                className="h-12 w-12 shrink-0 rounded-xl bg-primary hover:bg-primary/90 text-white transition-colors hidden sm:flex items-center justify-center"
                            >
                                {isSubscribing ? (
                                    <span className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <ArrowRight className="w-5 h-5" />
                                )}
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubscribing}
                                className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-medium sm:hidden"
                            >
                                {isSubscribing ? "Subscribing..." : content.newsletterButtonText}
                            </Button>
                        </form>
                    </div>
                    <p className="text-caption text-muted-foreground/60 -mt-4 mb-12 md:mb-16 text-center lg:text-right">
                        {content.newsletterDisclaimer}
                    </p>
                </div>

                {/* Main Footer Links */}
                <nav aria-label="Footer navigation" className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-y-12 gap-x-6 md:gap-x-8 xl:gap-x-12 py-16 md:py-20">
                    {/* Brand Column */}
                    <div className="col-span-2 md:col-span-4 lg:col-span-1 space-y-6">
                        <Link href="/" className="inline-block">
                            <span className="text-heading-2 font-bold text-white">
                                {content.brandName}
                                <span className="text-primary">.</span>
                            </span>
                        </Link>
                        <p className="text-muted-foreground leading-relaxed max-w-xs">
                            <span className="text-white font-medium">{content.tagline}</span>{" "}
                            {content.description}
                        </p>
                        <div className="flex gap-3">
                            {(content.socialLinks || []).map((social, i) => {
                                const Icon = iconMap[social.icon] || Github;
                                return (
                                    <a
                                        key={social.id || i}
                                        href={social.href}
                                        target={
                                            isExternalHref(social.href) && social.href.startsWith("http")
                                                ? "_blank"
                                                : undefined
                                        }
                                        rel={
                                            isExternalHref(social.href) && social.href.startsWith("http")
                                                ? "noreferrer"
                                                : undefined
                                        }
                                        className="w-9 h-9 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all"
                                        aria-label={social.label}
                                    >
                                        <Icon className="w-4 h-4" />
                                    </a>
                                );
                            })}
                        </div>
                        <div className="space-y-3">
                            {content.contactInfo.map((item, i) => {
                                const Icon = iconMap[item.icon] || Mail;
                                const Wrapper = item.href ? "a" : "span";
                                return (
                                    <div key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                                        <Icon className="w-4 h-4 mt-0.5 shrink-0 text-white/40" />
                                        <Wrapper
                                            {...(item.href
                                                ? {
                                                      href: item.href,
                                                      ...(isExternalHref(item.href) && item.href.startsWith("http")
                                                          ? { target: "_blank", rel: "noreferrer" }
                                                          : {}),
                                                  }
                                                : {})}
                                            className="hover:text-white transition-colors"
                                        >
                                            {item.text}
                                        </Wrapper>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Link Columns */}
                    {(content.columns || []).map((column, i) => (
                        <div key={column.id || i}>
                            <h4 className="font-bold text-white text-sm tracking-wide uppercase mb-5">
                                {column.title}
                            </h4>
                            <ul className="space-y-3">
                                {(column.links || []).map((link, j) => (
                                    <li key={link.id || j}>
                                        {isExternalHref(link.href) ? (
                                            <a
                                                href={link.href}
                                                target={
                                                    link.href.startsWith("http") ? "_blank" : undefined
                                                }
                                                rel={
                                                    link.href.startsWith("http") ? "noreferrer" : undefined
                                                }
                                                className="text-sm text-muted-foreground hover:text-white transition-colors w-fit"
                                            >
                                                {link.label}
                                            </a>
                                        ) : (
                                            <Link
                                                href={link.href}
                                                className="text-sm text-muted-foreground hover:text-white transition-colors w-fit"
                                            >
                                                {link.label}
                                            </Link>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </nav>

                {/* Bottom Bar */}
                <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-muted-foreground text-center md:text-left">
                        &copy; {new Date().getFullYear()} {content.brandName}. All rights reserved. Built with passion in Bangladesh.
                    </p>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground/60 bg-white/5 px-4 py-2 rounded-full border border-white/5">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            {content.statusText}
                        </div>
                        <button
                            onClick={scrollToTop}
                            className="w-9 h-9 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all"
                            aria-label="Back to top"
                        >
                            <ArrowUp className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </footer>
    );
}

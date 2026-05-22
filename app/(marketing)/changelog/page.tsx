import { AnimatedDiv, AnimatedH1, AnimatedH2, AnimatedH3, AnimatedP } from "@/lib/animated";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GitBranch, Sparkles, ShieldCheck, Package } from "lucide-react";

const iconMap: any = {
    Sparkles, ShieldCheck, Package, GitBranch
};

const pageData = {
    header: { badge: "UPDATES", titlePrefix: "Changelog & ", titleSuffix: "Releases", description: "Track every feature, improvement, and fix shipped to our platform." },
    updates: [
        { id: "v2-5", iconName: "Sparkles", category: "Major", date: "May 1, 2026", title: "AI-Powered Analytics Release", version: "v2.5.0", description: "We're excited to announce the launch of our AI-powered analytics platform. This release brings real-time insights, predictive modeling, and natural language querying to all enterprise customers.", changes: ["Real-time dashboard with sub-second refresh", "AI-powered predictive analytics module", "Natural language query interface", "Automated anomaly detection"], isActive: true },
        { id: "v2-4", iconName: "ShieldCheck", category: "Feature", date: "April 15, 2026", title: "Enterprise Security Suite", version: "v2.4.0", description: "Enhanced security features including SSO/SAML integration, audit logging, and role-based access control for enterprise customers.", changes: ["SSO/SAML integration for enterprise SSO", "Comprehensive audit logging with export", "Granular role-based access control", "IP whitelisting and geo-restrictions"], isActive: true },
        { id: "v2-3", iconName: "Package", category: "Feature", date: "March 20, 2026", title: "Multi-Vendor Marketplace", version: "v2.3.0", description: "New multi-vendor marketplace module with automated payouts, vendor dashboards, and commission management.", changes: ["Multi-vendor architecture with isolated stores", "Automated payout system (Stripe/PayPal)", "Vendor analytics dashboard", "Commission tier management"], isActive: true },
        { id: "v2-2", iconName: "GitBranch", category: "Improvement", date: "February 10, 2026", title: "API Performance Optimization", version: "v2.2.0", description: "Major performance improvements across our API layer, reducing average response times by 60%.", changes: ["GraphQL edge caching with CDN integration", "Database query optimization (60% faster)", "WebSocket connection pooling", "Rate limiting with smart throttling"], isActive: true },
        { id: "v2-1", iconName: "Sparkles", category: "Major", date: "January 5, 2026", title: "Next.js 16 Migration", version: "v2.1.0", description: "Migrated the entire platform to Next.js 16 with Turbopack, resulting in 80% faster builds and improved developer experience.", changes: ["Next.js 16 with Turbopack compilation", "React 19 concurrent features", "Streaming SSR for faster page loads", "Improved image optimization pipeline"], isActive: true },
    ]
};

export default function ChangelogPage() {
    const { header, updates } = pageData;
    const activeUpdates = updates.filter(u => u.isActive);
    return (
        <div className="relative min-h-screen pt-32 pb-24">
            {/* Background Gradients */}
            <div className="fixed inset-0 z-[-1] pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-primary/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-blue-500/5 rounded-full blur-[120px]" />
            </div>

            <div className="container px-6 mx-auto max-w-4xl space-y-16">
                <div className="space-y-4 text-center">
                    <AnimatedDiv initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6 }}
                    >
                        <Badge variant="outline" className="px-4 py-1 rounded-full border-primary/20 bg-primary/5 text-primary font-semibold tracking-widest text-[10px]">
                            {header?.badge ?? ""}
                        </Badge>
                    </AnimatedDiv>
                    <AnimatedH1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-4xl sm:text-5xl md:text-7xl font-semibold tracking-tighter"
                    >
                        {header?.titlePrefix ?? ""}<span className="text-primary">{header?.titleSuffix ?? ""}</span>
                    </AnimatedH1>
                    <AnimatedP 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto"
                    >
                        {header?.description ?? ""}
                    </AnimatedP>
                </div>

                <div className="relative space-y-12 before:absolute before:left-[19px] before:top-4 before:bottom-4 before:w-px before:bg-gradient-to-b before:from-primary/50 before:via-border before:to-transparent">
                    {activeUpdates.map((update, idx) => {
                        const Icon = iconMap[update.iconName ?? ''] || Sparkles;
                        return (
                        <AnimatedDiv 
                            key={update.id}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            style={{ willChange: "transform, opacity" }}
                            className="relative pl-12 group"
                        >
                            <div className="absolute left-0 top-0 w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center z-10 shadow-lg group-hover:border-primary/50 transition-colors duration-500">
                                <GitBranch className="w-5 h-5 text-primary" />
                            </div>

                            <Card className="border-border/50 bg-card/40 backdrop-blur-xl rounded-[32px] overflow-hidden hover:border-primary/20 transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-primary/5">
                                <CardHeader className="p-8 md:p-10 border-b border-border/50 bg-primary/[0.02]">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-3">
                                                <Badge className={cn("text-[9px] font-black uppercase tracking-widest", 
                                                    update.category === "Major" ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                                                )}>
                                                    {update.category}
                                                </Badge>
                                                <span className="text-[10px] font-semibold text-muted-foreground">{update.date}</span>
                                            </div>
                                            <CardTitle className="text-2xl md:text-3xl font-semibold">{update.title}</CardTitle>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-2xl font-semibold font-mono text-primary/40 group-hover:text-primary transition-colors duration-500">{update.version}</span>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-8 md:p-10 space-y-8">
                                    <p className="text-lg text-muted-foreground font-medium leading-relaxed">
                                        {update.description}
                                    </p>
                                    
                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-semibold text-primary tracking-widest flex items-center gap-2">
                                            <Icon size={14} /> Refinements & Features
                                        </h4>
                                        <ul className="grid md:grid-cols-1 gap-3">
                                            {update.changes.map((change, i) => (
                                                <li key={i} className="flex items-start gap-3 text-sm font-medium text-foreground/80 group/item">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 group-hover/item:scale-150 transition-transform" />
                                                    {change}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </CardContent>
                            </Card>
                        </AnimatedDiv>
                    );})}
                </div>

                <AnimatedDiv 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.5 }}
                    style={{ willChange: "transform, opacity" }}
                    className="pt-12 text-center"
                >
                    <p className="text-[10px] font-semibold tracking-widest text-muted-foreground bg-muted/30 py-3 px-6 rounded-full w-fit mx-auto border border-border/50">
                        Operational nodes synced. End of Log.
                    </p>
                </AnimatedDiv>
            </div>
        </div>
    );
}

import { cn } from "@/lib/utils";


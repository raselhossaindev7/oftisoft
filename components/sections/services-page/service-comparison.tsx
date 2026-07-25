"use client";

const tierColorMap: Record<string, string> = {
    blue: 'bg-blue-600/20', purple: 'bg-purple-600/20', orange: 'bg-orange-600/20',
};

import { 
    Check, X, Sparkles, Zap, Shield, Crown, HelpCircle, ArrowRight, Minus,
    Plus, Save, Trash2, LayoutTemplate, Grid, Server, Database, Cloud, 
    Brain, Smartphone, Layout, Video, FileText, Code2, ClipboardCheck, Rocket, 
    HeartPulse, Globe, Code, ShieldCheck, Layers
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useCart } from "@/hooks/use-cart";

const iconMap: any = {
    Check, X, Sparkles, Zap, Shield, Crown, HelpCircle, ArrowRight, Minus,
    Plus, Save, Trash2, LayoutTemplate, Grid, Server, Database, Cloud, 
    Brain, Smartphone, Layout, Video, FileText, Code2, ClipboardCheck, Rocket, 
    HeartPulse, Globe, Code, ShieldCheck, Layers
};

const comparisonData = {
    tiers: [
        { id: "starter", name: "Starter", price: "$2,999", description: "For early-stage startups and MVPs", highlight: false, iconName: "Rocket", features: [true, true, true, true, false, false, false, false, false, false, false, false, false, false, false, false], color: "blue" },
        { id: "growth", name: "Growth", price: "$7,999", description: "For scaling products and growing teams", highlight: true, iconName: "Zap", features: [true, true, true, true, true, true, true, true, true, false, false, false, false, false, false, false], color: "purple" },
        { id: "enterprise", name: "Enterprise", price: "Custom", description: "For large organizations with custom needs", highlight: false, iconName: "Crown", features: [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true], color: "orange" },
    ],
    features: [
        { id: "dedicated-engineer", name: "Dedicated Engineer", iconName: "Code", tooltip: "A senior developer assigned exclusively to your project for consistent quality and deep domain knowledge." },
        { id: "basic-analytics", name: "Basic Analytics", iconName: "BarChart", tooltip: "Core metrics dashboard with page views, user sessions, and conversion tracking." },
        { id: "email-support", name: "Email Support", iconName: "Mail", tooltip: "Ticket-based support via email with a guaranteed 24-hour first response time." },
        { id: "weekly-calls", name: "Weekly Sync Calls", iconName: "Video", tooltip: "Weekly video calls to review progress, discuss priorities, and align on next steps." },
        { id: "advanced-analytics", name: "Advanced Analytics", iconName: "Zap", tooltip: "Deep analytics with custom dashboards, funnels, cohort analysis, and real-time data." },
        { id: "priority-support", name: "Priority Support (4hr)", iconName: "Zap", tooltip: "Priority queue with a 4-hour response window for critical issues." },
        { id: "daily-calls", name: "Daily Standups", iconName: "Video", tooltip: "Daily 15-minute standup calls to track progress and unblock development." },
        { id: "devops", name: "DevOps & CI/CD", iconName: "Rocket", tooltip: "Automated deployment pipelines, infrastructure as code, and cloud infrastructure management." },
        { id: "code-review", name: "Automated Code Review", iconName: "ShieldCheck", tooltip: "Automated code quality checks, security scanning, and performance analysis in every PR." },
        { id: "full-team", name: "Full Team (4+ engineers)", iconName: "Users", tooltip: "A multi-disciplinary team including frontend, backend, DevOps, and QA engineers." },
        { id: "ai-analytics", name: "AI-Powered Analytics", iconName: "Brain", tooltip: "Predictive analytics, anomaly detection, and AI-driven insights powered by machine learning models." },
        { id: "24-7-support", name: "24/7 On-Call Support", iconName: "Crown", tooltip: "Round-the-clock on-call support with a 15-minute incident response SLA." },
        { id: "dedicated-pm", name: "Dedicated Project Manager", iconName: "Crown", tooltip: "A dedicated project manager handling sprint planning, stakeholder communication, and risk management." },
        { id: "security-audit", name: "Security Audit", iconName: "Shield", tooltip: "Regular penetration testing, vulnerability assessments, and compliance audits (SOC 2, GDPR)." },
        { id: "custom-sla", name: "Custom SLA", iconName: "Sparkles", tooltip: "Tailored service-level agreements with custom uptime guarantees, response times, and escalation paths." },
        { id: "on-premise", name: "On-Premise Deployment", iconName: "Server", tooltip: "Deploy and manage the solution within your own infrastructure for maximum data sovereignty." },
    ]
};

export default function ServiceComparison() {
    const cart = useCart();
    const { tiers, features } = comparisonData;
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

    const handleAddToCart = (tier: any) => {
        const isCustom = tier.price === 'Custom';
        if (!isCustom) {
            const numericPrice = Number(tier.price.replace(/[^0-9.]/g, ''));
            cart.addItem({
                id: tier.id,
                name: `${tier.name} Plan`,
                price: numericPrice,
                image: '',
                slug: `service-${tier.id}`,
                type: 'service'
            });
        }
    };

    return (
        <section className="py-16 md:py-24 bg-background relative overflow-hidden">
            {/* Consistent Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

            {/* Background Effects */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] md:w-[800px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="container px-4 mx-auto relative z-10">
                <div className="text-center mb-12 md:mb-16">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold mb-4 md:mb-6 tracking-tight">Compare Plans</h2>
                    <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto">
                        Transparent pricing with no hidden fees. Choose the plan that fits your scale.
                    </p>
                </div>

                {/* Mobile View: Cards Carousel */}
                <div className="lg:hidden">
                    <Swiper modules={[Pagination]}
                        spaceBetween={20}
                        slidesPerView={1.1}
                        centeredSlides={true}
                        pagination={{ clickable: true }}
                        className="pb-12"
                    >
                        {tiers.map((tier) => (
                            <SwiperSlide key={tier.id}>
                                <Card className={cn(
                                    "h-full relative overflow-hidden transition-all duration-300 bg-card/50 backdrop-blur-md",
                                    tier.highlight ? "border-primary shadow-2xl shadow-primary/10 scale-100" : "border-border scale-95 opacity-90"
                                )}>
                                    {tier.highlight && (
                                        <div className="absolute top-0 right-0 bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-bl-xl border-l border-b border-primary/20 backdrop-blur-sm">
                                            MOST POPULAR
                                        </div>
                                    )}
                                    <CardHeader className="pb-4">
                                        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors", tier.highlight ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground")}>
                                            {(() => {
                                                const Icon = iconMap[tier.iconName] || Zap;
                                                return <Icon className="w-6 h-6" />;
                                            })()}
                                        </div>
                                        <CardTitle className="text-2xl font-bold">{tier.name}</CardTitle>
                                        <div className="text-3xl font-semibold mt-2 tracking-tighter">{tier.price}</div>
                                        <CardDescription className="text-xs mt-2 min-h-[40px] text-muted-foreground/80">{tier.description}</CardDescription>
                                    </CardHeader>
                                    
                                    <CardContent className="space-y-4 pb-6">
                                        {features.map((feature: any, i: number) => (
                                            <div key={i} className="flex items-center justify-between text-xs border-b border-border/30 pb-2 last:border-0 last:pb-0">
                                                <span className="text-muted-foreground font-medium">{feature.name}</span>
                                                {typeof tier.features?.[i] === 'boolean' ? (
                                                    tier.features?.[i] ? <Check className="w-4 h-4 text-primary" /> : <X className="w-4 h-4 text-muted-foreground/60" />
                                                ) : (
                                                    <span className="font-bold">{tier.features?.[i] ?? "-"}</span>
                                                )}
                                            </div>
                                        ))}
                                    </CardContent>

                                    <CardFooter>
                                        {tier.price === 'Custom' ? (
                                            <Button 
                                                asChild 
                                                className="w-full font-bold h-12 rounded-xl" 
                                                variant={tier.highlight ? "default" : "outline"}
                                            >
                                                <Link href="#contact">
                                                    Contact Us
                                                </Link>
                                            </Button>
                                        ) : (
                                            <Button 
                                                onClick={() => handleAddToCart(tier)}
                                                className="w-full font-bold h-12 rounded-xl" 
                                                variant={tier.highlight ? "default" : "outline"}
                                            >
                                                Add to Cart
                                            </Button>
                                        )}
                                    </CardFooter>
                                </Card>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>

                {/* Desktop View: Table */}
                <div className="hidden lg:block overflow-hidden rounded-[2rem] border border-border bg-card/20 backdrop-blur-md shadow-2xl">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent border-none">
                                <TableHead className="p-8 w-1/4 align-bottom">
                                    <span className="text-3xl font-bold text-foreground tracking-tight">Features</span>
                                </TableHead>
                                {tiers.map((tier: any) => (
                                    <TableHead key={tier.id} className={cn(
                                        "p-8 w-1/4 align-top relative transition-colors duration-300",
                                        tier.highlight ? "bg-primary/5" : "bg-transparent"
                                    )}>
                                        <div className="flex flex-col h-full justify-between gap-6">
                                            <div>
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className={cn("inline-flex p-3 rounded-xl border border-border/50 shadow-sm", tierColorMap[tier.color] || 'bg-muted/50')}>
                                                        {(() => {
                                                            const Icon = iconMap[tier.iconName] || Zap;
                                                            return <Icon className="w-6 h-6" />;
                                                        })()}
                                                    </div>
                                                    {tier.highlight && (
                                                        <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/20 px-3 py-1 text-xs">
                                                            POPULAR
                                                        </Badge>
                                                    )}
                                                </div>
                                                <h3 className="text-2xl font-bold mb-2 text-foreground">{tier.name}</h3>
                                                <div className="flex items-baseline gap-1 text-foreground">
                                                    <span className="text-4xl font-semibold tracking-tighter">{tier.price}</span>
                                                    {tier.price !== 'Custom' && <span className="text-muted-foreground text-sm font-bold">/project</span>}
                                                </div>
                                                <p className="text-sm text-muted-foreground mt-4 leading-relaxed font-medium">
                                                    {tier.description}
                                                </p>
                                            </div>
                                            
                                            {tier.price === 'Custom' ? (
                                                <Button 
                                                    asChild 
                                                    className="w-full font-bold h-12 rounded-xl text-base shadow-sm hover:shadow-md transition-all" 
                                                    variant={tier.highlight ? "default" : "outline"}
                                                >
                                                    <Link href="#contact">
                                                        Get Started <ArrowRight className="w-4 h-4 ml-2" />
                                                    </Link>
                                                </Button>
                                            ) : (
                                                <Button 
                                                    onClick={() => handleAddToCart(tier)}
                                                    className="w-full font-bold h-12 rounded-xl text-base shadow-sm hover:shadow-md transition-all" 
                                                    variant={tier.highlight ? "default" : "outline"}
                                                >
                                                    Add to Cart <ArrowRight className="w-4 h-4 ml-2" />
                                                </Button>
                                            )}
                                        </div>
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {features.map((feature: any, featureIndex: number) => (
                                <TableRow key={featureIndex} className="group hover:bg-muted/30 transition-colors border-border/40">
                                    <TableCell className="p-6 text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors pl-8">
                                        <div className="flex items-center gap-2">
                                            {feature.name}
                                            <div className="group/tooltip relative">
                                                <HelpCircle className="w-4 h-4 text-muted-foreground/30 hover:text-primary cursor-help transition-colors" />
                                                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-2 bg-popover text-popover-foreground text-xs rounded-lg border border-border shadow-md opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none w-56 z-50 backdrop-blur-md">
                                                    {feature.tooltip}
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    {tiers.map((tier: any, tierIndex: number) => (
                                        <TableCell key={tierIndex} className={cn(
                                            "p-6 text-center transition-colors align-middle",
                                            tier.highlight ? "bg-primary/5 group-hover:bg-primary/10" : ""
                                        )}>
                                            <div className="flex justify-center">
                                                {typeof tier.features?.[featureIndex] === 'boolean' ? (
                                                    tier.features?.[featureIndex] ? (
                                                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shadow-sm">
                                                            <Check className="w-4 h-4 text-primary font-bold" />
                                                        </div>
                                                    ) : (
                                                        <div className="w-8 h-8 flex items-center justify-center">
                                                            <Minus className="w-4 h-4 text-muted-foreground/50" />
                                                        </div>
                                                    )
                                                ) : (
                                                    <span className="font-bold text-foreground bg-background/80 px-4 py-1.5 rounded-full text-sm border border-border shadow-sm">
                                                        {tier.features?.[featureIndex] ?? "-"}
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </section>
    );
}

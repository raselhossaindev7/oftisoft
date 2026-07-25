"use client"
import { AnimatedDiv } from "@/lib/animated";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

import {
    Layout,
    Smartphone,
    Server,
    MessageSquare,
    Code,
    Infinity,
    ArrowRight,
    Brain,
    Globe,
    Zap,
    Cpu,
    Database,
    Cloud,
    Shield,
    type LucideIcon
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useRef, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ServiceItem {
    id: string;
    title: string;
    description: string;
    icon: string;
    gradient: string;
    tags: string[];
}

const iconMap: Record<string, LucideIcon> = {
    Layout,
    Smartphone,
    Server,
    MessageSquare,
    Code,
    Infinity,
    ArrowRight,
    Brain,
    Globe,
    Zap,
    Cpu,
    Database,
    Cloud,
    Shield
};

export default function Services() {
    const servicesContent: {
        title: string;
        subtitle: string;
        badge: string;
        services: ServiceItem[];
    } = {
        title: "Engineering the",
        subtitle: "Digital Future",
        badge: "Capabilities",
        services: [
            { id: "web", title: "Web Development", description: "High-performance React, Next.js, and Node.js applications with blazing-fast load times and seamless UX.", icon: "Globe", gradient: "from-blue-500 to-cyan-500", tags: ["React", "Next.js", "Node.js", "TypeScript"] },
            { id: "mobile", title: "Mobile Apps", description: "Cross-platform native-feeling mobile applications built with React Native and Flutter for iOS and Android.", icon: "Smartphone", gradient: "from-purple-500 to-pink-500", tags: ["React Native", "Flutter", "iOS", "Android"] },
            { id: "ai", title: "AI & Machine Learning", description: "Intelligent automation, predictive analytics, and LLM-powered solutions tailored to your business needs.", icon: "Brain", gradient: "from-green-500 to-teal-500", tags: ["AI", "ML", "LLM", "Automation"] },
            { id: "saas", title: "SaaS Development", description: "End-to-end SaaS platforms with multi-tenancy, subscription billing, and enterprise-grade security built-in.", icon: "Cloud", gradient: "from-orange-500 to-red-500", tags: ["SaaS", "Multi-tenant", "Billing", "API"] },
            { id: "enterprise", title: "Enterprise Solutions", description: "Scalable enterprise software with microservices architecture, RBAC, audit logging, and compliance readiness.", icon: "Server", gradient: "from-indigo-500 to-violet-500", tags: ["Microservices", "RBAC", "Audit", "Compliance"] },
            { id: "devops", title: "DevOps & Cloud", description: "Automated CI/CD pipelines, cloud infrastructure on AWS/GCP/Azure, containerization, and monitoring.", icon: "Zap", gradient: "from-cyan-500 to-blue-500", tags: ["CI/CD", "Docker", "Kubernetes", "Cloud"] },
        ]
    };
    const services = servicesContent.services;

    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const headerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = headerRef.current;
        if (!el) return;
        const ctx = gsap.context(() => {
            gsap.fromTo(el,
                { opacity: 0, y: 50 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.5,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: el,
                        start: "top 85%",
                        toggleActions: "play none none none",
                    },
                }
            );
        }, el);
        return () => ctx.revert();
    }, []);

    return (
        <section className="py-24 md:py-32 bg-transparent relative overflow-visible z-10" id="services">
            {/* Background Decorations - Optimized */}
            <div className="absolute top-1/2 left-0 w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 pointer-events-none" />
            
            <div className="container px-4 mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-16 gap-6 md:gap-8">
                    <div ref={headerRef} className="max-w-3xl w-full md:w-auto">
                        <Badge variant="outline" className="mb-4 border-primary/20 text-primary tracking-wide px-4 py-1.5 backdrop-blur-sm font-semibold text-xs">
                            {servicesContent.badge}
                        </Badge>
                        <h3 className="type-h1 text-white">
                            {servicesContent.title} <br className="hidden md:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                                {servicesContent.subtitle}
                            </span>
                        </h3>
                    </div>

                    <AnimatedDiv 
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-80px" }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        style={{ willChange: "transform, opacity" }}
                        className="w-full md:w-auto flex justify-start md:justify-end"
                    >
                        <Link href="/services">
                            <Button variant="ghost" className="group type-body-lg font-medium text-white/80 hover:text-white px-0 hover:bg-transparent">
                                Explore All Services
                                <div className="w-10 h-10 ml-2 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-all duration-300">
                                    <ArrowRight className="w-5 h-5 -rotate-45 group-hover:rotate-0 transition-transform" />
                                </div>
                            </Button>
                        </Link>
                    </AnimatedDiv>
                </div>

                {/* Unified Responsive Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 xl:gap-8">
                    {services.map((service: ServiceItem, index: number) => {
                        const Icon = iconMap[service.icon] || Globe;
                        return (
                            <AnimatedDiv key={service?.id ?? `service-${index}`}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-80px" }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                onMouseEnter={() => setHoveredIndex(index)}
                                onMouseLeave={() => setHoveredIndex(null)}
                            >
                                <Link href={`/services/${service.id}`} className="block h-full">
                                <Card className="group relative h-full min-h-[320px] border-white/5 bg-white/5 hover:bg-white/[0.07] transition-all duration-500 overflow-hidden flex flex-col justify-between backdrop-blur-sm">
                                    {/* Gradient Glow Effect */}
                                    <div className={cn(
                                        "absolute -bottom-24 -right-24 w-64 h-64 rounded-full blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity duration-700 bg-gradient-to-tr will-change-[transform,opacity]",
                                        service.gradient
                                    )} />

                                    {/* Card Header & Icon */}
                                    <CardHeader className="relative z-10 pb-0">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className={cn(
                                                "p-3 rounded-2xl bg-white/5 border border-white/10 transition-colors duration-300 group-hover:border-white/20",
                                                hoveredIndex === index ? "bg-white/10" : ""
                                            )}>
                                                <Icon className="w-8 h-8 text-white" />
                                            </div>
                                            <ArrowRight className="w-6 h-6 text-white/30 -rotate-45 group-hover:rotate-0 group-hover:text-white transition-all duration-500 ease-out" />
                                        </div>
                                        <CardTitle className="text-heading-3 font-semibold text-white group-hover:translate-x-1 transition-transform duration-300">
                                            {service.title}
                                        </CardTitle>
                                    </CardHeader>

                                    {/* Content & Tags */}
                                    <CardContent className="relative z-10 pt-4 flex flex-col gap-6 h-full justify-between">
                                        <p className="text-muted-foreground type-body-sm leading-relaxed group-hover:text-white/80 transition-colors duration-300">
                                            {service.description}
                                        </p>
                                        
                                        <div className="flex flex-wrap gap-2 mt-auto">
                                            {(Array.isArray(service?.tags) ? service.tags : []).map((tag: string, tagIdx: number) => (
                                                <Badge 
                                                    key={`${service.id}-tag-${tagIdx}`} 
                                                    variant="secondary" 
                                                    className="bg-white/5 border-white/5 text-muted-foreground group-hover:text-white/90 group-hover:border-white/10 transition-colors"
                                                >
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </div>
                                    </CardContent>
                                    
                                </Card>
                            </Link>
                            </AnimatedDiv>
                        );
                    })}
                </div>

            </div>
        </section>
    );
}

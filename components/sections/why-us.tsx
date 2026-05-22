"use client"
import { AnimatedDiv } from "@/lib/animated";

import { Users, Workflow, Cpu, Headphones, Shield, Zap, Target, Award } from "lucide-react";
import { useRef } from "react";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    Users,
    Workflow,
    Cpu,
    Headphones,
    Shield,
    Zap,
    Target,
    Award
};

interface Feature {
    icon: string;
    title: string;
    description: string;
    gradient: string;
    color: string;
    stat: string;
    statLabel: string;
}

interface WhyUsData {
    badge: string;
    title: string;
    subtitle: string;
    description: string;
    features: Feature[];
    stats: { value: string; label: string }[];
}

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const defaultWhyUsContent: WhyUsData = {
    badge: "Why Oftisoft",
    title: "Built for",
    subtitle: "Excellence.",
    description: "We combine deep technical expertise with a relentless focus on quality. Every line of code we write is optimized for performance, security, and scalability.",
    features: [
        { icon: "Users", title: "Expert Team", description: "Senior engineers with 6+ years average experience in web, mobile, and AI technologies.", gradient: "from-blue-500/20 to-cyan-500/20", color: "text-blue-400", stat: "6+", statLabel: "Years Avg." },
        { icon: "Workflow", title: "Agile Process", description: "We use battle-tested agile methodologies with 2-week sprints, daily standups, and transparent reporting.", gradient: "from-purple-500/20 to-pink-500/20", color: "text-purple-400", stat: "2-Week", statLabel: "Sprints" },
        { icon: "Shield", title: "Enterprise Security", description: "SOC 2-aligned practices, OWASP-compliant code, encryption at rest and transit, and regular audits.", gradient: "from-green-500/20 to-teal-500/20", color: "text-green-400", stat: "100%", statLabel: "Compliant" },
        { icon: "Headphones", title: "24/7 Support", description: "Round-the-clock technical support with guaranteed 1-hour response time for critical issues.", gradient: "from-orange-500/20 to-red-500/20", color: "text-orange-400", stat: "<1hr", statLabel: "Response" },
    ],
    stats: [
        { value: "99.9%", label: "Client Satisfaction" },
        { value: "500+", label: "Projects Delivered" },
        { value: "6+ Years", label: "Industry Experience" },
    ]
};

export default function WhyUs({ data }: { data?: { whyUs?: WhyUsData } }) {
    const whyUsContent = data?.whyUs || defaultWhyUsContent;
    const features = whyUsContent.features;
    const stats = whyUsContent.stats;

    const containerRef = useRef<HTMLDivElement>(null);

    return (
        <section ref={containerRef} className="py-24 md:py-32 bg-transparent relative overflow-hidden z-10" id="why-us">
            {/* Background Beams */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-primary/5 blur-[120px] rounded-full mix-blend-screen" />
            </div>

            <div className="container px-4 mx-auto">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-16 md:mb-20">
                    <AnimatedDiv 
                        initial={{ opacity: 0, x: -30 }}
                        style={{ willChange: "transform, opacity" }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-80px" }}
                        transition={{ duration: 0.6 }}
                        className="text-center lg:text-left"
                    >
                        <Badge variant="outline" className="mb-6 border-primary/20 text-primary tracking-wide px-3 py-1 bg-primary/5 font-semibold text-xs">
                            {whyUsContent.badge}
                        </Badge>
                        <h3 className="text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-6 leading-tight">
                            {whyUsContent.title} <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/40">
                                {whyUsContent.subtitle}
                            </span>
                        </h3>
                        <p className="text-sm sm:text-base md:text-lg xl:text-xl text-muted-foreground/80 max-w-xl leading-relaxed mx-auto lg:mx-0">
                            {whyUsContent.description}
                        </p>
                    </AnimatedDiv>

                    {/* Stats Grid */}
                    <AnimatedDiv 
                        initial={{ opacity: 0, scale: 0.9 }}
                        style={{ willChange: "transform, opacity" }}
                         whileInView={{ opacity: 1, scale: 1 }}
                         viewport={{ once: true, margin: "-80px" }}
                         transition={{ duration: 0.5 }}
                        className="grid grid-cols-2 gap-4"
                    >
                             <Card className="bg-white/5 border-white/10 backdrop-blur-sm text-center">
                            <CardContent className="p-5 sm:p-6 xl:p-8">
                                <h4 className="text-2xl sm:text-3xl md:text-4xl xl:text-5xl font-bold text-white mb-1">{stats[0]?.value}</h4>
                                <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground tracking-wide">{stats[0]?.label}</p>
                            </CardContent>
                             </Card>
                             <Card className="bg-primary/10 border-primary/20 backdrop-blur-sm text-center">
                            <CardContent className="p-5 sm:p-6 xl:p-8">
                                <h4 className="text-2xl sm:text-3xl md:text-4xl xl:text-5xl font-bold text-primary mb-1">{stats[1]?.value}</h4>
                                <p className="text-[10px] sm:text-xs md:text-sm text-primary/80 tracking-wide">{stats[1]?.label}</p>
                            </CardContent>
                             </Card>
                             <Card className="bg-white/5 border-white/10 backdrop-blur-sm text-center col-span-2">
                            <CardContent className="p-5 sm:p-6 xl:p-8">
                                <h4 className="text-2xl sm:text-3xl md:text-4xl xl:text-5xl font-bold text-white mb-1">{stats[2]?.value}</h4>
                                <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground tracking-wide">{stats[2]?.label}</p>
                            </CardContent>
                             </Card>
                    </AnimatedDiv>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature: Feature, index: number) => {
                        const Icon = iconMap[feature.icon] || Users;
                        return (
                            <AnimatedDiv key={index}
                                initial={{ opacity: 0, y: 30 }}
                                style={{ willChange: "transform, opacity" }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-80px" }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ y: -5 }}
                                className="h-full"
                            >
                                <Card className="group relative h-full bg-white/5 border-white/5 hover:border-white/10 overflow-hidden transition-all duration-500">
                                    {/* Hover Gradient */}
                                    <div className={cn(
                                        "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                                        feature.gradient
                                    )} />
                                     
                                    <CardContent className="relative z-10 flex flex-col h-full p-8 md:p-6 lg:p-8">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className={cn(
                                                "w-12 h-12 rounded-xl flex items-center justify-center bg-white/5 group-hover:bg-white/20 transition-colors duration-300 border border-white/5",
                                                feature.color
                                            )}>
                                                <Icon className="w-6 h-6" />
                                            </div>
                                            <Badge variant="secondary" className="bg-white/5 border-white/5 text-xs font-mono text-white/50 group-hover:bg-white/10 group-hover:text-white transition-colors backdrop-blur-md">
                                                {feature.stat} {feature.statLabel}
                                            </Badge>
                                        </div>
                                        
                                        <h4 className="text-xl font-bold text-white mb-3 group-hover:text-white transition-colors">
                                            {feature.title}
                                        </h4>
                                        
                                        <p className="text-muted-foreground text-sm leading-relaxed group-hover:text-white/80 transition-colors">
                                            {feature.description}
                                        </p>
                                    </CardContent>
                                </Card>
                            </AnimatedDiv>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

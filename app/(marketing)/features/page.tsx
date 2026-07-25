import { AnimatedDiv, AnimatedH1, AnimatedH2, AnimatedH3, AnimatedP } from "@/lib/animated";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
    Zap, 
    ShieldCheck, 
    Globe, 
    Code2, 
    Terminal, 
    Layers, 
    Cpu, 
    ArrowRight
} from "lucide-react";

// Icon Map
const iconMap: any = {
    Cpu, Globe, ShieldCheck, Layers, Zap, Terminal, Code2
};

const pageData = {
    header: { badge: "CAPABILITIES", titlePrefix: "Everything You", titleHighlight: "Need", description: "Built for speed, security, and scale — Oftisoft's platform gives you every tool to build, deploy, and grow your digital products." },
    features: [
        { id: "perf", iconName: "Zap", title: "Blazing Performance", description: "Sub-50ms response times, edge caching, and CDN-optimized asset delivery ensure your users get the fastest experience possible.", color: "text-yellow-500" },
        { id: "secure", iconName: "ShieldCheck", title: "Enterprise Security", description: "SOC 2 aligned, OWASP compliant, encrypted at rest and transit. Regular penetration testing and automated vulnerability scanning.", color: "text-green-500" },
        { id: "scale", iconName: "Layers", title: "Infinite Scalability", description: "Auto-scaling microservices architecture that handles 10M+ concurrent users without breaking a sweat. Pay only for what you use.", color: "text-blue-500" },
        { id: "global", iconName: "Globe", title: "Global Reach", description: "Deploy across 30+ regions worldwide. Built-in CDN, multi-region database replication, and intelligent traffic routing.", color: "text-cyan-500" },
        { id: "devops", iconName: "Terminal", title: "Automated DevOps", description: "CI/CD pipelines, infrastructure-as-code, blue-green deployments, and automated rollbacks. Ship 50x per day with confidence.", color: "text-purple-500" },
        { id: "analytics", iconName: "Cpu", title: "Built-in Analytics", description: "Real-time dashboards, user behavior tracking, A/B testing, and AI-powered insights — all included out of the box.", color: "text-orange-500" },
    ],
    showcase: { title: "Enterprise-Grade Infrastructure", description: "Monitor, manage, and optimize your entire stack from a single control panel.", badgeText: "SYSTEM ONLINE", statusText: "All systems operational. 99.99% uptime over the last 90 days." }
};

export default function FeaturesPage() {
    const { header, features, showcase } = pageData;
    return (
        <div className="relative min-h-screen pt-32 pb-24 bg-[#020202]">
            {/* Background Orbs */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[10%] left-[10%] w-[60vw] h-[60vw] bg-primary/5 rounded-full blur-[140px]" />
                <div className="absolute bottom-[10%] right-[10%] w-[50vw] h-[50vw] bg-purple-500/5 rounded-full blur-[120px]" />
            </div>

            <div className="container px-6 mx-auto relative z-10 space-y-24">
                {/* Hero section */}
                <div className="text-center space-y-6 max-w-4xl mx-auto">
                    <AnimatedDiv initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <Badge variant="outline" className="px-6 py-2 rounded-full border-primary/20 bg-primary/5 text-primary font-semibold tracking-[0.3em] text-xs">
                            {header?.badge ?? ""}
                        </Badge>
                    </AnimatedDiv>
                    <AnimatedH1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-semibold tracking-tighter text-white"
                    >
                        {header?.titlePrefix ?? ""} <span className="text-primary underline decoration-white/10 decoration-8 underline-offset-8">{header?.titleHighlight ?? ""}</span>.
                    </AnimatedH1>
                    <AnimatedP 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-xl text-muted-foreground font-medium leading-relaxed"
                    >
                        {header?.description ?? ""}
                    </AnimatedP>
                </div>

                {/* Grid */}
                <div className="grid md:grid-cols-2 gap-8">
                    {features.map((feature, idx) => {
                        const Icon = iconMap[feature.iconName ?? ''] || Zap;
                        return (
                        <AnimatedDiv key={feature.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            style={{ willChange: "transform, opacity" }}
                        >
                            <Card className="group h-full border-white/5 bg-white/[0.02] backdrop-blur-2xl rounded-[40px] overflow-hidden hover:border-primary/30 hover:bg-white/[0.04] transition-all duration-700">
                                <CardContent className="p-8 sm:p-10 md:p-14 flex flex-col items-center md:items-start text-center md:text-left space-y-8">
                                    <div className={cn("w-20 h-20 rounded-3xl bg-muted/30 flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-6", feature.color)}>
                                        <Icon size={40} />
                                    </div>
                                    <div className="space-y-4">
                                        <h3 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">{feature.title}</h3>
                                        <p className="text-sm sm:text-base md:text-lg text-muted-foreground font-medium leading-relaxed">
                                            {feature.description}
                                        </p>
                                    </div>
                                    <Button variant="ghost" className="h-10 p-0 text-primary font-semibold tracking-widest text-xs hover:bg-transparent group/btn" asChild>
                                        <Link href="/docs">
                                            Analyze Documentation <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-2 transition-transform" />
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        </AnimatedDiv>
                    );})}
                </div>

                {/* Visual Showcase (Mock) */}
                <AnimatedDiv initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.5 }}
                    style={{ willChange: "transform, opacity" }}
                    className="p-1 underline-offset-8 mt-24"
                >
                    <Card className="border-primary/20 bg-gradient-to-br from-primary/10 via-background to-background rounded-[50px] overflow-hidden">
                        <CardHeader className="p-12 md:p-16 border-b border-white/5 text-center md:text-left">
                                    <h2 className="text-4xl md:text-6xl font-semibold tracking-tighter text-white">{showcase?.title ?? ""}</h2>
                                    <p className="text-muted-foreground mt-4 text-xl">{showcase?.description ?? ""}</p>
                                </CardHeader>
                                <CardContent className="p-0 bg-[#050505]">
                                    <div className="h-[300px] sm:h-[400px] md:h-[500px] flex items-center justify-center relative">
                                        <Terminal className="w-64 h-64 text-primary opacity-5 animate-pulse" />
                                        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#020202] to-transparent z-10" />
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 space-y-4 text-center z-20">
                                            <Badge className="bg-primary text-white font-semibold px-4 py-1">{showcase?.badgeText ?? ""}</Badge>
                                            <p className="font-mono text-xs text-primary/40">{showcase?.statusText ?? ""}</p>
                                        </div>
                                    </div>
                        </CardContent>
                    </Card>
                </AnimatedDiv>
            </div>
        </div>
    );
}

import Link from "next/link";
import { cn } from "@/lib/utils";


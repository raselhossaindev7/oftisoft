"use client"
import { AnimatedDiv, AnimatedSpan, AnimatedH2, AnimatedH3, AnimatedP, useScrollProgress, useTransform } from "@/lib/animated";

import { useRef } from "react";
import { 
    Cpu, 
    Layers, 
    Zap, 
    Shield, 
    Network, 
    Framer, 
    Globe, 
    Database
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const capabilities = [
    {
        id: "infra",
        title: "Neural Infrastructure",
        badge: "Layer 01",
        description: "A decentralized backbone built for zero-latency cognitive processing and high-availability systems.",
        icon: Globe,
        color: "from-blue-500 to-cyan-400",
        stats: ["48+ Global Hubs", "0.2ms Latency", "99.99% Uptime"],
        features: ["Edge Computing", "Traffic Sharding", "Quantum-Safe Encryption"]
    },
    {
        id: "design",
        title: "Fidelity Design",
        badge: "Layer 02",
        description: "Beyond aesthetics. We engineer visual languages that represent complex systemic logic with clarity.",
        icon: Framer,
        color: "from-purple-500 to-pink-500",
        stats: ["High-Fidelity", "8K Assets", "Neural Motion"],
        features: ["Glassmorphism 2.0", "Micro-Interactions", "Physical Lighting"]
    },
    {
        id: "dev",
        title: "Autonomous Dev",
        badge: "Layer 03",
        description: "Self-healing codebases and AI-augmented development cycles that compress months into days.",
        icon: Zap,
        color: "from-amber-400 to-orange-500",
        stats: ["AI Assisted", "Zero Debt", "Hyper-Scale"],
        features: ["Auto-Scaling", "CD/CI Core", "Predictive Analytics"]
    }
];

export default function CapabilityEngine() {
    const containerRef = useRef<HTMLDivElement>(null);
    const scrollYProgress = useScrollProgress(containerRef);

    const scale = useTransform(scrollYProgress, [0, 0.5], [0.8, 1]);
    const opacity = useTransform(scrollYProgress, [0, 0.3], [0, 1]);

    return (
        <section ref={containerRef} className="py-32 relative overflow-hidden">
            {/* Background Narrative */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-5 pointer-events-none select-none">
                <span className="text-[16vw] font-extrabold tracking-tight text-white leading-none whitespace-nowrap">
                    Engineering Excellence
                </span>
            </div>

            <div className="container px-6 mx-auto relative z-10">
                <div className="text-center space-y-4 mb-24">
                    <AnimatedDiv initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        style={{ willChange: "transform, opacity" }}
                    >
                        <Badge variant="outline" className="px-6 py-2 rounded-full border-primary/30 bg-primary/5 text-primary font-semibold tracking-wide text-xs">
                            Technical Capability Matrix
                        </Badge>
                    </AnimatedDiv>
                    <AnimatedH2 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white"
                        transition={{ duration: 0.5 }}
                        style={{ willChange: "transform, opacity" }}
                    >
                        The Oftisoft <span className="text-primary">Engine</span>.
                    </AnimatedH2>
                    <AnimatedP 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-lg md:text-xl text-muted-foreground font-normal max-w-2xl mx-auto"
                        style={{ willChange: "transform, opacity" }}
                    >
                        Our architecture is built on three fundamental layers of digital sovereignty.
                    </AnimatedP>
                </div>

                <AnimatedDiv 
                    style={{ scale, opacity }}
                    className="grid lg:grid-cols-3 gap-8"
                >
                    {capabilities.map((cap, idx) => (
                        <Card key={cap.id} className="group relative border-white/5 bg-white/[0.02] backdrop-blur-3xl rounded-[40px] overflow-hidden p-1 hover:border-primary/50 transition-all duration-700 shadow-2xl">
                            <div className="relative h-full bg-[#050505] rounded-[36px] p-10 flex flex-col space-y-8">
                                {/* Header */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${cap.color} p-4 flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-500`}>
                                            <cap.icon size={32} />
                                        </div>
                                        <span className="text-xs font-semibold text-primary tracking-wide opacity-60">{cap.badge}</span>
                                    </div>
                                    <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{cap.title}</h3>
                                    <p className="text-muted-foreground font-normal leading-relaxed text-base md:text-lg">
                                        {cap.description}
                                    </p>
                                </div>

                                {/* Stats Breakdown */}
                                <div className="grid grid-cols-1 gap-3">
                                    {cap.stats.map((stat, i) => (
                                        <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                            <span className="text-sm font-medium text-white/80">{stat}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Features List with Hover Detail */}
                                <div className="space-y-4 pt-4 border-t border-white/5 mt-auto relative z-20">
                                    <div className="flex justify-between items-center group/title">
                                        <h4 className="text-sm font-semibold text-primary/70 tracking-wide">Protocol Breakdown</h4>
                                        <div className="h-4 w-4 rounded-full border border-primary/20 flex items-center justify-center text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">?</div>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {cap.features.map((feature, i) => (
                                            <AnimatedSpan 
                                                key={i} 
                                                whileHover={{ scale: 1.05, backgroundColor: "rgba(var(--primary-rgb), 0.2)" }}
                                                className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-sm font-semibold text-primary cursor-default transition-colors"
                                            >
                                                {feature}
                                            </AnimatedSpan>
                                        ))}
                                    </div>
                                </div>

                                {/* Dynamic Background Animation on Group Hover */}
                                <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />
                                
                                <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                    <Zap className="w-8 h-8 text-primary/20 animate-pulse" />
                                </div>

                                {/* Decorative Scanning Line */}
                                <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[36px]">
                                    <AnimatedDiv 
                                        animate={{ y: ['-100%', '200%'] }}
                                        transition={{ duration: 4, repeat: Infinity, ease: "linear", delay: idx * 1.5 }}
                                        className="h-1/2 w-full bg-gradient-to-b from-transparent via-primary/5 to-transparent skew-y-12"
                                    />
                                </div>
                            </div>
                        </Card>
                    ))}
                </AnimatedDiv>
            </div>
        </section>
    );
}






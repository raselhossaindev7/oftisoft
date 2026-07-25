"use client"
import { AnimatedDiv, AnimatedH1, AnimatedH2, AnimatedH3, AnimatedP, useScrollY, useScrollProgress, useTransform, useSpring, useMotionValue } from "@/lib/animated";

import { useRef } from "react";
import { 
    Search, Lightbulb, PenTool, Code, CheckCircle, Rocket, 
    ArrowRight, Zap, Target, RefreshCw, Video, FileText, Code2, 
    ClipboardCheck, HeartPulse, Plus, Save, Trash2, LayoutTemplate, 
    Grid, HelpCircle, Server, Database, Cloud, Brain, Smartphone, 
    Layout, Globe, ShieldCheck, Sparkles, Layers, Crown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const iconMap: any = {
    Search, Lightbulb, PenTool, Code, CheckCircle, Rocket, Zap, Target, RefreshCw,
    Video, FileText, Code2, ClipboardCheck, HeartPulse, Plus, Save, Trash2, 
    LayoutTemplate, Grid, HelpCircle, Server, Database, Cloud, Brain, Smartphone, 
    Layout, Globe, ShieldCheck, Sparkles, Layers, Crown, ArrowRight
};

const processSteps = [
    { id: "discover", iconName: "Search", title: "Discovery", subtitle: "Understanding your vision", description: "We dive deep into your business goals, target audience, and technical requirements. You get a detailed project roadmap and accurate estimate.", gradient: "from-blue-500 to-cyan-500" },
    { id: "design", iconName: "PenTool", title: "Design & Prototype", subtitle: "Bringing ideas to life", description: "Interactive wireframes, high-fidelity mockups, and clickable prototypes. We iterate fast based on your feedback until every pixel is perfect.", gradient: "from-purple-500 to-pink-500" },
    { id: "develop", iconName: "Code", title: "Agile Development", subtitle: "Building in sprints", description: "Our engineers build your product in 2-week sprints with continuous integration. You see working software every Friday. No surprises, just progress.", gradient: "from-green-500 to-teal-500" },
    { id: "test", iconName: "CheckCircle", title: "Testing & QA", subtitle: "Ensuring quality", description: "Automated unit tests, integration tests, performance benchmarks, and manual QA. Every release is production-ready before it reaches your hands.", gradient: "from-orange-500 to-red-500" },
    { id: "deploy", iconName: "Rocket", title: "Deployment", subtitle: "Going live", description: "Blue-green deployments, CDN setup, database migrations, DNS configuration. We handle all the infrastructure so you can focus on launch.", gradient: "from-cyan-500 to-blue-500" },
    { id: "support", iconName: "HeartPulse", title: "Ongoing Support", subtitle: "Long-term partnership", description: "24/7 monitoring, regular updates, security patches, and feature development. We're your engineering partner for the long haul.", gradient: "from-indigo-500 to-violet-500" },
];

export default function ServiceProcess() {
    const containerRef = useRef<HTMLDivElement>(null);
    const scrollYProgress = useScrollProgress(containerRef);

    const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

    return (
        <section ref={containerRef} className="py-20 md:py-32 bg-background relative overflow-hidden">
            {/* Consistent Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

            {/* Ambient Glow */}
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="container px-4 mx-auto relative z-10">
                <div className="text-center mb-16 md:mb-24">
                    <AnimatedDiv 
                        initial={{ opacity: 0, y: 20 }}
                        style={{ willChange: "transform, opacity" }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="mb-6 flex justify-center"
                    >
                         <Badge variant="outline" className="gap-2 px-3 py-1 bg-primary/10 border-primary/20 text-primary hover:bg-primary/20 transition-colors backdrop-blur-sm">
                            <Zap className="w-3.5 h-3.5" />
                            Workflow
                        </Badge>
                    </AnimatedDiv>

                    <AnimatedH2 
                        initial={{ opacity: 0, y: 20 }}
                        style={{ willChange: "transform, opacity" }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold mb-6 tracking-tight"
                    >
                        Our <span className="text-primary">Methodology</span>
                    </AnimatedH2>
                    <AnimatedP 
                        initial={{ opacity: 0, y: 20 }}
                        style={{ willChange: "transform, opacity" }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto"
                    >
                        A systematic approach to delivering excellence, from concept to deployment.
                    </AnimatedP>
                </div>

                <div className="relative max-w-5xl mx-auto">
                    {/* Animated Vertical Line */}
                    <div className="absolute left-[19px] md:left-1/2 top-0 bottom-0 w-1 bg-border/50 rounded-full md:-translate-x-1/2 overflow-hidden">
                        <AnimatedDiv 
                            style={{ height: lineHeight }}
                            className="w-full bg-primary shadow-[0_0_20px_rgba(99,102,241,0.3)]"
                        />
                    </div>

                    <div className="space-y-16 md:space-y-32">
                        {processSteps.map((step: any, index: number) => {
                            const Icon = iconMap[step.iconName] || Lightbulb;
                            const isEven = index % 2 === 0;

                            return (
                                <AnimatedDiv key={step.id}
                                    initial={{ opacity: 0, y: 50 }}
                                    style={{ willChange: "transform, opacity" }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-100px" }}
                                    transition={{ duration: 0.6, delay: index * 0.1 }}
                                    className={cn(
                                        "relative flex flex-col md:flex-row gap-8 md:gap-0 items-start md:items-center pl-16 md:pl-0",
                                        isEven ? "md:flex-row-reverse" : ""
                                    )}
                                >
                                    {/* Timeline Node */}
                                    <div className="absolute left-0 md:left-1/2 top-0 md:top-1/2 w-10 h-10 rounded-full bg-background border-4 border-muted shadow-[0_0_0_4px_rgba(99,102,241,0.05)] z-20 flex items-center justify-center md:-translate-y-1/2 md:-translate-x-1/2 transition-colors duration-500 group-hover:border-primary">
                                        <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                                    </div>

                                    {/* Content Card */}
                                    <div className={cn(
                                        "w-full md:w-[calc(50%-60px)] group",
                                        isEven ? "md:text-left" : "md:text-right"
                                    )}>
                                        <div className={cn(
                                            "bg-card/40 backdrop-blur-md border border-border p-6 md:p-8 rounded-2xl hover:bg-card/60 transition-all duration-300 hover:border-primary/30 group-hover:translate-x-2 shadow-sm",
                                            isEven ? "group-hover:-translate-x-2" : ""
                                        )}>
                                            <div className={cn(
                                                "flex items-center gap-4 mb-4",
                                                isEven ? "flex-row md:flex-row-reverse" : "flex-row md:flex-row-reverse md:justify-end"
                                            )}>
                                                 <span className="text-4xl font-semibold text-muted-foreground/30 group-hover:text-primary/40 transition-colors select-none">0{index + 1}</span>
                                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-sm">
                                                    <Icon className="w-6 h-6" />
                                                </div>
                                            </div>
                                            
                                            <h3 className="text-xl md:text-2xl font-bold mb-3 group-hover:text-primary transition-colors">{step.title}</h3>
                                            <p className="text-muted-foreground leading-relaxed text-sm md:text-base">{step.description}</p>
                                        </div>
                                    </div>
                                </AnimatedDiv>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}

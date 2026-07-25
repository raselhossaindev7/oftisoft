"use client"
import { AnimatedDiv, useScrollProgress, useSpring } from "@/lib/animated";

import { useRef } from "react";
import { 
    Search, 
    MessageSquareText, 
    PenTool, 
    Code2, 
    Rocket, 
    BarChart3,
    CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";

const iconMap: Record<string, any> = {
    Search,
    MessageSquareText,
    PenTool,
    Code2,
    Rocket,
    BarChart3,
    CheckCircle2
};

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Step {
    id: string;
    title: string;
    description: string;
    icon: string;
    gradient: string;
}

export default function ProcessTimeline() {
    const processContent: {
        title: string;
        subtitle: string;
        badge: string;
        steps: Step[];
    } = {
        title: "From Concept to",
        subtitle: "Reality.",
        badge: "How We Work",
        steps: [
            { id: "01", title: "Discovery & Strategy", description: "We dive deep into your business goals, target audience, and market landscape to craft a winning roadmap.", icon: "Search", gradient: "from-blue-500 to-cyan-500" },
            { id: "02", title: "UX Architecture", description: "We design intuitive user flows, wireframes, and interactive prototypes that align with your brand vision.", icon: "PenTool", gradient: "from-purple-500 to-pink-500" },
            { id: "03", title: "Agile Development", description: "Our engineers build your product in iterative sprints with continuous integration and transparent progress.", icon: "Code2", gradient: "from-green-500 to-teal-500" },
            { id: "04", title: "Testing & QA", description: "Rigorous automated and manual testing ensures your product is robust, secure, and production-ready.", icon: "BarChart3", gradient: "from-orange-500 to-red-500" },
            { id: "05", title: "Deployment & Launch", description: "We handle the entire deployment pipeline — CI/CD, cloud infrastructure, monitoring, and go-live support.", icon: "Rocket", gradient: "from-cyan-500 to-blue-500" },
            { id: "06", title: "Ongoing Support", description: "Post-launch we provide 24/7 monitoring, maintenance, updates, and feature enhancements as you scale.", icon: "CheckCircle2", gradient: "from-indigo-500 to-violet-500" },
        ]
    };

    const containerRef = useRef<HTMLDivElement>(null);
    const scrollYProgress = useScrollProgress(containerRef);

    // Smooth filling of the timeline
  const scaleY = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    return (
        <section ref={containerRef} className="py-24 md:py-32 bg-transparent relative overflow-hidden z-10" id="process">
            {/* Background Noise/Texture */}
            <div className="absolute inset-0 bg-grain opacity-[0.03] pointer-events-none mix-blend-overlay" />
            
            <div className="container px-4 mx-auto">
                <div className="text-center mb-16 md:mb-24 max-w-3xl mx-auto">
                     <AnimatedDiv initial={{ opacity: 0, y: 20 }}
                        style={{ willChange: "transform, opacity" }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-80px" }}
                        transition={{ duration: 0.5 }}
                    >
                        <Badge variant="outline" className="mb-4 border-primary/20 text-primary tracking-widest px-3 py-1 text-xs">
                            {processContent.badge}
                        </Badge>
                        <h3 className="type-h1 text-white mb-6">
                            {processContent.title} <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                                {processContent.subtitle}
                            </span>
                        </h3>
                    </AnimatedDiv>
                </div>

                {/* Vertical Timeline Container */}
                <div className="relative mx-auto">
                    
                    {/* Central Track Line (Desktop) / Left Line (Mobile) */}
                    <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-[2px] bg-white/5 -translate-x-1/2">
                        <div
                            className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-primary via-purple-500 to-secondary will-change-transform"
                            style={{ transform: `scaleY(${scaleY})`, transformOrigin: "top" }}
                        />
                    </div>

                    <div className="space-y-8 md:space-y-24">
                        {processContent.steps.map((step: Step, index: number) => (
                            <TimelineItem 
                                key={step.id} 
                                step={step} 
                                index={index} 
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

function TimelineItem({ step, index }: { step: Step, index: number }) {
    const isEven = index % 2 === 0;
    
    return (
        <AnimatedDiv 
            initial={{ opacity: 0, y: 50 }}
            style={{ willChange: "transform, opacity" }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className={cn(
                "relative flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-0",
                isEven ? "md:flex-row" : "md:flex-row-reverse"
            )}
        >
            {/* Content Card */}
            <div className="w-full md:w-1/2 pl-12 md:pl-0 md:px-8 lg:px-12 xl:px-16">
                 <Card className="group relative bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/10 overflow-hidden backdrop-blur-sm transition-all duration-300">
                    <CardContent className="p-6 md:p-8">
                        {/* Glow Effect */}
                        <div className={cn(
                            "absolute -right-20 -top-20 w-64 h-64 bg-gradient-to-br opacity-10 blur-[80px] group-hover:opacity-30 transition-opacity duration-500",
                            step.gradient
                        )} />
                        
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <div className={cn(
                                "w-12 h-12 rounded-2xl flex items-center justify-center bg-white/5 border border-white/10 group-hover:scale-110 group-hover:bg-white/10 transition-transform duration-300",
                            )}>
                                {(() => {
                                    const Icon = iconMap[step.icon] || Search;
                                    return <Icon className="w-5 h-5 text-white" />;
                                })()}
                            </div>
                            <span className="text-4xl font-bold text-white/5 font-mono group-hover:text-white/10 transition-colors select-none">
                                {step.id}
                            </span>
                        </div>

                        <h4 className="type-h3 text-white mb-3 group-hover:text-primary transition-colors duration-300 relative z-10">
                            {step.title}
                        </h4>
                        <p className="type-body-sm text-muted-foreground relative z-10">
                            {step.description}
                        </p>
                    </CardContent>
                 </Card>
            </div>

            {/* Central Node */}
            <div className="absolute left-4 md:left-1/2 -translate-x-1/2 flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-[#030712] border-2 border-white/20 z-10 shadow-[0_0_0_4px_#030712]">
                    <AnimatedDiv 
                        initial={{ scale: 0 }}
                        style={{ willChange: "transform, opacity" }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true, margin: "-80px" }}
                        transition={{ delay: 0.1 }}
                        className="w-full h-full rounded-full bg-primary"
                    />
                </div>
            </div>

            {/* Empty Space for alignment */}
            <div className="hidden md:block w-1/2" />
        </AnimatedDiv>
    );
}

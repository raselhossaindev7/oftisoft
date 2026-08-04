"use client"
import { AnimatedDiv, useScrollProgress, useSpring } from "@/lib/animated";
import { useRef } from "react";
import {
    Clock, Zap, Award, Globe, Users, Rocket, Briefcase, Building2, Code2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const iconMap: Record<string, React.ComponentType<{ className?: string; size?: number }>> = {
    Building2, Briefcase, Globe, Zap, Rocket, Clock, Award, Code2, Users
};

export default function CompanyTimeline({ data }: { data?: any }) {
    const content = data;
    const timelineData = data?.timeline || [];

    const containerRef = useRef<HTMLDivElement>(null);
    const scrollYProgress = useScrollProgress(containerRef);
    const scaleY = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

    return (
        <section className="py-24 bg-transparent relative overflow-hidden" ref={containerRef}>
            <div className="container px-4 mx-auto">
                <div className="text-center mb-24 max-w-2xl mx-auto">
                    <AnimatedDiv
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <Badge
                            variant="outline"
                            className="mb-6 border-primary/20 text-primary tracking-wide font-semibold px-5 py-2 bg-primary/5 rounded-full text-xs"
                        >
                            {content?.timelineBadge ?? ""}
                        </Badge>
                        <h3 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                            {content?.timelineTitle ?? ""}{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                                {content?.timelineTitleHighlight ?? ""}
                            </span>
                        </h3>
                    </AnimatedDiv>
                </div>

                <div className="relative max-w-5xl mx-auto">
                    <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-[2px] bg-white/5 -translate-x-1/2">
                        <div
                            className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-primary via-purple-500 to-secondary will-change-transform"
                            style={{ transform: `scaleY(${scaleY})`, transformOrigin: "top" }}
                        />
                    </div>

                    <div className="space-y-12 md:space-y-28">
                        {timelineData.map((item: any, index: number) => (
                            <TimelineEvent key={index} item={item} index={index} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

function TimelineEvent({ item, index }: { item: any, index: number }) {
    const isEven = index % 2 === 0;
    const Icon = iconMap[item.icon] || Rocket;

    return (
        <AnimatedDiv
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className={cn(
                "relative flex flex-col md:flex-row items-start md:items-center gap-8 md:gap-0",
                isEven ? "md:flex-row" : "md:flex-row-reverse"
            )}
        >
            <div className={cn(
                "w-full md:w-1/2 pl-20 md:pl-0",
                isEven ? "md:text-right md:pr-16" : "md:text-left md:pl-16"
            )}>
                <Card className="group relative bg-white/[0.03] border-white/[0.06] hover:border-primary/20 overflow-hidden transition-all duration-500 backdrop-blur-sm">
                    <div className={cn(
                        "absolute top-0 w-[3px] h-full bg-gradient-to-b opacity-60 group-hover:opacity-100 transition-opacity duration-500",
                        isEven ? "right-0" : "left-0",
                        item.gradient
                    )} />

                    <CardContent className="p-7 md:p-8">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.06] mb-4">
                            <span className={cn("w-1.5 h-1.5 rounded-full bg-gradient-to-br", item.gradient)} />
                            <span className="text-xs font-bold tracking-wider text-primary/80">{item.year}</span>
                        </div>

                        <h4 className="text-xl md:text-2xl font-bold text-white mb-3 group-hover:text-primary transition-colors duration-300">
                            {item.title}
                        </h4>
                        <p className="text-sm md:text-base text-muted-foreground/80 leading-relaxed">
                            {item.desc}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="absolute left-8 md:left-1/2 -translate-x-1/2 flex items-center justify-center">
                <div className="relative">
                    <div className={cn(
                        "absolute inset-0 rounded-full opacity-0 group-hover:opacity-40 animate-ping bg-gradient-to-br",
                        item.gradient
                    )} style={{ animationDuration: "2s" }} />
                    <div className={cn(
                        "w-14 h-14 rounded-full bg-gradient-to-br border-2 border-white/[0.08] flex items-center justify-center relative transition-all duration-300 group-hover:scale-110 group-hover:border-white/30 shadow-[0_0_0_6px_rgba(0,0,0,0.4)]",
                        item.gradient
                    )}>
                        <div className="absolute inset-0 rounded-full bg-[#0a0a0a] m-[2px]" />
                        <Icon className="w-5 h-5 text-white relative z-10" />
                    </div>
                </div>
            </div>

            <div className="hidden md:block w-1/2" />
        </AnimatedDiv>
    );
}

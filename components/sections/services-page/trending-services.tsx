"use client"
import { useRef } from "react";
import { AnimatedDiv, AnimatedSpan } from "@/lib/animated";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, Zap, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { ServiceOfferCard } from "./service-offer-card";
import type { ServiceOffer } from "@/lib/store/services-content";

interface TrendingServicesProps {
    offers: ServiceOffer[];
}

export default function TrendingServices({ offers }: TrendingServicesProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const trending = offers.filter(o => o.trending);

    const scroll = (direction: "left" | "right") => {
        if (scrollRef.current) {
            const amount = 340;
            scrollRef.current.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
        }
    };

    if (trending.length === 0) return null;

    return (
        <section className="py-16 md:py-24 bg-background relative overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="container px-4 mx-auto relative z-10">
                {/* Header */}
                <div className="flex items-end justify-between mb-8">
                    <div className="space-y-4">
                        <AnimatedDiv
                            initial={{ opacity: 0, y: 20 }}
                            style={{ willChange: "transform, opacity" }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                        >
                            <Badge variant="outline" className="gap-1.5 px-3 py-1 bg-orange-500/10 border-orange-500/20 text-orange-500 hover:bg-orange-500/20 backdrop-blur-sm">
                                <Flame className="w-3.5 h-3.5" />
                                Trending Now
                            </Badge>
                        </AnimatedDiv>

                        <AnimatedDiv
                            initial={{ opacity: 0, y: 20 }}
                            style={{ willChange: "transform, opacity" }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                        >
                            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight">
                                Trending <span className="text-orange-500">Services</span>
                            </h2>
                            <p className="text-muted-foreground text-base max-w-xl mt-2">
                                Most popular programming services being ordered right now
                            </p>
                        </AnimatedDiv>
                    </div>

                    {/* Scroll Buttons */}
                    <div className="hidden md:flex items-center gap-2">
                        <button onClick={() => scroll("left")} className="w-10 h-10 rounded-full border border-border bg-background/80 backdrop-blur-md flex items-center justify-center hover:bg-primary hover:text-white transition-all hover:scale-105">
                            <ArrowRight className="w-4 h-4 rotate-180" />
                        </button>
                        <button onClick={() => scroll("right")} className="w-10 h-10 rounded-full border border-border bg-background/80 backdrop-blur-md flex items-center justify-center hover:bg-primary hover:text-white transition-all hover:scale-105">
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Horizontal Scrollable Row */}
                <div ref={scrollRef} className="flex gap-5 overflow-x-auto pb-4 no-scrollbar snap-x snap-mandatory -mx-4 px-4 scroll-smooth">
                    {trending.map((offer, i) => (
                        <div key={offer.id} className="snap-start shrink-0 w-[320px] md:w-[340px]">
                            <ServiceOfferCard offer={offer} index={i} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

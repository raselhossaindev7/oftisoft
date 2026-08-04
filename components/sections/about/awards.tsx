"use client"
import { AnimatedDiv, AnimatedH2, AnimatedP } from "@/lib/animated";

import { useState, useRef, useEffect } from "react";
import { Award, Star, Trophy, BadgeCheck, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCards, Autoplay, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/effect-cards";
import "swiper/css/pagination";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const partners = [
    { name: "Google Cloud Partner", icon: Zap },
    { name: "AWS Certified", icon: BadgeCheck },
    { name: "Meta Developers", icon: Star },
    { name: "Vercel Enterprise", icon: Trophy }
];

export default function Awards({ data }: { data?: any }) {
    const awards = data?.awards || [];
    const content = data;
    
    const [activeCard, setActiveCard] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const isHoveredRef = useRef(false);

    // Auto-cycle for Desktop Stack — pauses on hover
    useEffect(() => {
        if (!awards.length) return;
        const interval = setInterval(() => {
            if (!isHoveredRef.current) {
                setActiveCard((prev) => (prev + 1) % awards.length);
            }
        }, 4000);
        return () => clearInterval(interval);
    }, [awards.length]);

    return (
        <section ref={containerRef} className="py-24 md:py-32 bg-transparent relative overflow-hidden">
             {/* Dynamic Background */}
             <div className="absolute top-1/2 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 pointer-events-none" />

            <div className="container px-4 mx-auto">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
                    
                    {/* Left Content */}
                    <div className="relative z-10 w-full">
                        <AnimatedDiv initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }} transition={{ duration: 0.5 }}>
                            <Badge variant="outline" className="gap-2 px-3 py-1.5 rounded-full bg-white/5 border-white/10 text-xs font-medium text-primary mb-6 hover:bg-white/10 transition-colors">
                                <Trophy className="w-3 h-3 fill-current" />
                                {content?.awardsBadge ?? ""}
                            </Badge>
                        </AnimatedDiv>

                        <AnimatedH2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}
                            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                            {content?.awardsTitle ?? ""} <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                                {content?.awardsTitleHighlight ?? ""}
                            </span>
                        </AnimatedH2>

                        <AnimatedP initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }}
                            className="text-lg text-muted-foreground/80 mb-10 max-w-lg leading-relaxed">
                            {content?.awardsDescription ?? ""}
                        </AnimatedP>

                        {/* Partners Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {partners.map((partner, idx) => (
                                <AnimatedDiv key={idx} initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: 0.3 + (idx * 0.1) }}
                                    whileHover={{ scale: 1.02 }}>
                                    <Card className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/10 transition-all cursor-default group h-full">
                                        <div className="p-2 rounded-lg bg-white/5 text-white/60 group-hover:text-primary transition-colors">
                                            <partner.icon className="w-4 h-4" />
                                        </div>
                                        <span className="text-sm font-semibold text-white/80 group-hover:text-white transition-colors">{partner.name}</span>
                                    </Card>
                                </AnimatedDiv>
                            ))}
                        </div>
                    </div>

                    {/* Right Side: Responsive Logic */}
                    <div className="w-full relative">
                        
                        {/* 1. Mobile & Tablet: Swiper Carousel */}
                        <div className="block lg:hidden w-full max-w-[320px] mx-auto">
                            <Swiper effect={'cards'}
                                grabCursor={true}
                                modules={[EffectCards, Autoplay, Pagination]}
                                autoplay={{ delay: 3000, disableOnInteraction: false, pauseOnMouseEnter: true }}
                                pagination={{ clickable: true, dynamicBullets: true }}
                                className="w-full aspect-[3/4]"
                            >
                                {awards.map((award: any) => (
                                    <SwiperSlide key={award.id} className="rounded-[2rem]">
                                        <AwardCard award={award} />
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                        </div>

                        {/* 2. Desktop: Custom 3D Stack */}
                        <div className="hidden lg:flex h-[500px] w-full items-center justify-end perspective-1000 relative"
                            onMouseEnter={() => { isHoveredRef.current = true; }}
                            onMouseLeave={() => { isHoveredRef.current = false; }}
                        >
                            {awards.map((award: any, index: number) => {
                                const isActive = index === activeCard;
                                const offset = (index - activeCard + awards.length) % awards.length;
                                if (offset > 2) return null;
                                
                                return (
                                    <div key={award.id}
                                        className="absolute right-12 w-[350px] transition-all duration-500 ease-out cursor-pointer"
                                        style={{
                                            opacity: isActive ? 1 : 1 - (offset * 0.3),
                                            transform: `translateY(${isActive ? 0 : offset * 10}px) rotateY(${isActive ? 0 : -10}deg) scale(${isActive ? 1 : 1 - (offset * 0.1)})`,
                                            transformStyle: "preserve-3d",
                                            zIndex: awards.length - offset,
                                            transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)"
                                        }}
                                    >
                                        <AwardCard award={award} />
                                    </div>
                                );
                            })}

                            {/* Desktop Custom Nav Dots */}
                            <div className="absolute bottom-10 right-[400px] flex flex-col gap-3">
                                {awards.map((_: any, idx: number) => (
                                    <button key={idx}
                                        onClick={() => setActiveCard(idx)}
                                        className={cn(
                                            "w-1.5 rounded-full transition-all duration-300 bg-white/20 hover:bg-white/60",
                                            idx === activeCard ? "h-8 bg-primary" : "h-1.5"
                                        )}
                                        aria-label={`View award ${idx + 1}`}
                                    />
                                ))}
                            </div>
                        </div>

                    </div>

                </div>
            </div>
        </section>
    );
}

// Reusable Card Component to keep code DRY
function AwardCard({ award }: { award: any }) {
    return (
        <Card className="relative h-full overflow-hidden rounded-[2rem] bg-[#0a0a0a] border-white/10 border shadow-2xl flex flex-col justify-between group p-0">
            {/* Background Image */}
            {award.image && (
                <>
                    <img
                        src={award.image}
                        alt={award.title}
                        className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-50 transition-opacity duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/80 to-[#0a0a0a]/40" />
                </>
            )}

            <CardContent className="h-full flex flex-col justify-between p-8 relative z-10">
                {/* Gradient Background Glow */}
                <div className={cn(
                    "absolute inset-0 opacity-[0.15] bg-gradient-to-br transition-opacity duration-500",
                    award.gradient
                )} />
                
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-8">
                        <div className={cn(
                            "w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br shadow-lg text-white",
                            award.gradient
                        )}>
                            <Award className="w-7 h-7" />
                        </div>
                        <Badge variant="secondary" className="px-3 py-1 bg-white/5 border-white/10 text-white/90 font-mono text-xs font-bold hover:bg-white/10 backdrop-blur-sm">
                            {award.year}
                        </Badge>
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-2 leading-tight">
                        {award.title}
                    </h3>
                    <div className="text-sm font-semibold text-primary tracking-wide mb-4">
                        {award.org}
                    </div>
                    <p className="text-muted-foreground/90 text-base md:text-lg leading-relaxed">
                        {award.description}
                    </p>
                </div>

                {/* Bottom Glow */}
                <div className={cn(
                    "absolute -bottom-10 -right-10 w-40 h-40 rounded-full blur-[60px] opacity-20 pointer-events-none",
                    award.gradient
                )} />
            </CardContent>
        </Card>
    );
}



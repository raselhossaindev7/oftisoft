"use client"
import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { Star, Quote } from "lucide-react";
import { cn } from "@/lib/utils";
import { useHomeContentStore } from "@/lib/store/home-content";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import TrustpilotWidget from "@/components/trustpilot-widget";

interface TestimonialData {
    id?: string;
    name: string;
    role: string;
    quote: string;
    avatar: string;
    gradient: string;
}

const defaultTestimonials: TestimonialData[] = [
    { id: "1", name: "Alex Thompson", role: "CTO, Finova Labs", quote: "Oftisoft transformed our monolithic banking system into a microservices architecture. 99.9% uptime, 60% reduced latency, and their team was a true partner throughout.", avatar: "", gradient: "from-blue-500 to-cyan-500" },
    { id: "2", name: "Sarah Chen", role: "CEO, HealthBridge AI", quote: "The AI-powered diagnostics module they built for us is incredible. Approval workflows automated, accuracy improved by 40%, and their team delivered 2 weeks early.", avatar: "", gradient: "from-purple-500 to-pink-500" },
    { id: "3", name: "Michael Rodriguez", role: "VP Eng, MarketPro", quote: "They built our entire multi-vendor marketplace from scratch. 5,000 vendors onboarded in the first quarter. The automated payout system alone saved us 200 engineering hours monthly.", avatar: "", gradient: "from-green-500 to-teal-500" },
    { id: "4", name: "Priya Sharma", role: "Founder, EduSpark", quote: "Our edtech platform needed to scale from 1,000 to 100,000 concurrent users overnight. Oftisoft's architecture handled it seamlessly. Zero downtime during the transition.", avatar: "", gradient: "from-orange-500 to-red-500" },
    { id: "5", name: "James Wilson", role: "Director, DataSync Inc.", quote: "The real-time data pipeline they engineered processes millions of events daily with sub-50ms latency. Their Kafka and gRPC expertise is world-class.", avatar: "", gradient: "from-indigo-500 to-violet-500" },
    { id: "6", name: "Fatima Al-Rashid", role: "COO, CloudBase", quote: "Professional, responsive, and technically exceptional. Oftisoft handled our HIPAA-compliant infrastructure setup and trained our team on the new stack in under 3 months.", avatar: "", gradient: "from-cyan-500 to-blue-500" },
];

export default function Testimonials() {
    const sectionRef = useRef<HTMLElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);
    const marqueeRef = useRef<HTMLDivElement>(null);

    const { content } = useHomeContentStore();
    const testimonialsContent = content?.testimonials || {
        title: "Voices of",
        subtitle: "Innovation.",
        badge: "Trusted by Market Leaders",
        testimonials: defaultTestimonials
    };

    const testimonialsList: TestimonialData[] = Array.isArray(testimonialsContent.testimonials)
        ? testimonialsContent.testimonials
        : [];

    const loopTestimonials = testimonialsList.length > 0
        ? [...testimonialsList, ...testimonialsList, ...testimonialsList]
        : defaultTestimonials;

    useEffect(() => {
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (reduced) return;

        const ctx = gsap.context(() => {
            if (headerRef.current) {
                gsap.from(headerRef.current, {
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: "top 80%",
                        toggleActions: "play none none none",
                    },
                    y: 30,
                    opacity: 0,
                    duration: 0.6,
                    ease: "power2.out",
                });
            }

            const marquee = marqueeRef.current;
            if (marquee && marquee.children.length > 0) {
                const setWidth = marquee.scrollWidth / 3;

                const tween = gsap.to(marquee, {
                    x: -setWidth,
                    duration: 60,
                    ease: "none",
                    repeat: -1,
                });

                const handleEnter = () => gsap.to(tween, { timeScale: 0, duration: 0.4, ease: "power2.out" });
                const handleLeave = () => gsap.to(tween, { timeScale: 1, duration: 0.4, ease: "power2.out" });

                marquee.addEventListener("mouseenter", handleEnter);
                marquee.addEventListener("mouseleave", handleLeave);

                const cards = Array.from(marquee.children);
                gsap.from(cards, {
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: "top 80%",
                    },
                    x: 80,
                    opacity: 0,
                    stagger: 0.04,
                    duration: 0.5,
                    ease: "power2.out",
                });

                return () => {
                    marquee.removeEventListener("mouseenter", handleEnter);
                    marquee.removeEventListener("mouseleave", handleLeave);
                };
            }
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} className="py-24 md:py-32 bg-transparent relative overflow-hidden z-10 text-center">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[400px] lg:w-[600px] h-[300px] sm:h-[400px] lg:h-[600px] bg-primary/5 rounded-full blur-[60px] sm:blur-[80px] lg:blur-[100px] pointer-events-none" />

            <div ref={headerRef} className="container px-4 mx-auto mb-16 md:mb-20">
                <Badge variant="outline" className="mb-6 px-4 py-2 border-white/10 bg-white/5 backdrop-blur-md text-white/90 gap-2 hover:bg-white/10 transition-colors text-xs">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    {testimonialsContent.badge}
                </Badge>
                <h2 className="type-h1 text-white mb-6">
                    {testimonialsContent.title} <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                        {testimonialsContent.subtitle}
                    </span>
                </h2>
            </div>

            <div className="relative w-full overflow-hidden mask-gradient-x">
                <div ref={marqueeRef} className="flex items-stretch gap-6 whitespace-nowrap py-10">
                    {loopTestimonials.map((t: TestimonialData, i: number) => (
                        <TestimonialCard key={i} data={t} index={i} />
                    ))}
                </div>
            </div>

            <div className="mt-6 flex justify-center">
                <TrustpilotWidget />
            </div>

            <style jsx global>{`
                .mask-gradient-x {
                    mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
                }
                @media (min-width: 640px) {
                    .mask-gradient-x {
                        mask-image: linear-gradient(to right, transparent, black 20%, black 80%, transparent);
                    }
                }
            `}</style>
        </section>
    );
}

function TestimonialCard({ data, index }: { data: TestimonialData, index: number }) {
    return (
        <div className="w-[280px] sm:w-[320px] md:w-[420px] lg:w-[450px] xl:w-[500px] shrink-0 p-[1px] relative group h-full flex">
            <div className={cn(
                "absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r blur-xl -z-10",
                data.gradient
            )} />

            <Card className="bg-[#050505]/80 backdrop-blur-xl border-white/5 group-hover:bg-[#0a0a0a]/90 transition-colors rounded-3xl overflow-hidden flex flex-col justify-between min-h-[280px] md:min-h-[360px]">
                <CardContent className="p-5 sm:p-6 md:p-8 pb-0 sm:pb-0 md:pb-0">
                    <div className="mb-6">
                        <div className="flex gap-1 mb-4">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className="w-4 h-4 text-yellow-500/50 fill-current group-hover:text-yellow-500 transition-colors" />
                            ))}
                        </div>
                        <p className="type-body-lg text-muted-foreground/90 font-normal whitespace-normal">
                            &ldquo;{data.quote}&rdquo;
                        </p>
                    </div>
                </CardContent>

                <CardFooter className="p-5 sm:p-6 md:p-8 pt-4 sm:pt-5 md:pt-6 border-t border-white/5 mt-auto bg-white/[0.02]">
                    <div className="flex items-center gap-4 w-full">
                        <Avatar className={cn("h-12 w-12 border-2 border-transparent group-hover:border-primary/50 transition-colors", data.gradient.replace("from-", "bg-"))}>
                             <AvatarImage src={data.avatar} alt={data.name} />
                             <AvatarFallback className={cn("text-white font-bold bg-gradient-to-br", data.gradient)}>{data.name.charAt(0)}</AvatarFallback>
                        </Avatar>

                        <div className="text-left flex-1 min-w-0">
                            <h4 className="text-white font-bold type-body-sm tracking-wide truncate">{data.name}</h4>
                            <p className="text-caption text-muted-foreground font-medium tracking-wide truncate">{data.role}</p>
                        </div>

                        <Quote className="w-8 h-8 text-white/5 ml-auto group-hover:text-white/10 transition-colors shrink-0" />
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}

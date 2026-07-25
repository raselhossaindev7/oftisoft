"use client"
import { AnimatedDiv, AnimatedH1, AnimatedH2, AnimatedP, useScrollProgress } from "@/lib/animated";

import { useState, useEffect, useRef, use } from "react";
import Link from "next/link";
import { 
    ArrowLeft, ArrowRight, CheckCircle2, Zap, Layout, Layers, Box, Globe, 
    Code, Cpu, Server, Smartphone, Shield, Database, Sparkles, Code2, 
    ClipboardCheck, Rocket, HeartPulse, ShieldCheck, Plus, Save, Trash2, 
    LayoutTemplate, Grid, HelpCircle, Crown, Cloud
} from "lucide-react";
import CTA from "@/components/sections/cta";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// Swiper
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay, EffectCreative } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-creative";

import { cn } from "@/lib/utils";
import { useServicesContentStore } from "@/lib/store/services-content";
import { useServicesContent } from "@/hooks/useServicesContent";
import ServicePackages from "@/components/sections/services-page/service-packages";
import ServiceOfferDetail from "@/components/sections/services-page/service-offer-detail";

// Icon mapping matching the CMS
const iconMap: any = {
    Plus, Save, Trash2, LayoutTemplate, Grid, HelpCircle, Server, Database, Cloud, 
    Brain: Cpu, Smartphone, Layout, Video: Code, FileText: Box, Code2, 
    ClipboardCheck, Rocket, HeartPulse, Globe, Zap, Code, ShieldCheck, 
    Sparkles, Layers, Crown, ArrowRight, Box, Cpu, CheckCircle2
};

export default function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const { content } = useServicesContentStore();
    useServicesContent();

    const containerRef = useRef<HTMLDivElement>(null);
    const scrollYProgress = useScrollProgress(containerRef);
    const [activeProcessIndex, setActiveProcessIndex] = useState(0);

    // Service offer detail route (IDs starting with "svc-")
    if (slug.startsWith("svc-")) {
        const offer = content?.offers.find(o => o.id === slug);
        if (!offer) {
            return (
                <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
                    <h1 className="text-4xl font-bold mb-4">Service Not Found</h1>
                    <p className="text-muted-foreground mb-8">The service you're looking for doesn't exist or has been moved.</p>
                    <Button asChild>
                        <Link href="/services">Back to Services</Link>
                    </Button>
                </div>
            );
        }
        return <ServiceOfferDetail offer={offer} />;
    }

    const service = content?.overview.find(s => s.id === slug);
    const globalProcess = content?.process || [];

    // Handle 404
  if (!service) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
                <h1 className="text-4xl font-bold mb-4">Service Not Found</h1>
                <p className="text-muted-foreground mb-8">The service you're looking for doesn't exist or has been moved.</p>
                <Button asChild>
                    <Link href="/services">Back to Services</Link>
                </Button>
            </div>
        );
    }

    return (
        <main ref={containerRef} className="min-h-screen relative overflow-hidden">
            {/* Scroll Progress Bar */}
            <AnimatedDiv 
                className="fixed top-0 left-0 right-0 h-1 bg-primary z-[60] origin-left"
                style={{ transform: `scaleX(${scrollYProgress})` }}
            />
            
            {/* Top Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 p-6 flex justify-between items-center pointer-events-none">
                <Link 
                    href="/services"
                    className="pointer-events-auto w-12 h-12 rounded-full bg-background/80 backdrop-blur-md border border-border flex items-center justify-center hover:bg-muted transition-all group shadow-lg"
                >
                    <ArrowLeft className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                </Link>

            </nav>

            {/* Premium Hero Section */}
            <section className="relative min-h-[90vh] flex items-center justify-center pt-32 pb-20 overflow-hidden">
                
                {/* Background: Subtle Grid & Ambient Light */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] bg-primary/5 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow" />
                </div>

                <div className="container px-4 mx-auto relative z-10">
                    <div className="flex flex-col items-center text-center max-w-5xl mx-auto">
                        
                        {/* Eyebrow Label */}
                        <AnimatedDiv 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-background/50 backdrop-blur-md border border-white/10 text-primary text-sm font-bold tracking-widest shadow-[0_0_20px_-5px_rgba(var(--primary-rgb),0.3)] mb-8 hover:bg-white/5 transition-colors cursor-default"
                        >
                            <Sparkles className="w-4 h-4" />
                            <span>Premium Solution</span>
                        </AnimatedDiv>

                        {/* Visual Icon Representation */}
                        <AnimatedDiv initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.1, type: "spring" }}
                            className="mb-8 relative"
                        >
                            <div className="w-24 h-24 md:w-32 md:h-32 rounded-[2rem] bg-gradient-to-br from-background to-card border border-white/10 flex items-center justify-center shadow-2xl relative z-10 group">
                                {(() => {
                                    const Icon = iconMap[service.iconName] || Globe;
                                    return <Icon className="w-12 h-12 md:w-16 md:h-16 text-primary drop-shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)] group-hover:scale-110 transition-transform duration-300" />;
                                })()}
                            </div>
                            {/* Glow Behind Icon */}
                            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-150 z-0 animate-pulse-slow" />
                        </AnimatedDiv>
                        
                        {/* Main Title */}
                        <AnimatedH1 
                            className="text-4xl sm:text-5xl md:text-8xl lg:text-9xl font-bold tracking-tighter mb-8 leading-[0.85]"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                        >
                            <span className="bg-clip-text text-transparent bg-gradient-to-b from-foreground via-foreground to-foreground/50">
                                {service.title}
                            </span>
                        </AnimatedH1>

                        {/* Subtitle */}
                        {service.subtitle && (
                            <AnimatedH2 
                                className="text-2xl md:text-3xl font-light mb-8 text-foreground/80 tracking-tight max-w-3xl"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.3 }}
                            >
                                {service.subtitle}
                            </AnimatedH2>
                        )}

                        {/* Description */}
                        <AnimatedP 
                            className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-12 max-w-2xl mx-auto"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                        >
                            {service.description}
                        </AnimatedP>

                        {/* CTAs */}
                        <AnimatedDiv 
                            className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.5 }}
                        >
                            <Button asChild size="lg" className="rounded-full h-14 px-8 text-lg font-bold shadow-[0_0_30px_-5px_rgba(var(--primary-rgb),0.4)] hover:shadow-[0_0_40px_-5px_rgba(var(--primary-rgb),0.6)] hover:scale-105 transition-all duration-300 bg-primary text-primary-foreground group w-full sm:w-auto">
                                <Link href="/contact" className="flex items-center gap-2">
                                    Start Your Project
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </Button>
                            
                            <Button asChild variant="outline" size="lg" className="rounded-full h-14 px-8 text-lg font-bold border-white/10 hover:bg-white/5 hover:text-foreground backdrop-blur-sm w-full sm:w-auto transition-all hover:border-primary/50">
                                <Link href="/portfolio" className="flex items-center gap-2">
                                    View Past Work
                                </Link>
                            </Button>
                        </AnimatedDiv>

                        {/* Floating Tech Badges (Decorative) */}
                         <div className="absolute top-1/2 left-0 -translate-y-1/2 hidden xl:flex flex-col gap-4 opacity-50 pointer-events-none">
                            {[1,2,3].map((_, i) => (
                                <AnimatedDiv 
                                    key={i}
                                    initial={{ x: -50, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.8 + (i * 0.1) }}
                                    className="w-12 h-1 bg-gradient-to-r from-primary/50 to-transparent rounded-full"
                                />
                            ))}
                        </div>
                         <div className="absolute top-1/2 right-0 -translate-y-1/2 hidden xl:flex flex-col gap-4 items-end opacity-50 pointer-events-none">
                            {[1,2,3].map((_, i) => (
                                <AnimatedDiv 
                                    key={i}
                                    initial={{ x: 50, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.8 + (i * 0.1) }}
                                    className="w-12 h-1 bg-gradient-to-l from-primary/50 to-transparent rounded-full"
                                />
                            ))}
                        </div>

                    </div>
                </div>
            </section>

            {/* Features BENTO GRID */}
            <section className="py-24 relative z-10">
                <div className="container px-4 mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {service.features.map((feature, i) => {
                            const FeatureIcon = iconMap[feature.iconName] || Zap;
                            return (
                                <AnimatedDiv 
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    style={{ willChange: "transform, opacity" }}
                                    whileHover={{ y: -5 }}
                                    className={cn(
                                        "p-8 rounded-[2rem] bg-card/50 backdrop-blur-md border border-border/50 hover:border-primary/30 transition-all hover:shadow-2xl hover:shadow-primary/5 group",
                                        i % 3 === 0 ? "lg:col-span-2" : "lg:col-span-1"
                                    )}
                                >
                                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all group-hover:scale-110 shadow-lg bg-muted")}>
                                        <FeatureIcon className={cn("w-7 h-7 text-primary")} />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                                    <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                                </AnimatedDiv>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Methodology (Sticky Scroll Layout) */}
            <section className="py-24 md:py-32 relative overflow-hidden">
                <div className="container px-4 mx-auto">
                    <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
                        
                        {/* Left: Sticky Info Panel (Desktop) */}
                        <div className="hidden lg:block w-1/3 relative">
                            <div className="sticky top-32 space-y-8">
                                <AnimatedDiv 
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5 }}
                                    style={{ willChange: "transform, opacity" }}
                                >
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-wider mb-6">
                                        <Layers className="w-3.5 h-3.5" />
                                        <span>Our Process</span>
                                    </div>
                                    <h2 className="text-4xl md:text-5xl font-semibold mb-6 tracking-tight leading-tight">
                                        Methodology &<br/>Execution
                                    </h2>
                                    <p className="text-lg text-muted-foreground leading-relaxed">
                                        We follow a precise, transparent workflow to ensure every project is delivered to perfection.
                                    </p>
                                </AnimatedDiv>

                                <div className="relative aspect-square w-full max-w-sm mx-auto rounded-[2rem] bg-gradient-to-br from-card to-background border border-border/50 shadow-2xl overflow-hidden flex items-center justify-center p-8 group">
                                     <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:20px_20px]" />
                                     <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50" />
                                     
                                     <AnimatedDiv key={activeProcessIndex}
                                        initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                        transition={{ duration: 0.5 }}
                                        className="relative z-10 flex flex-col items-center justify-center gap-6"
                                     >
                                            {(() => {
                                                const step = globalProcess[activeProcessIndex];
                                                const Icon = step ? (iconMap[step.iconName] || Zap) : Zap;
                                                return (
                                                    <>
                                                        <div className="w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-lg shadow-primary/20 ring-1 ring-primary/20 backdrop-blur-sm">
                                                            <Icon className="w-12 h-12" />
                                                        </div>
                                                        <div className="text-center">
                                                            <h3 className="text-2xl font-bold mb-2">{step?.title}</h3>
                                                            <div className="px-3 py-1 rounded-full bg-muted border border-border text-xs font-mono text-muted-foreground">
                                                                Step 0{activeProcessIndex + 1}
                                                            </div>
                                                        </div>
                                                    </>
                                                );
                                            })()}
                                         </AnimatedDiv>
                                </div>
                            </div>
                        </div>

                        {/* Top: Mobile Header */}
                        <div className="lg:hidden text-center mb-12">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-wider mb-6">
                                <Layers className="w-3.5 h-3.5" />
                                <span>Our Process</span>
                            </div>
                            <h2 className="text-4xl font-semibold mb-4 tracking-tight">Methodology</h2>
                            <p className="text-muted-foreground">We follow a precise, transparent workflow.</p>
                        </div>

                        {/* Right: Scrolling Steps */}
                        <div className="w-full lg:w-2/3 space-y-24 lg:space-y-40 lg:pt-20 lg:pb-20">
                            {globalProcess.map((step, i) => {
                                const Icon = iconMap[step.iconName] || Zap;
                                const isActive = activeProcessIndex === i;
                                
                                return (
                                    <AnimatedDiv 
                                        key={i}
                                        initial={{ opacity: 0.3 }}
                                        whileInView={{ opacity: 1 }}
                                        viewport={{ margin: "-50% 0px -50% 0px" }}
                                        onViewportEnter={() => setActiveProcessIndex(i)}
                                        className="group relative pl-8 lg:pl-16 border-l-2 border-border/30 hover:border-primary/50 transition-colors duration-500"
                                    >
                                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-background border-2 border-border group-hover:border-primary group-hover:scale-125 transition-all duration-300 shadow-sm" />
                                        
                                        <div className="mb-6 flex items-center gap-4 lg:hidden">
                                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                                <Icon className="w-6 h-6" />
                                            </div>
                                            <span className="text-4xl font-semibold text-muted-foreground/10">0{i + 1}</span>
                                        </div>

                                        <h3 className={cn("text-3xl md:text-5xl font-black mb-6 transition-colors duration-300 leading-tight", isActive ? "text-foreground" : "text-muted-foreground")}>
                                            {step.title}
                                        </h3>
                                        <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl">
                                            {step.desc}
                                        </p>
                                    </AnimatedDiv>
                                );
                            })}
                        </div>

                    </div>
                </div>
            </section>

            {/* Tech Stack Horizontal Scroll */}
            {service.techs && service.techs.length > 0 && (
                <section className="py-24 relative overflow-hidden">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted border border-border text-muted-foreground text-xs font-bold tracking-wider mb-4">
                            <Cpu className="w-3 h-3" />
                            <span>Powered By</span>
                        </div>
                        <h2 className="text-3xl font-bold">Technology Stack</h2>
                    </div>
                    
                    <div className="relative w-full max-w-7xl mx-auto px-4">
                        <Swiper modules={[Autoplay]}
                            spaceBetween={20}
                            slidesPerView={2}
                            breakpoints={{
                                640: { slidesPerView: 3 },
                                1024: { slidesPerView: 6 }
                            }}
                            loop={true}
                            autoplay={{
                                delay: 2000,
                                disableOnInteraction: false,
                            }}
                            className="py-10"
                        >
                            {service.techs.map((tech, i) => {
                                // Comprehensive mappings for Simple Icons
                                const slugMap: Record<string, string> = {
                                    // Frontend
                                    'react': 'react',
                                    'react native': 'react',
                                    'next.js': 'nextdotjs',
                                    'next.js 13': 'nextdotjs',
                                    'next.js 14': 'nextdotjs',
                                    'next.js 15': 'nextdotjs',
                                    'vue.js': 'vuedotjs',
                                    'three.js': 'threedotjs',
                                    'tailwind css': 'tailwindcss',
                                    'framer motion': 'framermotion',
                                    
                                    // Backend
                                    'node.js': 'nodedotjs',
                                    'express.js': 'express',
                                    'express': 'express',
                                    'golang': 'go',
                                    'c#': 'csharp',
                                    'c++': 'cplusplus',
                                    '.net': 'dotnet',
                                    
                                    // Database & Cloud
                                    'aws': 'amazonwebservices',
                                    'google cloud': 'googlecloud',
                                    'github actions': 'githubactions',
                                    'postgresql': 'postgresql',
                                    'mongodb': 'mongodb',
                                    
                                    // AI & Tools
                                    'openai': 'openai',
                                    'openai api': 'openai',
                                    'hugging face': 'huggingface',
                                    'tensorflow': 'tensorflow',
                                    'pytorch': 'pytorch',
                                    'langchain': 'langchain',
                                    'vercel': 'vercel',
                                    'docker': 'docker',
                                    'kubernetes': 'kubernetes',
                                    'figma': 'figma'
                                };

                                let techSlug = tech.toLowerCase();
                                // Clean up version numbers if not explicitly mapped
  if (!slugMap[techSlug]) {
                                    techSlug = techSlug.replace(/\s\d+(\.\d+)?$/, '');
                                }

                                if (slugMap[techSlug]) {
                                    techSlug = slugMap[techSlug];
                                } else {
                                    techSlug = techSlug
                                        .replace(/\./g, 'dot')
                                        .replace(/\s+/g, '');
                                }
                                    
                                return (
                                <SwiperSlide key={i}>
                                    <div className="flex flex-col items-center justify-center gap-4 p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/20 transition-all hover:-translate-y-1 group relative overflow-hidden">
                                        <div className="w-16 h-16 rounded-2xl bg-muted/30 flex items-center justify-center p-3 group-hover:bg-muted/50 transition-colors relative z-10">
                                            {/* Brand Logo */}
                                            <img 
                                                src={`https://cdn.simpleicons.org/${techSlug}`}
                                                alt={`${tech} logo`}
                                                className="w-full h-full object-contain opacity-60 group-hover:opacity-100 transition-all duration-300 grayscale group-hover:grayscale-0"
                                                onError={(e) => {
                                                    // Fallback to text if image fails, e.currentTarget.style.display = 'none';
                                                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                                    e.currentTarget.nextElementSibling?.classList.add('flex');
                                                }}
                                            />
                                            {/* Text Fallback (Hidden by default) */}
                                            <span className="hidden items-center justify-center w-full h-full text-2xl font-semibold text-primary/50 group-hover:text-primary transition-colors">{tech.charAt(0)}</span>
                                        </div>
                                        <span className="font-bold text-sm text-muted-foreground truncate w-full text-center group-hover:text-foreground transition-colors relative z-10">{tech}</span>
                                        
                                        {/* Hover Glow */}
                                        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0" />
                                    </div>
                                </SwiperSlide>
                                )
                            })}
                        </Swiper>
                    </div>
                </section>
            )}

            {/* Service Packages / Pricing */}
            <ServicePackages />

            {/* Other Services Cross-Link (Premium Grid) */}
            <section className="py-24 md:py-32 border-t border-border/50 relative">
                <div className="absolute inset-0 bg-background/50 backdrop-blur-3xl z-[-1]" />
                
                <div className="container px-4 mx-auto">
                    <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-wider mb-4">
                                <Layers className="w-3.5 h-3.5" />
                                <span>Ecosystem</span>
                            </div>
                            <h2 className="text-3xl md:text-5xl font-semibold tracking-tight">
                                Explore More <span className="text-muted-foreground">Capabilities</span>
                            </h2>
                        </div>
                        <Link href="/services" className="group flex items-center gap-2 text-primary font-bold hover:text-primary/80 transition-colors">
                            View All Services
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {content?.overview
                            .filter(s => s.id !== service.id)
                            .slice(0, 3)
                            .map((other, i) => (
                                <Link 
                                    key={other.id} 
                                    href={`/services/${other.id}`}
                                    className="block group h-full"
                                >
                                    <div className="relative h-full p-8 rounded-[2rem] bg-card border border-border/50 hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-2 overflow-hidden flex flex-col justify-between">
                                        
                                        {/* Hover Gradient */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                        
                                        <div className="relative z-10 mb-8">
                                            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-sm border border-primary/10 group-hover:border-primary/30">
                                                {(() => {
                                                    const OtherIcon = iconMap[other.iconName] || Globe;
                                                    return <OtherIcon className="w-7 h-7 text-primary transition-colors" />;
                                                })()}
                                            </div>
                                            
                                            <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors pr-8 leading-tight">
                                                {other.label}
                                            </h3>
                                            <p className="text-muted-foreground leading-relaxed line-clamp-3">
                                                {other.description}
                                            </p>
                                        </div>

                                        <div className="relative z-10 flex items-center gap-2 text-sm font-bold text-primary opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                                            Learn More <ArrowRight className="w-4 h-4" />
                                        </div>

                                        {/* Decorative Circle */}
                                        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors duration-500" />
                                    </div>
                                </Link>
                            ))
                        }
                    </div>
                </div>
            </section>

            {/* Project CTA */}
            <div className="sticky bottom-6 z-40 flex justify-center lg:hidden pointer-events-none">
                 <Link href="#contact" className="pointer-events-auto bg-primary text-primary-foreground px-8 py-4 rounded-full font-bold flex items-center gap-2 shadow-2xl shadow-primary/30 animate-in fade-in slide-in-from-bottom-5">
                    Start Your Project
                    <ArrowRight className="w-4 h-4" />
                 </Link>
            </div>

            <CTA />
        </main>
    );
}



"use client"
import { AnimatedDiv, AnimatedSpan, useScrollProgress, useTransform } from "@/lib/animated";
import { ArrowLeft, ExternalLink, Github, Calendar, Layers, Cpu, Globe, ArrowRight, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef, use, useMemo } from "react";
import CTA from "@/components/sections/cta";

// Swiper
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation, Autoplay, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/effect-fade";

import { cn } from "@/lib/utils";
import { mapApiPortfolioToProject, mapApiPortfolioToProjects } from "@/hooks/usePublicMarketing";
import { portfolioAPI } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { defaultContent } from "@/lib/store/portfolio-content";

export default function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const router = useRouter();

    const { data: apiProject, isLoading } = useQuery({
        queryKey: ["public", "portfolio", slug],
        queryFn: () => portfolioAPI.getBySlug(slug),
        staleTime: 1000 * 60 * 5,
    });

    const { data: apiPortfolio = [] } = useQuery({
        queryKey: ["public", "portfolio"],
        queryFn: () => portfolioAPI.getPublished(),
        staleTime: 1000 * 60 * 5,
    });

    const fallbackProject = useMemo(() => {
        if (apiProject) return null;
        return defaultContent.projects.find(p => p.slug === slug || p.id === slug) ?? null;
    }, [slug, apiProject]);

    const project = apiProject ? mapApiPortfolioToProject(apiProject) : fallbackProject;
    const allProjects = useMemo(() => {
        const api = mapApiPortfolioToProjects(apiPortfolio);
        return api.length > 0 ? api : defaultContent.projects;
    }, [apiPortfolio]);

    useEffect(() => {
        if (!isLoading && !project) {
            router.push('/portfolio');
        }
    }, [isLoading, project, router]);

    const containerRef = useRef<HTMLDivElement>(null);
    const scrollYProgress = useScrollProgress(containerRef);
    const yHero = useTransform(scrollYProgress, [0, 0.5], [0, 200]);
    const opacityHero = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
    
    // Lightbox State
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

    if (isLoading || !project) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="animate-pulse bg-primary/20 w-12 h-12 rounded-full" /></div>;

    const galleryImages = project.image ? [project.image] : [];

    return (
        <main ref={containerRef} className="min-h-screen bg-background relative overflow-hidden">
            
            {/* Top Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 p-6 flex justify-between items-center pointer-events-none">
                <Link 
                    href="/portfolio"
                    className="pointer-events-auto w-12 h-12 rounded-full bg-background/80 backdrop-blur-md border border-border flex items-center justify-center hover:bg-muted transition-all group shadow-lg"
                >
                    <ArrowLeft className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                </Link>
                <div className="pointer-events-auto" />
            </nav>

            {/* Hero Section */}
            <section className="relative h-[90vh] min-h-[400px] md:min-h-[700px] w-full overflow-hidden flex items-end pb-20">
                {/* Parallax Background */}
                <AnimatedDiv 
                    style={{ transform: `translateY(${yHero}px)` }}
                    className="absolute inset-0 z-0"
                >
                    <div className={cn("absolute inset-0 bg-gradient-to-br opacity-30", project.gradient)} />
                    {/* Placeholder image logic since we don't have real uploaded images yet */}
                    {galleryImages[0] ? (
                        <Image src={galleryImages[0]}
                            alt={project.title}
                            fill className="object-cover"
                            priority
                        />
                    ) : null}
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
                    <div className="absolute inset-0 bg-black/20" />
                </AnimatedDiv>

                <div className="container px-4 mx-auto relative z-10">
                    <AnimatedDiv 
                        style={{ opacity: opacityHero }}
                        className=""
                    >
                        <AnimatedDiv 
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-background/10 backdrop-blur-md border border-white/20 rounded-full text-white text-sm font-bold tracking-wider mb-6 shadow-xl">
                                <Layers className="w-4 h-4" />
                                <span>{project.category}</span>
                            </div>
                            
                            <h1 className="text-4xl sm:text-5xl md:text-8xl lg:text-9xl font-bold text-white mb-6 tracking-tighter leading-[0.9]">
                                {project.title}
                            </h1>
                            
                            <p className="text-xl md:text-2xl text-white/80 max-w-2xl font-light mb-10 leading-relaxed">
                                {project.description}
                            </p>

                            <div className="flex flex-wrap gap-8 text-white/90 font-medium text-lg border-t border-white/20 pt-8">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-full bg-white/10 backdrop-blur-sm">
                                        <Globe className="w-5 h-5" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs tracking-widest text-white/60">Client</span>
                                        <span>{project.client}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-full bg-white/10 backdrop-blur-sm">
                                        <Calendar className="w-5 h-5" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs tracking-widest text-white/60">Project ID</span>
                                        <span className="text-xs">{project.id.slice(0, 8)}...</span>
                                    </div>
                                </div>
                            </div>
                        </AnimatedDiv>
                    </AnimatedDiv>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-24 bg-background relative z-10">
                <div className="container px-4 mx-auto">
                    <div className="grid lg:grid-cols-12 gap-12 lg:gap-20">
                        
                        {/* Left Column: Narrative */}
                        <div className="lg:col-span-8 space-y-20">
                            
                            {/* Intro Text */}
                            <AnimatedDiv initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5 }}
                                style={{ willChange: "transform, opacity" }}
                            >
                                <h3 className="text-3xl font-bold mb-6">About the Project</h3>
                                <div className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
                                    <p className="text-xl md:text-2xl font-light text-foreground mb-8">
                                        {project.longDescription}
                                    </p>
                                    <p>{project.description}</p>
                                </div>
                            </AnimatedDiv>

                            {/* Gallery Carousel (Swiper) */}
                            <AnimatedDiv initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5 }}
                                style={{ willChange: "transform, opacity" }}
                                className="w-full h-[300px] sm:h-[400px] md:h-[500px] rounded-[2rem] overflow-hidden border border-border shadow-2xl relative group cursor-zoom-in"
                            >
                                 <Swiper modules={[Navigation, Pagination, Autoplay, EffectFade]}
                                    effect="fade"
                                    loop={true}
                                    autoplay={{ delay: 4000 }}
                                    pagination={{ clickable: true }}
                                    navigation={true}
                                    className="h-full w-full"
                                 >
                                    {galleryImages.map((img, i) => (
                                        <SwiperSlide key={i} onClick={() => setLightboxIndex(i)}>
                                            <div className="relative w-full h-full">
                                                <Image 
                                                    src={img} 
                                                    alt={`Gallery image ${i + 1}`} 
                                                    fill 
                                                    className="object-cover" 
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60" />
                                            </div>
                                        </SwiperSlide>
                                    ))}
                                 </Swiper>
                                 <div className="absolute bottom-6 right-6 z-10 bg-black/50 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-bold pointer-events-none">
                                     Click to Expand
                                 </div>
                            </AnimatedDiv>

                            {/* Challenge & Solution Grid */}
                            <div className="grid md:grid-cols-2 gap-8">
                                {[
                                    { title: "The Summary", content: project.description, color: "bg-blue-500" },
                                    { title: "Detailed Analysis", content: project.longDescription, color: "bg-purple-500" }
                                ].map((item, i) => (
                                    <AnimatedDiv 
                                        key={i}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.2 }}
                                        style={{ willChange: "transform, opacity" }}
                                        className="bg-card p-8 rounded-3xl border border-border hover:border-primary/20 transition-all hover:-translate-y-1 hover:shadow-lg"
                                    >
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className={cn("w-3 h-3 rounded-full animate-pulse", item.color)} />
                                            <h4 className="text-xl font-bold">{item.title}</h4>
                                        </div>
                                        <p className="text-muted-foreground leading-relaxed">
                                            {item.content}
                                        </p>
                                    </AnimatedDiv>
                                ))}
                            </div>

                        </div>

                        {/* Right Column: Sticky Sidebar */}
                        <div className="lg:col-span-4">
                            <div className="sticky top-32 space-y-12">
                                
                                {/* Key Metrics */}
                                <div className="bg-card/50 backdrop-blur-xl border border-border p-8 rounded-3xl shadow-xl">
                                    <h4 className="text-sm font-bold tracking-widest text-muted-foreground mb-8">Impact & Results</h4>
                                    <div className="grid grid-cols-1 gap-6">
                                        {project.stats.map((result, i) => (
                                            <AnimatedDiv 
                                                key={i}
                                                initial={{ opacity: 0, x: 20 }}
                                                whileInView={{ opacity: 1, x: 0 }}
                                                viewport={{ once: true }}
                                                transition={{ delay: i * 0.1 }}
                                                style={{ willChange: "transform, opacity" }}
                                                className="flex items-center justify-between group"
                                            >
                                                <span className="text-sm font-medium text-muted-foreground">{result.label}</span>
                                                <span className="text-2xl font-semibold text-foreground group-hover:text-primary transition-colors">{result.value}</span>
                                            </AnimatedDiv>
                                        ))}
                                    </div>
                                </div>

                                {/* Tech Stack Tags */}
                                <div>
                                    <h4 className="text-sm font-bold tracking-widest text-muted-foreground mb-6 flex items-center gap-2">
                                        <Cpu className="w-4 h-4" />
                                        Technology Stack
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {project.tags.map((tech, i) => (
                                            <AnimatedSpan 
                                                key={tech}
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                whileInView={{ opacity: 1, scale: 1 }}
                                                viewport={{ once: true }}
                                                transition={{ delay: i * 0.1 }}
                                                style={{ willChange: "transform, opacity" }}
                                                className="px-4 py-2 bg-background border border-border rounded-xl text-sm font-medium text-foreground hover:border-primary/50 hover:bg-primary/5 transition-all cursor-default hover:scale-105"
                                            >
                                                {tech}
                                            </AnimatedSpan>
                                        ))}
                                    </div>
                                </div>

                                {/* Live Preview */}
                                {project.url && (
                                    <Link href={project.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 w-full py-5 rounded-2xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all group shadow-lg shadow-primary/25">
                                        <ExternalLink className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                        <span>Live Preview</span>
                                    </Link>
                                )}

                                {/* Source Code CTA */}
                                <Link href="/contact" className="flex items-center justify-center gap-3 w-full py-5 rounded-2xl border border-border bg-card hover:bg-muted font-bold transition-all group">
                                    <Github className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                    <span>Request Access to Source</span>
                                </Link>

                                {/* Live Preview */}
                                <Link href="/contact" className="flex items-center justify-center gap-3 w-full py-5 rounded-2xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all group shadow-lg shadow-primary/25">
                                    <ExternalLink className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                    <span>Live Preview</span>
                                </Link>

                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* Next Project Navigation */}
            {(() => {
                if (allProjects.length === 0) return null;
                const currentIdx = allProjects.findIndex(p => p.id === project.id);
                const nextProject = currentIdx >= 0 && currentIdx < allProjects.length - 1 ? allProjects[currentIdx + 1] : allProjects[0];
                if (!nextProject) return null;
                return (
                    <section className="py-20 border-t border-border">
                        <div className="container px-4 mx-auto">
                            <Link href={`/portfolio/${nextProject.slug || nextProject.id}`} className="flex justify-between items-center group cursor-pointer">
                                <div className="text-left">
                                    <span className="text-sm text-muted-foreground tracking-widest mb-2 block">Next Project</span>
                                    <h2 className="text-3xl md:text-5xl font-semibold group-hover:text-primary transition-colors">{nextProject.title}</h2>
                                </div>
                                <div className="w-16 h-16 rounded-full border border-border flex items-center justify-center group-hover:bg-primary group-hover:border-primary group-hover:text-white transition-all transform group-hover:rotate-[-45deg]">
                                    <ArrowRight className="w-6 h-6" />
                                </div>
                            </Link>
                        </div>
                    </section>
                );
            })()}

            {/* Lightbox Modal */}
            {lightboxIndex !== null && (
                <div className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-10"
                    onClick={() => setLightboxIndex(null)}
                >
                        <button className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors">
                            <X className="w-10 h-10" />
                        </button>
                        
                        <div className="relative w-full max-w-7xl h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                                <Swiper initialSlide={lightboxIndex}
                                modules={[Navigation]}
                                navigation={true}
                                className="w-full h-full"
                            >
                                {galleryImages.map((img, i) => (
                                    <SwiperSlide key={i} className="flex items-center justify-center">
                                        <div className="relative w-full h-full max-h-[85vh]">
                                            <Image 
                                                src={img} 
                                                alt={`Full screen image ${i}`} 
                                                fill 
                                                className="object-contain" 
                                            />
                                        </div>
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                        </div>
                    </div>
                )}

            <CTA />
        </main>
    );
}

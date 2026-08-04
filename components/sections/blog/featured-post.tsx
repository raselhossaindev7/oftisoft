"use client"
import { AnimatedDiv, AnimatePresence, useScrollY, useTransform } from "@/lib/animated";

import { Clock, ArrowRight, Sparkles, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { useBlogContentStore } from "@/lib/store/blog-content";

// Remove static featuredPosts array


export default function FeaturedPost() {
    const { content } = useBlogContentStore();
    const featuredPosts = (content?.posts || []).filter(p => p.featured);
    const authors = content?.authors || [];
    const categories = content?.categories || [];

    const [activeIndex, setActiveIndex] = useState(0);
    const scrollY = useScrollY();
    const y = useTransform(scrollY, [0, 500], [0, 150]);
    const opacity = useTransform(scrollY, [0, 400], [1, 0]);

    const safeIndex = Math.min(activeIndex, Math.max(0, featuredPosts.length - 1));

    useEffect(() => {
        if (activeIndex !== safeIndex) {
            setActiveIndex(safeIndex);
        }
    }, [featuredPosts.length, safeIndex, activeIndex]);

    const handleNext = () => {
        if (featuredPosts.length === 0) return;
        setActiveIndex((prev) => (prev + 1) % featuredPosts.length);
    };

    const handlePrev = () => {
        if (featuredPosts.length === 0) return;
        setActiveIndex((prev) => (prev - 1 + featuredPosts.length) % featuredPosts.length);
    };

    useEffect(() => {
        if (featuredPosts.length === 0) return;
        const timer = setInterval(handleNext, 8000);
        return () => clearInterval(timer);
    }, [featuredPosts.length]);

    // Guard against empty featured posts
  if (featuredPosts.length === 0) {
        return null;
    }

    return (
        <section className="relative h-[85vh] w-full overflow-hidden flex items-end justify-center bg-black">
            {/* Dynamic Backgrounds */}
            <AnimatePresence mode="popLayout">
                {featuredPosts.map((post, index) => (
                    index === safeIndex && (
                        <AnimatedDiv key={`bg-${post.id}`}
                            initial={{ opacity: 0, scale: 1.1 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1.2 }}
                            style={{ y }}
                            className="absolute inset-0 z-0"
                        >
                            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent z-10" />
                            <div className="absolute inset-0 bg-black/40 z-10" /> {/* Dimmer */}
                            {post.coverImage ? (
                                <Image src={post.coverImage}
                                    alt={post.title}
                                    fill className="object-cover"
                                    priority={index === safeIndex}
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-neutral-900 via-neutral-800 to-black" />
                            )}
                        </AnimatedDiv>
                    )
                ))}
            </AnimatePresence>

            {/* Navigation Overlay - Responsive */}
            <div className="absolute top-1/2 left-4 right-4 z-40 flex justify-between -translate-y-1/2 pointer-events-none px-2 md:px-8">
                <Button size="icon"
                    variant="ghost"
                    onClick={handlePrev}
                    className="pointer-events-auto rounded-full border border-white/20 bg-black/20 backdrop-blur-md text-white hover:bg-white/20 hover:text-white transition-all hover:scale-110 w-10 h-10 md:w-12 md:h-12"
                >
                    <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
                </Button>
                <Button size="icon"
                    variant="ghost" 
                    onClick={handleNext}
                    className="pointer-events-auto rounded-full border border-white/20 bg-black/20 backdrop-blur-md text-white hover:bg-white/20 hover:text-white transition-all hover:scale-110 w-10 h-10 md:w-12 md:h-12"
                >
                    <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
                </Button>
            </div>

            <div className="container px-4 mx-auto relative z-20 pb-20 md:pb-28">
                <AnimatePresence mode="wait">
                    <AnimatedDiv key={featuredPosts[safeIndex].id}
                        initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="mx-auto"
                    >
                        {/* Meta Tags */}
                        <div className="flex flex-wrap gap-3 mb-6">
                             <AnimatedDiv initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 }}>
                                <Badge variant="secondary" className="gap-2 px-3 py-1 bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20">
                                    <Sparkles className="w-3 h-3 text-yellow-400" />
                                    Featured
                                </Badge>
                             </AnimatedDiv>
                            
                            <AnimatedDiv initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.4 }}>
                                <Badge 
                                    className={cn(
                                        "px-3 py-1 text-white backdrop-blur-md border border-white/10 shadow-lg bg-gradient-to-r border-0",
                                        featuredPosts[safeIndex].gradient || "from-blue-600 to-violet-600"
                                    )} 
                                >
                                    {categories.find(c => c.id === featuredPosts[safeIndex].category)?.label ?? ""}
                                </Badge>
                            </AnimatedDiv>
                        </div>

                        {/* Title */}
                        <h1 className="text-3xl md:text-6xl lg:text-7xl font-bold mb-6 md:mb-8 text-white leading-tight drop-shadow-2xl">
                            {featuredPosts[safeIndex].title}
                        </h1>

                        {/* Author & Info */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-6 md:gap-8 text-white/90">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-white/20 to-white/5 border border-white/20 backdrop-blur flex items-center justify-center font-bold text-white shadow-lg text-sm md:text-base">
                                    {authors.find(a => a.id === featuredPosts[safeIndex].authorId)?.initials ?? ""}
                                </div>
                                <div>
                                    <p className="text-sm md:text-base font-bold text-white">{authors.find(a => a.id === featuredPosts[safeIndex].authorId)?.name ?? ""}</p>
                                    <p className="text-xs md:text-xs text-white/60 tracking-widest">Author</p>
                                </div>
                            </div>

                            <div className="hidden sm:block h-10 w-[1px] bg-gradient-to-b from-transparent via-white/30 to-transparent" />

                            <div className="flex items-center gap-4 md:gap-6 text-xs md:text-sm font-medium">
                                <div className="flex items-center gap-2">
                                    <Clock className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
                                    <span>{featuredPosts[safeIndex].readTime}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
                                    <span>{featuredPosts[safeIndex].date}</span>
                                </div>
                            </div>

                            <div className="sm:ml-auto">
                                <Button asChild size="lg" className="rounded-full font-bold tracking-wide w-fit hover:scale-105 transition-transform bg-white text-black hover:bg-white/90">
                                    <Link href={`/blog/${featuredPosts[safeIndex].slug || featuredPosts[safeIndex].id}`}>
                                        Read Article 
                                        <ArrowRight className="ml-2 w-4 h-4" />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </AnimatedDiv>
                </AnimatePresence>

                {/* Progress Indicators */}
                <div className="absolute bottom-6 md:bottom-10 left-0 right-0 flex justify-center gap-3 z-30">
                    {featuredPosts.map((_, i) => (
                        <button key={i}
                            onClick={() => setActiveIndex(i)}
                            className="group relative h-1.5 rounded-full overflow-hidden bg-white/20 transition-all duration-300 hover:h-2"
                            style={{ width: activeIndex === i ? '3rem' : '1.5rem' }}
                        >
                            {activeIndex === i && (
                                <AnimatedDiv 
                                    className="absolute inset-0 bg-primary"
                                    layoutId="progress"
                                    initial={{ x: '-100%' }}
                                    animate={{ x: '0%' }}
                                    transition={{ duration: 8, ease: "linear" }}
                                />
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
}

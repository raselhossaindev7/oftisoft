"use client"
import { AnimatedDiv } from "@/lib/animated";

import { useState, useRef, useEffect, useCallback } from "react";
import gsap from "gsap";
import { X, ZoomIn, PlayCircle, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function OfficeCulture({ data }: { data?: any }) {
    const culture = data;
    const items = culture?.items || [];

    const [selectedItem, setSelectedItem] = useState<any | null>(null);
    const overlayRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const closingRef = useRef(false);

    const closeLightbox = useCallback(() => {
        if (closingRef.current || !overlayRef.current) return;
        closingRef.current = true;
        const tl = gsap.timeline({
            onComplete: () => {
                setSelectedItem(null);
                closingRef.current = false;
            }
        });
        if (contentRef.current) {
            tl.to(contentRef.current, { scale: 0.95, opacity: 0, duration: 0.2, ease: "power2.in" }, 0);
        }
        tl.to(overlayRef.current, { opacity: 0, duration: 0.25, ease: "power2.in" }, 0);
    }, []);

    const openLightbox = useCallback((item: any) => {
        setSelectedItem(item);
    }, []);

    useEffect(() => {
        if (!selectedItem) return;
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") closeLightbox();
        };
        document.addEventListener("keydown", handleEsc);
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", handleEsc);
            document.body.style.overflow = "";
        };
    }, [selectedItem, closeLightbox]);

    useEffect(() => {
        if (selectedItem && overlayRef.current && contentRef.current) {
            gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power2.out" });
            gsap.fromTo(contentRef.current, { scale: 0.95, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.35, ease: "back.out(1.4)", delay: 0.05 });
        }
    }, [selectedItem]);

    return (
        <section className="py-20 md:py-32 bg-transparent relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute left-0 top-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -translate-x-1/2 pointer-events-none" />

            <div className="container px-4 mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
                    <AnimatedDiv 
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        style={{ willChange: "transform, opacity" }}
                    >
                        <Badge variant="outline" className="mb-6 border-primary/20 text-primary tracking-wide px-3 py-1 bg-primary/5 rounded-full font-semibold text-xs">
                            {culture?.badge ?? ""}
                        </Badge>
                        <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">
                            {culture?.titleLine1 ?? ""} <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                                {culture?.titleLine2 ?? ""}
                            </span>
                        </h3>
                    </AnimatedDiv>
                </div>

                {/* Bento Grid Gallery */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:grid-rows-2 h-auto md:h-[600px]">
                    {items.map((item: any, index: number) => (
                        <AnimatedDiv key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            onClick={() => setSelectedItem(item)}
                            style={{ willChange: "transform, opacity" }}
                            className={cn(
                                "relative group overflow-hidden rounded-3xl cursor-pointer border border-white/5 bg-neutral-900/50",
                                item.size,
                                // Mobile override: all same size
                                "h-[300px] md:h-auto"
                            )}
                        >
                             {/* Image or Placeholder */}
                            {item.thumb && (item.thumb.startsWith('data:') || item.thumb.startsWith('http') || item.thumb.startsWith('/')) ? (
                                <img src={item.thumb} alt={item.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80" />
                            ) : (
                                <div className={cn("absolute inset-0 transition-transform duration-700 group-hover:scale-105 opacity-80", item.thumb)} />
                            )}
                            
                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                            {/* Content */}
                            <div className="absolute inset-0 p-6 flex flex-col justify-between">
                                <div className="flex justify-end">
                                    <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0 border border-white/10">
                                        {item.type === 'video' ? <PlayCircle className="w-5 h-5 text-white" /> : <ZoomIn className="w-5 h-5 text-white" />}
                                    </div>
                                </div>

                                <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                    <div className="flex items-center gap-2 text-sm font-medium text-primary mb-2 tracking-wide">
                                        <MapPin className="w-3 h-3" />
                                        {item.location}
                                    </div>
                                    <h4 className="text-xl font-bold text-white leading-tight">{item.title}</h4>
                                </div>
                            </div>
                        </AnimatedDiv>
                    ))}
                </div>

                {/* Lightbox Overlay */}
                {selectedItem && (
                    <div ref={overlayRef}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 md:p-12"
                        onClick={closeLightbox}
                    >
                        <button onClick={closeLightbox} className="absolute top-6 right-6 z-10 p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors border border-white/10 text-white">
                            <X className="w-6 h-6" />
                        </button>

                        <div ref={contentRef} onClick={(e) => e.stopPropagation()}
                            className="relative w-full max-w-5xl aspect-video bg-neutral-900 rounded-3xl overflow-hidden shadow-2xl border border-white/10"
                        >
                            {selectedItem.type === 'video' ? (
                                <video 
                                    src={selectedItem.thumb} 
                                    className="absolute inset-0 w-full h-full object-cover" 
                                    controls 
                                    autoPlay 
                                    loop
                                />
                            ) : (
                                selectedItem.thumb && (selectedItem.thumb.startsWith('data:') || selectedItem.thumb.startsWith('http') || selectedItem.thumb.startsWith('/')) ? (
                                    <img src={selectedItem.thumb} alt={selectedItem.title} className="absolute inset-0 w-full h-full object-cover" />
                                ) : (
                                    <div className={cn("absolute inset-0 flex items-center justify-center text-white/20 text-4xl font-bold", selectedItem.thumb)}>
                                        {selectedItem.title} Preview
                                    </div>
                                )
                            )}
                            
                            <div className="absolute bottom-0 inset-x-0 p-8 bg-gradient-to-t from-black/90 to-transparent">
                                <h3 className="text-3xl font-bold text-white mb-2">{selectedItem.title}</h3>
                                <p className="text-white/60 flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-primary" /> {selectedItem.location}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}



"use client";

import { useEffect, useRef } from "react";
import { useAds } from "@/hooks/useAds";
import { Ad, AdType, AdSize } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface AdSlotProps {
    position: string;
    className?: string;
}

export function AdSlot({ position, className }: AdSlotProps) {
    const { ads, isLoading, trackView, trackClick } = useAds(position);
    const hasTracked = useRef<Set<string>>(new Set());

    // When ads load, track impression for each
    useEffect(() => {
        if (ads && ads.length > 0) {
            ads.forEach(ad => {
                if (!hasTracked.current.has(ad.id)) {
                    trackView(ad.id);
                    hasTracked.current.add(ad.id);
                }
            });
        }
    }, [ads, trackView]);

    if (isLoading) {
        return <Skeleton className={cn("w-full bg-muted/20 rounded-xl", className)} style={{ minHeight: '100px' }} />;
    }

    if (!ads) return null;

    const adList = Array.isArray(ads) ? ads : (ads as any).data || [];
    if (adList.length === 0) return null;

    // For now, we show the first active ad for the position
    // We can implement rotation or specific logic later
  const ad = adList[0];
    if (!ad || !ad.type) return null;

    const renderAdContent = (ad: Ad) => {
        switch (ad.type) {
            case AdType.IMAGE:
                return (
                    <Link 
                        href={ad.link || "#"} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        onClick={() => trackClick(ad.id)}
                        className="block w-full overflow-hidden rounded-xl border border-white/10 hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10"
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                            src={ad.content} 
                            alt={ad.title} 
                            className="w-full h-auto object-cover"
                        />
                    </Link>
                );

            case AdType.GOOGLE_ADS:
            case AdType.CUSTOM_HTML:
                return (
                    <div 
                        className="ad-container w-full flex justify-center overflow-hidden rounded-xl"
                        dangerouslySetInnerHTML={{ __html: ad.content }}
                    />
                );

            case AdType.SCRIPT:
                return <ScriptAd ad={ad} />;

            default:
                return null;
        }
    };

    return (
        <div className={cn("ad-slot-wrapper py-6 md:py-8", className)}>
            <div className="flex flex-col items-center">
                <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase mb-2 opacity-50">Advertisement</span>
                {renderAdContent(ad)}
            </div>
        </div>
    );
}

function ScriptAd({ ad }: { ad: Ad }) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (containerRef.current) {
            const script = document.createElement("script");
            script.innerHTML = ad.content;
            script.async = true;
            containerRef.current.appendChild(script);
        }
    }, [ad.content]);

    return <div ref={containerRef} className="w-full flex justify-center" />;
}

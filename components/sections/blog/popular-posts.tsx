"use client"
import { AnimatedDiv, AnimatedH1, AnimatedH2, AnimatedH3 } from "@/lib/animated";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { TrendingUp, ArrowRight, Flame, Eye, Clock, ChevronLeft, ChevronRight, Calendar } from "lucide-react";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { useBlogContentStore } from "@/lib/store/blog-content";

// Static array removed


export default function PopularPosts() {
    const { content } = useBlogContentStore();
    const popularPosts = (content?.posts || []).filter(p => p.popularResult);
    const categories = content?.categories || [];

    const swiperRef = useRef<any>(null);

    return (
        <section className="py-16 md:py-24 bg-background relative overflow-hidden">
             {/* Decor Elements */}
             <div className="absolute top-0 right-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
             <div className="absolute bottom-0 left-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="container px-4 mx-auto relative z-10">
                <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-12">
                    <div className="w-full md:w-auto text-center md:text-left">
                        <AnimatedDiv 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="flex items-center justify-center md:justify-start gap-3 mb-4"
                            transition={{ duration: 0.5 }}
                            style={{ willChange: "transform, opacity" }}
                        >
                            <Badge variant="outline" className="gap-2 py-1.5 px-4 text-orange-500 border-orange-500/20 bg-orange-500/5 rounded-full">
                                <Flame className="w-4 h-4 animate-pulse fill-orange-500/20" />
                                <span className="tracking-widest text-xs font-bold">Trending Now</span>
                            </Badge>
                        </AnimatedDiv>
                        <AnimatedH2 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            style={{ willChange: "transform, opacity" }}
                            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70"
                        >
                            Most Popular Reads
                        </AnimatedH2>
                    </div>

                    {/* Custom Nav Controls */}
                    <div className="flex gap-3 justify-center md:justify-end w-full md:w-auto">
                        <Button 
                            variant="outline"
                            size="icon"
                            onClick={() => swiperRef.current?.swiper?.slidePrev()}
                            className="w-12 h-12 rounded-full border-border bg-card/50 hover:bg-primary hover:text-white hover:border-primary transition-all backdrop-blur-sm"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </Button>
                        <Button 
                            variant="outline"
                            size="icon"
                            onClick={() => swiperRef.current?.swiper?.slideNext()}
                            className="w-12 h-12 rounded-full border-border bg-card/50 hover:bg-primary hover:text-white hover:border-primary transition-all backdrop-blur-sm"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </Button>
                    </div>
                </div>

                <Swiper ref={swiperRef}
                    modules={[Autoplay, Pagination, Navigation]}
                    spaceBetween={24}
                    slidesPerView={1.15}
                    breakpoints={{
                        640: { slidesPerView: 2 },
                        1024: { slidesPerView: 3 },
                        1280: { slidesPerView: 3.5 },
                    }}
                    autoplay={{ delay: 6000, disableOnInteraction: false, pauseOnMouseEnter: true }}
                    className="!pb-12 !overflow-visible"
                    loop={true}
                    centeredSlides={false} 
                >
                    {popularPosts.map((post, index) => (
                        <SwiperSlide key={post.id} className="h-full pt-10">
                            <Link href={`/blog/${post.slug || post.id}`} className="block h-full">
                                <AnimatedDiv initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    whileHover={{ y: -10 }}
                                    className="group relative h-[380px] md:h-[400px] rounded-[2rem] overflow-hidden cursor-pointer"
                                    style={{ willChange: "transform, opacity" }}
                                >
                                {/* Floating Rank Number */}
                                <div className="absolute -top-6 md:-top-10 left-6 text-7xl md:text-8xl font-bold text-foreground/5 z-0 group-hover:text-primary/10 transition-colors duration-500 pointer-events-none select-none">
                                    {post.popularRank ?? ""}
                                </div>

                                {/* Card Background - Image or Gradient */}
                                {post.coverImage ? (
                                    <img src={post.coverImage}
                                        alt={post.title}
                                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className={cn(
                                        "absolute inset-0 bg-gradient-to-br transition-transform duration-700 group-hover:scale-110",
                                        post.gradient
                                    )} />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                                {/* Glass Overlay / Border */}
                                <div className="absolute inset-0 border-[1.5px] border-white/10 rounded-[2rem] z-20 group-hover:border-white/30 transition-colors" />

                                {/* Content */}
                                <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-between z-10">
                                    <div className="flex justify-between items-start">
                                        <Badge variant="secondary" className="backdrop-blur-md bg-white/20 border-white/10 text-white hover:bg-white/30">
                                            {categories.find(c => c.id === post.category)?.label ?? ""}
                                        </Badge>
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-4 text-white/70 text-xs font-medium mb-3">
                                            <div className="flex items-center gap-1">
                                                <Eye className="w-3.5 h-3.5" />
                                                <span>{post.views ?? ""}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5" />
                                                <span>{post.readTime ?? ""}</span>
                                            </div>
                                        </div>

                                        <h3 className="text-xl md:text-2xl font-bold text-white mb-4 line-clamp-2 leading-tight group-hover:text-white/90 transition-colors">
                                            {post.title}
                                        </h3>

                                        <div className="flex items-center text-white/90 text-sm font-bold opacity-100 md:opacity-0 md:translate-y-4 md:group-hover:opacity-100 md:group-hover:translate-y-0 transition-all duration-300 ease-out">
                                            <span>Read Article</span>
                                            <div className="w-6 h-6 ml-2 rounded-full bg-white/20 flex items-center justify-center">
                                                <ArrowRight className="w-3 h-3" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                </AnimatedDiv>
                            </Link>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </section>
    );
}

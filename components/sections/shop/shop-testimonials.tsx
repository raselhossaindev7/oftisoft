"use client"
import { AnimatedH1, AnimatedH2, AnimatedH3, AnimatedP } from "@/lib/animated";

import { useShopContentStore } from "@/lib/store/shop-content";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";

// Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

export function ShopTestimonials() {
    const { content } = useShopContentStore();
    const testimonials = content?.testimonials || [];

    return (
        <section className="py-24 border-t border-border/50 bg-background relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute top-1/2 right-0 -translate-y-1/2 w-64 h-64 bg-secondary/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="container px-4 mx-auto relative z-10">
                <div className="text-center mb-16">
                    <AnimatedH2 
                        initial={{ opacity: 0, y: 20 }}
                        style={{ willChange: "transform, opacity" }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="text-4xl md:text-6xl font-bold mb-4 tracking-tight"
                    >
                        Trusted by Developers
                    </AnimatedH2>
                    <AnimatedP 
                        initial={{ opacity: 0, y: 20 }}
                        style={{ willChange: "transform, opacity" }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-muted-foreground text-lg max-w-2xl mx-auto"
                    >
                        See why thousands of developers choose Oftisoft for their projects.
                    </AnimatedP>
                </div>

                <div className="relative group px-4 md:px-12">
                    <Swiper modules={[Autoplay, Pagination, Navigation]}
                        spaceBetween={30}
                        slidesPerView={1}
                        loop={true}
                        autoplay={{
                            delay: 5000,
                            disableOnInteraction: false,
                            pauseOnMouseEnter: true,
                        }}
                        breakpoints={{
                            768: {
                                slidesPerView: 2,
                            },
                        }}
                        pagination={{
                            clickable: true,
                            dynamicBullets: true,
                        }}
                        navigation={{
                            prevEl: ".testimonial-prev",
                            nextEl: ".testimonial-next",
                        }}
                        className="testimonial-swiper !pb-16"
                    >
                        {testimonials.map((t) => (
                            <SwiperSlide key={t.id} className="h-auto">
                                <Card className="h-full border-white/5 bg-white/[0.02] backdrop-blur-xl relative overflow-hidden group/card hover:border-primary/30 transition-all duration-500 rounded-[2rem]">
                                    {/* Animated Glow on Hover */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-700 pointer-events-none" />
                                    
                                    <Quote className="absolute top-8 right-8 w-16 h-16 text-primary/5 group-hover/card:text-primary/10 transition-colors duration-500" />
                                    
                                    <CardContent className="p-10 relative z-10 flex flex-col h-full">
                                        <div className="flex gap-1 mb-8">
                                            {[...Array(t.rating)].map((_, i) => (
                                                <Star key={i} className="w-5 h-5 text-yellow-500 fill-current" />
                                            ))}
                                        </div>
                                        
                                        <p className="text-xl mb-10 leading-relaxed font-medium text-foreground/90 flex-grow">
                                            "{t.content}"
                                        </p>
                                        
                                        <div className="flex items-center gap-5">
                                            <div className="relative">
                                                <div className="absolute inset-0 bg-primary/20 rounded-full blur-md opacity-0 group-hover/card:opacity-100 transition-opacity" />
                                                <Avatar className="h-14 w-14 border-2 border-white/10 group-hover/card:border-primary/50 transition-colors relative z-10">
                                                    <AvatarImage src={t.avatar} />
                                                    <AvatarFallback className="bg-muted text-lg font-bold">
                                                        {t.name.split(' ').map(n => n[0]).join('')}
                                                    </AvatarFallback>
                                                </Avatar>
                                            </div>
                                            <div>
                                                <p className="font-bold text-lg group-hover/card:text-primary transition-colors">{t.name}</p>
                                                <p className="text-sm text-muted-foreground font-medium tracking-wider">{t.role}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </SwiperSlide>
                        ))}
                    </Swiper>

                    {/* Navigation Buttons */}
                    <button className="testimonial-prev absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all z-20 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 hidden md:flex">
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button className="testimonial-next absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all z-20 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 hidden md:flex">
                        <ChevronRight className="w-6 h-6" />
                    </button>
                </div>
            </div>
            
            <style jsx global>{`
                .testimonial-swiper .swiper-pagination-bullet {
                    background: rgba(255, 255, 255, 0.2) !important;
                    width: 10px;
                    height: 10px;
                    transition: all 0.3s ease;
                }
                .testimonial-swiper .swiper-pagination-bullet-active {
                    background: var(--primary) !important;
                    width: 24px;
                    border-radius: 5px;
                }
            `}</style>
        </section>
    );
}

"use client"
import { Animated, AnimatedDiv, AnimatedP } from "@/lib/animated";

import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay, EffectCreative } from "swiper/modules";
import { Twitter, Linkedin, Github, Globe, Sparkles } from "lucide-react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-creative";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { useBlogContentStore } from "@/lib/store/blog-content";

// Static data removed


export default function AuthorSpotlight() {
    const { content } = useBlogContentStore();
    const authors = content?.authors || [];
    const [activeIndex, setActiveIndex] = useState(0);

    return (
        <section className="py-24 bg-gradient-to-b from-background via-background/95 to-muted/20 overflow-hidden relative">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-[20%] right-[10%] w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px]" />
            </div>

            <div className="container px-4 mx-auto relative z-10">
                <AnimatedDiv 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                    transition={{ duration: 0.5 }}
                    style={{ willChange: "transform, opacity" }}
                >
                    <Badge variant="outline" className="mb-4 gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border-primary/20 backdrop-blur-sm">
                        <Sparkles className="w-4 h-4" />
                        Creative Minds
                    </Badge>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                        Author Spotlight
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                        Meet the brilliant minds sharing insights, tutorials, and deep dives into the world of technology and design.
                    </p>
                </AnimatedDiv>

                <div className="mx-auto">
                    <Swiper modules={[Pagination, Autoplay, EffectCreative]}
                        effect={'creative'}
                        creativeEffect={{
                            prev: {
                                shadow: false,
                                translate: [0, 0, -400],
                            },
                            next: {
                                translate: ['100%', 0, 0],
                            },
                        }}
                        autoplay={{ delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true }}
                        pagination={{ 
                            clickable: true,
                            type: 'bullets',
                            bulletClass: 'swiper-pagination-bullet !bg-primary/20 !opacity-100 !w-3 !h-3 !mx-2 transition-all duration-300',
                            bulletActiveClass: '!bg-primary !w-8 rounded-full'
                        }}
                        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
                        className="!pb-16"
                    >
                        {authors.map((author, index) => (
                            <SwiperSlide key={index}>
                                <Card className="bg-card/50 backdrop-blur-xl border-white/10 dark:border-white/5 rounded-[2rem] shadow-2xl overflow-hidden relative group border-0 h-full">
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    
                                    <CardContent className="p-6 md:p-12 grid md:grid-cols-[300px_1fr] gap-10 items-center relative z-10">
                                        {/* Avatar Section */}
                                        <div className="relative mx-auto md:mx-0">
                                            <div className="relative w-48 h-48 md:w-64 md:h-64 mx-auto">
                                                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                                                    <circle className="text-muted stroke-current" strokeWidth="2" cx="50" cy="50" r="48" fill="transparent" />
                                                    <circle 
                                                        className="text-primary stroke-current transition-all duration-[1500ms] ease-in-out" 
                                                        strokeWidth="2" 
                                                        cx="50" 
                                                        cy="50" 
                                                        r="48" 
                                                        fill="transparent" 
                                                        strokeDasharray="301.59"
                                                        strokeDashoffset={activeIndex === index ? 0 : 301.59}
                                                    />
                                                </svg>
                                                <div className="absolute inset-4 rounded-full overflow-hidden border-4 border-background shadow-inner bg-muted">
                                                    {author.avatar ? (
                                                        <img src={author.avatar} alt={author.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-4xl md:text-6xl text-slate-400 font-bold">
                                                            {author.initials}
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                <AnimatedDiv 
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: activeIndex === index ? 1 : 0 }}
                                                    transition={{ delay: 0.5, type: "spring" }}
                                                    className="absolute bottom-6 right-2 bg-background p-1.5 md:p-2 rounded-full shadow-lg border border-border"
                                                >
                                                    <Badge className="text-xs font-bold px-2 py-0.5 md:py-1 rounded-full h-auto">
                                                        PRO
                                                    </Badge>
                                                </AnimatedDiv>
                                            </div>
                                        </div>

                                        {/* Content Section */}
                                        <div className="text-center md:text-left">
                                            <AnimatedDiv initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: activeIndex === index ? 1 : 0, x: activeIndex === index ? 0 : 20 }}
                                                transition={{ delay: 0.2 }}
                                            >
                                                <h3 className="text-2xl md:text-3xl font-bold mb-2">{author.name}</h3>
                                                <p className="text-primary font-medium text-base md:text-lg mb-6">{author.role}</p>
                                            </AnimatedDiv>

                                            <AnimatedP 
                                                className="text-muted-foreground mb-8 text-base md:text-lg leading-relaxed"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: activeIndex === index ? 1 : 0 }}
                                                transition={{ delay: 0.3 }}
                                            >
                                                {author.bio}
                                            </AnimatedP>

                                            {/* Stats Grid */}
                                            <div className="grid grid-cols-3 gap-2 md:gap-4 mb-8 border-y border-border/50 py-6">
                                                {(author.stats || []).map((stat: any, i: number) => (
                                                    <AnimatedDiv 
                                                        key={stat.label}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: activeIndex === index ? 1 : 0, y: activeIndex === index ? 0 : 10 }}
                                                        transition={{ delay: 0.4 + (i * 0.1) }}
                                                        className="text-center md:text-left"
                                                    >
                                                        <div className="font-bold text-xl md:text-2xl text-foreground">{stat.value}</div>
                                                        <div className="text-xs md:text-xs text-muted-foreground tracking-wider">{stat.label}</div>
                                                    </AnimatedDiv>
                                                ))}
                                            </div>

                                            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                                <AnimatedDiv 
                                                    className="flex flex-wrap gap-2 justify-center md:justify-start"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: activeIndex === index ? 1 : 0 }}
                                                    transition={{ delay: 0.6 }}
                                                >
                                                    {author.tags && author.tags.map(tag => (
                                                        <Badge key={tag} variant="secondary" className="px-3 py-1 text-xs font-medium border-border">
                                                            #{tag}
                                                        </Badge>
                                                    ))}
                                                </AnimatedDiv>

                                                <AnimatedDiv 
                                                    className="flex gap-2 md:gap-3"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: activeIndex === index ? 1 : 0 }}
                                                    transition={{ delay: 0.7 }}
                                                >
                                                    {author.socials?.twitter && (
                                                        <Button asChild size="icon" variant="ghost" className="rounded-full bg-muted hover:bg-black hover:text-white transition-all hover:scale-110 w-10 h-10">
                                                            <a href={author.socials.twitter}>
                                                                <Twitter className="w-5 h-5" />
                                                            </a>
                                                        </Button>
                                                    )}
                                                    {author.socials?.linkedin && (
                                                        <Button asChild size="icon" variant="ghost" className="rounded-full bg-muted hover:bg-[#0077b5] hover:text-white transition-all hover:scale-110 w-10 h-10">
                                                            <a href={author.socials.linkedin}>
                                                                <Linkedin className="w-5 h-5" />
                                                            </a>
                                                        </Button>
                                                    )}
                                                    {author.socials?.github && (
                                                        <Button asChild size="icon" variant="ghost" className="rounded-full bg-muted hover:bg-black hover:text-white transition-all hover:scale-110 w-10 h-10">
                                                            <a href={author.socials.github}>
                                                                <Github className="w-5 h-5" />
                                                            </a>
                                                        </Button>
                                                    )}
                                                    {author.socials?.website && (
                                                        <Button asChild size="icon" variant="ghost" className="rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-all hover:scale-110 w-10 h-10">
                                                            <a href={author.socials.website}>
                                                                <Globe className="w-5 h-5" />
                                                            </a>
                                                        </Button>
                                                    )}
                                                </AnimatedDiv>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            </div>
        </section>
    );
}

"use client"
import { AnimatedDiv, AnimatedH1, AnimatedH2, AnimatedH3, AnimatedP } from "@/lib/animated";

import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay, EffectCreative } from "swiper/modules";
import { Code2, Server, Smartphone, Brain, Cloud, Shield, Database, Layout, Terminal, Cpu, Globe, Lock } from "lucide-react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-creative";
import { cn } from "@/lib/utils";

const domains = [
    {
        id: "frontend",
        title: "Frontend Experience",
        icon: Layout,
        level: 98,
        description: "Crafting pixel-perfect, responsive interfaces with modern frameworks.",
        stack: ["React", "Next.js 15", "TypeScript", "Tailwind", "Three.js"],
        gradient: "from-blue-500 to-cyan-500"
    },
    {
        id: "backend",
        title: "Backend Engineering",
        icon: Server,
        level: 95,
        description: "Building robust, scalable APIs and microservices architectures.",
        stack: ["Node.js", "Python", "Go", "PostgreSQL", "Redis"],
        gradient: "from-emerald-500 to-green-500"
    },
    {
        id: "ai",
        title: "AI & Machine Learning",
        icon: Brain,
        level: 90,
        description: "Integrating intelligent agents and predictive models into applications.",
        stack: ["PyTorch", "OpenAI API", "LangChain", "HuggingFace", "RAG"],
        gradient: "from-purple-500 to-pink-500"
    },
    {
        id: "mobile",
        title: "Mobile Development",
        icon: Smartphone,
        level: 88,
        description: "Native-quality cross-platform mobile applications.",
        stack: ["React Native", "Expo", "Flutter", "Swift"],
        gradient: "from-orange-500 to-red-500"
    },
    {
        id: "devops",
        title: "Cloud & DevOps",
        icon: Cloud,
        level: 92,
        description: "Automated CI/CD pipelines and serverless infrastructure.",
        stack: ["AWS", "Vercel", "Docker", "Kubernetes", "Terraform"],
        gradient: "from-cyan-600 to-blue-700"
    },
    {
        id: "security",
        title: "Cybersecurity",
        icon: Shield,
        level: 85,
        description: "Ensuring data privacy and compliance by design.",
        stack: ["OAuth 2.0", "OWASP", "Encryption", "GDPR", "Pen Testing"],
        gradient: "from-red-600 to-rose-700"
    }
];

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

// ... existing imports

export default function TechBreakdown() {
    return (
        <section className="py-16 md:py-24 bg-background relative overflow-hidden">
            {/* Background Texture */}
            <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px]" />
            <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="container px-4 mx-auto relative z-10">
                <div className="text-center mb-12 md:mb-16 max-w-3xl mx-auto">
                    <AnimatedDiv initial={{ opacity: 0, y: 20 }}
                        style={{ willChange: "transform, opacity" }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <Badge variant="outline" className="mb-6 gap-2 px-3 py-1 bg-primary/10 border-primary/20 text-primary hover:bg-primary/20 transition-colors">
                            <Cpu className="w-4 h-4" />
                            Engineering DNA
                        </Badge>
                    </AnimatedDiv>
                    
                    <AnimatedH2 
                        initial={{ opacity: 0, y: 20 }}
                        style={{ willChange: "transform, opacity" }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6"
                    >
                        Technical <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">Breakdown</span>
                    </AnimatedH2>
                    
                    <AnimatedP 
                        initial={{ opacity: 0, y: 20 }}
                        style={{ willChange: "transform, opacity" }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-base md:text-xl text-muted-foreground"
                    >
                        We don't just write code; we architect solutions. Here is a quantitive look at our team's core competencies.
                    </AnimatedP>
                </div>

                {/* Desktop Grid / Mobile Slider */}
                <div className="hidden lg:grid grid-cols-3 gap-6">
                    {domains.map((domain, index) => (
                        <TechCard key={domain.id} domain={domain} index={index} />
                    ))}
                </div>

                <div className="lg:hidden">
                    <Swiper modules={[Pagination, Autoplay, EffectCreative]}
                        effect={'creative'}
                        creativeEffect={{
                            prev: { shadow: false, translate: [0, 0, -400] },
                            next: { translate: ['100%', 0, 0] },
                        }}
                        autoplay={{ delay: 5000, disableOnInteraction: true, pauseOnMouseEnter: true }}
                        pagination={{ clickable: true }}
                        className="!pb-12"
                    >
                        {domains.map((domain, index) => (
                            <SwiperSlide key={domain.id}>
                                <div className="px-1 h-full">
                                    <TechCard domain={domain} index={index} />
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            </div>
        </section>
    );
}

function TechCard({ domain, index }: { domain: typeof domains[0], index: number }) {
    return (
        <AnimatedDiv initial={{ opacity: 0, y: 20 }}
            style={{ willChange: "transform, opacity" }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="h-full"
        >
            <Card className="group relative h-full bg-card/40 backdrop-blur-md border-border/50 hover:bg-card/60 transition-all duration-500 overflow-hidden rounded-3xl">
                {/* Top Gradient Line */}
                <div className={cn("absolute top-0 inset-x-0 h-1 bg-gradient-to-r", domain.gradient)} />
                
                {/* Soft Glow Background */}
                <div className={cn("absolute -top-20 -right-20 w-40 h-40 rounded-full blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity", domain.gradient)} />

                <CardContent className="p-6 md:p-8 relative z-10 h-full flex flex-col">
                    <div className="flex justify-between items-start mb-6">
                        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center bg-background border border-border shadow-sm group-hover:scale-110 transition-transform duration-300", domain.gradient.replace('from-', 'text-').split(' ')[0])}>
                            <domain.icon className="w-7 h-7" />
                        </div>
                        <div className="text-right">
                            <span className="text-3xl font-bold text-foreground">{domain.level}%</span>
                            <div className="text-xs text-muted-foreground tracking-wider">Mastery</div>
                        </div>
                    </div>

                    <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">{domain.title}</h3>
                    <p className="text-muted-foreground text-sm mb-6 leading-relaxed flex-grow">
                        {domain.description}
                    </p>

                    {/* Progress Bar */}
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden mb-6">
                        <AnimatedDiv initial={{ width: 0 }}
                            whileInView={{ width: `${domain.level}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 + (index * 0.1) }}
                            className={cn("h-full rounded-full bg-gradient-to-r", domain.gradient)}
                        />
                    </div>

                    {/* Stack Tags */}
                    <div className="flex flex-wrap gap-2 mt-auto">
                        {domain.stack.map(tech => (
                            <Badge key={tech} variant="secondary" className="bg-background/50 border-border/50 font-medium text-foreground/80 hover:bg-background/80">
                                {tech}
                            </Badge>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </AnimatedDiv>
    );
}

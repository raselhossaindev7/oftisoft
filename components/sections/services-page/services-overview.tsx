"use client"
import { AnimatedDiv, AnimatedH1, AnimatedH2, AnimatedH3, AnimatedP, AnimatePresence } from "@/lib/animated";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
    Plus, Save, Trash2, LayoutTemplate, Grid, HelpCircle, Server, Database, Cloud, 
    Brain, Smartphone, Layout, Video, FileText, Code2, ClipboardCheck, Rocket, 
    HeartPulse, Globe, Zap, Code, ShieldCheck, Sparkles, Layers, Crown, ArrowRight,
    MessageSquare
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useState } from "react";


// Icon mapping
const iconMap: Record<string, React.ComponentType<{ className?: string; size?: number }>> = {
    Plus, Save, Trash2, LayoutTemplate, Grid, HelpCircle, Server, Database, Cloud, 
    Brain, Smartphone, Layout, Video, FileText, Code2, ClipboardCheck, Rocket, 
    HeartPulse, Globe, Zap, Code, ShieldCheck, Sparkles, Layers, Crown, ArrowRight,
    MessageSquare,
    // Add default mapping to prevent crashes, Default: Globe
};

const services = [
    { id: "web", iconName: "Globe", title: "Web Development", subtitle: "High-performance React & Node.js apps", label: "Web Development", techs: ["React", "Next.js", "Node.js", "TypeScript", "Tailwind CSS"], features: [{ iconName: "Zap", title: "Blazing Fast", desc: "Optimized for Core Web Vitals with SSR, ISR, and edge caching." }, { iconName: "Globe", title: "SEO Optimized", desc: "Built-in SEO, structured data, and semantic HTML out of the box." }, { iconName: "ShieldCheck", title: "Type-Safe", desc: "Full TypeScript coverage with strict mode and automated testing." }], description: "We build blazing-fast web applications using React, Next.js, and Node.js. From SaaS platforms to enterprise portals, every project is optimized for performance, SEO, and user experience.", color: "blue" },
    { id: "mobile", iconName: "Smartphone", title: "Mobile Applications", subtitle: "Cross-platform iOS & Android apps", label: "Mobile Development", techs: ["React Native", "Flutter", "Expo", "Swift", "Kotlin"], features: [{ iconName: "Smartphone", title: "Native Feel", desc: "60fps animations, platform-specific gestures, and native module access." }, { iconName: "Code2", title: "Shared Codebase", desc: "90%+ code sharing between iOS and Android with platform-specific polish." }, { iconName: "Rocket", title: "Fast Deploy", desc: "CI/CD pipelines with automated app store deployment and review." }], description: "Native-feeling mobile apps built with React Native and Flutter. One codebase, two platforms, zero compromises on performance or user experience.", color: "purple" },
    { id: "ai", iconName: "Brain", title: "AI & Machine Learning", subtitle: "Intelligent automation & predictive analytics", label: "AI Solutions", techs: ["TensorFlow", "PyTorch", "OpenAI", "LangChain", "Hugging Face"], features: [{ iconName: "Brain", title: "LLM Integration", desc: "Custom GPT models, RAG pipelines, and chat interfaces fine-tuned for your data." }, { iconName: "Zap", title: "Real-time Inference", desc: "Sub-100ms prediction latency with auto-scaling model serving infrastructure." }, { iconName: "ShieldCheck", title: "Responsible AI", desc: "Bias detection, content filtering, and explainable AI built into every model." }], description: "From LLM-powered chatbots to computer vision systems, we integrate AI into every layer of your product to automate workflows and surface insights.", color: "green" },
    { id: "backend", iconName: "Server", title: "Backend & APIs", subtitle: "Scalable microservices & GraphQL APIs", label: "Backend Development", techs: ["Node.js", "Python", "Go", "GraphQL", "gRPC"], features: [{ iconName: "Server", title: "Microservices", desc: "Event-driven architecture with independent deploy, scaling, and failure isolation." }, { iconName: "Database", title: "Multi-DB", desc: "PostgreSQL, MongoDB, Redis — the right database for every use case." }, { iconName: "Cloud", title: "Auto Scaling", desc: "Horizontal auto-scaling that handles 100x traffic spikes without manual intervention." }], description: "Event-driven microservices, RESTful and GraphQL APIs, real-time data pipelines — built with Node.js, Python, Go, and Rust for maximum throughput.", color: "orange" },
    { id: "infra", iconName: "Cloud", title: "Cloud Infrastructure", subtitle: "AWS, GCP, Azure & DevOps", label: "Cloud & DevOps", techs: ["AWS", "Docker", "Kubernetes", "Terraform", "Cloudflare"], features: [{ iconName: "Cloud", title: "Multi-Cloud", desc: "Vendor-agnostic infrastructure with automated failover across providers." }, { iconName: "Layers", title: "Containerized", desc: "Docker + Kubernetes with automated scaling, rolling updates, and self-healing." }, { iconName: "ShieldCheck", title: "Secure by Default", desc: "Zero-trust networking, WAF, DDoS protection, and automated security scanning." }], description: "Infrastructure-as-code, automated CI/CD, container orchestration with Kubernetes, and 24/7 monitoring. We make your infrastructure boringly stable.", color: "cyan" },
    { id: "data", iconName: "Database", title: "Data Engineering", subtitle: "Data pipelines, warehouses & analytics", label: "Data Engineering", techs: ["Kafka", "Spark", "dbt", "Airflow", "Snowflake"], features: [{ iconName: "Database", title: "Real-time Pipelines", desc: "Stream processing with Kafka and Spark for sub-second data freshness." }, { iconName: "Layers", title: "Data Warehousing", desc: "Modern data stack with dbt transformations and columnar storage." }, { iconName: "Globe", title: "Analytics Ready", desc: "Pre-built dashboards, BI tool integration, and self-serve analytics for your team." }], description: "End-to-end data infrastructure — from ingestion and transformation to visualization. Built with Kafka, Spark, dbt, and modern data stack tooling.", color: "indigo" },
];

const bgColorMap: Record<string, string> = {
    blue: 'bg-blue-600', purple: 'bg-purple-600', green: 'bg-green-600',
    orange: 'bg-orange-600', cyan: 'bg-cyan-600', indigo: 'bg-indigo-600',
};

export default function ServicesOverview() {
    const [activeServiceId, setActiveServiceId] = useState<string | null>(null);
    const activeService = services.find((s: any) => s.id === activeServiceId) || services[0];

    const ActiveIcon = iconMap[activeService.iconName] || Globe;

    return (
        <section className="py-16 md:py-24 bg-background relative overflow-hidden flex items-center md:pt-40 lg:min-h-[90vh]">
            {/* Consistent Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
            
            {/* Dynamic Background Gradient */}
            <div className="absolute inset-x-0 top-0 h-full overflow-hidden pointer-events-none">
                <AnimatePresence mode="wait">
                    <AnimatedDiv key={activeService.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 0.15, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.2 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className={cn("absolute -top-[20%] -right-[10%] w-[600px] md:w-[1200px] h-[600px] md:h-[1200px] rounded-full blur-[100px] md:blur-[150px]", bgColorMap[activeService.color] || 'bg-indigo-600')}
                    />
                </AnimatePresence>
            </div>

            <div className="container px-4 mx-auto relative z-10">
                <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 items-start">
                    
                    {/* Left: Navigation Menu (Horizontal Scroll on Mobile) */}
                    <div className="w-full lg:w-1/3 relative">
                        <AnimatedDiv 
                            initial={{ opacity: 0, x: -50 }}
                            style={{ willChange: "transform, opacity" }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                            className="space-y-6 sticky top-24"
                        >
                            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-8 md:mb-12 tracking-tight">Our Expertise</h2>
                            
                            <div className="flex lg:flex-col overflow-x-auto pb-4 lg:pb-0 gap-4 lg:gap-3 no-scrollbar snap-x touch-pan-x">
                                {services.map((service: any) => {
                                    const Icon = iconMap[service.iconName] || Globe;
                                    const isActive = activeService.id === service.id;
                                    return (
                                        <button key={service.id}
                                            onClick={() => setActiveServiceId(service.id)}
                                            className="group lg:w-full text-left flex-shrink-0 snap-center outline-none focus:outline-none"
                                        >
                                            <div className={cn(
                                                "p-4 md:p-5 rounded-2xl transition-all duration-300 border backdrop-blur-sm min-w-[260px] lg:min-w-0 flex items-center gap-4 group-hover:bg-accent/50 group-focus-visible:ring-2 group-focus-visible:ring-primary",
                                                isActive 
                                                    ? "bg-card/80 border-primary/20 shadow-xl shadow-primary/5 lg:translate-x-2" 
                                                    : "bg-transparent border-transparent text-muted-foreground hover:text-foreground"
                                            )}>
                                                <div className={cn(
                                                    "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 shadow-sm",
                                                    isActive 
                                                        ? "bg-primary text-primary-foreground scale-110 shadow-lg shadow-primary/20" 
                                                        : "bg-muted/50 group-hover:bg-primary/10 group-hover:text-primary"
                                                )}>
                                                    <Icon className="w-6 h-6" />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className={cn("font-bold text-lg transition-colors", isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground")}>
                                                        {service.label}
                                                    </h3>
                                                    {isActive && (
                                                        <AnimatedDiv 
                                                            layoutId="active-indicator"
                                                            className="h-1 w-8 bg-primary rounded-full mt-2"
                                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </AnimatedDiv>
                    </div>

                    {/* Right: Dynamic Content Area */}
                    <div className="w-full lg:w-2/3 min-h-[600px]">
                        <AnimatePresence mode="wait">
                            <AnimatedDiv key={activeService.id}
                                initial={{ opacity: 0, x: 20, filter: "blur(10px)" }}
                                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                                exit={{ opacity: 0, x: -20, filter: "blur(10px)" }}
                                transition={{ duration: 0.5, ease: "circOut" }}
                                className="relative"
                            >
                                {/* Decorative Icon Background */}
                                <ActiveIcon className="absolute -top-10 -right-10 w-64 h-64 md:w-96 md:h-96 opacity-[0.02] text-foreground rotate-12 pointer-events-none" />

                                <AnimatedDiv 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                >
                                    <Badge variant="outline" className="gap-2 px-3 py-1 bg-primary/10 border-primary/20 text-primary mb-6 backdrop-blur-sm">
                                        <Sparkles className="w-3.5 h-3.5" />
                                        Premium Service
                                    </Badge>
                                </AnimatedDiv>
                                
                                <AnimatedH3 
                                    className="text-4xl md:text-7xl font-semibold mb-6 leading-[0.9] tracking-tight"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    {activeService.title}
                                </AnimatedH3>
                                
                                <AnimatedP 
                                    className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8 max-w-2xl"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    {activeService.description}
                                </AnimatedP>

                                {/* Tech Stack Tags */}
                                {activeService.techs && (
                                    <AnimatedDiv 
                                        className="flex flex-wrap gap-2 mb-12"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.4 }}
                                    >
                                        {activeService.techs.map((tech: string, i: number) => (
                                            <span 
                                                key={i}
                                                className="px-3 py-1.5 rounded-md bg-muted/50 border border-border/50 text-xs font-bold text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors cursor-default"
                                            >
                                                {tech}
                                            </span>
                                        ))}
                                    </AnimatedDiv>
                                )}

                                {/* Feature Cards Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 mb-12">
                                    {activeService.features.map((feature: any, idx: number) => {
                                        const FeatureIcon = iconMap[feature.iconName] || Zap;
                                        return (
                                        <AnimatedDiv key={idx}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.4 + (idx * 0.1), ease: "backOut" }}
                                        >
                                            <Card className="h-full border-border/40 bg-card/30 backdrop-blur-sm hover:bg-card/50 hover:border-primary/20 transition-all duration-300 group/card hover:-translate-y-1">
                                                <CardContent className="p-6">
                                                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary group-hover/card:scale-110 transition-transform">
                                                        <FeatureIcon className="w-5 h-5" />
                                                    </div>
                                                    <h4 className="font-bold mb-2 text-foreground/90 group-hover/card:text-primary transition-colors">{feature.title}</h4>
                                                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                                                </CardContent>
                                            </Card>
                                        </AnimatedDiv>
                                        );
                                    })}
                                </div>

                                <AnimatedDiv initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.7 }}
                                >
                                    <Button asChild size="lg" className="rounded-full h-12 px-8 font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.02] transition-all bg-primary text-primary-foreground">
                                        <Link href={`/services/${activeService.id}`}>
                                            Explore {activeService.label}
                                            <ArrowRight className="ml-2 w-5 h-5" />
                                        </Link>
                                    </Button>
                                </AnimatedDiv>

                            </AnimatedDiv>
                        </AnimatePresence>
                    </div>

                </div>
            </div>
        </section>
    );
}

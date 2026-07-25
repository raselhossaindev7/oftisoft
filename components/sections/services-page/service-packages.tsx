"use client"
import { AnimatedDiv, AnimatedSpan } from "@/lib/animated";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { 
    Check, Sparkles, Rocket, Crown, ArrowRight, Zap, RefreshCw, Plus, Save, Trash2, 
    LayoutTemplate, Grid, HelpCircle, Server, Database, Cloud, Brain, Smartphone, 
    Layout, Video, FileText, Code2, ClipboardCheck, HeartPulse, Globe, Code, ShieldCheck, Layers
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, EffectCreative, Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-creative";
import "swiper/css/navigation";
import { useCart } from "@/hooks/use-cart";

const iconMap: any = {
    Check, Sparkles, Rocket, Crown, ArrowRight, Zap, RefreshCw, Plus, Save, Trash2, 
    LayoutTemplate, Grid, HelpCircle, Server, Database, Cloud, Brain, Smartphone, 
    Layout, Video, FileText, Code2, ClipboardCheck, HeartPulse, Globe, Code, ShieldCheck, Layers
};

const pkgBgMap: Record<string, string> = {
    blue: 'from-blue-600/20 to-blue-600/5', purple: 'from-purple-600/20 to-purple-600/5',
    green: 'from-green-600/20 to-green-600/5', orange: 'from-orange-600/20 to-orange-600/5',
    indigo: 'from-indigo-600/20 to-indigo-600/5',
};

const packages = [
    { id: "web-starter", name: "Web App Starter", price: 2999, monthlyPrice: 499, description: "A complete MVP-ready web application — frontend, backend, database, and deployment.", features: ["React/Next.js Frontend", "Node.js API", "PostgreSQL Database", "Authentication", "Responsive Design", "1 Month Support"], color: "blue", iconName: "Globe" },
    { id: "mobile-starter", name: "Mobile App Starter", price: 4999, monthlyPrice: 799, description: "Cross-platform mobile application with backend, push notifications, and app store deployment.", features: ["React Native App", "REST API Backend", "Push Notifications", "App Store Deploy", "Analytics SDK", "2 Months Support"], color: "purple", iconName: "Smartphone" },
    { id: "ai-integration", name: "AI Integration", price: 7999, monthlyPrice: 1299, description: "Custom AI model development and integration — LLM, computer vision, or predictive analytics.", features: ["Model Selection & Training", "API Integration", "Prompt Engineering", "Performance Tuning", "Documentation", "3 Months Support"], color: "green", iconName: "Brain" },
    { id: "saas-platform", name: "SaaS Platform", price: 14999, monthlyPrice: 2199, description: "Full SaaS platform with multi-tenancy, subscription billing, and admin dashboard.", features: ["Multi-tenant Architecture", "Subscription Billing", "Admin Dashboard", "Team Management", "Audit Logging", "3 Months Support"], color: "orange", iconName: "Cloud", highlight: true },
    { id: "enterprise-suite", name: "Enterprise Suite", price: 29999, monthlyPrice: 3999, description: "Enterprise-grade solution with microservices, SSO, compliance, and dedicated infrastructure.", features: ["Microservices Architecture", "SSO & RBAC", "GDPR/HIPAA Compliance", "Dedicated Infrastructure", "24/7 On-Call Support", "6 Months Support"], color: "indigo", iconName: "Server" },
];

export default function ServicePackages() {
    const [billing, setBilling] = useState<'one-time' | 'monthly'>('one-time');

    return (
        <section className="py-16 md:py-24 bg-background relative overflow-hidden">
            {/* Consistent Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

            {/* Ambient Background */}
            <div className="absolute top-0 right-0 w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[400px] md:w-[500px] h-[400px] md:h-[500px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="container px-4 mx-auto relative z-10">
                <div className="text-center mb-12 md:mb-16 space-y-6">
                    <AnimatedDiv 
                        initial={{ opacity: 0, y: 20 }}
                        style={{ willChange: "transform, opacity" }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <Badge variant="outline" className="gap-2 px-3 py-1 bg-primary/10 border-primary/20 text-primary hover:bg-primary/20 transition-colors backdrop-blur-sm">
                            <Zap className="w-3.5 h-3.5" />
                            Pricing Plans
                        </Badge>
                    </AnimatedDiv>
                    
                    <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight">
                        Choose Your <span className="text-primary">Trajectory</span>
                    </h2>
                    
                    {/* Billing Toggle */}
                    <div className="flex justify-center items-center gap-4 mt-8">
                        <span className={cn("text-sm font-bold transition-colors cursor-pointer select-none", billing === 'one-time' ? "text-foreground" : "text-muted-foreground")} onClick={() => setBilling('one-time')}>One-time Payment</span>
                        <div
                            onClick={() => setBilling(b => b === 'one-time' ? 'monthly' : 'one-time')}
                            className="w-14 h-8 rounded-full bg-muted border border-border relative flex items-center p-1 cursor-pointer hover:border-primary/50 transition-colors"
                        >
                            <div
                                className="w-6 h-6 rounded-full bg-primary shadow-lg shadow-primary/30 transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                                style={{ transform: `translateX(${billing === 'one-time' ? 0 : 24}px)` }}
                            />
                        </div>
                        <span className={cn("text-sm font-bold transition-colors cursor-pointer select-none", billing === 'monthly' ? "text-foreground" : "text-muted-foreground")} onClick={() => setBilling('monthly')}>Monthly Retainer</span>
                    </div>
                </div>

                {/* Responsive Carousel */}
                <div className="relative group/swiper">
                    <Swiper modules={[Pagination, EffectCreative, Autoplay, Navigation]}
                        navigation={{
                            prevEl: '.pricing-prev',
                            nextEl: '.pricing-next',
                        }}
                        autoplay={{ delay: 5000, disableOnInteraction: true }}
                        grabCursor={true}
                        centeredSlides={false}
                        breakpoints={{
                            320: { slidesPerView: 1.1, spaceBetween: 20 },
                            768: { slidesPerView: 2.2, spaceBetween: 30 },
                            1024: { slidesPerView: 3, spaceBetween: 40 }
                        }}
                        pagination={{ clickable: true, dynamicBullets: true }}
                        className="!pb-16 !px-4"
                    >
                        {packages.map((pkg) => (
                            <SwiperSlide key={pkg.id} className="h-auto">
                                <PricingCard pkg={pkg} billing={billing} />
                            </SwiperSlide>
                        ))}
                    </Swiper>

                    {/* Desktop Navigation Buttons */}
                    <div className="hidden lg:block">
                        <button className="pricing-prev absolute left-[-20px] top-1/2 -translate-y-1/2 w-12 h-12 rounded-full border border-border bg-background/80 backdrop-blur-md flex items-center justify-center hover:bg-primary hover:text-white transition-all z-20 shadow-xl opacity-0 group-hover/swiper:opacity-100 -translate-x-4 group-hover/swiper:translate-x-0 hover:scale-110">
                            <ArrowRight className="w-5 h-5 rotate-180" />
                        </button>
                        <button className="pricing-next absolute right-[-20px] top-1/2 -translate-y-1/2 w-12 h-12 rounded-full border border-border bg-background/80 backdrop-blur-md flex items-center justify-center hover:bg-primary hover:text-white transition-all z-20 shadow-xl opacity-0 group-hover/swiper:opacity-100 translate-x-4 group-hover/swiper:translate-x-0 hover:scale-110">
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>

            </div>
        </section>
    );
}

function PricingCard({ pkg, billing }: { pkg: any, billing: 'one-time' | 'monthly' }) {
    const cart = useCart();
    const isCustom = typeof pkg.price === 'string' && isNaN(Number(pkg.price));
    const numericPrice = isCustom ? 0 : (billing === 'one-time' ? Number(pkg.price) : Number(pkg.monthlyPrice));
    const priceDisplay = isCustom ? pkg.price : (billing === 'one-time' ? `$${Number(pkg.price).toLocaleString()}` : `$${pkg.monthlyPrice}`);
    const Icon = iconMap[pkg.iconName] || Rocket;
    const period = isCustom ? '' : (billing === 'one-time' ? '' : '/mo');

    const handleAddToCart = () => {
        if (!isCustom) {
            cart.addItem({
                id: `${pkg.id}-${billing}`,
                name: `${pkg.name} (${billing === 'one-time' ? 'One-time' : 'Monthly'})`,
                price: numericPrice,
                image: '', 
                slug: `package-${pkg.id}`,
                type: 'service'
            });
            import('sonner').then(({ toast }) => {
                toast.success(`${pkg.name} added to cart`, {
                    description: `Billing: ${billing === 'one-time' ? 'One-time' : 'Monthly'}`,
                    action: {
                        label: "View Cart",
                        onClick: () => window.location.href = "/shop"
                    },
                });
            });
        }
    };

    return (
        <Card className={cn(
            "relative h-full flex flex-col rounded-[2.5rem] border transition-all duration-300 group hover:-translate-y-2 overflow-hidden bg-card/40 backdrop-blur-sm",
            pkg.highlight ? "border-primary/50 shadow-2xl shadow-primary/10" : "border-border hover:border-primary/30 hover:shadow-xl"
        )}>
             {/* Background Tint */}
             <div className={cn("absolute inset-0 bg-gradient-to-b opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none", pkgBgMap[pkg.color] || 'from-primary/20 to-primary/5')} />
             
             {/* Highlight Badge */}
             {pkg.highlight && (
                <div className="absolute top-0 right-0 p-4 z-20">
                    <Badge className="bg-primary text-primary-foreground shadow-lg shadow-primary/20 px-3 py-1 text-xs font-bold tracking-wider">
                        Most Popular
                    </Badge>
                </div>
             )}

            <CardHeader className="relative z-10 pb-2">
                <div className={cn("inline-flex w-fit p-3 rounded-2xl bg-background/50 border border-border mb-4 group-hover:scale-110 transition-transform duration-300 shadow-sm", pkg.highlight && "border-primary/20 bg-primary/10")}>
                     <Icon className={cn("w-6 h-6", pkg.highlight ? "text-primary" : "text-muted-foreground")} />
                </div>

                <CardTitle className="text-2xl font-bold">{pkg.name}</CardTitle>
                <CardDescription className="text-sm min-h-[40px] text-muted-foreground/80">{pkg.description}</CardDescription>
            </CardHeader>

            <CardContent className="relative z-10 flex-1 space-y-6">
                <div>
                    <div className="flex items-baseline gap-1">
                        <AnimatedSpan 
                            key={priceDisplay}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-5xl font-semibold tracking-tighter text-foreground"
                        >
                            {priceDisplay}
                        </AnimatedSpan>
                        <span className="text-muted-foreground font-medium">{period}</span>
                    </div>
                     {billing === 'monthly' && !isCustom && (
                        <Badge variant="secondary" className="mt-2 text-xs tracking-wide text-primary bg-primary/10 hover:bg-primary/20 border-primary/10">
                            Includes Maintenance
                        </Badge>
                    )}
                </div>

                <div className="space-y-4">
                    {pkg.features.map((feature: string, i: number) => (
                        <div key={i} className="flex items-start gap-3">
                            <div className={cn("mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-colors", pkg.highlight ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary")}>
                                <Check className="w-3 h-3" />
                            </div>
                            <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">{feature}</span>
                        </div>
                    ))}
                </div>
            </CardContent>

            <CardFooter className="relative z-10 pt-2">
                {isCustom ? (
                    <Button 
                        asChild 
                        className={cn(
                            "w-full rounded-2xl font-bold shadow-sm transition-all duration-300 h-14 text-base",
                            pkg.highlight ? "shadow-lg shadow-primary/25 hover:scale-[1.02] bg-primary text-primary-foreground" : "hover:bg-primary hover:text-primary-foreground"
                        )}
                        variant={pkg.highlight ? "default" : "outline"}
                    >
                        <Link href="#contact">
                            Contact Us <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </Button>
                ) : (
                    <Button 
                        onClick={handleAddToCart}
                        className={cn(
                            "w-full rounded-2xl font-bold shadow-sm transition-all duration-300 h-14 text-base",
                            pkg.highlight ? "shadow-lg shadow-primary/25 hover:scale-[1.02] bg-primary text-primary-foreground" : "hover:bg-primary hover:text-primary-foreground"
                        )}
                        variant={pkg.highlight ? "default" : "outline"}
                    >
                        Add to Cart <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}

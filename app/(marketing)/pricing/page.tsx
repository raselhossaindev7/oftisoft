"use client"
import { AnimatedDiv, AnimatedH1, AnimatedH2, AnimatedH3, AnimatedP } from "@/lib/animated";

import { useMemo } from "react";
import { usePublicSubscriptionPlans, mapSubscriptionPlansToPricing } from "@/hooks/usePublicMarketing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Check, Zap, Rocket, Shield, Globe, Terminal, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

import { usePricingContentStore } from "@/lib/store/pricing-content";
import { useCart } from "@/hooks/use-cart";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import CTA from "@/components/sections/cta";

export default function PricingPage() {
    const { data: apiPlans = [] } = usePublicSubscriptionPlans('month');
    const { content } = usePricingContentStore();
    const cart = useCart();

    const plansFromApi = useMemo(() => mapSubscriptionPlansToPricing(apiPlans), [apiPlans.length]);
    const plans = plansFromApi.length > 0 ? plansFromApi : (content?.plans || []);

    const handleAddToCart = (plan: any) => {
        const isNumeric = !isNaN(Number(plan.price));
        if (isNumeric) {
             cart.addItem({
                id: `plan-${plan.name}`,
                name: `${plan.name} License`,
                price: Number(plan.price),
                image: '',
                slug: `plan-${plan.name.toLowerCase().replace(/\s+/g, '-')}`,
                type: 'service'
            });
        }
    };

    const header = content?.header ?? { badge: "Pricing", titlePrefix: "Pricing", titleHighlight: "That fits", description: "Straightforward pricing for content, website, and SEO work that actually needs to be used." };
    const consultation = content?.consultation ?? { text: "Need a custom scope or larger rollout?", linkText: "Book a consultation" };
    return (
        <div className="relative min-h-screen pt-32 pb-24 bg-[#020202]">
            {/* Neural Background Matrix */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[20%] left-[-10%] w-[70vw] h-[70vw] bg-primary/10 rounded-full blur-[140px] opacity-40 animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-blue-600/5 rounded-full blur-[120px] opacity-30" />
            </div>

            <div className="container px-4 mx-auto relative z-10">
                {/* Hero Header */}
                <div className="text-center space-y-6 max-w-4xl mx-auto mb-16 md:mb-20">
                    <AnimatedDiv initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                        <Badge variant="outline" className="px-6 py-2 rounded-full border-primary/30 bg-primary/5 text-primary font-semibold tracking-[0.2em] text-xs shadow-[0_0_20px_rgba(var(--primary),0.2)]">
                            {header?.badge ?? ""}
                        </Badge>
                    </AnimatedDiv>
                    <AnimatedH1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tighter text-white"
                    >
                        {header?.titlePrefix ?? ""} <span className="text-primary underline decoration-white/10 decoration-8 underline-offset-8">{header?.titleHighlight ?? ""}</span>.
                    </AnimatedH1>
                    <AnimatedP className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">
                        {header?.description ?? ""}
                    </AnimatedP>
                </div>

                {/* Pricing Cards */}
                <div className="grid lg:grid-cols-3 gap-8 mb-20 md:mb-24">
                    {plans.map((plan, idx) => (
                        <AnimatedDiv key={plan.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1, duration: 0.6 }}
                            style={{ willChange: "transform, opacity" }}
                        >
                            <Card className={cn(
                                "relative h-full border-white/5 bg-white/[0.02] backdrop-blur-3xl rounded-3xl overflow-hidden hover:border-primary/40 transition-all duration-700 flex flex-col group",
                                plan.popular && "border-primary/30 ring-1 ring-primary/20 bg-primary/[0.03] hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/10"
                            )}>
                                {plan.popular && (
                                    <div className="absolute top-6 right-6">
                                        <Badge className="bg-primary text-white font-semibold text-xs tracking-[0.15em] px-4 py-1.5 shadow-xl shadow-primary/20">
                                            Most Popular
                                        </Badge>
                                    </div>
                                )}
                                <CardHeader className={cn("p-6 md:p-8 space-y-4 border-b border-white/5 bg-white/[0.01]", plan.popular && "pb-5")}>
                                    <div className="space-y-1">
                                        <h3 className="text-2xl font-semibold text-white leading-tight">{plan.name}</h3>
                                        <p className="text-sm text-muted-foreground font-medium">{plan.description}</p>
                                    </div>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl sm:text-4xl md:text-5xl font-semibold text-white tracking-tighter">${plan.price}</span>
                                        <span className="text-muted-foreground font-semibold text-xs tracking-[0.15em] uppercase">/ {plan.period ?? ""}</span>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6 md:p-8 space-y-5 flex-1">
                                    <ul className="space-y-4">
                                        {(Array.isArray(plan.features) ? plan.features : []).map((feature: string, i: number) => (
                                            <li key={i} className="flex items-start gap-3 text-white/70 group/item">
                                                <div className="mt-0.5 w-5 h-5 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover/item:bg-primary group-hover/item:text-white transition-all duration-300">
                                                    <Check className="w-3 h-3 text-primary group-hover/item:text-white" />
                                                </div>
                                                <span className="text-sm leading-tight group-hover/item:text-white transition-colors">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                                <CardFooter className="p-6 md:p-8 pt-0">
                                    {!isNaN(Number(plan.price)) ? (
                                        <Button 
                                            onClick={() => handleAddToCart(plan)}
                                            className={cn(
                                                "w-full h-14 rounded-2xl font-bold transition-all duration-500 text-base shadow-2xl",
                                                plan.popular 
                                                    ? "bg-primary text-white shadow-primary/20 hover:scale-[1.02] active:scale-95" 
                                                    : "bg-white/5 text-white border border-white/10 hover:bg-white/10"
                                            )}
                                        >
                                            {plan.buttonText || "Get Started"} <ArrowRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    ) : (
                                        <Button asChild className={cn(
                                            "w-full h-14 rounded-2xl font-bold transition-all duration-500 text-base shadow-2xl",
                                            plan.popular 
                                                ? "bg-primary text-white shadow-primary/20 hover:scale-[1.02] active:scale-95" 
                                                : "bg-white/5 text-white border border-white/10 hover:bg-white/10"
                                        )}>
                                            <Link href="/contact">
                                                {plan.buttonText || "Contact Us"} <ArrowRight className="w-4 h-4 ml-2" />
                                            </Link>
                                        </Button>
                                    )}
                                </CardFooter>
                            </Card>
                        </AnimatedDiv>
                    ))}
                </div>

                {/* FAQ Section */}
                <div className="max-w-3xl mx-auto space-y-8 mb-16 md:mb-20">
                    <AnimatedDiv initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center space-y-4">
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tighter text-white">Frequently Asked <span className="text-primary underline decoration-white/10 decoration-4 underline-offset-4">Questions</span></h2>
                        <p className="text-muted-foreground text-lg">Everything you need to know about our pricing and plans.</p>
                    </AnimatedDiv>

                    <Accordion type="single" collapsible className="w-full">
                        {[
                            { q: "Can I switch plans anytime?", a: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate the billing." },
                            { q: "Is there a free trial available?", a: "We offer a 14-day free trial on the Growth plan so you can evaluate our services before committing." },
                            { q: "What payment methods do you accept?", a: "We accept all major credit cards, PayPal, and bank transfers for annual plans." },
                            { q: "Can I get a refund?", a: "Absolutely. If you're not satisfied within the first 14 days, we'll issue a full refund — no questions asked." },
                            { q: "Do you offer custom enterprise pricing?", a: "Yes, we tailor enterprise plans for larger teams with custom requirements. Contact our sales team for a quote." },
                            { q: "What does 'unlimited revisions' mean?", a: "It means you can request as many revision rounds as needed during the active subscription period with no extra cost." },
                        ].map((faq, i) => (
                            <AccordionItem key={i} value={`faq-${i}`} className="border-b border-white/10">
                                <AccordionTrigger className="text-left font-bold text-white py-5 hover:text-primary transition-colors text-base md:text-lg">
                                    {faq.q}
                                </AccordionTrigger>
                                <AccordionContent className="text-muted-foreground leading-relaxed pb-5 text-sm md:text-base">
                                    {faq.a}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>

                {/* Consultation Prompt */}
                <div className="text-center py-10 border-t border-white/5">
                    <p className="text-muted-foreground font-medium text-lg">
                        {consultation?.text ?? ""}{" "}
                        <Link href="/contact" className="text-primary underline decoration-primary/20 hover:text-primary/70 transition-colors cursor-pointer">
                            {consultation?.linkText ?? ""}
                        </Link>
                    </p>
                </div>

                {/* Bottom CTA */}
                <CTA />
            </div>
        </div>
    );
}

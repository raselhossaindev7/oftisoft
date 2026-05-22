"use client"
import { AnimatedDiv, AnimatedH1, AnimatedH2, AnimatedH3, AnimatedP } from "@/lib/animated";
;

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

    const plansFromApi = useMemo(() => mapSubscriptionPlansToPricing(apiPlans), [apiPlans]);
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

            <div className="container px-6 mx-auto relative z-10 space-y-24">
                <div className="text-center space-y-6 max-w-4xl mx-auto">
                    <AnimatedDiv initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                        <Badge variant="outline" className="px-6 py-2 rounded-full border-primary/30 bg-primary/5 text-primary font-semibold [0.3em] text-[10px] shadow-[0_0_20px_rgba(var(--primary),0.2)]">
                            {header?.badge ?? ""}
                        </Badge>
                    </AnimatedDiv>
                    <AnimatedH1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl sm:text-5xl md:text-8xl font-semibold tighter text-white"
                    >
                        {header?.titlePrefix ?? ""} <span className="text-primary underline decoration-white/10 decoration-8 underline-offset-8">{header?.titleHighlight ?? ""}</span>.
                    </AnimatedH1>
                    <AnimatedP className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">
                        {header?.description ?? ""}
                    </AnimatedP>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {plans.map((plan, idx) => (
                        <AnimatedDiv key={plan.name}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1, duration: 0.6 }}
                            style={{ willChange: "transform, opacity" }}
                        >
                            <Card className={cn(
                                "relative h-full border-white/5 bg-white/[0.02] backdrop-blur-3xl rounded-[50px] overflow-hidden hover:border-primary/40 transition-all duration-700 flex flex-col group",
                                plan.popular && "border-primary/30 ring-1 ring-primary/20 bg-primary/[0.03]"
                            )}>
                                {plan.popular && (
                                    <div className="absolute top-8 right-8">
                                        <Badge className="bg-primary text-white font-semibold text-[9px] widest px-4 py-1.5 shadow-xl shadow-primary/20">
                                            Architect Choice
                                        </Badge>
                                    </div>
                                )}
                                <CardHeader className="p-10 md:p-12 space-y-6 pb-6 border-b border-white/5 bg-white/[0.01]">
                                    <div className="space-y-2">
                                        <h3 className="text-3xl font-semibold text-white tight leading-none">{plan.name}</h3>
                                        <p className="text-sm text-muted-foreground font-medium">{plan.description}</p>
                                    </div>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl sm:text-4xl md:text-5xl font-semibold text-white tighter">${plan.price}</span>
                                        <span className="text-muted-foreground font-semibold text-[10px] widest">/ {plan.period ?? ""}</span>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-10 md:p-12 space-y-8 flex-1">
                                    <ul className="space-y-5">
                                        {(Array.isArray(plan.features) ? plan.features : []).map((feature: string, i: number) => (
                                            <li key={i} className="flex items-start gap-4 text-white/70 group/item">
                                                <div className="mt-1 w-5 h-5 rounded-lg bg-primary/10 flex items-center justify-center group-hover/item:bg-primary group-hover/item:text-white transition-all duration-300">
                                                    <Check className="w-3 h-3 text-primary group-hover/item:text-white" />
                                                </div>
                                                <span className="text-base font-bold tight group-hover/item:text-white transition-colors">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                                <CardFooter className="p-10 md:p-12 pt-0">
                                    {!isNaN(Number(plan.price)) ? (
                                        <Button 
                                            onClick={() => handleAddToCart(plan)}
                                            className={cn(
                                                "w-full h-16 rounded-2xl font-black transition-all duration-500 text-lg shadow-2xl",
                                                plan.popular 
                                                    ? "bg-primary text-white shadow-primary/20 hover:scale-[1.02] active:scale-95" 
                                                    : "bg-white/5 text-white border border-white/10 hover:bg-white/10"
                                            )}
                                        >
                                            {plan.buttonText} <ArrowRight className="w-5 h-5 ml-3" />
                                        </Button>
                                    ) : (
                                        <Button asChild className={cn(
                                            "w-full h-16 rounded-2xl font-black transition-all duration-500 text-lg shadow-2xl",
                                            plan.popular 
                                                ? "bg-primary text-white shadow-primary/20 hover:scale-[1.02] active:scale-95" 
                                                : "bg-white/5 text-white border border-white/10 hover:bg-white/10"
                                        )}>
                                            <Link href="/contact">
                                                {plan.buttonText} <ArrowRight className="w-5 h-5 ml-3" />
                                            </Link>
                                        </Button>
                                    )}
                                </CardFooter>
                            </Card>
                        </AnimatedDiv>
                    ))}
                </div>

                {/* Comparison Table */}
                <div className="space-y-8">
                    <AnimatedDiv initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center space-y-4">
                        <h2 className="text-4xl md:text-5xl font-semibold tighter text-white">Compare <span className="text-primary underline decoration-white/10 decoration-4 underline-offset-4">Plans</span></h2>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">See exactly what each plan includes and find the right fit for your business.</p>
                    </AnimatedDiv>

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b border-white/10">
                                    <th className="text-left py-6 pr-8 text-muted-foreground font-semibold text-sm">Feature</th>
                                    {plans.map(p => (
                                        <th key={p.name} className={cn("py-6 px-6 text-center font-bold text-lg", p.popular && "text-primary")}>
                                            {p.name}
                                            {p.popular && <div className="text-[10px] font-normal text-primary mt-1 widest">BEST VALUE</div>}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    { label: "Pages Included", values: ["Up to 5", "Up to 15", "Unlimited"] },
                                    { label: "SEO Optimization", values: ["Basic", "Advanced", "Full Suite"] },
                                    { label: "Revisions", values: ["1 Round", "Priority Round", "Unlimited"] },
                                    { label: "Content Strategy", values: ["—", "Included", "Custom Roadmap"] },
                                    { label: "Support", values: ["Email", "Priority Email", "24/7 Priority"] },
                                    { label: "Custom Integrations", values: ["—", "—", "Included"] },
                                ].map((row, i) => (
                                    <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                        <td className="py-5 pr-8 text-white/80 font-medium">{row.label}</td>
                                        {row.values.map((v, j) => (
                                            <td key={j} className={cn("py-5 px-6 text-center", v === "—" ? "text-muted-foreground/40" : "text-white/90 font-medium")}>
                                                {v === "—" ? "—" : v}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="max-w-3xl mx-auto space-y-8">
                    <AnimatedDiv initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center space-y-4">
                        <h2 className="text-4xl md:text-5xl font-semibold tighter text-white">Frequently Asked <span className="text-primary underline decoration-white/10 decoration-4 underline-offset-4">Questions</span></h2>
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
                                <AccordionTrigger className="text-left font-bold text-white py-6 hover:text-primary transition-colors text-lg">
                                    {faq.q}
                                </AccordionTrigger>
                                <AccordionContent className="text-muted-foreground leading-relaxed pb-6 text-base">
                                    {faq.a}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>

                {/* Consultation Prompt */}
                <div className="text-center">
                    <p className="text-muted-foreground font-medium text-lg">
                        {consultation?.text ?? ""} <Link href="/contact" className="text-primary underline decoration-primary/20 hover:text-primary/70 transition-colors cursor-pointer">{consultation?.linkText ?? ""}</Link>
                    </p>
                </div>

                {/* Bottom CTA */}
                <CTA />
            </div>
        </div>
    );
}


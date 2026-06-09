import { AnimatedDiv, AnimatedH1, AnimatedH2, AnimatedH3, AnimatedP } from "@/lib/animated";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
    RotateCcw,
    ShoppingBag,
    Code,
    CreditCard,
    Clock,
    MailQuestion,
    Ban,
    CircleCheck
} from "lucide-react";

const iconMap: any = {
    RotateCcw, ShoppingBag, Code, CreditCard, Clock, MailQuestion, Ban, CircleCheck
};

const pageData = {
    header: { badge: "REFUND & RETURN", titlePrefix: "Money-Back", titleHighlight: "Guarantee", description: "We stand behind every product and service we sell. If you're not satisfied, we'll make it right. This policy outlines our refund, return, and cancellation terms." },
    categories: [
        { id: "digital-products", iconName: "ShoppingBag", color: "text-emerald-400", title: "Digital Products", items: [
            { label: "Eligibility Window", detail: "14 days from the date of purchase." },
            { label: "Condition", detail: "The product must not have been downloaded or accessed more than 5 times. Volume licenses are not eligible once any seat has been activated." },
            { label: "Process", detail: "Submit a refund request through your dashboard. Once approved, access is revoked and the amount is returned to your original payment method within 5-7 business days." },
        ]},
        { id: "subscriptions", iconName: "CreditCard", color: "text-blue-400", title: "Subscription Plans", items: [
            { label: "Monthly Plans", detail: "Cancel anytime before the next billing cycle. No partial refunds for the current month. You keep access until the end of the paid period." },
            { label: "Annual Plans", detail: "Full refund within 14 days of renewal. After 14 days, a pro-rated refund is issued for the remaining months minus a 15% admin fee." },
            { label: "Lifetime Deals", detail: "Lifetime purchases are final. No refunds are issued after 14 days from the purchase date since access remains active indefinitely." },
        ]},
        { id: "services", iconName: "Code", color: "text-purple-400", title: "Custom Development Services", items: [
            { label: "Project Cancellation", detail: "You may cancel a project within 3 business days of signing the Statement of Work for a full refund of any deposit paid. After 3 days, refunds are pro-rated based on work completed." },
            { label: "Milestone Disputes", detail: "If a milestone deliverable does not match the agreed specifications, we will rework it at no additional cost. If unresolved after two revision rounds, you may request a refund for that specific milestone." },
            { label: "Dissatisfaction", detail: "We want you to love the result. If you're unhappy with the final delivery, we offer a single revision pass. If the issue remains unresolved, a partial refund may be negotiated based on the scope of work actually delivered." },
        ]},
        { id: "exclusions", iconName: "Ban", color: "text-red-400", title: "Non-Refundable Items", items: [
            { label: "Domain Registrations", detail: "Domains purchased or transferred through our platform are non-refundable once registered." },
            { label: "Third-Party Licenses", detail: "Any third-party software licenses, API credits, or subscription fees paid on your behalf are non-refundable." },
            { label: "Expedited Delivery", detail: "Fees paid for expedited or rush delivery are non-refundable even if the main order is refunded." },
            { label: "Consulting Calls", detail: "One-on-one consulting sessions, code reviews, and audit engagements are non-refundable once the session has been delivered." },
        ]},
        { id: "process", iconName: "RotateCcw", color: "text-amber-400", title: "How to Request a Refund", items: [
            { label: "Step 1", detail: "Log in to your Oftisoft dashboard and navigate to the Billing section." },
            { label: "Step 2", detail: "Find the order or subscription you want to refund and click 'Request Refund'." },
            { label: "Step 3", detail: "Select the reason for your refund and submit the request. Our team reviews all requests within 24 hours." },
            { label: "Step 4", detail: "If approved, the refund is processed to your original payment method. You will receive a confirmation email with the details." },
        ]},
        { id: "timeline", iconName: "Clock", color: "text-cyan-400", title: "Processing Timeline", items: [
            { label: "Stripe / Credit Card", detail: "5-7 business days after approval." },
            { label: "PayPal", detail: "24-48 hours after approval." },
            { label: "Bank Transfer", detail: "3-10 business days depending on your bank." },
        ]},
    ],
    guarantee: {
        title: "No-Questions-Asked Refunds",
        description: "If you're not satisfied within the first 14 days of any digital product purchase, we'll issue a full refund. No forms to fill. No hoops to jump through. Just email support or click the refund button in your dashboard.",
        stats: [
            { value: "14 Days", label: "COVERAGE PERIOD" },
            { value: "< 24 hrs", label: "AVG RESPONSE TIME" },
            { value: "100%", label: "SATISFACTION OR REFUND" },
        ]
    },
    footer: { status: "This policy was last updated on June 1, 2026. We reserve the right to update this policy at any time. Active refund requests at the time of a policy change will be honored under the previous terms." }
};

export default function RefundPage() {
    const { header, categories, guarantee, footer } = pageData;

    return (
        <div className="relative min-h-screen pt-32 pb-24 bg-[#020202]">
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-emerald-600/10 rounded-full blur-[140px] opacity-40" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-primary/5 rounded-full blur-[120px] opacity-30" />
                <div className="absolute inset-0 bg-grain opacity-[0.02]" />
            </div>

            <div className="container px-6 mx-auto relative z-10 space-y-24">
                <div className="text-center space-y-6 max-w-4xl mx-auto">
                    <AnimatedDiv initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                        <Badge variant="outline" className="px-6 py-2 rounded-full border-emerald-500/30 bg-emerald-500/5 text-emerald-400 font-semibold tracking-[0.3em] text-[10px]">
                            {header?.badge ?? ""}
                        </Badge>
                    </AnimatedDiv>
                    <AnimatedH1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-8xl font-semibold tracking-tighter text-white"
                    >
                        {header?.titlePrefix ?? ""} <span className="text-emerald-500">{header?.titleHighlight ?? ""}</span>.
                    </AnimatedH1>
                    <AnimatedP className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto">
                        {header?.description ?? ""}
                    </AnimatedP>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-7xl mx-auto">
                    {categories.map((cat, idx) => {
                        const CatIcon = iconMap[cat.iconName] || RotateCcw;
                        return (
                        <AnimatedDiv key={cat.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-80px" }}
                            transition={{ delay: idx * 0.1 }}
                            style={{ willChange: "transform, opacity" }}
                        >
                            <Card className="group h-full border-white/5 bg-white/[0.02] backdrop-blur-3xl rounded-[40px] overflow-hidden hover:border-emerald-500/30 hover:bg-white/[0.04] transition-all duration-700">
                                <CardContent className="p-10 space-y-8">
                                    <div className="flex items-center gap-5">
                                        <div className={cn("w-14 h-14 rounded-2xl bg-muted/30 flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-6 shrink-0", cat.color)}>
                                            <CatIcon size={28} />
                                        </div>
                                        <h3 className="text-2xl font-semibold text-white tracking-tight leading-tight">{cat.title}</h3>
                                    </div>
                                    <div className="space-y-6">
                                        {cat.items.map((item, i) => (
                                            <div key={i} className="border-b border-white/5 pb-5 last:border-none last:pb-0">
                                                <div className="flex items-start gap-3">
                                                    <CircleCheck size={16} className="text-emerald-500/70 mt-1 shrink-0" />
                                                    <div className="space-y-1">
                                                        <h4 className="text-sm font-bold text-white/80 tracking-wide">{item.label}</h4>
                                                        <p className="text-sm text-muted-foreground font-medium leading-relaxed">{item.detail}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </AnimatedDiv>
                        );
                    })}
                </div>

                <div className="bg-gradient-to-br from-emerald-500/5 via-background to-background border border-white/10 rounded-[50px] p-12 md:p-20 relative overflow-hidden group">
                     <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none group-hover:scale-125 transition-transform duration-1000" />
                     <div className="grid lg:grid-cols-2 gap-12 items-center relative z-10">
                            <div className="space-y-6">
                                <div className="flex items-center gap-4 text-emerald-500">
                                    <RotateCcw size={40} />
                                    <h2 className="text-4xl md:text-6xl font-semibold tracking-tighter text-white">{guarantee?.title ?? ""}</h2>
                                </div>
                                <p className="text-xl text-muted-foreground font-medium leading-relaxed">
                                    {guarantee?.description ?? ""}
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-end">
                                {guarantee?.stats.map((stat, i) => (
                                    <Card key={i} className="bg-white/5 border-white/10 rounded-3xl p-6 text-center space-y-2">
                                        <h4 className="text-2xl font-semibold text-white tracking-tight">{stat.value}</h4>
                                        <p className="text-[9px] font-semibold text-emerald-400 tracking-widest">{stat.label}</p>
                                    </Card>
                                ))}
                            </div>
                     </div>
                </div>

                <div className="pt-12 text-center">
                    <p className="text-[10px] font-semibold tracking-[0.4rem] text-muted-foreground">
                        {footer?.status ?? ""}
                    </p>
                </div>
            </div>
        </div>
    );
}

"use client"
import { AnimatedDiv, AnimatedH1, AnimatedH2, AnimatedH3 } from "@/lib/animated";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
    HelpCircle, MessageSquare, ArrowRight, Headset, Bot, Clock, Search, ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ComponentType<{ className?: string; size?: number }>> = {
    Bot, MessageSquare, HelpCircle, Clock, Headset, ShieldCheck
};

const pageData = {
    header: { badge: "24/7 SUPPORT", title: "Help Center Support.", searchPlaceholder: "Search for answers, guides, or topics..." },
    channels: [
        { id: "chat", iconName: "MessageSquare", color: "text-blue-400", title: "Live Chat", desc: "Real-time support from our engineering team. Average response: < 2 minutes." },
        { id: "ticket", iconName: "Bot", color: "text-purple-400", title: "Ticket System", desc: "Submit a detailed ticket and get a response within 4 hours during business hours." },
        { id: "email", iconName: "Headset", color: "text-green-400", title: "Email Support", desc: "For non-urgent inquiries. We respond to all emails within 24 hours." },
    ],
    faq: {
        badge: "KNOWLEDGE BASE",
        title: "Frequently Asked Questions",
        items: [
            { id: "f1", q: "What is your typical project timeline?", a: "Most web applications take 4-8 weeks for an MVP. Mobile apps 6-12 weeks. We'll provide a precise estimate during the discovery phase." },
            { id: "f2", q: "Do you offer post-launch support?", a: "Yes. Every project includes a support period of 1-6 months. We also offer ongoing maintenance retainers for monitoring updates and feature development." },
            { id: "f3", q: "Can you work with our existing team?", a: "Absolutely. We regularly integrate with in-house teams through pair programming code reviews and collaborative sprint planning." },
            { id: "f4", q: "What technologies do you specialize in?", a: "Our core expertise is React/Next.js, Node.js, Python, TypeScript PostgreSQL and AWS. We're technology-agnostic and choose the best stack for your project." },
        ]
    },
    priorityRelay: {
        title: "Priority Relay",
        description: "Critical issue? Our priority support channel routes your request directly to our senior engineering team with guaranteed 1-hour response.",
        buttons: [
            { iconName: "HelpCircle", variant: "default" as const, label: "Emergency Contact" },
            { iconName: "ShieldCheck", variant: "outline" as const, label: "Schedule Call" },
        ],
        metrics: [
            { id: "m1", iconName: "Clock", label: "CRITICAL RESPONSE", value: "< 1 Hour" },
            { id: "m2", iconName: "Headset", label: "AVAILABLE ENGINEERS", value: "12 Online" },
            { id: "m3", iconName: "CheckCircle2", label: "RESOLUTION RATE", value: "98.5%" },
        ]
    }
};

export default function SupportPage() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const { header, channels, faq, priorityRelay } = pageData;

    const handleConnect = () => {
        router.push("/dashboard/support");
    };

    const filteredFaq = faq.items.filter((item: any) => 
        item.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.a.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="relative min-h-screen pt-32 pb-24 bg-[#020202]">
            {/* Background Texture & Orbs */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[80vw] h-[80vw] bg-primary/10 rounded-full blur-[160px] opacity-40 animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-indigo-600/5 rounded-full blur-[140px] opacity-30" />
                <div className="absolute inset-0 bg-grain opacity-[0.02]" />
            </div>

            <div className="container px-6 mx-auto relative z-10 space-y-24">
                {/* Header Section */}
                <div className="text-center space-y-8 max-w-4xl mx-auto">
                    <AnimatedDiv initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                        <Badge variant="outline" className="px-6 py-2 rounded-full border-primary/30 bg-primary/5 text-primary font-semibold tracking-[0.3em] text-xs shadow-[0_0_20px_rgba(var(--primary),0.2)]">
                            {header.badge}
                        </Badge>
                    </AnimatedDiv>
                    <AnimatedH1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-8xl font-semibold tracking-tighter text-white"
                    >
                        {header.title.split(" ").map((word, i) => (
                            <span key={i} className={cn(i === 1 ? "text-primary NOT-italic" : "")}>
                                {word}{" "}
                            </span>
                        ))}
                    </AnimatedH1>
                    
                    <AnimatedDiv 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="relative max-w-2xl mx-auto group"
                    >
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input 
                            placeholder={header.searchPlaceholder}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-16 pl-16 rounded-[24px] bg-white/5 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-primary/50 text-lg font-bold shadow-2xl transition-all"
                        />
                    </AnimatedDiv>
                </div>

                {/* Primary Support Channels */}
                <div className="grid md:grid-cols-3 gap-8">
                    {channels.map((channel, idx) => {
                        const Icon = iconMap[channel.iconName] || Bot;
                        return (
                            <AnimatedDiv key={channel.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ delay: idx * 0.1 }} style={{ willChange: "transform, opacity" }}>
                                <Card className="h-full border-white/5 bg-white/[0.02] backdrop-blur-3xl rounded-[40px] overflow-hidden hover:border-primary/30 hover:bg-white/[0.04] transition-all duration-700 cursor-pointer group" onClick={handleConnect}>
                                    <CardContent className="p-10 space-y-6 flex flex-col items-center text-center">
                                        <div className={cn("w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-6", channel.color)}>
                                            <Icon size={36} />
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="text-2xl font-semibold text-white tracking-tight leading-tight">{channel.title}</h3>
                                            <p className="text-sm text-muted-foreground font-medium leading-relaxed">{channel.desc}</p>
                                        </div>
                                        <Button variant="ghost" className="h-10 text-primary font-semibold tracking-widest text-xs hover:bg-transparent group/btn">
                                            Initiate Connection <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-2 transition-transform" />
                                        </Button>
                                    </CardContent>
                                </Card>
                            </AnimatedDiv>
                        );
                    })}
                </div>

                {/* FAQ Grid */}
                <div className="space-y-12">
                    <div className="text-center space-y-4">
                        <Badge variant="outline" className="px-6 py-2 rounded-full mb-2">{faq.badge}</Badge>
                        <h2 className="text-4xl md:text-6xl font-semibold tracking-tighter text-white underline decoration-white/10 underline-offset-8">{faq.title}</h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {filteredFaq.length > 0 ? (
                            filteredFaq.map((item: any) => (
                                <Card key={item.id} className="border-white/5 bg-white/[0.01] rounded-[40px] p-10 space-y-6 hover:bg-white/[0.02] transition-all group">
                                    <div className="flex items-start gap-6">
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 transition-transform group-hover:scale-110">
                                            <HelpCircle size={20} />
                                        </div>
                                        <div className="space-y-3">
                                            <h4 className="text-xl font-semibold text-white tracking-tight leading-tight">{item.q}</h4>
                                            <p className="text-base text-muted-foreground font-medium leading-relaxed">{item.a}</p>
                                        </div>
                                    </div>
                                </Card>
                            ))
                        ) : (
                            <div className="col-span-2 text-center text-muted-foreground py-12">
                                No answers found for your query. Please initiate a connection for personal assistance.
                            </div>
                        )}
                    </div>
                </div>

                {/* Direct High-Fidelity Support */}
                <div className="bg-gradient-to-br from-primary/10 to-transparent border border-white/10 rounded-[50px] p-12 md:p-24 overflow-hidden relative group shadow-2xl shadow-primary/5">
                    <div className="absolute top-0 right-0 w-[70vw] h-[70vw] max-w-[500px] max-h-[500px] bg-primary/10 blur-[140px] rounded-full pointer-events-none group-hover:scale-110 transition-transform duration-1000" />
                    <div className="grid lg:grid-cols-2 gap-16 items-center relative z-10">
                        <div className="space-y-8 text-center lg:text-left">
                            <div className="flex flex-col lg:flex-row items-center gap-4 text-primary">
                                <Headset size={48} />
                                <h2 className="text-4xl md:text-7xl font-semibold tracking-tighter text-white">{priorityRelay.title}</h2>
                            </div>
                            <p className="text-xl text-muted-foreground font-medium leading-relaxed">
                                {priorityRelay.description}
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                {priorityRelay.buttons.map((btn, idx) => {
                                    const BtnIcon = iconMap[btn.iconName] || Bot;
                                    return (
                                        <Button 
                                            key={idx}
                                            variant={btn.variant}
                                            onClick={handleConnect}
                                            className={cn(
                                                "h-16 px-12 rounded-[22px] font-black italic text-lg shadow-2xl transition-all active:scale-95 group/btn",
                                                btn.variant === "default" ? "bg-primary hover:bg-primary/90 text-white shadow-primary/30" : "border-white/10 bg-white/5 text-white hover:bg-white/10"
                                            )}
                                        >
                                            {btn.label} <BtnIcon className="w-5 h-5 ml-3" />
                                        </Button>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="hidden lg:flex flex-col gap-6">
                            {priorityRelay.metrics.map((metric) => {
                                const MetricIcon = iconMap[metric.iconName] || Clock;
                                return (
                                    <Card key={metric.id} className="bg-white/2 border-white/5 rounded-3xl p-8 space-y-4">
                                        <div className="flex items-center gap-3 text-primary">
                                            <MetricIcon size={20} />
                                            <span className="text-xs font-semibold tracking-widest">{metric.label}</span>
                                        </div>
                                        <h4 className="text-3xl font-semibold text-white tracking-tight">{metric.value}</h4>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


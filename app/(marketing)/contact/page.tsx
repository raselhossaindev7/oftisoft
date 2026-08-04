"use client"
import { AnimatedDiv, AnimatedH1, AnimatedH2, AnimatedH3, AnimatedP } from "@/lib/animated";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
    Mail, MapPin, Phone, Send, Globe, Zap, Terminal, Bot, Headset, ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLeads } from "@/hooks/useLeads";
import { useRef } from "react";

const iconMap: Record<string, React.ComponentType<{ className?: string; size?: number }>> = {
    Mail, MapPin, Phone, Send, Globe, Zap, Terminal, Bot, Headset, ShieldCheck
};

const pageData = {
    header: { badge: "CONNECT", titlePrefix: "Let's ", titleHighlight: "Talk", titleSuffix: "", description: "Have a project in mind? We'd love to hear about it. Schedule a free 15-minute discovery call." },
    contactInfo: [
        { id: "email", iconName: "Mail", color: "text-blue-400", title: "EMAIL", value: "oftisoft@gmail.com" },
        { id: "phone", iconName: "Phone", color: "text-green-400", title: "PHONE", value: "+8801757220402" },
        { id: "location", iconName: "MapPin", color: "text-purple-400", title: "HQ", value: "Satkhira, Khulna, Bangladesh" },
    ],
    statusNode: { title: "RESPONSE TIME", status: "Under 1hr", latencyText: "Average response time during business hours. Typically within 30 minutes." },
    form: { title: "Send a Message", description: "Fill out the form below and our team will get back to you within 24 hours.", nameLabel: "YOUR NAME", emailLabel: "EMAIL ADDRESS", subjectLabel: "SUBJECT", messageLabel: "MESSAGE", buttonText: "Send Message" },
    footer: { encryptedText: "256-bit encrypted • GDPR compliant", agentText: "Powered by human engineers + AI" }
};

export default function ContactPage() {
    const { header, contactInfo, statusNode, form, footer } = pageData;
    const { createLead, isCreating } = useLeads();
    const formRef = useRef<HTMLFormElement>(null);

    const handleContactSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = {
            name: formData.get('name') as string,
            email: formData.get('email') as string,
            message: formData.get('message') as string,
            type: 'contact' as any,
            metadata: {
                subject: formData.get('subject') as string
            }
        };

        createLead(data, {
            onSuccess: () => {
                formRef.current?.reset();
            }
        });
    };

    return (
        <div className="relative min-h-screen pt-32 pb-24 bg-[#020202]">
            {/* Background Neural Matrices */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[80vw] h-[80vw] bg-primary/10 rounded-full blur-[160px] opacity-40" />
                <div className="absolute bottom-[10%] right-[-10%] w-[60vw] h-[60vw] bg-indigo-600/5 rounded-full blur-[140px] opacity-30" />
                <div className="absolute inset-0 bg-grain opacity-[0.02]" />
            </div>

            <div className="container px-6 mx-auto relative z-10">
                <div className="grid lg:grid-cols-12 gap-16 md:gap-24 items-start">
                    
                    {/* Left Intelligence Column */}
                    <div className="lg:col-span-12 xl:col-span-5 space-y-12">
                        <div className="space-y-6">
                            <AnimatedDiv initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                                <Badge variant="outline" className="px-6 py-2 rounded-full border-primary/30 bg-primary/5 text-primary font-semibold tracking-[0.3em] text-xs">
                                    {header?.badge ?? ""}
                                </Badge>
                            </AnimatedDiv>
                            <AnimatedH1 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-6xl md:text-8xl font-bold tracking-tighter text-white leading-[0.9]"
                            >
                                {header?.titlePrefix ?? ""} <span className="text-primary underline decoration-white/10 decoration-8 underline-offset-8">{header?.titleHighlight ?? ""}</span>{header?.titleSuffix ?? ""}
                            </AnimatedH1>
                            <AnimatedP className="text-xl text-muted-foreground font-medium leading-relaxed max-w-xl">
                                {header?.description ?? ""}
                            </AnimatedP>
                        </div>

                        <div className="space-y-8">
                            {contactInfo.map((item, idx) => {
                                const Icon = iconMap[item.iconName ?? ''] || MapPin;
                                return (
                                <AnimatedDiv key={item.id} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ delay: idx * 0.1 }} style={{ willChange: "transform, opacity" }} className="flex items-center gap-6 group">
                                    <div className={cn("w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center transition-all group-hover:scale-110 group-hover:bg-white/10", item.color)}>
                                        <Icon size={28} />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-xs font-semibold tracking-widest text-muted-foreground">{item.title}</h4>
                                        <p className="text-xl font-bold text-white tracking-tight">{item.value}</p>
                                    </div>
                                </AnimatedDiv>
                            );})}
                        </div>

                        {/* Status Node */}
                        <Card className="border-primary/20 bg-primary/[0.03] backdrop-blur-2xl rounded-[40px] p-8 space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold tracking-widest text-primary">{statusNode?.title ?? ""}</span>
                                <Badge className="bg-green-500 text-white font-semibold px-4 py-1 animate-pulse">{statusNode?.status ?? ""}</Badge>
                            </div>
                            <p className="text-sm font-bold text-white/60">{statusNode?.latencyText ?? ""}</p>
                        </Card>
                    </div>

                    {/* Right Communication Core */}
                    <div className="lg:col-span-12 xl:col-span-7">
                        <AnimatedDiv initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            <Card className="border-white/5 bg-white/[0.02] backdrop-blur-3xl rounded-[60px] overflow-hidden shadow-2xl relative">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
                                <CardHeader className="p-10 md:p-14 border-b border-white/5 space-y-4 relative z-10">
                                    <div className="flex items-center gap-4 text-primary">
                                        <Terminal size={32} />
                                        <h2 className="text-3xl md:text-5xl font-semibold tracking-tighter text-white">{form?.title ?? ""}</h2>
                                    </div>
                                    <p className="text-lg text-muted-foreground font-medium">{form?.description ?? ""}</p>
                                </CardHeader>
                                <CardContent className="p-10 md:p-14 space-y-8 relative z-10">
                                    <form ref={formRef} id="contact-form" onSubmit={handleContactSubmit} className="space-y-8">
                                        <div className="grid md:grid-cols-2 gap-8">
                                            <div className="space-y-3">
                                                <label htmlFor="contact-name" className="text-xs font-semibold tracking-widest text-muted-foreground ml-2">{form?.nameLabel ?? ""}</label>
                                                <Input id="contact-name" name="name" required className="h-16 rounded-2xl bg-white/5 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-primary/50 text-lg font-bold px-8 transition-all" placeholder="Architect Alpha" />
                                            </div>
                                            <div className="space-y-3">
                                                <label htmlFor="contact-email" className="text-xs font-semibold tracking-widest text-muted-foreground ml-2">{form?.emailLabel ?? ""}</label>
                                                <Input id="contact-email" name="email" required type="email" className="h-16 rounded-2xl bg-white/5 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-primary/50 text-lg font-bold px-8 transition-all" placeholder="alpha@network.com" />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <label htmlFor="contact-subject" className="text-xs font-semibold tracking-widest text-muted-foreground ml-2">{form?.subjectLabel ?? ""}</label>
                                            <Input id="contact-subject" name="subject" required className="h-16 rounded-2xl bg-white/5 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-primary/50 text-lg font-bold px-8 transition-all" placeholder="Neural Engine Implementation" />
                                        </div>
                                        <div className="space-y-3">
                                            <label htmlFor="contact-message" className="text-xs font-semibold tracking-widest text-muted-foreground ml-2">{form?.messageLabel ?? ""}</label>
                                            <Textarea id="contact-message" name="message" required className="min-h-[160px] rounded-[32px] bg-white/5 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-primary/50 text-lg font-bold p-8 transition-all resize-none" placeholder="Describe the scope of your communication node..." />
                                        </div>
                                    </form>
                                </CardContent>
                                <CardFooter className="p-10 md:p-14 pt-0 relative z-10">
                                    <Button type="submit" form="contact-form" disabled={isCreating} className="w-full h-18 rounded-[28px] bg-primary hover:bg-primary/90 text-white font-semibold text-xl shadow-2xl shadow-primary/20 transition-all active:scale-[0.98] group">
                                        {isCreating ? "Transmitting..." : (form?.buttonText ?? "")} <Send className="w-6 h-6 ml-4 group-hover:translate-x-2 group-hover:-translate-y-1 transition-transform" />
                                    </Button>
                                </CardFooter>
                            </Card>
                        </AnimatedDiv>
                    </div>
                </div>

                {/* Secure Sync Guarantee */}
                <div className="mt-24 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 opacity-40">
                    <div className="flex items-center gap-4">
                        <ShieldCheck className="w-6 h-6 text-primary" />
                        <span className="text-xs font-semibold tracking-widest text-white">{footer?.encryptedText ?? ""}</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Bot className="w-6 h-6 text-primary" />
                        <span className="text-xs font-semibold tracking-widest text-white">{footer?.agentText ?? ""}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}


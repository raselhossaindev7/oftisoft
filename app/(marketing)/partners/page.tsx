"use client"
import { useState } from "react";
import { AnimatedDiv, AnimatedH1, AnimatedH2, AnimatedH3, AnimatedP } from "@/lib/animated";
import { toast } from "sonner";
import api from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { 
    Users, 
    Handshake, 
    Globe, 
    Zap, 
    ArrowRight,
    Briefcase,
    ShieldCheck,
    Box,
    Sparkles,
    Gem,
    Workflow,
    ExternalLink,
    Cpu,
    Target,
    Loader2
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const iconMap: any = {
    Zap, Globe, Sparkles, ShieldCheck, Handshake, Users, Cpu, Workflow, Gem, Target, Briefcase, Box
};

const pageData = {
    header: { badge: "PARTNER PROGRAM", titlePrefix: "Grow Together as ", titleHighlight: "Partners", description: "Join our partner ecosystem and expand your service offerings. Whether you're an agency, freelancer, or technology provider, we have a partnership that works for you." },
    partners: [
        { id: "p1", iconName: "Handshake", color: "text-blue-400", name: "Agency Partner", role: "REFERRAL + WHITE-LABEL", desc: "Resell Oftisoft development services under your own brand. We handle delivery, you handle the client relationship. Revenue share up to 30%." },
        { id: "p2", iconName: "Cpu", color: "text-purple-400", name: "Technology Partner", role: "INTEGRATION + CO-MARKETING", desc: "Integrate your platform with our ecosystem. Joint marketing campaigns, co-branded content, and access to our developer community." },
        { id: "p3", iconName: "Globe", color: "text-green-400", name: "Solution Partner", role: "IMPLEMENTATION + CONSULTING", desc: "Get certified to implement and consult on Oftisoft solutions. Access to exclusive training, early releases, and dedicated support." },
        { id: "p4", iconName: "Sparkles", color: "text-orange-400", name: "Affiliate Partner", role: "REFERRAL COMMISSION", desc: "Earn 20% commission on every referral. No minimums, no quotas. Real-time dashboard, instant payouts via Stripe or PayPal." },
    ],
    cta: { title: "Ready to Partner?", description: "Join 50+ partners worldwide and take your business to the next level. Apply today and get a response within 48 hours.", buttonText: "Apply Now", subText: "Free to join. No minimum commitments." },
    ecosystem: { title: "TRUSTED BY INDUSTRY LEADERS", brands: [{ id: "b1", name: "STRIPE" }, { id: "b2", name: "AWS" }, { id: "b3", name: "GITHUB" }, { id: "b4", name: "DOCKER" }, { id: "b5", name: "CLOUDFLARE" }, { id: "b6", name: "DATADOG" }] }
};

export default function PartnersPage() {
    const { header, partners, cta, ecosystem } = pageData;
    const [dialogOpen, setDialogOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({ companyName: "", email: "", website: "", partnerType: "", message: "" });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (submitting) return;
        setSubmitting(true);
        try {
            await api.post("/leads/partner-application", form);
            toast.success("Application submitted! We'll get back to you within 48 hours.");
            setDialogOpen(false);
            setForm({ companyName: "", email: "", website: "", partnerType: "", message: "" });
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Submission failed");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="relative min-h-screen pt-32 pb-24 bg-[#020202]">
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
                            {header?.badge ?? ""}
                        </Badge>
                    </AnimatedDiv>
                    <AnimatedH1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-semibold tracking-tighter text-white"
                    >
                        {header?.titlePrefix ?? ""} <span className="text-primary underline decoration-white/10 decoration-8 underline-offset-8">{header?.titleHighlight ?? ""}</span>.
                    </AnimatedH1>
                    <AnimatedP className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">
                        {header?.description ?? ""}
                    </AnimatedP>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {partners.map((partner, idx) => {
                        const Icon = iconMap[partner.iconName ?? ''] || Zap;
                        return (
                        <AnimatedDiv key={partner.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            style={{ willChange: "transform, opacity" }}
                        >
                            <Card className="h-full border-white/5 bg-white/[0.02] backdrop-blur-3xl rounded-[40px] overflow-hidden hover:border-primary/30 hover:bg-white/[0.04] transition-all duration-700 group cursor-pointer">
                                <CardContent className="p-10 md:p-14 space-y-8">
                                    <div className="flex items-start justify-between">
                                        <div className={cn("w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center transition-transform group-hover:scale-110", partner.color)}>
                                            <Icon size={40} />
                                        </div>
                                        <Badge variant="outline" className="text-xs font-semibold tracking-widest px-4 py-1.5 border-white/10 bg-white/5 text-white/40">Tier-1 Node</Badge>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <h3 className="text-4xl font-semibold text-white tracking-tight leading-none group-hover:text-primary transition-colors">{partner.name}</h3>
                                            <span className="text-xs font-semibold tracking-[0.2em] text-primary">{partner.role}</span>
                                        </div>
                                        <p className="text-xl text-muted-foreground font-medium leading-relaxed">{partner.desc}</p>
                                    </div>
                                    <Button variant="ghost" className="h-10 text-white/40 font-semibold tracking-widest text-xs hover:bg-transparent hover:text-white p-0 group/btn" asChild>
                                        <Link href="/contact">
                                            Analyze Integration <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-2 transition-transform" />
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        </AnimatedDiv>
                    );})}
                </div>

                {/* Partner CTA with Application Form */}
                <div className="bg-gradient-to-br from-primary/10 via-background to-background border border-white/10 rounded-[60px] p-12 md:p-24 overflow-hidden relative group text-center lg:text-left">
                    <div className="absolute top-0 right-0 w-[80vw] h-[80vw] max-w-[600px] max-h-[600px] bg-primary/10 blur-[150px] rounded-full group-hover:scale-110 transition-transform duration-1000 pointer-events-none" />
                    <div className="grid lg:grid-cols-2 gap-16 items-center relative z-10">
                        <div className="space-y-8">
                            <div className="flex flex-col lg:flex-row items-center gap-6 text-primary">
                                <Handshake size={64} className="group-hover:rotate-12 transition-transform" />
                                <h2 className="text-4xl md:text-7xl font-semibold tracking-tighter text-white">{cta?.title ?? ""}</h2>
                            </div>
                            <p className="text-xl text-muted-foreground font-medium leading-relaxed">
                                {cta?.description ?? ""}
                            </p>
                        </div>
                        <div className="flex flex-col gap-6 items-center lg:items-end">
                            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button className="h-18 px-12 rounded-3xl bg-primary hover:bg-primary/90 text-white font-semibold text-xl shadow-2xl shadow-primary/30 active:scale-95 transition-all group/btn">
                                        {cta?.buttonText ?? ""} <Zap className="w-5 h-5 ml-3" />
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[500px]">
                                    <DialogHeader>
                                        <DialogTitle className="text-2xl font-bold">Partner Application</DialogTitle>
                                        <DialogDescription>
                                            Fill out the form below and we'll get back to you within 48 hours.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="companyName">Company Name *</Label>
                                            <Input id="companyName" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} placeholder="Your company name" required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email *</Label>
                                            <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@company.com" required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="website">Website</Label>
                                            <Input id="website" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://yourcompany.com" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="partnerType">Partner Type *</Label>
                                            <Select value={form.partnerType} onValueChange={(v) => setForm({ ...form, partnerType: v })} required>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select partner type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="agency">Agency Partner</SelectItem>
                                                    <SelectItem value="technology">Technology Partner</SelectItem>
                                                    <SelectItem value="solution">Solution Partner</SelectItem>
                                                    <SelectItem value="affiliate">Affiliate Partner</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="message">Message</Label>
                                            <Textarea id="message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Tell us about your company and why you'd like to partner with us" rows={4} />
                                        </div>
                                        <Button type="submit" disabled={submitting} className="w-full h-12">
                                            {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                            {submitting ? "Submitting..." : "Submit Application"}
                                        </Button>
                                    </form>
                                </DialogContent>
                            </Dialog>
                            <p className="text-xs font-semibold tracking-[0.2em] text-white/20">
                                {cta?.subText ?? ""}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="pt-24 space-y-12">
                     <h4 className="text-xs font-semibold tracking-[0.4rem] text-muted-foreground text-center">{ecosystem?.title ?? ""}</h4>
                     <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-30 grayscale hover:grayscale-0 transition-all">
                        {(ecosystem?.brands || []).map((brand) => (
                            <span key={brand.id} className="text-2xl md:text-4xl font-semibold text-white tracking-widest">{brand.name}</span>
                        ))}
                     </div>
                </div>
            </div>
        </div>
    );
}

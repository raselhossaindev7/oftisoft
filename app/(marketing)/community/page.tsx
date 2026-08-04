"use client"
import { useState } from "react";
import { AnimatedDiv, AnimatedH1, AnimatedH2, AnimatedH3, AnimatedP } from "@/lib/animated";
import { toast } from "sonner";
import api from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
    Users, 
    MessageSquare, 
    Github, 
    Twitter, 
    Slack, 
    Globe, 
    Zap, 
    Heart, 
    Share2, 
    ArrowRight,
    Terminal,
    Bot,
    Code2
} from "lucide-react";
import { cn } from "@/lib/utils";

// Icon Map
const iconMap: Record<string, React.ComponentType<{ className?: string; size?: number }>> = {
    Github, MessageSquare, Slack, Twitter, Globe, Zap, Heart, Share2
};

const pageData = {
    header: { badge: "COMMUNITY", title: "Join Our ", highlight: "Community", description: "Connect with fellow developers, engineers, and innovators. Share knowledge, contribute to open source, and be part of something bigger." },
    links: [
        { id: "github", iconName: "Github", color: "text-white", title: "GitHub", label: "Star our repos & contribute", url: "https://github.com/oftisoft", isActive: true },
        { id: "discord", iconName: "MessageSquare", color: "text-indigo-400", title: "Discord", label: "Real-time chat with the team", url: "https://discord.gg/oftisoft", isActive: true },
        { id: "slack", iconName: "Slack", color: "text-purple-400", title: "Slack Community", label: "Professional network discussions", url: "https://slack.com/oftisoft", isActive: true },
        { id: "twitter", iconName: "Twitter", color: "text-blue-400", title: "Twitter / X", label: "Follow for updates & insights", url: "https://twitter.com/oftisoft", isActive: true },
        { id: "linkedin", iconName: "Globe", color: "text-blue-500", title: "LinkedIn", label: "Professional network & jobs", url: "https://linkedin.com/company/oftisoft", isActive: true },
        { id: "youtube", iconName: "Zap", color: "text-red-500", title: "YouTube", label: "Tutorials & tech talks", url: "https://youtube.com/@oftisoft", isActive: true },
    ],
    newsletter: {
        title: "Stay in the Loop",
        description: "Get weekly updates on new articles, open source releases, and community events. No spam, ever.",
        placeholder: "your@email.com",
        buttonText: "Subscribe",
        footerText: "Join 5,000+ subscribers. Unsubscribe anytime."
    },
    stats: [
        { id: "members", value: "5,000+", label: "Community Members" },
        { id: "contributors", value: "200+", label: "Open Source Contributors" },
        { id: "events", value: "50+", label: "Community Events" },
    ]
};

export default function CommunityPage() {
    const { header, links, newsletter, stats } = pageData;
    const activeLinks = links.filter(l => l.isActive);
    const [email, setEmail] = useState("");
    const [subscribed, setSubscribed] = useState(false);
    const [subscribing, setSubscribing] = useState(false);

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || subscribing) return;
        setSubscribing(true);
        try {
            await api.post("/leads/subscribe", { email });
            setSubscribed(true);
            setEmail("");
            toast.success("Subscribed successfully!");
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Subscription failed");
        } finally {
            setSubscribing(false);
        }
    };

    return (
        <div className="relative min-h-screen pt-32 pb-24 bg-[#020202]">
            {/* Background Texture & Neural Orbs */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-primary/10 rounded-full blur-[140px] opacity-40" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-blue-600/5 rounded-full blur-[120px] opacity-30" />
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
                        {header?.title ?? ""} <span className="text-primary">{header?.highlight ?? ""}</span>.
                    </AnimatedH1>
                    <AnimatedP className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">
                        {header?.description ?? ""}
                    </AnimatedP>
                </div>

                {/* Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {activeLinks.map((item, idx) => {
                        const Icon = iconMap[item.iconName ?? ''] || Github;
                        return (
                        <AnimatedDiv key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-80px" }}
                            transition={{ delay: idx * 0.1 }}
                            style={{ willChange: "transform, opacity" }}
                        >
                            <a href={item.url} target="_blank" rel="noopener noreferrer">
                                <Card className="h-full border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[32px] overflow-hidden hover:border-primary/30 hover:bg-white/[0.03] transition-all duration-700 group cursor-pointer">
                                    <CardContent className="p-8 flex flex-col items-center text-center space-y-6">
                                        <div className={cn("w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:bg-primary group-hover:text-white group-hover:rotate-6", item.color)}>
                                            <Icon size={36} />
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="text-2xl font-semibold text-white tracking-tight">{item.title}</h3>
                                            <p className="text-sm text-muted-foreground font-medium">{item.label}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </a>
                        </AnimatedDiv>
                    );})}
                </div>

                {/* Newsletter Sub-Core */}
                <div className="bg-gradient-to-br from-primary/10 via-background to-background border border-white/10 rounded-[50px] p-12 md:p-24 relative overflow-hidden group shadow-2xl shadow-primary/5">
                    <div className="absolute top-0 right-0 w-[70vw] h-[70vw] max-w-[500px] max-h-[500px] bg-primary/10 blur-[140px] rounded-full pointer-events-none group-hover:scale-110 transition-transform duration-1000" />
                    <div className="grid lg:grid-cols-2 gap-16 items-center relative z-10">
                        <div className="space-y-8 text-center lg:text-left">
                            <div className="flex flex-col lg:flex-row items-center gap-4 text-primary">
                                <Bot size={48} />
                                <h2 className="text-4xl md:text-7xl font-semibold tracking-tighter text-white">{newsletter?.title ?? ""}</h2>
                            </div>
                            <p className="text-xl text-muted-foreground font-medium leading-relaxed">
                                {newsletter?.description ?? ""}
                            </p>
                        </div>
                        <div className="space-y-6">
                            <form className="relative group/form" onSubmit={handleSubscribe}>
                                <div className="relative overflow-hidden rounded-[28px] bg-white/[0.03] border border-white/10 p-3 backdrop-blur-xl group-focus-within/form:border-primary/50 transition-all duration-500">
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <Input
                                            value={subscribed ? "" : email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder={subscribed ? "You're subscribed!" : newsletter?.placeholder ?? ""}
                                            disabled={subscribed || subscribing}
                                            className="h-16 border-none bg-transparent text-white placeholder:text-white/20 focus-visible:ring-0 text-lg font-bold px-8"
                                        />
                                        <Button type="submit" disabled={subscribed || subscribing || !email.trim()} className="h-16 px-12 rounded-[22px] bg-primary hover:bg-primary/90 text-white font-semibold text-lg shadow-2xl shadow-primary/30 transition-all active:scale-95 group/btn">
                                            {subscribing ? "Subscribing..." : subscribed ? "Subscribed" : newsletter?.buttonText ?? ""} <ArrowRight className="w-5 h-5 ml-2 group-hover/btn:translate-x-2 transition-transform" />
                                        </Button>
                                    </div>
                                </div>
                            </form>
                            <div className="flex items-center gap-4 justify-center lg:justify-start">
                                <p className="text-xs font-semibold tracking-[0.2em] text-white/30">
                                    {newsletter?.footerText ?? ""}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Community Stats */}
                <div className="grid md:grid-cols-3 gap-12 pt-12 border-t border-white/5 opacity-40">
                    {stats.map((stat) => (
                        <div key={stat.id} className="flex flex-col items-center text-center space-y-2">
                            <span className="text-4xl font-semibold text-white tracking-tighter">{stat.value}</span>
                            <span className="text-xs font-semibold tracking-widest text-primary">{stat.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}


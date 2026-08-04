"use client"
import { useState } from "react";
import { AnimatedDiv, AnimatedH1, AnimatedH2, AnimatedH3 } from "@/lib/animated";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
    Search, 
    BookOpen, 
    Code2, 
    Cpu, 
    ShieldCheck, 
    Box, 
    Globe, 
    Zap, 
    ChevronRight, 
    ArrowRight,
    ExternalLink,
    Terminal,
    MessageSquare,
    Layers,
    FileText
} from "lucide-react";
import { cn } from "@/lib/utils";

// Icon Map
const iconMap: Record<string, React.ComponentType<{ className?: string; size?: number }>> = {
    Layers, Cpu, ShieldCheck, Terminal, Zap, Code2, BookOpen, MessageSquare, Box, Globe, FileText
};

const pageData = {
    header: { badge: "KNOWLEDGE BASE", title: "Developer ", highlight: "Documentation", placeholder: "Search documentation, guides, API references..." },
    categories: [
        { id: "getting-started", iconName: "Rocket", color: "text-blue-400", title: "Getting Started", count: "12 guides", href: "/docs/getting-started" },
        { id: "api-ref", iconName: "Code2", color: "text-purple-400", title: "API Reference", count: "48 endpoints", href: "/docs/api-reference" },
        { id: "frontend", iconName: "Box", color: "text-cyan-400", title: "Frontend SDK", count: "6 packages" },
        { id: "backend", iconName: "Server", color: "text-green-400", title: "Backend SDK", count: "8 packages" },
        { id: "integrations", iconName: "Globe", color: "text-orange-400", title: "Integrations", count: "24 guides" },
        { id: "security", iconName: "ShieldCheck", color: "text-red-400", title: "Security", count: "15 guides" },
        { id: "deployment", iconName: "Terminal", color: "text-indigo-400", title: "Deployment", count: "10 guides" },
        { id: "tutorials", iconName: "BookOpen", color: "text-pink-400", title: "Tutorials", count: "20 tutorials" },
        { id: "faq", iconName: "MessageSquare", color: "text-yellow-400", title: "FAQ", count: "35 answers" },
    ],
    cta: { title: "Need Help?", description: "Can't find what you're looking for? Our support team is ready to help you 24/7.", primaryButton: "Contact Support", secondaryButton: "Join Discord" },
    support: [
        { id: "s1", iconName: "MessageSquare", color: "text-blue-400", title: "Live Chat", description: "Get immediate help from our engineering team via real-time chat." },
        { id: "s2", iconName: "Terminal", color: "text-purple-400", title: "API Status", description: "Check real-time API availability, latency, and incident history." },
    ]
};

export default function DocsPage() {
    const { header, categories, cta, support } = pageData;
    const [search, setSearch] = useState("");
    const filtered = categories.filter((c) =>
        c.title.toLowerCase().includes(search.toLowerCase())
    );
    return (
        <div className="relative min-h-screen pt-32 pb-24 bg-[#020202]">
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-primary/10 rounded-full blur-[140px] opacity-40" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-indigo-600/5 rounded-full blur-[120px] opacity-30" />
                <div className="absolute inset-0 bg-grain opacity-[0.02]" />
            </div>

            <div className="container px-6 mx-auto relative z-10 space-y-24">
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
                    <AnimatedDiv 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="relative max-w-2xl mx-auto group"
                    >
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={header?.placeholder ?? ""}
                            className="h-16 pl-16 rounded-[24px] bg-white/5 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-primary/50 text-lg font-bold shadow-2xl transition-all"
                        />
                    </AnimatedDiv>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filtered.length === 0 ? (
                        <div className="col-span-full text-center py-16">
                            <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground/40" />
                            <p className="text-xl text-muted-foreground font-medium">No results found for &quot;{search}&quot;</p>
                            <p className="text-sm text-muted-foreground/60 mt-2">Try different keywords or browse all categories above</p>
                        </div>
                    ) : filtered.map((category, idx) => {
                        const Icon = iconMap[category.iconName ?? ''] || Layers;
                        return (
                        <AnimatedDiv key={category.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            style={{ willChange: "transform, opacity" }}
                        >
                            <Card className="group h-full border-white/5 bg-white/[0.02] backdrop-blur-3xl rounded-[40px] overflow-hidden hover:border-primary/30 hover:bg-white/[0.04] transition-all duration-700 cursor-pointer">
                                {category.href ? (
                                    <Link href={category.href} className="block h-full">
                                        <CardContent className="p-10 space-y-6">
                                            <div className={cn("w-14 h-14 rounded-2xl bg-muted/30 flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-6", category.color)}>
                                                <Icon size={28} />
                                            </div>
                                            <div className="space-y-2">
                                                <h3 className="text-2xl font-semibold text-white tracking-tight leading-tight">{category.title}</h3>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-semibold text-muted-foreground tracking-widest">{category.count}</span>
                                                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-2 transition-all" />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Link>
                                ) : (
                                    <CardContent className="p-10 space-y-6">
                                        <div className={cn("w-14 h-14 rounded-2xl bg-muted/30 flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-6", category.color)}>
                                            <Icon size={28} />
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="text-2xl font-semibold text-white tracking-tight leading-tight">{category.title}</h3>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-semibold text-muted-foreground tracking-widest">{category.count}</span>
                                                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-2 transition-all" />
                                            </div>
                                        </div>
                                    </CardContent>
                                )}
                            </Card>
                        </AnimatedDiv>
                    );})}
                </div>

                {/* Integration Node (Mock Call to Action) */}
                <div className="bg-gradient-to-r from-primary/10 to-transparent border border-white/10 rounded-[50px] p-12 md:p-20 flex flex-col md:flex-row items-center gap-12 overflow-hidden relative group shadow-2xl shadow-primary/5">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 blur-[130px] rounded-full pointer-events-none group-hover:scale-110 transition-transform duration-1000" />
                    <div className="flex-1 space-y-6 relative z-10 text-center md:text-left">
                        <div className="flex flex-col md:flex-row items-center gap-4 text-primary">
                            <BookOpen size={32} />
                            <h2 className="text-4xl md:text-6xl font-semibold tracking-tighter text-white">{cta?.title ?? ""}</h2>
                        </div>
                        <p className="text-xl text-muted-foreground font-medium leading-relaxed max-w-2xl">
                            {cta?.description ?? ""}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                            <Button className="h-16 px-10 rounded-2xl bg-primary hover:bg-primary/90 text-white font-semibold shadow-xl shadow-primary/20 text-lg group/btn" asChild>
                                <Link href="/contact">
                                    {cta?.primaryButton ?? ""} <Terminal className="w-5 h-5 ml-3 group-hover/btn:translate-x-1 transition-transform" />
                                </Link>
                            </Button>
                            <Button variant="outline" className="h-16 px-10 rounded-2xl border-white/10 bg-white/5 text-white font-semibold text-lg hover:bg-white/10" asChild>
                                <a href="https://discord.gg/oftisoft" target="_blank" rel="noreferrer">
                                    {cta?.secondaryButton ?? ""} <ExternalLink className="w-5 h-5 ml-3" />
                                </a>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Sub-Footer links/support */}
                <div className="grid md:grid-cols-2 gap-12 pt-12">
                    {support.map((card) => {
                        const Icon = iconMap[card.iconName ?? ''] || MessageSquare;
                        return (
                        <div key={card.id} className="flex items-center gap-8 p-10 rounded-[40px] bg-white/[0.02] border border-white/5 group hover:border-blue-500/20 transition-all">
                            <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", card.color.replace('text-', 'bg-').replace('500', '500/10'), card.color)}>
                                <Icon size={32} />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-xl font-semibold text-white tracking-tight">{card.title}</h4>
                                <p className="text-sm text-muted-foreground font-medium">{card.description}</p>
                            </div>
                        </div>
                    );})}
                </div>
            </div>
        </div>
    );
}


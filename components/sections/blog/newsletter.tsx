"use client"
import { AnimatedDiv } from "@/lib/animated";

import { useState } from "react";
import api from "@/lib/api";
import { Mail, CheckCircle2, AlertCircle, ArrowRight, Loader2, Sparkles, Zap, Code2, Rocket } from "lucide-react";
import confetti from "canvas-confetti";
import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

// ... imports

export default function Newsletter() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !/\S+@\S+\.\S+/.test(email)) {
            setStatus('error');
            return;
        }
        
        setStatus('loading');
        
        try {
            await api.post('/leads/subscribe', { email });
            setStatus('success');
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
            setTimeout(() => {
                setEmail("");
                setStatus('idle');
            }, 3000);
        } catch {
            setStatus('error');
            setTimeout(() => setStatus('idle'), 3000);
        }
    };

    return (
        <section className="py-16 md:py-24 relative overflow-hidden">
            {/* ... background ... */}

            <div className="container px-4 mx-auto relative z-10">
                <div className="relative mx-auto overflow-hidden rounded-[2.5rem] bg-card/30 backdrop-blur-xl border border-white/10 dark:border-white/5 shadow-2xl">
                    
                    {/* Decorative Grid */}
                    <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

                    <div className="grid lg:grid-cols-2 gap-8 md:gap-12 p-6 md:p-12 lg:p-16 items-center">
                        
                        {/* Text Content */}
                        <div className="text-center lg:text-left">
                            <AnimatedDiv 
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5 }}
                                style={{ willChange: "transform, opacity" }}
                            >
                                <Badge variant="outline" className="mb-6 gap-2 px-3 py-1 bg-primary/10 border-primary/20 text-primary hover:bg-primary/20 transition-colors">
                                    <Sparkles className="w-4 h-4" />
                                    Weekly Tech Insights
                                </Badge>
                                
                                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
                                    Join the <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">Innovation</span>
                                </h2>
                                
                                <p className="text-base md:text-lg text-muted-foreground mb-8 leading-relaxed">
                                    Get the latest articles on 
                                    <span className="text-foreground font-medium"> AI</span>, 
                                    <span className="text-foreground font-medium"> Next.js</span>, and 
                                    <span className="text-foreground font-medium"> Cloud Architecture</span>. 
                                    Join 15,000+ developers leveling up their skills.
                                </p>

                                <div className="flex flex-wrap justify-center lg:justify-start gap-3 md:gap-4 mb-8">
                                    {[
                                        { icon: Zap, label: "Zero Spam" },
                                        { icon: Code2, label: "Code Snippets" },
                                        { icon: Rocket, label: "Early Access" }
                                    ].map((item, i) => (
                                        <Badge key={i} variant="secondary" className="gap-2 py-1.5 px-3 text-xs font-normal bg-background/50 border-border/50">
                                            <item.icon className="w-4 h-4 text-primary" />
                                            {item.label}
                                        </Badge>
                                    ))}
                                </div>
                            </AnimatedDiv>
                        </div>

                        {/* Form Section */}
                        <AnimatedDiv 
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="relative"
                            style={{ willChange: "transform, opacity" }}
                        >
                            <Card className="bg-background/80 backdrop-blur-md border-border shadow-lg relative overflow-hidden group">
                                {/* Border Gradient Animation */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none" />

                                <CardContent className="p-6 md:p-8">
                                    <div className="text-center mb-6">
                                        <div className="w-14 h-14 bg-gradient-to-br from-primary to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/25">
                                            <Mail className="w-7 h-7 text-white" />
                                        </div>
                                        <h3 className="text-xl font-bold">Subscribe to Newsletter</h3>
                                    </div>

                                    <form onSubmit={handleSubscribe} className="space-y-4">
                                        <div className="relative">
                                            <Input type="email"
                                                placeholder="developer@example.com"
                                                value={email}
                                                disabled={status === 'loading' || status === 'success'}
                                                onChange={(e) => {
                                                    setEmail(e.target.value);
                                                    if (status === 'error') setStatus('idle');
                                                }}
                                                className={cn(
                                                    "w-full h-12 px-5 rounded-xl bg-muted/50 border-border outline-none transition-all text-base",
                                                    status === 'error'
                                                        ? "border-red-500/50 bg-red-500/5 focus-visible:ring-red-500/20" 
                                                        : "focus-visible:ring-primary/20"
                                                )}
                                            />
                                            <div>
                                                {status === 'error' && (
                                                    <AnimatedDiv 
                                                        initial={{ opacity: 0, x: 10 }} 
                                                        animate={{ opacity: 1, x: 0 }} 
                                                        exit={{ opacity: 0 }}
                                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500"
                                                    >
                                                        <AlertCircle className="w-5 h-5" />
                                                    </AnimatedDiv>
                                                )}
                                            </div>
                                        </div>

                                        <Button type="submit"
                                            size="lg"
                                            disabled={status === 'loading' || status === 'success'}
                                            className={cn(
                                                "w-full h-12 rounded-xl font-bold transition-all relative overflow-hidden text-base",
                                                status === 'success' 
                                                    ? "bg-green-500 hover:bg-green-600 text-white" 
                                                    : ""
                                            )}
                                        >
                                            <div>
                                                {status === 'loading' ? (
                                                    <AnimatedDiv 
                                                        key="loading" 
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -10 }}
                                                    >
                                                        <Loader2 className="w-5 h-5 animate-spin" />
                                                    </AnimatedDiv>
                                                ) : status === 'success' ? (
                                                    <AnimatedDiv 
                                                        key="success" 
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -10 }}
                                                        className="flex items-center gap-2"
                                                    >
                                                        <CheckCircle2 className="w-5 h-5" />
                                                        <span>Subscribed!</span>
                                                    </AnimatedDiv>
                                                ) : (
                                                    <AnimatedDiv 
                                                        key="idle" 
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -10 }}
                                                        className="flex items-center gap-2"
                                                    >
                                                        <span>Subscribe Now</span>
                                                        <ArrowRight className="w-4 h-4" />
                                                    </AnimatedDiv>
                                                )}
                                            </div>
                                        </Button>
                                        
                                        <p className="text-xs text-center text-muted-foreground mt-4">
                                            We respect your privacy. Unsubscribe at any time.
                                        </p>
                                    </form>
                                </CardContent>
                            </Card>
                        </AnimatedDiv>
                    </div>
                </div>
            </div>
        </section>
    );
}


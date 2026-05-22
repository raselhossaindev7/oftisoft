"use client"
import { AnimatedDiv } from "@/lib/animated";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Save, CreditCard, ShieldCheck, Zap, Globe, Lock } from "lucide-react";
import { systemAPI, SystemConfig } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function PaymentSettingsPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [config, setConfig] = useState<SystemConfig | null>(null);

    const [form, setForm] = useState({
        stripePublishableKey: "",
        stripeSecretKey: "",
        paypalClientId: "",
        paypalClientSecret: ""
    });

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const data = await systemAPI.getConfig();
                setConfig(data);
                setForm({
                    stripePublishableKey: data.stripePublishableKey || "",
                    stripeSecretKey: data.stripeSecretKey || "",
                    paypalClientId: data.paypalClientId || "",
                    paypalClientSecret: data.paypalClientSecret || ""
                });
            } catch (error) {
                toast.error("Nexus Link Interrupted", {
                    description: "Failed to retrieve gateway configurations."
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchConfig();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const updatedConfig = await systemAPI.updateConfig(form);
            setConfig(updatedConfig);
            toast.success("Gateways Synchronized", {
                description: "Financial settlement nodes have been hardcoded."
            });
        } catch (error) {
            toast.error("Synchronization Failed", {
                description: "The neural link rejected the credentials."
            });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 text-center">
                <Loader2 className="w-12 h-auto animate-spin text-primary opacity-20" />
                <p className="text-muted-foreground font-semibold animate-pulse uppercase">Accessing Fiscal Nodes...</p>
            </div>
        );
    }

    return (
        <div className="space-y-12  mx-auto pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/50 pb-10">
                <div>
                    <h2 className="text-3xl md:text-3xl font-semibold bg-gradient-to-r from-foreground via-foreground to-foreground/40 bg-clip-text text-transparent">
                        Financial Settlement
                    </h2>
                    <p className="text-muted-foreground font-medium mt-2">Govern your global payment vectors and transaction gateways.</p>
                </div>
                <div className="flex items-center gap-3 text-primary bg-primary/5 px-5 py-2.5 rounded-full border border-primary/20 shadow-inner">
                    <ShieldCheck className="w-5 h-5" />
                    <span className="text-sm font-semibold uppercase">PCI-DSS L1 Active</span>
                </div>
            </div>

            <form onSubmit={handleSave} className="space-y-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Stripe Card */}
                    <AnimatedDiv initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Card className="group border-2 border-border/40 rounded-[48px] overflow-hidden bg-card/50 backdrop-blur-xl hover:border-primary/30 transition-all duration-500 shadow-sm hover:shadow-2xl hover:shadow-primary/5">
                            <CardHeader className="p-10 pb-6 border-b border-border/30 bg-muted/20">
                                <div className="flex items-center justify-between">
                                    <div className="w-14 h-14 bg-indigo-600 rounded-[22px] flex items-center justify-center text-white shadow-xl shadow-indigo-600/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                                        <CreditCard size={28} />
                                    </div>
                                    <Badge className="bg-indigo-600/10 text-indigo-600 border-none font-semibold text-sm px-4 py-1.5 rounded-full">STRIPE_NODE</Badge>
                                </div>
                                <CardTitle className="mt-8 text-2xl font-semibold">Stripe Infrastructure</CardTitle>
                                <CardDescription className="font-medium mt-2">Synchronize your marketplace with the Stripe global ledger.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-10 space-y-6">
                                <div className="space-y-3">
                                    <Label className="text-sm font-semibold uppercase text-muted-foreground/60 ml-2">Broadcast Key (Publishable)</Label>
                                    <Input 
                                        value={form.stripePublishableKey}
                                        onChange={(e) => setForm({ ...form, stripePublishableKey: e.target.value })}
                                        placeholder="pk_live_..." 
                                        className="h-14 px-6 rounded-2xl border-none bg-muted/30 focus-visible:ring-primary/20 font-mono text-xs font-bold"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-sm font-semibold uppercase text-muted-foreground/60 ml-2">Private Fragment (Secret Key)</Label>
                                    <div className="relative">
                                        <Input 
                                            type="password"
                                            value={form.stripeSecretKey}
                                            onChange={(e) => setForm({ ...form, stripeSecretKey: e.target.value })}
                                            placeholder="sk_live_..." 
                                            className="h-14 px-6 rounded-2xl border-none bg-muted/30 focus-visible:ring-primary/20 font-mono text-xs font-bold"
                                        />
                                        <Lock className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </AnimatedDiv>

                    {/* PayPal Card */}
                    <AnimatedDiv initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        <Card className="group border-2 border-border/40 rounded-[48px] overflow-hidden bg-card/50 backdrop-blur-xl hover:border-primary/30 transition-all duration-500 shadow-sm hover:shadow-2xl hover:shadow-primary/5">
                            <CardHeader className="p-10 pb-6 border-b border-border/30 bg-muted/20">
                                <div className="flex items-center justify-between">
                                    <div className="w-14 h-14 bg-blue-500 rounded-[22px] flex items-center justify-center text-white shadow-xl shadow-blue-500/20 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500">
                                        <Zap size={28} />
                                    </div>
                                    <Badge className="bg-blue-500/10 text-blue-500 border-none font-semibold text-sm px-4 py-1.5 rounded-full">PAYPAL_NODE</Badge>
                                </div>
                                <CardTitle className="mt-8 text-2xl font-semibold">PayPal Hub</CardTitle>
                                <CardDescription className="font-medium mt-2">Manage REST signal credentials for alternative settlement.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-10 space-y-6">
                                <div className="space-y-3">
                                    <Label className="text-sm font-semibold uppercase text-muted-foreground/60 ml-2">Node Client ID</Label>
                                    <Input 
                                        value={form.paypalClientId}
                                        onChange={(e) => setForm({ ...form, paypalClientId: e.target.value })}
                                        placeholder="A-Z0-9..." 
                                        className="h-14 px-6 rounded-2xl border-none bg-muted/30 focus-visible:ring-primary/20 font-mono text-xs font-bold"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-sm font-semibold uppercase text-muted-foreground/60 ml-2">Node Secret</Label>
                                    <div className="relative">
                                        <Input 
                                            type="password"
                                            value={form.paypalClientSecret}
                                            onChange={(e) => setForm({ ...form, paypalClientSecret: e.target.value })}
                                            placeholder="EL-..." 
                                            className="h-14 px-6 rounded-2xl border-none bg-muted/30 focus-visible:ring-primary/20 font-mono text-xs font-bold"
                                        />
                                        <Lock className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </AnimatedDiv>
                </div>

                {/* Info Box */}
                <Card className="p-6 md:p-8 rounded-[32px] bg-primary/[0.03] border border-primary/20 flex items-start gap-6 group">
                    <div className="w-12 h-12 bg-background rounded-2xl flex items-center justify-center text-primary shadow-xl border border-primary/10 transition-transform group-hover:rotate-12">
                        <Globe size={24} />
                    </div>
                    <div className="flex-1 space-y-2">
                        <p className="font-semibold text-sm text-primary uppercase">Deployment Logic</p>
                        <p className="text-xs text-muted-foreground font-bold leading-relaxed">
                            Changes to gateway credentials will take immediate effect across all checkout nodes. Ensure you are using "Live" keys for production environments. Test keys will process simulated credits only.
                        </p>
                    </div>
                </Card>

                <div className="flex justify-start pt-4 px-2">
                    <Button 
                        type="submit" 
                        disabled={isSaving} 
                        className="h-16 px-12 rounded-3xl font-semibold text-lg bg-primary text-white shadow-2xl shadow-primary/30 transition-all hover:scale-[1.05] active:scale-[0.95] flex items-center gap-4"
                    >
                        {isSaving ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                        Sync Settlement Logic
                    </Button>
                </div>
            </form>
        </div>
    );
}

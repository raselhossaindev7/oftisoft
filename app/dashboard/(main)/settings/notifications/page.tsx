"use client";

import { useState, useEffect } from "react";
import { Mail, Bell, Smartphone, Monitor, Zap, Shield, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authAPI, User } from "@/lib/api";
import { useUserStore } from "@/lib/store";
import { useAuthStore } from "@/store/useAuthStore";

export default function NotificationsSettings() {
    const queryClient = useQueryClient();
    const { setUser } = useUserStore();
    const setAuthUser = useAuthStore((s) => s.setUser);

    // Fetch user profile for notification settings
  const { data: user, isLoading, error } = useQuery({
        queryKey: ["profile"],
        queryFn: () => authAPI.getProfile(),
    });

    const [formState, setFormState] = useState({
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: false,
        marketingNotifications: true,
        artifactDeploymentNotifications: true,
        mentionNotifications: true,
        milestoneNotifications: true,
        allocationNotifications: true,
        ledgerNotifications: true,
        transactionNotifications: true,
        loginAlertNotifications: true,
        securityAlertNotifications: true,
        kernelUpdateNotifications: true,
    });

    // Sync local state when data loads
    useEffect(() => {
        if (user) {
            setFormState({
                emailNotifications: user.emailNotifications,
                pushNotifications: user.pushNotifications,
                smsNotifications: user.smsNotifications,
                marketingNotifications: user.marketingNotifications,
                artifactDeploymentNotifications: user.artifactDeploymentNotifications,
                mentionNotifications: user.mentionNotifications,
                milestoneNotifications: user.milestoneNotifications,
                allocationNotifications: user.allocationNotifications,
                ledgerNotifications: user.ledgerNotifications,
                transactionNotifications: user.transactionNotifications,
                loginAlertNotifications: user.loginAlertNotifications,
                securityAlertNotifications: user.securityAlertNotifications,
                kernelUpdateNotifications: user.kernelUpdateNotifications,
            });
        }
    }, [user]);

    // Mutation for updating preferences
  const updateMutation = useMutation({
        mutationFn: (data: Partial<User>) => authAPI.updateProfile(data),
        onSuccess: (updatedUser) => {
            queryClient.invalidateQueries({ queryKey: ["profile"] });
            setAuthUser(updatedUser as any);
            toast.success("Signal Matrix Synchronized", {
                description: "Your notification neural-map has been successfully committed to the edge network.",
                icon: <CheckCircle2 className="w-4 h-4 text-green-500" />
            });
        },
        onError: (err: any) => {
            toast.error("Synchronization Failed", {
                description: err.response?.data?.message || "Internal signal interference detected."
            });
        }
    });

    const handleToggle = (field: keyof typeof formState) => {
        const newValue = !formState[field];
        setFormState(prev => ({ ...prev, [field]: newValue }));
    };

    const handleSave = () => {
        // Filter only the allowed notification fields
  const allowedFields = [
            "emailNotifications", "pushNotifications", "smsNotifications", "marketingNotifications",
            "artifactDeploymentNotifications", "mentionNotifications", "milestoneNotifications", "allocationNotifications",
            "ledgerNotifications", "transactionNotifications", "loginAlertNotifications", "securityAlertNotifications", "kernelUpdateNotifications"
        ];
        const filteredData = Object.keys(formState)
            .filter(key => allowedFields.includes(key))
            .reduce((obj, key) => {
                obj[key as keyof typeof formState] = formState[key as keyof typeof formState];
                return obj;
            }, {} as Partial<typeof formState>);

        updateMutation.mutate(filteredData);
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <Loader2 className="w-12 h-auto animate-spin text-primary opacity-20" />
                <p className="text-muted-foreground font-semibold animate-pulse">Scanning Neural Pathways...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 p-12 text-center bg-red-500/5 rounded-[40px] border border-red-500/20">
                <AlertCircle className="w-12 h-auto text-red-500" />
                <h3 className="text-xl font-semibold">Neural Interface Failure</h3>
                <p className="text-muted-foreground font-medium max-w-sm">Failed to establish connection with the preference vault. Frequency synchronization impossible.</p>
                <Button variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: ["profile"] })} className="rounded-xl border-red-500/20 hover:bg-red-500/10 hover:text-red-500">Retry Link</Button>
            </div>
        );
    }

    const NOTIFICATION_CHANNELS = [
        { id: "emailNotifications", label: "Email Network", icon: Mail, desc: "High-density updates delivered to your primary inbox.", active: formState.emailNotifications },
        { id: "pushNotifications", label: "Edge Push", icon: Zap, desc: "Instant holographic alerts on desktop & mobile nodes.", active: formState.pushNotifications },
        { id: "smsNotifications", label: "Satellite SMS", icon: Smartphone, desc: "Critical authentication and system recovery alerts via SMS.", active: formState.smsNotifications },
    ];

    const NOTIFICATION_TYPES = [
        { 
            category: "Mission Control (Projects)", 
            icon: Monitor,
            items: [
                { id: "artifactDeploymentNotifications", label: "Artifact Deployment Success", enabled: formState.artifactDeploymentNotifications },
                { id: "mentionNotifications", label: "Architect Mentions & Collab", enabled: formState.mentionNotifications },
                { id: "milestoneNotifications", label: "Milestone Velocity Reached", enabled: formState.milestoneNotifications },
                { id: "allocationNotifications", label: "Resource Allocation Updates", enabled: formState.allocationNotifications },
            ] 
        },
        { 
            category: "Platform Intelligence (Insights)", 
            icon: Shield,
            items: [
                { id: "marketingNotifications", label: "Ecosystem Updates & Growth Insights", enabled: formState.marketingNotifications },
                { id: "ledgerNotifications", label: "Ledger Entry Generated", enabled: formState.ledgerNotifications },
                { id: "transactionNotifications", label: "Transaction Verification", enabled: formState.transactionNotifications },
            ] 
        },
        { 
            category: "System Integrity (Security)", 
            icon: Zap,
            items: [
                { id: "loginAlertNotifications", label: "New Node Login Warning", enabled: formState.loginAlertNotifications },
                { id: "securityAlertNotifications", label: "Security Protocol Hardening", enabled: formState.securityAlertNotifications },
                { id: "kernelUpdateNotifications", label: "Platform Kernel Updates", enabled: formState.kernelUpdateNotifications },
            ] 
        },
    ];

    return (
        <div className="space-y-12 max-w-4xl mx-auto pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/50 pb-10">
                <div>
                    <h2 className="text-3xl md:text-3xl font-semibold bg-gradient-to-r from-foreground via-foreground to-foreground/40 bg-clip-text text-transparent">
                        Neural Preferences
                    </h2>
                    <p className="text-muted-foreground font-medium mt-2">Govern the frequency and delivery vectors of platform intelligence.</p>
                </div>
                <div className="flex items-center gap-3 text-primary bg-primary/5 px-5 py-2.5 rounded-full border border-primary/20 shadow-inner">
                    <Bell className="w-5 h-5 animate-pulse" />
                    <span className="text-sm font-semibold uppercase">Signal Locked</span>
                </div>
            </div>

            {/* Signal Channels */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {NOTIFICATION_CHANNELS.map((channel) => {
                    const isActive = channel.active;
                    return (
                        <Card key={channel.id}
                            className={cn(
                                "relative overflow-hidden cursor-pointer transition-all duration-500 rounded-[42px] border-2 group",
                                isActive 
                                    ? "bg-primary/[0.03] border-primary shadow-2xl shadow-primary/10" 
                                    : "bg-muted/10 border-border/50 hover:border-primary/30"
                            )}
                            onClick={() => handleToggle(channel.id as any)}
                        >
                            <CardContent className="p-10 flex flex-col items-center md:items-start text-center md:text-left">
                                {isActive && (
                                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 blur-[40px] rounded-full" />
                                )}
                                <div className={cn(
                                    "w-16 h-16 rounded-2xl flex items-center justify-center mb-10 transition-all shadow-xl",
                                    isActive ? "bg-primary text-white scale-110 rotate-3" : "bg-background text-muted-foreground group-hover:scale-105 group-hover:-rotate-3"
                                )}>
                                    <channel.icon className="w-8 h-8" />
                                </div>
                                <h3 className="font-semibold text-2xl mb-3 group-hover:text-primary transition-colors">{channel.label}</h3>
                                <p className="text-xs text-muted-foreground font-bold leading-relaxed opacity-70">{channel.desc}</p>

                                <div className={cn(
                                    "absolute top-6 right-6 transition-all duration-700",
                                    isActive ? "opacity-100 scale-100" : "opacity-0 scale-50"
                                )}>
                                    <div className="w-3 h-3 bg-primary rounded-full animate-ping opacity-75" />
                                    <div className="absolute inset-0 w-3 h-3 bg-primary rounded-full shadow-[0_0_15px_rgba(99,102,241,1)]" />
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Signal Filtering */}
            <div className="space-y-16 pt-12 mt-12 border-t border-dashed border-border/50">
                {NOTIFICATION_TYPES.map((section, idx) => (
                    <div key={idx} className="space-y-10">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-2xl bg-muted/50 flex items-center justify-center text-primary border border-border/50 shadow-inner group-hover:rotate-12 transition-all">
                                    <section.icon className="w-5 h-5" />
                                </div>
                                <h3 className="font-semibold text-2xl underline decoration-primary/20 underline-offset-8 decoration-4">{section.category}</h3>
                            </div>
                            <Badge variant="outline" className="text-xs font-semibold uppercase text-primary bg-primary/5 px-4 h-8 rounded-full border-primary/20">Active Filtering</Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-2">
                            {section.items.map((item, i) => (
                                <Card key={i} className="rounded-3xl bg-muted/20 border border-border/40 hover:border-primary/40 hover:bg-primary/[0.02] transition-all group p-1">
                                    <CardContent className="p-6 flex items-center justify-between">
                                        <div className="flex items-center gap-5">
                                            <div className="w-2.5 h-2.5 rounded-full bg-primary/20 group-hover:bg-primary group-hover:scale-125 group-hover:shadow-[0_0_10px_rgba(99,102,241,0.8)] transition-all" />
                                            <span className="text-sm md:text-base font-semibold text-muted-foreground/80 group-hover:text-foreground transition-colors">{item.label}</span>
                                        </div>
                                        <Switch 
                                            checked={item.enabled} 
                                            onCheckedChange={() => handleToggle(item.id as any)}
                                            className="scale-110" 
                                        />
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer Sync */}
            <Card className="rounded-[48px] bg-primary/[0.04] border border-primary/20 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-10 relative overflow-hidden group">
                <div className="absolute -top-32 -right-32 w-80 h-80 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
                <div className="flex items-center gap-8 relative z-10 text-center md:text-left flex-col md:flex-row">
                    <div className="w-20 h-20 bg-background border border-primary/30 rounded-[28px] flex items-center justify-center text-primary shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-700">
                        <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-2xl mb-2">Synchronized Alert Matrix</h4>
                        <p className="text-xs md:text-sm text-muted-foreground font-medium max-w-sm leading-relaxed opacity-80 md:mx-0 mx-auto">Changes are propagated across the global Oftisoft edge network instantly. Your notification neural-map is now persistent.</p>
                    </div>
                </div>
                <Button 
                    onClick={handleSave}
                    disabled={updateMutation.isPending}
                    className="relative z-10 h-16 px-12 rounded-3xl font-semibold text-lg shadow-2xl shadow-primary/30 hover:scale-[1.05] transition-all"
                >
                    {updateMutation.isPending ? (
                        <div className="flex items-center gap-3">
                            <Loader2 className="w-6 h-6 animate-spin" />
                            <span>Propagating...</span>
                        </div>
                    ) : (
                        "Commit Signal Logic"
                    )}
                </Button>
            </Card>

        </div>
    );
}

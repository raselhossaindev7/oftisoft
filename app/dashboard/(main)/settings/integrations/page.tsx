"use client"
import { AnimatedDiv, AnimatePresence } from "@/lib/animated";

import { useState, useEffect } from "react";
import { Check, Github, Slack, Database, Cloud, Trello, Mail, Blocks, ExternalLink, Zap, Braces, Link, ShieldCheck, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { integrationsAPI } from "@/lib/api";

const INTEGRATION_META = [
    { id: "github", name: "GitHub Node", cat: "Development", icon: Github, desc: "Automate delivery pipelines and sync codebase artifacts." },
    { id: "slack", name: "Slack Link", cat: "Communication", icon: Slack, desc: "Global bridge for real-time project signal telemetry." },
    { id: "aws", name: "AWS Edge", cat: "Storage", icon: Cloud, desc: "Object storage infrastructure for high-scale asset delivery." },
    { id: "jira", name: "Jira Flow", cat: "Management", icon: Trello, desc: "Industrial-grade issue tracking and sprint governance." },
    { id: "gmail", name: "Neural Mail", cat: "Communication", icon: Mail, desc: "SMTP relay for automated professional outreach." },
];

export default function IntegrationsSettings() {
    const queryClient = useQueryClient();
    
    // Fetch connected integrations from backend
  const { data: connectedIds = [], isLoading } = useQuery({
        queryKey: ["integrations"],
        queryFn: async () => {
            const data = await integrationsAPI.getIntegrations();
            return data.map((i: any) => i.id);
        },
    });

    // Mutation for toggling integration
  const toggleMutation = useMutation({
        mutationFn: ({ id, connected }: { id: string, connected: boolean }) => 
            integrationsAPI.toggleIntegration(id, connected),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["integrations"] });
            if (variables.connected) {
                toast.success(`Active bridge established: ${variables.id.toUpperCase()}`, {
                    description: "Synchronizing workspace artifacts now.",
                    icon: <Link className="w-4 h-4 text-primary" />
                });
            } else {
                toast.error(`Interface de-coupled: ${variables.id.toUpperCase()}`, {
                    description: "The neural bridge has been dismantled."
                });
            }
        },
        onError: (err: any) => {
            toast.error("Bridge Synchronization Failed", {
                description: err.response?.data?.message || "Internal interference detected."
            });
        }
    });

    const toggle = (id: string, isCurrentlyConnected: boolean) => {
        toggleMutation.mutate({ id, connected: !isCurrentlyConnected });
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 text-center">
                <Loader2 className="w-12 h-auto animate-spin text-primary opacity-20" />
                <p className="text-muted-foreground font-semibold animate-pulse uppercase">Mapping Neural Nodes...</p>
            </div>
        );
    }

    return (
        <div className="space-y-12  mx-auto pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/50 pb-10">
                <div>
                    <h2 className="text-3xl md:text-3xl font-semibold bg-gradient-to-r from-foreground via-foreground to-foreground/40 bg-clip-text text-transparent">
                        Ecosystem Interop
                    </h2>
                    <p className="text-muted-foreground font-medium mt-2">Bridge your Oftisoft workspace with the global developer toolchain.</p>
                </div>
                <div className="flex items-center gap-3 text-primary bg-primary/5 px-5 py-2.5 rounded-full border border-primary/20 shadow-inner">
                    <Blocks className="w-5 h-5" />
                    <span className="text-sm font-semibold uppercase">Bridging Matrix Active</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <AnimatePresence mode="popLayout">
                    {INTEGRATION_META.map((tool) => {
                        const isConnected = connectedIds.includes(tool.id);
                        const isPending = toggleMutation.isPending && toggleMutation.variables?.id === tool.id;

                        return (
                            <AnimatedDiv layout key={tool.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.4 }}
                            >
                                <Card className={cn(
                                        "group border-2 rounded-[48px] flex flex-col transition-all duration-500 relative overflow-hidden h-[340px] shadow-sm",
                                        isConnected 
                                            ? "bg-primary/[0.03] border-primary shadow-2xl shadow-primary/10" 
                                            : "bg-muted/5 border-border/50 opacity-90 hover:opacity-100 hover:border-primary/20 hover:bg-card"
                                    )}
                                >
                                    {isConnected && (
                                        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-primary/10 blur-[60px] rounded-full pointer-events-none" />
                                    )}
                                    
                                    <CardHeader className="p-8 md:p-10 pb-4 flex flex-row items-start justify-between">
                                        <div className={cn(
                                            "w-16 h-16 bg-background border rounded-[22px] flex items-center justify-center transition-all duration-700 shadow-xl group-hover:scale-110 group-hover:rotate-6",
                                            isConnected ? "border-primary/40 text-primary shadow-primary/5" : "border-border text-muted-foreground"
                                        )}>
                                            <tool.icon className="w-8 h-8" />
                                        </div>
                                        <Badge className={cn(
                                            "px-4 py-1.5 rounded-full text-xs font-semibold uppercase border transition-colors",
                                            isConnected ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "bg-muted text-muted-foreground border-transparent"
                                        )}>
                                            {isConnected ? "Bridged" : "Standby"}
                                        </Badge>
                                    </CardHeader>

                                    <CardContent className="p-8 md:p-10 pt-4 flex-1">
                                        <h3 className="font-semibold text-2xl group-hover:text-primary transition-colors">{tool.name}</h3>
                                        <p className="text-xs text-muted-foreground font-bold leading-relaxed mt-3 opacity-70 line-clamp-3">{tool.desc}</p>
                                    </CardContent>

                                    <CardFooter className="p-8 md:p-10 pt-0">
                                        <Button onClick={() => toggle(tool.id, isConnected)}
                                            disabled={isPending}
                                            variant={isConnected ? "outline" : "default"}
                                            className={cn(
                                                "w-full h-14 rounded-2xl font-semibold text-sm shadow-lg transition-all active:scale-[0.95]",
                                                isConnected
                                                    ? "bg-background border-border hover:bg-red-500 hover:text-white hover:border-red-500"
                                                    : "shadow-primary/20"
                                            )}
                                        >
                                            {isPending ? (
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            ) : (
                                                isConnected ? "De-Auth Node" : "Initialize Link"
                                            )}
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </AnimatedDiv>
                        )
                    })}
                </AnimatePresence>

                {/* Custom Integration Trigger */}
                <Card 
                    className="p-10 rounded-[48px] border-2 border-dashed border-border flex flex-col items-center justify-center text-center space-y-6 group cursor-pointer hover:bg-primary/[0.04] hover:border-primary/40 transition-all h-[340px] bg-muted/5"
                    onClick={() => toast.info("Custom webhook: configure in API or developer docs.")}
                >
                    <div className="w-20 h-20 rounded-[30px] bg-background border border-border/50 flex items-center justify-center text-muted-foreground group-hover:scale-110 group-hover:rotate-12 group-hover:text-primary transition-all shadow-xl group-hover:shadow-primary/5">
                        <Braces size={40} strokeWidth={1} />
                    </div>
                    <div>
                        <h4 className="font-semibold text-xl">Custom Webhook</h4>
                        <p className="text-sm text-muted-foreground font-bold uppercase max-w-[200px] mx-auto mt-3 opacity-60">Architect private node bridges</p>
                    </div>
                </Card>
            </div>

            {/* Help Info */}
            <Card className="mt-16 p-8 md:p-12 rounded-[48px] bg-muted/20 border border-border/50 flex flex-col md:flex-row items-center gap-10 group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] rounded-full" />
                <div className="w-16 h-16 bg-background rounded-[24px] flex items-center justify-center text-primary shadow-2xl border border-primary/20 group-hover:scale-110 group-hover:-rotate-12 transition-all duration-700 shrink-0">
                    <Zap className="w-8 h-8" />
                </div>
                <div className="flex-1 text-center md:text-left relative z-10">
                    <p className="text-sm font-semibold uppercase text-primary/60 mb-2">Developer Oversight Hub</p>
                    <p className="text-sm md:text-base font-medium leading-relaxed text-muted-foreground/80">
                        Need to integrate a proprietary internal tool? Explore our <span className="text-primary font-semibold underline underline-offset-4 cursor-pointer hover:text-primary/70 transition-colors">Open Bridge API Documentation</span> for headless integration patterns and neural socket schemas.
                    </p>
                </div>
                <Button variant="ghost" className="h-auto w-12 rounded-full border border-border/50 group-hover:bg-primary group-hover:text-white transition-all shrink-0" onClick={() => toast.info("Open your API docs or /api route for integration patterns.")}>
                    <ExternalLink className="w-5 h-5" />
                </Button>
            </Card>
        </div>
    );
}

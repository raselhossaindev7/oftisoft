"use client"
import { useEffect, useState } from "react";
import { AnimatedDiv, AnimatedH1 } from "@/lib/animated";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Activity,
    Globe,
    Cpu,
    ShieldCheck,
    Database,
    Zap,
    Clock,
    CheckCircle2,
    Lock,
    RefreshCw,
    Server,
    Signal,
    ChevronRight,
    Monitor,
    AlertTriangle,
    Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const iconMap: Record<string, any> = {
    Server, Database, Cpu, Globe, ShieldCheck, Zap, Activity, Signal, Monitor,
};

interface ServiceStatus {
    status: "up" | "down";
}

interface HealthResponse {
    status: "ok" | "degraded";
    uptime: number;
    timestamp: string;
    services: {
        api: ServiceStatus;
        database: ServiceStatus;
        cache: ServiceStatus;
    };
}

function formatUptime(seconds: number): string {
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const parts: string[] = [];
    if (d > 0) parts.push(`${d}d`);
    if (h > 0) parts.push(`${h}h`);
    if (m > 0) parts.push(`${m}m`);
    parts.push(`${s}s`);
    return parts.join(" ");
}

const systemConfigs = [
    { id: "database", iconName: "Database", name: "Database Cluster" },
    { id: "api", iconName: "Server", name: "API Server" },
    { id: "cache", iconName: "Zap", name: "Cache / Redis" },
];

export default function StatusPage() {
    const [health, setHealth] = useState<HealthResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchHealth = async () => {
        try {
            const res = await fetch("/api/health");
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data: HealthResponse = await res.json();
            setHealth(data);
            setError(null);
        } catch (e: any) {
            setError(e.message || "Failed to fetch health status");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHealth();
        const interval = setInterval(fetchHealth, 30000);
        return () => clearInterval(interval);
    }, []);

    const allOperational = health?.status === "ok";
    const headerBadge = allOperational ? "ALL SYSTEMS OPERATIONAL" : "SOME SYSTEMS DEGRADED";
    const headerTitle = allOperational ? "All Systems Operational" : "System Degradation Detected";
    const headerDesc = allOperational
        ? "ALL SERVICES OPERATIONAL"
        : "ONE OR MORE SERVICES ARE EXPERIENCING ISSUES";

    return (
        <div className="relative min-h-screen pt-32 pb-24 bg-[#020202]">
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-green-500/10 rounded-full blur-[140px] opacity-20" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-primary/5 rounded-full blur-[120px] opacity-30" />
                <div className="absolute inset-0 bg-grain opacity-[0.02]" />
            </div>

            <div className="container px-6 mx-auto relative z-10 space-y-20">
                {/* Header Section */}
                <div className="text-center space-y-8 max-w-4xl mx-auto">
                    <AnimatedDiv initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                        <Badge variant="outline" className={cn(
                            "px-6 py-2 rounded-full font-semibold tracking-[0.3em] text-xs shadow-[0_0_20px_rgba(34,197,94,0.1)]",
                            allOperational
                                ? "border-green-500/30 bg-green-500/5 text-green-400"
                                : "border-orange-500/30 bg-orange-500/5 text-orange-400"
                        )}>
                            {headerBadge}
                        </Badge>
                    </AnimatedDiv>
                    <AnimatedH1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-semibold tracking-tighter text-white"
                    >
                        {"System Status".split(" ").map((word, i) => (
                            <span key={i} className={cn(word.toLowerCase() === "status" ? "text-green-500" : "")}>
                                {word}{" "}
                            </span>
                        ))}
                    </AnimatedH1>

                    <Card className={cn(
                        "max-w-xl mx-auto backdrop-blur-2xl rounded-[32px] p-6",
                        allOperational
                            ? "border-green-500/20 bg-green-500/5"
                            : "border-orange-500/20 bg-orange-500/5"
                    )}>
                        <div className="flex items-center justify-center gap-6">
                            {loading ? (
                                <Loader2 className="w-12 h-12 animate-spin text-white/40" />
                            ) : (
                                <>
                                    <div className={cn("relative", allOperational ? "text-green-500" : "text-orange-500")}>
                                        {allOperational ? (
                                            <>
                                                <Activity className="w-12 h-12" />
                                                <div className="absolute inset-0 animate-ping bg-green-500/20 rounded-full scale-150" />
                                            </>
                                        ) : (
                                            <AlertTriangle className="w-12 h-12" />
                                        )}
                                    </div>
                                    <div className="text-left">
                                        <h3 className="text-2xl font-semibold text-white tracking-tight">{headerTitle}</h3>
                                        <p className="text-xs font-semibold tracking-widest text-white/40">{headerDesc}</p>
                                        {health && (
                                            <p className="text-xs text-white/20 mt-1">
                                                Last checked: {new Date(health.timestamp).toLocaleTimeString()}
                                            </p>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </Card>
                </div>

                {/* Status Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {systemConfigs.map((system, idx) => {
                        const Icon = iconMap[system.iconName] || Activity;
                        const data: ServiceStatus | undefined = health?.services[system.id as keyof typeof health.services];
                        const isUp = data?.status === "up";
                        const isLoading = loading && !health;

                        return (
                            <AnimatedDiv key={system.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true, margin: "-80px" }}
                                transition={{ delay: idx * 0.1 }}
                                style={{ willChange: "transform, opacity" }}
                            >
                                <Card className="h-full border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[32px] overflow-hidden hover:border-white/10 transition-all duration-500 group">
                                    <CardContent className="p-8 space-y-8">
                                        <div className="flex items-start justify-between">
                                            <div className={cn(
                                                "w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center transition-transform group-hover:scale-110",
                                                isUp ? "text-green-400" : "text-red-400"
                                            )}>
                                                <Icon size={28} />
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                {isLoading ? (
                                                    <Loader2 size={14} className="animate-spin text-white/20" />
                                                ) : (
                                                    <Badge variant="outline" className={cn(
                                                        "text-xs font-black uppercase border-none px-3",
                                                        isUp ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                                                    )}>
                                                        {isUp ? "Operational" : "Down"}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <h3 className="text-xl font-semibold text-white tracking-tight">{system.name}</h3>
                                            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                                <div className="flex items-center gap-2">
                                                    <Signal size={12} className={cn(isUp ? "text-green-400" : "text-red-400")} />
                                                    <span className="text-xs font-semibold text-white/40 tracking-widest">Status</span>
                                                </div>
                                                <span className={cn(
                                                    "text-sm font-mono font-bold",
                                                    isUp ? "text-green-400" : "text-red-400"
                                                )}>
                                                    {isUp ? "UP" : "DOWN"}
                                                </span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </AnimatedDiv>
                        );
                    })}
                </div>

                {/* Uptime & Monitoring Card */}
                <Card className="border-white/5 bg-white/[0.01] rounded-[40px] overflow-hidden shadow-2xl">
                    <CardHeader className="p-10 md:p-14 border-b border-white/5">
                        <div className="flex items-center justify-between">
                            <h3 className="text-2xl md:text-4xl font-semibold tracking-tighter text-white">System Monitoring</h3>
                        </div>
                    </CardHeader>
                    <CardContent className="p-10 md:p-14 space-y-8">
                        <div className="flex items-center gap-6">
                            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-blue-400">
                                <Clock size={28} />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-white/20 tracking-widest">SERVER UPTIME</p>
                                <p className="text-2xl font-bold text-white tracking-tight">
                                    {health ? formatUptime(health.uptime) : "--"}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Monitoring Note */}
                <div className="text-center pt-12 space-y-4">
                    <p className="text-muted-foreground font-medium">
                        All systems are continuously monitored by our automated alerting infrastructure.
                    </p>
                    <div className="flex items-center gap-4 justify-center">
                        <Badge variant="outline" className="border-white/10 bg-white/5 text-xs font-semibold px-4 py-1 flex gap-2 items-center">
                            <RefreshCw size={12} className={cn(loading ? "animate-spin" : "", "text-primary")} />
                            {loading ? "Checking..." : `Last checked: ${health ? new Date(health.timestamp).toLocaleTimeString() : "--"}`}
                        </Badge>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs font-semibold text-primary"
                            onClick={fetchHealth}
                        >
                            Refresh Now
                        </Button>
                    </div>
                    {error && (
                        <p className="text-red-400 text-sm font-medium">{error}</p>
                    )}
                </div>
            </div>
        </div>
    );
}

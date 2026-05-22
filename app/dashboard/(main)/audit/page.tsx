"use client";

import { useState, useCallback, useEffect } from "react";
import {
    Search,
    RefreshCw,
    Clock,
    Users,
    Activity,
    CalendarRange,
    Eye,
    ChevronDown,
    ChevronUp,
    SearchX,
    Filter,
    Monitor,
    Mail,
    ShieldCheck,
    FileEdit,
    Trash2,
    LogIn,
    LogOut,
    UserPlus,
    UserX,
    Settings,
    Database,
    Key,
    Ban,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Info,
    Code2,
    Loader2,
    ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { format } from "date-fns";
import { withRoleProtection } from "@/components/auth/role-guard";

interface AuditLog {
    id: string;
    userId: string;
    userEmail: string;
    userRole: string;
    action: string;
    entity: string;
    entityId: string;
    oldValues?: any;
    newValues?: any;
    description: string;
    ipAddress?: string;
    userAgent?: string;
    metadata?: any;
    createdAt: string;
}

interface AuditStats {
    totalEvents: number;
    uniqueUsers: number;
    actionsToday: number;
    dateRange: {
        earliest: string;
        latest: string;
    };
}

type DatePreset = "24h" | "7d" | "30d" | "90d";

const ACTION_TYPES: { value: string; label: string; icon: typeof ShieldCheck }[] = [
    { value: "", label: "All Actions", icon: Activity },
    { value: "create", label: "Create", icon: FileEdit },
    { value: "update", label: "Update", icon: FileEdit },
    { value: "delete", label: "Delete", icon: Trash2 },
    { value: "login", label: "Login", icon: LogIn },
    { value: "logout", label: "Logout", icon: LogOut },
    { value: "register", label: "Register", icon: UserPlus },
    { value: "suspend", label: "Suspend", icon: Ban },
    { value: "activate", label: "Activate", icon: CheckCircle2 },
    { value: "deactivate", label: "Deactivate", icon: XCircle },
    { value: "role_change", label: "Role Change", icon: ShieldCheck },
    { value: "permission", label: "Permission", icon: Key },
    { value: "settings", label: "Settings", icon: Settings },
    { value: "export", label: "Export", icon: Database },
    { value: "import", label: "Import", icon: Database },
];

const DATE_PRESETS: { value: DatePreset; label: string }[] = [
    { value: "24h", label: "Last 24 Hours" },
    { value: "7d", label: "Last 7 Days" },
    { value: "30d", label: "Last 30 Days" },
    { value: "90d", label: "Last 90 Days" },
];

const LOGS_PER_PAGE = 25;

function getActionBadge(action: string | undefined) {
    const actionLower = (action || '').toLowerCase().replace(/\s+/g, "_");
    const configs: Record<string, { className: string; icon: typeof ShieldCheck }> = {
        create: { className: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", icon: FileEdit },
        update: { className: "bg-sky-500/10 text-sky-500 border-sky-500/20", icon: FileEdit },
        delete: { className: "bg-rose-500/10 text-rose-500 border-rose-500/20", icon: Trash2 },
        login: { className: "bg-blue-500/10 text-blue-500 border-blue-500/20", icon: LogIn },
        logout: { className: "bg-amber-500/10 text-amber-500 border-amber-500/20", icon: LogOut },
        register: { className: "bg-violet-500/10 text-violet-500 border-violet-500/20", icon: UserPlus },
        suspend: { className: "bg-red-500/10 text-red-500 border-red-500/20", icon: Ban },
        activate: { className: "bg-green-500/10 text-green-500 border-green-500/20", icon: CheckCircle2 },
        deactivate: { className: "bg-orange-500/10 text-orange-500 border-orange-500/20", icon: XCircle },
        role_change: { className: "bg-purple-500/10 text-purple-500 border-purple-500/20", icon: ShieldCheck },
        permission: { className: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20", icon: Key },
        settings: { className: "bg-gray-500/10 text-gray-500 border-gray-500/20", icon: Settings },
        export: { className: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20", icon: Database },
        import: { className: "bg-teal-500/10 text-teal-500 border-teal-500/20", icon: Database },
    };

    const config = configs[actionLower];
    if (!config) {
        return (
            <Badge className="bg-muted/30 text-muted-foreground border-border/20 gap-1.5 rounded-lg text-xs font-semibold ">
                <Info className="w-3 h-3" /> {action}
            </Badge>
        );
    }
    const Icon = config.icon;
    const label = ACTION_TYPES.find((a) => a.value === actionLower)?.label || action;
    return (
        <Badge className={`${config.className} gap-1.5 rounded-lg text-xs font-semibold `}>
            <Icon className="w-3 h-3" /> {label}
        </Badge>
    );
}

function truncateId(id: string, chars = 8) {
    if (!id || id.length <= chars * 2 + 3) return id || "—";
    return `${id.slice(0, chars)}...${id.slice(-chars)}`;
}

function formatDateTime(dateStr: string) {
    try {
        return format(new Date(dateStr), "MMM d yyyy h:mm a");
    } catch {
        return "—";
    }
}

function formatDateShort(dateStr: string) {
    try {
        return format(new Date(dateStr), "MMM d");
    } catch {
        return "—";
    }
}

function formatDateRange(dateStr: string) {
    try {
        return format(new Date(dateStr), "MMM d, yyyy");
    } catch {
        return "—";
    }
}

function getDatePresetRange(preset: DatePreset): Date {
    const now = new Date();
    switch (preset) {
        case "24h": return new Date(now.getTime() - 24 * 60 * 60 * 1000);
        case "7d": return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        case "30d": return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        case "90d": return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    }
}

function getRoleBadge(role: string) {
    switch (role?.toLowerCase()) {
        case "admin":
            return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 gap-1 rounded-lg text-xs font-semibold "><ShieldCheck className="w-3 h-3" /> Admin</Badge>;
        case "editor":
            return <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20 gap-1 rounded-lg text-xs font-semibold ">Editor</Badge>;
        case "support":
            return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 rounded-lg text-xs font-semibold ">Support</Badge>;
        case "user":
            return <Badge variant="outline" className="border-border/50 rounded-lg text-xs font-semibold ">User</Badge>;
        default:
            return <Badge variant="outline" className="border-border/50 rounded-lg text-xs font-semibold ">{role || "—"}</Badge>;
    }
}

function JsonDiffView({ oldValues, newValues }: { oldValues?: any; newValues?: any }) {
    const [showRaw, setShowRaw] = useState(false);

    if (!oldValues && !newValues) {
        return (
            <div className="text-center py-8">
                <div className="w-14 h-14 rounded-2xl bg-muted/20 flex items-center justify-center mx-auto mb-4">
                    <Code2 className="w-6 h-6 text-muted-foreground/40" />
                </div>
                <p className="text-sm font-semibold text-muted-foreground/60  text-sm">No change data recorded</p>
            </div>
        );
    }

    const oldEntries = oldValues ? Object.entries(oldValues) : [];
    const newEntries = newValues ? Object.entries(newValues) : [];
    const allKeys = Array.from(new Set([...oldEntries.map(([k]) => k), ...newEntries.map(([k]) => k)]));

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <p className="text-sm font-semibold  text-muted-foreground">
                    {allKeys.length} field{allKeys.length !== 1 ? "s" : ""} changed
                </p>
                <Button variant="ghost"
                    size="sm"
                    className="gap-2 rounded-xl h-8 text-xs font-semibold "
                    onClick={() => setShowRaw(!showRaw)}
                >
                    <Code2 className="w-3 h-3" />
                    {showRaw ? "Diff View" : "Raw JSON"}
                </Button>
            </div>

            {showRaw ? (
                <div className="space-y-3">
                    {oldValues && (
                        <div className="space-y-1.5">
                            <p className="text-xs font-semibold  text-rose-500">Old Values</p>
                            <pre className="bg-black/20 rounded-2xl p-4 text-sm font-mono leading-relaxed overflow-x-auto max-h-48 scrollbar-thin whitespace-pre-wrap break-all">
                                {JSON.stringify(oldValues, null, 2)}
                            </pre>
                        </div>
                    )}
                    {newValues && (
                        <div className="space-y-1.5">
                            <p className="text-xs font-semibold  text-emerald-500">New Values</p>
                            <pre className="bg-black/20 rounded-2xl p-4 text-sm font-mono leading-relaxed overflow-x-auto max-h-48 scrollbar-thin whitespace-pre-wrap break-all">
                                {JSON.stringify(newValues, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>
            ) : (
                <div className="rounded-2xl border border-border/30 overflow-hidden">
                    <div className="grid grid-cols-[80px_1fr_1fr] gap-px bg-border/20">
                        <div className="bg-muted/10 px-3 py-2 text-xs font-semibold  text-muted-foreground">Field</div>
                        <div className="bg-muted/10 px-3 py-2 text-xs font-semibold  text-rose-500">Old</div>
                        <div className="bg-muted/10 px-3 py-2 text-xs font-semibold  text-emerald-500">New</div>
                        {allKeys.map((key) => {
                            const oldVal = oldValues?.[key];
                            const newVal = newValues?.[key];
                            const changed = JSON.stringify(oldVal) !== JSON.stringify(newVal);
                            return (
                                <div key={key} className={cn("contents", changed && "bg-primary/[0.02]")}>
                                    <div className="px-3 py-2.5 text-sm font-semibold font-mono truncate">{key}</div>
                                    <div className={cn(
                                        "px-3 py-2.5 text-sm font-mono truncate",
                                        changed ? "bg-rose-500/5 text-rose-400" : "text-muted-foreground/50"
                                    )}>
                                        {oldVal === undefined ? "—" : typeof oldVal === "object" ? JSON.stringify(oldVal) : String(oldVal)}
                                    </div>
                                    <div className={cn(
                                        "px-3 py-2.5 text-sm font-mono truncate",
                                        changed ? "bg-emerald-500/5 text-emerald-400" : "text-muted-foreground/50"
                                    )}>
                                        {newVal === undefined ? "—" : typeof newVal === "object" ? JSON.stringify(newVal) : String(newVal)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

function AuditLogPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [stats, setStats] = useState<AuditStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isStatsLoading, setIsStatsLoading] = useState(true);

    const [searchQuery, setSearchQuery] = useState("");
    const [actionFilter, setActionFilter] = useState("");
    const [datePreset, setDatePreset] = useState<DatePreset>("30d");

    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [totalCount, setTotalCount] = useState(0);

    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    const fetchStats = useCallback(async () => {
        try {
            setIsStatsLoading(true);
            const response = await api.get("/audit/stats", {
                params: { days: datePreset === "24h" ? 1 : datePreset === "7d" ? 7 : datePreset === "30d" ? 30 : 90 },
            });
            setStats(response.data);
        } catch {
            // Stats are supplementary; don't show error
        } finally {
            setIsStatsLoading(false);
        }
    }, [datePreset]);

    const fetchLogs = useCallback(async (pageNum: number, append: boolean) => {
        try {
            if (append) {
                setIsLoadingMore(true);
            } else {
                setIsLoading(true);
            }

            const since = getDatePresetRange(datePreset).toISOString();
            const params: Record<string, any> = {
                limit: LOGS_PER_PAGE,
                offset: (pageNum - 1) * LOGS_PER_PAGE,
                since,
            };
            if (actionFilter) params.action = actionFilter;

            const response = await api.get("/audit/logs", { params });
            const data = response.data;
            const items = Array.isArray(data) ? data : data?.logs || data?.data || [];
            const total = data?.total ?? data?.count ?? items.length;

            if (append) {
                setLogs((prev) => [...prev, ...items]);
            } else {
                setLogs(items);
            }
            setTotalCount(total);
            setHasMore((pageNum * LOGS_PER_PAGE) < total);
            setPage(pageNum);
        } catch {
            toast.error("Failed to load audit logs");
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    }, [actionFilter, datePreset]);

    useEffect(() => {
        fetchLogs(1, false);
        fetchStats();
    }, [fetchLogs, fetchStats]);

    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        await Promise.all([fetchLogs(1, false), fetchStats()]);
        setIsRefreshing(false);
        toast.success("Audit trail synced");
    }, [fetchLogs, fetchStats]);

    const handleLoadMore = useCallback(async () => {
        await fetchLogs(page + 1, true);
    }, [page, fetchLogs]);

    const handleViewDetails = useCallback((log: AuditLog) => {
        setSelectedLog(log);
        setIsDetailOpen(true);
    }, []);

    const filteredLogs = logs.filter((l) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            l.userEmail?.toLowerCase().includes(q) ||
            l.description?.toLowerCase().includes(q) ||
            l.entity?.toLowerCase().includes(q) ||
            l.entityId?.toLowerCase().includes(q) ||
            l.action?.toLowerCase().includes(q) ||
            l.ipAddress?.toLowerCase().includes(q)
        );
    });

    const hasActiveFilters = actionFilter !== "" || searchQuery !== "" || datePreset !== "30d";

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-semibold">Audit Trail</h1>
                    <p className="text-muted-foreground font-medium">
                        Comprehensive immutable record of all system activities and administrative actions.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button variant="outline"
                        className="gap-2 rounded-xl h-11 border-border/50 bg-card/50 backdrop-blur-sm"
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                    >
                        <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
                        Sync
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-border/50 bg-card/40 backdrop-blur-md rounded-[2.5rem] overflow-hidden group hover:border-primary/30 transition-all h-full flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between pb-1 p-5">
                        <CardTitle className="text-sm font-semibold  text-muted-foreground">Total Events</CardTitle>
                        <div className="p-1.5 rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                            <Activity className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-5 pt-0 flex-1">
                        {isStatsLoading ? (
                            <div className="flex items-center gap-3">
                                <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
                                <span className="text-xs font-semibold  text-muted-foreground/60">Loading...</span>
                            </div>
                        ) : (
                            <>
                                <div className="text-3xl font-semibold">{stats?.totalEvents ?? totalCount}</div>
                                <p className="text-xs text-muted-foreground  mt-2 font-semibold opacity-60">Recorded events</p>
                            </>
                        )}
                    </CardContent>
                </Card>
                <Card className="border-border/50 bg-card/40 backdrop-blur-md rounded-[2.5rem] overflow-hidden group hover:border-sky-500/30 transition-all h-full flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between pb-1 p-5">
                        <CardTitle className="text-sm font-semibold  text-muted-foreground">Unique Users</CardTitle>
                        <div className="p-1.5 rounded-xl bg-sky-500/10 text-sky-500 group-hover:scale-110 transition-transform">
                            <Users className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-5 pt-0 flex-1">
                        {isStatsLoading ? (
                            <div className="flex items-center gap-3">
                                <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
                                <span className="text-xs font-semibold  text-muted-foreground/60">Loading...</span>
                            </div>
                        ) : (
                            <>
                                <div className="text-3xl font-semibold text-sky-500">{stats?.uniqueUsers ?? "—"}</div>
                                <p className="text-xs text-sky-500/60  mt-2 font-semibold">Active participants</p>
                            </>
                        )}
                    </CardContent>
                </Card>
                <Card className="border-border/50 bg-card/40 backdrop-blur-md rounded-[2.5rem] overflow-hidden group hover:border-amber-500/30 transition-all h-full flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between pb-1 p-5">
                        <CardTitle className="text-sm font-semibold  text-muted-foreground">Actions Today</CardTitle>
                        <div className="p-1.5 rounded-xl bg-amber-500/10 text-amber-500 group-hover:scale-110 transition-transform">
                            <Clock className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-5 pt-0 flex-1">
                        {isStatsLoading ? (
                            <div className="flex items-center gap-3">
                                <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
                                <span className="text-xs font-semibold  text-muted-foreground/60">Loading...</span>
                            </div>
                        ) : (
                            <>
                                <div className="text-3xl font-semibold text-amber-500">{stats?.actionsToday ?? "—"}</div>
                                <p className="text-xs text-amber-500/60  mt-2 font-semibold">Events recorded today</p>
                            </>
                        )}
                    </CardContent>
                </Card>
                <Card className="border-border/50 bg-card/40 backdrop-blur-md rounded-[2.5rem] overflow-hidden group hover:border-violet-500/30 transition-all h-full flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between pb-1 p-5">
                        <CardTitle className="text-sm font-semibold  text-muted-foreground">Date Range</CardTitle>
                        <div className="p-1.5 rounded-xl bg-violet-500/10 text-violet-500 group-hover:scale-110 transition-transform">
                            <CalendarRange className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-5 pt-0 flex-1">
                        {isStatsLoading ? (
                            <div className="flex items-center gap-3">
                                <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />
                                <span className="text-xs font-semibold  text-muted-foreground/60">Loading...</span>
                            </div>
                        ) : (
                            <>
                                <div className="text-lg font-semibold leading-tight">
                                    {stats?.dateRange?.earliest ? formatDateRange(stats.dateRange.earliest) : "—"}
                                    <span className="text-muted-foreground/40 mx-1">→</span>
                                    {stats?.dateRange?.latest ? formatDateRange(stats.dateRange.latest) : "—"}
                                </div>
                                <p className="text-xs text-muted-foreground  mt-2 font-semibold opacity-60">Audit window span</p>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card className="border-border/50 rounded-[2.5rem] overflow-hidden shadow-sm bg-card/40 backdrop-blur-md">
                <CardHeader className="p-6 pb-4">
                    <CardTitle className="text-sm font-semibold  text-muted-foreground flex items-center gap-2">
                        <Filter className="w-3.5 h-3.5" /> Filters & Controls
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                    <div className="flex flex-wrap items-end gap-4">
                        {/* Search */}
                        <div className="relative flex-1 min-w-[200px] max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search email, description, entity..."
                                className="pl-10 h-11 rounded-xl bg-background font-medium"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* Action Filter */}
                        <div className="w-[180px]">
                            <Select value={actionFilter} onValueChange={setActionFilter}>
                                <SelectTrigger className="h-11 rounded-xl bg-background/50 border-border/50 font-semibold text-xs">
                                    <SelectValue placeholder="All Actions" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl p-2 max-h-[300px]">
                                    {ACTION_TYPES.map((at) => (
                                        <SelectItem key={at.value} value={at.value} className="rounded-xl font-semibold text-xs">
                                            {at.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Date Preset */}
                        <div className="w-[180px]">
                            <Select value={datePreset} onValueChange={(v) => setDatePreset(v as DatePreset)}>
                                <SelectTrigger className="h-11 rounded-xl bg-background/50 border-border/50 font-semibold text-xs">
                                    <SelectValue placeholder="Date Range" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl p-2">
                                    {DATE_PRESETS.map((dp) => (
                                        <SelectItem key={dp.value} value={dp.value} className="rounded-xl font-semibold text-xs">
                                            {dp.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Clear Filters */}
                        {hasActiveFilters && (
                            <Button variant="ghost"
                                size="sm"
                                className="gap-2 rounded-xl h-11 font-bold text-sm  text-muted-foreground"
                                onClick={() => { setActionFilter(""); setSearchQuery(""); setDatePreset("30d"); }}
                            >
                                <XCircle className="w-3.5 h-3.5" /> Clear
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            <Card className="border-border/50 rounded-2xl overflow-hidden shadow-sm">
                <CardHeader className="p-6 border-b border-border/50 bg-muted/5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-semibold  text-muted-foreground">
                                {isLoading ? "Loading..." : `${filteredLogs.length} of ${totalCount} records`}
                            </span>
                            <span className="text-muted-foreground/30">|</span>
                            <span className="text-sm font-semibold  text-muted-foreground">
                                Page {page}
                            </span>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading && logs.length === 0 ? (
                        <div className="py-32 flex flex-col items-center justify-center gap-6">
                            <div className="relative">
                                <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                                <RefreshCw className="h-10 w-10 text-primary animate-spin relative z-10" />
                            </div>
                            <p className="text-sm text-primary font-semibold  animate-pulse">Loading audit trail...</p>
                        </div>
                    ) : filteredLogs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-32 bg-muted/5">
                            <div className="w-20 h-20 rounded-[2rem] bg-muted/20 flex items-center justify-center mb-6">
                                <SearchX className="h-10 w-10 text-muted-foreground/30" />
                            </div>
                            <h3 className="text-2xl font-semibold">No Audit Records</h3>
                            <p className="text-muted-foreground text-sm font-semibold  max-w-xs text-center mt-3 opacity-60">
                                {totalCount === 0 ? "No audit events have been recorded yet." : "No records match your current filters."}
                            </p>
                            <Button variant="outline"
                                className="mt-8 rounded-[1.2rem] font-semibold text-sm border-primary/20 text-primary px-10 h-11 hover:bg-primary hover:text-white transition-all"
                                onClick={() => { setSearchQuery(""); setActionFilter(""); setDatePreset("30d"); }}
                            >
                                RESET FILTERS
                            </Button>
                        </div>
                    ) : (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/10 hover:bg-transparent border-b border-border/50">
                                        <TableHead className="w-[160px] font-semibold  text-sm px-6 h-auto py-4">Timestamp</TableHead>
                                        <TableHead className="w-[220px] font-semibold  text-sm h-auto py-4">User</TableHead>
                                        <TableHead className="w-[120px] font-semibold  text-sm h-auto py-4">Action</TableHead>
                                        <TableHead className="w-[100px] font-semibold  text-sm h-auto py-4">Entity</TableHead>
                                        <TableHead className="w-[120px] font-semibold  text-sm h-auto py-4">Entity ID</TableHead>
                                        <TableHead className="font-semibold  text-sm h-auto py-4">Description</TableHead>
                                        <TableHead className="w-[120px] font-semibold  text-sm h-auto py-4">IP Address</TableHead>
                                        <TableHead className="w-[80px] text-right font-semibold  text-sm px-6 h-auto py-4">Changes</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredLogs.map((log) => (
                                        <TableRow key={log.id} className="group hover:bg-primary/[0.02] transition-all border-b border-border/20">
                                            <TableCell className="px-6 py-5">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-sm font-semibold">{formatDateTime(log.createdAt)}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-[0.7rem] bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                                        <Mail className="w-3.5 h-3.5" />
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="text-sm font-semibold truncate">{log.userEmail}</span>
                                                        <span className="text-xs">{getRoleBadge(log.userRole)}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-5">{getActionBadge(log.action)}</TableCell>
                                            <TableCell className="py-5">
                                                <span className="text-sm font-semibold ">{log.entity}</span>
                                            </TableCell>
                                            <TableCell className="py-5">
                                                <span className="text-sm font-mono font-bold text-muted-foreground bg-muted/20 px-2 py-1 rounded-lg" title={log.entityId}>
                                                    {truncateId(log.entityId)}
                                                </span>
                                            </TableCell>
                                            <TableCell className="py-5 max-w-[240px]">
                                                <p className="text-sm font-medium text-muted-foreground truncate">{log.description || "—"}</p>
                                            </TableCell>
                                            <TableCell className="py-5">
                                                <div className="flex items-center gap-1.5">
                                                    <Monitor className="w-3 h-3 text-muted-foreground/50" />
                                                    <span className="text-sm font-mono font-bold text-muted-foreground/70">{log.ipAddress || "—"}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right px-6 py-5">
                                                <Button variant="ghost"
                                                    size="icon"
                                                    className="h-9 w-9 rounded-2xl hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all"
                                                    onClick={() => handleViewDetails(log)}
                                                    title="View changes"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            {/* Load More */}
                            {hasMore && (
                                <div className="flex justify-center py-6 border-t border-border/20">
                                    <Button variant="outline"
                                        className="gap-2 rounded-xl h-11 px-8 font-semibold text-sm  border-border/50"
                                        onClick={handleLoadMore}
                                        disabled={isLoadingMore}
                                    >
                                        {isLoadingMore ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Loading...
                                            </>
                                        ) : (
                                            <>
                                                <ChevronDown className="w-4 h-4" />
                                                Load More
                                            </>
                                        )}
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Detail Dialog */}
            <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                <DialogContent className="w-[95vw] sm:max-w-3xl rounded-[2.5rem] border-border/40 bg-card/60 backdrop-blur-xl shadow-2xl p-0 flex flex-col max-h-[85vh]">
                    <DialogHeader className="shrink-0 px-8 pt-8 pb-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                            <Activity className="w-6 h-6 text-primary" />
                        </div>
                        <DialogTitle className="text-2xl font-semibold">Audit Event Details</DialogTitle>
                        <DialogDescription className="font-bold">
                            Immutable record of the system action and its context.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedLog && (
                        <div className="flex-1 overflow-y-auto px-8 pb-4 space-y-6" data-lenis-prevent>
                            {/* Summary */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div className="p-4 rounded-2xl bg-muted/10 space-y-1">
                                    <p className="text-xs font-semibold  text-muted-foreground">Event ID</p>
                                    <p className="text-sm font-mono font-semibold truncate">{truncateId(selectedLog.id, 12)}</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-muted/10 space-y-1">
                                    <p className="text-xs font-semibold  text-muted-foreground">Timestamp</p>
                                    <p className="text-sm font-semibold">{formatDateTime(selectedLog.createdAt)}</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-muted/10 space-y-1">
                                    <p className="text-xs font-semibold  text-muted-foreground">Action</p>
                                    <div>{getActionBadge(selectedLog.action)}</div>
                                </div>
                                <div className="p-4 rounded-2xl bg-muted/10 space-y-1">
                                    <p className="text-xs font-semibold  text-muted-foreground">Entity</p>
                                    <p className="text-sm font-semibold ">{selectedLog.entity}</p>
                                </div>
                            </div>

                            <Separator className="bg-border/30" />

                            {/* User Info */}
                            <div className="space-y-3">
                                <p className="text-sm font-semibold  text-muted-foreground">User Context</p>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-xs font-semibold  text-muted-foreground/60">User ID</p>
                                        <p className="text-sm font-mono font-semibold">{truncateId(selectedLog.userId, 12)}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-semibold  text-muted-foreground/60">Email</p>
                                        <p className="text-sm font-semibold">{selectedLog.userEmail}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-semibold  text-muted-foreground/60">Role</p>
                                        <div>{getRoleBadge(selectedLog.userRole)}</div>
                                    </div>
                                </div>
                            </div>

                            <Separator className="bg-border/30" />

                            {/* Request Context */}
                            {(selectedLog.ipAddress || selectedLog.userAgent) && (
                                <div className="space-y-3">
                                    <p className="text-sm font-semibold  text-muted-foreground">Request Context</p>
                                    <div className="grid grid-cols-2 gap-4">
                                        {selectedLog.ipAddress && (
                                            <div className="space-y-1">
                                                <p className="text-xs font-semibold  text-muted-foreground/60">IP Address</p>
                                                <div className="flex items-center gap-1.5">
                                                    <Monitor className="w-3 h-3 text-muted-foreground/50" />
                                                    <p className="text-sm font-mono font-semibold">{selectedLog.ipAddress}</p>
                                                </div>
                                            </div>
                                        )}
                                        {selectedLog.userAgent && (
                                            <div className="space-y-1 sm:col-span-2">
                                                <p className="text-xs font-semibold  text-muted-foreground/60">User Agent</p>
                                                <p className="text-xs font-mono text-muted-foreground/70 break-all">{selectedLog.userAgent}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {selectedLog.userAgent && <Separator className="bg-border/30" />}

                            {/* Description */}
                            <div className="space-y-3">
                                <p className="text-sm font-semibold  text-muted-foreground">Description</p>
                                <div className="p-4 rounded-2xl bg-muted/10">
                                    <p className="text-sm font-medium">{selectedLog.description || "No description provided."}</p>
                                </div>
                                {selectedLog.entityId && (
                                    <div className="flex items-center gap-2 text-sm font-mono font-bold text-muted-foreground">
                                        <span className="text-xs font-semibold  text-muted-foreground/60">Entity ID:</span>
                                        <span className="bg-muted/20 px-2 py-0.5 rounded-lg">{selectedLog.entityId}</span>
                                    </div>
                                )}
                            </div>

                            {/* Old/New Values */}
                            {(selectedLog.oldValues || selectedLog.newValues) && (
                                <>
                                    <Separator className="bg-border/30" />
                                    <div className="space-y-3">
                                        <p className="text-sm font-semibold  text-muted-foreground">Data Changes</p>
                                        <JsonDiffView oldValues={selectedLog.oldValues}
                                            newValues={selectedLog.newValues}
                                        />
                                    </div>
                                </>
                            )}

                            {/* Metadata */}
                            {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                                <>
                                    <Separator className="bg-border/30" />
                                    <div className="space-y-3">
                                        <p className="text-sm font-semibold  text-muted-foreground">Metadata</p>
                                        <pre className="bg-black/20 rounded-2xl p-4 text-sm font-mono leading-relaxed overflow-x-auto max-h-40 whitespace-pre-wrap break-all">
                                            {JSON.stringify(selectedLog.metadata, null, 2)}
                                        </pre>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default withRoleProtection(AuditLogPage, ["Admin", "SuperAdmin"]);

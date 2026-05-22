"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Search,
    Filter,
    MoreHorizontal,
    MessageSquare,
    Download,
    Ticket,
    AlertCircle,
    Clock,
    CheckCircle2,
    XCircle,
    ChevronRight,
    SearchX,
    RefreshCw,
    Activity,
    Send,
    ArrowUpDown,
    Trash2,
    Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { supportAPI, Ticket as TicketType, TicketMessage, TicketStatus, TicketPriority } from "@/lib/api";
import { toast } from "sonner";
import { withRoleProtection } from "@/components/auth/role-guard";

const STATUS_CONFIG = {
    open: { label: "Open", icon: Activity, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    pending: { label: "Pending", icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
    resolved: { label: "Resolved", icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/20" },
    closed: { label: "Closed", icon: XCircle, color: "text-muted-foreground", bg: "bg-muted/20", border: "border-border/50" },
} as const;

const PRIORITY_CONFIG = {
    low: { label: "Low", color: "text-slate-400", bg: "bg-slate-500/10", border: "border-slate-500/20" },
    medium: { label: "Medium", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    high: { label: "High", color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
    urgent: { label: "Urgent", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
} as const;

type StatusFilter = "all" | "open" | "pending" | "resolved" | "closed";
type PriorityFilter = "all" | "low" | "medium" | "high" | "urgent";

function TicketsPage() {
    const [tickets, setTickets] = useState<TicketType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
    const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("all");

    const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isDetailLoading, setIsDetailLoading] = useState(false);
    const [replyContent, setReplyContent] = useState("");
    const [isSendingReply, setIsSendingReply] = useState(false);
    const [detailStatus, setDetailStatus] = useState<string>("");
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

    const fetchTickets = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = statusFilter !== "all" ? statusFilter : undefined;
            const data = await supportAPI.getTickets(params);
            setTickets(Array.isArray(data) ? data : []);
        } catch {
            toast.error("Failed to load support tickets");
            setTickets([]);
        } finally {
            setIsLoading(false);
        }
    }, [statusFilter]);

    useEffect(() => {
        fetchTickets();
    }, [fetchTickets]);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await fetchTickets();
        setIsRefreshing(false);
        toast.success("Ticket matrix synchronized");
    };

    const filteredTickets = (() => {
        let result = tickets;
        if (priorityFilter !== "all") {
            result = result.filter(t => t.priority === priorityFilter);
        }
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(t =>
                (t.subject || '').toLowerCase().includes(q) ||
                t.customer?.name?.toLowerCase().includes(q) ||
                t.customer?.email?.toLowerCase().includes(q)
            );
        }
        return result;
    })();

    const getStatusBadge = (status: string) => {
        const cfg = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.open;
        const Icon = cfg.icon;
        return (
            <Badge className={cn("gap-1.5 rounded-lg font-semibold text-sm uppercase", cfg.bg, cfg.color, cfg.border)}>
                <Icon className="w-3 h-3" /> {cfg.label}
            </Badge>
        );
    };

    const getPriorityBadge = (priority: string) => {
        const cfg = PRIORITY_CONFIG[priority as keyof typeof PRIORITY_CONFIG] || PRIORITY_CONFIG.medium;
        return (
            <Badge variant="outline" className={cn("rounded-lg font-semibold text-sm uppercase", cfg.bg, cfg.color, cfg.border)}>
                {cfg.label}
            </Badge>
        );
    };

    const handleExport = () => {
        if (filteredTickets.length === 0) {
            toast.info("No tickets to export for current filters.");
            return;
        }
        const headers = ["Subject", "Customer", "Email", "Status", "Priority", "Category", "Created"];
        const rows = filteredTickets.map(t => [
            (t.subject || "").replace(/"/g, '""'),
            (t.customer?.name || "").replace(/"/g, '""'),
            (t.customer?.email || "").replace(/"/g, '""'),
            t.status || "",
            t.priority || "",
            (t.category || "").replace(/"/g, '""'),
            new Date(t.createdAt).toISOString(),
        ].map(c => `"${c}"`).join(","));
        const csv = [headers.join(","), ...rows].join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `tickets-export-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Ticket export downloaded");
    };

    const openTicketDetail = async (ticket: TicketType) => {
        setIsDetailLoading(true);
        setSelectedTicket(ticket);
        setIsDetailOpen(true);
        setDetailStatus(ticket.status);
        setReplyContent("");
        try {
            const detailed = await supportAPI.getTicket(ticket.id);
            setSelectedTicket(detailed);
        } catch {
            toast.error("Failed to load ticket details");
        } finally {
            setIsDetailLoading(false);
        }
    };

    const handleSendReply = async () => {
        if (!selectedTicket || !replyContent.trim()) return;
        setIsSendingReply(true);
        try {
            await supportAPI.addMessage(selectedTicket.id, replyContent.trim());
            toast.success("Reply sent successfully");
            setReplyContent("");
            const updated = await supportAPI.getTicket(selectedTicket.id);
            setSelectedTicket(updated);
            fetchTickets();
        } catch {
            toast.error("Failed to send reply");
        } finally {
            setIsSendingReply(false);
        }
    };

    const handleStatusUpdate = async (newStatus: string) => {
        if (!selectedTicket) return;
        setIsUpdatingStatus(true);
        try {
            await supportAPI.updateTicketStatus(selectedTicket.id, newStatus);
            toast.success(`Ticket status updated to ${STATUS_CONFIG[newStatus as keyof typeof STATUS_CONFIG]?.label || newStatus}`);
            setDetailStatus(newStatus);
            const updated = await supportAPI.getTicket(selectedTicket.id);
            setSelectedTicket(updated);
            fetchTickets();
        } catch {
            toast.error("Failed to update ticket status");
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    const stats = {
        total: tickets.length,
        open: tickets.filter(t => t.status === "open").length,
        pending: tickets.filter(t => t.status === "pending").length,
        resolved: tickets.filter(t => t.status === "resolved").length,
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-semibold">Support Tickets</h1>
                    <p className="text-muted-foreground font-medium">Manage incoming support requests, track resolutions, and respond to customers.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" className="gap-2 rounded-xl h-11 border-border/50 bg-card/50 backdrop-blur-sm" onClick={handleRefresh}>
                        <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
                        Fast Sync
                    </Button>
                    <Button variant="outline" className="gap-2 rounded-xl h-11 border-border/50 bg-card/50 backdrop-blur-sm" onClick={handleExport}>
                        <Download className="w-4 h-4" />
                        Export
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-border/50 bg-card/40 backdrop-blur-md rounded-[2.5rem] overflow-hidden group hover:border-primary/30 transition-all h-full flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between pb-1 p-5">
                        <CardTitle className="text-sm font-semibold uppercase text-muted-foreground">Total Tickets</CardTitle>
                        <div className="p-1.5 rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                            <Ticket className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-5 pt-0 flex-1">
                        <div className="text-3xl font-semibold">{stats.total}</div>
                        <p className="text-xs text-muted-foreground uppercase mt-2 font-semibold opacity-60">All Time Queue</p>
                    </CardContent>
                </Card>
                <Card className="border-border/50 bg-card/40 backdrop-blur-md rounded-[2.5rem] overflow-hidden group hover:border-blue-500/30 transition-all h-full flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between pb-1 p-5">
                        <CardTitle className="text-sm font-semibold uppercase text-muted-foreground">Open</CardTitle>
                        <div className="p-1.5 rounded-xl bg-blue-500/10 text-blue-500 group-hover:scale-110 transition-transform">
                            <Activity className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-5 pt-0 flex-1">
                        <div className="text-3xl font-semibold text-blue-500">{stats.open}</div>
                        <p className="text-xs text-blue-500/60 uppercase mt-2 font-semibold">Awaiting Response</p>
                    </CardContent>
                </Card>
                <Card className="border-border/50 bg-card/40 backdrop-blur-md rounded-[2.5rem] overflow-hidden group hover:border-amber-500/30 transition-all h-full flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between pb-1 p-5">
                        <CardTitle className="text-sm font-semibold uppercase text-muted-foreground">Pending</CardTitle>
                        <div className="p-1.5 rounded-xl bg-amber-500/10 text-amber-500 group-hover:scale-110 transition-transform">
                            <Clock className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-5 pt-0 flex-1">
                        <div className="text-3xl font-semibold text-amber-500">{stats.pending}</div>
                        <p className="text-xs text-amber-500/60 uppercase mt-2 font-semibold">In Progress</p>
                    </CardContent>
                </Card>
                <Card className="border-border/50 bg-card/40 backdrop-blur-md rounded-[2.5rem] overflow-hidden group hover:border-green-500/30 transition-all h-full flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between pb-1 p-5">
                        <CardTitle className="text-sm font-semibold uppercase text-muted-foreground">Resolved</CardTitle>
                        <div className="p-1.5 rounded-xl bg-green-500/10 text-green-500 group-hover:scale-110 transition-transform">
                            <CheckCircle2 className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-5 pt-0 flex-1">
                        <div className="text-3xl font-semibold text-green-500">{stats.resolved}</div>
                        <p className="text-xs text-green-500/60 uppercase mt-2 font-semibold">Successfully Closed</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid lg:grid-cols-4 gap-8">
                {/* Sidebar Filters */}
                <div className="space-y-6">
                    <Card className="border-border/50 h-fit rounded-[2.5rem] overflow-hidden shadow-sm bg-card/40 backdrop-blur-md">
                        <CardHeader className="p-8 pb-4">
                            <CardTitle className="text-sm font-semibold uppercase text-muted-foreground">Status Filter</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <div className="flex flex-col gap-1">
                                {[
                                    { name: "All", key: "all" as StatusFilter, count: tickets.length },
                                    { name: "Open", key: "open" as StatusFilter, count: stats.open },
                                    { name: "Pending", key: "pending" as StatusFilter, count: stats.pending },
                                    { name: "Resolved", key: "resolved" as StatusFilter, count: stats.resolved },
                                    { name: "Closed", key: "closed" as StatusFilter, count: tickets.filter(t => t.status === "closed").length },
                                ].map((segment) => (
                                    <button key={segment.key}
                                        onClick={() => setStatusFilter(segment.key)}
                                        className={cn(
                                            "flex items-center justify-between px-6 py-4 rounded-2xl text-sm transition-all group",
                                            statusFilter === segment.key
                                                ? "bg-primary text-white font-semibold shadow-lg shadow-primary/20"
                                                : "text-muted-foreground font-semibold hover:bg-primary/5 hover:text-primary"
                                        )}
                                    >
                                        <span className=" uppercase">{segment.name}</span>
                                        <span className={cn(
                                            "px-2 py-0.5 rounded-lg text-xs font-semibold",
                                            statusFilter === segment.key ? "bg-white/20 text-white" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                                        )}>{segment.count}</span>
                                    </button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border/50 h-fit rounded-[2.5rem] overflow-hidden shadow-sm bg-card/40 backdrop-blur-md">
                        <CardHeader className="p-8 pb-4">
                            <CardTitle className="text-sm font-semibold uppercase text-muted-foreground">Priority Filter</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <div className="flex flex-col gap-1">
                                {([
                                    { name: "All", key: "all" as PriorityFilter },
                                    { name: "Low", key: "low" as PriorityFilter },
                                    { name: "Medium", key: "medium" as PriorityFilter },
                                    { name: "High", key: "high" as PriorityFilter },
                                    { name: "Urgent", key: "urgent" as PriorityFilter },
                                ] as const).map((seg) => (
                                    <button key={seg.key}
                                        onClick={() => setPriorityFilter(seg.key)}
                                        className={cn(
                                            "flex items-center justify-between px-6 py-4 rounded-2xl text-sm transition-all group",
                                            priorityFilter === seg.key
                                                ? "bg-primary text-white font-semibold shadow-lg shadow-primary/20"
                                                : "text-muted-foreground font-semibold hover:bg-primary/5 hover:text-primary"
                                        )}
                                    >
                                        <span className=" uppercase">{seg.name}</span>
                                        <span className={cn(
                                            "px-2 py-0.5 rounded-lg text-xs font-semibold",
                                            priorityFilter === seg.key ? "bg-white/20 text-white" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary",
                                            seg.key !== "all" && PRIORITY_CONFIG[seg.key].color
                                        )}>
                                            {seg.key !== "all" ? tickets.filter(t => t.priority === seg.key).length : tickets.length}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border/50 bg-primary/5 rounded-[2.5rem] border-dashed p-4">
                        <CardHeader className="p-6">
                            <CardTitle className="text-sm font-semibold uppercase flex items-center gap-2">
                                <Clock className="w-4 h-4 text-primary" /> Sync Protocol
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-6 pb-6 pt-0 space-y-4">
                            <p className="text-sm font-semibold text-muted-foreground leading-relaxed uppercase opacity-70">Tickets are synced with the support queue in real time.</p>
                            <Button variant="outline" className="w-full rounded-[1.2rem] bg-background text-sm h-10 font-semibold border-primary/20 text-primary hover:bg-primary hover:text-white transition-all" onClick={handleRefresh}>BATCH SYNC NOW</Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Ticket List */}
                <div className="lg:col-span-3 space-y-4">
                    <Card className="border-border/50 rounded-2xl overflow-hidden shadow-sm">
                        <CardHeader className="p-6 border-b border-border/50 bg-muted/5">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="relative flex-1 max-w-sm">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input placeholder="Search by subject, customer..."
                                        className="pl-10 h-11 rounded-xl bg-background font-medium"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="outline"
                                        size="sm"
                                        className="gap-2 rounded-xl h-10 font-bold px-4"
                                        onClick={() => toast.info("Use filters on the left to narrow by status and priority.")}
                                    >
                                        <Filter className="h-4 w-4" />
                                        Advanced
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {isLoading && tickets.length === 0 ? (
                                <div className="py-32 flex flex-col items-center justify-center gap-6">
                                    <div className="relative">
                                        <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                                        <RefreshCw className="h-10 w-10 text-primary animate-spin relative z-10" />
                                    </div>
                                    <p className="text-sm text-primary font-semibold uppercase animate-pulse">Loading Ticket Stream...</p>
                                </div>
                            ) : filteredTickets.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-32 bg-muted/5">
                                    <div className="w-20 h-20 rounded-[2rem] bg-muted/20 flex items-center justify-center mb-6">
                                        <SearchX className="h-10 w-10 text-muted-foreground/30" />
                                    </div>
                                    <h3 className="text-2xl font-semibold">No Records Found</h3>
                                    <p className="text-muted-foreground text-sm font-semibold uppercase max-w-xs text-center mt-3 opacity-60">The current query or filter returned no support tickets.</p>
                                    <Button variant="outline" className="mt-8 rounded-[1.2rem] font-semibold text-sm border-primary/20 text-primary px-10 h-11 hover:bg-primary hover:text-white transition-all" onClick={() => { setSearchQuery(""); setStatusFilter("all"); setPriorityFilter("all"); }}>RESET FILTERS</Button>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/10 hover:bg-transparent border-b border-border/50">
                                            <TableHead className="w-[280px] font-semibold uppercase text-sm px-6 h-auto">Subject</TableHead>
                                            <TableHead className="font-semibold uppercase text-sm h-auto">Customer</TableHead>
                                            <TableHead className="font-semibold uppercase text-sm h-auto">Status</TableHead>
                                            <TableHead className="font-semibold uppercase text-sm h-auto">Priority</TableHead>
                                            <TableHead className="font-semibold uppercase text-sm h-auto">Category</TableHead>
                                            <TableHead className="font-semibold uppercase text-sm h-auto">Created</TableHead>
                                            <TableHead className="text-right font-semibold uppercase text-sm px-6 h-auto">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredTickets.map((t) => (
                                            <TableRow key={t.id}
                                                className="group hover:bg-primary/[0.02] transition-all border-b border-border/20 cursor-pointer"
                                                onClick={() => openTicketDetail(t)}
                                            >
                                                <TableCell className="px-6 py-5">
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-sm">{t.subject}</span>
                                                        <span className="text-sm text-muted-foreground font-semibold uppercase opacity-60">{t.id?.slice(0, 8) || "—"}...</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-xs">{t.customer?.name || "—"}</span>
                                                        <span className="text-xs text-muted-foreground font-semibold uppercase opacity-60">{t.customer?.email || "—"}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{getStatusBadge(t.status)}</TableCell>
                                                <TableCell>{getPriorityBadge(t.priority)}</TableCell>
                                                <TableCell>
                                                    <span className="text-sm font-semibold uppercase text-muted-foreground">{t.category || "—"}</span>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col gap-0.5">
                                                        <div className="text-sm font-semibold">{new Date(t.createdAt).toLocaleDateString()}</div>
                                                        <div className="text-xs font-semibold uppercase text-muted-foreground">{new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right px-6">
                                                    <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                                                        <Button variant="ghost"
                                                            size="icon"
                                                            className="h-10 w-10 rounded-2xl text-primary hover:bg-primary/10 transition-all"
                                                            onClick={() => openTicketDetail(t)}
                                                        >
                                                            <Eye className="w-5 h-5" />
                                                        </Button>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-2xl hover:bg-muted/50">
                                                                    <MoreHorizontal className="h-5 w-5" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="w-64 rounded-[1.5rem] p-2 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.2)] border-border/50 backdrop-blur-xl">
                                                                <DropdownMenuLabel className="text-sm font-semibold uppercase text-muted-foreground px-3 py-2">Ticket Actions</DropdownMenuLabel>
                                                                {(["open", "pending", "resolved", "closed"] as const).map((s) => (
                                                                    s !== t.status && (
                                                                        <DropdownMenuItem key={s}
                                                                            className="gap-3 cursor-pointer rounded-xl font-semibold py-3 text-xs"
                                                                            onClick={async () => {
                                                                                try {
                                                                                    await supportAPI.updateTicketStatus(t.id, s);
                                                                                    toast.success(`Ticket marked as ${STATUS_CONFIG[s].label}`);
                                                                                    fetchTickets();
                                                                                } catch {
                                                                                    toast.error("Failed to update status");
                                                                                }
                                                                            }}
                                                                        >
                                                                            <div className={cn("w-2 h-2 rounded-full", STATUS_CONFIG[s].color.replace("text-", "bg-"))} />
                                                                            Move to {STATUS_CONFIG[s].label}
                                                                        </DropdownMenuItem>
                                                                    )
                                                                ))}
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Ticket Detail Dialog */}
            <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                <DialogContent className="sm:max-w-3xl rounded-[2.5rem] border-border/40 bg-card/60 backdrop-blur-xl shadow-2xl p-0 flex flex-col max-h-[85vh]">
                    {isDetailLoading || !selectedTicket ? (
                        <div className="py-32 flex flex-col items-center justify-center gap-6">
                            <div className="relative">
                                <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                                <RefreshCw className="h-10 w-10 text-primary animate-spin relative z-10" />
                            </div>
                            <p className="text-sm text-primary font-semibold uppercase animate-pulse">Loading Ticket Payload...</p>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto" data-lenis-prevent>
                            {/* Header */}
                            <div className="p-8 pb-6 border-b border-border/50 shrink-0">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <DialogTitle className="text-2xl font-semibold">{selectedTicket.subject}</DialogTitle>
                                            {getStatusBadge(selectedTicket.status)}
                                            {getPriorityBadge(selectedTicket.priority)}
                                        </div>
                                        <DialogDescription className="font-medium text-sm">
                                            Ticket #{selectedTicket.id?.slice(0, 12) || "—"} — opened by <span className="text-primary font-semibold">{selectedTicket.customer?.name || "Unknown"}</span>
                                            {selectedTicket.customer?.email && (
                                                <> &lt;{selectedTicket.customer.email}&gt;</>
                                            )}
                                        </DialogDescription>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-6 mt-4 text-sm font-semibold uppercase text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-3 h-3" /> Created: {new Date(selectedTicket.createdAt).toLocaleString()}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Activity className="w-3 h-3" /> Updated: {new Date(selectedTicket.updatedAt).toLocaleString()}
                                    </div>
                                    {selectedTicket.category && (
                                        <div>Category: {selectedTicket.category}</div>
                                    )}
                                </div>
                            </div>

                            {/* Message Thread */}
                            <div className="p-8 space-y-6">
                                {(!selectedTicket.messages || selectedTicket.messages.length === 0) ? (
                                    <div className="flex flex-col items-center justify-center py-16 text-center">
                                        <MessageSquare className="h-10 w-10 text-muted-foreground/30 mb-4" />
                                        <p className="text-lg font-semibold">No Messages Yet</p>
                                        <p className="text-sm font-semibold text-muted-foreground uppercase mt-2 opacity-60">This ticket has no message history.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {selectedTicket.messages.map((msg, idx) => {
                                            const senderName = (msg as any).sender?.name || (msg as any).sender?.email || "Customer";
                                            const isStaff = (msg as any).isStaff || (msg as any).sender?.role === "Admin" || (msg as any).sender?.role === "Support";
                                            return (
                                                <div key={msg.id || idx} className={cn("flex gap-4", isStaff && "flex-row-reverse")}>
                                                    <div className={cn(
                                                        "flex-1 max-w-[80%] rounded-2xl p-5",
                                                        isStaff
                                                            ? "bg-primary/10 border border-primary/20"
                                                            : "bg-muted/20 border border-border/50"
                                                    )}>
                                                        <div className={cn("flex items-center gap-2 mb-3", isStaff && "flex-row-reverse")}>
                                                            <span className="font-semibold text-xs">{senderName}</span>
                                                            <span className={cn(
                                                                "text-xs font-semibold uppercase",
                                                                isStaff ? "text-primary" : "text-muted-foreground"
                                                            )}>
                                                                {isStaff ? "Staff" : "Customer"}
                                                            </span>
                                                            <span className="text-xs text-muted-foreground ml-auto font-semibold">
                                                                {new Date(msg.createdAt).toLocaleString()}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Reply & Status Controls */}
                            <div className="border-t border-border/50 p-8 pt-6 space-y-4 bg-muted/5 shrink-0">
                                <div className="flex items-center gap-4">
                                    <div className="flex-1 space-y-1">
                                        <Label className="font-semibold text-sm uppercase text-muted-foreground ml-1">Update Status</Label>
                                        <div className="flex gap-2 flex-wrap">
                                            {(["open", "pending", "resolved", "closed"] as const).map((s) => (
                                                <Button key={s}
                                                    size="sm"
                                                    variant={detailStatus === s ? "default" : "outline"}
                                                    className={cn(
                                                        "rounded-xl text-sm font-semibold uppercase h-9 px-4",
                                                        detailStatus === s ? "shadow-lg" : "border-border/50"
                                                    )}
                                                    disabled={isUpdatingStatus || detailStatus === s}
                                                    onClick={() => handleStatusUpdate(s)}
                                                >
                                                    {STATUS_CONFIG[s].label}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-semibold text-sm uppercase text-muted-foreground ml-1">Reply to Customer</Label>
                                    <div className="flex gap-3 items-end">
                                        <Textarea className="flex-1 min-h-[60px] rounded-xl font-medium resize-none bg-background"
                                            placeholder="Type your reply..."
                                            value={replyContent}
                                            onChange={(e) => setReplyContent(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter" && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleSendReply();
                                                }
                                            }}
                                        />
                                        <Button className="rounded-xl h-[60px] px-6 shadow-lg shadow-primary/20 font-semibold"
                                            disabled={!replyContent.trim() || isSendingReply}
                                            onClick={handleSendReply}
                                        >
                                            <Send className={cn("w-4 h-4", isSendingReply && "animate-spin")} />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default withRoleProtection(TicketsPage, ["Admin", "SuperAdmin"]);

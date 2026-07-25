"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import {
    Search, Plus, RefreshCw, Calendar, CalendarCheck, FileText, XCircle, CheckCircle2,
    Clock, Eye, MoreVertical, Pencil, Trash2, Send, SearchX, Filter, Tag, Image, MapPin,
    Users, DollarSign, LayoutGrid, List, ChevronRight, ChevronLeft, AlertCircle,
    ArrowUpDown, ArrowUp, ArrowDown, Square, CheckSquare, Globe, Building, Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
    DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { eventsAPI, type Event } from "@/lib/api";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { format } from "date-fns";
import { withRoleProtection } from "@/components/auth/role-guard";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

const EVENTS_PER_PAGE = 10;

const EVENT_TYPES = [
    { label: 'Webinar', value: 'webinar' },
    { label: 'Workshop', value: 'workshop' },
    { label: 'Conference', value: 'conference' },
    { label: 'Meetup', value: 'meetup' },
    { label: 'Hackathon', value: 'hackathon' },
    { label: 'Training', value: 'training' },
];

function getTypeBadge(type: Event['type']) {
    const map: Record<string, { cls: string; label: string }> = {
        webinar: { cls: 'bg-sky-500/10 text-sky-500 border-sky-500/20', label: 'Webinar' },
        workshop: { cls: 'bg-violet-500/10 text-violet-500 border-violet-500/20', label: 'Workshop' },
        conference: { cls: 'bg-amber-500/10 text-amber-500 border-amber-500/20', label: 'Conference' },
        meetup: { cls: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', label: 'Meetup' },
        hackathon: { cls: 'bg-rose-500/10 text-rose-500 border-rose-500/20', label: 'Hackathon' },
        training: { cls: 'bg-blue-500/10 text-blue-500 border-blue-500/20', label: 'Training' },
    };
    const m = map[type];
    return <Badge className={`${m.cls} gap-1.5 rounded-md text-xs font-medium`}>{m.label}</Badge>;
}

function getStatusBadge(status: Event['status']) {
    switch (status) {
        case 'published': return <Badge className="bg-green-500/10 text-green-500 border-green-500/20 gap-1 rounded-md text-xs font-medium"><CheckCircle2 className="w-3 h-3" /> Published</Badge>;
        case 'draft': return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 gap-1 rounded-md text-xs font-medium"><FileText className="w-3 h-3" /> Draft</Badge>;
        case 'cancelled': return <Badge className="bg-destructive/10 text-destructive border-destructive/20 gap-1 rounded-md text-xs font-medium"><XCircle className="w-3 h-3" /> Cancelled</Badge>;
        case 'completed': return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 gap-1 rounded-md text-xs font-medium"><CalendarCheck className="w-3 h-3" /> Completed</Badge>;
    }
}

function AdminEventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [sortField, setSortField] = useState("startDate");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
    const [currentPage, setCurrentPage] = useState(1);
    const [view, setView] = useState<"list" | "grid">("list");
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
    const [bulkStatusOpen, setBulkStatusOpen] = useState<string | null>(null);
    const [stats, setStats] = useState<{ total: number; published: number; draft: number; cancelled: number; completed: number } | null>(null);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        title: "", slug: "", description: "", shortDescription: "",
        type: "webinar" as Event['type'], status: "draft" as Event['status'],
        startDate: "", endDate: "", timezone: "",
        location: "", venue: "", image: "",
        capacity: 0, price: 0, isFree: true, tags: "",
    });

    const fetchEvents = useCallback(async () => {
        try {
            setIsLoading(true);
            setIsError(false);
            const response = await eventsAPI.getAll({ take: 100 });
            setEvents(response.items ?? response);
        } catch {
            setIsError(true);
            toast.error('Failed to load events');
        } finally { setIsLoading(false); }
    }, []);

    const fetchStats = useCallback(async () => {
        try {
            const data = await eventsAPI.getStats();
            setStats(data);
        } catch {}
    }, []);

    useEffect(() => { fetchEvents(); fetchStats(); }, [fetchEvents, fetchStats]);

    const filteredEvents = useMemo(() => {
        let list = events.filter((e) => {
            if (statusFilter !== 'all' && e.status !== statusFilter) return false;
            if (typeFilter !== 'all' && e.type !== typeFilter) return false;
            if (!searchQuery) return true;
            const q = searchQuery.toLowerCase();
            return (e.title || '').toLowerCase().includes(q) || (e.slug || '').toLowerCase().includes(q);
        });

        const sorted = [...list].sort((a, b) => {
            let aVal: any = a[sortField as keyof Event] as any;
            let bVal: any = b[sortField as keyof Event] as any;
            if (sortField === "startDate" || sortField === "endDate" || sortField === "createdAt") {
                aVal = new Date(aVal || 0).getTime();
                bVal = new Date(bVal || 0).getTime();
            } else if (sortField === "capacity" || sortField === "registeredCount" || sortField === "price") {
                aVal = Number(aVal) || 0;
                bVal = Number(bVal) || 0;
            } else {
                aVal = (aVal || "").toLowerCase();
                bVal = (bVal || "").toLowerCase();
            }
            if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
            if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
            return 0;
        });

        return sorted;
    }, [events, statusFilter, typeFilter, searchQuery, sortField, sortDirection]);

    const totalPages = Math.ceil(filteredEvents.length / EVENTS_PER_PAGE);
    const paginatedEvents = useMemo(() => {
        const start = (currentPage - 1) * EVENTS_PER_PAGE;
        return filteredEvents.slice(start, start + EVENTS_PER_PAGE);
    }, [filteredEvents, currentPage]);

    const openAddDialog = () => {
        setEditingEvent(null);
        setFormData({ title: "", slug: "", description: "", shortDescription: "", type: "webinar", status: "draft", startDate: "", endDate: "", timezone: "", location: "", venue: "", image: "", capacity: 0, price: 0, isFree: true, tags: "" });
        setIsDialogOpen(true);
    };

    const openEditDialog = (event: Event) => {
        setEditingEvent(event);
        setFormData({
            title: event.title, slug: event.slug, description: event.description, shortDescription: event.shortDescription || '',
            type: event.type, status: event.status,
            startDate: event.startDate ? event.startDate.slice(0, 16) : '',
            endDate: event.endDate ? event.endDate.slice(0, 16) : '',
            timezone: event.timezone || '', location: event.location || '', venue: event.venue || '', image: event.image || '',
            capacity: event.capacity, price: Number(event.price), isFree: event.isFree,
            tags: (event.tags || []).join(', '),
        });
        setIsDialogOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const payload = {
                ...formData,
                tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
                capacity: Number(formData.capacity),
                price: Number(formData.price),
                startDate: formData.startDate ? new Date(formData.startDate).toISOString() : undefined,
                endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
            };
            if (editingEvent) {
                await eventsAPI.update(editingEvent.id, payload);
                toast.success('Event updated');
            } else {
                await eventsAPI.create(payload);
                toast.success('Event created');
            }
            setIsDialogOpen(false);
            await fetchEvents();
            await fetchStats();
        } catch { toast.error(editingEvent ? 'Failed to update event' : 'Failed to create event'); }
        finally { setIsSaving(false); }
    };

    const handlePublish = async (id: string) => {
        try {
            await eventsAPI.publish(id);
            setEvents(prev => prev.map(e => e.id === id ? { ...e, status: 'published' as const } : e));
            toast.success('Event published');
        } catch { toast.error('Failed to publish event'); }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await eventsAPI.delete(deleteId);
            setEvents(prev => prev.filter(e => e.id !== deleteId));
            setIsDeleteOpen(false);
            setDeleteId(null);
            await fetchStats();
            toast.success('Event deleted');
        } catch { toast.error('Failed to delete event'); }
    };

    const handleBulkDelete = async () => {
        try {
            await eventsAPI.bulkDelete(Array.from(selectedIds));
            setSelectedIds(new Set());
            setBulkDeleteOpen(false);
            await fetchEvents();
            await fetchStats();
            toast.success('Events deleted');
        } catch { toast.error('Failed to delete events'); }
    };

    const handleBulkStatus = async (status: string) => {
        try {
            await eventsAPI.bulkUpdateStatus(Array.from(selectedIds), status);
            setSelectedIds(new Set());
            setBulkStatusOpen(null);
            await fetchEvents();
            toast.success(`Events set to ${status}`);
        } catch { toast.error('Failed to update events'); }
    };

    const handleSelectAll = () => {
        if (selectedIds.size === paginatedEvents.length) setSelectedIds(new Set());
        else setSelectedIds(new Set(paginatedEvents.map(e => e.id)));
    };

    const handleToggleSelect = (id: string) => {
        setSelectedIds(prev => {
            const n = new Set(prev);
            if (n.has(id)) n.delete(id); else n.add(id);
            return n;
        });
    };

    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortDirection(d => d === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
        setCurrentPage(1);
    };

    const SortIcon = ({ field }: { field: string }) => {
        if (sortField !== field) return <ArrowUpDown className="w-3 h-3 opacity-50" />;
        return sortDirection === "asc" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />;
    };

    const statusSegments = [
        { label: 'All Events', value: 'all' },
        { label: 'Published', value: 'published' },
        { label: 'Draft', value: 'draft' },
        { label: 'Cancelled', value: 'cancelled' },
        { label: 'Completed', value: 'completed' },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Events</h1>
                    <p className="text-sm text-muted-foreground">Create, manage, and publish events</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" className="rounded-xl h-9 w-9" onClick={() => { fetchEvents(); fetchStats(); }} disabled={isLoading}>
                        <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
                    </Button>
                    <Button asChild variant="outline" className="gap-2 rounded-xl h-9">
                        <Link href="/dashboard/events/new"><Plus className="w-4 h-4" /> New</Link>
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                    { label: "Total", value: stats?.total ?? 0, icon: Calendar, color: "text-primary" },
                    { label: "Published", value: stats?.published ?? 0, icon: CheckCircle2, color: "text-green-500" },
                    { label: "Draft", value: stats?.draft ?? 0, icon: FileText, color: "text-amber-500" },
                    { label: "Cancelled", value: stats?.cancelled ?? 0, icon: XCircle, color: "text-destructive" },
                    { label: "Completed", value: stats?.completed ?? 0, icon: CalendarCheck, color: "text-blue-500" },
                ].map((s) => (
                    <Card key={s.label} className="border-border/40">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-background/50 border border-border/30 flex items-center justify-center">
                                <s.icon className={cn("w-5 h-5", s.color)} />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">{s.label}</p>
                                <p className="text-xl font-bold">{s.value}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search events..." className="pl-9 h-9 rounded-lg"
                        value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} />
                </div>
                <div className="flex gap-2">
                    <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}>
                        <SelectTrigger className="rounded-lg h-9 w-[140px]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent className="rounded-lg">
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="published">Published</SelectItem>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setCurrentPage(1); }}>
                        <SelectTrigger className="rounded-lg h-9 w-[140px]">
                            <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent className="rounded-lg">
                            <SelectItem value="all">All Types</SelectItem>
                            {EVENT_TYPES.map(t => (
                                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <div className="flex border border-border/40 rounded-lg overflow-hidden">
                        <button onClick={() => setView("list")}
                            className={cn("p-2 transition-colors", view === "list" ? "bg-primary text-primary-foreground" : "hover:bg-muted")}>
                            <List className="w-4 h-4" />
                        </button>
                        <button onClick={() => setView("grid")}
                            className={cn("p-2 transition-colors", view === "grid" ? "bg-primary text-primary-foreground" : "hover:bg-muted")}>
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Bulk actions */}
            {selectedIds.size > 0 && (
                <div className="flex items-center gap-2 p-2 bg-primary/5 rounded-lg border border-primary/20">
                    <span className="text-sm font-medium px-2">{selectedIds.size} selected</span>
                    <Button variant="outline" size="sm" className="rounded-lg h-8 gap-1 text-xs"
                        onClick={() => setBulkStatusOpen("published")}>
                        <CheckCircle2 className="w-3.5 h-3.5" /> Publish
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-lg h-8 gap-1 text-xs"
                        onClick={() => setBulkStatusOpen("draft")}>
                        <FileText className="w-3.5 h-3.5" /> Draft
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-lg h-8 gap-1 text-xs text-destructive"
                        onClick={() => setBulkDeleteOpen(true)}>
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                    </Button>
                    <Button variant="ghost" size="sm" className="rounded-lg h-8 ml-auto"
                        onClick={() => setSelectedIds(new Set())}>Clear</Button>
                </div>
            )}

            {/* Error State */}
            {isError && (
                <Card className="border-destructive/20">
                    <CardContent className="flex flex-col items-center justify-center py-16 gap-3">
                        <AlertCircle className="w-6 h-6 text-destructive" />
                        <p className="text-sm font-medium text-destructive">Failed to load events</p>
                        <Button variant="outline" className="rounded-lg" onClick={fetchEvents}>Retry</Button>
                    </CardContent>
                </Card>
            )}

            {/* Content */}
            {!isError && (
                isLoading ? (
                    view === "list" ? (
                        <div className="space-y-2">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Skeleton key={i} className="h-14 w-full rounded-lg" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <Skeleton key={i} className="h-48 w-full rounded-xl" />
                            ))}
                        </div>
                    )
                ) : filteredEvents.length === 0 ? (
                    <Card className="border-border/40">
                        <CardContent className="flex flex-col items-center justify-center py-16 gap-3">
                            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
                                <Calendar className="w-7 h-7 text-muted-foreground/50" />
                            </div>
                            <p className="text-sm font-medium">No events found</p>
                            <p className="text-xs text-muted-foreground">
                                {events.length === 0 ? 'No events have been created yet.' : 'Try a different search or filter.'}
                            </p>
                            {events.length === 0 ? (
                                <Button asChild className="rounded-lg mt-2">
                                    <Link href="/dashboard/events/new"><Plus className="w-4 h-4 mr-2" /> New Event</Link>
                                </Button>
                            ) : (
                                <Button variant="outline" className="rounded-lg mt-2"
                                    onClick={() => { setSearchQuery(''); setStatusFilter('all'); setTypeFilter('all'); }}>
                                    Reset Filters
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ) : view === "list" ? (
                    <Card className="border-border/50 rounded-2xl overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/10 border-b border-border/50">
                                        <TableHead className="w-10 px-4">
                                            <button onClick={handleSelectAll}>
                                                {selectedIds.size === paginatedEvents.length && paginatedEvents.length > 0
                                                    ? <CheckSquare className="w-4 h-4 text-primary" />
                                                    : <Square className="w-4 h-4 text-muted-foreground" />}
                                            </button>
                                        </TableHead>
                                        <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground px-4 h-auto cursor-pointer select-none" onClick={() => handleSort("title")}>
                                            <div className="flex items-center gap-1">Title <SortIcon field="title" /></div>
                                        </TableHead>
                                        <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground h-auto cursor-pointer select-none" onClick={() => handleSort("type")}>
                                            <div className="flex items-center gap-1">Type <SortIcon field="type" /></div>
                                        </TableHead>
                                        <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground h-auto cursor-pointer select-none" onClick={() => handleSort("status")}>
                                            <div className="flex items-center gap-1">Status <SortIcon field="status" /></div>
                                        </TableHead>
                                        <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground h-auto cursor-pointer select-none" onClick={() => handleSort("startDate")}>
                                            <div className="flex items-center gap-1">Start Date <SortIcon field="startDate" /></div>
                                        </TableHead>
                                        <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground h-auto cursor-pointer select-none" onClick={() => handleSort("registeredCount")}>
                                            <div className="flex items-center gap-1">Registered <SortIcon field="registeredCount" /></div>
                                        </TableHead>
                                        <TableHead className="text-right text-xs font-medium uppercase tracking-wider text-muted-foreground px-4 h-auto">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedEvents.map((e) => (
                                        <TableRow key={e.id} className="group hover:bg-primary/[0.02] transition-all border-b border-border/20">
                                            <TableCell className="px-4 py-3">
                                                <button onClick={() => handleToggleSelect(e.id)}>
                                                    {selectedIds.has(e.id) ? <CheckSquare className="w-4 h-4 text-primary" /> : <Square className="w-4 h-4 text-muted-foreground" />}
                                                </button>
                                            </TableCell>
                                            <TableCell className="px-4 py-3">
                                                <Link href={`/dashboard/events/${e.id}`} className="flex flex-col">
                                                    <span className="text-sm font-medium">{e.title}</span>
                                                    <span className="text-xs text-muted-foreground">/{e.slug}</span>
                                                </Link>
                                            </TableCell>
                                            <TableCell>{getTypeBadge(e.type)}</TableCell>
                                            <TableCell>{getStatusBadge(e.status)}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="text-sm">{format(new Date(e.startDate), "MMM d, yyyy")}</span>
                                                    <span className="text-xs text-muted-foreground">{format(new Date(e.startDate), "h:mm a")}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className={cn("text-sm", e.registeredCount >= e.capacity ? "text-rose-500 font-medium" : "text-muted-foreground")}>
                                                    {e.registeredCount}/{e.capacity}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right px-4">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                                                            <MoreVertical className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="rounded-xl">
                                                        <DropdownMenuLabel className="text-xs">Actions</DropdownMenuLabel>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem onClick={() => openEditDialog(e)}>
                                                            <Pencil className="w-4 h-4 mr-2" /> Edit
                                                        </DropdownMenuItem>
                                                        {e.status === 'draft' && (
                                                            <DropdownMenuItem onClick={() => handlePublish(e.id)}>
                                                                <Send className="w-4 h-4 mr-2 text-emerald-500" /> Publish
                                                            </DropdownMenuItem>
                                                        )}
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem className="text-destructive" onClick={() => { setDeleteId(e.id); setIsDeleteOpen(true); }}>
                                                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                        {filteredEvents.length > EVENTS_PER_PAGE && (
                            <div className="flex items-center justify-between px-6 py-3 border-t border-border/50">
                                <p className="text-xs text-muted-foreground">
                                    Showing {((currentPage - 1) * EVENTS_PER_PAGE) + 1}&ndash;{Math.min(currentPage * EVENTS_PER_PAGE, filteredEvents.length)} of {filteredEvents.length}
                                </p>
                                <div className="flex items-center gap-1">
                                    <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                                        <ChevronLeft className="w-4 h-4" />
                                    </Button>
                                    <span className="text-xs text-muted-foreground px-2">{currentPage} / {totalPages}</span>
                                    <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </Card>
                ) : (
                    /* Grid View */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {paginatedEvents.map((e) => (
                            <div key={e.id} className="group relative bg-card border border-border/40 rounded-xl overflow-hidden hover:shadow-md hover:border-primary/20 transition-all">
                                <div className="absolute top-2 left-2 z-10">
                                    <button onClick={() => handleToggleSelect(e.id)}
                                        className="p-1.5 rounded-lg bg-background/80 backdrop-blur-sm hover:bg-background transition-colors">
                                        {selectedIds.has(e.id) ? <CheckSquare className="w-3.5 h-3.5 text-primary" /> : <Square className="w-3.5 h-3.5" />}
                                    </button>
                                </div>
                                <div className="absolute top-2 right-2 z-10">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className="p-1.5 rounded-lg bg-background/80 backdrop-blur-sm hover:bg-background transition-colors">
                                                <MoreVertical className="w-3.5 h-3.5" />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="rounded-xl">
                                            <DropdownMenuLabel className="text-xs">{e.title}</DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => openEditDialog(e)}><Pencil className="w-4 h-4 mr-2" /> Edit</DropdownMenuItem>
                                            {e.status === 'draft' && (
                                                <DropdownMenuItem onClick={() => handlePublish(e.id)}><Send className="w-4 h-4 mr-2 text-emerald-500" /> Publish</DropdownMenuItem>
                                            )}
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-destructive" onClick={() => { setDeleteId(e.id); setIsDeleteOpen(true); }}>
                                                <Trash2 className="w-4 h-4 mr-2" /> Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <Link href={`/dashboard/events/${e.id}`}>
                                    <div className="relative h-32 bg-gradient-to-br from-primary/20 to-primary/5">
                                        {e.image ? (
                                            <img src={e.image} alt={e.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Calendar className="w-10 h-10 text-muted-foreground/30" />
                                            </div>
                                        )}
                                        <div className="absolute top-9 left-2 flex gap-1">
                                            <Badge variant={e.status === "published" ? "default" : "secondary"} className="text-[10px] h-4 px-1.5 rounded">{e.status}</Badge>
                                        </div>
                                    </div>
                                    <div className="p-3 space-y-1.5">
                                        <h3 className="text-sm font-semibold leading-tight truncate">{e.title}</h3>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <Calendar className="w-3 h-3" />
                                            <span>{format(new Date(e.startDate), "MMM d, h:mm a")}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <Users className="w-3 h-3" />
                                            <span>{e.registeredCount}/{e.capacity}</span>
                                            {!e.isFree && <><DollarSign className="w-3 h-3 ml-1" /><span>${e.price}</span></>}
                                            {e.isFree && <Badge variant="outline" className="text-[10px] h-4 px-1 rounded ml-1 border-emerald-400 text-emerald-500">Free</Badge>}
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                            {getTypeBadge(e.type)}
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                )
            )}

            {/* Quick Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-2xl rounded-2xl border-border/40 max-h-[90vh] overflow-y-auto p-6">
                    <DialogHeader>
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                            {editingEvent ? <Pencil className="w-5 h-5 text-primary" /> : <Plus className="w-5 h-5 text-primary" />}
                        </div>
                        <DialogTitle className="text-xl font-semibold">{editingEvent ? 'Edit Event' : 'Create Event'}</DialogTitle>
                        <DialogDescription className="text-sm text-muted-foreground">
                            {editingEvent ? 'Modify the event details below.' : 'Fill in the details to create a new event.'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSave} className="space-y-4 pt-4">
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium">Title <span className="text-destructive">*</span></Label>
                                <Input className="rounded-lg h-9" value={formData.title}
                                    onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))} />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium">Slug</Label>
                                <Input className="rounded-lg h-9" value={formData.slug}
                                    onChange={(e) => setFormData(p => ({ ...p, slug: e.target.value }))} />
                            </div>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium">Type</Label>
                                <Select value={formData.type} onValueChange={(v) => setFormData(p => ({ ...p, type: v as Event['type'] }))}>
                                    <SelectTrigger className="rounded-lg h-9"><SelectValue /></SelectTrigger>
                                    <SelectContent className="rounded-lg">
                                        {EVENT_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium">Status</Label>
                                <Select value={formData.status} onValueChange={(v) => setFormData(p => ({ ...p, status: v as Event['status'] }))}>
                                    <SelectTrigger className="rounded-lg h-9"><SelectValue /></SelectTrigger>
                                    <SelectContent className="rounded-lg">
                                        <SelectItem value="draft">Draft</SelectItem>
                                        <SelectItem value="published">Published</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium">Description</Label>
                            <Textarea className="rounded-lg min-h-[60px] text-sm" value={formData.description}
                                onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))} />
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium">Start Date <span className="text-destructive">*</span></Label>
                                <Input type="datetime-local" className="rounded-lg h-9" value={formData.startDate}
                                    onChange={(e) => setFormData(p => ({ ...p, startDate: e.target.value }))} />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium">End Date <span className="text-destructive">*</span></Label>
                                <Input type="datetime-local" className="rounded-lg h-9" value={formData.endDate}
                                    onChange={(e) => setFormData(p => ({ ...p, endDate: e.target.value }))} />
                            </div>
                        </div>
                        <div className="grid sm:grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium">Capacity</Label>
                                <Input type="number" className="rounded-lg h-9" value={formData.capacity}
                                    onChange={(e) => setFormData(p => ({ ...p, capacity: Number(e.target.value) }))} />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium">Price</Label>
                                <Input type="number" className="rounded-lg h-9" value={formData.price} disabled={formData.isFree}
                                    onChange={(e) => setFormData(p => ({ ...p, price: Number(e.target.value) }))} />
                            </div>
                            <div className="flex items-end pb-1">
                                <div className="flex items-center gap-3">
                                    <Switch id="isFree" checked={formData.isFree}
                                        onCheckedChange={(v) => setFormData(p => ({ ...p, isFree: v, price: v ? 0 : p.price }))} />
                                    <Label htmlFor="isFree" className="text-sm cursor-pointer">Free</Label>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium">Tags</Label>
                            <Input className="rounded-lg h-9" value={formData.tags} placeholder="tech, react, workshop"
                                onChange={(e) => setFormData(p => ({ ...p, tags: e.target.value }))} />
                        </div>
                        <DialogFooter className="flex gap-2 pt-2">
                            <Button type="button" variant="ghost" className="rounded-lg h-9"
                                onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button type="submit" className="rounded-lg h-9 px-6" disabled={isSaving}>
                                {isSaving ? 'Saving...' : editingEvent ? 'Update' : 'Create'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent className="rounded-xl max-w-[400px] p-6">
                    <DialogHeader className="flex flex-col items-center text-center gap-2">
                        <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                            <Trash2 className="w-6 h-6 text-destructive" />
                        </div>
                        <DialogTitle>Delete event?</DialogTitle>
                        <DialogDescription className="text-sm text-destructive">This action cannot be undone</DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex-col gap-2">
                        <Button className="w-full bg-destructive rounded-lg" onClick={handleDelete}>Delete</Button>
                        <Button variant="ghost" className="w-full rounded-lg" onClick={() => { setIsDeleteOpen(false); setDeleteId(null); }}>Cancel</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Bulk Delete */}
            <Dialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
                <DialogContent className="rounded-xl max-w-[400px] p-6">
                    <DialogHeader className="flex flex-col items-center text-center gap-2">
                        <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                            <Trash2 className="w-6 h-6 text-destructive" />
                        </div>
                        <DialogTitle>Delete {selectedIds.size} events?</DialogTitle>
                        <DialogDescription className="text-destructive">This action cannot be undone</DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex-col gap-2">
                        <Button className="w-full bg-destructive rounded-lg" onClick={handleBulkDelete}>Delete All</Button>
                        <Button variant="ghost" className="w-full rounded-lg" onClick={() => setBulkDeleteOpen(false)}>Cancel</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Bulk Status */}
            <Dialog open={!!bulkStatusOpen} onOpenChange={() => setBulkStatusOpen(null)}>
                <DialogContent className="rounded-xl max-w-[400px] p-6">
                    <DialogHeader className="flex flex-col items-center text-center gap-2">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                            {bulkStatusOpen === "published" ? <CheckCircle2 className="w-6 h-6 text-primary" /> : <FileText className="w-6 h-6 text-primary" />}
                        </div>
                        <DialogTitle>{bulkStatusOpen === "published" ? "Publish" : "Draft"} {selectedIds.size} events?</DialogTitle>
                    </DialogHeader>
                    <DialogFooter className="flex-col gap-2">
                        <Button className="w-full rounded-lg" onClick={() => bulkStatusOpen && handleBulkStatus(bulkStatusOpen)}>
                            {bulkStatusOpen === "published" ? "Publish All" : "Draft All"}
                        </Button>
                        <Button variant="ghost" className="w-full rounded-lg" onClick={() => setBulkStatusOpen(null)}>Cancel</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default withRoleProtection(AdminEventsPage, ["Admin", "SuperAdmin"]);

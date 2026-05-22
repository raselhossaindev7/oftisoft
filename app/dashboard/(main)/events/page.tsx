"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
    Search,
    Plus,
    RefreshCw,
    Calendar,
    CalendarCheck,
    FileText,
    XCircle,
    CheckCircle2,
    Clock,
    Eye,
    MoreVertical,
    Pencil,
    Trash2,
    Send,
    SearchX,
    Filter,
    Tag,
    Image,
    Globe,
    MapPin,
    Building,
    DollarSign,
    Users,
    Hash,
    AlignLeft,
    FileType,
    Ban,
    ListTodo,
    Sparkles,
    ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { format } from "date-fns";
import { withRoleProtection } from "@/components/auth/role-guard";

interface Event {
    id: string;
    title: string;
    slug: string;
    description: string;
    shortDescription?: string;
    type: 'webinar' | 'workshop' | 'conference' | 'meetup' | 'hackathon' | 'training';
    status: 'draft' | 'published' | 'cancelled' | 'completed';
    startDate: string;
    endDate: string;
    timezone?: string;
    location?: string;
    venue?: string;
    image?: string;
    capacity: number;
    registeredCount: number;
    price: number;
    isFree: boolean;
    tags?: string[];
    createdAt: string;
    updatedAt: string;
}

interface EventFormData {
    title: string;
    slug: string;
    description: string;
    shortDescription: string;
    type: Event['type'];
    status: Event['status'];
    startDate: string;
    endDate: string;
    timezone: string;
    location: string;
    venue: string;
    image: string;
    capacity: number;
    price: number;
    isFree: boolean;
    tags: string;
}

type StatusFilter = 'all' | Event['status'];
type TypeFilter = 'all' | Event['type'];

const EVENT_TYPES: { label: string; value: Event['type'] }[] = [
    { label: 'Webinar', value: 'webinar' },
    { label: 'Workshop', value: 'workshop' },
    { label: 'Conference', value: 'conference' },
    { label: 'Meetup', value: 'meetup' },
    { label: 'Hackathon', value: 'hackathon' },
    { label: 'Training', value: 'training' },
];

const EVENT_STATUSES: { label: string; value: Event['status'] }[] = [
    { label: 'Draft', value: 'draft' },
    { label: 'Published', value: 'published' },
    { label: 'Cancelled', value: 'cancelled' },
    { label: 'Completed', value: 'completed' },
];

const initialFormData: EventFormData = {
    title: '',
    slug: '',
    description: '',
    shortDescription: '',
    type: 'webinar',
    status: 'draft',
    startDate: '',
    endDate: '',
    timezone: '',
    location: '',
    venue: '',
    image: '',
    capacity: 0,
    price: 0,
    isFree: false,
    tags: '',
};

function getTypeBadge(type: Event['type']) {
    const map: Record<Event['type'], { className: string; label: string }> = {
        webinar: { className: 'bg-sky-500/10 text-sky-500 border-sky-500/20', label: 'Webinar' },
        workshop: { className: 'bg-violet-500/10 text-violet-500 border-violet-500/20', label: 'Workshop' },
        conference: { className: 'bg-amber-500/10 text-amber-500 border-amber-500/20', label: 'Conference' },
        meetup: { className: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', label: 'Meetup' },
        hackathon: { className: 'bg-rose-500/10 text-rose-500 border-rose-500/20', label: 'Hackathon' },
        training: { className: 'bg-blue-500/10 text-blue-500 border-blue-500/20', label: 'Training' },
    };
    const m = map[type];
    return <Badge className={`${m.className} gap-1.5 rounded-lg text-xs font-semibold `}>{m.label}</Badge>;
}

function getStatusBadge(status: Event['status']) {
    switch (status) {
        case 'published':
            return <Badge className="bg-green-500/10 text-green-500 border-green-500/20 gap-1.5 rounded-lg text-xs font-semibold "><CheckCircle2 className="w-3 h-3" /> Published</Badge>;
        case 'draft':
            return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 gap-1.5 rounded-lg text-xs font-semibold "><FileText className="w-3 h-3" /> Draft</Badge>;
        case 'cancelled':
            return <Badge className="bg-destructive/10 text-destructive border-destructive/20 gap-1.5 rounded-lg text-xs font-semibold "><XCircle className="w-3 h-3" /> Cancelled</Badge>;
        case 'completed':
            return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 gap-1.5 rounded-lg text-xs font-semibold "><CalendarCheck className="w-3 h-3" /> Completed</Badge>;
    }
}

function formatDate(dateStr: string) {
    try {
        return format(new Date(dateStr), "MMM d, yyyy");
    } catch {
        return '—';
    }
}

function formatDateTime(dateStr: string) {
    try {
        return format(new Date(dateStr), "MMM d, yyyy h:mm a");
    } catch {
        return '—';
    }
}

function AdminEventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [formData, setFormData] = useState<EventFormData>(initialFormData);
    const [isSaving, setIsSaving] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = async (file: File) => {
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            toast.error("Please select an image file");
            return;
        }
        setIsUploading(true);
        setUploadProgress(0);
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);
        const interval = setInterval(() => {
            setUploadProgress(prev => Math.min(prev + 20, 90));
        }, 200);
        try {
            const formData = new FormData();
            formData.append("file", file);
            const response = await fetch("/api/upload", { method: "POST", body: formData });
            const result = await response.json();
            clearInterval(interval);
            setUploadProgress(100);
            const imageUrl = result?.url || result?.image || objectUrl;
            setFormData(prev => ({ ...prev, image: imageUrl }));
            toast.success("Image uploaded");
            setTimeout(() => { setUploadProgress(0); setIsUploading(false); }, 500);
        } catch {
            clearInterval(interval);
            setUploadProgress(0);
            setIsUploading(false);
            toast.error("Upload failed");
        }
    };

    const fetchEvents = useCallback(async () => {
        try {
            const response = await api.get<Event[]>('/events');
            setEvents(response.data);
        } catch {
            toast.error('Failed to load events');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        await fetchEvents();
        setIsRefreshing(false);
        toast.success('Events synced');
    }, [fetchEvents]);

    const filteredEvents = events.filter((e) => {
        if (statusFilter !== 'all' && e.status !== statusFilter) return false;
        if (typeFilter !== 'all' && e.type !== typeFilter) return false;
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            (e.title || '').toLowerCase().includes(q) ||
            (e.slug || '').toLowerCase().includes(q)
        );
    });

    const openAddDialog = useCallback(() => {
        setEditingEvent(null);
        setFormData(initialFormData);
        setPreviewUrl(null);
        setUploadProgress(0);
        setIsUploading(false);
        setIsDialogOpen(true);
    }, []);

    const openEditDialog = useCallback((event: Event) => {
        setEditingEvent(event);
        setFormData({
            title: event.title,
            slug: event.slug,
            description: event.description,
            shortDescription: event.shortDescription || '',
            type: event.type,
            status: event.status,
            startDate: event.startDate ? event.startDate.slice(0, 16) : '',
            endDate: event.endDate ? event.endDate.slice(0, 16) : '',
            timezone: event.timezone || '',
            location: event.location || '',
            venue: event.venue || '',
            image: event.image || '',
            capacity: event.capacity,
            price: event.price,
            isFree: event.isFree,
            tags: (event.tags || []).join(', '),
        });
        setPreviewUrl(null);
        setUploadProgress(0);
        setIsUploading(false);
        setIsDialogOpen(true);
    }, []);

    const handleSave = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const payload = {
                ...formData,
                tags: formData.tags ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
                capacity: Number(formData.capacity),
                price: Number(formData.price),
                startDate: formData.startDate ? new Date(formData.startDate).toISOString() : undefined,
                endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
            };

            if (editingEvent) {
                await api.patch(`/events/${editingEvent.id}`, payload);
                toast.success('Event updated');
            } else {
                await api.post('/events', payload);
                toast.success('Event created');
            }

            setIsDialogOpen(false);
            await fetchEvents();
        } catch {
            toast.error(editingEvent ? 'Failed to update event' : 'Failed to create event');
        } finally {
            setIsSaving(false);
        }
    }, [formData, editingEvent, fetchEvents]);

    const handlePublish = useCallback(async (id: string) => {
        try {
            await api.put(`/events/${id}/publish`);
            setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, status: 'published' as const } : e)));
            toast.success('Event published');
        } catch {
            toast.error('Failed to publish event');
        }
    }, []);

    const handleDelete = useCallback(async () => {
        if (!deleteId) return;
        try {
            await api.delete(`/events/${deleteId}`);
            setEvents((prev) => prev.filter((e) => e.id !== deleteId));
            setIsDeleteOpen(false);
            setDeleteId(null);
            toast.success('Event deleted');
        } catch {
            toast.error('Failed to delete event');
        }
    }, [deleteId]);

    const stats = {
        total: events.length,
        published: events.filter((e) => e.status === 'published').length,
        draft: events.filter((e) => e.status === 'draft').length,
        completed: events.filter((e) => e.status === 'completed').length,
    };

    const statusSegments: { label: string; value: StatusFilter }[] = [
        { label: 'All Events', value: 'all' },
        { label: 'Published', value: 'published' },
        { label: 'Draft', value: 'draft' },
        { label: 'Cancelled', value: 'cancelled' },
        { label: 'Completed', value: 'completed' },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-semibold">Events Management</h1>
                    <p className="text-muted-foreground font-medium">Create, manage, and publish events across all platforms.</p>
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
                    <Button className="gap-2 rounded-xl h-11 shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 px-8 font-semibold"
                        onClick={openAddDialog}
                    >
                        <Plus className="w-4 h-4" />
                        Add Event
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Total Events", value: stats.total, color: "", bg: "bg-primary/10", text: "text-primary", hover: "hover:border-primary/30", icon: Calendar, sub: "All registered events" },
                    { label: "Published", value: stats.published, color: "text-green-500", bg: "bg-green-500/10", text: "text-green-500", hover: "hover:border-green-500/30", icon: CheckCircle2, sub: "Live events" },
                    { label: "Draft", value: stats.draft, color: "text-amber-500", bg: "bg-amber-500/10", text: "text-amber-500", hover: "hover:border-amber-500/30", icon: FileText, sub: "Awaiting publish" },
                    { label: "Completed", value: stats.completed, color: "text-blue-500", bg: "bg-blue-500/10", text: "text-blue-500", hover: "hover:border-blue-500/30", icon: CalendarCheck, sub: "Past events" },
                ].map((s, i) => (
                    <Card key={i} className={cn("border-border/50 bg-card/40 backdrop-blur-md rounded-[2.5rem] overflow-hidden group transition-all h-full flex flex-col", s.hover)}>
                        <CardHeader className="flex flex-row items-center justify-between pb-1 p-5">
                            <CardTitle className="text-sm font-semibold  text-muted-foreground">{s.label}</CardTitle>
                            <div className={cn("p-1.5 rounded-xl group-hover:scale-110 transition-transform", s.bg, s.text)}>
                                <s.icon className="h-4 w-4" />
                            </div>
                        </CardHeader>
                        <CardContent className="p-5 pt-0 flex-1">
                            <div className={cn("text-3xl font-semibold", s.color)}>{s.value}</div>
                            <p className={cn("text-xs  mt-2 font-semibold opacity-60", s.color || "text-muted-foreground")}>{s.sub}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main Content */}
            <div className="grid lg:grid-cols-4 gap-8">
                {/* Sidebar Filters */}
                <div className="space-y-6">
                    <Card className="border-border/50 h-fit rounded-[2.5rem] overflow-hidden shadow-sm bg-card/40 backdrop-blur-md">
                        <CardHeader className="p-8 pb-4">
                            <CardTitle className="text-sm font-semibold  text-muted-foreground">Status Filter</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <div className="flex flex-col gap-1">
                                {statusSegments.map((seg) => {
                                    const count = seg.value === 'all'
                                        ? events.length
                                        : events.filter((e) => e.status === seg.value).length;
                                    return (
                                        <button key={seg.value}
                                            onClick={() => setStatusFilter(seg.value)}
                                            className={cn(
                                                "flex items-center justify-between px-6 py-4 rounded-2xl text-sm transition-all group",
                                                statusFilter === seg.value
                                                    ? "bg-primary text-white font-semibold shadow-lg shadow-primary/20"
                                                    : "text-muted-foreground font-semibold hover:bg-primary/5 hover:text-primary"
                                            )}
                                        >
                                            <span className=" ">{seg.label}</span>
                                            <span className={cn(
                                                "px-2 py-0.5 rounded-lg text-xs font-semibold",
                                                statusFilter === seg.value
                                                    ? "bg-white/20 text-white"
                                                    : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                                            )}>{count}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border/50 h-fit rounded-[2.5rem] overflow-hidden shadow-sm bg-card/40 backdrop-blur-md">
                        <CardHeader className="p-8 pb-4">
                            <CardTitle className="text-sm font-semibold  text-muted-foreground">Event Type</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <div className="flex flex-col gap-1">
                                <button onClick={() => setTypeFilter('all')}
                                    className={cn(
                                        "flex items-center justify-between px-6 py-4 rounded-2xl text-sm transition-all group",
                                        typeFilter === 'all'
                                            ? "bg-primary text-white font-semibold shadow-lg shadow-primary/20"
                                            : "text-muted-foreground font-semibold hover:bg-primary/5 hover:text-primary"
                                    )}
                                >
                                    <span className=" ">All Types</span>
                                </button>
                                {EVENT_TYPES.map((t) => (
                                    <button key={t.value}
                                        onClick={() => setTypeFilter(t.value)}
                                        className={cn(
                                            "flex items-center justify-between px-6 py-4 rounded-2xl text-sm transition-all group",
                                            typeFilter === t.value
                                                ? "bg-primary text-white font-semibold shadow-lg shadow-primary/20"
                                                : "text-muted-foreground font-semibold hover:bg-primary/5 hover:text-primary"
                                        )}
                                    >
                                        <span className=" ">{t.label}</span>
                                    </button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border/50 bg-primary/5 rounded-[2.5rem] border-dashed p-4">
                        <CardHeader className="p-6">
                            <CardTitle className="text-sm font-semibold  flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-primary" /> Quick Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-6 pb-6 pt-0 space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm font-semibold ">
                                    <span className="text-muted-foreground opacity-60">Active</span>
                                    <span className="text-primary">{stats.published}</span>
                                </div>
                                <div className="flex justify-between text-sm font-semibold ">
                                    <span className="text-muted-foreground opacity-60">Unpublished</span>
                                    <span className="text-amber-500">{stats.draft}</span>
                                </div>
                                <div className="flex justify-between text-sm font-semibold ">
                                    <span className="text-muted-foreground opacity-60">Finished</span>
                                    <span className="text-blue-500">{stats.completed}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Events Table */}
                <div className="lg:col-span-3 space-y-4">
                    <Card className="border-border/50 rounded-2xl overflow-hidden shadow-sm">
                        <CardHeader className="p-6 border-b border-border/50 bg-muted/5">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="relative flex-1 max-w-sm">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input placeholder="Search by title..."
                                        className="pl-10 h-11 rounded-xl bg-background font-medium"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    {(statusFilter !== 'all' || typeFilter !== 'all' || searchQuery) && (
                                        <Button variant="ghost"
                                            size="sm"
                                            className="gap-2 rounded-xl h-10 font-bold text-sm  text-muted-foreground"
                                            onClick={() => { setStatusFilter('all'); setTypeFilter('all'); setSearchQuery(''); }}
                                        >
                                            <XCircle className="w-3 h-3" /> Clear
                                        </Button>
                                    )}
                                    <Button variant="outline"
                                        size="sm"
                                        className="gap-2 rounded-xl h-10 font-bold px-4"
                                        onClick={() => toast.info('Use sidebar filters to narrow results.')}
                                    >
                                        <Filter className="h-4 w-4" />
                                        Filters
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {isLoading && events.length === 0 ? (
                                <div className="py-32 flex flex-col items-center justify-center gap-6">
                                    <div className="relative">
                                        <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                                        <RefreshCw className="h-10 w-10 text-primary animate-spin relative z-10" />
                                    </div>
                                    <p className="text-sm text-primary font-semibold  animate-pulse">Loading events...</p>
                                </div>
                            ) : filteredEvents.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-32 bg-muted/5">
                                    <div className="w-20 h-20 rounded-[2rem] bg-muted/20 flex items-center justify-center mb-6">
                                        <SearchX className="h-10 w-10 text-muted-foreground/30" />
                                    </div>
                                    <h3 className="text-2xl font-semibold">No Events Found</h3>
                                    <p className="text-muted-foreground text-sm font-semibold  max-w-xs text-center mt-3 opacity-60">
                                        {events.length === 0 ? 'No events have been created yet.' : 'No events match your current filters.'}
                                    </p>
                                    <Button variant="outline"
                                        className="mt-8 rounded-[1.2rem] font-semibold text-sm border-primary/20 text-primary px-10 h-11 hover:bg-primary hover:text-white transition-all"
                                        onClick={() => { setSearchQuery(''); setStatusFilter('all'); setTypeFilter('all'); }}
                                    >
                                        RESET FILTERS
                                    </Button>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/10 hover:bg-transparent border-b border-border/50">
                                            <TableHead className="w-[250px] font-semibold  text-sm px-6 h-auto">Title</TableHead>
                                            <TableHead className="font-semibold  text-sm h-auto">Type</TableHead>
                                            <TableHead className="font-semibold  text-sm h-auto">Status</TableHead>
                                            <TableHead className="font-semibold  text-sm h-auto">Start Date</TableHead>
                                            <TableHead className="font-semibold  text-sm h-auto">Capacity</TableHead>
                                            <TableHead className="font-semibold  text-sm h-auto">Registered</TableHead>
                                            <TableHead className="text-right font-semibold  text-sm px-6 h-auto">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredEvents.map((e) => (
                                            <TableRow key={e.id} className="group hover:bg-primary/[0.02] transition-all border-b border-border/20">
                                                <TableCell className="px-6 py-5">
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-sm">{e.title}</span>
                                                        <span className="text-sm text-muted-foreground font-semibold  opacity-60">
                                                            /{e.slug}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{getTypeBadge(e.type)}</TableCell>
                                                <TableCell>{getStatusBadge(e.status)}</TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col gap-1">
                                                        <div className="text-sm font-semibold">{formatDate(e.startDate)}</div>
                                                        <div className="text-xs font-semibold  text-muted-foreground">
                                                            {e.startDate ? formatDateTime(e.startDate).split(' ').slice(2).join(' ') : '—'}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="font-semibold text-sm">{e.capacity}</span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className={cn(
                                                        "font-semibold text-sm",
                                                        e.registeredCount >= e.capacity ? "text-rose-500" : "text-muted-foreground"
                                                    )}>
                                                        {e.registeredCount}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right px-6">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-2xl hover:bg-muted/50">
                                                                    <MoreVertical className="h-5 w-5" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="w-64 rounded-[1.5rem] p-2 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.2)] border-border/50 backdrop-blur-xl">
                                                                <DropdownMenuLabel className="text-sm font-semibold  text-muted-foreground px-3 py-2">Event Actions</DropdownMenuLabel>
                                                                <DropdownMenuItem className="gap-3 cursor-pointer rounded-xl font-semibold py-3 text-xs" onClick={() => openEditDialog(e)}>
                                                                    <Pencil className="w-4 h-4 text-primary" /> EDIT EVENT
                                                                </DropdownMenuItem>
                                                                {e.status === 'draft' && (
                                                                    <DropdownMenuItem className="gap-3 cursor-pointer rounded-xl font-semibold py-3 text-xs" onClick={() => handlePublish(e.id)}>
                                                                        <Send className="w-4 h-4 text-emerald-500" /> PUBLISH NOW
                                                                    </DropdownMenuItem>
                                                                )}
                                                                <DropdownMenuSeparator className="my-2 opacity-50" />
                                                                <DropdownMenuItem className="gap-3 text-destructive focus:bg-destructive/10 cursor-pointer rounded-xl font-semibold py-3 text-xs"
                                                                    onClick={() => { setDeleteId(e.id); setIsDeleteOpen(true); }}
                                                                >
                                                                    <Trash2 className="w-4 h-4" /> DELETE EVENT
                                                                </DropdownMenuItem>
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

            {/* Add/Edit Event Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-3xl rounded-[2.5rem] border-border/40 bg-card/60 backdrop-blur-xl shadow-2xl p-0 flex flex-col max-h-[85vh]">
                    <DialogHeader className="p-8 pb-4 shrink-0">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                            <Calendar className="w-7 h-7 text-primary" />
                        </div>
                        <DialogTitle className="text-3xl font-semibold ">
                            {editingEvent ? 'Edit Event' : 'Create Event'}
                        </DialogTitle>
                        <DialogDescription className="text-sm font-semibold  opacity-60 mt-1">
                            {editingEvent ? 'Modify the event details below.' : 'Fill in the details to create a new event.'}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSave} className="flex-1 overflow-y-auto px-8 space-y-5 pb-4" data-lenis-prevent>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold  ml-1 opacity-70">Title</Label>
                                <Input placeholder="Event title" className="rounded-[1.2rem] h-12 bg-background/50 border-border/50 font-semibold"
                                    value={formData.title}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold  ml-1 opacity-70">Slug</Label>
                                <Input placeholder="event-slug" className="rounded-[1.2rem] h-12 bg-background/50 border-border/50 font-semibold"
                                    value={formData.slug}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                                />
                            </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold  ml-1 opacity-70">Type</Label>
                                <Select value={formData.type} onValueChange={(v) => setFormData((prev) => ({ ...prev, type: v as Event['type'] }))}>
                                    <SelectTrigger className="rounded-[1.2rem] h-12 bg-background/50 border-border/50 font-semibold text-sm">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl p-1">
                                        {EVENT_TYPES.map((t) => (
                                            <SelectItem key={t.value} value={t.value} className="rounded-xl font-semibold text-sm py-3">{t.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold  ml-1 opacity-70">Status</Label>
                                <Select value={formData.status} onValueChange={(v) => setFormData((prev) => ({ ...prev, status: v as Event['status'] }))}>
                                    <SelectTrigger className="rounded-[1.2rem] h-12 bg-background/50 border-border/50 font-semibold text-sm">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl p-1">
                                        {EVENT_STATUSES.map((s) => (
                                            <SelectItem key={s.value} value={s.value} className="rounded-xl font-semibold text-sm py-3">{s.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-semibold  ml-1 opacity-70">Description</Label>
                            <Textarea placeholder="Full event description"
                                className="rounded-[1.2rem] bg-background/50 border-border/50 font-semibold min-h-[80px]"
                                value={formData.description}
                                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-semibold  ml-1 opacity-70">Short Description</Label>
                            <Textarea placeholder="Brief event summary"
                                className="rounded-[1.2rem] bg-background/50 border-border/50 font-semibold min-h-[60px]"
                                value={formData.shortDescription}
                                onChange={(e) => setFormData((prev) => ({ ...prev, shortDescription: e.target.value }))}
                            />
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold  ml-1 opacity-70">Start Date</Label>
                                <Input type="datetime-local" className="rounded-[1.2rem] h-12 bg-background/50 border-border/50 font-semibold"
                                    value={formData.startDate}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold  ml-1 opacity-70">End Date</Label>
                                <Input type="datetime-local" className="rounded-[1.2rem] h-12 bg-background/50 border-border/50 font-semibold"
                                    value={formData.endDate}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, endDate: e.target.value }))}
                                />
                            </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold  ml-1 opacity-70">Timezone</Label>
                                <Input placeholder="America/New_York" className="rounded-[1.2rem] h-12 bg-background/50 border-border/50 font-semibold"
                                    value={formData.timezone}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, timezone: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold  ml-1 opacity-70">Image</Label>
                                <div onClick={() => fileInputRef.current?.click()}
                                    className="relative rounded-[1.2rem] h-36 bg-background/50 border-2 border-dashed border-border/50 hover:border-primary/40 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer overflow-hidden"
                                >
                                    {previewUrl || formData.image ? (
                                        <img src={previewUrl || formData.image} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                                    ) : (
                                        <>
                                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <span className="text-xs font-semibold  text-muted-foreground">Click to upload image</span>
                                        </>
                                    )}
                                    {isUploading && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <svg className="w-6 h-6 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                </svg>
                                                <span className="text-xs font-semibold text-white">{uploadProgress}%</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {isUploading && (
                                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                                        <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                                    </div>
                                )}
                                <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                                    onChange={(e) => { const file = e.target.files?.[0]; if (file) handleImageUpload(file); }}
                                />
                            </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold  ml-1 opacity-70">Location</Label>
                                <Input placeholder="New York, NY" className="rounded-[1.2rem] h-12 bg-background/50 border-border/50 font-semibold"
                                    value={formData.location}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold  ml-1 opacity-70">Venue</Label>
                                <Input placeholder="Convention Center" className="rounded-[1.2rem] h-12 bg-background/50 border-border/50 font-semibold"
                                    value={formData.venue}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, venue: e.target.value }))}
                                />
                            </div>
                        </div>

                        <div className="grid sm:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold  ml-1 opacity-70">Capacity</Label>
                                <Input type="number" placeholder="100" className="rounded-[1.2rem] h-12 bg-background/50 border-border/50 font-semibold"
                                    value={formData.capacity}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, capacity: Number(e.target.value) }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold  ml-1 opacity-70">Price</Label>
                                <Input type="number" placeholder="0.00" className="rounded-[1.2rem] h-12 bg-background/50 border-border/50 font-semibold"
                                    value={formData.price} disabled={formData.isFree}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, price: Number(e.target.value) }))}
                                />
                            </div>
                            <div className="space-y-2 flex flex-col justify-end pb-2">
                                <div className="flex items-center gap-3 ml-1 h-12">
                                    <Switch id="isFree" checked={formData.isFree} onCheckedChange={(v) => setFormData((prev) => ({ ...prev, isFree: v, price: v ? 0 : prev.price }))} />
                                    <Label htmlFor="isFree" className="text-sm font-semibold  cursor-pointer">Free Event</Label>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-semibold  ml-1 opacity-70">Tags</Label>
                            <Input placeholder="tech, react, workshop" className="rounded-[1.2rem] h-12 bg-background/50 border-border/50 font-semibold"
                                value={formData.tags}
                                onChange={(e) => setFormData((prev) => ({ ...prev, tags: e.target.value }))}
                            />
                        </div>

                        <DialogFooter className="pt-4 flex gap-3">
                            <Button type="button" variant="ghost" className="rounded-[1.2rem] h-12 px-6 font-semibold text-sm  opacity-60 hover:opacity-100"
                                onClick={() => setIsDialogOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" className="rounded-[1.2rem] h-12 px-10 font-semibold text-sm  shadow-xl shadow-primary/20 bg-primary hover:scale-[1.02] transition-transform"
                                disabled={isSaving}
                            >
                                {isSaving ? 'Saving...' : editingEvent ? 'Update Event' : 'Create Event'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent className="rounded-[2rem] border-border/50 max-w-[400px]">
                    <DialogHeader className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 rounded-[1.5rem] bg-destructive/10 flex items-center justify-center mb-4">
                            <Trash2 className="w-8 h-8 text-destructive" />
                        </div>
                        <DialogTitle className="text-2xl font-semibold">Delete Event?</DialogTitle>
                        <DialogDescription className="font-bold  text-sm text-destructive">
                            This action cannot be undone
                        </DialogDescription>
                    </DialogHeader>
                    <div className="p-4 text-center">
                        <p className="text-sm font-medium text-muted-foreground">
                            This will permanently remove the event and all associated data. Proceed with caution.
                        </p>
                    </div>
                    <DialogFooter className="flex-col sm:flex-col gap-2 pt-4">
                        <Button className="w-full bg-destructive hover:bg-destructive/90 rounded-xl h-auto font-semibold shadow-lg shadow-destructive/20"
                            onClick={handleDelete}
                        >
                            CONFIRM DELETE
                        </Button>
                        <Button variant="ghost" className="w-full rounded-xl h-11 font-bold" onClick={() => { setIsDeleteOpen(false); setDeleteId(null); }}>
                            CANCEL
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default withRoleProtection(AdminEventsPage, ["Admin", "SuperAdmin"]);

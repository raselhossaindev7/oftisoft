"use client";

import { useState, useCallback, useRef, useMemo } from "react";
import {
    Star, MessageSquare, Download, Plus, Search, SearchX, RefreshCw,
    MoreVertical, Trash2, Edit, Users, Activity, Sparkles, Quote,
    Eye, EyeOff, GripVertical, AlertCircle, ChevronLeft, ChevronRight,
    ArrowUpDown, ArrowUp, ArrowDown, LayoutGrid, List, Filter,
    CheckSquare, Square, CheckCheck, XCircle, CalendarIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
    DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { testimonialsAPI, type Testimonial } from "@/lib/api";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { withRoleProtection } from "@/components/auth/role-guard";
import { format } from "date-fns";
import Link from "next/link";
import {
    DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors,
    type DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const RATING_OPTIONS = [1, 2, 3, 4, 5];

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "lg" }) {
    const cls = size === "lg" ? "w-5 h-5" : "w-3.5 h-3.5";
    return (
        <div className="flex items-center gap-0.5">
            {RATING_OPTIONS.map((star) => (
                <Star key={star}
                    className={cn(cls, star <= rating
                        ? "fill-amber-500 text-amber-500"
                        : "fill-none text-muted-foreground/30"
                    )}
                />
            ))}
        </div>
    );
}

const defaultForm: Omit<Testimonial, "id" | "createdAt" | "updatedAt"> = {
    name: "", role: "", company: "", quote: "", avatar: "",
    rating: 5, gradient: "", isActive: true, order: 0,
};

const TESTIMONIALS_PER_PAGE = 10;

function SortableRow({ t, openEdit, setDeleteId, handleToggleActive, isSelected, onSelect }: {
    t: Testimonial; openEdit: (t: Testimonial) => void; setDeleteId: (id: string) => void;
    handleToggleActive: (t: Testimonial) => void; isSelected: boolean; onSelect: (id: string) => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: t.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
    };

    return (
        <TableRow ref={setNodeRef} style={style}
            className={cn("group hover:bg-primary/[0.02] transition-all border-b border-border/20", isDragging && "z-50")}
        >
            <TableCell className="px-2 py-5 w-10">
                <div className="flex items-center gap-1">
                    <button {...attributes} {...listeners}
                        className="cursor-grab active:cursor-grabbing text-muted-foreground/30 hover:text-muted-foreground transition-colors"
                    >
                        <GripVertical className="w-4 h-4" />
                    </button>
                    <button onClick={() => onSelect(t.id)}
                        className="text-muted-foreground hover:text-primary transition-colors"
                    >
                        {isSelected ? <CheckSquare className="w-4 h-4 text-primary" /> : <Square className="w-4 h-4" />}
                    </button>
                </div>
            </TableCell>
            <TableCell className="px-6 py-5">
                <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 border-2 border-background shadow-md rounded-lg">
                        <AvatarImage src={t.avatar} />
                        <AvatarFallback className="bg-primary/10 text-primary font-medium text-xs rounded-lg">
                            {(t.name || "T").split(" ").filter(Boolean).map((n) => n[0]).join("").toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="text-sm font-medium">{t.name}</span>
                        {t.role && <span className="text-xs text-muted-foreground">{t.role}</span>}
                    </div>
                </div>
            </TableCell>
            <TableCell><span className="text-sm">{t.company || "\u2014"}</span></TableCell>
            <TableCell><StarRating rating={t.rating} /></TableCell>
            <TableCell>
                <button onClick={() => handleToggleActive(t)}
                    className="flex items-center gap-2 hover:bg-muted/50 rounded-lg px-2 py-1 transition-colors"
                >
                    <div className={cn("w-2 h-2 rounded-full",
                        t.isActive ? "bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.6)]" : "bg-muted"
                    )} />
                    <span className="text-xs font-medium">{t.isActive ? "Active" : "Inactive"}</span>
                    {t.isActive ? <Eye className="w-3 h-3 opacity-0 group-hover:opacity-50" /> : <EyeOff className="w-3 h-3 opacity-0 group-hover:opacity-50" />}
                </button>
            </TableCell>
            <TableCell>
                <div className="flex flex-col">
                    <div className="text-sm">{new Date(t.createdAt).toLocaleDateString()}</div>
                    <div className="text-xs text-muted-foreground">
                        {new Date(t.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                </div>
            </TableCell>
            <TableCell className="text-right px-6">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-2xl hover:bg-muted/50">
                            <MoreVertical className="h-5 w-5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end"
                        className="w-64 rounded-[1.5rem] p-2 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.2)] border-border/50 backdrop-blur-xl"
                    >
                        <DropdownMenuLabel className="text-sm font-semibold uppercase text-muted-foreground px-3 py-2">Actions</DropdownMenuLabel>
                        <DropdownMenuItem className="gap-3 cursor-pointer rounded-lg py-2 text-sm"
                            onClick={() => openEdit(t)}
                        >
                            <Edit className="w-4 h-4 text-primary" /> Edit Testimonial
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="my-1 opacity-50" />
                        <DropdownMenuItem className="gap-3 text-destructive focus:bg-destructive/10 cursor-pointer rounded-lg py-2 text-sm"
                            onClick={() => setDeleteId(t.id)}
                        >
                            <Trash2 className="w-4 h-4" /> Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </TableCell>
        </TableRow>
    );
}

function TestimonialsPage() {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeSegment, setActiveSegment] = useState("All");
    const [ratingFilter, setRatingFilter] = useState<string>("all");
    const [sortField, setSortField] = useState<string>("createdAt");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
    const [currentPage, setCurrentPage] = useState(1);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
    const [formData, setFormData] = useState(defaultForm);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [view, setView] = useState<"list" | "grid">("list");
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [dateFrom, setDateFrom] = useState<Date | undefined>();
    const [dateTo, setDateTo] = useState<Date | undefined>();
    const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
    const [isReordering, setIsReordering] = useState(false);

    const fetchTestimonials = useCallback(async () => {
        try {
            setIsLoading(true);
            setIsError(false);
            const data = await testimonialsAPI.getAll();
            setTestimonials(data.items ?? data);
        } catch {
            setIsError(true);
            toast.error("Failed to load testimonials");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        await fetchTestimonials();
        setIsRefreshing(false);
        toast.success("Testimonials refreshed");
    }, [fetchTestimonials]);

    const filteredTestimonials = useMemo(() => {
        let list = testimonials;
        if (activeSegment === "Active") list = list.filter((t) => t.isActive);
        if (activeSegment === "Inactive") list = list.filter((t) => !t.isActive);
        if (ratingFilter !== "all") list = list.filter((t) => t.rating === Number(ratingFilter));
        if (dateFrom) list = list.filter((t) => new Date(t.createdAt) >= dateFrom);
        if (dateTo) {
            const endOfDay = new Date(dateTo);
            endOfDay.setHours(23, 59, 59, 999);
            list = list.filter((t) => new Date(t.createdAt) <= endOfDay);
        }
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            list = list.filter((t) =>
                (t.name || "").toLowerCase().includes(q) ||
                (t.company || "").toLowerCase().includes(q) ||
                (t.quote || "").toLowerCase().includes(q)
            );
        }
        const sorted = [...list].sort((a, b) => {
            let aVal: any = a[sortField as keyof Testimonial];
            let bVal: any = b[sortField as keyof Testimonial];
            if (sortField === "rating" || sortField === "order") {
                aVal = Number(aVal) || 0;
                bVal = Number(bVal) || 0;
            } else if (sortField === "name" || sortField === "company") {
                aVal = (aVal || "").toLowerCase();
                bVal = (bVal || "").toLowerCase();
            } else if (sortField === "createdAt") {
                aVal = new Date(aVal || 0).getTime();
                bVal = new Date(bVal || 0).getTime();
            }
            if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
            if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
            return 0;
        });
        return sorted;
    }, [testimonials, activeSegment, ratingFilter, searchQuery, sortField, sortDirection, dateFrom, dateTo]);

    const totalPages = Math.ceil(filteredTestimonials.length / TESTIMONIALS_PER_PAGE);
    const paginatedTestimonials = useMemo(() => {
        const start = (currentPage - 1) * TESTIMONIALS_PER_PAGE;
        return filteredTestimonials.slice(start, start + TESTIMONIALS_PER_PAGE);
    }, [filteredTestimonials, currentPage]);

    const highRatedCount = testimonials.filter((t) => t.rating >= 4).length;
    const averageRating = testimonials.length > 0
        ? (testimonials.reduce((acc, t) => acc + t.rating, 0) / testimonials.length).toFixed(1)
        : "0.0";

    const handleToggleActive = useCallback(async (t: Testimonial) => {
        try {
            await testimonialsAPI.update(t.id, { isActive: !t.isActive });
            setTestimonials(prev => prev.map(item => item.id === t.id ? { ...item, isActive: !item.isActive } : item));
            toast.success(`Testimonial ${t.isActive ? "deactivated" : "activated"}`);
        } catch {
            toast.error("Failed to update status");
        }
    }, []);

    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
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

    const handleExport = useCallback(() => {
        if (filteredTestimonials.length === 0) {
            toast.info("No testimonials to export for current filter.");
            return;
        }
        const headers = ["Name", "Role", "Company", "Quote", "Rating", "Status", "Order", "Created"];
        const rows = filteredTestimonials.map((t) =>
            [t.name, t.role || "", t.company || "", t.quote.replace(/"/g, '""'), t.rating,
                t.isActive ? "Active" : "Inactive", t.order, new Date(t.createdAt).toISOString()]
                .map((c) => `"${c}"`).join(",")
        );
        const csv = [headers.join(","), ...rows].join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `testimonials-export-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Testimonials exported");
    }, [filteredTestimonials]);

    const openAdd = useCallback(() => {
        setEditingTestimonial(null);
        setFormData(defaultForm);
        setPreviewUrl(null);
        setUploadProgress(0);
        setIsUploading(false);
        setIsDialogOpen(true);
    }, []);

    const openEdit = useCallback((t: Testimonial) => {
        setEditingTestimonial(t);
        setFormData({
            name: t.name, role: t.role || "", company: t.company || "", quote: t.quote,
            avatar: t.avatar || "", rating: t.rating, gradient: t.gradient || "",
            isActive: t.isActive, order: t.order,
        });
        setPreviewUrl(null);
        setUploadProgress(0);
        setIsUploading(false);
        setIsDialogOpen(true);
    }, []);

    const handleSubmit = useCallback(async () => {
        if (!formData.name.trim() || !formData.quote.trim()) {
            toast.error("Name and quote are required");
            return;
        }
        setIsSubmitting(true);
        try {
            if (editingTestimonial) {
                await testimonialsAPI.update(editingTestimonial.id, formData);
                toast.success("Testimonial updated successfully");
            } else {
                await testimonialsAPI.create(formData);
                toast.success("Testimonial created successfully");
            }
            setEditingTestimonial(null);
            setIsDialogOpen(false);
            await fetchTestimonials();
        } catch {
            toast.error(editingTestimonial ? "Failed to update testimonial" : "Failed to create testimonial");
        } finally {
            setIsSubmitting(false);
        }
    }, [formData, editingTestimonial, fetchTestimonials]);

    const handleDelete = useCallback(async () => {
        if (!deleteId) return;
        try {
            await testimonialsAPI.delete(deleteId);
            setDeleteId(null);
            setSelectedIds(prev => { const n = new Set(prev); n.delete(deleteId); return n; });
            await fetchTestimonials();
            toast.success("Testimonial permanently removed");
        } catch {
            toast.error("Failed to delete testimonial");
        }
    }, [deleteId, fetchTestimonials]);

    const handleBulkDelete = useCallback(async () => {
        if (selectedIds.size === 0) return;
        try {
            await testimonialsAPI.bulkDelete(Array.from(selectedIds));
            setSelectedIds(new Set());
            setBulkDeleteOpen(false);
            await fetchTestimonials();
            toast.success("Testimonials deleted");
        } catch {
            toast.error("Failed to delete testimonials");
        }
    }, [selectedIds, fetchTestimonials]);

    const handleBulkStatus = useCallback(async (isActive: boolean) => {
        if (selectedIds.size === 0) return;
        try {
            await testimonialsAPI.bulkUpdateStatus(Array.from(selectedIds), isActive);
            setSelectedIds(new Set());
            await fetchTestimonials();
            toast.success(`Testimonials ${isActive ? "activated" : "deactivated"}`);
        } catch {
            toast.error("Failed to update testimonials");
        }
    }, [selectedIds, fetchTestimonials]);

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => {
            const n = new Set(prev);
            if (n.has(id)) n.delete(id); else n.add(id);
            return n;
        });
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === paginatedTestimonials.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(paginatedTestimonials.map(t => t.id)));
        }
    };

    const handleAvatarUpload = async (file: File) => {
        if (!file) return;
        if (!file.type.startsWith("image/")) { toast.error("Please select an image file"); return; }
        setIsUploading(true); setUploadProgress(0);
        const objectUrl = URL.createObjectURL(file); setPreviewUrl(objectUrl);
        const interval = setInterval(() => { setUploadProgress(prev => Math.min(prev + 20, 90)); }, 200);
        try {
            const formData = new FormData();
            formData.append("file", file);
            const response = await fetch("/api/upload", { method: "POST", body: formData });
            const result = await response.json();
            clearInterval(interval); setUploadProgress(100);
            const imageUrl = result?.url || result?.image || objectUrl;
            setFormData(prev => ({ ...prev, avatar: imageUrl }));
            toast.success("Avatar uploaded");
            setTimeout(() => { setUploadProgress(0); setIsUploading(false); }, 500);
        } catch {
            clearInterval(interval); setUploadProgress(0); setIsUploading(false);
            toast.error("Upload failed");
        }
    };

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragEnd = useCallback(async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = paginatedTestimonials.findIndex(t => t.id === active.id);
        const newIndex = paginatedTestimonials.findIndex(t => t.id === over.id);
        if (oldIndex === -1 || newIndex === -1) return;

        const reordered = arrayMove(paginatedTestimonials, oldIndex, newIndex);
        const updates = reordered.map((t, i) => ({ id: t.id, order: i }));

        setTestimonials(prev => {
            const map = new Map(prev.map(t => [t.id, t]));
            reordered.forEach(t => map.set(t.id, t));
            return Array.from(map.values());
        });

        setIsReordering(true);
        try {
            await testimonialsAPI.reorder(updates);
        } catch {
            toast.error("Failed to save order");
            await fetchTestimonials();
        } finally {
            setIsReordering(false);
        }
    }, [paginatedTestimonials, fetchTestimonials]);

    const paginatedIds = useMemo(() => paginatedTestimonials.map(t => t.id), [paginatedTestimonials]);

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Testimonials</h1>
                    <p className="text-sm text-muted-foreground">Manage client testimonials, ratings, and social proof content.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    {selectedIds.size > 0 && (
                        <div className="flex items-center gap-1 mr-2">
                            <Badge variant="secondary" className="rounded-lg text-xs">{selectedIds.size} selected</Badge>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => setSelectedIds(new Set())}>
                                <XCircle className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm" className="h-8 rounded-lg text-xs gap-1"
                                onClick={() => handleBulkStatus(true)}>
                                <CheckCheck className="w-3 h-3" /> Activate
                            </Button>
                            <Button variant="outline" size="sm" className="h-8 rounded-lg text-xs gap-1"
                                onClick={() => handleBulkStatus(false)}>
                                <EyeOff className="w-3 h-3" /> Deactivate
                            </Button>
                            <Button variant="outline" size="sm" className="h-8 rounded-lg text-xs gap-1 text-destructive"
                                onClick={() => setBulkDeleteOpen(true)}>
                                <Trash2 className="w-3 h-3" /> Delete
                            </Button>
                        </div>
                    )}
                    <Button variant="outline" className="gap-2 rounded-xl h-11 border-border/50 bg-card/50 backdrop-blur-sm"
                        onClick={handleRefresh}>
                        <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
                        Refresh
                    </Button>
                    <Button variant="outline" className="gap-2 rounded-xl h-11 border-border/50 bg-card/50 backdrop-blur-sm"
                        onClick={handleExport}>
                        <Download className="w-4 h-4" /> Export
                    </Button>
                    <Button asChild className="gap-2 rounded-xl h-11 shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 px-8 font-semibold">
                        <Link href="/dashboard/testimonials/new">
                            <Plus className="w-4 h-4" /> Add Testimonial
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total</CardTitle>
                        <MessageSquare className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{isLoading ? <Skeleton className="h-8 w-12" /> : testimonials.length}</div>
                        <p className="text-xs text-muted-foreground">Testimonials</p>
                    </CardContent>
                </Card>
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Active</CardTitle>
                        <Activity className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-500">
                            {isLoading ? <Skeleton className="h-8 w-12" /> : testimonials.filter((t) => t.isActive).length}
                        </div>
                        <p className="text-xs text-muted-foreground">Visible</p>
                    </CardContent>
                </Card>
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
                        <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-500">{isLoading ? <Skeleton className="h-8 w-12" /> : averageRating}</div>
                        <p className="text-xs text-muted-foreground">Out of 5.0</p>
                    </CardContent>
                </Card>
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">High Rated</CardTitle>
                        <Sparkles className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-500">{isLoading ? <Skeleton className="h-8 w-12" /> : highRatedCount}</div>
                        <p className="text-xs text-muted-foreground">4+ Stars</p>
                    </CardContent>
                </Card>
            </div>

            {isError && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-6 text-center">
                    <AlertCircle className="w-10 h-10 text-destructive mx-auto mb-3" />
                    <h3 className="text-lg font-bold mb-2">Failed to load testimonials</h3>
                    <p className="text-sm text-muted-foreground mb-4">Something went wrong while fetching testimonials.</p>
                    <Button variant="outline" onClick={() => fetchTestimonials()}>Try Again</Button>
                </div>
            )}

            <div className="grid lg:grid-cols-4 gap-8">
                <div className="space-y-6">
                    <Card className="border-border/50 h-fit rounded-[2.5rem] overflow-hidden shadow-sm bg-card/40 backdrop-blur-md">
                        <CardHeader className="p-6 pb-3">
                            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</CardTitle>
                        </CardHeader>
                        <CardContent className="px-3 pb-4 pt-0">
                            <div className="flex flex-col gap-0.5">
                                {[
                                    { name: "All", count: testimonials.length },
                                    { name: "Active", count: testimonials.filter((t) => t.isActive).length },
                                    { name: "Inactive", count: testimonials.filter((t) => !t.isActive).length },
                                ].map((segment) => (
                                    <button key={segment.name}
                                        onClick={() => { setActiveSegment(segment.name); setCurrentPage(1); }}
                                        className={cn(
                                            "flex items-center justify-between px-4 py-2.5 rounded-xl text-sm transition-all group",
                                            activeSegment === segment.name
                                                ? "bg-primary text-white font-medium shadow-lg shadow-primary/20"
                                                : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
                                        )}
                                    >
                                        <span>{segment.name}</span>
                                        <span className={cn("px-2 py-0.5 rounded-md text-xs font-medium",
                                            activeSegment === segment.name
                                                ? "bg-white/20 text-white"
                                                : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                                        )}>
                                            {segment.count}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border/50 h-fit rounded-[2.5rem] overflow-hidden shadow-sm bg-card/40 backdrop-blur-md">
                        <CardHeader className="p-6 pb-3">
                            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Rating</CardTitle>
                        </CardHeader>
                        <CardContent className="px-3 pb-4 pt-0">
                            <div className="flex flex-col gap-0.5">
                                {[
                                    { value: "all", label: "All Ratings", count: testimonials.length },
                                    { value: "5", label: "5 Stars", count: testimonials.filter((t) => t.rating === 5).length },
                                    { value: "4", label: "4 Stars", count: testimonials.filter((t) => t.rating === 4).length },
                                    { value: "3", label: "3 Stars", count: testimonials.filter((t) => t.rating === 3).length },
                                ].map((option) => (
                                    <button key={option.value}
                                        onClick={() => { setRatingFilter(option.value); setCurrentPage(1); }}
                                        className={cn(
                                            "flex items-center justify-between px-4 py-2.5 rounded-xl text-sm transition-all group",
                                            ratingFilter === option.value
                                                ? "bg-primary text-white font-medium shadow-lg shadow-primary/20"
                                                : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
                                        )}
                                    >
                                        <span className="flex items-center gap-2">
                                            {option.value !== "all" && <Star className="w-3 h-3 fill-current" />}
                                            {option.label}
                                        </span>
                                        <span className={cn("px-2 py-0.5 rounded-md text-xs font-medium",
                                            ratingFilter === option.value
                                                ? "bg-white/20 text-white"
                                                : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                                        )}>
                                            {option.count}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border/50 bg-primary/5 rounded-[2.5rem] border-dashed p-4">
                        <CardHeader className="p-6 pb-0">
                            <CardTitle className="text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
                                <Quote className="w-4 h-4 text-primary" /> Social Proof
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-6 pb-6 pt-4 space-y-4">
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Testimonials are displayed on the homepage and landing sections. Active items with high ratings are prioritized.
                            </p>
                            <Button variant="outline" className="w-full rounded-xl bg-background text-xs h-9 font-medium border-primary/20 text-primary hover:bg-primary hover:text-white transition-all"
                                onClick={handleRefresh}>
                                Refresh
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-3 space-y-4">
                    <Card className="border-border/50 rounded-2xl overflow-hidden shadow-sm">
                        <CardHeader className="p-6 border-b border-border/50 bg-muted/5">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                                <div className="flex flex-1 flex-col sm:flex-row gap-2">
                                    <div className="relative flex-1 max-w-sm">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input placeholder="Search by name, company, quote..."
                                            className="pl-10 h-10 rounded-xl bg-background text-sm"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline"
                                                className={cn("h-10 rounded-xl gap-2", (dateFrom || dateTo) && "text-primary border-primary/50")}>
                                                <Filter className="w-4 h-4" />
                                                {dateFrom ? format(dateFrom, "MMM d") : "From"} {dateTo ? `- ${format(dateTo, "MMM d")}` : ""}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <div className="p-3 border-b border-border/50 flex items-center gap-1">
                                                <Button variant="ghost" size="sm" className="h-7 text-xs rounded-lg"
                                                    onClick={() => { setDateFrom(undefined); setDateTo(undefined); }}>
                                                    Clear
                                                </Button>
                                            </div>
                                            <div className="flex">
                                                <div className="p-2">
                                                    <Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} autoFocus />
                                                </div>
                                                <div className="p-2 border-l border-border/50">
                                                    <Calendar mode="single" selected={dateTo} onSelect={setDateTo} autoFocus />
                                                </div>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div className="flex gap-2 shrink-0">
                                    <Button variant="outline" size="icon" onClick={() => setView("list")}
                                        className={cn("rounded-xl", view === "list" ? "bg-muted" : "")}>
                                        <List className="w-4 h-4" />
                                    </Button>
                                    <Button variant="outline" size="icon" onClick={() => setView("grid")}
                                        className={cn("rounded-xl", view === "grid" ? "bg-muted" : "")}>
                                        <LayoutGrid className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {isLoading && testimonials.length === 0 ? (
                                <div className="py-32 flex flex-col items-center justify-center gap-6">
                                    <div className="relative">
                                        <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                                        <RefreshCw className="h-10 w-10 text-primary animate-spin relative z-10" />
                                    </div>
                                    <p className="text-sm text-primary animate-pulse">Loading testimonials...</p>
                                </div>
                            ) : filteredTestimonials.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-32 bg-muted/5">
                                    <div className="w-20 h-20 rounded-[2rem] bg-muted/20 flex items-center justify-center mb-6">
                                        <SearchX className="h-10 w-10 text-muted-foreground/30" />
                                    </div>
                                    <h3 className="text-xl font-semibold">No results</h3>
                                    <p className="text-muted-foreground text-sm max-w-xs text-center mt-2">
                                        Try a different search or filter.
                                    </p>
                                    <Button variant="outline" className="mt-6 rounded-xl font-medium text-xs border-primary/20 text-primary px-8 h-9 hover:bg-primary hover:text-white transition-all"
                                        onClick={() => { setSearchQuery(""); setActiveSegment("All"); setDateFrom(undefined); setDateTo(undefined); }}>
                                        Reset Filters
                                    </Button>
                                </div>
                            ) : view === "grid" ? (
                                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {paginatedTestimonials.map((t) => (
                                        <Card key={t.id}
                                            className="border-border/50 hover:border-primary/50 hover:shadow-lg transition-all group cursor-pointer"
                                        >
                                            <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-10 w-10 border-2 border-background shadow-md rounded-lg">
                                                        <AvatarImage src={t.avatar} />
                                                        <AvatarFallback className="bg-primary/10 text-primary font-medium text-xs rounded-lg">
                                                            {(t.name || "T").split(" ").filter(Boolean).map((n) => n[0]).join("").toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <CardTitle className="text-sm font-bold">{t.name}</CardTitle>
                                                        <CardDescription className="text-xs">{t.role || "\u2014"}</CardDescription>
                                                    </div>
                                                </div>
                                                <div className={cn("w-2 h-2 rounded-full mt-1",
                                                    t.isActive ? "bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.6)]" : "bg-muted"
                                                )} />
                                            </CardHeader>
                                            <CardContent className="p-4 pt-0 space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <StarRating rating={t.rating} />
                                                    <span className="text-xs text-muted-foreground">{t.company || ""}</span>
                                                </div>
                                                <p className="text-sm text-muted-foreground line-clamp-3 italic">
                                                    &ldquo;{t.quote}&rdquo;
                                                </p>
                                                <div className="flex items-center justify-between pt-2 border-t border-border/20">
                                                    <span className="text-xs text-muted-foreground">
                                                        {new Date(t.createdAt).toLocaleDateString()}
                                                    </span>
                                                    <div className="flex gap-1">
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg"
                                                            onClick={() => openEdit(t)}>
                                                            <Edit className="w-3.5 h-3.5" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-destructive"
                                                            onClick={() => setDeleteId(t.id)}>
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <>
                                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                        <SortableContext items={paginatedIds} strategy={verticalListSortingStrategy}>
                                            <Table>
                                                <TableHeader>
                                                    <TableRow className="bg-muted/10 hover:bg-transparent border-b border-border/50">
                                                        <TableHead className="w-16 px-2 h-auto">
                                                            <button onClick={toggleSelectAll} className="text-muted-foreground hover:text-primary transition-colors">
                                                                {selectedIds.size === paginatedTestimonials.length && paginatedTestimonials.length > 0
                                                                    ? <CheckSquare className="w-4 h-4 text-primary" />
                                                                    : <Square className="w-4 h-4" />
                                                                }
                                                            </button>
                                                        </TableHead>
                                                        <TableHead className="w-[280px] text-xs font-medium uppercase tracking-wider text-muted-foreground px-6 h-auto cursor-pointer select-none"
                                                            onClick={() => handleSort("name")}>
                                                            <div className="flex items-center gap-1">Name <SortIcon field="name" /></div>
                                                        </TableHead>
                                                        <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground h-auto cursor-pointer select-none"
                                                            onClick={() => handleSort("company")}>
                                                            <div className="flex items-center gap-1">Company <SortIcon field="company" /></div>
                                                        </TableHead>
                                                        <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground h-auto cursor-pointer select-none"
                                                            onClick={() => handleSort("rating")}>
                                                            <div className="flex items-center gap-1">Rating <SortIcon field="rating" /></div>
                                                        </TableHead>
                                                        <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground h-auto">Status</TableHead>
                                                        <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground h-auto cursor-pointer select-none"
                                                            onClick={() => handleSort("createdAt")}>
                                                            <div className="flex items-center gap-1">Created <SortIcon field="createdAt" /></div>
                                                        </TableHead>
                                                        <TableHead className="text-right text-xs font-medium uppercase tracking-wider text-muted-foreground px-6 h-auto">Actions</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {paginatedTestimonials.map((t) => (
                                                        <SortableRow key={t.id} t={t} openEdit={openEdit}
                                                            setDeleteId={setDeleteId} handleToggleActive={handleToggleActive}
                                                            isSelected={selectedIds.has(t.id)} onSelect={toggleSelect}
                                                        />
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </SortableContext>
                                    </DndContext>

                                    {filteredTestimonials.length > TESTIMONIALS_PER_PAGE && (
                                        <div className="flex items-center justify-between px-6 py-3 border-t border-border/50">
                                            <p className="text-xs text-muted-foreground">
                                                Showing {((currentPage - 1) * TESTIMONIALS_PER_PAGE) + 1}
                                                &ndash;{Math.min(currentPage * TESTIMONIALS_PER_PAGE, filteredTestimonials.length)}
                                                of {filteredTestimonials.length}
                                            </p>
                                            <div className="flex items-center gap-1">
                                                <Button variant="outline" size="sm" className="h-8 w-8 p-0"
                                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                                    disabled={currentPage === 1}>
                                                    <ChevronLeft className="w-4 h-4" />
                                                </Button>
                                                <span className="text-xs text-muted-foreground px-2">{currentPage} / {totalPages}</span>
                                                <Button variant="outline" size="sm" className="h-8 w-8 p-0"
                                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                                    disabled={currentPage === totalPages}>
                                                    <ChevronRight className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Dialog open={isDialogOpen}
                onOpenChange={(open) => { if (!open) { setEditingTestimonial(null); setIsDialogOpen(false); } }}>
                <DialogContent className="sm:max-w-2xl rounded-2xl border-border/40 bg-card/60 backdrop-blur-xl shadow-2xl p-0 flex flex-col max-h-[85vh]">
                    <DialogHeader className="p-6 pb-3 shrink-0">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                            <Quote className="w-5 h-5 text-primary" />
                        </div>
                        <DialogTitle className="text-xl font-semibold">
                            {editingTestimonial ? "Edit Testimonial" : "New Testimonial"}
                        </DialogTitle>
                        <DialogDescription className="text-sm text-muted-foreground">
                            {editingTestimonial ? `Modify testimonial from ${editingTestimonial.name}` : "Create a new client testimonial entry"}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
                        className="flex-1 overflow-y-auto px-6 space-y-4 pb-4" data-lenis-prevent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-muted-foreground ml-1">Name <span className="text-destructive">*</span></Label>
                                <Input placeholder="John Doe" className="rounded-lg h-9 text-sm"
                                    value={formData.name}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))} />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-muted-foreground ml-1">Role</Label>
                                <Input placeholder="CEO" className="rounded-lg h-9 text-sm"
                                    value={formData.role}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value }))} />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-muted-foreground ml-1">Company</Label>
                                <Input placeholder="Acme Inc" className="rounded-lg h-9 text-sm"
                                    value={formData.company}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, company: e.target.value }))} />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-muted-foreground ml-1">Rating</Label>
                                <Select value={String(formData.rating)}
                                    onValueChange={(v) => setFormData((prev) => ({ ...prev, rating: Number(v) }))}>
                                    <SelectTrigger className="rounded-lg h-9 text-sm"><SelectValue /></SelectTrigger>
                                    <SelectContent className="rounded-lg">
                                        {RATING_OPTIONS.map((r) => (
                                            <SelectItem key={r} value={String(r)}>
                                                <div className="flex items-center gap-2"><StarRating rating={r} /><span className="text-xs">{r}/5</span></div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-muted-foreground ml-1">Avatar</Label>
                                <div onClick={() => fileInputRef.current?.click()}
                                    className="relative rounded-xl h-28 bg-background/50 border-2 border-dashed border-border/50 hover:border-primary/40 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer overflow-hidden">
                                    {previewUrl || formData.avatar ? (
                                        <img src={previewUrl || formData.avatar} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                                    ) : (
                                        <><div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                            <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div><span className="text-xs text-muted-foreground">Click to upload avatar</span></>
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
                                    onChange={(e) => { const file = e.target.files?.[0]; if (file) handleAvatarUpload(file); }} />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-muted-foreground ml-1">Gradient</Label>
                                <Input placeholder="from-blue-500 to-purple-600" className="rounded-lg h-9 text-sm"
                                    value={formData.gradient}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, gradient: e.target.value }))} />
                            </div>
                            <div className="space-y-1.5 md:col-span-2">
                                <Label className="text-xs font-medium text-muted-foreground ml-1">Quote <span className="text-destructive">*</span></Label>
                                <Textarea placeholder="The testimonial quote..." className="rounded-lg min-h-[80px] text-sm resize-none"
                                    value={formData.quote}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, quote: e.target.value }))} />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-muted-foreground ml-1">Order</Label>
                                <Input type="number" placeholder="0" className="rounded-lg h-9 text-sm"
                                    value={formData.order}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, order: Number(e.target.value) }))} />
                            </div>
                            <div className="flex items-end pb-1">
                                <div className="flex items-center gap-3">
                                    <Switch checked={formData.isActive}
                                        onCheckedChange={(v) => setFormData((prev) => ({ ...prev, isActive: v }))} id="isActive" />
                                    <Label htmlFor="isActive" className="text-sm cursor-pointer">
                                        {formData.isActive ? "Active" : "Inactive"}
                                    </Label>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="ghost" type="button" className="rounded-lg h-9"
                                onClick={() => { setEditingTestimonial(null); setIsDialogOpen(false); }}>
                                Cancel
                            </Button>
                            <Button type="submit" className="rounded-lg h-9 px-6 shadow-lg shadow-primary/30 font-medium"
                                disabled={isSubmitting}>
                                {isSubmitting ? "Saving..." : editingTestimonial ? "Update" : "Create"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <DialogContent className="rounded-xl border-border/50 max-w-[400px] p-6">
                    <DialogHeader className="flex flex-col items-center text-center gap-2">
                        <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                            <Trash2 className="w-6 h-6 text-destructive" />
                        </div>
                        <DialogTitle className="text-lg font-semibold">Delete testimonial?</DialogTitle>
                        <DialogDescription className="text-sm text-destructive">This action cannot be undone</DialogDescription>
                    </DialogHeader>
                    <div className="text-center">
                        <p className="text-sm text-muted-foreground">This will permanently remove this testimonial.</p>
                    </div>
                    <DialogFooter className="flex-col sm:flex-col gap-2">
                        <Button className="w-full bg-destructive hover:bg-destructive/90 rounded-lg h-9 text-sm font-medium"
                            onClick={handleDelete}>
                            Delete
                        </Button>
                        <Button variant="ghost" className="w-full rounded-lg h-9" onClick={() => setDeleteId(null)}>
                            Cancel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
                <DialogContent className="rounded-xl border-border/50 max-w-[400px] p-6">
                    <DialogHeader className="flex flex-col items-center text-center gap-2">
                        <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                            <Trash2 className="w-6 h-6 text-destructive" />
                        </div>
                        <DialogTitle className="text-lg font-semibold">Delete {selectedIds.size} testimonials?</DialogTitle>
                        <DialogDescription className="text-sm text-destructive">This action cannot be undone</DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex-col sm:flex-col gap-2">
                        <Button className="w-full bg-destructive hover:bg-destructive/90 rounded-lg h-9 text-sm font-medium"
                            onClick={handleBulkDelete}>
                            Delete All
                        </Button>
                        <Button variant="ghost" className="w-full rounded-lg h-9" onClick={() => setBulkDeleteOpen(false)}>
                            Cancel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default withRoleProtection(TestimonialsPage, ["Admin", "SuperAdmin"]);

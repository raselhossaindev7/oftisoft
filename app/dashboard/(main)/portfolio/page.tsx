"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
    Search, Filter, MoreVertical, Plus, Download, Folder, Star, Eye, EyeOff,
    Trash2, RefreshCw, Activity, Image, Edit3, Loader2, X, Tag,
    AlertCircle, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown,
    LayoutGrid, List, GripVertical, CheckSquare, Square, CheckCheck, XCircle,
    CalendarIcon, User, Hash, Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
    DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
    Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { portfolioAPI, authAPI, type PortfolioItem } from "@/lib/api";
import { withRoleProtection } from "@/components/auth/role-guard";
import { Skeleton } from "@/components/ui/skeleton";
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
import StatsEditor from "@/components/dashboard/portfolio/stats-editor";
import ScreenshotsUpload from "@/components/dashboard/portfolio/screenshots-upload";

interface StatEntry { label: string; value: string }

const ITEMS_PER_PAGE = 12;

function SortablePortfolioRow({ item, view, isSelected, onToggleSelect, onToggleFeatured, onToggleStatus, onEdit, onDelete, style }: any) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });

    const dragStyle = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        ...style,
    };

    const tags = Array.isArray(item.tags) ? item.tags : typeof item.tags === "string" && item.tags ? item.tags.split(",").map((t: string) => t.trim()) : [];

    if (view === "grid") {
        return (
            <div ref={setNodeRef} style={dragStyle}
                className="group relative bg-card border border-border/40 rounded-xl overflow-hidden hover:shadow-md hover:border-primary/20 transition-all">
                <div className="absolute top-2 left-2 z-10 flex gap-1">
                    <button onClick={(e) => { e.stopPropagation(); onToggleSelect(item.id); }}
                        className="p-1.5 rounded-lg bg-background/80 backdrop-blur-sm hover:bg-background transition-colors">
                        {isSelected ? <CheckSquare className="w-3.5 h-3.5 text-primary" /> : <Square className="w-3.5 h-3.5" />}
                    </button>
                    <button {...attributes} {...listeners}
                        className="p-1.5 rounded-lg bg-background/80 backdrop-blur-sm hover:bg-background transition-colors cursor-grab active:cursor-grabbing">
                        <GripVertical className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                </div>
                <div className="absolute top-2 right-2 z-10">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button onClick={(e) => e.stopPropagation()} className="p-1.5 rounded-lg bg-background/80 backdrop-blur-sm hover:bg-background transition-colors">
                                <MoreVertical className="w-3.5 h-3.5" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl">
                            <DropdownMenuLabel className="text-xs">{item.title}</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => onEdit(item)}><Edit3 className="w-4 h-4 mr-2" /> Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onToggleFeatured(item)}>
                                <Star className="w-4 h-4 mr-2" /> {item.featured ? "Unfeature" : "Feature"}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onToggleStatus(item)}>
                                {item.status === "published" ? <><EyeOff className="w-4 h-4 mr-2" /> Draft</> : <><Eye className="w-4 h-4 mr-2" /> Publish</>}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive" onClick={() => onDelete(item)}>
                                <Trash2 className="w-4 h-4 mr-2" /> Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <Link href={`/dashboard/portfolio/${item.id}`}>
                    <div className={`relative h-36 ${item.gradient || "bg-gradient-to-br from-primary/20 to-primary/5"}`}>
                        {item.image ? (
                            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <Image className="w-10 h-10 text-muted-foreground/30" />
                            </div>
                        )}
                        <div className="absolute top-9 left-2 flex gap-1">
                            {item.featured && <Star className="w-3 h-3 fill-amber-400 text-amber-400" />}
                            <Badge variant={item.status === "published" ? "default" : "secondary"}
                                className="text-[10px] h-4 px-1.5 rounded">
                                {item.status}
                            </Badge>
                        </div>
                    </div>
                    <div className="p-3 space-y-1.5">
                        <h3 className="text-sm font-semibold leading-tight truncate">{item.title}</h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Folder className="w-3 h-3" /><span className="truncate">{item.category}</span>
                            <User className="w-3 h-3 ml-1" /><span className="truncate">{item.client}</span>
                        </div>
                        {tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                                {tags.slice(0, 3).map((t: string, i: number) => (
                                    <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{t}</span>
                                ))}
                                {tags.length > 3 && <span className="text-[10px] text-muted-foreground">+{tags.length - 3}</span>}
                            </div>
                        )}
                    </div>
                </Link>
            </div>
        );
    }

    return (
        <TableRow ref={setNodeRef} style={dragStyle} className={cn(isDragging && "opacity-50")}>
            <TableCell className="w-10">
                <div className="flex items-center gap-1">
                    <button onClick={() => onToggleSelect(item.id)}>
                        {isSelected ? <CheckSquare className="w-4 h-4 text-primary" /> : <Square className="w-4 h-4 text-muted-foreground" />}
                    </button>
                    <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-0.5">
                        <GripVertical className="w-4 h-4 text-muted-foreground/50 hover:text-muted-foreground" />
                    </button>
                </div>
            </TableCell>
            <TableCell>
                <Link href={`/dashboard/portfolio/${item.id}`} className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex-shrink-0 overflow-hidden ${item.gradient || "bg-gradient-to-br from-primary/20 to-primary/5"}`}>
                        {item.image ? (
                            <img src={item.image} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <Image className="w-5 h-5 text-muted-foreground/30" />
                            </div>
                        )}
                    </div>
                    <div>
                        <p className="text-sm font-medium">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.client}</p>
                    </div>
                </Link>
            </TableCell>
            <TableCell>
                <Badge variant="outline" className="rounded-lg text-xs font-normal">{item.category}</Badge>
            </TableCell>
            <TableCell>
                <div className="flex gap-1">
                    <Badge variant={item.status === "published" ? "default" : "secondary"} className="rounded-lg text-xs">
                        {item.status}
                    </Badge>
                    {item.featured && (
                        <Badge variant="outline" className="rounded-lg text-xs border-amber-400 text-amber-500">
                            <Star className="w-3 h-3 mr-0.5 fill-amber-400" />
                        </Badge>
                    )}
                </div>
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">{format(new Date(item.createdAt), "MMM d, yyyy")}</TableCell>
            <TableCell className="text-right">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                            <MoreVertical className="w-4 h-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl">
                        <DropdownMenuLabel className="text-xs">Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onEdit(item)}><Edit3 className="w-4 h-4 mr-2" /> Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onToggleFeatured(item)}>
                            <Star className="w-4 h-4 mr-2" /> {item.featured ? "Unfeature" : "Feature"}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onToggleStatus(item)}>
                            {item.status === "published" ? <><EyeOff className="w-4 h-4 mr-2" /> Draft</> : <><Eye className="w-4 h-4 mr-2" /> Publish</>}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={() => onDelete(item)}>
                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </TableCell>
        </TableRow>
    );
}

function PortfolioPage() {
    const [items, setItems] = useState<PortfolioItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedTab, setSelectedTab] = useState("all");
    const [view, setView] = useState<"list" | "grid">("list");
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
    const [bulkStatusOpen, setBulkStatusOpen] = useState<"published" | "draft" | null>(null);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const screenshotsInputRef = useRef<HTMLInputElement>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [image, setImage] = useState("");
    const [screenshots, setScreenshots] = useState<string[]>([]);
    const [dialogStats, setDialogStats] = useState<StatEntry[]>([]);
    const [statsCount, setStatsCount] = useState<{ total: number; published: number; draft: number; featured: number } | null>(null);

    const [sortField, setSortField] = useState("createdAt");
    const [sortDirection, setSortDirection] = useState<"ASC" | "DESC">("DESC");
    const [currentPage, setCurrentPage] = useState(0);
    const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});

    const [formData, setFormData] = useState({
        title: "", slug: "", category: "", client: "", description: "", longDescription: "",
        tags: "", demoUrl: "", status: "draft", featured: false, order: 0,
    });

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const fetchItems = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const params: any = { take: ITEMS_PER_PAGE, skip: currentPage * ITEMS_PER_PAGE, sortField, sortDirection };
            if (searchTerm) params.search = searchTerm;
            if (selectedTab !== "all" && selectedTab !== "featured") params.status = selectedTab;
            if (selectedTab === "featured") params.featured = "true";
            const data = await portfolioAPI.getAll(params);
            setItems(data.items ?? data);
        } catch {
            setError("Failed to load portfolio items");
        } finally { setIsLoading(false); }
    }, [currentPage, sortField, sortDirection, searchTerm, selectedTab]);

    const fetchStatsCount = useCallback(async () => {
        try {
            const data = await portfolioAPI.getStats();
            setStatsCount(data);
        } catch {}
    }, []);

    useEffect(() => { fetchItems(); fetchStatsCount(); }, [fetchItems, fetchStatsCount]);

    const filteredItems = useMemo(() => {
        let filtered = items;
        if (dateRange.from) {
            const from = new Date(dateRange.from);
            filtered = filtered.filter(i => new Date(i.createdAt) >= from);
        }
        if (dateRange.to) {
            const to = new Date(dateRange.to);
            to.setHours(23, 59, 59, 999);
            filtered = filtered.filter(i => new Date(i.createdAt) <= to);
        }
        return filtered;
    }, [items, dateRange]);

    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortDirection(d => d === "ASC" ? "DESC" : "ASC");
        } else {
            setSortField(field);
            setSortDirection("DESC");
        }
    };

    const handleToggleSelect = (id: string) => {
        setSelectedIds(prev => {
            const n = new Set(prev);
            if (n.has(id)) n.delete(id); else n.add(id);
            return n;
        });
    };

    const handleSelectAll = () => {
        if (selectedIds.size === filteredItems.length) setSelectedIds(new Set());
        else setSelectedIds(new Set(filteredItems.map(i => i.id)));
    };

    const handleEdit = (item: PortfolioItem) => {
        setEditingItem(item);
        setFormData({
            title: item.title, slug: item.slug, category: item.category, client: item.client,
            description: item.description, longDescription: item.longDescription || "",
            tags: Array.isArray(item.tags) ? item.tags.join(", ") : item.tags || "",
            demoUrl: item.demoUrl || "",
            status: item.status, featured: item.featured, order: item.order,
        });
        setImage(item.image || "");
        setScreenshots(Array.isArray(item.screenshots) ? item.screenshots : []);
        try { const p = typeof item.stats === 'string' ? JSON.parse(item.stats) : item.stats; setDialogStats(Array.isArray(p) ? p : []); } catch { setDialogStats([]); }
        setPreviewUrl(null);
        setIsDialogOpen(true);
    };

    const handleNew = () => {
        setEditingItem(null);
        setFormData({ title: "", slug: "", category: "", client: "", description: "", longDescription: "", tags: "", demoUrl: "", status: "draft", featured: false, order: 0 });
        setImage("");
        setScreenshots([]);
        setDialogStats([]);
        setPreviewUrl(null);
        setIsDialogOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title.trim() || !formData.category.trim() || !formData.client.trim() || !formData.description.trim()) {
            toast.error("Title, category, client, and description are required"); return;
        }
        setIsSaving(true);
        const payload = {
            ...formData,
            slug: formData.slug.trim() || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
            image: image || undefined,
            screenshots: screenshots.length > 0 ? screenshots : undefined,
            tags: formData.tags ? formData.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
            stats: dialogStats.length > 0 ? JSON.stringify(dialogStats) : undefined,
            demoUrl: formData.demoUrl || undefined,
        };
        try {
            if (editingItem) {
                await portfolioAPI.update(editingItem.id, payload);
                toast.success("Portfolio item updated");
            } else {
                await portfolioAPI.create(payload);
                toast.success("Portfolio item created");
            }
            setIsDialogOpen(false);
            setEditingItem(null);
            await fetchItems();
            await fetchStatsCount();
        } catch {
            toast.error(editingItem ? "Failed to update" : "Failed to create");
        } finally { setIsSaving(false); }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await portfolioAPI.delete(deleteId);
            setDeleteId(null);
            setSelectedIds(prev => { const n = new Set(prev); n.delete(deleteId); return n; });
            await fetchItems();
            await fetchStatsCount();
            toast.success("Portfolio item deleted");
        } catch { toast.error("Failed to delete"); }
    };

    const handleBulkDelete = async () => {
        try {
            await portfolioAPI.bulkDelete(Array.from(selectedIds));
            setSelectedIds(new Set());
            setBulkDeleteOpen(false);
            await fetchItems();
            await fetchStatsCount();
            toast.success("Items deleted");
        } catch { toast.error("Failed to delete items"); }
    };

    const handleBulkStatus = async (status: string) => {
        try {
            await portfolioAPI.bulkUpdateStatus(Array.from(selectedIds), status);
            setSelectedIds(new Set());
            setBulkStatusOpen(null);
            await fetchItems();
            toast.success(`Items ${status === "published" ? "published" : "drafted"}`);
        } catch { toast.error("Failed to update items"); }
    };

    const handleToggleFeatured = async (item: PortfolioItem) => {
        try {
            await portfolioAPI.update(item.id, { featured: !item.featured });
            setItems(prev => prev.map(i => i.id === item.id ? { ...i, featured: !i.featured } : i));
            toast.success(`Item ${item.featured ? "unfeatured" : "featured"}`);
        } catch { toast.error("Failed to update"); }
    };

    const handleToggleStatus = async (item: PortfolioItem) => {
        const newStatus = item.status === "published" ? "draft" : "published";
        try {
            await portfolioAPI.update(item.id, { status: newStatus });
            setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: newStatus } : i));
            toast.success(`Item ${newStatus === "published" ? "published" : "drafted"}`);
        } catch { toast.error("Failed to update"); }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        const reordered = arrayMove(items, oldIndex, newIndex);
        setItems(reordered);
        try {
            const updates = reordered.map((item, index) => ({ id: item.id, order: index }));
            await portfolioAPI.reorder(updates);
        } catch { toast.error("Failed to save order"); setItems(items); }
    };

    const handleImageUpload = async (file: File) => {
        if (!file || !file.type.startsWith("image/")) { toast.error("Please select an image file"); return; }
        setIsUploading(true);
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);
        try {
            const { authAPI } = await import("@/lib/api");
            const data = await authAPI.uploadAvatar(file);
            setFormData(prev => ({ ...prev, image: data.avatarUrl || data.avatar || "" }));
            toast.success("Image uploaded");
        } catch { setPreviewUrl(null); toast.error("Upload failed"); }
        finally { setIsUploading(false); }
    };

    const SortIcon = ({ field }: { field: string }) => {
        if (sortField !== field) return <ArrowUpDown className="w-3.5 h-3.5 ml-1 text-muted-foreground/50" />;
        return sortDirection === "ASC" ? <ArrowUp className="w-3.5 h-3.5 ml-1" /> : <ArrowDown className="w-3.5 h-3.5 ml-1" />;
    };

    const tabs = [
        { key: "all", label: "All", count: statsCount?.total ?? 0 },
        { key: "published", label: "Published", count: statsCount?.published ?? 0 },
        { key: "draft", label: "Drafts", count: statsCount?.draft ?? 0 },
        { key: "featured", label: "Featured", count: statsCount?.featured ?? 0 },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Portfolio</h1>
                    <p className="text-sm text-muted-foreground">Manage your portfolio projects</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" className="rounded-xl h-9 w-9" onClick={() => { fetchItems(); fetchStatsCount(); }} disabled={isLoading}>
                        <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
                    </Button>
                    <Button asChild variant="outline" className="gap-2 rounded-xl h-9">
                        <Link href="/dashboard/portfolio/new"><Plus className="w-4 h-4" /> New</Link>
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                    { label: "Total", value: statsCount?.total ?? 0, icon: Image, color: "text-blue-500" },
                    { label: "Published", value: statsCount?.published ?? 0, icon: Eye, color: "text-green-500" },
                    { label: "Drafts", value: statsCount?.draft ?? 0, icon: Edit3, color: "text-amber-500" },
                    { label: "Featured", value: statsCount?.featured ?? 0, icon: Star, color: "text-purple-500" },
                ].map((stat) => (
                    <Card key={stat.label} className="border-border/40">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-background/50 border border-border/30 flex items-center justify-center">
                                <stat.icon className={cn("w-5 h-5", stat.color)} />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">{stat.label}</p>
                                <p className="text-xl font-bold">{stat.value}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search projects..." className="pl-9 h-9 rounded-lg"
                        value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(0); }} />
                </div>
                <div className="flex gap-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="rounded-lg h-9 gap-2">
                                <CalendarIcon className="w-4 h-4" />
                                {dateRange.from ? format(dateRange.from, "MMM d") : "From"}
                                {dateRange.to ? ` - ${format(dateRange.to, "MMM d")}` : ""}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 rounded-xl" align="end">
                            <Calendar mode="range" selected={{ from: dateRange.from, to: dateRange.to }}
                                onSelect={(r) => setDateRange({ from: r?.from, to: r?.to })} />
                        </PopoverContent>
                    </Popover>
                    {(dateRange.from || dateRange.to) && (
                        <Button variant="ghost" size="icon" className="rounded-lg h-9 w-9"
                            onClick={() => setDateRange({})}>
                            <X className="w-4 h-4" />
                        </Button>
                    )}
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

            {/* Tabs */}
            <div className="flex gap-1 bg-muted/30 p-1 rounded-lg w-fit">
                {tabs.map(tab => (
                    <button key={tab.key}
                        onClick={() => { setSelectedTab(tab.key); setCurrentPage(0); }}
                        className={cn("px-4 py-1.5 text-sm font-medium rounded-md transition-all",
                            selectedTab === tab.key ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}>
                        {tab.label} ({tab.count})
                    </button>
                ))}
            </div>

            {/* Bulk actions */}
            {selectedIds.size > 0 && (
                <div className="flex items-center gap-2 p-2 bg-primary/5 rounded-lg border border-primary/20">
                    <span className="text-sm font-medium px-2">{selectedIds.size} selected</span>
                    <Button variant="outline" size="sm" className="rounded-lg h-8 gap-1 text-xs"
                        onClick={() => setBulkStatusOpen("published")}>
                        <Eye className="w-3.5 h-3.5" /> Publish
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-lg h-8 gap-1 text-xs"
                        onClick={() => setBulkStatusOpen("draft")}>
                        <EyeOff className="w-3.5 h-3.5" /> Draft
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-lg h-8 gap-1 text-xs text-destructive"
                        onClick={() => setBulkDeleteOpen(true)}>
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                    </Button>
                    <Button variant="ghost" size="sm" className="rounded-lg h-8 ml-auto"
                        onClick={() => setSelectedIds(new Set())}>
                        Clear
                    </Button>
                </div>
            )}

            {/* Content */}
            {isLoading ? (
                view === "list" ? (
                    <div className="space-y-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Skeleton key={i} className="h-14 w-full rounded-lg" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <Skeleton key={i} className="h-56 w-full rounded-xl" />
                        ))}
                    </div>
                )
            ) : error ? (
                <Card className="border-destructive/20">
                    <CardContent className="flex flex-col items-center justify-center py-16 gap-3">
                        <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                            <AlertCircle className="w-6 h-6 text-destructive" />
                        </div>
                        <p className="text-sm font-medium text-destructive">{error}</p>
                        <Button variant="outline" className="rounded-lg" onClick={fetchItems}>Retry</Button>
                    </CardContent>
                </Card>
            ) : filteredItems.length === 0 ? (
                <Card className="border-border/40">
                    <CardContent className="flex flex-col items-center justify-center py-16 gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
                            <Image className="w-7 h-7 text-muted-foreground/50" />
                        </div>
                        <p className="text-sm font-medium">No portfolio items found</p>
                        <p className="text-xs text-muted-foreground">Create your first portfolio item to showcase your work</p>
                        <Button asChild className="rounded-lg mt-2">
                            <Link href="/dashboard/portfolio/new"><Plus className="w-4 h-4 mr-2" /> New Item</Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : view === "list" ? (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={filteredItems.map(i => i.id)} strategy={verticalListSortingStrategy}>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-10">
                                        <button onClick={handleSelectAll}>
                                            {selectedIds.size === filteredItems.length && filteredItems.length > 0
                                                ? <CheckSquare className="w-4 h-4 text-primary" />
                                                : <Square className="w-4 h-4 text-muted-foreground" />}
                                        </button>
                                    </TableHead>
                                    <TableHead className="cursor-pointer" onClick={() => handleSort("title")}>
                                        <span className="flex items-center">Project <SortIcon field="title" /></span>
                                    </TableHead>
                                    <TableHead className="cursor-pointer" onClick={() => handleSort("category")}>
                                        <span className="flex items-center">Category <SortIcon field="category" /></span>
                                    </TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="cursor-pointer" onClick={() => handleSort("createdAt")}>
                                        <span className="flex items-center">Created <SortIcon field="createdAt" /></span>
                                    </TableHead>
                                    <TableHead className="w-10" />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredItems.map((item) => (
                                    <SortablePortfolioRow key={item.id} item={item} view="list"
                                        isSelected={selectedIds.has(item.id)}
                                        onToggleSelect={handleToggleSelect}
                                        onToggleFeatured={handleToggleFeatured}
                                        onToggleStatus={handleToggleStatus}
                                        onEdit={handleEdit}
                                        onDelete={(i: PortfolioItem) => setDeleteId(i.id)} />
                                ))}
                            </TableBody>
                        </Table>
                    </SortableContext>
                </DndContext>
            ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={filteredItems.map(i => i.id)} strategy={verticalListSortingStrategy}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredItems.map((item) => (
                                <SortablePortfolioRow key={item.id} item={item} view="grid"
                                    isSelected={selectedIds.has(item.id)}
                                    onToggleSelect={handleToggleSelect}
                                    onToggleFeatured={handleToggleFeatured}
                                    onToggleStatus={handleToggleStatus}
                                    onEdit={handleEdit}
                                    onDelete={(i: PortfolioItem) => setDeleteId(i.id)} />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            )}

            {/* Quick Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={(v) => { if (!v) { setIsDialogOpen(false); setEditingItem(null); } }}>
                <DialogContent className="rounded-xl border-border/50 max-w-2xl max-h-[90vh] overflow-y-auto p-6">
                    <DialogHeader>
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                            {editingItem ? <Edit3 className="w-5 h-5 text-primary" /> : <Plus className="w-5 h-5 text-primary" />}
                        </div>
                        <DialogTitle>{editingItem ? "Edit Portfolio Item" : "New Portfolio Item"}</DialogTitle>
                        <DialogDescription>
                            {editingItem ? "Update the portfolio item details below" : "Fill in the details for a new portfolio item"}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSave} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium">Title <span className="text-destructive">*</span></Label>
                                <Input className="rounded-lg h-9" value={formData.title}
                                    onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))} />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium">Slug</Label>
                                <Input placeholder="auto-generated" className="rounded-lg h-9 font-mono text-xs" value={formData.slug}
                                    onChange={(e) => setFormData(p => ({ ...p, slug: e.target.value }))} />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium">Category <span className="text-destructive">*</span></Label>
                                <Input className="rounded-lg h-9" value={formData.category}
                                    onChange={(e) => setFormData(p => ({ ...p, category: e.target.value }))} />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium">Client <span className="text-destructive">*</span></Label>
                                <Input className="rounded-lg h-9" value={formData.client}
                                    onChange={(e) => setFormData(p => ({ ...p, client: e.target.value }))} />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium">Description <span className="text-destructive">*</span></Label>
                            <Textarea className="rounded-lg min-h-[80px] resize-none" value={formData.description}
                                onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))} />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium">Long Description</Label>
                            <Textarea className="rounded-lg min-h-[120px] resize-none" value={formData.longDescription}
                                onChange={(e) => setFormData(p => ({ ...p, longDescription: e.target.value }))} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium">Cover Image</Label>
                                <div onClick={() => fileInputRef.current?.click()}
                                    className="rounded-xl h-28 bg-background/50 border-2 border-dashed border-border/50 hover:border-primary/40 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer overflow-hidden relative">
                                    {previewUrl || image ? (
                                        <img src={previewUrl || image} alt="" className="absolute inset-0 w-full h-full object-cover" />
                                    ) : (
                                        <><div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                            <Upload className="w-5 h-5 text-primary" />
                                        </div><span className="text-xs text-muted-foreground">Click to upload</span></>
                                    )}
                                    {isUploading && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                            <Loader2 className="w-6 h-6 animate-spin text-white" />
                                        </div>
                                    )}
                                </div>
                                <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); }} />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium">Tags</Label>
                                <div className="relative">
                                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input className="rounded-lg h-9 pl-10" value={formData.tags}
                                        onChange={(e) => setFormData(p => ({ ...p, tags: e.target.value }))} />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium">Demo URL</Label>
                                <Input placeholder="https://..." className="rounded-lg h-9" value={formData.demoUrl}
                                    onChange={(e) => setFormData(p => ({ ...p, demoUrl: e.target.value }))} />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium">Order</Label>
                                <Input type="number" className="rounded-lg h-9" value={formData.order}
                                    onChange={(e) => setFormData(p => ({ ...p, order: Number(e.target.value) }))} />
                            </div>
                        </div>
                        <div className="border-t border-border/50 pt-4">
                            <StatsEditor value={dialogStats} onChange={setDialogStats} />
                        </div>
                        <div className="border-t border-border/50 pt-4">
                            <ScreenshotsUpload screenshots={screenshots} onChange={setScreenshots} />
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-3">
                                <Switch id="quick-featured" checked={formData.featured}
                                    onCheckedChange={(v) => setFormData(p => ({ ...p, featured: v }))} />
                                <Label htmlFor="quick-featured" className="text-sm cursor-pointer">Featured</Label>
                            </div>
                            <div className="flex items-center gap-3">
                                <Switch id="quick-published" checked={formData.status === "published"}
                                    onCheckedChange={(v) => setFormData(p => ({ ...p, status: v ? "published" : "draft" }))} />
                                <Label htmlFor="quick-published" className="text-sm cursor-pointer">Published</Label>
                            </div>
                        </div>
                        <DialogFooter className="flex gap-2">
                            <Button type="button" variant="ghost" className="rounded-lg h-9"
                                onClick={() => { setIsDialogOpen(false); setEditingItem(null); }}>Cancel</Button>
                            <Button type="submit" className="rounded-lg h-9 px-6 shadow-lg shadow-primary/30 font-medium"
                                disabled={isSaving}>
                                {isSaving ? "Saving..." : editingItem ? "Update" : "Create"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <DialogContent className="rounded-xl border-border/50 max-w-[400px] p-6">
                    <DialogHeader className="flex flex-col items-center text-center gap-2">
                        <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                            <Trash2 className="w-6 h-6 text-destructive" />
                        </div>
                        <DialogTitle className="text-lg font-semibold">Delete portfolio item?</DialogTitle>
                        <DialogDescription className="text-sm text-destructive">This action cannot be undone</DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex-col sm:flex-col gap-2">
                        <Button className="w-full bg-destructive hover:bg-destructive/90 rounded-lg h-9 text-sm font-medium"
                            onClick={handleDelete}>Delete</Button>
                        <Button variant="ghost" className="w-full rounded-lg h-9"
                            onClick={() => setDeleteId(null)}>Cancel</Button>
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
                        <DialogTitle>Delete {selectedIds.size} items?</DialogTitle>
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
                            {bulkStatusOpen === "published" ? <Eye className="w-6 h-6 text-primary" /> : <EyeOff className="w-6 h-6 text-primary" />}
                        </div>
                        <DialogTitle>{bulkStatusOpen === "published" ? "Publish" : "Draft"} {selectedIds.size} items?</DialogTitle>
                    </DialogHeader>
                    <DialogFooter className="flex-col gap-2">
                        <Button className="w-full rounded-lg" onClick={() => bulkStatusOpen && handleBulkStatus(bulkStatusOpen)}>
                            {bulkStatusOpen === "published" ? "Publish All" : "Draft All"}
                        </Button>
                        <Button variant="ghost" className="w-full rounded-lg" onClick={() => setBulkStatusOpen(null)}>Cancel</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Pagination */}
            <div className="flex items-center justify-between py-2">
                <p className="text-sm text-muted-foreground">{items.length} items</p>
                <div className="flex gap-1">
                    <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg"
                        disabled={currentPage === 0} onClick={() => setCurrentPage(p => p - 1)}>
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg"
                        disabled={items.length < ITEMS_PER_PAGE} onClick={() => setCurrentPage(p => p + 1)}>
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default withRoleProtection(PortfolioPage, ["Admin", "SuperAdmin"]);

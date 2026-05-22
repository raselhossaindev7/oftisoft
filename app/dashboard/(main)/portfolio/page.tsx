"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
    Search,
    Plus,
    Download,
    Star,
    Trash2,
    RefreshCw,
    SearchX,
    MoreVertical,
    Pencil,
    Layers,
    ImageIcon,
    Eye,
    EyeOff,
    FolderKanban,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { portfolioAPI, PortfolioItem } from "@/lib/api";
import { toast } from "sonner";
import { withRoleProtection } from "@/components/auth/role-guard";

const defaultForm = {
    title: "",
    slug: "",
    category: "",
    client: "",
    description: "",
    longDescription: "",
    image: "",
    tags: "",
    gradient: "",
    featured: false,
    status: "draft",
    order: 0,
};

function PortfolioPage() {
    const [items, setItems] = useState<PortfolioItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeSegment, setActiveSegment] = useState("All Items");
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
    const [formData, setFormData] = useState(defaultForm);
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

    const fetchItems = useCallback(async (search?: string) => {
        setIsLoading(true);
        try {
            const data = await portfolioAPI.getAll();
            setItems(data);
        } catch {
            toast.error("Failed to load portfolio items");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await fetchItems();
        setIsRefreshing(false);
        toast.success("Portfolio matrix synchronized");
    };

    const filteredItems = (() => {
        const q = searchQuery.toLowerCase();
        let filtered = items;
        if (q) {
            filtered = filtered.filter(
                (i) =>
                    (i.title || '').toLowerCase().includes(q) ||
                    (i.category || '').toLowerCase().includes(q) ||
                    (i.client || '').toLowerCase().includes(q)
            );
        }
        switch (activeSegment) {
            case "Published":
                return filtered.filter((i) => i.status === "published");
            case "Draft":
                return filtered.filter((i) => i.status === "draft");
            case "Featured":
                return filtered.filter((i) => i.featured);
            default:
                return filtered;
        }
    })();

    const handleExport = () => {
        if (filteredItems.length === 0) {
            toast.info("No items to export for current segment.");
            return;
        }
        const headers = ["Title", "Category", "Client", "Status", "Featured", "Created"];
        const rows = filteredItems.map((i) =>
            [
                i.title.replace(/"/g, '""'),
                i.category.replace(/"/g, '""'),
                i.client.replace(/"/g, '""'),
                i.status,
                i.featured ? "Yes" : "No",
                new Date(i.createdAt).toISOString(),
            ]
                .map((c) => `"${c}"`)
                .join(",")
        );
        const csv = [headers.join(","), ...rows].join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `portfolio-export-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Portfolio export downloaded");
    };

    const openCreate = () => {
        setEditingItem(null);
        setFormData(defaultForm);
        setPreviewUrl(null);
        setUploadProgress(0);
        setIsUploading(false);
        setIsDialogOpen(true);
    };

    const openEdit = (item: PortfolioItem) => {
        setEditingItem(item);
        setFormData({
            title: item.title,
            slug: item.slug,
            category: item.category,
            client: item.client,
            description: item.description,
            longDescription: item.longDescription || "",
            image: item.image || "",
            tags: (item.tags || []).join(", "),
            gradient: item.gradient || "",
            featured: item.featured,
            status: item.status,
            order: item.order,
        });
        setPreviewUrl(null);
        setUploadProgress(0);
        setIsUploading(false);
        setIsDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const payload = {
                ...formData,
                tags: formData.tags
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean),
                order: Number(formData.order),
            };
            if (editingItem) {
                await portfolioAPI.update(editingItem.id, payload);
                toast.success("Portfolio item updated");
            } else {
                await portfolioAPI.create(payload);
                toast.success("Portfolio item created");
            }
            setIsDialogOpen(false);
            setEditingItem(null);
            setFormData(defaultForm);
            await fetchItems();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to save portfolio item");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await portfolioAPI.delete(deleteId);
            toast.success("Portfolio item deleted");
            setDeleteId(null);
            await fetchItems();
        } catch {
            toast.error("Failed to delete portfolio item");
        }
    };

    const getStatusBadge = (status: string) => {
        if (status === "published") {
            return (
                <Badge className="bg-green-500/10 text-green-500 border-green-500/20 gap-1 rounded-lg">
                    <Eye className="w-3 h-3" /> Published
                </Badge>
            );
        }
        return (
            <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 gap-1 rounded-lg">
                <EyeOff className="w-3 h-3" /> Draft
            </Badge>
        );
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-semibold">Portfolio Management</h1>
                    <p className="text-muted-foreground font-medium">Curate, create, and organize your project showcase.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button variant="outline"
                        className="gap-2 rounded-xl h-11 border-border/50 bg-card/50 backdrop-blur-sm"
                        onClick={handleRefresh}
                    >
                        <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
                        Fast Sync
                    </Button>
                    <Button variant="outline"
                        className="gap-2 rounded-xl h-11 border-border/50 bg-card/50 backdrop-blur-sm"
                        onClick={handleExport}
                    >
                        <Download className="w-4 h-4" />
                        Export
                    </Button>
                    <Button className="gap-2 rounded-xl h-11 shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 px-8 font-semibold"
                        onClick={openCreate}
                    >
                        <Plus className="w-4 h-4" />
                        Add Item
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Total Items", value: items.length, color: "", bg: "bg-primary/10", text: "text-primary", hover: "hover:border-primary/30", icon: Layers, sub: "Portfolio Entries", featured: false },
                    { label: "Published", value: items.filter(i => i.status === "published").length, color: "text-green-500", bg: "bg-green-500/10", text: "text-green-500", hover: "hover:border-green-500/30", icon: Eye, sub: "Live Projects", featured: false },
                    { label: "Draft", value: items.filter(i => i.status === "draft").length, color: "text-amber-500", bg: "bg-amber-500/10", text: "text-amber-500", hover: "hover:border-amber-500/30", icon: FolderKanban, sub: "In Progress", featured: false },
                    { label: "Featured", value: items.filter(i => i.featured).length, color: "text-white", bg: "bg-white/20", text: "text-white", hover: "", icon: Star, sub: "Showcased Projects", featured: true },
                ].map((s, i) => (
                    <Card key={i} className={cn(
                        "border-border/50 bg-card/40 backdrop-blur-md rounded-[2.5rem] overflow-hidden group transition-all h-full flex flex-col",
                        s.featured ? "bg-primary shadow-xl shadow-primary/20 border-none relative" : s.hover
                    )}>
                        {s.featured && <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:scale-125 transition-transform" />}
                        <CardHeader className="flex flex-row items-center justify-between pb-1 p-5">
                            <CardTitle className={cn("text-sm font-semibold ", s.featured ? "text-primary-foreground/70" : "text-muted-foreground")}>{s.label}</CardTitle>
                            <div className={cn("p-1.5 rounded-xl group-hover:scale-110 transition-transform", s.bg, s.text)}>
                                <s.icon className="h-4 w-4" />
                            </div>
                        </CardHeader>
                        <CardContent className={cn("p-5 pt-0 flex-1", s.featured && "relative z-10")}>
                            <div className={cn("text-3xl font-semibold", s.color)}>{s.value}</div>
                            <p className={cn("text-xs  mt-2 font-semibold opacity-60", s.color || "text-muted-foreground")}>{s.sub}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid lg:grid-cols-4 gap-8">
                {/* Sidebar Filters */}
                <div className="space-y-6">
                    <Card className="border-border/50 h-fit rounded-[2.5rem] overflow-hidden shadow-sm bg-card/40 backdrop-blur-md">
                        <CardHeader className="p-8 pb-4">
                            <CardTitle className="text-sm font-semibold  text-muted-foreground">Portfolio Filters</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <div className="flex flex-col gap-1">
                                {[
                                    { name: "All Items", count: items.length },
                                    { name: "Published", count: items.filter((i) => i.status === "published").length },
                                    { name: "Draft", count: items.filter((i) => i.status === "draft").length },
                                    { name: "Featured", count: items.filter((i) => i.featured).length },
                                ].map((segment) => (
                                    <button key={segment.name}
                                        onClick={() => setActiveSegment(segment.name)}
                                        className={cn(
                                            "flex items-center justify-between px-6 py-4 rounded-2xl text-sm transition-all group",
                                            activeSegment === segment.name
                                                ? "bg-primary text-white font-semibold shadow-lg shadow-primary/20"
                                                : "text-muted-foreground font-semibold hover:bg-primary/5 hover:text-primary"
                                        )}
                                    >
                                        <span className=" ">{segment.name}</span>
                                        <span className={cn(
                                                "px-2 py-0.5 rounded-lg text-xs font-semibold",
                                                activeSegment === segment.name
                                                    ? "bg-white/20 text-white"
                                                    : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                                            )}
                                        >
                                            {segment.count}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border/50 bg-primary/5 rounded-[2.5rem] border-dashed p-4">
                        <CardHeader className="p-6">
                            <CardTitle className="text-sm font-semibold  flex items-center gap-2">
                                <ImageIcon className="w-4 h-4 text-primary" /> Media Protocol
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-6 pb-6 pt-0 space-y-4">
                            <p className="text-sm font-semibold text-muted-foreground leading-relaxed  opacity-70">
                                Portfolio assets are optimized and cached via CDN. Featured items appear on the homepage showcase.
                            </p>
                            <Button variant="outline"
                                className="w-full rounded-[1.2rem] bg-background text-sm h-10 font-semibold border-primary/20 text-primary hover:bg-primary hover:text-white transition-all"
                                onClick={handleRefresh}
                            >
                                SYNC ASSETS
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Portfolio Table */}
                <div className="lg:col-span-3 space-y-4">
                    <Card className="border-border/50 rounded-2xl overflow-hidden shadow-sm">
                        <CardHeader className="p-6 border-b border-border/50 bg-muted/5">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="relative flex-1 max-w-sm">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input placeholder="Search by title, category, client..."
                                        className="pl-10 h-11 rounded-xl bg-background font-medium"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {isLoading && items.length === 0 ? (
                                <div className="py-32 flex flex-col items-center justify-center gap-6">
                                    <div className="relative">
                                        <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                                        <RefreshCw className="h-10 w-10 text-primary animate-spin relative z-10" />
                                    </div>
                                    <p className="text-sm text-primary font-semibold  animate-pulse">
                                        Loading Portfolio Stream...
                                    </p>
                                </div>
                            ) : filteredItems.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-32 bg-muted/5">
                                    <div className="w-20 h-20 rounded-[2rem] bg-muted/20 flex items-center justify-center mb-6">
                                        <SearchX className="h-10 w-10 text-muted-foreground/30" />
                                    </div>
                                    <h3 className="text-2xl font-semibold">No Records Found</h3>
                                    <p className="text-muted-foreground text-sm font-semibold  max-w-xs text-center mt-3 opacity-60">
                                        The current query or segment returned no entries.
                                    </p>
                                    <Button variant="outline"
                                        className="mt-8 rounded-[1.2rem] font-semibold text-sm border-primary/20 text-primary px-10 h-11 hover:bg-primary hover:text-white transition-all"
                                        onClick={() => {
                                            setSearchQuery("");
                                            setActiveSegment("All Items");
                                        }}
                                    >
                                        RESET FILTERS
                                    </Button>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/10 hover:bg-transparent border-b border-border/50">
                                            <TableHead className="font-semibold  text-sm px-6 h-auto">
                                                Title
                                            </TableHead>
                                            <TableHead className="font-semibold  text-sm h-auto">
                                                Category
                                            </TableHead>
                                            <TableHead className="font-semibold  text-sm h-auto">
                                                Client
                                            </TableHead>
                                            <TableHead className="font-semibold  text-sm h-auto">
                                                Status
                                            </TableHead>
                                            <TableHead className="font-semibold  text-sm h-auto">
                                                Featured
                                            </TableHead>
                                            <TableHead className="font-semibold  text-sm h-auto">
                                                Created
                                            </TableHead>
                                            <TableHead className="text-right font-semibold  text-sm px-6 h-auto">
                                                Actions
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredItems.map((item) => (
                                            <TableRow key={item.id}
                                                className="group hover:bg-primary/[0.02] transition-all border-b border-border/20"
                                            >
                                                <TableCell className="px-6 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center overflow-hidden border border-border/30">
                                                            {item.image ? (
                                                                <img src={item.image}
                                                                    alt={item.title}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <ImageIcon className="w-5 h-5 text-primary" />
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="font-semibold text-sm">
                                                                {item.title}
                                                            </span>
                                                            <span className="text-sm text-muted-foreground font-semibold  opacity-60">
                                                                {item.slug}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-sm font-semibold">{item.category}</span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-sm font-semibold">{item.client}</span>
                                                </TableCell>
                                                <TableCell>{getStatusBadge(item.status)}</TableCell>
                                                <TableCell>
                                                    {item.featured ? (
                                                        <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                                                    ) : (
                                                        <Star className="w-4 h-4 text-muted-foreground/30" />
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col gap-1">
                                                        <div className="text-sm font-semibold">
                                                            {new Date(item.createdAt).toLocaleDateString()}
                                                        </div>
                                                        <div className="text-xs font-semibold  text-muted-foreground">
                                                            {new Date(item.createdAt).toLocaleTimeString([], {
                                                                hour: "2-digit",
                                                                minute: "2-digit",
                                                            })}{" "}
                                                            UTC
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right px-6">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost"
                                                                size="icon"
                                                                className="h-10 w-10 rounded-2xl hover:bg-muted/50"
                                                            >
                                                                <MoreVertical className="h-5 w-5" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end"
                                                            className="w-64 rounded-[1.5rem] p-2 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.2)] border-border/50 backdrop-blur-xl"
                                                        >
                                                            <DropdownMenuLabel className="text-sm font-semibold  text-muted-foreground px-3 py-2">
                                                                Item Actions
                                                            </DropdownMenuLabel>
                                                            <DropdownMenuItem className="gap-3 cursor-pointer rounded-xl font-semibold py-3 text-xs"
                                                                onClick={() => openEdit(item)}
                                                            >
                                                                <Pencil className="w-4 h-4 text-primary" /> EDIT ENTRY
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator className="my-2 opacity-50" />
                                                            <DropdownMenuItem className="gap-3 text-destructive focus:bg-destructive/10 cursor-pointer rounded-xl font-semibold py-3 text-xs"
                                                                onClick={() => setDeleteId(item.id)}
                                                            >
                                                                <Trash2 className="w-4 h-4" /> Delete Item
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
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

            {/* Create / Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-3xl rounded-[2.5rem] border-border/40 bg-card/60 backdrop-blur-xl shadow-2xl p-0 flex flex-col max-h-[85vh]">
                    <DialogHeader className="p-8 pb-4 shrink-0">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                            <Layers className="w-7 h-7 text-primary" />
                        </div>
                        <DialogTitle className="text-3xl font-semibold  ">
                            {editingItem ? "Edit Portfolio Entry" : "New Portfolio Entry"}
                        </DialogTitle>
                        <DialogDescription className="text-sm font-semibold  opacity-60 mt-1">
                            {editingItem
                                ? "Modify the project showcase metadata below."
                                : "Register a new project in the showcase directory."}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-8 space-y-5 pb-4" data-lenis-prevent>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="title" className="text-sm font-semibold  ml-1 opacity-70">Title</Label>
                                <Input id="title"
                                    placeholder="Project Name"
                                    className="rounded-[1.2rem] h-12 bg-background/50 border-border/50 font-semibold"
                                    required value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="slug" className="text-sm font-semibold  ml-1 opacity-70">Slug</Label>
                                <Input id="slug"
                                    placeholder="project-name"
                                    className="rounded-[1.2rem] h-12 bg-background/50 border-border/50 font-semibold"
                                    required value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="category" className="text-sm font-semibold  ml-1 opacity-70">Category</Label>
                                <Input id="category"
                                    placeholder="Web App"
                                    className="rounded-[1.2rem] h-12 bg-background/50 border-border/50 font-semibold"
                                    required value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="client" className="text-sm font-semibold  ml-1 opacity-70">Client</Label>
                                <Input id="client"
                                    placeholder="Client Name"
                                    className="rounded-[1.2rem] h-12 bg-background/50 border-border/50 font-semibold"
                                    required value={formData.client}
                                    onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-sm font-semibold  ml-1 opacity-70">Description</Label>
                            <Textarea id="description"
                                placeholder="Short project summary..."
                                className="rounded-[1.2rem] bg-background/50 border-border/50 font-semibold min-h-[80px]"
                                required value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="longDescription" className="text-sm font-semibold  ml-1 opacity-70">Long Description</Label>
                            <Textarea id="longDescription"
                                placeholder="Detailed project overview..."
                                className="rounded-[1.2rem] bg-background/50 border-border/50 font-semibold min-h-[100px]"
                                value={formData.longDescription}
                                onChange={(e) => setFormData({ ...formData, longDescription: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold  ml-1 opacity-70">Image</Label>
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="relative rounded-[1.2rem] h-36 bg-background/50 border-2 border-dashed border-border/50 hover:border-primary/40 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer overflow-hidden"
                                >
                                    {previewUrl || formData.image ? (
                                        <img
                                            src={previewUrl || formData.image}
                                            alt="Preview"
                                            className="absolute inset-0 w-full h-full object-cover"
                                        />
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
                                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleImageUpload(file); }} />
                                {formData.image && !previewUrl && (
                                    <p className="text-xs text-muted-foreground truncate">{formData.image}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="gradient" className="text-sm font-semibold  ml-1 opacity-70">Gradient</Label>
                                <Input id="gradient"
                                    placeholder="from-blue-500 to-purple-600"
                                    className="rounded-[1.2rem] h-12 bg-background/50 border-border/50 font-semibold"
                                    value={formData.gradient}
                                    onChange={(e) => setFormData({ ...formData, gradient: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="tags" className="text-sm font-semibold  ml-1 opacity-70">Tags</Label>
                                <Input id="tags"
                                    placeholder="react, node, typescript"
                                    className="rounded-[1.2rem] h-12 bg-background/50 border-border/50 font-semibold"
                                    value={formData.tags}
                                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="order" className="text-sm font-semibold  ml-1 opacity-70">Order</Label>
                                <Input id="order"
                                    type="number"
                                    placeholder="0"
                                    className="rounded-[1.2rem] h-12 bg-background/50 border-border/50 font-semibold"
                                    value={formData.order}
                                    onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="status" className="text-sm font-semibold  ml-1 opacity-70">Status</Label>
                                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                                    <SelectTrigger className="rounded-[1.2rem] h-12 bg-background/50 border-border/50 font-semibold text-sm ">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl p-1">
                                        <SelectItem value="draft" className="rounded-xl font-semibold text-sm  py-3">Draft</SelectItem>
                                        <SelectItem value="published" className="rounded-xl font-semibold text-sm  py-3">Published</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2 flex flex-col justify-end pb-2">
                                <Label className="text-sm font-semibold  ml-1 opacity-70">Featured</Label>
                                <div className="flex items-center gap-3 h-12 px-1">
                                    <Switch id="featured" checked={formData.featured} onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })} />
                                    <span className="text-sm font-semibold">{formData.featured ? "Showcased on homepage" : "Hidden from showcase"}</span>
                                </div>
                            </div>
                        </div>
                        <DialogFooter className="pt-4 flex gap-3">
                            <Button type="button"
                                variant="ghost"
                                className="rounded-[1.2rem] h-12 px-6 font-semibold text-sm  opacity-60 hover:opacity-100"
                                onClick={() => setIsDialogOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit"
                                className="rounded-[1.2rem] h-12 px-10 font-semibold text-sm  shadow-xl shadow-primary/20 bg-primary hover:scale-[1.02] transition-transform"
                                disabled={isSaving}
                            >
                                {isSaving ? "Saving..." : editingItem ? "Update Entry" : "Create Entry"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <DialogContent className="rounded-[2rem] border-border/50 max-w-[400px]">
                    <DialogHeader className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 rounded-[1.5rem] bg-destructive/10 flex items-center justify-center mb-4">
                            <Trash2 className="w-8 h-8 text-destructive" />
                        </div>
                        <DialogTitle className="text-2xl font-semibold">Purge Entry?</DialogTitle>
                        <DialogDescription className="font-bold  text-sm text-destructive">
                            Critical Security Protocol Required
                        </DialogDescription>
                    </DialogHeader>
                    <div className="p-4 text-center">
                        <p className="text-sm font-medium text-muted-foreground">
                            This will permanently remove the portfolio entry and all associated metadata. This action cannot be, reversed.
                        </p>
                    </div>
                    <DialogFooter className="flex-col sm:flex-col gap-2 pt-4">
                        <Button className="w-full bg-destructive hover:bg-destructive/90 rounded-xl h-auto font-semibold shadow-lg shadow-destructive/20"
                            onClick={handleDelete}
                        >
                            CONFIRM PURGE
                        </Button>
                        <Button variant="ghost"
                            className="w-full rounded-xl h-11 font-bold"
                            onClick={() => setDeleteId(null)}
                        >
                            ABORT MISSION
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default withRoleProtection(PortfolioPage, ["Admin", "SuperAdmin"]);

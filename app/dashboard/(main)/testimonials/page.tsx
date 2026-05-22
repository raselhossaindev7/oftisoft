"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
    Star,
    MessageSquare,
    Download,
    Plus,
    Search,
    SearchX,
    RefreshCw,
    MoreVertical,
    Trash2,
    Edit,
    Users,
    Activity,
    Sparkles,
    Quote,
    Eye,
    EyeOff,
    GripVertical,
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
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { testimonialsAPI, Testimonial } from "@/lib/api";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { withRoleProtection } from "@/components/auth/role-guard";

const RATING_OPTIONS = [1, 2, 3, 4, 5];

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "lg" }) {
    const cls = size === "lg" ? "w-5 h-5" : "w-3.5 h-3.5";
    return (
        <div className="flex items-center gap-0.5">
            {RATING_OPTIONS.map((star) => (
                <Star key={star}
                    className={cn(
                        cls, star <= rating
                            ? "fill-amber-500 text-amber-500"
                            : "fill-none text-muted-foreground/30"
                    )}
                />
            ))}
        </div>
    );
}

const defaultForm: Omit<Testimonial, "id" | "createdAt" | "updatedAt"> = {
    name: "",
    role: "",
    company: "",
    quote: "",
    avatar: "",
    rating: 5,
    gradient: "",
    isActive: true,
    order: 0,
};

function TestimonialsPage() {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeSegment, setActiveSegment] = useState("All");
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
    const [formData, setFormData] = useState(defaultForm);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchTestimonials = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await testimonialsAPI.getAll();
            setTestimonials(data);
        } catch {
            toast.error("Failed to load testimonials");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTestimonials();
    }, [fetchTestimonials]);

    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        await fetchTestimonials();
        setIsRefreshing(false);
        toast.success("Testimonial matrix synchronized");
    }, [fetchTestimonials]);

    const filteredTestimonials = (() => {
        let list = testimonials;
        if (activeSegment === "Active") list = list.filter((t) => t.isActive);
        if (activeSegment === "Inactive") list = list.filter((t) => !t.isActive);
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            list = list.filter(
                (t) =>
                    (t.name || '').toLowerCase().includes(q) ||
                    (t.company || "").toLowerCase().includes(q) ||
                    (t.quote || '').toLowerCase().includes(q)
            );
        }
        return list;
    })();

    const highRatedCount = testimonials.filter((t) => t.rating >= 4).length;

    const handleExport = useCallback(() => {
        if (filteredTestimonials.length === 0) {
            toast.info("No testimonials to export for current filter.");
            return;
        }
        const headers = ["Name", "Role", "Company", "Quote", "Rating", "Status", "Order", "Created"];
        const rows = filteredTestimonials.map((t) =>
            [
                t.name,
                t.role || "",
                t.company || "",
                t.quote.replace(/"/g, '""'),
                t.rating,
                t.isActive ? "Active" : "Inactive",
                t.order,
                new Date(t.createdAt).toISOString(),
            ]
                .map((c) => `"${c}"`)
                .join(",")
        );
        const csv = [headers.join(","), ...rows].join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `testimonials-export-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Testimonial export downloaded");
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
            name: t.name,
            role: t.role || "",
            company: t.company || "",
            quote: t.quote,
            avatar: t.avatar || "",
            rating: t.rating,
            gradient: t.gradient || "",
            isActive: t.isActive,
            order: t.order,
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
            await fetchTestimonials();
            toast.success("Testimonial permanently removed");
        } catch {
            toast.error("Failed to delete testimonial");
        }
    }, [deleteId, fetchTestimonials]);

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

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-semibold">Testimonials Management</h1>
                    <p className="text-muted-foreground font-medium">Manage client testimonials, ratings, and social proof content.</p>
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
                        onClick={openAdd}
                    >
                        <Plus className="w-4 h-4" />
                        Add Testimonial
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-border/50 bg-card/40 backdrop-blur-md rounded-[2.5rem] overflow-hidden group hover:border-primary/30 transition-all h-full flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between pb-1 p-5">
                        <CardTitle className="text-sm font-semibold uppercase text-muted-foreground">Total Testimonials</CardTitle>
                        <div className="p-1.5 rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                            <MessageSquare className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-5 pt-0 flex-1">
                        <div className="text-3xl font-semibold">{testimonials.length}</div>
                        <p className="text-xs text-muted-foreground uppercase mt-2 font-semibold opacity-60">Total Registered</p>
                    </CardContent>
                </Card>
                <Card className="border-border/50 bg-card/40 backdrop-blur-md rounded-[2.5rem] overflow-hidden group hover:border-green-500/30 transition-all h-full flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between pb-1 p-5">
                        <CardTitle className="text-sm font-semibold uppercase text-muted-foreground">Active</CardTitle>
                        <div className="p-1.5 rounded-xl bg-green-500/10 text-green-500 group-hover:scale-110 transition-transform">
                            <Activity className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-5 pt-0 flex-1">
                        <div className="text-3xl font-semibold text-green-500">{testimonials.filter((t) => t.isActive).length}</div>
                        <p className="text-xs text-green-500/60 uppercase mt-2 font-semibold">Active</p>
                    </CardContent>
                </Card>
                <Card className="border-border/50 bg-card/40 backdrop-blur-md rounded-[2.5rem] overflow-hidden group hover:border-amber-500/30 transition-all h-full flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between pb-1 p-5">
                        <CardTitle className="text-sm font-semibold uppercase text-muted-foreground">High Rated</CardTitle>
                        <div className="p-1.5 rounded-xl bg-amber-500/10 text-amber-500 group-hover:scale-110 transition-transform">
                            <Sparkles className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-5 pt-0 flex-1">
                        <div className="text-3xl font-semibold text-amber-500">{highRatedCount}</div>
                        <p className="text-xs text-amber-500/60 uppercase mt-2 font-semibold">Featured / 4+ Stars</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            <div className="grid lg:grid-cols-4 gap-8">
                {/* Sidebar Filters */}
                <div className="space-y-6">
                    <Card className="border-border/50 h-fit rounded-[2.5rem] overflow-hidden shadow-sm bg-card/40 backdrop-blur-md">
                        <CardHeader className="p-8 pb-4">
                            <CardTitle className="text-sm font-semibold uppercase text-muted-foreground">Filters</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <div className="flex flex-col gap-1">
                                {[
                                    { name: "All", count: testimonials.length },
                                    { name: "Active", count: testimonials.filter((t) => t.isActive).length },
                                    { name: "Inactive", count: testimonials.filter((t) => !t.isActive).length },
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
                                        <span className=" uppercase">{segment.name}</span>
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
                            <CardTitle className="text-sm font-semibold uppercase flex items-center gap-2">
                                <Quote className="w-4 h-4 text-primary" /> Social Proof
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-6 pb-6 pt-0 space-y-4">
                            <p className="text-sm font-semibold text-muted-foreground leading-relaxed uppercase opacity-70">
                                Testimonials are displayed on the homepage and landing sections. Active items with high ratings are prioritized.
                            </p>
                            <Button variant="outline"
                                className="w-full rounded-[1.2rem] bg-background text-sm h-10 font-semibold border-primary/20 text-primary hover:bg-primary hover:text-white transition-all"
                                onClick={handleRefresh}
                            >
                                SYNC NOW
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Table */}
                <div className="lg:col-span-3 space-y-4">
                    <Card className="border-border/50 rounded-2xl overflow-hidden shadow-sm">
                        <CardHeader className="p-6 border-b border-border/50 bg-muted/5">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="relative flex-1 max-w-sm">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input placeholder="Search by name, company, quote..."
                                        className="pl-10 h-11 rounded-xl bg-background font-medium"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
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
                                    <p className="text-sm text-primary font-semibold uppercase animate-pulse">Loading Testimonials...</p>
                                </div>
                            ) : filteredTestimonials.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-32 bg-muted/5">
                                    <div className="w-20 h-20 rounded-[2rem] bg-muted/20 flex items-center justify-center mb-6">
                                        <SearchX className="h-10 w-10 text-muted-foreground/30" />
                                    </div>
                                    <h3 className="text-2xl font-semibold">No Records Found</h3>
                                    <p className="text-muted-foreground text-sm font-semibold uppercase max-w-xs text-center mt-3 opacity-60">
                                        The current query or filter returned no testimonials.
                                    </p>
                                    <Button variant="outline"
                                        className="mt-8 rounded-[1.2rem] font-semibold text-sm border-primary/20 text-primary px-10 h-11 hover:bg-primary hover:text-white transition-all"
                                        onClick={() => {
                                            setSearchQuery("");
                                            setActiveSegment("All");
                                        }}
                                    >
                                        RESET FILTERS
                                    </Button>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/10 hover:bg-transparent border-b border-border/50">
                                            <TableHead className="w-[280px] font-semibold uppercase text-sm px-6 h-auto">Name</TableHead>
                                            <TableHead className="font-semibold uppercase text-sm h-auto">Company</TableHead>
                                            <TableHead className="font-semibold uppercase text-sm h-auto">Rating</TableHead>
                                            <TableHead className="font-semibold uppercase text-sm h-auto">Status</TableHead>
                                            <TableHead className="font-semibold uppercase text-sm h-auto">Created</TableHead>
                                            <TableHead className="text-right font-semibold uppercase text-sm px-6 h-auto">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredTestimonials.map((t) => (
                                            <TableRow key={t.id}
                                                className="group hover:bg-primary/[0.02] transition-all border-b border-border/20"
                                            >
                                                <TableCell className="px-6 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <Avatar className="h-10 w-10 border-2 border-background shadow-xl rounded-xl">
                                                            <AvatarImage src={t.avatar} />
                                                            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs rounded-xl">
                                                                {(t.name || "T").split(" ").filter(Boolean).map((n) => n[0]).join("").toUpperCase()}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex flex-col">
                                                            <span className="font-semibold text-sm">{t.name}</span>
                                                            {t.role && (
                                                                <span className="text-sm text-muted-foreground font-semibold uppercase opacity-60">
                                                                    {t.role}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-sm font-semibold">{t.company || "—"}</span>
                                                </TableCell>
                                                <TableCell>
                                                    <StarRating rating={t.rating} />
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <div className={cn(
                                                                "w-2 h-2 rounded-full",
                                                                t.isActive
                                                                    ? "bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.6)]"
                                                                    : "bg-muted"
                                                            )}
                                                        />
                                                        <span className="text-xs font-semibold uppercase">
                                                            {t.isActive ? "Active" : "Inactive"}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col gap-1">
                                                        <div className="text-sm font-semibold">
                                                            {new Date(t.createdAt).toLocaleDateString()}
                                                        </div>
                                                        <div className="text-xs font-semibold uppercase text-muted-foreground">
                                                            {new Date(t.createdAt).toLocaleTimeString([], {
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
                                                            <DropdownMenuLabel className="text-sm font-semibold uppercase text-muted-foreground px-3 py-2">
                                                                Actions
                                                            </DropdownMenuLabel>
                                                            <DropdownMenuItem className="gap-3 cursor-pointer rounded-xl font-semibold py-3 text-xs"
                                                                onClick={() => openEdit(t)}
                                                            >
                                                                <Edit className="w-4 h-4 text-primary" /> Edit Testimonial
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator className="my-2 opacity-50" />
                                                            <DropdownMenuItem className="gap-3 text-destructive focus:bg-destructive/10 cursor-pointer rounded-xl font-semibold py-3 text-xs"
                                                                onClick={() => setDeleteId(t.id)}
                                                            >
                                                                <Trash2 className="w-4 h-4" /> Delete
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

            {/* Add/Edit Dialog */}
            <Dialog open={isDialogOpen}
                onOpenChange={(open) => {
                    if (!open) { setEditingTestimonial(null); setIsDialogOpen(false); }
                }}
            >
                <DialogContent className="sm:max-w-3xl rounded-[2.5rem] border-border/40 bg-card/60 backdrop-blur-xl shadow-2xl p-0 flex flex-col max-h-[85vh]">
                    <DialogHeader className="p-8 pb-4 shrink-0">
                        <div className="w-12 h-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                            <Quote className="w-6 h-6 text-primary" />
                        </div>
                        <DialogTitle className="text-2xl font-semibold">
                            {editingTestimonial ? "Edit Testimonial" : "New Testimonial"}
                        </DialogTitle>
                        <DialogDescription className="font-bold">
                            {editingTestimonial
                                ? `Modify testimonial from ${editingTestimonial.name}`
                                : "Create a new client testimonial entry"}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="flex-1 overflow-y-auto px-8 space-y-5 pb-4" data-lenis-prevent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                            <div className="space-y-2">
                                <Label className="font-semibold text-sm uppercase ml-1">
                                    Name <span className="text-destructive">*</span>
                                </Label>
                                <Input placeholder="John Doe"
                                    className="rounded-xl h-auto font-medium"
                                    value={formData.name}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="font-semibold text-sm uppercase ml-1">Role</Label>
                                <Input placeholder="CEO"
                                    className="rounded-xl h-auto font-medium"
                                    value={formData.role}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="font-semibold text-sm uppercase ml-1">Company</Label>
                                <Input placeholder="Acme Inc"
                                    className="rounded-xl h-auto font-medium"
                                    value={formData.company}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, company: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="font-semibold text-sm uppercase ml-1">Rating</Label>
                                <Select value={String(formData.rating)}
                                    onValueChange={(v) => setFormData((prev) => ({ ...prev, rating: Number(v) }))}
                                >
                                    <SelectTrigger className="rounded-xl h-auto font-medium">
                                        <SelectValue placeholder="Select rating" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        {RATING_OPTIONS.map((r) => (
                                            <SelectItem key={r} value={String(r)} className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    <StarRating rating={r} />
                                                    <span className="text-xs font-semibold">{r}/5</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="font-semibold text-sm uppercase ml-1">Avatar</Label>
                                <div onClick={() => fileInputRef.current?.click()}
                                    className="relative rounded-[1.2rem] h-36 bg-background/50 border-2 border-dashed border-border/50 hover:border-primary/40 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer overflow-hidden"
                                >
                                    {previewUrl || formData.avatar ? (
                                        <img src={previewUrl || formData.avatar} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                                    ) : (
                                        <>
                                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <span className="text-xs font-semibold uppercase text-muted-foreground">Click to upload avatar</span>
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
                                    onChange={(e) => { const file = e.target.files?.[0]; if (file) handleAvatarUpload(file); }}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="font-semibold text-sm uppercase ml-1">Gradient</Label>
                                <Input placeholder="from-blue-500 to-purple-600"
                                    className="rounded-xl h-auto font-medium"
                                    value={formData.gradient}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, gradient: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label className="font-semibold text-sm uppercase ml-1">
                                    Quote <span className="text-destructive">*</span>
                                </Label>
                                <Textarea placeholder="The testimonial quote..."
                                    className="rounded-2xl h-32 font-medium resize-none"
                                    value={formData.quote}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, quote: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="font-semibold text-sm uppercase ml-1">Order</Label>
                                <Input type="number"
                                    placeholder="0"
                                    className="rounded-xl h-auto font-medium"
                                    value={formData.order}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, order: Number(e.target.value) }))}
                                />
                            </div>
                            <div className="flex items-end pb-2">
                                <div className="flex items-center gap-3">
                                    <Switch checked={formData.isActive}
                                        onCheckedChange={(v) => setFormData((prev) => ({ ...prev, isActive: v }))}
                                        id="isActive"
                                    />
                                    <Label htmlFor="isActive" className="font-semibold text-sm uppercase cursor-pointer">
                                        {formData.isActive ? "Active" : "Inactive"}
                                    </Label>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="ghost" type="button"
                                className="rounded-xl h-11 font-bold"
                                onClick={() => { setEditingTestimonial(null); setIsDialogOpen(false); }}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" className="rounded-xl h-11 px-8 shadow-lg shadow-primary/30 font-semibold"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Saving..." : editingTestimonial ? "Update Testimonial" : "Create Testimonial"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <DialogContent className="rounded-[2rem] border-border/50 max-w-[400px]">
                    <DialogHeader className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 rounded-[1.5rem] bg-destructive/10 flex items-center justify-center mb-4">
                            <Trash2 className="w-8 h-8 text-destructive" />
                        </div>
                        <DialogTitle className="text-2xl font-semibold">Delete Testimonial?</DialogTitle>
                        <DialogDescription className="font-bold uppercase text-sm text-destructive">
                            This action cannot be undone
                        </DialogDescription>
                    </DialogHeader>
                    <div className="p-4 text-center">
                        <p className="text-sm font-medium text-muted-foreground">
                            This will permanently remove this testimonial and all associated data.
                        </p>
                    </div>
                    <DialogFooter className="flex-col sm:flex-col gap-2 pt-4">
                        <Button className="w-full bg-destructive hover:bg-destructive/90 rounded-xl h-auto font-semibold shadow-lg shadow-destructive/20"
                            onClick={handleDelete}
                        >
                            CONFIRM DELETE
                        </Button>
                        <Button variant="ghost"
                            className="w-full rounded-xl h-11 font-bold"
                            onClick={() => setDeleteId(null)}
                        >
                            CANCEL
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default withRoleProtection(TestimonialsPage, ["Admin", "SuperAdmin"]);


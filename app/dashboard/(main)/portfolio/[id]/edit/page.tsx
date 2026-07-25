"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Edit3, ArrowLeft, Upload, Loader2, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { portfolioAPI, authAPI, type PortfolioItem } from "@/lib/api";
import { toast } from "sonner";
import Link from "next/link";
import StatsEditor from "@/components/dashboard/portfolio/stats-editor";
import ScreenshotsUpload from "@/components/dashboard/portfolio/screenshots-upload";

interface StatEntry { label: string; value: string }

export default function EditPortfolioPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [item, setItem] = useState<PortfolioItem | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [image, setImage] = useState("");
    const [screenshots, setScreenshots] = useState<string[]>([]);
    const [stats, setStats] = useState<StatEntry[]>([]);

    const [formData, setFormData] = useState({
        title: "", slug: "", category: "", client: "", description: "", longDescription: "",
        tags: "", demoUrl: "", status: "draft", featured: false, order: 0,
    });

    useEffect(() => {
        if (!id) return;
        setIsLoading(true);
        portfolioAPI.getOne(id)
            .then((m) => {
                setItem(m);
                setFormData({
                    title: m.title, slug: m.slug, category: m.category, client: m.client,
                    description: m.description, longDescription: m.longDescription || "",
                    tags: Array.isArray(m.tags) ? m.tags.join(", ") : m.tags || "",
                    demoUrl: m.demoUrl || "",
                    status: m.status, featured: m.featured, order: m.order,
                });
                setImage(m.image || "");
                setScreenshots(Array.isArray(m.screenshots) ? m.screenshots : []);
                try { const p = typeof m.stats === 'string' ? JSON.parse(m.stats) : m.stats; setStats(Array.isArray(p) ? p : []); } catch { setStats([]); }
            })
            .catch(() => toast.error("Failed to load item"))
            .finally(() => setIsLoading(false));
    }, [id]);

    const handleImageUpload = async (file: File) => {
        if (!file || !file.type.startsWith("image/")) { toast.error("Please select an image file"); return; }
        setIsUploading(true);
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);
        try {
            const data = await authAPI.uploadAvatar(file);
            setImage(data.avatarUrl || data.avatar || "");
            toast.success("Image uploaded");
        } catch { setPreviewUrl(null); toast.error("Upload failed"); }
        finally { setIsUploading(false); }
    };

    const generateSlug = (title: string) =>
        title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title.trim() || !formData.category.trim() || !formData.client.trim() || !formData.description.trim()) {
            toast.error("Title, category, client, and description are required");
            return;
        }
        const slug = formData.slug.trim() || generateSlug(formData.title);
        setIsSubmitting(true);
        try {
            await portfolioAPI.update(id, {
                ...formData,
                slug,
                image: image || undefined,
                screenshots: screenshots.length > 0 ? screenshots : undefined,
                tags: formData.tags ? formData.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
                stats: stats.length > 0 ? JSON.stringify(stats) : undefined,
                demoUrl: formData.demoUrl || undefined,
            });
            toast.success("Portfolio item updated");
            router.push("/dashboard/portfolio");
        } catch { toast.error("Failed to update"); }
        finally { setIsSubmitting(false); }
    };

    if (isLoading) {
        return (
            <div className="space-y-8">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-xl" />
                    <div><Skeleton className="h-8 w-48" /><Skeleton className="h-4 w-64 mt-2" /></div>
                </div>
                <Card className="border-border/50 max-w-3xl">
                    <CardContent className="p-6 space-y-4">
                        <Skeleton className="h-10 w-full rounded-lg" />
                        <Skeleton className="h-10 w-full rounded-lg" />
                        <Skeleton className="h-24 w-full rounded-lg" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!item) return <div className="text-center py-20"><p className="text-muted-foreground">Item not found</p></div>;

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild className="rounded-xl">
                    <Link href="/dashboard/portfolio"><ArrowLeft className="w-5 h-5" /></Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold">Edit Item</h1>
                    <p className="text-sm text-muted-foreground">Update details for {item.title}</p>
                </div>
            </div>
            <Card className="border-border/50 max-w-3xl">
                <CardHeader>
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                        <Edit3 className="w-5 h-5 text-primary" />
                    </div>
                    <CardTitle>Project Details</CardTitle>
                    <CardDescription>Update the portfolio item information</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium">Title <span className="text-destructive">*</span></Label>
                                <Input className="rounded-lg h-9" value={formData.title}
                                    onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))} />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium">Slug</Label>
                                <Input className="rounded-lg h-9 font-mono text-xs" value={formData.slug}
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
                            <StatsEditor value={stats} onChange={setStats} />
                        </div>
                        <div className="border-t border-border/50 pt-4">
                            <ScreenshotsUpload screenshots={screenshots} onChange={setScreenshots} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-background/30 border border-border/30">
                                <Switch checked={formData.featured}
                                    onCheckedChange={(v) => setFormData(p => ({ ...p, featured: v }))} id="featured" />
                                <Label htmlFor="featured" className="text-sm cursor-pointer">Featured on homepage</Label>
                            </div>
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-background/30 border border-border/30">
                                <Switch checked={formData.status === "published"}
                                    onCheckedChange={(v) => setFormData(p => ({ ...p, status: v ? "published" : "draft" }))} id="status" />
                                <Label htmlFor="status" className="text-sm cursor-pointer">Published</Label>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-4">
                            <Button variant="ghost" className="rounded-lg h-9" asChild>
                                <Link href="/dashboard/portfolio">Cancel</Link>
                            </Button>
                            <Button type="submit" className="rounded-lg h-9 px-6" disabled={isSubmitting}>
                                {isSubmitting ? "Saving..." : "Update Project"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

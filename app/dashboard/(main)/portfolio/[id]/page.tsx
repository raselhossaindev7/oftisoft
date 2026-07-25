"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Edit, Trash2, Eye, EyeOff, Calendar, Folder, User, Tag, Star, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { portfolioAPI, type PortfolioItem } from "@/lib/api";
import { toast } from "sonner";
import Link from "next/link";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

export default function PortfolioDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const [item, setItem] = useState<PortfolioItem | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [deleteOpen, setDeleteOpen] = useState(false);

    useEffect(() => {
        if (!id) return;
        setIsLoading(true);
        portfolioAPI.getOne(id)
            .then(setItem)
            .catch(() => { toast.error("Failed to load item"); router.push("/dashboard/portfolio"); })
            .finally(() => setIsLoading(false));
    }, [id, router]);

    const handleDelete = async () => {
        try {
            await portfolioAPI.delete(id);
            toast.success("Portfolio item deleted");
            router.push("/dashboard/portfolio");
        } catch { toast.error("Failed to delete"); }
    };

    const handleToggleStatus = async () => {
        if (!item) return;
        const newStatus = item.status === "published" ? "draft" : "published";
        try {
            await portfolioAPI.update(id, { status: newStatus });
            setItem(prev => prev ? { ...prev, status: newStatus } : null);
            toast.success(`Item ${newStatus === "published" ? "published" : "drafted"}`);
        } catch { toast.error("Failed to update status"); }
    };

    if (isLoading) {
        return (
            <div className="space-y-8">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-xl" />
                    <div><Skeleton className="h-8 w-64" /><Skeleton className="h-4 w-48 mt-2" /></div>
                </div>
                <Card className="border-border/50"><CardContent className="p-8 space-y-4">
                    <Skeleton className="h-8 w-48" /><Skeleton className="h-32 w-full" />
                </CardContent></Card>
            </div>
        );
    }

    if (!item) return null;

    const tags = Array.isArray(item.tags) ? item.tags : typeof item.tags === "string" && item.tags ? (item.tags as string).split(",").map(t => t.trim()) : [];

    let parsedStats: Record<string, number> | null = null;
    try { if (item.stats) parsedStats = JSON.parse(item.stats); } catch {}

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild className="rounded-xl">
                        <Link href="/dashboard/portfolio"><ArrowLeft className="w-5 h-5" /></Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">{item.title}</h1>
                        <p className="text-sm text-muted-foreground">Portfolio item details</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="gap-2 rounded-xl" onClick={handleToggleStatus}>
                        {item.status === "published" ? <><EyeOff className="w-4 h-4" /> Draft</> : <><Eye className="w-4 h-4" /> Publish</>}
                    </Button>
                    <Button asChild variant="outline" className="gap-2 rounded-xl">
                        <Link href={`/dashboard/portfolio/${id}/edit`}><Edit className="w-4 h-4" /> Edit</Link>
                    </Button>
                    <Button variant="outline" className="gap-2 rounded-xl text-destructive" onClick={() => setDeleteOpen(true)}>
                        <Trash2 className="w-4 h-4" /> Delete
                    </Button>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                <Card className="md:col-span-2 border-border/50">
                    {item.image && (
                        <div className="relative w-full h-48 rounded-t-xl overflow-hidden">
                            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                        </div>
                    )}
                    <CardHeader>
                        <div className="flex items-center gap-3 mb-2">
                            <Badge className="bg-primary/10 text-primary border-primary/20 rounded-md">
                                {item.category}
                            </Badge>
                            <Badge variant={item.status === "published" ? "default" : "secondary"} className="rounded-lg gap-1">
                                {item.status === "published" ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                                {item.status}
                            </Badge>
                            {item.featured && (
                                <Badge variant="outline" className="rounded-lg gap-1 border-amber-400 text-amber-500">
                                    <Star className="w-3 h-3" /> Featured
                                </Badge>
                            )}
                        </div>
                        <CardTitle className="text-2xl">{item.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">{item.client}</p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Description</h3>
                            <p className="text-sm leading-relaxed">{item.description}</p>
                        </div>
                        {item.longDescription && (
                            <div>
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Details</h3>
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{item.longDescription}</p>
                            </div>
                        )}
                        {tags.length > 0 && (
                            <div>
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Tags</h3>
                                <div className="flex flex-wrap gap-1.5">
                                    {tags.map((tag, i) => (
                                        <Badge key={i} variant="secondary" className="rounded-lg text-xs">{tag}</Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                        {parsedStats && Object.keys(parsedStats).length > 0 && (
                            <div>
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Stats</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {Object.entries(parsedStats).map(([key, val]) => (
                                        <div key={key} className="flex items-center gap-2 p-2 rounded-lg bg-background/30 border border-border/30">
                                            <Hash className="w-4 h-4 text-muted-foreground" />
                                            <span className="text-xs capitalize">{key}:</span>
                                            <span className="text-sm font-semibold">{val}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="border-border/50 h-fit">
                    <CardHeader>
                        <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-start gap-3">
                            <Folder className="w-4 h-4 text-muted-foreground mt-0.5" />
                            <div>
                                <p className="text-xs text-muted-foreground">Category</p>
                                <p className="text-sm font-medium">{item.category}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <User className="w-4 h-4 text-muted-foreground mt-0.5" />
                            <div>
                                <p className="text-xs text-muted-foreground">Client</p>
                                <p className="text-sm font-medium">{item.client}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Tag className="w-4 h-4 text-muted-foreground mt-0.5" />
                            <div>
                                <p className="text-xs text-muted-foreground">Slug</p>
                                <p className="text-sm font-medium font-mono text-xs">{item.slug}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Star className="w-4 h-4 text-muted-foreground mt-0.5" />
                            <div>
                                <p className="text-xs text-muted-foreground">Order</p>
                                <p className="text-sm font-medium">{item.order}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
                            <div>
                                <p className="text-xs text-muted-foreground">Created</p>
                                <p className="text-sm font-medium">{new Date(item.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
                            <div>
                                <p className="text-xs text-muted-foreground">Updated</p>
                                <p className="text-sm font-medium">{new Date(item.updatedAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogContent className="rounded-xl max-w-[400px] p-6">
                    <DialogHeader className="flex flex-col items-center text-center gap-2">
                        <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                            <Trash2 className="w-6 h-6 text-destructive" />
                        </div>
                        <DialogTitle>Remove item?</DialogTitle>
                        <DialogDescription className="text-destructive">This action cannot be undone</DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex-col gap-2">
                        <Button className="w-full bg-destructive rounded-lg" onClick={handleDelete}>Delete</Button>
                        <Button variant="ghost" className="w-full rounded-lg" onClick={() => setDeleteOpen(false)}>Cancel</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

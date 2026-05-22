"use client";

import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { 
    Plus, 
    Search, 
    Filter, 
    MoreHorizontal, 
    Edit, 
    Trash2, 
    ExternalLink, 
    Download, 
    Upload,
    Package,
    Tag,
    Layers,
    ArrowUpRight,
    SearchX,
    FileArchive,
    Rocket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { useRole } from "@/hooks/useRole";
import { RoleGuard } from "@/components/auth/role-guard";
import { Product } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminAPI } from "@/lib/api";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ProductManagementPage() {
    const { isAdmin } = useRole();
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [isUploading, setIsUploading] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
    const [versionTarget, setVersionTarget] = useState<Product | null>(null);
    const [versionForm, setVersionForm] = useState({ version: "", changelog: "", importance: "minor" });
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();
    const queryClient = useQueryClient();

    const createVersionMutation = useMutation({
        mutationFn: (data: { productId: string; version: string; changelog: string; importance: string }) =>
            adminAPI.createVersion(data.productId, { version: data.version, changelog: data.changelog, importance: data.importance }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            toast.success("New version released! All owners will be notified.");
            setVersionTarget(null);
            setVersionForm({ version: "", changelog: "", importance: "minor" });
        },
        onError: () => toast.error("Failed to create version"),
    });
    
    const { products, stats, isLoading, isStatsLoading, deleteProduct, isDeleting } = useProducts(
        undefined,
        searchQuery,
        categoryFilter === "all" ? undefined : categoryFilter
    );
    const { categories } = useCategories();

    const downloadCsvTemplate = () => {
        const headers = ["name", "description", "price", "category", "stock", "sku", "status"];
        const csv = headers.join(",");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "product-import-template.csv";
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Template downloaded");
    };

    const handleBulkUpload = (file?: File) => {
        if (!file) {
            fileInputRef.current?.click();
            return;
        }
        setIsUploading(true);
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            const lines = text.split("\n").filter(Boolean);
            if (lines.length > 1) {
                toast.success(`${lines.length - 1} products parsed. Backend import endpoint coming soon.`);
            } else {
                toast.error("CSV file is empty or invalid");
            }
            setIsUploading(false);
        };
        reader.onerror = () => {
            toast.error("Failed to read file");
            setIsUploading(false);
        };
        reader.readAsText(file);
    };

    const handleConfirmDelete = () => {
        if (deleteTarget) {
            deleteProduct(deleteTarget.id);
            setDeleteTarget(null);
        }
    };

    const filteredProducts = products || [];

    return (
        <RoleGuard allowedRoles={["Editor", "Admin", "SuperAdmin"]}>
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Product Management</h1>
                    <p className="text-muted-foreground">Manage your marketplace inventory, categories, and digital assets.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="gap-2 rounded-xl">
                                <Upload className="w-4 h-4" />
                                Bulk Upload
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px] rounded-[2rem]">
                            <DialogHeader>
                                <DialogTitle>Bulk Product Import</DialogTitle>
                                <DialogDescription>
                                    Upload a CSV file containing your product catalog. Download our template to ensure correct formatting.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div 
                                    className="p-8 border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center text-center bg-muted/20 cursor-pointer hover:bg-muted/30 transition-colors"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <FileArchive className="w-8 h-8 text-primary mb-2" />
                                    <p className="text-sm font-bold">Drop CSV here or click to browse</p>
                                    <p className="text-sm text-muted-foreground">Maximum file size: 10MB</p>
                                </div>
                                <input 
                                    ref={fileInputRef}
                                    type="file" 
                                    accept=".csv"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleBulkUpload(file);
                                    }}
                                />
                                <Button variant="link" className="text-primary text-xs h-auto p-0 underline" onClick={downloadCsvTemplate}>Download CSV Template</Button>
                            </div>
                            <DialogFooter>
                                <Button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="w-full rounded-xl">
                                    {isUploading ? "Processing..." : "Start Import"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                    <Button asChild className="gap-2 rounded-xl shadow-lg shadow-primary/20">
                        <Link href="/dashboard/products/new">
                            <Plus className="w-4 h-4" />
                            Add New Product
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {isStatsLoading ? "..." : stats?.totalProducts || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">All products</p>
                    </CardContent>
                </Card>
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Active Categories</CardTitle>
                        <Layers className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {isStatsLoading ? "..." : stats?.activeCategories || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">Categories with products</p>
                    </CardContent>
                </Card>
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Stock/License Warnings</CardTitle>
                        <Tag className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {isStatsLoading ? "..." : stats?.stockWarnings || 0}
                        </div>
                        <p className="text-xs text-orange-500 font-medium leading-none">Items need attention</p>
                    </CardContent>
                </Card>
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Sales (MTD)</CardTitle>
                        <ArrowUpRight className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ${isStatsLoading ? "..." : stats?.totalSales?.toLocaleString() || "0"}
                        </div>
                        <p className="text-xs text-muted-foreground">Completed orders</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-border/50 overflow-hidden">
                <CardHeader className="bg-muted/20 border-b border-border/50">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search products, categories..." 
                                className="pl-10 h-10 rounded-xl"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                <SelectTrigger className="w-[180px] h-10 rounded-xl">
                                    <SelectValue placeholder="Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All categories</SelectItem>
                                    {categories?.map((c) => (
                                        <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : filteredProducts.length > 0 ? (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/10 hover:bg-transparent">
                                        <TableHead className="w-[80px]">Image</TableHead>
                                        <TableHead className="min-w-[200px]">Product</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Price</TableHead>
                                        <TableHead>Rating</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredProducts.map((p) => (
                                        <TableRow key={p.id} className="group hover:bg-primary/5 transition-colors">
                                            <TableCell>
                                                <div className="relative h-12 w-12 rounded-lg overflow-hidden border border-border">
                                                    <Image src={p.image || '/placeholder.png'} alt={p.name || ''} fill className="object-cover" />
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-sm leading-none mb-1">{p.name}</span>
                                                    <span className="text-sm text-muted-foreground  font-mono">{p.slug}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="text-sm font-medium bg-muted/50">
                                                    {p.category || "—"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-bold text-primary">${p.price ?? 0}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    <span className="text-sm font-medium">{p.rating || "—"}</span>
                                                    <span className="text-xs text-muted-foreground">({p.reviews ?? 0})</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={cn(
                                                    "text-sm",
                                                    p.status === 'approved' ? "bg-green-500/10 text-green-500 border-green-500/20" :
                                                    p.status === 'rejected' ? "bg-red-500/10 text-red-500 border-red-500/20" :
                                                    "bg-orange-500/10 text-orange-500 border-orange-500/20"
                                                )}>
                                                    {p.status ? p.status.charAt(0).toUpperCase() + p.status.slice(1) : 'Pending'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48 rounded-xl">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/dashboard/products/${p.id}/edit`} className="flex items-center gap-2 cursor-pointer">
                                                                <Edit className="w-4 h-4" /> Edit Product
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="flex items-center gap-2 cursor-pointer" onClick={() => router.push("/dashboard/products/inventory")}>
                                                            <Download className="w-4 h-4" /> Manage Assets
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="flex items-center gap-2 cursor-pointer" onClick={() => window.open(`/products/${p.id}`, "_blank")}>
                                                            <ExternalLink className="w-4 h-4" /> View Live
                                                        </DropdownMenuItem>
                                                        {isAdmin && (
                                                        <DropdownMenuItem className="flex items-center gap-2 cursor-pointer text-primary"
                                                            onClick={() => { setVersionTarget(p); setVersionForm({ version: "", changelog: "", importance: "minor" }); }}>
                                                            <Rocket className="w-4 h-4" /> New Version
                                                        </DropdownMenuItem>
                                                        )}
                                                        {isAdmin && (
                                                        <>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem 
                                                            className="flex items-center gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
                                                            onClick={() => setDeleteTarget(p)}
                                                            disabled={isDeleting}
                                                        >
                                                            <Trash2 className="w-4 h-4" /> Delete
                                                        </DropdownMenuItem>
                                                        </>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 bg-muted/5">
                            <SearchX className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-xl font-bold">No products found</h3>
                            <p className="text-muted-foreground text-sm max-w-xs text-center">We couldn't find any products matching your search. Try adjusting your filters.</p>
                            <Button variant="link" className="mt-2 text-primary font-bold" onClick={() => setSearchQuery("")}>Clear Search</Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Inventory Overview - from real products */}
                <Card className="border-border/50">
                    <CardHeader>
                        <CardTitle className="text-xl">Inventory Status</CardTitle>
                        <CardDescription>Recent products and availability.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {filteredProducts.slice(0, 5).map((p) => (
                            <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                                    <div>
                                        <p className="text-sm font-bold">{p.name}</p>
                                        <p className="text-sm text-muted-foreground ">Digital</p>
                                    </div>
                                </div>
                                <Badge variant="outline" className="text-sm bg-background">Available</Badge>
                            </div>
                        ))}
                        {filteredProducts.length === 0 && !isLoading && (
                            <p className="text-sm text-muted-foreground py-2">No products yet.</p>
                        )}
                        <Button asChild variant="outline" className="w-full rounded-xl">
                            <Link href="/dashboard/products/inventory">Manage Detailed Inventory</Link>
                        </Button>
                    </CardContent>
                </Card>

                {/* Category Management - from API */}
                <Card className="border-border/50">
                    <CardHeader>
                        <CardTitle className="text-xl">Quick Category Management</CardTitle>
                        <CardDescription>Categories and product counts from catalog.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {categories?.slice(0, 5).map((cat) => (
                            <div key={cat.id} className="flex items-center justify-between p-3 rounded-xl bg-card border border-border shadow-sm">
                                <span className="text-sm font-bold">{cat.name}</span>
                                <Badge className="rounded-full h-5 min-w-[20px] justify-center px-2">{cat.productCount ?? 0}</Badge>
                            </div>
                        ))}
                        {(!categories || categories.length === 0) && !isLoading && (
                            <p className="text-sm text-muted-foreground py-2">No categories yet.</p>
                        )}
                        <Button asChild variant="outline" className="w-full rounded-xl">
                            <Link href="/dashboard/products/categories">Manage All Categories</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={!!versionTarget} onOpenChange={(o) => { if (!o) setVersionTarget(null); }}>
                <DialogContent className="rounded-[2rem] border-border/50 max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                            <Rocket className="w-6 h-6 text-primary" /> Release New Version
                        </DialogTitle>
                        <DialogDescription className="text-sm text-muted-foreground">
                            Push a new build for &quot;{versionTarget?.name}&quot;. All owners will receive an update notification.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-bold mb-1 block">Version Tag</label>
                            <Input
                                placeholder="e.g. 2.0.0"
                                className="h-10 rounded-xl font-mono font-bold"
                                value={versionForm.version}
                                onChange={(e) => setVersionForm({ ...versionForm, version: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-bold mb-1 block">Importance</label>
                            <select
                                className="w-full h-10 rounded-xl border border-border/50 bg-background px-3 text-sm font-bold"
                                value={versionForm.importance}
                                onChange={(e) => setVersionForm({ ...versionForm, importance: e.target.value })}
                            >
                                <option value="minor">Minor</option>
                                <option value="major">Major</option>
                                <option value="security">Security</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-bold mb-1 block">Changelog</label>
                            <textarea
                                className="w-full min-h-[120px] rounded-xl border border-border/50 bg-background p-3 text-sm font-medium resize-y"
                                placeholder="Describe what changed in this release..."
                                value={versionForm.changelog}
                                onChange={(e) => setVersionForm({ ...versionForm, changelog: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" className="rounded-xl font-bold" onClick={() => setVersionTarget(null)}>Cancel</Button>
                        <Button className="rounded-xl font-bold gap-2"
                            onClick={() => versionTarget && createVersionMutation.mutate({ productId: versionTarget.id, ...versionForm })}
                            disabled={!versionForm.version || !versionForm.changelog || createVersionMutation.isPending}
                        >
                            <Rocket className="w-4 h-4" />
                            {createVersionMutation.isPending ? "Releasing..." : "Release"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <AlertDialogContent className="rounded-2xl border-border/50 max-w-md">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">Delete product?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently remove &quot;{deleteTarget?.name}&quot;. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2 sm:gap-0">
                        <AlertDialogCancel className="rounded-xl font-bold">Cancel</AlertDialogCancel>
                        <AlertDialogAction variant="destructive"
                            className="rounded-xl font-bold bg-destructive text-destructive-foreground"
                            onClick={handleConfirmDelete}
                        >
                            {isDeleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
        </RoleGuard>
    );
}

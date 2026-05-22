"use client";

import { useState } from "react";
import {
    Plus,
    Search,
    MoreHorizontal,
    Edit,
    Trash2,
    Folder,
    X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCategories } from "@/hooks/useCategories";
import { Category } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { postsAPI } from "@/lib/api";

export default function PostCategoriesPage() {
    const { categories = [], createCategory, updateCategory, deleteCategory, isCreating } = useCategories();
    const { data: postCategoryStats } = useQuery({
        queryKey: ['post-category-stats'],
        queryFn: () => postsAPI.getPosts({ limit: 1 }),
    });

    const [search, setSearch] = useState("");
    const [editCat, setEditCat] = useState<Category | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
    const [showCreate, setShowCreate] = useState(false);
    const [form, setForm] = useState({ name: "", description: "", slug: "" });

    const filtered = categories.filter((c: Category) =>
        (c.name || '').toLowerCase().includes(search.toLowerCase())
    );

    const handleCreate = () => {
        if (!form.name.trim()) return;
        createCategory({
            name: form.name.trim(),
            slug: form.slug.trim() || form.name.toLowerCase().replace(/\s+/g, '-'),
            description: form.description.trim() || undefined,
        });
        setForm({ name: "", description: "", slug: "" });
        setShowCreate(false);
    };

    const handleUpdate = () => {
        if (!editCat || !form.name.trim()) return;
        updateCategory(editCat.id, {
            name: form.name.trim(),
            slug: form.slug.trim() || form.name.toLowerCase().replace(/\s+/g, '-'),
            description: form.description.trim() || undefined,
        });
        setEditCat(null);
        setForm({ name: "", description: "", slug: "" });
    };

    const openEdit = (cat: Category) => {
        setEditCat(cat);
        setForm({ name: cat.name, description: cat.description || "", slug: cat.slug });
    };

    const resetForm = () => {
        setForm({ name: "", description: "", slug: "" });
        setEditCat(null);
        setShowCreate(false);
    };

    const isDialogOpen = showCreate || !!editCat;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Categories</h1>
                    <p className="text-muted-foreground">Manage post categories</p>
                </div>
                <Button onClick={() => { resetForm(); setShowCreate(true); }}>
                    <Plus className="w-4 h-4 mr-2" />
                    New Category
                </Button>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg">All Categories ({categories.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="relative max-w-sm mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input placeholder="Search categories..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9"
                        />
                    </div>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Slug</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Order</TableHead>
                                    <TableHead className="w-[70px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {categories.length === 0 ? (
                                    <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No categories found</TableCell></TableRow>
                                ) : (
                                    filtered.map((cat: Category) => (
                                        <TableRow key={cat.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Folder className="w-4 h-4 text-muted-foreground" />
                                                    <span className="font-medium">{cat.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">{cat.slug}</TableCell>
                                            <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{cat.description || "—"}</TableCell>
                                            <TableCell>{cat.order || 0}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    <Button variant="ghost" size="icon" onClick={() => openEdit(cat)}>
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(cat)}>
                                                        <Trash2 className="w-4 h-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Create/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={(open) => !open && resetForm()}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editCat ? "Edit Category" : "Create Category"}</DialogTitle>
                        <DialogDescription>
                            {editCat ? "Update category details" : "Add a new category for posts"}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Name *</Label>
                            <Input value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                placeholder="e.g. Technology, Design"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Slug</Label>
                            <Input value={form.slug}
                                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                                placeholder="Auto-generated if empty"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                placeholder="Brief description of this category"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={resetForm}>Cancel</Button>
                        <Button onClick={editCat ? handleUpdate : handleCreate} disabled={!form.name.trim() || isCreating}>
                            {editCat ? "Update" : "Create"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Category</AlertDialogTitle>
                        <AlertDialogDescription>
                            Delete "{deleteTarget?.name}"? Posts in this category will become uncategorized.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => { if (deleteTarget) { deleteCategory(deleteTarget.id); setDeleteTarget(null); } }}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

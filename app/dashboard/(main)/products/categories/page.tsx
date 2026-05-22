"use client";

import { useState } from "react";
import { 
    Plus, 
    Search, 
    Edit, 
    Trash2, 
    Folder, 
    ChevronRight, 
    GripVertical,
    Target,
    Layers,
    ArrowLeft,
    X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useCategories } from "@/hooks/useCategories";
import { RoleGuard } from "@/components/auth/role-guard";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";

export default function CategoriesPage() {
    const { categories, isLoading, createCategory, updateCategory, deleteCategory, addSubcategory, removeSubcategory, isCreating, isUpdating, isDeleting } = useCategories();
    
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isSubcategoryDialogOpen, setIsSubcategoryDialogOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<any>(null);
    
    // Form state
  const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [description, setDescription] = useState("");
    const [newSubcategory, setNewSubcategory] = useState("");

    const handleCreateCategory = () => {
        createCategory({
            name,
            slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            description,
            subcategories: [],
            order: categories.length
        });
        setIsCreateDialogOpen(false);
        resetForm();
    };

    const handleEditCategory = () => {
        if (selectedCategory) {
            updateCategory(selectedCategory.id, {
                name,
                slug,
                description
            });
            setIsEditDialogOpen(false);
            resetForm();
        }
    };

    const handleDeleteCategory = (id: string) => {
        if (confirm("Are you sure you want to delete this category?")) {
            deleteCategory(id);
        }
    };

    const handleAddSubcategory = () => {
        if (selectedCategory && newSubcategory) {
            addSubcategory(selectedCategory.id, newSubcategory);
            setNewSubcategory("");
            setIsSubcategoryDialogOpen(false);
        }
    };

    const handleRemoveSubcategory = (categoryId: string, subcategory: string) => {
        if (confirm(`Remove "${subcategory}" subcategory?`)) {
            removeSubcategory(categoryId, subcategory);
        }
    };

    const openEditDialog = (category: any) => {
        setSelectedCategory(category);
        setName(category.name);
        setSlug(category.slug);
        setDescription(category.description || "");
        setIsEditDialogOpen(true);
    };

    const openSubcategoryDialog = (category: any) => {
        setSelectedCategory(category);
        setIsSubcategoryDialogOpen(true);
    };

    const resetForm = () => {
        setName("");
        setSlug("");
        setDescription("");
        setSelectedCategory(null);
    };

    const totalProducts = categories.reduce((acc, cat) => acc + (cat.productCount || 0), 0);
    const coverage = totalProducts > 0 ? 100 : 0;

    return (
        <RoleGuard allowedRoles={["Editor", "Admin", "SuperAdmin"]}>
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button asChild variant="ghost" size="icon" className="rounded-full">
                        <Link href="/dashboard/products">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">Product Categories</h1>
                        <p className="text-muted-foreground">Organize your marketplace products into logical hierarchies.</p>
                    </div>
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2 rounded-xl shadow-lg shadow-primary/20">
                            <Plus className="w-4 h-4" />
                            New Category
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px] rounded-[2rem]">
                        <DialogHeader>
                            <DialogTitle>Create New Category</DialogTitle>
                            <DialogDescription>
                                Add a new product category to organize your marketplace.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Category Name</Label>
                                <Input id="name"
                                    value={name}
                                    onChange={(e) => {
                                        setName(e.target.value);
                                        setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                                    }}
                                    placeholder="e.g. Mobile Apps"
                                    className="rounded-xl h-11"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="slug">Slug</Label>
                                <Input id="slug"
                                    value={slug}
                                    onChange={(e) => setSlug(e.target.value)}
                                    placeholder="mobile-apps"
                                    className="rounded-xl h-11"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description (Optional)</Label>
                                <Textarea id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Brief description of this category"
                                    className="rounded-xl"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="rounded-xl">
                                Cancel
                            </Button>
                            <Button 
                                onClick={handleCreateCategory} 
                                disabled={!name || isCreating}
                                className="rounded-xl"
                            >
                                {isCreating ? "Creating..." : "Create Category"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : categories.length > 0 ? (
                        categories.map((cat) => (
                            <Card key={cat.id} className="border-border/50 group hover:border-primary/50 transition-all">
                                <CardContent className="p-0">
                                    <div className="flex items-center p-6 gap-6">
                                        <div className="cursor-grab text-muted-foreground/30 hover:text-primary transition-colors">
                                            <GripVertical className="w-5 h-5" />
                                        </div>
                                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                            <Folder className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-lg">{cat.name}</h3>
                                            <p className="text-sm text-muted-foreground">
                                                {cat.subcategories.length} subcategories • {cat.productCount || 0} products
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-9 w-9 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => openEditDialog(cat)}
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-9 w-9 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10"
                                                onClick={() => handleDeleteCategory(cat.id)}
                                                disabled={isDeleting}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="bg-muted/30 border-t border-border/50 p-6 pt-4">
                                        <div className="flex flex-wrap gap-2">
                                            {cat.subcategories.map(sub => (
                                                <Badge 
                                                    key={sub} 
                                                    variant="secondary" 
                                                    className="bg-background border-border/50 px-3 py-1 text-xs hover:border-primary transition-colors cursor-pointer group/badge"
                                                >
                                                    {sub}
                                                    <X 
                                                        className="w-3 h-3 ml-1 opacity-0 group-hover/badge:opacity-100 transition-opacity text-destructive"
                                                        onClick={() => handleRemoveSubcategory(cat.id, sub)}
                                                    />
                                                </Badge>
                                            ))}
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className="h-7 border border-dashed rounded-lg opacity-60 text-sm"
                                                onClick={() => openSubcategoryDialog(cat)}
                                            >
                                                + Add Subcategory
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <Card className="border-border/50">
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <Folder className="h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-xl font-bold">No categories yet</h3>
                                <p className="text-muted-foreground text-sm">Create your first category to get started</p>
                            </CardContent>
                        </Card>
                    )}
                </div>

                <div className="space-y-6">
                    <Card className="border-border/50">
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Target className="w-4 h-4 text-primary" /> Category Optimization
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-xs text-muted-foreground leading-relaxed">Ensure categories have clear, SEO-friendly names. Overlapping categories may reduce product discoverability.</p>
                            <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold  text-primary">Status</span>
                                    <Badge className="bg-green-500 text-white text-sm border-none">Healthy</Badge>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex justify-between text-sm font-bold">
                                        <span>Product Coverage</span>
                                        <span>{coverage}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                        <div className="h-full bg-primary rounded-full" style={{ width: `${coverage}%` }} />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border/50 bg-gradient-to-br from-primary/10 to-transparent">
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2 text-primary">
                                <Layers className="w-4 h-4" /> Bulk Re-Categorize
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-muted-foreground mb-4">Moving products from one category to another? Use our bulk tool to update mapping at once.</p>
                            <Button variant="outline" className="w-full rounded-xl bg-background shadow-lg shadow-primary/5">Launch Bulk Mapper</Button>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Edit Category Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-[500px] rounded-[2rem]">
                    <DialogHeader>
                        <DialogTitle>Edit Category</DialogTitle>
                        <DialogDescription>
                            Update category information.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-name">Category Name</Label>
                            <Input id="edit-name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="rounded-xl h-11"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-slug">Slug</Label>
                            <Input id="edit-slug"
                                value={slug}
                                onChange={(e) => setSlug(e.target.value)}
                                className="rounded-xl h-11"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-description">Description</Label>
                            <Textarea id="edit-description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="rounded-xl"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="rounded-xl">
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleEditCategory} 
                            disabled={!name || isUpdating}
                            className="rounded-xl"
                        >
                            {isUpdating ? "Updating..." : "Update Category"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add Subcategory Dialog */}
            <Dialog open={isSubcategoryDialogOpen} onOpenChange={setIsSubcategoryDialogOpen}>
                <DialogContent className="sm:max-w-[425px] rounded-[2rem]">
                    <DialogHeader>
                        <DialogTitle>Add Subcategory</DialogTitle>
                        <DialogDescription>
                            Add a new subcategory to {selectedCategory?.name}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="subcategory">Subcategory Name</Label>
                            <Input id="subcategory"
                                value={newSubcategory}
                                onChange={(e) => setNewSubcategory(e.target.value)}
                                placeholder="e.g. iOS Apps"
                                className="rounded-xl h-11"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsSubcategoryDialogOpen(false)} className="rounded-xl">
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleAddSubcategory} 
                            disabled={!newSubcategory}
                            className="rounded-xl"
                        >
                            Add Subcategory
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
        </RoleGuard>
    );
}

"use client";

import { useState } from "react";
import {
    Plus,
    Search,
    MoreHorizontal,
    Edit,
    Trash2,
    Tag as TagIcon,
    X,
    Check,
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
import { useTags } from "@/hooks/useTags";
import { Tag } from "@/lib/api";

export default function TagsPage() {
    const { tags, isLoading, createTag, updateTag, deleteTag, isCreating } = useTags();
    const [search, setSearch] = useState("");
    const [editTag, setEditTag] = useState<Tag | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Tag | null>(null);
    const [showCreate, setShowCreate] = useState(false);
    const [form, setForm] = useState({ name: "", description: "", color: "" });

    const filtered = tags.filter((t: Tag) =>
        (t.name || '').toLowerCase().includes(search.toLowerCase())
    );

    const handleCreate = () => {
        if (!form.name.trim()) return;
        createTag({
            name: form.name.trim(),
            description: form.description.trim() || undefined,
            color: form.color || undefined,
        });
        setForm({ name: "", description: "", color: "" });
        setShowCreate(false);
    };

    const handleUpdate = () => {
        if (!editTag || !form.name.trim()) return;
        updateTag(editTag.id, {
            name: form.name.trim(),
            description: form.description.trim() || undefined,
            color: form.color || undefined,
        });
        setEditTag(null);
        setForm({ name: "", description: "", color: "" });
    };

    const openEdit = (tag: Tag) => {
        setEditTag(tag);
        setForm({ name: tag.name, description: tag.description || "", color: tag.color || "" });
    };

    const resetForm = () => {
        setForm({ name: "", description: "", color: "" });
        setEditTag(null);
        setShowCreate(false);
    };

    const isDialogOpen = showCreate || !!editTag;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Tags</h1>
                    <p className="text-muted-foreground">Manage your post tags</p>
                </div>
                <Button onClick={() => { resetForm(); setShowCreate(true); }}>
                    <Plus className="w-4 h-4 mr-2" />
                    New Tag
                </Button>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg">All Tags ({tags.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="relative max-w-sm mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input placeholder="Search tags..."
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
                                    <TableHead>Posts</TableHead>
                                    <TableHead className="w-[70px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
                                ) : filtered.length === 0 ? (
                                    <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No tags found</TableCell></TableRow>
                                ) : (
                                    filtered.map((tag: Tag) => (
                                        <TableRow key={tag.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full border" style={{ backgroundColor: tag.color || "#e2e8f0" }} />
                                                    <Badge variant="secondary">{tag.name}</Badge>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">{tag.slug}</TableCell>
                                            <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{tag.description || "—"}</TableCell>
                                            <TableCell>{tag.usageCount || 0}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    <Button variant="ghost" size="icon" onClick={() => openEdit(tag)}>
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(tag)}>
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
                        <DialogTitle>{editTag ? "Edit Tag" : "Create Tag"}</DialogTitle>
                        <DialogDescription>
                            {editTag ? "Update the tag details" : "Add a new tag for your posts"}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Name *</Label>
                            <Input value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                placeholder="e.g. React, JavaScript"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                placeholder="Brief description of this tag"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Color</Label>
                            <div className="flex items-center gap-2">
                                <input type="color"
                                    value={form.color || "#6366f1"}
                                    onChange={(e) => setForm({ ...form, color: e.target.value })}
                                    className="w-10 h-10 rounded cursor-pointer"
                                />
                                <Input value={form.color}
                                    onChange={(e) => setForm({ ...form, color: e.target.value })}
                                    placeholder="#6366f1"
                                    className="flex-1"
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={resetForm}>Cancel</Button>
                        <Button onClick={editTag ? handleUpdate : handleCreate} disabled={!form.name.trim() || isCreating}>
                            {editTag ? "Update" : "Create"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Tag</AlertDialogTitle>
                        <AlertDialogDescription>
                            Delete "{deleteTarget?.name}"? Posts with this tag will not be affected.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => { if (deleteTarget) { deleteTag(deleteTarget.id); setDeleteTarget(null); } }}
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

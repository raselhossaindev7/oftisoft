"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
    Search, Filter, MoreVertical, UserPlus, Download, Users, User, UserX,
    Trash2, RefreshCw, Activity, UsersRound, Edit3, Loader2, X, Tag,
    AlertCircle, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown,
    LayoutGrid, List, GripVertical, CheckSquare, Square, CheckCheck, XCircle,
    CalendarIcon, Eye, EyeOff,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import {
    Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { teamMembersAPI, authAPI, TeamMember } from "@/lib/api";
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

const EMPTY_FORM = {
    name: "", role: "", bio: "", avatar: "", email: "", socialLinks: "", tags: "",
    order: 0, isActive: true,
};

const MEMBERS_PER_PAGE = 10;

function SortableRow({ m, openEditDialog, setDeleteId, handleToggleActive, isSelected, onSelect }: {
    m: TeamMember; openEditDialog: (m: TeamMember) => void; setDeleteId: (id: string) => void;
    handleToggleActive: (m: TeamMember) => void; isSelected: boolean; onSelect: (id: string) => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: m.id });
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };

    const getInitials = (name: string) =>
        name.split(" ").filter(Boolean).map(n => n[0]).join("").toUpperCase().slice(0, 2) || "TM";

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
                    <button onClick={() => onSelect(m.id)}
                        className="text-muted-foreground hover:text-primary transition-colors"
                    >
                        {isSelected ? <CheckSquare className="w-4 h-4 text-primary" /> : <Square className="w-4 h-4" />}
                    </button>
                </div>
            </TableCell>
            <TableCell className="px-6 py-5">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Avatar className="h-9 w-9 border-2 border-background shadow-md">
                            <AvatarImage src={m.avatar} />
                            <AvatarFallback className="bg-primary/10 text-primary font-medium text-xs">
                                {getInitials(m.name)}
                            </AvatarFallback>
                        </Avatar>
                        {m.isActive && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-background shadow" />
                        )}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-medium">{m.name}</span>
                        {m.tags && Array.isArray(m.tags) && m.tags.length > 0 && (
                            <div className="flex items-center gap-1 mt-0.5">
                                <Tag className="w-3 h-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                                    {m.tags.slice(0, 2).join(", ")}{m.tags.length > 2 ? ` +${m.tags.length - 2}` : ""}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </TableCell>
            <TableCell>
                <Badge className="bg-primary/10 text-primary border-primary/20 rounded-md text-xs font-medium">{m.role}</Badge>
            </TableCell>
            <TableCell>
                <button onClick={() => handleToggleActive(m)}
                    className="flex items-center gap-2 hover:bg-muted/50 rounded-lg px-2 py-1 transition-colors"
                >
                    <div className={cn("w-2 h-2 rounded-full",
                        m.isActive ? "bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.6)]" : "bg-muted"
                    )} />
                    <span className="text-xs font-medium">{m.isActive ? "Active" : "Inactive"}</span>
                </button>
            </TableCell>
            <TableCell className="hidden md:table-cell">
                <span className="text-sm text-muted-foreground">{m.email || "\u2014"}</span>
            </TableCell>
            <TableCell className="hidden md:table-cell">
                <div className="flex flex-col">
                    <div className="text-sm">{new Date(m.createdAt).toLocaleDateString()}</div>
                    <div className="text-xs text-muted-foreground">
                        {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                        className="w-56 rounded-[1.5rem] p-2 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.2)] border-border/50 backdrop-blur-xl"
                    >
                        <DropdownMenuLabel className="text-sm font-medium text-muted-foreground px-3 py-2">Actions</DropdownMenuLabel>
                        <DropdownMenuItem className="gap-3 cursor-pointer rounded-lg py-2 text-sm"
                            onClick={() => openEditDialog(m)}
                        >
                            <Edit3 className="w-4 h-4 text-primary" /> Edit Member
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="my-1 opacity-50" />
                        <DropdownMenuItem className="gap-3 text-destructive focus:bg-destructive/10 cursor-pointer rounded-lg py-2 text-sm"
                            onClick={() => setDeleteId(m.id)}
                        >
                            <Trash2 className="w-4 h-4" /> Delete Member
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </TableCell>
        </TableRow>
    );
}

function TeamPage() {
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeSegment, setActiveSegment] = useState("All Members");
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [sortField, setSortField] = useState<string>("createdAt");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
    const [currentPage, setCurrentPage] = useState(1);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [isSaving, setIsSaving] = useState(false);
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

    const handleAvatarUpload = async (file: File) => {
        if (!file) return;
        if (!file.type.startsWith("image/")) { toast.error("Please select an image file"); return; }
        setIsUploading(true); setUploadProgress(0);
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);
        try {
            const data = await authAPI.uploadAvatar(file);
            setUploadProgress(100);
            setFormData(prev => ({ ...prev, avatar: data.avatarUrl || data.avatar || "" }));
            toast.success("Avatar uploaded");
        } catch { setPreviewUrl(null); toast.error("Failed to upload avatar"); }
        finally { setIsUploading(false); setUploadProgress(0); }
    };

    const fetchMembers = useCallback(async () => {
        setIsLoading(true); setIsError(false);
        try {
            const data = await teamMembersAPI.getAll();
            setMembers(data.items ?? data);
        } catch { setIsError(true); toast.error("Failed to fetch team members"); }
        finally { setIsLoading(false); }
    }, []);

    useEffect(() => { fetchMembers(); }, [fetchMembers]);

    const handleRefresh = async () => {
        setIsRefreshing(true); await fetchMembers(); setIsRefreshing(false); toast.success("Team refreshed");
    };

    const handleSort = (field: string) => {
        if (sortField === field) setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        else { setSortField(field); setSortDirection("asc"); }
        setCurrentPage(1);
    };

    const SortIcon = ({ field }: { field: string }) => {
        if (sortField !== field) return <ArrowUpDown className="w-3 h-3 opacity-50" />;
        return sortDirection === "asc" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />;
    };

    const filteredMembers = useMemo(() => {
        const q = searchQuery.toLowerCase();
        let list = members;
        if (q) {
            list = list.filter(m =>
                (m.name || '').toLowerCase().includes(q) ||
                (m.email || "").toLowerCase().includes(q) ||
                (m.role || '').toLowerCase().includes(q) ||
                (Array.isArray(m.tags) ? m.tags : []).some(t => t.toLowerCase().includes(q))
            );
        }
        switch (activeSegment) {
            case "Active": list = list.filter(m => m.isActive); break;
            case "Inactive": list = list.filter(m => !m.isActive); break;
        }
        if (dateFrom) list = list.filter(m => new Date(m.createdAt) >= dateFrom);
        if (dateTo) {
            const end = new Date(dateTo); end.setHours(23, 59, 59, 999);
            list = list.filter(m => new Date(m.createdAt) <= end);
        }
        const sorted = [...list].sort((a, b) => {
            let aVal: any = a[sortField as keyof TeamMember];
            let bVal: any = b[sortField as keyof TeamMember];
            if (sortField === "name" || sortField === "role" || sortField === "email") {
                aVal = (aVal || "").toLowerCase(); bVal = (bVal || "").toLowerCase();
            } else if (sortField === "createdAt") {
                aVal = new Date(aVal || 0).getTime(); bVal = new Date(bVal || 0).getTime();
            } else if (sortField === "order") { aVal = Number(aVal) || 0; bVal = Number(bVal) || 0; }
            if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
            if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
            return 0;
        });
        return sorted;
    }, [members, searchQuery, activeSegment, sortField, sortDirection, dateFrom, dateTo]);

    const totalPages = Math.ceil(filteredMembers.length / MEMBERS_PER_PAGE);
    const paginatedMembers = useMemo(() => {
        const start = (currentPage - 1) * MEMBERS_PER_PAGE;
        return filteredMembers.slice(start, start + MEMBERS_PER_PAGE);
    }, [filteredMembers, currentPage]);

    const openCreateDialog = () => {
        setEditingMember(null); setFormData(EMPTY_FORM); setPreviewUrl(null);
        setUploadProgress(0); setIsUploading(false); setDialogOpen(true);
    };

    const openEditDialog = (member: TeamMember) => {
        setEditingMember(member);
        setFormData({
            name: member.name, role: member.role, bio: member.bio || "", avatar: member.avatar || "",
            email: member.email || "", socialLinks: member.socialLinks || "",
            tags: Array.isArray(member.tags) ? member.tags.join(", ") : member.tags || "",
            order: member.order, isActive: member.isActive,
        });
        setPreviewUrl(null); setUploadProgress(0); setIsUploading(false); setDialogOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault(); setIsSaving(true);
        try {
            const payload = {
                name: formData.name, role: formData.role, bio: formData.bio || undefined,
                avatar: formData.avatar || undefined, email: formData.email || undefined,
                socialLinks: formData.socialLinks || undefined,
                tags: formData.tags ? formData.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
                order: formData.order, isActive: formData.isActive,
            };
            if (editingMember) { await teamMembersAPI.update(editingMember.id, payload); toast.success("Team member updated"); }
            else { await teamMembersAPI.create(payload); toast.success("Team member created"); }
            await fetchMembers(); setDialogOpen(false);
        } catch (err: any) { toast.error(err?.response?.data?.message || "Failed to save"); }
        finally { setIsSaving(false); }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try { await teamMembersAPI.delete(deleteId); setDeleteId(null); setSelectedIds(prev => { const n = new Set(prev); n.delete(deleteId); return n; }); await fetchMembers(); toast.success("Team member deleted"); }
        catch (err: any) { toast.error(err?.response?.data?.message || "Failed to delete"); }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.size === 0) return;
        try { await teamMembersAPI.bulkDelete(Array.from(selectedIds)); setSelectedIds(new Set()); setBulkDeleteOpen(false); await fetchMembers(); toast.success("Members deleted"); }
        catch { toast.error("Failed to delete members"); }
    };

    const handleBulkStatus = async (isActive: boolean) => {
        if (selectedIds.size === 0) return;
        try { await teamMembersAPI.bulkUpdateStatus(Array.from(selectedIds), isActive); setSelectedIds(new Set()); await fetchMembers(); toast.success(`Members ${isActive ? "activated" : "deactivated"}`); }
        catch { toast.error("Failed to update members"); }
    };

    const handleToggleActive = useCallback(async (m: TeamMember) => {
        try { await teamMembersAPI.update(m.id, { isActive: !m.isActive }); setMembers(prev => prev.map(item => item.id === m.id ? { ...item, isActive: !item.isActive } : item)); toast.success(`Member ${m.isActive ? "deactivated" : "activated"}`); }
        catch { toast.error("Failed to update status"); }
    }, []);

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
    };
    const toggleSelectAll = () => {
        if (selectedIds.size === paginatedMembers.length) setSelectedIds(new Set());
        else setSelectedIds(new Set(paginatedMembers.map(m => m.id)));
    };

    const getInitials = (name: string) =>
        name.split(" ").filter(Boolean).map(n => n[0]).join("").toUpperCase().slice(0, 2) || "TM";

    const handleExport = () => {
        if (filteredMembers.length === 0) { toast.info("No members to export"); return; }
        const headers = ["Name", "Role", "Email", "Status", "Bio", "Tags", "Order", "Created"];
        const rows = filteredMembers.map(m => [
            m.name, m.role, m.email || "", m.isActive ? "Active" : "Inactive",
            (m.bio || "").replace(/"/g, '""'), Array.isArray(m.tags) ? m.tags.join("; ") : m.tags || "",
            String(m.order), new Date(m.createdAt).toISOString(),
        ].map(c => `"${c}"`).join(","));
        const csv = [headers.join(","), ...rows].join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = `team-export-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click(); URL.revokeObjectURL(url); toast.success("Team exported");
    };

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragEnd = useCallback(async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const oldIndex = paginatedMembers.findIndex(m => m.id === active.id);
        const newIndex = paginatedMembers.findIndex(m => m.id === over.id);
        if (oldIndex === -1 || newIndex === -1) return;
        const reordered = arrayMove(paginatedMembers, oldIndex, newIndex);
        const updates = reordered.map((m, i) => ({ id: m.id, order: i }));
        setMembers(prev => {
            const map = new Map(prev.map(m => [m.id, m]));
            reordered.forEach(m => map.set(m.id, m));
            return Array.from(map.values());
        });
        setIsReordering(true);
        try { await teamMembersAPI.reorder(updates); }
        catch { toast.error("Failed to save order"); await fetchMembers(); }
        finally { setIsReordering(false); }
    }, [paginatedMembers, fetchMembers]);

    const paginatedIds = useMemo(() => paginatedMembers.map(m => m.id), [paginatedMembers]);

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Team</h1>
                    <p className="text-sm text-muted-foreground">Manage your team members, assign roles, and control access permissions.</p>
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
                    <Button variant="outline" className="gap-2 rounded-xl h-11 border-border/50 bg-card/50 backdrop-blur-sm" onClick={handleRefresh}>
                        <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} /> Refresh
                    </Button>
                    <Button variant="outline" className="gap-2 rounded-xl h-11 border-border/50 bg-card/50 backdrop-blur-sm" onClick={handleExport}>
                        <Download className="w-4 h-4" /> Export
                    </Button>
                    <Button asChild className="gap-2 rounded-xl h-11 shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 px-8 font-semibold">
                        <Link href="/dashboard/team/new"><UserPlus className="w-4 h-4" /> Add Member</Link>
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Members</CardTitle>
                        <Users className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{isLoading ? <Skeleton className="h-8 w-12" /> : members.length}</div>
                        <p className="text-xs text-muted-foreground">Team Roster</p>
                    </CardContent>
                </Card>
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Active</CardTitle>
                        <Activity className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-500">{isLoading ? <Skeleton className="h-8 w-12" /> : members.filter(m => m.isActive).length}</div>
                        <p className="text-xs text-muted-foreground">Active</p>
                    </CardContent>
                </Card>
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Inactive</CardTitle>
                        <UserX className="h-4 w-4 text-rose-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-rose-500">{isLoading ? <Skeleton className="h-8 w-12" /> : members.filter(m => !m.isActive).length}</div>
                        <p className="text-xs text-muted-foreground">Inactive</p>
                    </CardContent>
                </Card>
            </div>

            {/* Error State */}
            {isError && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-6 text-center">
                    <AlertCircle className="w-10 h-10 text-destructive mx-auto mb-3" />
                    <h3 className="text-lg font-bold mb-2">Failed to load team members</h3>
                    <p className="text-sm text-muted-foreground mb-4">Something went wrong while fetching your team.</p>
                    <Button variant="outline" onClick={() => fetchMembers()}>Try Again</Button>
                </div>
            )}

            <div className="grid lg:grid-cols-4 gap-8">
                {/* Sidebar Filters */}
                <div className="space-y-6">
                    <Card className="border-border/50 h-fit rounded-[2.5rem] overflow-hidden shadow-sm bg-card/40 backdrop-blur-md">
                        <CardHeader className="p-6 pb-3">
                            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Team</CardTitle>
                        </CardHeader>
                        <CardContent className="px-3 pb-4 pt-0">
                            <div className="flex flex-col gap-0.5">
                                {[
                                    { name: "All Members", count: members.length },
                                    { name: "Active", count: members.filter(m => m.isActive).length },
                                    { name: "Inactive", count: members.filter(m => !m.isActive).length },
                                ].map((segment) => (
                                    <button key={segment.name}
                                        onClick={() => setActiveSegment(segment.name)}
                                        className={cn(
                                            "flex items-center justify-between px-4 py-2.5 rounded-xl text-sm transition-all group",
                                            activeSegment === segment.name
                                                ? "bg-primary text-white font-medium shadow-lg shadow-primary/20"
                                                : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
                                        )}
                                    >
                                        <span>{segment.name}</span>
                                        <span className={cn("px-2 py-0.5 rounded-md text-xs font-medium",
                                            activeSegment === segment.name ? "bg-white/20 text-white" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                                        )}>{segment.count}</span>
                                    </button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Member List */}
                <div className="lg:col-span-3 space-y-4">
                    <Card className="border-border/50 rounded-2xl overflow-hidden shadow-sm">
                        <CardHeader className="p-6 border-b border-border/50 bg-muted/5">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                                <div className="flex flex-1 flex-col sm:flex-row gap-2">
                                    <div className="relative flex-1 max-w-sm">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input placeholder="Search by name, email, role..."
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
                                                    onClick={() => { setDateFrom(undefined); setDateTo(undefined); }}>Clear</Button>
                                            </div>
                                            <div className="flex">
                                                <div className="p-2"><Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} autoFocus /></div>
                                                <div className="p-2 border-l border-border/50"><Calendar mode="single" selected={dateTo} onSelect={setDateTo} autoFocus /></div>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                    {(searchQuery || activeSegment !== "All Members") && (
                                        <Button variant="ghost" size="sm" className="gap-2 rounded-xl h-10 text-sm text-muted-foreground"
                                            onClick={() => { setSearchQuery(""); setActiveSegment("All Members"); setCurrentPage(1); }}>
                                            <X className="w-3 h-3" /> Clear
                                        </Button>
                                    )}
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
                            {isLoading && members.length === 0 ? (
                                <div className="py-32 flex flex-col items-center justify-center gap-6">
                                    <div className="relative">
                                        <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                                        <RefreshCw className="h-10 w-10 text-primary animate-spin relative z-10" />
                                    </div>
                                    <p className="text-sm text-primary animate-pulse">Loading team members...</p>
                                </div>
                            ) : filteredMembers.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-32 bg-muted/5">
                                    <div className="w-20 h-20 rounded-[2rem] bg-muted/20 flex items-center justify-center mb-6">
                                        <UsersRound className="h-10 w-10 text-muted-foreground/30" />
                                    </div>
                                    <h3 className="text-xl font-semibold">No results</h3>
                                    <p className="text-muted-foreground text-sm max-w-xs text-center mt-2">Try a different search or filter.</p>
                                    <Button variant="outline" className="mt-6 rounded-xl font-medium text-xs border-primary/20 text-primary px-8 h-9 hover:bg-primary hover:text-white transition-all"
                                        onClick={() => { setSearchQuery(""); setActiveSegment("All Members"); setDateFrom(undefined); setDateTo(undefined); }}>Reset Filters</Button>
                                </div>
                            ) : view === "grid" ? (
                                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {paginatedMembers.map((m) => (
                                        <Card key={m.id} className="border-border/50 hover:border-primary/50 hover:shadow-lg transition-all group cursor-pointer">
                                            <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-10 w-10 border-2 border-background shadow-md rounded-lg">
                                                        <AvatarImage src={m.avatar} />
                                                        <AvatarFallback className="bg-primary/10 text-primary font-medium text-xs rounded-lg">
                                                            {getInitials(m.name)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <CardTitle className="text-sm font-bold">{m.name}</CardTitle>
                                                        <CardDescription className="text-xs">{m.role}</CardDescription>
                                                    </div>
                                                </div>
                                                <div className={cn("w-2 h-2 rounded-full mt-1",
                                                    m.isActive ? "bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.6)]" : "bg-muted"
                                                )} />
                                            </CardHeader>
                                            <CardContent className="p-4 pt-0 space-y-3">
                                                {m.bio && <p className="text-sm text-muted-foreground line-clamp-2">{m.bio}</p>}
                                                <div className="flex items-center justify-between pt-2 border-t border-border/20">
                                                    <span className="text-xs text-muted-foreground">{m.email || "\u2014"}</span>
                                                    <div className="flex gap-1">
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg"
                                                            onClick={() => openEditDialog(m)}>
                                                            <Edit3 className="w-3.5 h-3.5" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-destructive"
                                                            onClick={() => setDeleteId(m.id)}>
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
                                                            <button onClick={toggleSelectAll}
                                                                className="text-muted-foreground hover:text-primary transition-colors">
                                                                {selectedIds.size === paginatedMembers.length && paginatedMembers.length > 0
                                                                    ? <CheckSquare className="w-4 h-4 text-primary" />
                                                                    : <Square className="w-4 h-4" />
                                                                }
                                                            </button>
                                                        </TableHead>
                                                        <TableHead className="w-[280px] text-xs font-medium uppercase tracking-wider text-muted-foreground px-6 h-auto cursor-pointer select-none"
                                                            onClick={() => handleSort("name")}>
                                                            <div className="flex items-center gap-1">Member <SortIcon field="name" /></div>
                                                        </TableHead>
                                                        <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground h-auto cursor-pointer select-none"
                                                            onClick={() => handleSort("role")}>
                                                            <div className="flex items-center gap-1">Role <SortIcon field="role" /></div>
                                                        </TableHead>
                                                        <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground h-auto">Status</TableHead>
                                                        <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground h-auto hidden md:table-cell cursor-pointer select-none"
                                                            onClick={() => handleSort("email")}>
                                                            <div className="flex items-center gap-1">Email <SortIcon field="email" /></div>
                                                        </TableHead>
                                                        <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground h-auto hidden md:table-cell cursor-pointer select-none"
                                                            onClick={() => handleSort("createdAt")}>
                                                            <div className="flex items-center gap-1">Created <SortIcon field="createdAt" /></div>
                                                        </TableHead>
                                                        <TableHead className="text-right text-xs font-medium uppercase tracking-wider text-muted-foreground px-6 h-auto">Actions</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {paginatedMembers.map((m) => (
                                                        <SortableRow key={m.id} m={m} openEditDialog={openEditDialog}
                                                            setDeleteId={setDeleteId} handleToggleActive={handleToggleActive}
                                                            isSelected={selectedIds.has(m.id)} onSelect={toggleSelect}
                                                        />
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </SortableContext>
                                    </DndContext>

                                    {/* Pagination */}
                                    {filteredMembers.length > MEMBERS_PER_PAGE && (
                                        <div className="flex items-center justify-between px-6 py-3 border-t border-border/50">
                                            <p className="text-xs text-muted-foreground">
                                                Showing {((currentPage - 1) * MEMBERS_PER_PAGE) + 1}&ndash;{Math.min(currentPage * MEMBERS_PER_PAGE, filteredMembers.length)} of {filteredMembers.length}
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

            {/* Create/Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-2xl rounded-2xl border-border/40 bg-card/60 backdrop-blur-xl shadow-2xl p-0 flex flex-col max-h-[85vh]">
                    <DialogHeader className="p-6 pb-3 shrink-0">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                            {editingMember ? <Edit3 className="w-5 h-5 text-primary" /> : <UserPlus className="w-5 h-5 text-primary" />}
                        </div>
                        <DialogTitle className="text-xl font-semibold">
                            {editingMember ? "Edit Member" : "Add Member"}
                        </DialogTitle>
                        <DialogDescription className="text-sm text-muted-foreground">
                            {editingMember ? "Update team member details and permissions." : "Register a new member to the team."}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSave} className="flex-1 overflow-y-auto px-6 space-y-4 pb-4" data-lenis-prevent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="tm-name" className="text-xs font-medium text-muted-foreground ml-1">Name</Label>
                                <Input id="tm-name" placeholder="John Doe" className="rounded-lg h-9 text-sm"
                                    required value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="tm-role" className="text-xs font-medium text-muted-foreground ml-1">Role</Label>
                                <Input id="tm-role" placeholder="Designer" className="rounded-lg h-9 text-sm"
                                    required value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })} />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="tm-email" className="text-xs font-medium text-muted-foreground ml-1">Email</Label>
                                <Input id="tm-email" type="email" placeholder="john@example.com" className="rounded-lg h-9 text-sm"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
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
                                                <Loader2 className="w-6 h-6 animate-spin text-white" />
                                                <span className="text-xs font-medium text-white">{uploadProgress}%</span>
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
                                {formData.avatar && !previewUrl && <p className="text-xs text-muted-foreground truncate">{formData.avatar}</p>}
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="tm-bio" className="text-xs font-medium text-muted-foreground ml-1">Bio</Label>
                            <Textarea id="tm-bio" placeholder="Brief description about the team member..."
                                className="rounded-lg text-sm min-h-[80px]" value={formData.bio}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })} />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="tm-social" className="text-xs font-medium text-muted-foreground ml-1">Social Links (JSON)</Label>
                            <Textarea id="tm-social" placeholder='[{"platform":"github","url":"https://..."}]'
                                className="rounded-lg font-mono text-xs min-h-[60px]" value={formData.socialLinks}
                                onChange={(e) => setFormData({ ...formData, socialLinks: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="tm-tags" className="text-xs font-medium text-muted-foreground ml-1">Tags</Label>
                                <div className="relative">
                                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input id="tm-tags" placeholder="frontend, lead, design"
                                        className="rounded-lg h-9 text-sm pl-10" value={formData.tags}
                                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })} />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="tm-order" className="text-xs font-medium text-muted-foreground ml-1">Order</Label>
                                <Input id="tm-order" type="number" placeholder="0" className="rounded-lg h-9 text-sm"
                                    value={formData.order}
                                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })} />
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-background/30 border border-border/30">
                            <Switch id="tm-active" checked={formData.isActive}
                                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })} />
                            <Label htmlFor="tm-active" className="text-sm cursor-pointer">Active</Label>
                        </div>
                        <DialogFooter className="flex gap-2">
                            <Button type="button" variant="ghost" className="rounded-lg h-9"
                                onClick={() => setDialogOpen(false)} disabled={isSaving}>Cancel</Button>
                            <Button type="submit" className="rounded-lg h-9 px-6 shadow-lg shadow-primary/30 font-medium"
                                disabled={isSaving}>
                                {isSaving ? "Saving..." : editingMember ? "Update" : "Add"}
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
                        <DialogTitle className="text-lg font-semibold">Remove member?</DialogTitle>
                        <DialogDescription className="text-sm text-destructive">This action cannot be undone</DialogDescription>
                    </DialogHeader>
                    <div className="text-center">
                        <p className="text-sm text-muted-foreground">This will permanently remove the team member.</p>
                    </div>
                    <DialogFooter className="flex-col sm:flex-col gap-2">
                        <Button className="w-full bg-destructive hover:bg-destructive/90 rounded-lg h-9 text-sm font-medium"
                            onClick={handleDelete}>Delete</Button>
                        <Button variant="ghost" className="w-full rounded-lg h-9" onClick={() => setDeleteId(null)}>Cancel</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Bulk Delete Confirmation */}
            <Dialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
                <DialogContent className="rounded-xl border-border/50 max-w-[400px] p-6">
                    <DialogHeader className="flex flex-col items-center text-center gap-2">
                        <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                            <Trash2 className="w-6 h-6 text-destructive" />
                        </div>
                        <DialogTitle className="text-lg font-semibold">Delete {selectedIds.size} members?</DialogTitle>
                        <DialogDescription className="text-sm text-destructive">This action cannot be undone</DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex-col sm:flex-col gap-2">
                        <Button className="w-full bg-destructive hover:bg-destructive/90 rounded-lg h-9 text-sm font-medium"
                            onClick={handleBulkDelete}>Delete All</Button>
                        <Button variant="ghost" className="w-full rounded-lg h-9" onClick={() => setBulkDeleteOpen(false)}>Cancel</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default withRoleProtection(TeamPage, ["Admin", "SuperAdmin"]);

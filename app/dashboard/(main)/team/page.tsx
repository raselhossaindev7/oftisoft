"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
    Search,
    Filter,
    MoreVertical,
    UserPlus,
    Download,
    Users,
    User,
    UserX,
    Trash2,
    RefreshCw,
    Activity,
    UsersRound,
    Edit3,
    Loader2,
    X,
    Tag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { teamMembersAPI, authAPI, TeamMember } from "@/lib/api";
import { withRoleProtection } from "@/components/auth/role-guard";

const EMPTY_FORM = {
    name: "",
    role: "",
    bio: "",
    avatar: "",
    email: "",
    socialLinks: "",
    tags: "",
    order: 0,
    isActive: true,
};

function TeamPage() {
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeSegment, setActiveSegment] = useState("All Members");
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [isSaving, setIsSaving] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAvatarUpload = async (file: File) => {
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            toast.error("Please select an image file");
            return;
        }
        setIsUploading(true);
        setUploadProgress(0);
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);
        try {
            const data = await authAPI.uploadAvatar(file);
            setUploadProgress(100);
            setFormData(prev => ({ ...prev, avatar: data.avatarUrl || data.avatar || "" }));
            toast.success("Avatar uploaded successfully");
        } catch {
            setPreviewUrl(null);
            toast.error("Failed to upload avatar");
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    const fetchMembers = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await teamMembersAPI.getAll();
            setMembers(data);
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to fetch team members");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMembers();
    }, [fetchMembers]);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await fetchMembers();
        setIsRefreshing(false);
        toast.success("Team roster synchronized");
    };

    const filteredMembers = (() => {
        const q = searchQuery.toLowerCase();
        let list = members;
        if (q) {
            list = list.filter(m =>
                (m.name || '').toLowerCase().includes(q) ||
                (m.email || "").toLowerCase().includes(q) ||
                (m.role || '').toLowerCase().includes(q)
            );
        }
        switch (activeSegment) {
            case "Active": return list.filter(m => m.isActive);
            case "Inactive": return list.filter(m => !m.isActive);
            default: return list;
        }
    })();

    const openCreateDialog = () => {
        setEditingMember(null);
        setFormData(EMPTY_FORM);
        setPreviewUrl(null);
        setUploadProgress(0);
        setIsUploading(false);
        setDialogOpen(true);
    };

    const openEditDialog = (member: TeamMember) => {
        setEditingMember(member);
        setFormData({
            name: member.name,
            role: member.role,
            bio: member.bio || "",
            avatar: member.avatar || "",
            email: member.email || "",
            socialLinks: member.socialLinks || "",
            tags: Array.isArray(member.tags) ? member.tags.join(", ") : member.tags || "",
            order: member.order,
            isActive: member.isActive,
        });
        setPreviewUrl(null);
        setUploadProgress(0);
        setIsUploading(false);
        setDialogOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const payload = {
                name: formData.name,
                role: formData.role,
                bio: formData.bio || undefined,
                avatar: formData.avatar || undefined,
                email: formData.email || undefined,
                socialLinks: formData.socialLinks || undefined,
                tags: formData.tags ? formData.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
                order: formData.order,
                isActive: formData.isActive,
            };

            if (editingMember) {
                await teamMembersAPI.update(editingMember.id, payload);
                toast.success("Team member updated");
            } else {
                await teamMembersAPI.create(payload);
                toast.success("Team member created");
            }
            await fetchMembers();
            setDialogOpen(false);
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to save team member");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await teamMembersAPI.delete(deleteId);
            setDeleteId(null);
            await fetchMembers();
            toast.success("Team member deleted");
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to delete team member");
        }
    };

    const handleExport = () => {
        if (filteredMembers.length === 0) {
            toast.info("No members to export");
            return;
        }
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
        a.href = url;
        a.download = `team-export-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Team export downloaded");
    };

    const getInitials = (name: string) =>
        name.split(" ").filter(Boolean).map(n => n[0]).join("").toUpperCase().slice(0, 2) || "TM";

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-semibold">Team Management</h1>
                    <p className="text-muted-foreground font-medium">Manage your team members, assign roles, and control access permissions.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" className="gap-2 rounded-xl h-11 border-border/50 bg-card/50 backdrop-blur-sm" onClick={handleRefresh}>
                        <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
                        Fast Sync
                    </Button>
                    <Button variant="outline" className="gap-2 rounded-xl h-11 border-border/50 bg-card/50 backdrop-blur-sm" onClick={handleExport}>
                        <Download className="w-4 h-4" />
                        Export
                    </Button>
                    <Button className="gap-2 rounded-xl h-11 shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 px-8 font-semibold"
                        onClick={openCreateDialog}
                    >
                        <UserPlus className="w-4 h-4" />
                        Add Member
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: "Total Members", value: members.length, color: "", bg: "bg-primary/10", text: "text-primary", hover: "hover:border-primary/30", sub: "Team Roster" },
                    { label: "Active", value: members.filter(m => m.isActive).length, color: "text-green-500", bg: "bg-green-500/10", text: "text-green-500", hover: "hover:border-green-500/30", sub: "Active" },
                    { label: "Inactive", value: members.filter(m => !m.isActive).length, color: "text-rose-500", bg: "bg-rose-500/10", text: "text-rose-500", hover: "hover:border-rose-500/30", sub: "Inactive" },
                ].map((s, i) => (
                    <Card key={i} className={cn("border-border/50 bg-card/40 backdrop-blur-md rounded-[2.5rem] overflow-hidden group transition-all h-full flex flex-col", s.hover)}>
                        <CardHeader className="flex flex-row items-center justify-between pb-1 p-5">
                            <CardTitle className="text-sm font-semibold uppercase text-muted-foreground">{s.label}</CardTitle>
                            <div className={cn("p-1.5 rounded-xl group-hover:scale-110 transition-transform", s.bg, s.text)}>
                                {i === 0 ? <Users className="h-4 w-4" /> : i === 1 ? <Activity className="h-4 w-4" /> : <UserX className="h-4 w-4" />}
                            </div>
                        </CardHeader>
                        <CardContent className="p-5 pt-0 flex-1">
                            <div className={cn("text-3xl font-semibold", s.color)}>{s.value}</div>
                            <p className={cn("text-xs uppercase mt-2 font-semibold opacity-60", s.color || "text-muted-foreground")}>{s.sub}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid lg:grid-cols-4 gap-8">
                {/* Sidebar Filters */}
                <div className="space-y-6">
                    <Card className="border-border/50 h-fit rounded-[2.5rem] overflow-hidden shadow-sm bg-card/40 backdrop-blur-md">
                        <CardHeader className="p-8 pb-4">
                            <CardTitle className="text-sm font-semibold uppercase text-muted-foreground">Member Filters</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <div className="flex flex-col gap-1">
                                {[
                                    { name: "All Members", count: members.length },
                                    { name: "Active", count: members.filter(m => m.isActive).length },
                                    { name: "Inactive", count: members.filter(m => !m.isActive).length },
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
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="relative flex-1 max-w-sm">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input placeholder="Search by name, email, role..."
                                        className="pl-10 h-11 rounded-xl bg-background font-medium"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="outline"
                                        size="sm"
                                        className="gap-2 rounded-xl h-10 font-bold px-4"
                                        onClick={() => toast.info("Use segment filters on the left to filter by status.")}
                                    >
                                        <Filter className="h-4 w-4" />
                                        Advanced
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
                                    <p className="text-sm text-primary font-semibold uppercase animate-pulse">Loading Team Roster...</p>
                                </div>
                            ) : filteredMembers.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-32 bg-muted/5">
                                    <div className="w-20 h-20 rounded-[2rem] bg-muted/20 flex items-center justify-center mb-6">
                                        <UsersRound className="h-10 w-10 text-muted-foreground/30" />
                                    </div>
                                    <h3 className="text-2xl font-semibold">No Records Found</h3>
                                    <p className="text-muted-foreground text-sm font-semibold uppercase max-w-xs text-center mt-3 opacity-60">The current query or segment returned no entities.</p>
                                    <Button variant="outline" className="mt-8 rounded-[1.2rem] font-semibold text-sm border-primary/20 text-primary px-10 h-11 hover:bg-primary hover:text-white transition-all" onClick={() => { setSearchQuery(""); setActiveSegment("All Members"); }}>RESET FILTERS</Button>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/10 hover:bg-transparent border-b border-border/50">
                                            <TableHead className="w-[280px] font-semibold uppercase text-sm px-6 h-auto">Member</TableHead>
                                            <TableHead className="font-semibold uppercase text-sm h-auto">Role</TableHead>
                                            <TableHead className="font-semibold uppercase text-sm h-auto">Status</TableHead>
                                            <TableHead className="font-semibold uppercase text-sm h-auto hidden md:table-cell">Email</TableHead>
                                            <TableHead className="font-semibold uppercase text-sm h-auto hidden md:table-cell">Created</TableHead>
                                            <TableHead className="text-right font-semibold uppercase text-sm px-6 h-auto">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredMembers.map((m) => (
                                            <TableRow key={m.id} className="group hover:bg-primary/[0.02] transition-all border-b border-border/20">
                                                <TableCell className="px-6 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="relative">
                                                            <Avatar className="h-12 w-12 border-2 border-background shadow-xl">
                                                                <AvatarImage src={m.avatar} />
                                                                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                                                                    {getInitials(m.name)}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            {m.isActive && (
                                                                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-background shadow-lg animate-pulse" />
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="font-semibold text-sm">{m.name}</span>
                                                            <span className="text-sm text-muted-foreground font-semibold uppercase opacity-60">{m.role}</span>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className="bg-primary/10 text-primary border-primary/20 rounded-lg text-sm font-semibold">
                                                        {m.role}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <div className={cn("w-2 h-2 rounded-full", m.isActive ? "bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.6)]" : "bg-muted")} />
                                                        <span className="text-xs font-semibold uppercase">{m.isActive ? "Active" : "Inactive"}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell">
                                                    <span className="text-sm font-medium text-muted-foreground">{m.email || "—"}</span>
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell">
                                                    <div className="flex flex-col gap-1">
                                                        <div className="text-sm font-semibold">{new Date(m.createdAt).toLocaleDateString()}</div>
                                                        <div className="text-xs font-semibold uppercase text-muted-foreground">{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right px-6">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-2xl hover:bg-muted/50">
                                                                    <MoreVertical className="h-5 w-5" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="w-56 rounded-[1.5rem] p-2 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.2)] border-border/50 backdrop-blur-xl">
                                                                <DropdownMenuLabel className="text-sm font-semibold uppercase text-muted-foreground px-3 py-2">Actions</DropdownMenuLabel>
                                                                <DropdownMenuItem className="gap-3 cursor-pointer rounded-xl font-semibold py-3 text-xs"
                                                                    onClick={() => openEditDialog(m)}
                                                                >
                                                                    <Edit3 className="w-4 h-4 text-primary" /> Edit Member
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator className="my-2 opacity-50" />
                                                                <DropdownMenuItem className="gap-3 text-destructive focus:bg-destructive/10 cursor-pointer rounded-xl font-semibold py-3 text-xs"
                                                                    onClick={() => setDeleteId(m.id)}
                                                                >
                                                                    <Trash2 className="w-4 h-4" /> Delete Member
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
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

            {/* Create/Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-3xl rounded-[2.5rem] border-border/40 bg-card/60 backdrop-blur-xl shadow-2xl p-0 flex flex-col max-h-[85vh]">
                    <DialogHeader className="p-8 pb-4 shrink-0">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                            {editingMember ? (
                                <Edit3 className="w-7 h-7 text-primary" />
                            ) : (
                                <UserPlus className="w-7 h-7 text-primary" />
                            )}
                        </div>
                        <DialogTitle className="text-3xl font-semibold  uppercase">
                            {editingMember ? "Edit Member" : "Add Member"}
                        </DialogTitle>
                        <DialogDescription className="text-sm font-semibold uppercase opacity-60 mt-1">
                            {editingMember ? "Update team member details and permissions." : "Register a new member to the team roster."}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSave} className="flex-1 overflow-y-auto px-8 space-y-5 pb-4" data-lenis-prevent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <Label htmlFor="tm-name" className="text-sm font-semibold uppercase ml-1 opacity-70">Name</Label>
                                <Input id="tm-name"
                                    placeholder="John Doe"
                                    className="rounded-[1.2rem] h-12 bg-background/50 border-border/50 font-semibold"
                                    required value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="tm-role" className="text-sm font-semibold uppercase ml-1 opacity-70">Role</Label>
                                <Input id="tm-role"
                                    placeholder="Developer"
                                    className="rounded-[1.2rem] h-12 bg-background/50 border-border/50 font-semibold"
                                    required value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <Label htmlFor="tm-email" className="text-sm font-semibold uppercase ml-1 opacity-70">Email</Label>
                                <Input id="tm-email"
                                    type="email"
                                    placeholder="john@oftisoft.network"
                                    className="rounded-[1.2rem] h-12 bg-background/50 border-border/50 font-semibold"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold uppercase ml-1 opacity-70">Avatar</Label>
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="relative rounded-[1.2rem] h-36 bg-background/50 border-2 border-dashed border-border/50 hover:border-primary/40 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer overflow-hidden"
                                >
                                    {previewUrl || formData.avatar ? (
                                        <img
                                            src={previewUrl || formData.avatar}
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
                                            <span className="text-xs font-semibold uppercase text-muted-foreground">Click to upload image</span>
                                        </>
                                    )}
                                    {isUploading && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <Loader2 className="w-6 h-6 animate-spin text-white" />
                                                <span className="text-xs font-semibold text-white">{uploadProgress}%</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {isUploading && (
                                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary rounded-full transition-all duration-300"
                                            style={{ width: `${uploadProgress}%` }}
                                        />
                                    </div>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleAvatarUpload(file);
                                    }}
                                />
                                {formData.avatar && !previewUrl && (
                                    <p className="text-xs text-muted-foreground truncate">{formData.avatar}</p>
                                )}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="tm-bio" className="text-sm font-semibold uppercase ml-1 opacity-70">Bio</Label>
                            <Textarea id="tm-bio"
                                placeholder="Brief description about the team member..."
                                className="rounded-[1.2rem] bg-background/50 border-border/50 font-medium min-h-[80px]"
                                value={formData.bio}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="tm-social" className="text-sm font-semibold uppercase ml-1 opacity-70">Social Links (JSON)</Label>
                            <Textarea id="tm-social"
                                placeholder='[{"platform":"github","url":"https://..."}]'
                                className="rounded-[1.2rem] bg-background/50 border-border/50 font-mono text-xs min-h-[60px]"
                                value={formData.socialLinks}
                                onChange={(e) => setFormData({ ...formData, socialLinks: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <Label htmlFor="tm-tags" className="text-sm font-semibold uppercase ml-1 opacity-70">Tags (comma separated)</Label>
                                <div className="relative">
                                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input id="tm-tags"
                                        placeholder="frontend, lead, design"
                                        className="rounded-[1.2rem] h-12 bg-background/50 border-border/50 font-semibold pl-10"
                                        value={formData.tags}
                                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="tm-order" className="text-sm font-semibold uppercase ml-1 opacity-70">Order</Label>
                                <Input id="tm-order"
                                    type="number"
                                    placeholder="0"
                                    className="rounded-[1.2rem] h-12 bg-background/50 border-border/50 font-semibold"
                                    value={formData.order}
                                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 rounded-[1.2rem] bg-background/30 border border-border/30">
                            <Switch id="tm-active"
                                checked={formData.isActive}
                                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                            />
                            <Label htmlFor="tm-active" className="text-sm font-semibold uppercase cursor-pointer opacity-70">
                                Active Status
                            </Label>
                        </div>
                        <DialogFooter className="pt-4 flex gap-3">
                            <Button type="button"
                                variant="ghost"
                                className="rounded-[1.2rem] h-12 px-6 font-semibold text-sm uppercase  opacity-60 hover:opacity-100"
                                onClick={() => setDialogOpen(false)}
                                disabled={isSaving}
                            >
                                Cancel
                            </Button>
                            <Button type="submit"
                                className="rounded-[1.2rem] h-12 px-10 font-semibold text-sm uppercase  shadow-xl shadow-primary/20 bg-primary hover:scale-[1.02] transition-transform"
                                disabled={isSaving}
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    editingMember ? "Update Member" : "Add Member"
                                )}
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
                        <DialogTitle className="text-2xl font-semibold">Remove Member?</DialogTitle>
                        <DialogDescription className="font-bold uppercase text-sm text-destructive">
                            This action cannot be undone
                        </DialogDescription>
                    </DialogHeader>
                    <div className="p-4 text-center">
                        <p className="text-sm font-medium text-muted-foreground">This will permanently remove the team member and all associated data from the system.</p>
                    </div>
                    <DialogFooter className="flex-col sm:flex-col gap-2 pt-4">
                        <Button className="w-full bg-destructive hover:bg-destructive/90 rounded-xl h-auto font-semibold shadow-lg shadow-destructive/20"
                            onClick={handleDelete}
                        >
                            CONFIRM DELETE
                        </Button>
                        <Button variant="ghost" className="w-full rounded-xl h-11 font-bold" onClick={() => setDeleteId(null)}>Cancel</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default withRoleProtection(TeamPage, ["Admin", "SuperAdmin"]);

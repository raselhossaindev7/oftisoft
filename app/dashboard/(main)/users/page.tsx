"use client";

import { useState, useEffect } from "react";
import { 
    Search, 
    Filter, 
    MoreHorizontal, 
    Mail, 
    MessageSquare, 
    UserPlus, 
    Download,
    Users,
    Star,
    TrendingUp,
    ShieldCheck,
    Clock,
    MoreVertical,
    ChevronRight,
    SearchX,
    Trash2,
    ShieldAlert,
    RefreshCw,
    Activity
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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { toast } from "sonner";
import { useUsers } from "@/hooks/useUsers";
import { AddUserDialog } from "@/components/dashboard/add-user-dialog";
import { 
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { withRoleProtection } from "@/components/auth/role-guard";

function UsersPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [activeSegment, setActiveSegment] = useState("All Users");
    const { users, isLoading, fetchUsers, toggleUserStatus, deleteUser } = useUsers();
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isToggling, setIsToggling] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isAddUserOpen, setIsAddUserOpen] = useState(false);
    const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false);
    const [filterRole, setFilterRole] = useState("all");
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterDateFrom, setFilterDateFrom] = useState("");
    const [filterDateTo, setFilterDateTo] = useState("");
    
    // New Dialog States
  const [selectedUser, setSelectedUser] = useState<any>(null);
    const [isEmailOpen, setIsEmailOpen] = useState(false);
    const [isMessageOpen, setIsMessageOpen] = useState(false);
    const [emailSubject, setEmailSubject] = useState("");
    const [emailBody, setEmailBody] = useState("");
    const [messageContent, setMessageContent] = useState("");

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchQuery), 400);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await fetchUsers({ search: debouncedSearch });
        setIsRefreshing(false);
        toast.success("Refreshed");
    };

    useEffect(() => {
        fetchUsers({ search: debouncedSearch });
    }, [fetchUsers, debouncedSearch]);

    const filteredUsers = (() => {
        switch (activeSegment) {
            case "Active Users": return users.filter(u => u.isActive === true);
            case "Deactivated": return users.filter(u => u.isActive !== true);
            case "Admins": return users.filter(u => u.role === "Admin");
            case "Support Staff": return users.filter(u => u.role === "Support");
            case "Managers": return users.filter(u => u.role === "Editor");
            default: return users;
        }
    })();

    const newUsersLast7Days = users.filter(u => {
        if (!u.createdAt) return false;
        const createdDate = new Date(u.createdAt);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return createdDate >= sevenDaysAgo;
    }).length;

    const getRoleBadge = (role: string) => {
        switch (role) {
            case "Admin":
                return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 gap-1 rounded-lg"><Star className="w-3 h-3 fill-amber-500" /> Admin</Badge>;
            case "Editor":
                return <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20 gap-1 rounded-lg"><ShieldCheck className="w-3 h-3" /> Editor</Badge>;
            case "Support":
                return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 rounded-lg">Support</Badge>;
            default:
                return <Badge variant="outline" className="border-border/50 rounded-lg">{role}</Badge>;
        }
    };

    const handleExport = () => {
        if (filteredUsers.length === 0) {
            toast.info("No users to export for current segment.");
            return;
        }
        const headers = ["Name", "Email", "Role", "Status", "Created"];
        const rows = filteredUsers.map(u => [
            (u.name || "").replace(/"/g, '""'),
            (u.email || "").replace(/"/g, '""'),
            u.role || "",
            u.isActive ? "Active" : "Inactive",
            new Date(u.createdAt).toISOString(),
        ].map(c => `"${c}"`).join(","));
        const csv = [headers.join(","), ...rows].join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `users-export-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Exported");
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-semibold">Users</h1>
                    <p className="text-muted-foreground text-sm">Manage your users, segment them, and track engagement.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" className="gap-2 rounded-lg h-9 border-border/50 bg-card/50 backdrop-blur-sm" onClick={handleRefresh}>
                        <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
                        Refresh
                    </Button>
                    <Button variant="outline" className="gap-2 rounded-lg h-9 border-border/50 bg-card/50 backdrop-blur-sm" onClick={handleExport}>
                        <Download className="w-4 h-4" />
                        Export
                    </Button>
                    <Button 
                        className="gap-2 rounded-lg h-9 shadow-sm bg-primary hover:bg-primary/90 px-6"
                        onClick={() => setIsAddUserOpen(true)}
                    >
                        <UserPlus className="w-4 h-4" />
                        Add User
                    </Button>
                </div>
            </div>

            <AddUserDialog 
                open={isAddUserOpen} 
                onOpenChange={setIsAddUserOpen}
                onSuccess={() => fetchUsers({ search: debouncedSearch })}
            />

            {/* User Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground font-medium">Total Users</p>
                            <p className="text-lg font-semibold mt-0.5">{users.length}</p>
                            <p className="text-xs text-muted-foreground mt-1">Registered accounts</p>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Users className="w-5 h-5 text-primary" />
                        </div>
                    </div>
                </div>
                <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground font-medium">Active</p>
                            <p className="text-lg font-semibold text-green-500 mt-0.5">{users.filter(u => u.isActive).length}</p>
                            <p className="text-xs text-green-500/70 mt-1">Active accounts</p>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                            <Activity className="w-5 h-5 text-green-500" />
                        </div>
                    </div>
                </div>
                <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground font-medium">Verified</p>
                            <p className="text-lg font-semibold mt-0.5">
                                {users.length > 0 ? ((users.filter(u => u.isEmailVerified).length / users.length) * 100).toFixed(0) : 0}%
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">Email verified</p>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                            <ShieldCheck className="w-5 h-5 text-purple-500" />
                        </div>
                    </div>
                </div>
                <div className="bg-primary rounded-xl p-5 relative overflow-hidden">
                    <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
                    <div className="flex items-center justify-between relative z-10">
                        <div>
                            <p className="text-xs font-medium text-primary-foreground/70">New (7d)</p>
                            <p className="text-lg font-semibold text-white mt-0.5">+{newUsersLast7Days}</p>
                            <p className="text-xs text-white/60 mt-1">Joined this week</p>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-white" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-4 gap-6">
                {/* Sidebar Filters */}
                <div className="space-y-6">
                    <Card className="border-border/50 overflow-hidden shadow-sm bg-card/40 backdrop-blur-md">
                        <CardHeader className="p-5 pb-3">
                            <CardTitle className="text-xs font-medium text-muted-foreground">Segments</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <div className="flex flex-col gap-1">
                                {[
                                    { name: "All Users", count: users.length },
                                    { name: "Active Users", count: users.filter((u) => u.isActive).length },
                                    { name: "Admins", count: users.filter((u) => u.role === "Admin").length },
                                    { name: "Support Staff", count: users.filter((u) => u.role === "Support").length },
                                    { name: "Managers", count: users.filter((u) => u.role === "Editor").length },
                                    { name: "Deactivated", count: users.filter((u) => !u.isActive).length },
                                ].map((segment) => (
                                    <button 
                                        key={segment.name}
                                        onClick={() => setActiveSegment(segment.name)}
                                        className={cn(
                                            "flex items-center justify-between px-4 py-2.5 rounded-lg text-sm transition-all group",
                                            activeSegment === segment.name
                                                ? "bg-primary text-white font-medium shadow-sm"
                                                : "text-muted-foreground font-medium hover:bg-primary/5 hover:text-primary"
                                        )}
                                    >
                                        <span>{segment.name}</span>
                                        <span className={cn(
                                            "px-2 py-0.5 rounded-md text-xs font-medium",
                                            activeSegment === segment.name ? "bg-white/20 text-white" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                                        )}>{segment.count}</span>
                                    </button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border/50 bg-primary/5 border-dashed">
                        <CardHeader className="p-5 pb-3">
                            <CardTitle className="text-xs font-medium text-primary flex items-center gap-2">
                                <Clock className="w-3.5 h-3.5" /> Sync
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-5 pb-5 pt-0 space-y-3">
                            <p className="text-xs text-muted-foreground/70">Segments are synced with downstream services every 6 hours.</p>
                            <Button variant="outline" className="w-full rounded-lg text-xs h-8 bg-background border-primary/20 text-primary hover:bg-primary hover:text-white transition-all" onClick={handleRefresh}>Refresh</Button>
                        </CardContent>
                    </Card>
                </div>

                {/* User List */}
                <div className="lg:col-span-3 space-y-4">
                    <Card className="border-border/50 overflow-hidden shadow-sm">
                        <CardHeader className="p-5 border-b border-border/50 bg-muted/5">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="relative flex-1 max-w-sm">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input 
                                        placeholder="Search by name, email, city..." 
                                        className="pl-10 h-9 rounded-lg bg-background"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="outline"
                                        size="sm"
                                        className="gap-2 rounded-lg h-9 px-4"
                                        onClick={() => setIsAdvancedFilterOpen(true)}
                                    >
                                        <Filter className="w-4 h-4" />
                                        Advanced
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {isLoading && users.length === 0 ? (
                                <div className="py-24 flex flex-col items-center justify-center gap-4">
                                    <RefreshCw className="h-8 w-8 text-muted-foreground animate-spin" />
                                    <p className="text-sm text-muted-foreground">Loading users...</p>
                                </div>
                            ) : filteredUsers.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-24 bg-muted/5">
                                    <div className="w-14 h-14 rounded-xl bg-muted/20 flex items-center justify-center mb-4">
                                        <SearchX className="h-7 w-7 text-muted-foreground/40" />
                                    </div>
                                    <h3 className="text-lg font-medium">No results</h3>
                                    <p className="text-muted-foreground text-sm max-w-xs text-center mt-1">Try adjusting your search or filter to find what you're looking for.</p>
                                    <Button variant="outline" className="mt-6 rounded-lg text-sm px-6 h-9" onClick={() => { setSearchQuery(""); setActiveSegment("All Users"); }}>Clear Filters</Button>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/5 hover:bg-transparent border-b border-border/50">
                                            <TableHead className="px-5 text-xs font-medium uppercase text-muted-foreground h-10">User</TableHead>
                                            <TableHead className="text-xs font-medium uppercase text-muted-foreground h-10">Role</TableHead>
                                            <TableHead className="text-xs font-medium uppercase text-muted-foreground h-10">Joined</TableHead>
                                            <TableHead className="text-xs font-medium uppercase text-muted-foreground h-10">Status</TableHead>
                                            <TableHead className="text-right pr-5 text-xs font-medium uppercase text-muted-foreground h-10">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredUsers.map((u) => (
                                            <TableRow key={u.id} className="group hover:bg-primary/[0.02] transition-all border-b border-border/20">
                                                <TableCell className="px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="relative">
                                                            <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                                                                <AvatarImage src={u.avatarUrl} />
                                                                <AvatarFallback className="bg-primary/10 text-primary font-medium text-xs">
                                                                    {(u.name || "U").split(" ").filter(Boolean).map((n) => n[0]).join("").toUpperCase() || "U"}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            {u.isActive && (
                                                                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-background shadow-sm" />
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="font-medium text-sm">{u.name || "—"}</span>
                                                            <span className="text-xs text-muted-foreground">{u.email || "—"}</span>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{getRoleBadge(u.role)}</TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col gap-0.5">
                                                        <div className="text-sm font-medium">{new Date(u.createdAt).toLocaleDateString()}</div>
                                                        <div className="text-xs text-muted-foreground">{new Date(u.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} UTC</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-2 h-2 rounded-full ${u.isActive ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" : "bg-muted"}`} />
                                                        <span className="text-xs font-medium">{u.isActive ? "Active" : "Inactive"}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right pr-5">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Button asChild variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-primary hover:bg-primary/10 transition-all">
                                                            <Link href={`/dashboard/users/${u.id}`}>
                                                                <ChevronRight className="w-4 h-4" />
                                                            </Link>
                                                        </Button>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-muted/50">
                                                                    <MoreVertical className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="w-56 rounded-xl p-2 shadow-lg border-border/50 backdrop-blur-xl">
                                                                <DropdownMenuLabel className="text-xs font-medium text-muted-foreground px-3 py-1.5">Actions</DropdownMenuLabel>
                                                                <DropdownMenuItem 
                                                                    className="gap-3 cursor-pointer rounded-lg py-2.5 text-xs font-medium" 
                                                                    onClick={() => {
                                                                        setSelectedUser(u);
                                                                        setIsEmailOpen(true);
                                                                    }}
                                                                >
                                                                    <Mail className="w-4 h-4 text-primary" /> Email User
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem 
                                                                    className="gap-3 cursor-pointer rounded-lg py-2.5 text-xs font-medium" 
                                                                    onClick={() => {
                                                                        setSelectedUser(u);
                                                                        setIsMessageOpen(true);
                                                                    }}
                                                                >
                                                                    <MessageSquare className="w-4 h-4 text-purple-500" /> Send Message
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator className="my-1 opacity-50" />
                                                                <DropdownMenuItem 
                                                                    className="gap-3 cursor-pointer rounded-lg py-2.5 text-xs font-medium"
                                                                    onClick={async () => {
                                                                        setIsToggling(u.id);
                                                                        try {
                                                                            await toggleUserStatus(u.id);
                                                                        } catch {} finally {
                                                                            setIsToggling(null);
                                                                        }
                                                                    }}
                                                                    disabled={isToggling === u.id}
                                                                >
                                                                    <ShieldAlert className={cn("w-4 h-4 text-amber-500", isToggling === u.id && "animate-spin")} /> 
                                                                    {isToggling === u.id ? "Updating..." : (u.isActive ? "Deactivate" : "Activate")}
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem className="gap-3 text-destructive focus:bg-destructive/10 cursor-pointer rounded-lg py-2.5 text-xs font-medium"
                                                                    onClick={() => setDeleteId(u.id)}
                                                                >
                                                                    <Trash2 className="w-4 h-4" /> Delete User
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

            {/* DIALOGS */}

            {/* Email Dialog */}
            <Dialog open={isEmailOpen} onOpenChange={(open) => { setIsEmailOpen(open); if (!open) { setEmailSubject(""); setEmailBody(""); } }}>
                <DialogContent className="sm:max-w-lg rounded-xl border-border/40 bg-card shadow-lg p-0 flex flex-col max-h-[85vh]">
                    <DialogHeader className="p-6 pb-4 shrink-0">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                            <Mail className="w-5 h-5 text-primary" />
                        </div>
                        <DialogTitle className="text-lg font-semibold">Send Email</DialogTitle>
                        <DialogDescription className="text-sm text-muted-foreground">
                            Send a message to <span className="font-medium text-foreground">{selectedUser?.email}</span>
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={(e) => { e.preventDefault(); toast.success(`Email sent to ${selectedUser?.email}`); setIsEmailOpen(false); setEmailSubject(""); setEmailBody(""); }} className="flex-1 overflow-y-auto px-6 space-y-4 pb-4" data-lenis-prevent>
                        <div className="space-y-1.5">
                            <Label className="text-sm font-medium">Subject</Label>
                            <Input placeholder="Official Account Notice" className="rounded-lg h-9" value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-sm font-medium">Message</Label>
                            <textarea 
                                className="w-full h-28 rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none transition-all"
                                placeholder="Enter message..."
                                value={emailBody}
                                onChange={(e) => setEmailBody(e.target.value)}
                            />
                        </div>
                        <DialogFooter className="gap-2">
                            <Button variant="ghost" className="rounded-lg h-9" type="button" onClick={() => setIsEmailOpen(false)}>Cancel</Button>
                            <Button className="rounded-lg h-9 px-6" type="submit" disabled={!emailBody.trim()}>
                                Send
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Message Dialog */}
            <Dialog open={isMessageOpen} onOpenChange={(open) => { setIsMessageOpen(open); if (!open) setMessageContent(""); }}>
                <DialogContent className="sm:max-w-lg rounded-xl border-border/40 bg-card shadow-lg p-0 flex flex-col max-h-[85vh]">
                    <DialogHeader className="p-6 pb-4 shrink-0">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center mb-3">
                            <MessageSquare className="w-5 h-5 text-purple-500" />
                        </div>
                        <DialogTitle className="text-lg font-semibold">Send Message</DialogTitle>
                        <DialogDescription className="text-sm text-muted-foreground">
                            Send a notification to <span className="font-medium text-foreground">{selectedUser?.name}</span>
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={(e) => { e.preventDefault(); toast.success(`Alert sent to ${selectedUser?.name}`); setIsMessageOpen(false); setMessageContent(""); }} className="flex-1 overflow-y-auto px-6 space-y-4 pb-4" data-lenis-prevent>
                        <textarea 
                            className="w-full h-24 rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/20 resize-none transition-all"
                            placeholder="Type message..."
                            value={messageContent}
                            onChange={(e) => setMessageContent(e.target.value)}
                        />
                        <Button className="w-full rounded-lg h-9 bg-purple-600 hover:bg-purple-700" type="submit" disabled={!messageContent.trim()}>
                            Send
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>
            
            {/* Delete Confirmation */}
            <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <DialogContent className="rounded-xl border-border/50 max-w-[400px]">
                    <DialogHeader className="flex flex-col items-center text-center">
                        <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center mb-3">
                            <Trash2 className="w-6 h-6 text-destructive" />
                        </div>
                        <DialogTitle className="text-lg font-semibold">Delete User</DialogTitle>
                        <DialogDescription className="text-sm text-muted-foreground">
                            This action cannot be undone. This will permanently delete the user account and all associated data.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex-col sm:flex-col gap-2">
                        <Button 
                            className="w-full rounded-lg h-9 bg-destructive hover:bg-destructive/90 shadow-sm"
                            onClick={async () => {
                                if (!deleteId) return;
                                setIsDeleting(true);
                                try {
                                    await deleteUser(deleteId);
                                    setDeleteId(null);
                                } catch {
                                } finally {
                                    setIsDeleting(false);
                                }
                            }}
                            disabled={isDeleting}
                        >
                            {isDeleting ? "Deleting..." : "Delete"}
                        </Button>
                        <Button variant="ghost" className="w-full rounded-lg h-9" onClick={() => setDeleteId(null)}>Cancel</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Advanced Filter Dialog */}
            <Dialog open={isAdvancedFilterOpen} onOpenChange={setIsAdvancedFilterOpen}>
                <DialogContent className="sm:max-w-md rounded-xl border-border/50">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
                            <Filter className="w-4 h-4 text-primary" /> Filters
                        </DialogTitle>
                        <DialogDescription className="text-sm text-muted-foreground">Filter users by role, status, and date range.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <Label className="text-sm font-medium">Role</Label>
                            <select 
                                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                                value={filterRole}
                                onChange={(e) => setFilterRole(e.target.value)}
                            >
                                <option value="all">All Roles</option>
                                <option value="Admin">Admin</option>
                                <option value="Editor">Editor</option>
                                <option value="Support">Support</option>
                                <option value="Viewer">Viewer</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-sm font-medium">Status</Label>
                            <select 
                                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-sm font-medium">From</Label>
                                <Input type="date" value={filterDateFrom} onChange={(e) => setFilterDateFrom(e.target.value)} className="rounded-lg h-9" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-sm font-medium">To</Label>
                                <Input type="date" value={filterDateTo} onChange={(e) => setFilterDateTo(e.target.value)} className="rounded-lg h-9" />
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="gap-2">
                        <Button variant="ghost" className="rounded-lg h-9" onClick={() => {
                            setFilterRole("all");
                            setFilterStatus("all");
                            setFilterDateFrom("");
                            setFilterDateTo("");
                            setActiveSegment("All Users");
                            setIsAdvancedFilterOpen(false);
                        }}>Reset</Button>
                        <Button className="rounded-lg h-9" onClick={() => {
                            if (filterRole !== "all") {
                                const roleMap: Record<string, string> = { Admin: "Admins", Editor: "Managers", Support: "Support Staff" };
                                setActiveSegment(roleMap[filterRole] || "All Users");
                            }
                            if (filterStatus !== "all") {
                                setActiveSegment(filterStatus === "active" ? "Active Users" : "Deactivated");
                            }
                            setIsAdvancedFilterOpen(false);
                            toast.success("Filters applied");
                        }}>Apply</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default withRoleProtection(UsersPage, ["Admin", "SuperAdmin"]);

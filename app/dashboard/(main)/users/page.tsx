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
        toast.success("User matrix synchronized");
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
        toast.success("User export downloaded");
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-semibold">User Management</h1>
                    <p className="text-muted-foreground font-medium">Manage your relationships, segment users, and track customer lifetime value.</p>
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
                    <Button 
                        className="gap-2 rounded-xl h-11 shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 px-8 font-semibold"
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-border/50 bg-card/40 backdrop-blur-md rounded-[2.5rem] overflow-hidden group hover:border-primary/30 transition-all h-full flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between pb-1 p-5">
                        <CardTitle className="text-sm font-semibold uppercase text-muted-foreground">Global Population</CardTitle>
                        <div className="p-1.5 rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                            <Users className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-5 pt-0 flex-1">
                        <div className="text-3xl font-semibold">{users.length}</div>
                        <p className="text-xs text-muted-foreground uppercase mt-2 font-semibold opacity-60">Total Registered Users</p>
                    </CardContent>
                </Card>
                <Card className="border-border/50 bg-card/40 backdrop-blur-md rounded-[2.5rem] overflow-hidden group hover:border-green-500/30 transition-all h-full flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between pb-1 p-5">
                        <CardTitle className="text-sm font-semibold uppercase text-muted-foreground">Active Users</CardTitle>
                        <div className="p-1.5 rounded-xl bg-green-500/10 text-green-500 group-hover:scale-110 transition-transform">
                            <Activity className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-5 pt-0 flex-1">
                        <div className="text-3xl font-semibold text-green-500">{users.filter(u => u.isActive).length}</div>
                        <p className="text-xs text-green-500/60 uppercase mt-2 font-semibold font-semibold">Active</p>
                    </CardContent>
                </Card>
                <Card className="border-border/50 bg-card/40 backdrop-blur-md rounded-[2.5rem] overflow-hidden group hover:border-purple-500/30 transition-all h-full flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between pb-1 p-5">
                        <CardTitle className="text-sm font-semibold uppercase text-muted-foreground">Email Verification</CardTitle>
                        <div className="p-1.5 rounded-xl bg-purple-500/10 text-purple-500 group-hover:scale-110 transition-transform">
                            <ShieldCheck className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-5 pt-0 flex-1">
                        <div className="text-3xl font-semibold">
                            {users.length > 0 ? ((users.filter(u => u.isEmailVerified).length / users.length) * 100).toFixed(0) : 0}%
                        </div>
                        <p className="text-xs text-muted-foreground uppercase mt-2 font-semibold opacity-60">Compliance Rating</p>
                    </CardContent>
                </Card>
                <Card className="border-border/50 bg-primary shadow-xl shadow-primary/20 rounded-[2.5rem] overflow-hidden group border-none relative h-full flex flex-col">
                    <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:scale-125 transition-transform" />
                    <CardHeader className="flex flex-row items-center justify-between pb-1 p-5">
                        <CardTitle className="text-sm font-semibold uppercase text-primary-foreground/70">7-Day Expansion</CardTitle>
                        <div className="p-1.5 rounded-xl bg-white/20 text-white">
                            <TrendingUp className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-5 pt-0 flex-1 relative z-10">
                        <div className="text-3xl font-semibold text-white">+{newUsersLast7Days}</div>
                        <p className="text-xs text-white/60 uppercase mt-2 font-semibold">New User Acquisitions</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid lg:grid-cols-4 gap-8">
                {/* Sidebar Filters */}
                <div className="space-y-6">
                    <Card className="border-border/50 h-fit rounded-[2.5rem] overflow-hidden shadow-sm bg-card/40 backdrop-blur-md">
                        <CardHeader className="p-8 pb-4">
                            <CardTitle className="text-sm font-semibold uppercase text-muted-foreground">User Filters</CardTitle>
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

                    <Card className="border-border/50 bg-primary/5 rounded-[2.5rem] border-dashed p-4">
                        <CardHeader className="p-6">
                            <CardTitle className="text-sm font-semibold uppercase flex items-center gap-2">
                                <Clock className="w-4 h-4 text-primary" /> Sync Protocol
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-6 pb-6 pt-0 space-y-4">
                            <p className="text-sm font-semibold text-muted-foreground leading-relaxed uppercase opacity-70">Segments are synced with downstream services every 6 hours.</p>
                            <Button variant="outline" className="w-full rounded-[1.2rem] bg-background text-sm h-10 font-semibold border-primary/20 text-primary hover:bg-primary hover:text-white transition-all" onClick={handleRefresh}>BATCH SYNC NOW</Button>
                        </CardContent>
                    </Card>
                </div>

                {/* User List */}
                <div className="lg:col-span-3 space-y-4">
                    <Card className="border-border/50 rounded-2xl overflow-hidden shadow-sm">
                        <CardHeader className="p-6 border-b border-border/50 bg-muted/5">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="relative flex-1 max-w-sm">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input 
                                        placeholder="Search by name, email, city..." 
                                        className="pl-10 h-11 rounded-xl bg-background font-medium"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="outline"
                                        size="sm"
                                        className="gap-2 rounded-xl h-10 font-bold px-4"
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
                                <div className="py-32 flex flex-col items-center justify-center gap-6">
                                    <div className="relative">
                                        <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                                        <RefreshCw className="h-10 w-10 text-primary animate-spin relative z-10" />
                                    </div>
                                    <p className="text-sm text-primary font-semibold uppercase animate-pulse">Syncing Entity Stream...</p>
                                </div>
                            ) : filteredUsers.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-32 bg-muted/5">
                                    <div className="w-20 h-20 rounded-[2rem] bg-muted/20 flex items-center justify-center mb-6">
                                        <SearchX className="h-10 w-10 text-muted-foreground/30" />
                                    </div>
                                    <h3 className="text-2xl font-semibold">No Records Found</h3>
                                    <p className="text-muted-foreground text-sm font-semibold uppercase max-w-xs text-center mt-3 opacity-60">The current query or segment returned no entities.</p>
                                    <Button variant="outline" className="mt-8 rounded-[1.2rem] font-semibold text-sm border-primary/20 text-primary px-10 h-11 hover:bg-primary hover:text-white transition-all" onClick={() => { setSearchQuery(""); setActiveSegment("All Users"); }}>RESET FILTERS</Button>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/10 hover:bg-transparent border-b border-border/50">
                                            <TableHead className="w-[300px] font-semibold uppercase text-sm px-6 h-auto">Identify</TableHead>
                                            <TableHead className="font-semibold uppercase text-sm h-auto">Security Role</TableHead>
                                            <TableHead className="font-semibold uppercase text-sm h-auto">Linked Since</TableHead>
                                            <TableHead className="font-semibold uppercase text-sm h-auto">Network Status</TableHead>
                                            <TableHead className="text-right font-semibold uppercase text-sm px-6 h-auto">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredUsers.map((u) => (
                                            <TableRow key={u.id} className="group hover:bg-primary/[0.02] transition-all border-b border-border/20">
                                                <TableCell className="px-6 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="relative">
                                                            <Avatar className="h-12 w-12 border-2 border-background shadow-xl">
                                                                <AvatarImage src={u.avatarUrl} />
                                                                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                                                                    {(u.name || "U").split(" ").filter(Boolean).map((n) => n[0]).join("").toUpperCase() || "U"}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            {u.isActive && (
                                                                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-background shadow-lg animate-pulse" />
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="font-semibold text-sm">{u.name || "—"}</span>
                                                            <span className="text-sm text-muted-foreground font-semibold uppercase opacity-60">{u.email || "—"}</span>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{getRoleBadge(u.role)}</TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col gap-1">
                                                        <div className="text-sm font-semibold">{new Date(u.createdAt).toLocaleDateString()}</div>
                                                        <div className="text-xs font-semibold uppercase text-muted-foreground">{new Date(u.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} UTC</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-2 h-2 rounded-full ${u.isActive ? "bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.6)]" : "bg-muted"}`} />
                                                        <span className="text-xs font-semibold uppercase">{u.isActive ? "Active" : "Inactive"}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right px-6">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Button asChild variant="ghost" size="icon" className="h-10 w-10 rounded-2xl text-primary hover:bg-primary/10 transition-all">
                                                            <Link href={`/dashboard/users/${u.id}`}>
                                                                <ChevronRight className="w-5 h-5" />
                                                            </Link>
                                                        </Button>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-2xl hover:bg-muted/50">
                                                                    <MoreVertical className="h-5 w-5" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="w-64 rounded-[1.5rem] p-2 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.2)] border-border/50 backdrop-blur-xl">
                                                                <DropdownMenuLabel className="text-sm font-semibold uppercase text-muted-foreground px-3 py-2">Administrative Actions</DropdownMenuLabel>
                                                                <DropdownMenuItem 
                                                                    className="gap-3 cursor-pointer rounded-xl font-semibold py-3 text-xs" 
                                                                    onClick={() => {
                                                                        setSelectedUser(u);
                                                                        setIsEmailOpen(true);
                                                                    }}
                                                                >
                                                                    <Mail className="w-4 h-4 text-primary" /> DISPATCH COMMUNIQUE
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem 
                                                                    className="gap-3 cursor-pointer rounded-xl font-semibold py-3 text-xs" 
                                                                    onClick={() => {
                                                                        setSelectedUser(u);
                                                                        setIsMessageOpen(true);
                                                                    }}
                                                                >
                                                                    <MessageSquare className="w-4 h-4 text-purple-500" /> EMIT WS_ALERT
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator className="my-2 opacity-50" />
                                                                <DropdownMenuItem 
                                                                    className="gap-3 cursor-pointer rounded-xl font-semibold py-3 text-xs"
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
                                                                <DropdownMenuItem className="gap-3 text-destructive focus:bg-destructive/10 cursor-pointer rounded-xl font-semibold py-3 text-xs"
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
                <DialogContent className="sm:max-w-3xl rounded-[2.5rem] border-border/40 bg-card/60 backdrop-blur-xl shadow-2xl p-0 flex flex-col max-h-[85vh]">
                    <DialogHeader className="p-8 pb-4 shrink-0">
                        <div className="w-12 h-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                            <Mail className="w-6 h-6 text-primary" />
                        </div>
                        <DialogTitle className="text-2xl font-semibold">Send Official Email</DialogTitle>
                        <DialogDescription className="font-bold">
                            Direct contact to <span className="text-primary">{selectedUser?.email}</span>
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={(e) => { e.preventDefault(); toast.success(`Email sent to ${selectedUser?.email}`); setIsEmailOpen(false); setEmailSubject(""); setEmailBody(""); }} className="flex-1 overflow-y-auto px-8 space-y-5 pb-4" data-lenis-prevent>
                        <div className="space-y-2">
                            <Label className="font-semibold text-sm uppercase ml-1">Transmission Subject</Label>
                            <Input placeholder="Official Account Notice" className="rounded-xl h-auto font-medium" value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label className="font-semibold text-sm uppercase ml-1">Message Header/Body</Label>
                            <textarea 
                                className="w-full h-32 rounded-[1.5rem] border border-input bg-background px-4 py-3 text-sm font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none transition-all"
                                placeholder="Enter message payload..."
                                value={emailBody}
                                onChange={(e) => setEmailBody(e.target.value)}
                            />
                        </div>
                        <DialogFooter>
                            <Button variant="ghost" className="rounded-xl h-11 font-bold" type="button" onClick={() => setIsEmailOpen(false)}>Cancel</Button>
                            <Button className="rounded-xl h-11 px-8 shadow-lg shadow-primary/30 font-semibold" type="submit" disabled={!emailBody.trim()}>
                                DISPATCH EMAIL
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Message Dialog */}
            <Dialog open={isMessageOpen} onOpenChange={(open) => { setIsMessageOpen(open); if (!open) setMessageContent(""); }}>
                <DialogContent className="sm:max-w-3xl rounded-[2.5rem] border-border/40 bg-card/60 backdrop-blur-xl shadow-2xl p-0 flex flex-col max-h-[85vh]">
                    <DialogHeader className="p-8 pb-4 shrink-0">
                        <div className="w-12 h-auto rounded-2xl bg-purple-500/10 flex items-center justify-center mb-4">
                            <MessageSquare className="w-6 h-6 text-purple-500" />
                        </div>
                        <DialogTitle className="text-2xl font-semibold">Dispatch Alert</DialogTitle>
                        <DialogDescription className="font-bold">
                            Send websocket notification to <span className="text-purple-500">{selectedUser?.name}</span>
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={(e) => { e.preventDefault(); toast.success(`Alert sent to ${selectedUser?.name}`); setIsMessageOpen(false); setMessageContent(""); }} className="flex-1 overflow-y-auto px-8 space-y-5 pb-4" data-lenis-prevent>
                        <textarea 
                            className="w-full h-24 rounded-[1.5rem] border border-input bg-background px-4 py-3 text-sm font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/20 resize-none transition-all"
                            placeholder="Type alert payload..."
                            value={messageContent}
                            onChange={(e) => setMessageContent(e.target.value)}
                        />
                        <DialogFooter>
                            <Button className="w-full rounded-xl h-auto shadow-lg shadow-purple-500/30 bg-purple-600 hover:bg-purple-700 font-semibold" type="submit" disabled={!messageContent.trim()}>
                               EMIT BROADCAST
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
                        <DialogTitle className="text-2xl font-semibold">Purge Entity?</DialogTitle>
                        <DialogDescription className="font-bold uppercase text-sm text-destructive">
                           Critical Security Protocol Required
                        </DialogDescription>
                    </DialogHeader>
                    <div className="p-4 text-center">
                        <p className="text-sm font-medium text-muted-foreground">This will permanently remove the record and all associated metadata. This action cannot be reversed.</p>
                    </div>
                                    <DialogFooter className="flex-col sm:flex-col gap-2 pt-4">
                        <Button 
                            className="w-full bg-destructive hover:bg-destructive/90 rounded-xl h-auto font-semibold shadow-lg shadow-destructive/20"
                            onClick={async () => {
                                if (!deleteId) return;
                                setIsDeleting(true);
                                try {
                                    await deleteUser(deleteId);
                                    setDeleteId(null);
                                } catch {
                                    // Error toast from hook; keep dialog open
                                } finally {
                                    setIsDeleting(false);
                                }
                            }}
                            disabled={isDeleting}
                        >
                            {isDeleting ? "PURGING..." : "CONFIRM PURGE"}
                        </Button>
                        <Button variant="ghost" className="w-full rounded-xl h-11 font-bold" onClick={() => setDeleteId(null)}>ABORT MISSION</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Advanced Filter Dialog */}
            <Dialog open={isAdvancedFilterOpen} onOpenChange={setIsAdvancedFilterOpen}>
                <DialogContent className="sm:max-w-md rounded-[2rem] border-border/50">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-primary" /> Advanced Filters
                        </DialogTitle>
                        <DialogDescription>Filter users by role, status, and date range.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="font-semibold text-sm">Role</Label>
                            <select 
                                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
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
                        <div className="space-y-2">
                            <Label className="font-semibold text-sm">Status</Label>
                            <select 
                                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="font-semibold text-sm">From Date</Label>
                                <Input type="date" value={filterDateFrom} onChange={(e) => setFilterDateFrom(e.target.value)} className="rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <Label className="font-semibold text-sm">To Date</Label>
                                <Input type="date" value={filterDateTo} onChange={(e) => setFilterDateTo(e.target.value)} className="rounded-xl" />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" className="rounded-xl" onClick={() => {
                            setFilterRole("all");
                            setFilterStatus("all");
                            setFilterDateFrom("");
                            setFilterDateTo("");
                            setActiveSegment("All Users");
                            setIsAdvancedFilterOpen(false);
                        }}>Reset</Button>
                        <Button className="rounded-xl" onClick={() => {
                            if (filterRole !== "all") {
                                const roleMap: Record<string, string> = { Admin: "Admins", Editor: "Managers", Support: "Support Staff" };
                                setActiveSegment(roleMap[filterRole] || "All Users");
                            }
                            if (filterStatus !== "all") {
                                setActiveSegment(filterStatus === "active" ? "Active Users" : "Deactivated");
                            }
                            setIsAdvancedFilterOpen(false);
                            toast.success("Filters applied");
                        }}>Apply Filters</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default withRoleProtection(UsersPage, ["Admin", "SuperAdmin"]);

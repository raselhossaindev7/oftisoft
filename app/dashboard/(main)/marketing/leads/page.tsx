"use client";

import { useState } from "react";
import { 
    Users, 
    Mail, 
    Plus, 
    Trash2, 
    CheckCircle2, 
    Clock, 
    Filter, 
    Search,
    Download,
    MoreHorizontal,
    Megaphone,
    MousePointer2,
    Calendar,
    BadgeCheck,
    ArrowUpRight,
    Sparkles,
    SearchX
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLeads } from "@/hooks/useLeads";
import { LeadStatus, LeadType } from "@/lib/api";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function LeadsDashboardPage() {
    const { leads = [], stats, isLoading, updateStatus, deleteLead } = useLeads();
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [typeFilter, setTypeFilter] = useState<string>("all");
    const [leadToDelete, setLeadToDelete] = useState<{ id: string; name: string } | null>(null);

    const exportCsv = () => {
        if (filteredLeads.length === 0) {
            return;
        }
        const headers = ["Name", "Email", "Type", "Message", "Status", "Date"];
        const rows = filteredLeads.map((l) => [
            l.name ?? "",
            l.email ?? "",
            l.type ?? "",
            (l.message ?? "").replace(/"/g, '""'),
            l.status ?? "",
            l.createdAt ? new Date(l.createdAt).toISOString() : "",
        ]);
        const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `leads-export-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const filteredLeads = leads.filter(lead => {
        const matchesSearch = !searchQuery || 
            (lead.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (lead.name || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
        const matchesType = typeFilter === "all" || lead.type === typeFilter;
        return matchesSearch && matchesStatus && matchesType;
    });

    const getStatusColor = (status: LeadStatus) => {
        switch (status) {
            case 'new': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'in_progress': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
            case 'converted': return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'archived': return 'bg-muted text-muted-foreground border-border';
            default: return 'bg-muted text-muted-foreground';
        }
    };

    const getTypeIcon = (type: LeadType) => {
        switch (type) {
            case 'cta': return MousePointer2;
            case 'newsletter': return Mail;
            case 'contact': return Megaphone;
            default: return Users;
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Marketing Leads</h1>
                    <p className="text-muted-foreground mt-1">Manage and track your customer acquisitions and subscriptions.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="gap-2 rounded-xl h-10 border-border/50 bg-card/50 font-semibold" onClick={exportCsv} disabled={filteredLeads.length === 0}>
                        <Download className="w-4 h-4" />
                        Export CSV
                    </Button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.total ?? 0}</div>
                        <p className="text-xs text-muted-foreground">All submissions</p>
                    </CardContent>
                </Card>
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">New Submissions</CardTitle>
                        <Sparkles className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.newLeads ?? 0}</div>
                        <p className="text-xs text-muted-foreground">Recent entries</p>
                    </CardContent>
                </Card>
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">CTA Conversions</CardTitle>
                        <MousePointer2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.ctaCount ?? 0}</div>
                        <p className="text-xs text-muted-foreground">Click-through actions</p>
                    </CardContent>
                </Card>
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Newsletter</CardTitle>
                        <Mail className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.newsletterCount ?? 0}</div>
                        <p className="text-xs text-muted-foreground">Email signups</p>
                    </CardContent>
                </Card>
            </div>

            {/* Table Card */}
            <Card className="border-border/50 overflow-hidden bg-card/50 backdrop-blur-sm">
                <CardHeader className="bg-muted/20 border-b border-border/50">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search leads by name or email..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 h-10 rounded-xl bg-background border-border/50 focus:ring-primary/20" 
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="h-10 px-4 gap-2 rounded-xl font-bold border-border/50">
                                        <Filter className="w-4 h-4" /> Filters
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-72 rounded-2xl border-border/50 bg-card/95 backdrop-blur-xl p-4" align="end">
                                    <DropdownMenuLabel className="text-sm font-semibold  text-muted-foreground">Status</DropdownMenuLabel>
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger className="h-10 rounded-xl font-medium mt-1">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All statuses</SelectItem>
                                            <SelectItem value="new">New</SelectItem>
                                            <SelectItem value="in_progress">In progress</SelectItem>
                                            <SelectItem value="converted">Converted</SelectItem>
                                            <SelectItem value="archived">Archived</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <DropdownMenuLabel className="text-sm font-semibold  text-muted-foreground mt-4">Type</DropdownMenuLabel>
                                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                                        <SelectTrigger className="h-10 rounded-xl font-medium mt-1">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All types</SelectItem>
                                            <SelectItem value="cta">CTA</SelectItem>
                                            <SelectItem value="newsletter">Newsletter</SelectItem>
                                            <SelectItem value="contact">Contact</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Button variant="ghost" size="sm" className="w-full rounded-xl font-bold mt-4" onClick={() => { setStatusFilter("all"); setTypeFilter("all"); }}>Clear filters</Button>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/5 hover:bg-muted/5 border-border/50">
                                <TableHead className="h-12 font-semibold text-xs  pl-8">Inquirer</TableHead>
                                <TableHead className="h-12 font-semibold text-xs ">Type</TableHead>
                                <TableHead className="h-12 font-semibold text-xs ">Message</TableHead>
                                <TableHead className="h-12 font-semibold text-xs ">Date</TableHead>
                                <TableHead className="h-12 font-semibold text-xs ">Status</TableHead>
                                <TableHead className="h-12 font-semibold text-xs  text-right pr-8">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredLeads.map((lead) => {
                                const TypeIcon = getTypeIcon(lead.type);
                                return (
                                    <TableRow key={lead.id} className="group hover:bg-primary/[0.02] transition-colors border-border/50">
                                        <TableCell className="pl-8 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-foreground">{lead.name || 'Anonymous Inquirer'}</span>
                                                <span className="text-xs text-muted-foreground">{lead.email}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                                    <TypeIcon size={14} />
                                                </div>
                                                <span className="text-xs font-semibold ">{lead.type}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <p className="text-sm text-muted-foreground max-w-[300px] truncate">
                                                {lead.message || <span className=" opacity-50">No message provided</span>}
                                            </p>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold">{format(new Date(lead.createdAt), 'MMM dd, yyyy')}</span>
                                                <span className="text-sm text-muted-foreground ">{format(new Date(lead.createdAt), 'hh:mm aa')}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <Badge className={cn("px-3 py-1 rounded-full text-sm font-semibold  border", getStatusColor(lead.status))}>
                                                {lead.status.replace('_', ' ')}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right pr-8 py-4">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48 rounded-2xl p-2 border-border/50 bg-card/95 backdrop-blur-xl">
                                                    <DropdownMenuLabel className="text-sm font-semibold  text-muted-foreground px-2 py-1.5">Lead Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => updateStatus({ id: lead.id, status: 'new' as any })} className="rounded-xl gap-2 font-bold text-xs"><Sparkles size={14} /> Mark as New</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => updateStatus({ id: lead.id, status: 'in_progress' as any })} className="rounded-xl gap-2 font-bold text-xs"><Clock size={14} /> Mark In Progress</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => updateStatus({ id: lead.id, status: 'converted' as any })} className="rounded-xl gap-2 font-bold text-xs text-green-500"><CheckCircle2 size={14} /> Mark Converted</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => updateStatus({ id: lead.id, status: 'archived' as any })} className="rounded-xl gap-2 font-bold text-xs"><BadgeCheck size={14} /> Archive Lead</DropdownMenuItem>
                                                    <DropdownMenuSeparator className="bg-border/50" />
                                                    <DropdownMenuItem onClick={() => setLeadToDelete({ id: lead.id, name: lead.name || lead.email || 'this lead' })} className="rounded-xl gap-2 font-bold text-xs text-destructive"><Trash2 size={14} /> Delete Record</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                            {filteredLeads.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6}>
                                        <div className="flex flex-col items-center justify-center py-20 bg-muted/5">
                                            <SearchX className="h-12 w-12 text-muted-foreground mb-4" />
                                            <h3 className="text-xl font-bold">No leads found</h3>
                                            <p className="text-muted-foreground text-sm max-w-xs text-center">No leads match your current search or filter criteria.</p>
                                            <Button variant="link" className="mt-2 text-primary font-bold" onClick={() => { setSearchQuery(""); setStatusFilter("all"); setTypeFilter("all"); }}>Clear Search</Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <AlertDialog open={!!leadToDelete} onOpenChange={(open) => !open && setLeadToDelete(null)}>
                <AlertDialogContent className="rounded-2xl border-border/50 max-w-md">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete lead?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently remove the lead record for <span className="font-semibold text-foreground">{leadToDelete?.name}</span>. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2 sm:gap-0">
                        <AlertDialogCancel className="rounded-xl font-bold">Cancel</AlertDialogCancel>
                        <AlertDialogAction variant="destructive"
                            className="rounded-xl font-bold bg-destructive text-destructive-foreground"
                            onClick={() => {
                                if (leadToDelete) {
                                    deleteLead(leadToDelete.id);
                                    setLeadToDelete(null);
                                }
                            }}
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}


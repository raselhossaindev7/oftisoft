"use client";

import { useState } from "react";
import { 
    Search, 
    Plus, 
    Clock, 
    CheckCircle2, 
    AlertCircle, 
    MessageSquare, 
    ChevronRight,
    Users,
    Briefcase,
    TrendingUp,
    FileText,
    LayoutGrid,
    List,
    Loader2,
    RefreshCw,
    CalendarIcon,
    Filter
} from "lucide-react";
import { format } from "date-fns";
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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { PaymentModal } from "@/components/projects/payment-modal";
import type { Project } from "@/lib/api";
import { useProjects } from "@/hooks/useProjects";
import { useQuotes } from "@/hooks/useQuotes";

// Backend returns: Planning, In Progress, Review, Completed, Delayed, On Hold
const ACTIVE_STATUSES = ["In Progress", "Planning", "Review"];
const STATUS_OPTIONS = [
    { value: "All", label: "All Status" },
    { value: "Planning", label: "Planning" },
    { value: "In Progress", label: "In Progress" },
    { value: "Review", label: "Review" },
    { value: "Completed", label: "Completed" },
    { value: "Delayed", label: "Delayed" },
    { value: "On Hold", label: "On Hold" },
];

export default function ServicesManagementPage() {
    const [view, setView] = useState<"list" | "grid">("list");
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("All");
    const [dateFrom, setDateFrom] = useState<Date | undefined>();
    const [dateTo, setDateTo] = useState<Date | undefined>();
    const [selectedScheduleDate, setSelectedScheduleDate] = useState<Date>(new Date());
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);

    // Fetch data from backend (status filter for projects)
    const { projects, isLoading: isProjectsLoading, isError: isProjectsError, refetch: refetchProjects, updatePaymentStatus } = useProjects(undefined, statusFilter === "All" ? undefined : statusFilter);
    const { quotes, isLoading: isQuotesLoading, isError: isQuotesError, refetch: refetchQuotes } = useQuotes();
    
    const isLoading = isProjectsLoading || isQuotesLoading;
    const hasError = isProjectsError || isQuotesError;

    const handleRefresh = () => {
        refetchProjects();
        refetchQuotes();
    };

    const handlePaymentComplete = (projectId: string) => {
        updatePaymentStatus(projectId, "Paid");
        setSelectedProject(null);
    };

    // Calculate stats (backend status: "In Progress", "Planning", etc.)
    const activeProjectsCount = projects?.filter(p => ACTIVE_STATUSES.includes(p.status)).length || 0;
    const totalBudget = projects?.reduce((sum, p) => sum + Number(p.budget || 0), 0) || 0;
    const avgProgress = projects?.length > 0 ? Math.round(projects.reduce((sum, p) => sum + (p.progress || 0), 0) / projects.length) : 0;
    const totalMembers = projects?.reduce((sum, p) => sum + (p.members || 0), 0) || 0;

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "In Progress":
                return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 gap-1.5"><Clock className="w-3 h-3" /> In Progress</Badge>;
            case "Completed":
                return <Badge className="bg-green-500/10 text-green-500 border-green-500/20 gap-1.5"><CheckCircle2 className="w-3 h-3" /> Completed</Badge>;
            case "Planning":
                return <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20 gap-1.5"><AlertCircle className="w-3 h-3" /> Planning</Badge>;
            case "Review":
                return <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20 gap-1.5"><MessageSquare className="w-3 h-3" /> Review</Badge>;
            case "Delayed":
                return <Badge className="bg-red-500/10 text-red-500 border-red-500/20 gap-1.5"><AlertCircle className="w-3 h-3" /> Delayed</Badge>;
            case "On Hold":
                return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 gap-1.5"><Clock className="w-3 h-3" /> On Hold</Badge>;
            default:
                return <Badge variant="outline" className="capitalize">{status || "—"}</Badge>;
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (hasError) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
                <AlertCircle className="w-16 h-16 text-red-500/80" />
                <h3 className="text-xl font-bold">Failed to load data</h3>
                <p className="text-muted-foreground text-sm text-center max-w-sm">Something went wrong. Please try again.</p>
                <Button onClick={handleRefresh} className="gap-2 rounded-xl">
                    <RefreshCw className="w-4 h-4" /> Retry
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Service Requests</h1>
                    <p className="text-muted-foreground">Manage custom development orders, project milestones, and resource allocation.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-2 rounded-xl text-xs sm:text-sm" disabled={isProjectsLoading || isQuotesLoading}>
                        <RefreshCw className={`w-4 h-4 ${(isProjectsLoading || isQuotesLoading) ? "animate-spin" : ""}`} />
                        Refresh
                    </Button>
                    <Button asChild variant="outline" className="gap-2 rounded-xl text-xs sm:text-sm">
                        <Link href="/dashboard/quotes">
                            <FileText className="w-4 h-4" />
                            Generate Quote
                        </Link>
                    </Button>
                    <Button asChild className="gap-2 rounded-xl shadow-lg shadow-primary/20 bg-primary text-xs sm:text-sm">
                        <Link href="/dashboard/services/my-requests">
                            <Plus className="w-4 h-4" />
                            New Service Order
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Service Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                        <Briefcase className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeProjectsCount}</div>
                        <p className="text-xs text-muted-foreground">Projects in progress or planning</p>
                    </CardContent>
                </Card>
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Project Budget</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${totalBudget.toLocaleString()}</div>
                        <p className="text-xs text-green-500 font-medium">Across all active projects</p>
                    </CardContent>
                </Card>
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Progress</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{avgProgress}%</div>
                        <p className="text-xs text-muted-foreground">Completion rate</p>
                    </CardContent>
                </Card>
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Team Size</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalMembers}</div>
                        <p className="text-xs text-orange-500 font-medium font-mono">Assigned members</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="orders" className="space-y-6">
                <TabsList className="bg-muted/50 p-1 rounded-2xl h-14 w-fit border border-border">
                    <TabsTrigger value="orders" className="rounded-xl h-auto gap-2 data-[state=active]:bg-background data-[state=active]:shadow-md font-bold px-8">
                        Service Orders
                    </TabsTrigger>
                    <TabsTrigger value="schedule" className="rounded-xl h-auto gap-2 data-[state=active]:bg-background data-[state=active]:shadow-md font-bold px-8">
                        <CalendarIcon className="w-4 h-4" />
                        Schedule
                    </TabsTrigger>
                    <TabsTrigger value="quotes" className="rounded-xl h-auto gap-2 data-[state=active]:bg-background data-[state=active]:shadow-md font-bold px-8">
                        Quote Requests <Badge variant="secondary" className="ml-2 bg-primary/20 text-primary border-none">{quotes?.length || 0}</Badge>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="orders" className="space-y-4">
                    <Card className="border-border/50">
                        <CardHeader className="p-4 border-b border-border/50 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                            <div className="flex flex-1 flex-col sm:flex-row gap-2">
                                <div className="relative flex-1 min-w-0 max-w-sm">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input 
                                        placeholder="Search by title, client, ID..." 
                                        className="pl-10 h-10 rounded-xl"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="h-10 rounded-xl w-[140px]">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {STATUS_OPTIONS.map((opt) => (
                                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className={cn("h-10 rounded-xl gap-2", (dateFrom || dateTo) && "text-primary border-primary/50")}>
                                            <Filter className="w-4 h-4" />
                                            {dateFrom ? format(dateFrom, "MMM d") : "From"} {dateTo ? `- ${format(dateTo, "MMM d")}` : ""}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <div className="p-3 border-b border-border/50 flex items-center gap-1">
                                            <Button variant="ghost" size="sm" className="h-7 text-xs rounded-lg" onClick={() => { setDateFrom(undefined); setDateTo(undefined); }}>
                                                Clear
                                            </Button>
                                        </div>
                                        <div className="flex">
                                            <div className="p-2">
                                                <Calendar
                                                    mode="single"
                                                    selected={dateFrom}
                                                    onSelect={setDateFrom}
                                                    autoFocus
                                                />
                                            </div>
                                            <div className="p-2 border-l border-border/50">
                                                <Calendar
                                                    mode="single"
                                                    selected={dateTo}
                                                    onSelect={setDateTo}
                                                    autoFocus
                                                />
                                            </div>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="flex gap-2 shrink-0">
                                <Button variant="outline" size="icon" onClick={() => setView("list")} className={view === "list" ? "bg-muted" : ""}><List className="w-4 h-4" /></Button>
                                <Button variant="outline" size="icon" onClick={() => setView("grid")} className={view === "grid" ? "bg-muted" : ""}><LayoutGrid className="w-4 h-4" /></Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {(() => {
                            const filtered = (projects ?? []).filter(p => {
                                const q = searchQuery.toLowerCase().trim();
                                if (q && !(p.title?.toLowerCase() || "").includes(q) && !(p.client?.toLowerCase() || "").includes(q) && !(p.id?.toLowerCase() || "").includes(q)) return false;
                                if (dateFrom && p.createdAt && new Date(p.createdAt) < dateFrom) return false;
                                if (dateTo && p.createdAt) {
                                    const endOfDay = new Date(dateTo);
                                    endOfDay.setHours(23, 59, 59, 999);
                                    if (new Date(p.createdAt) > endOfDay) return false;
                                }
                                return true;
                            });
                            return filtered.length > 0 ? (
                                view === "grid" ? (
                                    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {filtered.map((project) => (
                                            <Link key={project.id} href={`/dashboard/services/${project.id}`}>
                                                <Card className="border-border/50 hover:border-primary/50 hover:shadow-lg transition-all h-full group cursor-pointer">
                                                    <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between">
                                                        <div className="min-w-0 flex-1">
                                                            <CardTitle className="text-base truncate">{project.title}</CardTitle>
                                                            <CardDescription className="text-xs font-mono">{project.id?.substring(0, 8) || "—"}</CardDescription>
                                                    </div>
                                                    {getStatusBadge(project.status)}
                                                    </CardHeader>
                                                    <CardContent className="p-4 pt-0 space-y-3">
                                                        <p className="text-sm font-medium">{project.client}</p>
                                                        {project.budget && <p className="text-xs text-muted-foreground">${project.budget.toLocaleString()}</p>}
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden">
                                                                <div className="h-full bg-primary transition-all" style={{ width: `${project.progress}%` }} />
                                                            </div>
                                                            <span className="text-sm font-bold shrink-0">{project.progress}%</span>
                                                        </div>
                                                        {(project.paymentStatus === "Unpaid" || project.paymentStatus === "pending") && (
                                                            <div className="pt-2 border-t border-red-500/10 flex items-center justify-between">
                                                                <span className="text-xs text-red-500 font-medium">Payment Required</span>
                                                                <button
                                                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedProject(project); }}
                                                                    className="text-xs font-bold text-white bg-primary px-3 py-1.5 rounded-lg hover:bg-primary/90 transition-colors"
                                                                >
                                                                    Pay Now
                                                                </button>
                                                            </div>
                                                        )}
                                                        <div className="flex items-center justify-between pt-2">
                                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                                <Users className="w-3 h-3" /> {project.members || 1} members
                                                            </span>
                                                            <ChevronRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/5">
                                            <TableHead>Service Order</TableHead>
                                            <TableHead>Details</TableHead>
                                            <TableHead>Team Size</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Progress</TableHead>
                                            <TableHead className="text-right">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filtered.map((project) => (
                                            <TableRow key={project.id} className="group hover:bg-primary/5 transition-colors">
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-sm">{project.title}</span>
                                                        <span className="text-sm text-muted-foreground font-mono">{project.id?.substring(0, 8) || "—"}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-sm font-medium">
                                                    <div className="flex flex-col">
                                                        <span>{project.client}</span>
                                                        {project.budget && <span className="text-sm text-muted-foreground">${project.budget.toLocaleString()}</span>}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                                                            {project.members || 1}
                                                        </div>
                                                        <span className="text-xs">Members</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{getStatusBadge(project.status)}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2 w-32">
                                                        <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden">
                                                            <div className="h-full bg-primary" style={{ width: `${project.progress}%` }} />
                                                        </div>
                                                        <span className="text-sm font-bold">{project.progress}%</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {(project.paymentStatus === "Unpaid" || project.paymentStatus === "pending") && (
                                                            <Button size="sm" className="h-8 rounded-lg text-xs" onClick={() => setSelectedProject(project)}>
                                                                Pay Now
                                                            </Button>
                                                        )}
                                                        <Button asChild variant="ghost" size="sm" className="h-8 rounded-lg gap-1 text-primary">
                                                            <Link href={`/dashboard/services/${project.id}`}>
                                                                Track <ChevronRight className="w-4 h-4" />
                                                            </Link>
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                )
                            ) : (
                                <div className="p-8 text-center text-muted-foreground">
                                    {projects?.length ? "No matching service orders." : "No service orders found. Start a new project to get started."}
                                </div>
                            );
                            })()}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="schedule" className="space-y-4">
                    <Card className="border-border/50">
                        <CardHeader className="p-4 border-b border-border/50 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                            <div className="flex items-center gap-3">
                                <CalendarIcon className="w-5 h-5 text-primary" />
                                <div>
                                    <CardTitle className="text-lg">Project Schedule</CardTitle>
                                    <CardDescription>View milestones and deadlines on the calendar</CardDescription>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary" /> Due date</span>
                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" /> Completed</span>
                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500" /> In progress</span>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <Calendar
                                mode="single"
                                selected={selectedScheduleDate}
                                onSelect={(d) => d && setSelectedScheduleDate(d)}
                                className="rounded-md border border-border/50 mx-auto"
                                classNames={{
                                    months: "flex flex-col sm:flex-row gap-4",
                                    month: "flex flex-col gap-4 w-full",
                                }}
                                modifiers={{
                                    hasDueDate: (projects ?? []).filter(p => p.dueDate).map(p => new Date(p.dueDate!)),
                                    completed: (projects ?? []).filter(p => p.status === "Completed" && p.dueDate).map(p => new Date(p.dueDate!)),
                                    inProgress: (projects ?? []).filter(p => ACTIVE_STATUSES.includes(p.status) && p.dueDate).map(p => new Date(p.dueDate!)),
                                }}
                                modifiersStyles={{
                                    hasDueDate: { backgroundColor: "var(--primary)", color: "white", borderRadius: "999px" },
                                    completed: { backgroundColor: "rgb(34 197 94 / 0.2)", color: "rgb(34 197 94)", borderRadius: "999px" },
                                    inProgress: { backgroundColor: "rgb(249 115 22 / 0.2)", color: "rgb(249 115 22)", borderRadius: "999px" },
                                }}
                            />
                            <div className="mt-6 space-y-3">
                                <h4 className="font-bold text-sm text-muted-foreground uppercase tracking-wide">
                                    Projects due on {format(selectedScheduleDate, "MMMM d, yyyy")}
                                </h4>
                                {(() => {
                                    const dayStr = format(selectedScheduleDate, "yyyy-MM-dd");
                                    const dueOnDay = (projects ?? []).filter(p => p.dueDate && format(new Date(p.dueDate), "yyyy-MM-dd") === dayStr);
                                    return dueOnDay.length > 0 ? (
                                        <div className="grid gap-2">
                                            {dueOnDay.map((p) => (
                                                <Link key={p.id} href={`/dashboard/services/${p.id}`}>
                                                    <Card className="border-border/50 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer">
                                                        <CardContent className="p-3 flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <div className={cn("w-2 h-2 rounded-full", p.status === "Completed" ? "bg-green-500" : ACTIVE_STATUSES.includes(p.status) ? "bg-orange-500" : "bg-muted")} />
                                                                <div>
                                                                    <p className="text-sm font-bold">{p.title}</p>
                                                                    <p className="text-xs text-muted-foreground">{p.client}</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                {getStatusBadge(p.status)}
                                                                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                </Link>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">No projects due on this date.</p>
                                    );
                                })()}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="quotes">
                    {quotes && quotes.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {quotes.map((quote) => (
                                <Card key={quote.id} className="border-border/50 hover:border-primary/50 transition-all group">
                                    <CardHeader className="flex flex-row items-start justify-between">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="text-sm font-bold border-primary/20 text-primary uppercase">{quote.serviceType}</Badge>
                                                <span className="text-sm text-muted-foreground">{new Date(quote.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <CardTitle className="text-xl font-bold truncate pr-4">{quote.description?.length > 50 ? `${quote.description.substring(0, 50)}...` : (quote.description || "Quote")}</CardTitle>
                                        </div>
                                        <Badge className={["requested", "responded"].includes(quote.status) ? "bg-orange-500/10 text-orange-500 border-orange-500/20" : quote.status === "accepted" ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-muted text-muted-foreground border-muted"}>
                                            {((quote.status || '') ? (quote.status.charAt(0).toUpperCase() + quote.status.slice(1)) : 'Unknown')}
                                        </Badge>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground leading-relaxed  border-l-2 border-primary/20 pl-4 py-1 line-clamp-3">
                                            "{quote.description}"
                                        </p>
                                        <div className="mt-6 flex items-center justify-between pt-4 border-t border-border/50">
                                            <div>
                                                <p className="text-sm text-muted-foreground uppercase font-semibold">Budget</p>
                                                <p className="font-bold text-lg text-primary">{quote.budget}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button asChild variant="outline" size="sm" className="rounded-xl h-9">
                                                    <Link href={`/dashboard/quotes?quote=${quote.id}`}>View Proposal</Link>
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-12 border border-dashed border-border/50 rounded-2xl bg-muted/5">
                            <FileText className="w-12 h-12 text-muted-foreground opacity-20 mb-4" />
                            <h3 className="text-lg font-bold">No Quote Requests</h3>
                            <p className="text-muted-foreground text-sm mb-4">You haven't submitted any quote requests yet.</p>
                            <Button asChild>
                                <Link href="/dashboard/quotes">Request a Quote</Link>
                            </Button>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
            {selectedProject && (
                <PaymentModal
                    project={selectedProject}
                    onClose={() => setSelectedProject(null)}
                    onPaymentComplete={handlePaymentComplete}
                />
            )}
        </div>
    );
}

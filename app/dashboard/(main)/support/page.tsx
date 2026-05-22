"use client"
import { Animated, AnimatedDiv, AnimatePresence } from "@/lib/animated";

import { useState } from "react";
import { 
    Search, 
    MessageCircle, 
    Clock, 
    CheckCircle2, 
    AlertCircle, 
    Plus, 
    MoreHorizontal,
    Mail,
    ChevronRight,
    User,
    Tag,
    History,
    Star,
    BookOpen,
    Eye,
    MessageSquare,
    ShieldCheck,
    Layout,
    Bold,
    Italic,
    Link as LinkIcon,
    Paperclip,
    Trash2,
    CheckSquare,
    Square,
    RefreshCw,
    FileText,
    Image as ImageIcon
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { useDropzone } from "react-dropzone";
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supportAPI, Ticket, TicketStatus, TicketPriority } from "@/lib/api";
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter
} from "@/components/ui/sheet";
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatDistanceToNow } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

const ticketSchema = z.object({
    subject: z.string().min(5, "Subject must be at least 5 characters"),
    category: z.string().min(1, "Please select a category"),
    priority: z.nativeEnum(TicketPriority),
    description: z.string().min(10, "Please provide more details"),
});

type TicketFormValues = z.infer<typeof ticketSchema>;

export default function SupportHubPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
    const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
    const [replyContent, setReplyContent] = useState("");
    const [selectedKbArticle, setSelectedKbArticle] = useState<any | null>(null);
    const [isNewKbOpen, setIsNewKbOpen] = useState(false);
    const [selectedEmail, setSelectedEmail] = useState<any | null>(null);
    const [selectedTicketIds, setSelectedTicketIds] = useState<string[]>([]);
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [kbArticles] = useState<any[]>([]);
    
    const queryClient = useQueryClient();

    const toggleTicketSelection = (id: string) => {
        setSelectedTicketIds(prev => 
            prev.includes(id) ? prev.filter(tId => tId !== id) : [...prev, id]
        );
    };

    const toggleAllSelection = () => {
        if (selectedTicketIds.length === filteredTickets.length) {
            setSelectedTicketIds([]);
        } else {
            setSelectedTicketIds(filteredTickets.map(t => t.id));
        }
    };

    const onDrop = (acceptedFiles: File[]) => {
        toast.info(`${acceptedFiles.length} file(s) ready for upload`);
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

    // Fetch Tickets (with optional status filter)
    const { data: tickets = [], isLoading: isLoadingTickets } = useQuery({
        queryKey: ["tickets", statusFilter],
        queryFn: () => supportAPI.getTickets(statusFilter === "all" ? undefined : statusFilter),
    });

    // Fetch Stats
  const { data: stats } = useQuery({
        queryKey: ["support-stats"],
        queryFn: () => supportAPI.getStats(),
    });

    // Fetch Selected Ticket Details
  const { data: selectedTicket, isLoading: isLoadingTicketDetails } = useQuery({
        queryKey: ["ticket", selectedTicketId],
        queryFn: () => selectedTicketId ? supportAPI.getTicket(selectedTicketId) : null,
        enabled: !!selectedTicketId,
    });

    // Create Ticket Mutation
  const createTicketMutation = useMutation({
        mutationFn: (data: any) => supportAPI.createTicket(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tickets"] });
            queryClient.invalidateQueries({ queryKey: ["support-stats"] });
            toast.success("Ticket created successfully");
            setIsNewTicketOpen(false);
            reset();
        },
        onError: () => toast.error("Failed to create ticket"),
    });

    // Add Message Mutation
  const addMessageMutation = useMutation({
        mutationFn: ({ id, content }: { id: string; content: string }) => supportAPI.addMessage(id, content),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["ticket", selectedTicketId] });
            setReplyContent("");
            toast.success("Reply sent");
        },
        onError: () => toast.error("Failed to send reply"),
    });

    // Update Status Mutation
  const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) => supportAPI.updateTicketStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tickets"] });
            queryClient.invalidateQueries({ queryKey: ["ticket", selectedTicketId] });
            queryClient.invalidateQueries({ queryKey: ["support-stats"] });
            toast.success("Status updated");
        },
    });

    const handleBulkMarkResolved = async () => {
        if (selectedTicketIds.length === 0) return;
        const count = selectedTicketIds.length;
        try {
            await Promise.all(
                selectedTicketIds.map((id) => supportAPI.updateTicketStatus(id, "resolved"))
            );
            queryClient.invalidateQueries({ queryKey: ["tickets"] });
            queryClient.invalidateQueries({ queryKey: ["ticket", selectedTicketId] });
            queryClient.invalidateQueries({ queryKey: ["support-stats"] });
            setSelectedTicketIds([]);
            toast.success(`${count} ticket(s) marked resolved`);
        } catch {
            toast.error("Failed to update some tickets");
        }
    };

    const { register, handleSubmit, reset, formState: { errors }, control } = useForm<TicketFormValues>({
        resolver: zodResolver(ticketSchema),
        defaultValues: {
            priority: TicketPriority.MEDIUM,
            category: "",
            subject: "",
            description: "",
        }
    });

    const onSendMessage = () => {
        if (!replyContent.trim() || !selectedTicketId) return;
        addMessageMutation.mutate({ id: selectedTicketId, content: replyContent });
    };

    const getStatusBadge = (status: string | undefined) => {
        switch ((status || '').toLowerCase()) {
            case "open":
            case "active":
            case "published":
                return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 gap-1.5 font-bold"><CheckCircle2 className="w-3 h-3" /> {status || "—"}</Badge>;
            case "resolved":
            case "ended":
            case "closed":
                return <Badge variant="secondary" className="bg-muted text-muted-foreground gap-1.5 font-bold"><CheckCircle2 className="w-3 h-3" /> {status || "—"}</Badge>;
            case "pending":
            case "queued":
            case "draft":
                return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 gap-1.5 font-bold"><Clock className="w-3 h-3" /> {status}</Badge>;
            default:
                return <Badge variant="outline" className="font-bold">{status}</Badge>;
        }
    };

    const TicketSkeleton = () => (
        <TableRow className="animate-pulse">
            <TableCell><Skeleton className="h-4 w-12" /></TableCell>
            <TableCell><Skeleton className="h-4 w-4" /></TableCell>
            <TableCell>
                <div className="space-y-2">
                    <Skeleton className="h-5 w-[250px]" />
                    <Skeleton className="h-4 w-[150px]" />
                </div>
            </TableCell>
            <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
            <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
            <TableCell><Skeleton className="h-6 w-20 rounded-lg" /></TableCell>
            <TableCell><Skeleton className="h-8 w-20" /></TableCell>
        </TableRow>
    );

    const getPriorityBadge = (prio: string | undefined) => {
        switch ((prio || '').toLowerCase()) {
            case "urgent":
                return <Badge className="bg-red-600 text-white border-none text-sm uppercase font-semibold px-1.5 h-5">Urgent</Badge>;
            case "high":
                return <Badge className="bg-orange-500 text-white border-none text-sm uppercase font-semibold px-1.5 h-5">High</Badge>;
            default:
                return <Badge variant="secondary" className="text-sm uppercase font-semibold px-1.5 h-5 bg-muted text-muted-foreground">{prio}</Badge>;
        }
    };

    const filteredTickets = tickets.filter(t => 
        (t.subject || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.customer?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 md:space-y-8 pb-10 md:pb-20 px-3 md:px-0">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold ">Support Universe</h1>
                    <CardDescription className="text-sm">Unified control for tickets, knowledge base, and live customer interaction.</CardDescription>
                </div>
                <div className="flex flex-wrap items-center gap-3 md:gap-4">
                    <Badge variant="outline" className="rounded-xl px-4 md:px-5 h-10 md:h-11 border-primary/20 bg-primary/5 text-primary gap-2.5 font-bold flex items-center text-sm md:text-xs animate-pulse">
                        <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" /> Agent Status: Online
                    </Badge>
                    <Sheet open={isNewTicketOpen} onOpenChange={setIsNewTicketOpen}>
                        <SheetTrigger asChild>
                            <Button className="gap-2.5 rounded-xl shadow-lg shadow-primary/20 h-10 md:h-11 px-5 md:px-7 font-bold text-xs md:text-sm flex-1 md:flex-none">
                                <Plus className="w-4 h-4" /> New Ticket
                            </Button>
                        </SheetTrigger>
                        <SheetContent className="sm:max-w-md p-0 overflow-hidden flex flex-col">
                            <SheetHeader className="p-6 md:p-8 border-b bg-muted/5 shrink-0 space-y-3">
                                <SheetTitle className="text-xl md:text-2xl font-semibold  text-primary">Create Support Ticket</SheetTitle>
                                <SheetDescription className="text-sm font-medium">
                                    Explain your issue in detail and our team will get back to you shortly.
                                </SheetDescription>
                            </SheetHeader>
                            <form onSubmit={handleSubmit((data) => createTicketMutation.mutate(data))} className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
                                <div className="space-y-3">
                                    <Label className="text-sm font-bold ">Subject Line</Label>
                                    <Input {...register("subject")} placeholder="Brief summary of the issue" className="rounded-xl h-11 bg-muted/30 border-none focus-visible:ring-primary/20" />
                                    {errors.subject && <Label className="text-sm text-red-500 font-bold uppercase  pl-1">{errors.subject.message}</Label>}
                                </div>
                                <div className="grid grid-cols-2 gap-5">
                                    <div className="space-y-3">
                                        <Label className="text-sm font-bold ">Category</Label>
                                        <Controller name="category"
                                            control={control}
                                            render={({ field }) => (
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <SelectTrigger className="rounded-xl h-11 bg-muted/30 border-none focus:ring-primary/20">
                                                        <SelectValue placeholder="Select type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Technical">Technical</SelectItem>
                                                        <SelectItem value="Billing">Billing</SelectItem>
                                                        <SelectItem value="Refund">Refund</SelectItem>
                                                        <SelectItem value="Other">Other</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                        {errors.category && <Label className="text-sm text-red-500 font-bold uppercase  pl-1">{errors.category.message}</Label>}
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-sm font-bold ">Priority</Label>
                                        <Controller name="priority"
                                            control={control}
                                            render={({ field }) => (
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <SelectTrigger className="rounded-xl h-11 bg-muted/30 border-none focus:ring-primary/20">
                                                        <SelectValue placeholder="Priority" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value={TicketPriority.LOW}>Low</SelectItem>
                                                        <SelectItem value={TicketPriority.MEDIUM}>Medium</SelectItem>
                                                        <SelectItem value={TicketPriority.HIGH}>High</SelectItem>
                                                        <SelectItem value={TicketPriority.URGENT}>Urgent</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-sm font-bold ">Detailed Description</Label>
                                        <div className="flex items-center gap-2">
                                            <Button type="button" variant="ghost" size="icon" className="h-7 w-7"><Bold className="w-3.5 h-3.5" /></Button>
                                            <Button type="button" variant="ghost" size="icon" className="h-7 w-7"><Italic className="w-3.5 h-3.5" /></Button>
                                            <Button type="button" variant="ghost" size="icon" className="h-7 w-7"><LinkIcon className="w-3.5 h-3.5" /></Button>
                                        </div>
                                    </div>
                                    <Textarea {...register("description")} placeholder="Describe your problem in detail so our agents can help you faster..." className="min-h-[140px] rounded-xl bg-muted/30 border-none focus-visible:ring-primary/20 resize-none p-4" />
                                    {errors.description && <Label className="text-sm text-red-500 font-bold uppercase  pl-1">{errors.description.message}</Label>}
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-sm font-bold ">Attachments</Label>
                                    <div 
                                        {...getRootProps()} 
                                        className={cn(
                                            "border-2 border-dashed rounded-2xl p-6 transition-all duration-300 flex flex-col items-center justify-center gap-2 cursor-pointer",
                                            isDragActive ? "border-primary bg-primary/5 scale-[0.98]" : "border-border/50 hover:border-primary/50 hover:bg-muted/30"
                                        )}
                                    >
                                        <input {...getInputProps()} />
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-1">
                                            <Paperclip className="w-5 h-5 text-primary" />
                                        </div>
                                        <p className="text-xs font-bold">Drag & Drop or Click to upload</p>
                                        <p className="text-sm text-muted-foreground font-medium uppercase ">PNG, JPG, PDF up to 5MB</p>
                                    </div>
                                </div>
                                <SheetFooter className="mt-4 pt-4 border-t border-border/50">
                                    <Button type="submit" className="w-full h-12 rounded-xl font-semibold uppercase  shadow-xl shadow-primary/20" disabled={createTicketMutation.isPending}>
                                        {createTicketMutation.isPending ? "Connecting..." : "Initialize Support Ticket"}
                                    </Button>
                                </SheetFooter>
                            </form>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>

            {/* Support KPIs - all from API */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Active Tickets", value: String(stats?.activeTickets ?? 0), icon: MessageSquare, sub: stats?.urgentCount ? `${stats.urgentCount} urgent` : "Open tickets", color: "text-primary" },
                    { label: "Avg Response", value: stats?.avgResponse ?? "—", icon: Clock, sub: "Response time", color: "text-blue-500" },
                    { label: "Live Chats", value: String(stats?.liveChats ?? 0), icon: MessageCircle, sub: "Active chats", color: "text-green-500" },
                    { label: "CSAT Score", value: String(stats?.csatScore ?? "—"), icon: Star, sub: "Satisfaction", color: "text-amber-500" },
                ].map((kpi) => (
                    <Card key={kpi.label} className="border-border/50 bg-card/50 backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-bold uppercase  text-muted-foreground">{kpi.label}</CardTitle>
                            <kpi.icon className={cn("h-4 w-4", kpi.color)} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-semibold">{kpi.value}</div>
                            <CardDescription className="text-sm uppercase font-bold mt-1 opacity-70">{kpi.sub}</CardDescription>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Tabs defaultValue="tickets" className="space-y-6">
                <div className="w-full overflow-x-auto pb-4 scrollbar-none">
                    <TabsList className="bg-muted/30 p-1.5 rounded-2xl h-14 md:h-16 w-full md:w-fit border border-border/40 backdrop-blur-md shadow-inner min-w-[380px]">
                        <TabsTrigger 
                            value="tickets" 
                            className="flex-1 md:flex-none rounded-xl h-auto gap-3 data-[state=active]:bg-background data-[state=active]:shadow-[0_8px_20px_-6px_rgba(0,0,0,0.1)] data-[state=active]:border data-[state=active]:border-primary/10 data-[state=active]:text-primary font-semibold px-5 md:px-10 transition-all duration-500 text-xs md:text-sm hover:text-primary/70"
                        >
                            <Layout className="w-4 h-4 md:w-5 h-5 transition-transform duration-500 group-data-[state=active]:scale-110" /> 
                            <span>Tickets</span>
                        </TabsTrigger>
                        <TabsTrigger 
                            value="knowledge" 
                            className="flex-1 md:flex-none rounded-xl h-auto gap-3 data-[state=active]:bg-background data-[state=active]:shadow-[0_8px_20px_-6px_rgba(0,0,0,0.1)] data-[state=active]:border data-[state=active]:border-primary/10 data-[state=active]:text-primary font-semibold px-5 md:px-10 transition-all duration-500 text-xs md:text-sm hover:text-primary/70"
                        >
                            <BookOpen className="w-4 h-4 md:w-5 h-5 transition-transform duration-500 group-data-[state=active]:scale-110" /> 
                            <span>KB Items</span>
                        </TabsTrigger>
                        <TabsTrigger 
                            value="email" 
                            className="flex-1 md:flex-none rounded-xl h-auto gap-3 data-[state=active]:bg-background data-[state=active]:shadow-[0_8px_20px_-6px_rgba(0,0,0,0.1)] data-[state=active]:border data-[state=active]:border-primary/10 data-[state=active]:text-primary font-semibold px-5 md:px-10 transition-all duration-500 text-xs md:text-sm hover:text-primary/70"
                        >
                            <Mail className="w-4 h-4 md:w-5 h-5 transition-transform duration-500 group-data-[state=active]:scale-110" /> 
                            <span>Inbox</span>
                        </TabsTrigger>
                    </TabsList>
                </div>

                {/* Tickets Management Tab */}
                <TabsContent value="tickets" className="space-y-4">
                    <Card className="border-border/50">
                        <CardHeader className="bg-muted/10 border-b border-border/50">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="relative flex-1 max-w-sm">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input 
                                        placeholder="Search tickets, subject, customer..." 
                                        className="pl-10 h-10 rounded-xl"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger className="w-[140px] h-10 rounded-xl border-border/50">
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All statuses</SelectItem>
                                            <SelectItem value={TicketStatus.OPEN}>Open</SelectItem>
                                            <SelectItem value={TicketStatus.PENDING}>Pending</SelectItem>
                                            <SelectItem value={TicketStatus.RESOLVED}>Resolved</SelectItem>
                                            <SelectItem value={TicketStatus.CLOSED}>Closed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/5 hover:bg-transparent transition-none">
                                        <TableHead className="w-[40px] px-4">
                                            <Checkbox 
                                                checked={selectedTicketIds.length === filteredTickets.length && filteredTickets.length > 0}
                                                onCheckedChange={toggleAllSelection}
                                                className="rounded-md border-muted-foreground/30 data-[state=checked]:bg-primary data-[state=checked]:border-none"
                                            />
                                        </TableHead>
                                        <TableHead className="w-[100px] md:w-[120px] text-sm md:text-xs">ID</TableHead>
                                        <TableHead className="min-w-[180px] md:min-w-[300px] text-sm md:text-xs">Subject & Customer</TableHead>
                                        <TableHead className="hidden md:table-cell text-sm md:text-xs">Status</TableHead>
                                        <TableHead className="hidden sm:table-cell text-sm md:text-xs">Priority</TableHead>
                                        <TableHead className="hidden lg:table-cell text-sm md:text-xs">Category</TableHead>
                                        <TableHead className="text-right text-sm md:text-xs">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoadingTickets ? (
                                        <>
                                            <TicketSkeleton />
                                            <TicketSkeleton />
                                            <TicketSkeleton />
                                            <TicketSkeleton />
                                            <TicketSkeleton />
                                        </>
                                    ) : filteredTickets.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="h-60 text-center">
                                                <div className="flex flex-col items-center justify-center gap-3">
                                                    <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center">
                                                        <Search className="w-8 h-8 text-muted-foreground/30" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <h3 className="font-bold text-lg">No tickets found</h3>
                                                        <p className="text-sm text-muted-foreground max-w-[250px] mx-auto">
                                                            {statusFilter !== "all" || searchQuery
                                                                ? "No results for the current filters or search."
                                                                : "Create a ticket to get started."}
                                                        </p>
                                                    </div>
                                                    <div className="flex gap-2 mt-2">
                                                        {(statusFilter !== "all" || searchQuery) && (
                                                            <Button variant="outline" size="sm" className="rounded-xl h-9" onClick={() => { setSearchQuery(""); setStatusFilter("all"); }}>Clear filters</Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        <AnimatePresence mode="popLayout">
                                            {filteredTickets.map((t, index) => (
                                                <Animated as="tr" 
                                                    key={t.id} 
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, scale: 0.95 }}
                                                    transition={{ delay: index * 0.1, duration: 0.3 }}
                                                    className={cn(
                                                        "group border-b border-border/50 hover:bg-primary/[0.03] transition-colors cursor-pointer relative",
                                                        selectedTicketIds.includes(t.id) && "bg-primary/[0.04]"
                                                    )} 
                                                    onClick={() => setSelectedTicketId(t.id)}
                                                >
                                                    <TableCell className="px-4" onClick={(e) => e.stopPropagation()}>
                                                        <Checkbox 
                                                            checked={selectedTicketIds.includes(t.id)}
                                                            onCheckedChange={() => toggleTicketSelection(t.id)}
                                                            className="rounded-md border-muted-foreground/30 data-[state=checked]:bg-primary data-[state=checked]:border-none"
                                                        />
                                                    </TableCell>
                                                    <TableCell className="font-mono text-sm font-bold text-primary max-w-[80px] truncate">{t.id}</TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex flex-col">
                                                                <span className="font-bold text-sm leading-snug group-hover:text-primary transition-colors">{t.subject}</span>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <span className="text-sm text-muted-foreground flex items-center gap-1 font-medium"><User className="w-2.5 h-2.5" /> {t.customer?.name}</span>
                                                                    <span className="text-sm text-muted-foreground/50 hidden sm:inline">•</span>
                                                                    <span className="text-sm text-muted-foreground flex items-center gap-1 font-medium"><Clock className="w-2.5 h-2.5" /> Updated {formatDistanceToNow(new Date(t.updatedAt), { addSuffix: true })}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="hidden md:table-cell">{getStatusBadge(t.status)}</TableCell>
                                                    <TableCell className="hidden sm:table-cell">{getPriorityBadge(t.priority)}</TableCell>
                                                    <TableCell className="hidden lg:table-cell">
                                                        <Badge variant="outline" className="text-sm gap-1 font-bold border-border bg-muted/30">
                                                            <Tag className="w-2.5 h-2.5 opacity-40" /> {t.category}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Button variant="ghost" size="sm" className="h-8 rounded-lg gap-1 text-primary font-bold px-3 hover:bg-primary/10">
                                                                Reply <ChevronRight className="w-3 h-3" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </Animated>
                                            ))}
                                        </AnimatePresence>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Bulk Action Bar */}
                    <AnimatePresence>
                        {selectedTicketIds.length > 0 && (
                            <AnimatedDiv 
                                initial={{ y: 100, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: 100, opacity: 0 }}
                                className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-background/80 backdrop-blur-xl border border-primary/20 shadow-2xl rounded-2xl px-6 h-16 flex items-center gap-6 min-w-[320px] md:min-w-[500px]"
                            >
                                <div className="flex items-center gap-3 border-r border-border pr-6">
                                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-semibold text-xs">
                                        {selectedTicketIds.length}
                                    </div>
                                    <span className="text-sm md:text-xs font-bold uppercase ">Tickets Selected</span>
                                </div>
                                <div className="flex items-center gap-2 flex-1">
                                    <Button variant="ghost" size="sm" className="h-9 px-3 text-xs font-bold gap-2 hover:bg-primary/10" onClick={handleBulkMarkResolved}>
                                        <CheckCircle2 className="w-4 h-4" /> <span className="hidden md:inline">Mark Resolved</span>
                                    </Button>
                                    <Button variant="ghost" size="sm" className="h-9 px-3 text-xs font-bold gap-2 hover:bg-amber-500/10 hover:text-amber-500" onClick={() => toast.info("Open a ticket to change its status.")}>
                                        <RefreshCw className="w-4 h-4" /> <span className="hidden md:inline">Update Status</span>
                                    </Button>
                                    <Button variant="ghost" size="sm" className="h-9 px-3 text-xs font-bold gap-2 hover:bg-red-500/10 hover:text-red-500" onClick={() => setSelectedTicketIds([])}>
                                        <Trash2 className="w-4 h-4" /> <span className="hidden md:inline">Clear</span>
                                    </Button>
                                </div>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setSelectedTicketIds([])}>
                                    <Plus className="w-4 h-4 rotate-45" />
                                </Button>
                            </AnimatedDiv>
                        )}
                    </AnimatePresence>
                </TabsContent>

                {/* Knowledge Base Tab */}
                <TabsContent value="knowledge" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <Card className="lg:col-span-2 border-border/50">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>FAQ Inventory</CardTitle>
                                    <CardDescription>Manage self-service documentation articles.</CardDescription>
                                </div>
                                <Sheet open={isNewKbOpen} onOpenChange={setIsNewKbOpen}>
                                    <SheetTrigger asChild>
                                        <Button size="sm" className="rounded-xl font-bold h-9">
                                            <Plus className="w-3.5 h-3.5 mr-2" /> New Article
                                        </Button>
                                    </SheetTrigger>
                                    <SheetContent className="sm:max-w-md p-0 overflow-hidden flex flex-col">
                                        <SheetHeader className="p-6 md:p-8 border-b bg-muted/5 shrink-0 space-y-3">
                                            <SheetTitle className="text-xl md:text-2xl font-semibold  text-primary">Publish Article</SheetTitle>
                                            <SheetDescription>Create a new knowledge base article for self-service support.</SheetDescription>
                                        </SheetHeader>
                                        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
                                            <div className="space-y-3">
                                                <Label className="text-sm font-bold ">Article Title</Label>
                                                <Input placeholder="e.g., How to reset your password" className="rounded-xl h-11 bg-muted/30 border-none" />
                                            </div>
                                            <div className="space-y-3">
                                                <Label className="text-sm font-bold ">Category</Label>
                                                <Select>
                                                    <SelectTrigger className="rounded-xl h-11 bg-muted/30 border-none">
                                                        <SelectValue placeholder="Select category" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="technical">Technical</SelectItem>
                                                        <SelectItem value="billing">Billing</SelectItem>
                                                        <SelectItem value="general">General</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <Label className="text-sm font-bold ">Content (Markdown supported)</Label>
                                                    <div className="flex items-center gap-2">
                                                        <Button variant="ghost" size="icon" className="h-7 w-7"><Bold className="w-3.5 h-3.5" /></Button>
                                                        <Button variant="ghost" size="icon" className="h-7 w-7"><Italic className="w-3.5 h-3.5" /></Button>
                                                        <Button variant="ghost" size="icon" className="h-7 w-7"><LinkIcon className="w-3.5 h-3.5" /></Button>
                                                        <Button variant="ghost" size="icon" className="h-7 w-7"><ImageIcon className="w-3.5 h-3.5" /></Button>
                                                    </div>
                                                </div>
                                                <Textarea placeholder="Write article content here..." className="min-h-[250px] rounded-xl bg-muted/30 border-none resize-none p-4" />
                                            </div>
                                            <SheetFooter className="pt-4 border-t border-border/50">
                                                <Button className="w-full h-12 rounded-xl font-semibold uppercase " onClick={() => {
                                                    toast.info("KB publish: connect a knowledge base API to add articles.");
                                                    setIsNewKbOpen(false);
                                                }}>Publish to KB</Button>
                                            </SheetFooter>
                                        </div>
                                    </SheetContent>
                                </Sheet>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/5">
                                            <TableHead>Title</TableHead>
                                            <TableHead>Category</TableHead>
                                            <TableHead>Views</TableHead>
                                            <TableHead>Last Sync</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {kbArticles.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="h-40 text-center text-muted-foreground">
                                                    <div className="flex flex-col items-center justify-center gap-2">
                                                        <BookOpen className="w-10 h-10 opacity-30" />
                                                        <p className="font-bold">No KB articles yet</p>
                                                        <p className="text-xs">Knowledge base articles will appear here when the API is connected.</p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : null}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>

                        <div className="space-y-6">
                            <Card className="border-border/50 bg-primary/5 relative overflow-hidden">
                                <CardHeader>
                                    <CardTitle className="text-base">KB Health</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-muted-foreground font-medium">Article Coverage</span>
                                        <span className="font-bold">—</span>
                                    </div>
                                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                        <div className="h-full bg-primary w-0" />
                                    </div>
                                    <p className="text-sm text-muted-foreground leading-relaxed pt-2">
                                        Add KB articles to enable self-service and reduce ticket volume.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                {/* Email Support Tab */}
                <TabsContent value="email" className="space-y-4">
                     <Card className="border-border/50 overflow-hidden">
                        <CardHeader className="bg-muted/10 border-b border-border/50 px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <h3 className="font-bold">Support Inbox</h3>
                                    <Badge className="bg-primary/20 text-primary border-none">Unified</Badge>
                                </div>
                                <div className="text-xs text-muted-foreground font-medium ">No inbox API</div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="p-12 flex flex-col items-center justify-center text-center text-muted-foreground">
                                <Mail className="w-12 h-12 opacity-30 mb-3" />
                                <p className="font-bold">No inbox messages</p>
                                <p className="text-xs max-w-[280px] mt-1">Connect a support email or inbox API to see messages here.</p>
                            </div>
                        </CardContent>
                        <CardFooter className="bg-muted/5 justify-center py-4 border-t border-border/50">
                            <Button variant="ghost" className="text-xs font-semibold text-primary hover:bg-transparent px-8" onClick={() => toast.info("Inbox integration coming soon.")}>Load More Messages</Button>
                        </CardFooter>
                     </Card>
                </TabsContent>
            </Tabs>

            {/* Ticket Details Dialog */}
            <Dialog open={!!selectedTicketId} onOpenChange={(open) => !open && setSelectedTicketId(null)}>
                <DialogContent className="max-w-3xl w-[95vw] md:w-full h-[90vh] md:h-[80vh] flex flex-col p-0 overflow-hidden rounded-2xl">
                    {isLoadingTicketDetails ? (
                        <div className="flex-1 flex flex-col">
                            <DialogHeader className="p-4 md:p-6 border-b bg-muted/10 shrink-0">
                                <DialogTitle className="text-lg md:text-xl font-bold ">Loading Ticket Details...</DialogTitle>
                            </DialogHeader>
                            <div className="flex-1 flex items-center justify-center">
                                <CardDescription className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 animate-spin" /> Syncing with support matrix...
                                </CardDescription>
                            </div>
                        </div>
                    ) : selectedTicket ? (
                        <>
                            <DialogHeader className="p-4 md:p-6 border-b bg-muted/10 shrink-0">
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                                        <Badge variant="outline" className="font-mono text-xs md:text-sm text-primary">{selectedTicket.id}</Badge>
                                        {getStatusBadge(selectedTicket.status)}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Select 
                                            value={selectedTicket.status} 
                                            onValueChange={(status) => updateStatusMutation.mutate({ id: selectedTicket.id, status })}
                                        >
                                            <SelectTrigger className="w-[130px] h-8 text-sm font-bold">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value={TicketStatus.OPEN}>Open</SelectItem>
                                                <SelectItem value={TicketStatus.PENDING}>Pending</SelectItem>
                                                <SelectItem value={TicketStatus.RESOLVED}>Resolved</SelectItem>
                                                <SelectItem value={TicketStatus.CLOSED}>Closed</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <DialogTitle className="mt-3 md:mt-4 text-lg md:text-xl font-bold  line-clamp-2">{selectedTicket.subject}</DialogTitle>
                                <DialogDescription className="flex flex-wrap items-center gap-3 md:gap-4 mt-2">
                                    <Badge variant="outline" className="border-none bg-primary/5 text-primary flex items-center gap-1.5 px-0 text-sm md:text-xs"><User className="w-3 h-3" /> {selectedTicket.customer?.name}</Badge>
                                    <Badge variant="outline" className="border-none bg-muted text-muted-foreground flex items-center gap-1.5 px-0 text-sm md:text-xs"><Tag className="w-3 h-3" /> {selectedTicket.category}</Badge>
                                </DialogDescription>
                            </DialogHeader>

                            <ScrollArea className="flex-1 p-6">
                                <div className="space-y-6">
                                    {selectedTicket.messages?.map((msg: any) => (
                                        <div key={msg.id} className={cn(
                                            "flex gap-4 max-w-[85%]",
                                            msg.sender?.id === selectedTicket.customer?.id ? "flex-row" : "flex-row-reverse ml-auto"
                                        )}>
                                            <Avatar className="h-8 w-8 shrink-0">
                                                <AvatarFallback>{(msg.sender?.name || '?').charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div className={cn(
                                                "p-3 md:p-4 rounded-2xl text-[13px] md:text-sm",
                                                msg.sender?.id === selectedTicket.customer?.id 
                                                    ? "bg-muted text-foreground rounded-tl-none" 
                                                    : "bg-primary text-primary-foreground rounded-tr-none shadow-lg shadow-primary/10"
                                            )}>
                                                <div className="flex items-center justify-between gap-4 md:gap-8 mb-1">
                                                    <Label className="font-bold text-xs md:text-sm opacity-70 truncate max-w-[80px] md:max-w-none">{msg.sender?.name}</Label>
                                                    <Label className="text-xs md:text-sm opacity-50 font-medium whitespace-nowrap">{msg.createdAt ? formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true }) : "—"}</Label>
                                                </div>
                                                <CardDescription className={cn(
                                                    "leading-relaxed whitespace-pre-wrap text-[13px] md:text-sm",
                                                    msg.sender?.id === selectedTicket.customer?.id ? "text-foreground" : "text-primary-foreground"
                                                )}>{msg.content}</CardDescription>
                                            </div>
                                        </div>
                                    ))}
                                    {(!selectedTicket.messages || selectedTicket.messages.length === 0) && (
                                        <CardDescription className="text-center text-sm py-10">No messages in this ticket yet.</CardDescription>
                                    )}
                                </div>
                            </ScrollArea>

                            <div className="p-4 md:p-6 border-t bg-muted/10 shrink-0">
                                <div className="relative group">
                                    <Textarea 
                                        placeholder="Type your response here..." 
                                        className="min-h-[80px] md:min-h-[100px] rounded-xl pr-16 md:pr-20 bg-background text-sm shadow-inner"
                                        value={replyContent}
                                        onChange={(e) => setReplyContent(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && e.ctrlKey) {
                                                onSendMessage();
                                            }
                                        }}
                                    />
                                    <div className="absolute top-2 right-2 flex flex-col items-center gap-1">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-primary/10 text-primary"><Paperclip className="w-4 h-4" /></Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-primary/10 text-primary"><ImageIcon className="w-4 h-4" /></Button>
                                    </div>
                                    <div className="absolute bottom-3 right-3 flex items-center gap-2">
                                        <Label className="text-sm text-muted-foreground mr-2 hidden sm:block font-medium">Ctrl + Enter to send</Label>
                                        <Button 
                                            size="sm" 
                                            className="h-9 px-4 rounded-lg font-bold shadow-md shadow-primary/20"
                                            onClick={onSendMessage}
                                            disabled={addMessageMutation.isPending || !replyContent.trim()}
                                        >
                                            {addMessageMutation.isPending ? "Sending..." : "Reply"}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center p-6">
                            <DialogHeader>
                                <DialogTitle>Ticket Not Found</DialogTitle>
                                <DialogDescription>The requested ticket could not be loaded.</DialogDescription>
                            </DialogHeader>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* KB Article Detail Dialog */}
            <Dialog open={!!selectedKbArticle} onOpenChange={(open) => !open && setSelectedKbArticle(null)}>
                <DialogContent className="max-w-2xl w-[95vw] md:w-full rounded-2xl overflow-hidden p-0">
                    {selectedKbArticle && (
                        <>
                            <DialogHeader className="p-6 md:p-8 border-b bg-muted/5">
                                <Badge variant="secondary" className="w-fit mb-4">{selectedKbArticle.category}</Badge>
                                <DialogTitle className="text-2xl font-semibold ">{selectedKbArticle.title}</DialogTitle>
                                <DialogDescription className="flex items-center gap-4 mt-2">
                                    <span className="flex items-center gap-1.5"><Eye className="w-3" /> {selectedKbArticle.views} views</span>
                                    <span className="flex items-center gap-1.5"><Clock className="w-3" /> Updated {selectedKbArticle.updatedAt}</span>
                                </DialogDescription>
                            </DialogHeader>
                            <div className="p-6 md:p-8">
                                <div className="prose prose-sm dark:prose-invert max-w-none">
                                    <p className="text-muted-foreground leading-relaxed">
                                        This is a simulated knowledge base article content for <strong>{selectedKbArticle.title}</strong>. 
                                        In a real integration, this would be fetched from the CMS or backend database.
                                    </p>
                                    <div className="mt-8 p-4 bg-muted/30 rounded-xl border border-border/50">
                                        <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
                                            <Star className="w-3 h-3 text-amber-500 fill-amber-500" /> Was this helpful?
                                        </h4>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" className="h-8 rounded-lg" onClick={() => toast.success("Thanks for your feedback!")}>Yes</Button>
                                            <Button variant="outline" size="sm" className="h-8 rounded-lg" onClick={() => toast.success("We will improve this.")}>No</Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* Email Detail Dialog */}
            <Dialog open={!!selectedEmail} onOpenChange={(open) => !open && setSelectedEmail(null)}>
                <DialogContent className="max-w-xl w-[95vw] md:w-full rounded-2xl overflow-hidden p-0">
                    {selectedEmail && (
                        <>
                            <DialogHeader className="p-6 md:p-8 border-b bg-muted/10">
                                <div className="flex items-center gap-4 mb-4">
                                    <Avatar className="h-10 w-10">
                                        <AvatarFallback>{(selectedEmail.from || '?').charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <DialogTitle className="text-lg font-bold">{selectedEmail.from}</DialogTitle>
                                        <CardDescription>{selectedEmail.time}</CardDescription>
                                    </div>
                                </div>
                                <h3 className="text-xl font-semibold ">{selectedEmail.subject}</h3>
                            </DialogHeader>
                            <div className="p-6 md:p-8 space-y-6">
                                <p className="text-sm leading-relaxed text-muted-foreground ">
                                    "{selectedEmail.content || "No content provided in simulation."}"
                                </p>
                                <div className="flex gap-2 pt-4 border-t border-border/50">
                                    <Button className="flex-1 rounded-xl font-bold h-11" onClick={() => toast.success("Reply draft saved")}>Reply in Inbox</Button>
                                    <Button variant="outline" className="flex-1 rounded-xl font-bold h-11" onClick={() => toast.success("Ticket created from email")}>Convert to Ticket</Button>
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

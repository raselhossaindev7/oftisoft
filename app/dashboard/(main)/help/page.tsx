"use client"
import { AnimatedH1, AnimatedH2, AnimatedH3 } from "@/lib/animated";
import { useState, useEffect, useCallback } from "react";
import { 
    Search, Book, MessageCircle, Mail, FileQuestion, 
    ChevronRight, ExternalLink, Plus, AlertCircle, CheckCircle2,
    RefreshCw
} from "lucide-react";
import { useSupport } from "@/hooks/useSupport";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const FAQ_ITEMS = [
    { q: "How do I upgrade my plan?", a: "You can upgrade your plan anytime from the Billing > Subscription section. Changes take effect immediately." },
    { q: "Can I manage multiple teams?", a: "Yes, the Pro and Business plans support multiple team management with role-based access control." },
    { q: "Where can I find my API keys?", a: "API keys are located in Settings > Developer. Make sure to keep them secure." },
    { q: "Do you offer refunds?", a: "We offer a 14-day money-back guarantee for all new subscriptions. Contact support for assistance." },
];

const GUIDES = [
    { title: "Getting Started", time: "5 min read", category: "Basics" },
    { title: "Setting up Custom Domains", time: "10 min read", category: "Advanced" },
    { title: "API Documentation", time: "15 min read", category: "Developer" },
];

export default function HelpPage() {
    const { tickets, isLoading, fetchTickets, createTicketAsync, getTicket, addMessageAsync } = useSupport();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    
    // Ticket Details State
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
    const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    const [replyContent, setReplyContent] = useState("");
    const [isReplying, setIsReplying] = useState(false);

    // Ticket Form
  const [subject, setSubject] = useState("");
    const [category, setCategory] = useState("technical");
    const [priority, setPriority] = useState("medium");
    const [description, setDescription] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchTicketDetails = useCallback(async (id: string) => {
        setIsLoadingDetails(true);
        try {
            const data = await getTicket(id);
            setSelectedTicket(data);
        } catch (error) {
            console.error("Failed to fetch ticket details", error);
            toast.error("Could not load ticket details");
        } finally {
            setIsLoadingDetails(false);
        }
    }, [getTicket]);

    useEffect(() => {
        if (selectedTicketId) {
            fetchTicketDetails(selectedTicketId);
        } else {
            setSelectedTicket(null);
            setReplyContent("");
        }
    }, [selectedTicketId, fetchTicketDetails]);

    useEffect(() => {
        fetchTickets();
    }, [fetchTickets]);

    const handleSubmitTicket = async () => {
        if (!subject || !description) {
            toast.error("Please fill in all required fields");
            return;
        }

        setIsSubmitting(true);
        try {
            await createTicketAsync({
                subject,
                category,
                priority,
                description
            });
            setIsCreateOpen(false);
            setSubject("");
            setDescription("");
            setCategory("Technical");
            setPriority("MEDIUM");
        } catch (err) {
            // Error handled in hook
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReply = async () => {
        if (!selectedTicketId || !replyContent.trim()) return;
        
        setIsReplying(true);
        try {
            await addMessageAsync({ id: selectedTicketId, content: replyContent });
            setReplyContent("");
            // Refresh details, fetchTicketDetails(selectedTicketId);
        } catch (error) {
            // Error handled in hook
        } finally {
            setIsReplying(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'open': return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'pending': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
            case 'resolved': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'closed': return 'bg-muted text-muted-foreground border-border';
            default: return 'bg-muted text-muted-foreground';
        }
    };

    return (
        <div className="mx-auto space-y-12 pb-20">
            
            <div className="text-center space-y-4 py-8">
                <AnimatedH1 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-3xl font-semibold"
                >
                    How can we help?
                </AnimatedH1>
                <div className="relative max-w-lg mx-auto group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5 group-focus-within:text-primary transition-colors" />
                    <input 
                        placeholder="Search for answers..." 
                        className="w-full pl-12 pr-6 py-4 rounded-2xl bg-card border border-border shadow-sm focus:ring-2 focus:ring-primary/20 outline-none text-lg transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link href="/docs" className="bg-card border border-border/50 rounded-[32px] p-8 hover:border-primary/30 hover:shadow-lg transition-all group cursor-pointer">
                    <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 mb-6 group-hover:scale-110 transition-transform shadow-inner">
                        <Book className="w-7 h-7" />
                    </div>
                    <h3 className="font-semibold text-xl mb-2 ">Documentation</h3>
                    <p className="text-muted-foreground text-sm font-medium mb-4">Detailed guides and API references for developers.</p>
                    <span className="text-sm font-semibold text-primary flex items-center gap-1 group-hover:underline">Browse Docs <ChevronRight size={14} /></span>
                </Link>

                <div 
                    onClick={() => toast.info("Live chat agents are currently busy. Please open a ticket.")}
                    className="bg-card border border-border/50 rounded-[32px] p-8 hover:border-primary/30 hover:shadow-lg transition-all group cursor-pointer"
                >
                    <div className="w-14 h-14 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-500 mb-6 group-hover:scale-110 transition-transform shadow-inner">
                        <MessageCircle className="w-7 h-7" />
                    </div>
                    <h3 className="font-semibold text-xl mb-2 ">Live Chat</h3>
                    <p className="text-muted-foreground text-sm font-medium mb-4">Chat with our support team in real-time.</p>
                    <span className="text-sm font-semibold text-primary flex items-center gap-1 group-hover:underline">Start Chat <ChevronRight size={14} /></span>
                </div>

                <div 
                    onClick={() => setIsCreateOpen(true)}
                    className="bg-card border border-border/50 rounded-[32px] p-8 hover:border-primary/30 hover:shadow-lg transition-all group cursor-pointer"
                >
                    <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-500 mb-6 group-hover:scale-110 transition-transform shadow-inner">
                        <Mail className="w-7 h-7" />
                    </div>
                    <h3 className="font-semibold text-xl mb-2 ">Priority Support</h3>
                    <p className="text-muted-foreground text-sm font-medium mb-4">Open a ticket for complex issues. 24h response time.</p>
                    <span className="text-sm font-semibold text-primary flex items-center gap-1 group-hover:underline">Open Ticket <ChevronRight size={14} /></span>
                </div>
            </div>

            {/* Recent Tickets Section */}
            {tickets.length > 0 && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                         <h3 className="text-2xl font-semibold">Your Recent Tickets</h3>
                         <Button variant="outline" size="sm" onClick={() => fetchTickets()} className="gap-2 rounded-xl h-9 font-bold">
                            <RefreshCw className={cn("w-3.5 h-3.5", isLoading && "animate-spin")} />
                            Refresh
                         </Button>
                    </div>
                    
                    <div className="grid gap-4">
                        {tickets.slice(0, 3).map((ticket) => (
                            <div key={ticket.id} className="bg-card border border-border/50 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-primary/30 transition-all group overflow-hidden relative">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <Badge variant="outline" className={`capitalize font-semibold border-2 ${getStatusColor(ticket.status)}`}>
                                            {ticket.status}
                                        </Badge>
                                        <span className="text-xs font-bold text-muted-foreground ">
                                            #{(ticket.id || '—').slice(0, 8)}
                                        </span>
                                        <span className="text-xs font-medium text-muted-foreground">
                                            {format(new Date(ticket.createdAt), 'MMM dd, yyyy')}
                                        </span>
                                    </div>
                                    <h4 className="font-bold text-lg">{ticket.subject}</h4>
                                </div>
                                <div className="flex items-center gap-4">
                                     <Badge variant="secondary" className=" text-sm font-semibold h-6">
                                        {ticket.category}
                                     </Badge>
                                     <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="font-bold gap-1 group-hover:bg-primary/10 group-hover:text-primary transition-all rounded-lg"
                                        onClick={() => setSelectedTicketId(ticket.id)}
                                     >
                                        View Details <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                     </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div>
                     <h3 className="text-2xl font-semibold mb-6">Frequently Asked Questions</h3>
                     <div className="space-y-4">
                        {FAQ_ITEMS.filter(i => i.q.toLowerCase().includes(searchQuery.toLowerCase()) || i.a.toLowerCase().includes(searchQuery.toLowerCase())).map((item, i) => (
                            <div key={i} className="bg-muted/10 border border-border/50 rounded-2xl p-6 hover:bg-muted/20 transition-colors">
                                <h4 className="font-bold text-base mb-2 flex items-start gap-3">
                                    <div className="p-1 rounded bg-primary/10 text-primary mt-0.5">
                                        <FileQuestion className="w-4 h-4" />
                                    </div>
                                    {item.q}
                                </h4>
                                <p className="text-sm font-medium text-muted-foreground pl-9 leading-relaxed">{item.a}</p>
                            </div>
                        ))}
                     </div>
                </div>

                <div>
                    <h3 className="text-2xl font-semibold mb-6">Popular Guides</h3>
                    <div className="space-y-4">
                        {GUIDES.map((guide, i) => (
                            <Link href="#" key={i} className="flex items-center justify-between p-5 bg-card border border-border/50 rounded-2xl hover:border-primary/30 hover:shadow-md transition-all cursor-pointer group">
                                <div className="space-y-1">
                                    <h4 className="font-bold group-hover:text-primary transition-colors text-lg">{guide.title}</h4>
                                    <p className="text-xs text-muted-foreground font-medium flex items-center gap-2">
                                        <Badge variant="secondary" className="text-sm  font-semibold h-5">{guide.category}</Badge>
                                        {guide.time}
                                    </p>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                    <ExternalLink className="w-5 h-5" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Ticket Details Dialog */}
            <Dialog open={!!selectedTicketId} onOpenChange={(open) => !open && setSelectedTicketId(null)}>
                <DialogContent className="max-w-3xl w-[95vw] md:w-full h-[90vh] md:h-[80vh] flex flex-col p-0 overflow-hidden rounded-[32px] border-border/50 bg-card/95 backdrop-blur-xl">
                    {isLoadingDetails ? (
                        <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                            <RefreshCw className="w-8 h-8 text-primary animate-spin" />
                            <p className="text-sm font-bold text-muted-foreground">Syncing ticket history...</p>
                        </div>
                    ) : selectedTicket ? (
                        <>
                            <DialogHeader className="p-6 md:p-8 border-b bg-muted/5 shrink-0">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <Badge variant="outline" className={`capitalize font-semibold border-2 ${getStatusColor(selectedTicket.status)}`}>
                                            {selectedTicket.status}
                                        </Badge>
                                        <span className="text-xs font-semibold text-muted-foreground ">#{(selectedTicket.id || '—').slice(0, 8)}</span>
                                    </div>
                                    <Badge variant="secondary" className=" text-sm font-semibold px-3 py-1">
                                        {selectedTicket.category}
                                    </Badge>
                                </div>
                                <DialogTitle className="text-2xl font-semibold">{selectedTicket.subject}</DialogTitle>
                            </DialogHeader>

                            <ScrollArea className="flex-1 p-6 md:p-8">
                                <div className="space-y-8">
                                    {selectedTicket.messages?.map((msg: any) => {
                                        const isCustomer = msg.sender?.id === selectedTicket.customer?.id;
                                        return (
                                            <div key={msg.id} className={cn(
                                                "flex gap-4 max-w-[85%]",
                                                isCustomer ? "flex-row" : "flex-row-reverse ml-auto"
                                            )}>
                                                <Avatar className="h-10 w-10 shrink-0 border-2 border-background shadow-sm">
                                                    <AvatarFallback className="font-bold text-xs">{(msg.sender?.name || '?').charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div className={cn(
                                                    "p-4 rounded-[24px] space-y-2 relative",
                                                    isCustomer 
                                                        ? "bg-muted/50 rounded-tl-none border border-border/50" 
                                                        : "bg-primary text-primary-foreground rounded-tr-none shadow-lg shadow-primary/20"
                                                )}>
                                                    <div className="flex items-center justify-between gap-8 mb-1">
                                                        <span className="text-sm font-semibold  opacity-70">{msg.sender?.name}</span>
                                                        <span className="text-sm opacity-50 font-bold">{format(new Date(msg.createdAt), 'HH:mm')}</span>
                                                    </div>
                                                    <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </ScrollArea>

                            <div className="p-6 md:p-8 border-t bg-muted/5 shrink-0">
                                <div className="relative group">
                                    <Textarea 
                                        placeholder="Add a reply to this ticket..." 
                                        className="min-h-[100px] rounded-2xl pr-20 bg-background border-border/50 focus:ring-primary/20 resize-none p-4 font-medium"
                                        value={replyContent}
                                        onChange={(e) => setReplyContent(e.target.value)}
                                    />
                                    <div className="absolute bottom-4 right-4 flex items-center gap-3">
                                        <span className="text-sm text-muted-foreground font-bold  hidden sm:block">Ctrl + Enter</span>
                                        <Button 
                                            size="sm" 
                                            className="h-10 px-6 rounded-xl font-semibold  shadow-lg shadow-primary/20 bg-primary text-white"
                                            onClick={handleReply}
                                            disabled={isReplying || !replyContent.trim()}
                                        >
                                            {isReplying ? "Sending..." : "Reply"}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : null}
                </DialogContent>
            </Dialog>

            {/* Create Ticket Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="sm:max-w-[600px] rounded-[32px] p-8 border-border/50 bg-card/95 backdrop-blur-xl">
                    <DialogHeader>
                        <DialogTitle className="text-3xl font-semibold text-center">Open Support Ticket</DialogTitle>
                        <DialogDescription className="text-center text-base font-medium">
                            Describe your issue and we'll get back to you as soon as possible.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-6 mt-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold  text-muted-foreground">Subject</label>
                            <Input 
                                placeholder="Brief summary of the issue" 
                                className="h-12 rounded-xl font-medium"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold  text-muted-foreground">Category</label>
                                <Select value={category} onValueChange={setCategory}>
                                    <SelectTrigger className="h-12 rounded-xl font-medium">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="general">General</SelectItem>
                                        <SelectItem value="billing">Billing</SelectItem>
                                        <SelectItem value="technical">Technical</SelectItem>
                                        <SelectItem value="feature">Feature Request</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold  text-muted-foreground">Priority</label>
                                <Select value={priority} onValueChange={setPriority}>
                                    <SelectTrigger className="h-12 rounded-xl font-medium">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                        <SelectItem value="urgent">Urgent</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold  text-muted-foreground">Description</label>
                            <Textarea 
                                placeholder="Provide detailed information about the issue..." 
                                className="min-h-[150px] rounded-xl font-medium resize-none p-4"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                    </div>

                    <DialogFooter className="mt-8">
                        <Button variant="outline" onClick={() => setIsCreateOpen(false)} className="rounded-xl h-12 font-bold px-8">Cancel</Button>
                        <Button 
                            onClick={handleSubmitTicket} 
                            disabled={isSubmitting}
                            className="rounded-xl h-12 font-bold px-8 bg-primary text-white shadow-lg shadow-primary/20"
                        >
                            {isSubmitting ? "Submitting..." : "Submit Ticket"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    );
}

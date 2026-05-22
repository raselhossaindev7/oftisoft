"use client"
import { AnimatedDiv, AnimatePresence } from "@/lib/animated";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { 
    FileText, 
    Clock, 
    CheckCircle2, 
    XCircle, 
    ChevronRight, 
    DollarSign, 
    Calendar, 
    ArrowRight,
    Search,
    Filter,
    MessageSquare,
    ShieldCheck,
    Zap,
    Briefcase,
    Timer,
    Check,
    X as XIcon,
    ExternalLink,
    Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useQuotes } from "@/hooks/useQuotes";

// Request Quote Dialog
const RequestQuoteDialog = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    const { createQuote, isCreating } = useQuotes();
    const [formData, setFormData] = useState({
        serviceType: "",
        description: "",
        budget: ""
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.serviceType || !formData.description || !formData.budget) {
            toast.error("Please fill in all fields");
            return;
        }

        createQuote(formData, {
            onSuccess: () => {
                setFormData({ serviceType: "", description: "", budget: "" });
                onClose();
            }
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <AnimatedDiv initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-card w-full max-w-2xl rounded-3xl border border-border shadow-2xl overflow-hidden"
            >
                <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
                    <div>
                        <h3 className="text-xl font-bold">Request Custom Quote</h3>
                        <p className="text-sm text-muted-foreground">Tell us about your project needs</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
                        <XIcon size={18} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="serviceType">Service Type</Label>
                        <Input id="serviceType"
                            placeholder="e.g., Custom Web Application Mobile App API Integration"
                            value={formData.serviceType}
                            onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                            className="h-12 rounded-xl"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Project Description</Label>
                        <Textarea id="description"
                            placeholder="Describe your project requirements features and goals..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="min-h-[120px] rounded-xl"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="budget">Budget Range</Label>
                        <Input id="budget"
                            placeholder="e.g., $5,000 - $10,000"
                            value={formData.budget}
                            onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                            className="h-12 rounded-xl"
                        />
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 border border-border rounded-xl font-bold hover:bg-muted transition-colors"
                        >
                            Cancel
                        </button>
                        <button type="submit"
                            disabled={isCreating}
                            className="flex-1 px-4 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isCreating && <Loader2 className="w-4 h-4 animate-spin" />}
                            {isCreating ? "Submitting..." : "Submit Request"}
                        </button>
                    </div>
                </form>
            </AnimatedDiv>
        </div>
    );
};

function QuotesPageContent() {
    const searchParams = useSearchParams();
    const { quotes, isLoading, updateStatus, downloadProposal, isDownloading } = useQuotes();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedQuote, setSelectedQuote] = useState<any>(null);
    const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);

    useEffect(() => {
        const quoteId = searchParams.get('quote');
        if (quoteId && quotes?.length) {
            const found = (quotes || []).find((q: { id: string }) => q.id === quoteId);
            if (found) setSelectedQuote(found);
        }
    }, [searchParams, quotes]);

    const filteredQuotes = (quotes || []).filter(q => 
        (q.serviceType || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (q.id || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleAction = (id: string, action: "accepted" | "rejected") => {
        updateStatus(id, action);
        if (selectedQuote?.id === id) {
            setSelectedQuote({ ...selectedQuote, status: action });
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-semibold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                        Quotes & Proposals
                    </h1>
                    <p className="text-muted-foreground font-medium mt-1">Manage custom build requests, professional side-by-side proposals, and project timelines.</p>
                </div>
                <div className="flex gap-2">
                    <Button 
                        variant="outline" 
                        className="rounded-xl gap-2 font-bold h-11 border-border/50 bg-card/50 backdrop-blur-sm"
                        onClick={() => setIsRequestDialogOpen(true)}
                    >
                        <MessageSquare className="w-4 h-4" /> Request Custom Quote
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Sidebar: Quote List */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search requests..." 
                            className="pl-11 h-12 rounded-2xl bg-card/50 border-border/50 focus:ring-primary/20"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="space-y-4">
                        {filteredQuotes.length > 0 ? filteredQuotes.map((quote) => (
                            <Card 
                                key={quote.id} 
                                className={cn(
                                    "cursor-pointer border-border/50 hover:border-primary/30 transition-all rounded-3xl overflow-hidden group",
                                    selectedQuote?.id === quote.id ? "ring-2 ring-primary ring-offset-2 ring-offset-background bg-primary/[0.03]" : "bg-card/50"
                                )}
                                onClick={() => setSelectedQuote(quote)}
                            >
                                <CardContent className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <Badge variant="outline" className="text-xs font-semibold uppercase">
                                            #{quote.id?.substring(0, 8) || "—"}
                                        </Badge>
                                        <Badge className={cn("text-xs font-semibold uppercase px-2", 
                                            quote.status === "responded" ? "bg-primary text-white" : 
                                            quote.status === "accepted" ? "bg-green-500 text-white" : 
                                            quote.status === "requested" ? "bg-orange-500 text-white" : "bg-red-500 text-white"
                                        )}>
                                            {quote.status}
                                        </Badge>
                                    </div>
                                    <h3 className="font-semibold text-lg leading-tight mb-2 group-hover:text-primary transition-colors">{quote.serviceType}</h3>
                                    <div className="flex items-center gap-4 text-sm font-bold text-muted-foreground uppercase">
                                        <div className="flex items-center gap-1.5"><Calendar size={12} /> {formatDate(quote.createdAt)}</div>
                                        <div className="flex items-center gap-1.5"><DollarSign size={12} /> {quote.budget}</div>
                                    </div>
                                </CardContent>
                            </Card>
                        )) : (
                            <div className="text-center py-12 text-muted-foreground">
                                <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p className="font-bold">No quotes found</p>
                                <p className="text-xs">Request a custom quote to get started</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Area: Quote Details */}
                <div className="lg:col-span-8">
                    <AnimatePresence mode="wait">
                        {selectedQuote ? (
                            <AnimatedDiv key={selectedQuote.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                {/* Summary Card */}
                                <Card className="border-border/50 bg-card/30 backdrop-blur-xl rounded-[40px] overflow-hidden">
                                    <CardHeader className="p-10 border-b border-border/50 bg-primary/[0.02]">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xs font-semibold text-primary uppercase">#{(selectedQuote.id || '—').substring(0, 8)}</span>
                                                    <Badge variant="outline" className="rounded-lg h-5 text-xs font-semibold uppercase">Service Request</Badge>
                                                </div>
                                                <h2 className="text-3xl font-semibold">{selectedQuote.serviceType}</h2>
                                            </div>
                                            <div className="flex gap-3">
                                                {selectedQuote.status === "responded" && (
                                                    <>
                                                        <Button 
                                                            variant="outline" 
                                                            className="rounded-2xl h-14 px-8 font-semibold text-red-500 border-red-500/20 hover:bg-red-500/10"
                                                            onClick={() => handleAction(selectedQuote.id, "rejected")}
                                                        >
                                                            <XIcon className="w-5 h-5 mr-2" /> Decline
                                                        </Button>
                                                        <Button 
                                                            className="rounded-2xl h-14 px-10 font-semibold bg-primary text-white shadow-xl shadow-primary/20"
                                                            onClick={() => handleAction(selectedQuote.id, "accepted")}
                                                        >
                                                            <Check className="w-5 h-5 mr-2" /> Accept Proposal
                                                        </Button>
                                                    </>
                                                )}
                                                {selectedQuote.status === "accepted" && (
                                                    <Badge className="bg-green-500 text-white h-14 px-8 rounded-2xl font-semibold text-lg shadow-xl shadow-green-500/20">
                                                        <ShieldCheck className="w-6 h-6 mr-3" /> Project Active
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-10 space-y-10">
                                        {/* Original Request */}
                                        <div className="space-y-4">
                                            <h4 className="text-sm font-semibold uppercase text-muted-foreground  flex items-center gap-2">
                                                <Briefcase size={14} className="text-primary" /> Project Brief
                                            </h4>
                                            <p className="text-lg font-medium leading-relaxed  text-foreground/80 bg-muted/20 p-8 rounded-[32px] border border-border/50">
                                                "{selectedQuote.description}"
                                            </p>
                                        </div>

                                        {/* Proposal Content */}
                                        {selectedQuote.proposal ? (
                                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                    <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10 space-y-1">
                                                        <p className="text-sm font-semibold text-primary uppercase">Estimated Investment</p>
                                                        <p className="text-2xl font-semibold">${selectedQuote.proposal?.price?.toLocaleString() || "—"}</p>
                                                    </div>
                                                    <div className="p-6 rounded-3xl bg-orange-500/5 border border-orange-500/10 space-y-1">
                                                        <p className="text-sm font-semibold text-orange-500 uppercase">Deployment Time</p>
                                                        <p className="text-2xl font-semibold">{selectedQuote.proposal?.estimatedDays || "—"} Days</p>
                                                    </div>
                                                    <div className="p-6 rounded-3xl bg-blue-500/5 border border-blue-500/10 space-y-1">
                                                        <p className="text-sm font-semibold text-blue-500 uppercase">Proposal Validity</p>
                                                        <p className="text-2xl font-semibold">{selectedQuote.proposal.validUntil}</p>
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <h4 className="text-sm font-semibold uppercase text-muted-foreground  flex items-center gap-2">
                                                        <Zap size={14} className="text-primary" /> Technical Approach & Scope
                                                    </h4>
                                                    <div className="p-8 rounded-[32px] bg-card/50 border border-border/50 text-muted-foreground font-medium leading-relaxed">
                                                        {selectedQuote.proposal.content}
                                                    </div>
                                                </div>

                                                {/* Timeline / Milestones */}
                                                <div className="space-y-6">
                                                    <h4 className="text-sm font-semibold uppercase text-muted-foreground  flex items-center gap-2">
                                                        <Timer size={14} className="text-primary" /> Project Execution Timeline
                                                    </h4>
                                                    <div className="relative space-y-4 before:absolute before:left-[19px] before:top-4 before:bottom-4 before:w-0.5 before:bg-border/50">
                                                        {selectedQuote.proposal.milestones.map((m: any, idx: number) => (
                                                            <div key={m.id} className="relative pl-12">
                                                                <div className={cn(
                                                                    "absolute left-0 top-0 w-10 h-10 rounded-full border-4 border-background flex items-center justify-center z-10 shadow-sm",
                                                                    m.status === "done" ? "bg-green-500 text-white" : 
                                                                    m.status === "current" ? "bg-primary text-white animate-pulse" : "bg-muted text-muted-foreground"
                                                                )}>
                                                                    {m.status === "done" ? <Check size={16} /> : <span className="text-xs font-semibold">{idx + 1}</span>}
                                                                </div>
                                                                <div className={cn(
                                                                    "p-6 rounded-2xl border transition-all",
                                                                    m.status === "current" ? "bg-primary/[0.03] border-primary/20 shadow-lg shadow-primary/5" : "bg-card/30 border-border/50"
                                                                )}>
                                                                    <div className="flex justify-between items-center">
                                                                        <h5 className="font-bold ">{m.title}</h5>
                                                                        <span className="text-sm font-semibold uppercase text-muted-foreground bg-muted/50 px-3 py-1 rounded-lg">Week {m.week}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="py-20 text-center space-y-6 bg-muted/5 rounded-[40px] border-2 border-dashed border-border/50 animate-pulse">
                                                <Clock className="w-16 h-16 text-muted-foreground mx-auto opacity-20" />
                                                <div className="space-y-2">
                                                    <h3 className="text-2xl font-semibold">Awaiting Architect Analysis</h3>
                                                    <p className="text-muted-foreground text-sm font-medium max-w-sm mx-auto">
                                                        Our senior engineers are currently evaluating your request payload. A detailed proposal will be de-queued shortly.
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                    <div className="p-10 pt-0 flex justify-between items-center text-sm font-bold text-muted-foreground uppercase  border-t border-border/50 pt-8 mt-5">
                                        <div className="flex items-center gap-6">
                                            <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-green-500" /> Secure Protocol ACTIVE</span>
                                            <span className="flex items-center gap-1.5"><Calendar size={14} className="text-primary" /> Request Node Synced: {formatDate(selectedQuote.createdAt)}</span>
                                        </div>
                                        <button 
                                            className="text-primary underline flex items-center gap-1.5 hover:text-primary/70 transition-colors disabled:opacity-50"
                                            onClick={() => downloadProposal(selectedQuote.id)}
                                            disabled={isDownloading}
                                        >
                                            {isDownloading && <Loader2 className="w-3 h-3 animate-spin"/>}
                                            {isDownloading ? "Downloading..." : "Download Full Proposal PDF"} 
                                            {!isDownloading && <ExternalLink size={10} />}
                                        </button>
                                    </div>
                                </Card>
                            </AnimatedDiv>
                        ) : (
                            <div className="h-[600px] flex flex-col items-center justify-center text-center space-y-6 bg-card/20 backdrop-blur-sm rounded-[50px] border-2 border-dashed border-border/50">
                                <FileText className="w-20 h-20 text-primary opacity-20" />
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-semibold">Proposal Command Center</h3>
                                    <p className="text-muted-foreground font-medium max-w-xs">Select a request node from the vector list to analyze proposals and timelines.</p>
                                </div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Request Quote Dialog */}
            <AnimatePresence>
                {isRequestDialogOpen && (
                    <RequestQuoteDialog isOpen={isRequestDialogOpen}
                        onClose={() => setIsRequestDialogOpen(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

export default function QuotesPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        }>
            <QuotesPageContent />
        </Suspense>
    );
}

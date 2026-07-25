"use client"
import { AnimatedDiv, AnimatePresence } from "@/lib/animated";

import { useState } from "react";
import { 
    Plus, 
    Search, 
    Filter, 
    Clock, 
    CheckCircle2, 
    MessageSquare, 
    ChevronRight,
    FileUp,
    Download,
    Calendar as CalendarIcon,
    Briefcase,
    Milestone,
    User,
    Send,
    MoreVertical,
    Paperclip,
    AlertCircle,
    ArrowRight,
    X
} from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { PaymentModal } from "@/components/projects/payment-modal";
import { useProjects } from "@/hooks/useProjects";

// New Project Dialog
const NewProjectDialog = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    const { createProject, isCreating } = useProjects();
    const [formData, setFormData] = useState({
        title: "",
        client: "",
        description: "",
        budget: ""
    });
    const [dueDate, setDueDate] = useState<Date>();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.title || !formData.client || !formData.description) {
            toast.error("Please fill in required fields");
            return;
        }

        createProject({
            title: formData.title,
            client: formData.client,
            description: formData.description,
            budget: formData.budget ? parseFloat(formData.budget) : 0,
            dueDate: dueDate?.toISOString() || new Date().toISOString(),
            status: "Planning",
            progress: 0,
            members: 1
        }, {
            onSuccess: () => {
                setFormData({ title: "", client: "", description: "", budget: "" });
                setDueDate(undefined);
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
                        <h3 className="text-xl font-bold">Start New Service Project</h3>
                        <p className="text-sm text-muted-foreground">Create a new custom service request</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
                        <X size={18} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Project Title *</Label>
                            <Input id="title"
                                placeholder="e.g., E-Commerce Extension"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="h-12 rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="client">Client Name *</Label>
                            <Input id="client"
                                placeholder="e.g., TechSolutions"
                                value={formData.client}
                                onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                                className="h-12 rounded-xl"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Project Description *</Label>
                        <Textarea id="description"
                            placeholder="Describe the service requirements and goals..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="min-h-[100px] rounded-xl"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="budget">Budget (USD)</Label>
                            <Input id="budget"
                                type="number"
                                placeholder="e.g., 5000"
                                value={formData.budget}
                                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                                className="h-12 rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Deadline</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full h-12 rounded-xl justify-start text-left font-normal border-border/50",
                                            !dueDate && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {dueDate ? format(dueDate, "PPP") : "Pick a date"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 z-[200]" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={dueDate}
                                        onSelect={setDueDate}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
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
                            className="flex-1 px-4 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                            {isCreating ? "Creating..." : "Create Project"}
                        </button>
                    </div>
                </form>
            </AnimatedDiv>
        </div>
    );
};

export default function MyServiceRequestsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<any>(null);

    const { projects, isLoading, isError, refetch, updatePaymentStatus } = useProjects();

    const handlePaymentComplete = (projectId: string) => {
        updatePaymentStatus(projectId, "Paid");
        setSelectedProject(null);
    };

    const filteredRequests = (projects || []).filter(req => 
        (req.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (req.id || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getStatusTheme = (status: string) => {
        switch (status) {
            case "In Progress": return "text-blue-500 bg-blue-500/10 border-blue-500/20";
            case "Completed": return "text-green-500 bg-green-500/10 border-green-500/20";
            case "Planning": return "text-orange-500 bg-orange-500/10 border-orange-500/20";
            case "On Hold": return "text-purple-500 bg-purple-500/10 border-purple-500/20";
            case "Review": return "text-amber-500 bg-amber-500/10 border-amber-500/20";
            case "Delayed": return "text-red-500 bg-red-500/10 border-red-500/20";
            default: return "text-muted-foreground bg-muted/10 border-muted/20";
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return "Not set";
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <AlertCircle className="w-16 h-16 text-destructive" />
                <h2 className="text-2xl font-bold">Failed to Load Projects</h2>
                <p className="text-muted-foreground">
                    Something went wrong while fetching your projects.
                </p>
                <Button variant="outline" onClick={() => refetch()}>
                    Try Again
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                        Service Projects
                    </h1>
                    <p className="text-muted-foreground font-medium mt-1">Track your custom development, SEO audits, and technical fixes.</p>
                </div>
                <div className="flex gap-2">
                    <Button 
                        variant="outline" 
                        className="rounded-xl gap-2 font-bold h-11 border-border/50 bg-card/50 backdrop-blur-sm"
                    >
                        <FileUp className="w-4 h-4" /> Global Assets
                    </Button>
                    <Button 
                        className="rounded-xl gap-2 font-bold h-11 bg-primary text-white shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
                        onClick={() => setIsNewProjectOpen(true)}
                    >
                        <Plus className="w-4 h-4" /> Start New Project
                    </Button>
                </div>
            </div>

            {/* Request List */}
            <div className="grid lg:grid-cols-3 gap-8">
                {/* Main List Area */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search by Project Title or ID..." 
                                className="pl-11 h-12 rounded-2xl bg-card/50 border-border/50 focus:ring-primary/20 transition-all shadow-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" className="h-12 rounded-2xl gap-2 px-6 border-border/50">
                            <Filter className="w-4 h-4" /> All Active
                        </Button>
                    </div>

                    <div className="space-y-6">
                        {filteredRequests.length > 0 ? filteredRequests.map((req) => (
                            <Card key={req.id} className="border-border/50 bg-card/60 backdrop-blur-md hover:border-primary/30 transition-all group overflow-hidden shadow-sm">
                                <CardHeader className="flex flex-row items-start justify-between p-8">
                                    <div className="space-y-3">
                                        <div className="flex gap-2">
                                            <Badge variant="outline" className={cn("text-xs font-semibold uppercase border-none px-2 py-1", getStatusTheme(req.status))}>
                                                {req.status}
                                            </Badge>
                                            {(req.paymentStatus === "Unpaid" || req.paymentStatus === "pending") && (
                                                <>
                                                    <Badge className="bg-red-500 text-white border-none font-semibold text-xs px-2 py-1 flex items-center gap-1">
                                                        <MessageSquare className="w-2.5 h-2.5" /> Payment Pending
                                                    </Badge>
                                                    <button
                                                        onClick={() => setSelectedProject(req)}
                                                        className="text-xs font-bold text-white bg-primary px-3 py-1.5 rounded-lg hover:bg-primary/90 transition-colors"
                                                    >
                                                        Pay Now
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                        <CardTitle className="text-2xl font-semibold  group-hover:text-primary transition-colors">{req.title}</CardTitle>
                                        <CardDescription className="flex items-center gap-4 text-xs font-medium">
                                            <span className="flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5" /> {req.client}</span>
                                            <span className="flex items-center gap-1.5"><CalendarIcon className="w-3.5 h-3.5" /> Deadline: {formatDate(req.dueDate)}</span>
                                        </CardDescription>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="text-right hidden sm:block mr-2">
                                            <p className="text-sm font-semibold text-muted-foreground uppercase mb-1">Budget</p>
                                            <p className="text-xs font-bold">{req.budget ? `$${req.budget.toLocaleString()}` : "Not set"}</p>
                                        </div>
                                        <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center font-semibold text-lg text-primary/80 border border-border group-hover:bg-primary group-hover:text-white transition-all">
                                            {req.client?.[0] || "P"}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="px-8 pb-8 space-y-8">
                                    {/* Progress Metrics */}
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-end">
                                            <p className="text-sm font-semibold uppercase text-muted-foreground">Project Progress</p>
                                            <p className="text-lg font-semibold ">{req.progress}%</p>
                                        </div>
                                        <div className="h-2 bg-muted/40 rounded-full overflow-hidden">
                                            <AnimatedDiv 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${req.progress}%` }}
                                                className="h-full bg-gradient-to-r from-primary/80 to-primary"
                                            />
                                        </div>
                                    </div>

                                    {/* Project Details */}
                                    <div className="grid md:grid-cols-2 gap-8 pt-4 border-t border-border/30">
                                        {/* Description */}
                                        <div className="space-y-4">
                                            <h4 className="flex items-center gap-2 text-sm font-semibold uppercase text-muted-foreground">
                                                <Briefcase className="w-3.5 h-3.5" /> Project Description
                                            </h4>
                                            <p className="text-sm text-muted-foreground leading-relaxed">
                                                {req.description || "No description provided"}
                                            </p>
                                        </div>

                                        {/* Project Info */}
                                        <div className="space-y-4">
                                            <h4 className="flex items-center gap-2 text-sm font-semibold uppercase text-muted-foreground">
                                                <Milestone className="w-3.5 h-3.5" /> Project Details
                                            </h4>
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center p-3 rounded-xl bg-muted/30 border border-border/50">
                                                    <span className="text-xs font-bold">Team Members</span>
                                                    <span className="text-xs font-semibold text-primary">{req.members || 1}</span>
                                                </div>
                                                <div className="flex justify-between items-center p-3 rounded-xl bg-muted/30 border border-border/50">
                                                    <span className="text-xs font-bold">Type</span>
                                                    <span className="text-xs font-semibold text-primary">Custom Service</span>
                                                </div>
                                                <div className="flex justify-between items-center p-3 rounded-xl bg-muted/30 border border-border/50">
                                                    <span className="text-xs font-bold">Created</span>
                                                    <span className="text-xs font-semibold text-primary">{formatDate(req.createdAt)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="px-8 py-5 border-t border-border/30 flex justify-between items-center bg-primary/[0.02]">
                                    <div className="flex items-center gap-4">
                                        <div className="flex -space-x-3">
                                            <div className="w-8 h-8 rounded-full border-2 border-background bg-muted flex items-center justify-center font-semibold text-sm">
                                                {req.client?.[0] || "C"}
                                            </div>
                                            <div className="w-8 h-8 rounded-full border-2 border-background bg-primary/20 flex items-center justify-center font-semibold text-sm text-primary">
                                                A
                                            </div>
                                        </div>
                                        <p className="text-sm font-bold text-muted-foreground ">Project ID: {(req.id || '—').substring(0, 8)}</p>
                                    </div>
                                    <Button 
                                        className="rounded-xl font-bold h-10 gap-2 bg-background border-border shadow-sm group hover:bg-primary hover:text-white transition-all"
                                        onClick={() => window.location.href = `/dashboard/services/${req.id}`}
                                    >
                                        View Details <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </CardFooter>
                            </Card>
                        )) : (
                            <div className="text-center py-20">
                                <Briefcase className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-20" />
                                <h3 className="text-xl font-bold mb-2">No Service Projects</h3>
                                <p className="text-muted-foreground mb-6">Start a new project to get started</p>
                                <Button onClick={() => setIsNewProjectOpen(true)}>
                                    <Plus className="w-4 h-4 mr-2" /> Start New Project
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Tracking & Quick Stats Sidebar */}
                <div className="space-y-6">
                    <Card className="border-border/50 bg-primary/[0.03] overflow-hidden relative group">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 blur-[60px] rounded-full" />
                        <CardHeader>
                            <CardTitle className="text-xl font-semibold  flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 text-primary" /> Active Overview
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 relative z-10">
                            <div className="p-5 rounded-3xl bg-background border border-border/50 shadow-sm flex flex-col items-center text-center space-y-2">
                                <div className="w-16 h-16 rounded-[24px] bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                                    <Briefcase className="w-8 h-8" />
                                </div>
                                <h4 className="text-2xl font-semibold tabular-nums">{filteredRequests.length}</h4>
                                <p className="text-sm font-semibold uppercase text-muted-foreground">Active Projects</p>
                            </div>

                            <div className="space-y-4">
                                <h5 className="text-sm font-semibold uppercase text-muted-foreground">Quick Stats</h5>
                                <div className="space-y-3">
                                    {[
                                        { label: "In Progress", val: filteredRequests.filter(p => p.status === "In Progress").length },
                                        { label: "Planning", val: filteredRequests.filter(p => p.status === "Planning").length },
                                        { label: "Completed", val: filteredRequests.filter(p => p.status === "Completed").length },
                                    ].map((stat, i) => (
                                        <div key={i} className="flex justify-between items-center bg-background/50 p-3 rounded-xl border border-border/50 backdrop-blur-sm">
                                            <span className="text-sm font-bold">{stat.label}</span>
                                            <span className="text-sm font-semibold text-primary ">{stat.val}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <Button 
                                className="w-full rounded-2xl h-12 gap-2 font-bold shadow-lg shadow-primary/10"
                                onClick={() => window.location.href = "/dashboard/projects"}
                            >
                                View All Projects <ArrowRight className="w-4 h-4" />
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden flex flex-col items-center p-8 text-center space-y-4 border-dashed">
                        <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center text-muted-foreground ring-4 ring-muted/20  font-semibold">?</div>
                        <div className="space-y-1">
                            <h4 className="text-sm font-semibold ">Need Custom Service?</h4>
                            <p className="text-sm text-muted-foreground font-medium leading-relaxed px-4">
                                Start a new service project or request a custom quote for your specific needs.
                            </p>
                        </div>
                        <Button 
                            variant="link" 
                            className="text-primary font-semibold text-xs uppercase h-auto p-0"
                            onClick={() => window.location.href = "/dashboard/quotes"}
                        >
                            Request Quote
                        </Button>
                    </Card>
                </div>
            </div>

            {/* New Project Dialog */}
            <AnimatePresence>
                {isNewProjectOpen && (
                    <NewProjectDialog isOpen={isNewProjectOpen}
                        onClose={() => setIsNewProjectOpen(false)}
                    />
                )}
            </AnimatePresence>

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

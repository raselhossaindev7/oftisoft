"use client"
import { Animated, AnimatedDiv, AnimatePresence } from "@/lib/animated";

import { useState, useEffect } from "react";
import {
    Search, Filter, Plus, LayoutGrid, List, MoreVertical,
    Calendar, Users, AlertCircle, CheckCircle2, Clock,
    CreditCard, Wallet, X, ChevronRight, Lock,
    FolderOpen, TrendingUp, PauseCircle, Ban
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useProjects } from "@/hooks/useProjects";
import { Project } from "@/lib/api";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

import { PaymentModal } from "@/components/projects/payment-modal";
import { STATUS_COLORS, PAYMENT_STATUS_COLORS } from "@/lib/projects";
import { RoleGuard } from "@/components/auth/role-guard";
import { useRole } from "@/hooks/useRole";

export default function ProjectsOverview() {
    const { isAdmin } = useRole();
    const [view, setView] = useState<"grid" | "table">("grid");
    const [filter, setFilter] = useState("All");
    const [search, setSearch] = useState("");
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);

    const { projects, isLoading, isError, stats, fetchStats, updatePaymentStatus } = useProjects(undefined, filter === "All" ? undefined : filter);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    const handlePaymentComplete = (projectId: string) => {
        updatePaymentStatus(projectId, "Paid");
    };

    const filteredProjects = projects?.filter(p =>
        ((p.title || '').toLowerCase().includes(search.toLowerCase()) || (p.client || '').toLowerCase().includes(search.toLowerCase()))
    ) || [];

    const urgentProjects = projects?.filter(p => p.progress < 50 && p.status === 'In Progress') || [];

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const statCards = [
        { label: "Total Projects", value: stats?.total || 0, icon: FolderOpen, color: "bg-primary/10 text-primary" },
        { label: "In Progress", value: stats?.inProgress || 0, icon: TrendingUp, color: "bg-blue-500/10 text-blue-500" },
        { label: "Completed", value: stats?.completed || 0, icon: CheckCircle2, color: "bg-green-500/10 text-green-500" },
        { label: "Delayed", value: stats?.delayed || 0, icon: Clock, color: "bg-orange-500/10 text-orange-500" },
    ];

    return (
        <RoleGuard allowedRoles={["Editor", "Admin", "SuperAdmin"]}>
        <div className="space-y-8 relative">

            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">Projects</h1>
                    <p className="text-muted-foreground">Manage and track all your ongoing projects.</p>
                </div>

                <Link href="/dashboard/projects/new"
                    className="relative group px-6 py-3 bg-primary text-white rounded-xl font-bold transition-all hover:scale-105 shadow-lg shadow-primary/25 overflow-hidden"
                >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    <div className="relative flex items-center gap-2">
                        <Plus className="w-4 h-4" /> New Project
                    </div>
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat) => (
                    <div key={stat.label} className="bg-card border border-border rounded-2xl p-5 hover:shadow-md transition-all">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-muted-foreground">{stat.label}</span>
                            <div className={cn("p-2 rounded-xl", stat.color)}>
                                <stat.icon className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl font-bold">
                            {isLoading ? <Skeleton className="h-8 w-16" /> : stat.value}
                        </div>
                    </div>
                ))}
            </div>

            {/* Spotlight Carousel */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground uppercase">
                    <AlertCircle className="w-4 h-4 text-orange-500" /> Urgent Attention
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
                    {isLoading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="min-w-[300px] snap-center bg-card border border-border rounded-3xl p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <Skeleton className="h-10 w-10 rounded-xl" />
                                    <Skeleton className="h-6 w-20 rounded-full" />
                                </div>
                                <Skeleton className="h-5 w-32 mb-2" />
                                <Skeleton className="h-4 w-24 mb-4" />
                                <Skeleton className="h-1.5 w-full rounded-full" />
                            </div>
                        ))
                    ) : urgentProjects.map((p, i) => (
                         <AnimatedDiv key={p.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="min-w-[300px] snap-center bg-gradient-to-br from-card to-muted/20 border border-border rounded-3xl p-6 shadow-sm hover:shadow-lg hover:border-primary/30 transition-all cursor-pointer group"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-orange-500/10 rounded-xl text-orange-500">
                                    <Clock className="w-5 h-5" />
                                </div>
                                <span className="text-sm font-bold bg-background border border-border px-2 py-1 rounded-full">{formatDate(p.dueDate)}</span>
                            </div>
                            <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">
                                <Link href={`/dashboard/projects/${p.id}`}>{p.title}</Link>
                            </h3>
                            <p className="text-sm text-muted-foreground mb-4">{p.client}</p>
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-bold">
                                    <span>Progress</span>
                                    <span className="text-orange-500">{p.progress}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                    <AnimatedDiv
                                        initial={{ width: 0 }}
                                        animate={{ width: `${p.progress}%` }}
                                        className="h-full bg-orange-500 rounded-full"
                                    />
                                </div>
                            </div>
                         </AnimatedDiv>
                    ))}
                    {/* Add Placeholder if no urgent projects */}
                    {!isLoading && urgentProjects.length === 0 && (
                        <div className="w-full p-8 text-center border border-dashed border-border rounded-3xl text-muted-foreground">
                            No urgent projects right now. Good job!
                        </div>
                    )}
                </div>
            </div>

            {/* Filters Toolbar */}
            <div className="bg-card border border-border rounded-xl p-4 flex flex-col md:flex-row gap-4 justify-between items-center shadow-sm">

                {/* Search */}
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input type="text"
                        placeholder="Search projects..."
                        className="w-full pl-9 pr-4 py-2 bg-muted/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                    {["All", "In Progress", "Review", "Completed", "Delayed", "On Hold", "Cancelled"].map(status => (
                        <button key={status}
                            onClick={() => setFilter(status)}
                            className={cn(
                                "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
                                filter === status
                                    ? "bg-foreground text-background"
                                    : "text-muted-foreground hover:bg-muted"
                            )}
                        >
                            {status}
                        </button>
                    ))}
                </div>

                {/* View Toggle */}
                <div className="flex items-center bg-muted/50 rounded-lg p-1 border border-border">
                    <button onClick={() => setView("grid")}
                        className={cn(
                            "p-2 rounded-md transition-all",
                            view === "grid" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <LayoutGrid className="w-4 h-4" />
                    </button>
                    <button onClick={() => setView("table")}
                        className={cn(
                            "p-2 rounded-md transition-all",
                            view === "table" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <List className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Error State */}
            {isError && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-6 text-center">
                    <AlertCircle className="w-10 h-10 text-destructive mx-auto mb-3" />
                    <h3 className="text-lg font-bold mb-2">Failed to load projects</h3>
                    <p className="text-sm text-muted-foreground mb-4">Something went wrong while fetching your projects.</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-destructive text-white rounded-lg text-sm font-medium hover:bg-destructive/90 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            )}

            {/* Loading State */}
            {isLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="bg-card border border-border rounded-3xl p-6">
                            <div className="flex justify-between items-start mb-4">
                                <Skeleton className="h-6 w-20 rounded-full" />
                                <Skeleton className="h-6 w-6 rounded" />
                            </div>
                            <Skeleton className="h-5 w-32 mb-2" />
                            <Skeleton className="h-4 w-24 mb-6" />
                            <div className="space-y-4">
                                <Skeleton className="h-1.5 w-full rounded-full" />
                                <div className="flex justify-between">
                                    <Skeleton className="h-4 w-16" />
                                    <Skeleton className="h-4 w-16" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Content Area */}
            {!isLoading && !isError && (
                <AnimatePresence mode="wait">

                    {/* Grid View */}
                    {view === "grid" && (
                        <AnimatedDiv key="grid"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                            {filteredProjects.map((project, i) => (
                                <AnimatedDiv key={project.id}
                                    layout initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.2 }}
                                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                                    className="bg-card border border-border rounded-3xl p-6 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all group relative overflow-hidden flex flex-col"
                                >
                                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                    <div className="flex justify-between items-start mb-4">
                                        <div className={cn("px-2.5 py-1 rounded-full text-xs font-bold border", STATUS_COLORS[project.status as keyof typeof STATUS_COLORS])}>
                                            {project.status}
                                        </div>
                                        <Link href={`/dashboard/projects/${project.id}`} className="text-muted-foreground hover:text-foreground">
                                            <MoreVertical className="w-4 h-4" />
                                        </Link>
                                    </div>

                                    <h3 className="text-lg font-bold mb-1 group-hover:text-primary transition-colors cursor-pointer">
                                        <Link href={`/dashboard/projects/${project.id}`}>{project.title}</Link>
                                    </h3>
                                    <p className="text-sm text-muted-foreground mb-6 flex-1">{project.client}</p>

                                    <div className="space-y-4 mt-auto">
                                        {/* Payment Status Action */}
                                        {project.paymentStatus === "Unpaid" && (
                                            <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-3 flex justify-between items-center">
                                                <span className="text-xs font-bold text-red-500 flex items-center gap-1">
                                                    <AlertCircle size={12} /> Unpaid Invoice
                                                </span>
                                                {isAdmin && (
                                                    <button
                                                        onClick={() => setSelectedProject(project)}
                                                        className="text-xs font-bold bg-white text-black px-3 py-1.5 rounded-lg hover:alpha-90 transition-opacity"
                                                    >
                                                        Pay Now
                                                    </button>
                                                )}
                                            </div>
                                        )}

                                        <div>
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className="text-muted-foreground">Progress</span>
                                                <span className="font-bold">{project.progress}%</span>
                                            </div>
                                            <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                                                <AnimatedDiv initial={{ width: 0 }}
                                                    animate={{ width: `${project.progress}%` }}
                                                    transition={{ duration: 1, delay: 0.5 }}
                                                    className={cn("h-full rounded-full", project.progress === 100 ? "bg-green-500" : "bg-primary")}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                <span>{formatDate(project.dueDate)}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Users className="w-3 h-3" />
                                                <span>{project.members} Team</span>
                                            </div>
                                        </div>
                                    </div>
                                </AnimatedDiv>
                            ))}
                        </AnimatedDiv>
                    )}

                    {/* Table View */}
                    {view === "table" && (
                        <AnimatedDiv key="table"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm"
                        >
                            <table className="w-full text-left text-sm">
                                <thead className="bg-muted/50 border-b border-border text-muted-foreground">
                                    <tr>
                                        <th className="p-4 font-medium">Project Name</th>
                                        <th className="p-4 font-medium">Status</th>
                                        <th className="p-4 font-medium">Payment</th>
                                        <th className="p-4 font-medium">Progress</th>
                                        <th className="p-4 font-medium hidden md:table-cell">Due Date</th>
                                        <th className="p-4 font-medium hidden md:table-cell">Budget</th>
                                        <th className="p-4 font-medium"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredProjects.map((project, i) => (
                                        <Animated as="tr"
                                            key={project.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            style={{ willChange: "transform, opacity" }}
                                            transition={{ delay: i * 0.1 }}
                                            className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                                        >
                                            <td className="p-4">
                                                <div>
                                                    <div className="font-bold hover:text-primary cursor-pointer">
                                                        <Link href={`/dashboard/projects/${project.id}`}>{project.title}</Link>
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">{project.client}</div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className={cn("px-2.5 py-1 rounded-full text-xs font-bold border", STATUS_COLORS[project.status as keyof typeof STATUS_COLORS])}>
                                                    {project.status}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                 <div className="flex items-center gap-2">
                                                    <span className={cn("px-2 py-0.5 rounded text-sm font-bold uppercase border", PAYMENT_STATUS_COLORS[project.paymentStatus as keyof typeof PAYMENT_STATUS_COLORS])}>
                                                        {project.paymentStatus}
                                                    </span>
                                                    {project.paymentStatus === "Unpaid" && isAdmin && (
                                                        <button
                                                            onClick={() => setSelectedProject(project)}
                                                            className="text-xs text-primary font-bold hover:underline"
                                                        >
                                                            Pay
                                                        </button>
                                                    )}
                                                 </div>
                                            </td>
                                            <td className="p-4 w-48">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                                                        <div style={{ width: `${project.progress}%` }} className={cn("h-full rounded-full", project.progress === 100 ? "bg-green-500" : "bg-primary")} />
                                                    </div>
                                                    <span className="text-xs font-medium w-8">{project.progress}%</span>
                                                </div>
                                            </td>
                                            <td className="p-4 hidden md:table-cell text-muted-foreground">
                                                {formatDate(project.dueDate)}
                                            </td>
                                            <td className="p-4 hidden md:table-cell font-medium">
                                                ${project.budget?.toLocaleString()}
                                            </td>
                                            <td className="p-4 text-right">
                                                <Link href={`/dashboard/projects/${project.id}`} className="p-2 hover:bg-muted rounded-full text-muted-foreground hover:text-foreground inline-block">
                                                    <MoreVertical className="w-4 h-4" />
                                                </Link>
                                            </td>
                                        </Animated>
                                    ))}
                                </tbody>
                            </table>
                        </AnimatedDiv>
                    )}
                </AnimatePresence>
            )}

            {/* Payment Modal Render */}
            <AnimatePresence>
                {selectedProject && (
                    <PaymentModal
                        project={selectedProject}
                        onClose={() => setSelectedProject(null)}
                        onPaymentComplete={handlePaymentComplete}
                    />
                )}
            </AnimatePresence>

            {!isLoading && !isError && filteredProjects.length === 0 && (
                <div className="text-center py-20 bg-card border border-border rounded-2xl border-dashed">
                    <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-bold mb-2">No Projects Found</h3>
                    <p className="text-muted-foreground">Try adjusting your filters or create a new project.</p>
                </div>
            )}

        </div>
        </RoleGuard>
    );
}

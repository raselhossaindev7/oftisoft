"use client";

import { useState } from "react";
import {
    Search,
    Filter,
    MoreHorizontal,
    Eye,
    Download,
    Calendar,
    ArrowUpRight,
    ShoppingBag,
    CheckCircle2,
    Clock,
    XCircle,
    ShoppingCart
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import Link from "next/link";
import { toast } from "sonner";
import { useOrders } from "@/hooks/useOrders";
import { useRole } from "@/hooks/useRole";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminAPI } from "@/lib/api";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/orders/status-badge";

const OrdersPage = () => {
    const { hasRole } = useRole();
    const canManage = hasRole(["SuperAdmin", "Admin", "Editor"]);
    const canExport = hasRole(["SuperAdmin", "Admin"]);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [cancelTarget, setCancelTarget] = useState<{ id: string } | null>(null);
    const [refundTarget, setRefundTarget] = useState<{ id: string } | null>(null);
    const queryClient = useQueryClient();
    const { orders = [], isLoading, exportReport, isExportingReport, downloadInvoice, isDownloadingInvoice, updateStatus, isUpdatingStatus } = useOrders();

    const refundMutation = useMutation({
        mutationFn: adminAPI.refundOrder,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            toast.success("Order refunded and assets revoked");
            setRefundTarget(null);
        },
        onError: (err: any) => toast.error(err?.response?.data?.message || "Refund failed"),
    });

    const filteredOrders = orders.filter(o => {
        if (!o) return false;
        const matchesStatus = statusFilter === "all" || (o.status && o.status.toLowerCase() === statusFilter.toLowerCase());
        const matchesSearch =
            !searchQuery ||
            (o.id && o.id.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (o.status && o.status.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesStatus && matchesSearch;
    });

    const orderList = orders ?? [];
    const totalOrders = orderList.length;
    const pendingOrders = orderList.filter(o => o.status === "pending" || o.status === "processing").length;
    const completedOrders = orderList.filter(o => o.status === "completed").length;
    const totalRevenue = orderList
        .filter(o => o.status !== "cancelled" && o.status !== "refunded")
        .reduce((acc, curr) => acc + Number(curr.total), 0);
    const successRate = totalOrders > 0 ? ((completedOrders / totalOrders) * 100).toFixed(1) : "0";
    const avgOrderValue = totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : "0.00";

    const handleConfirmCancel = () => {
        if (cancelTarget) {
            updateStatus(cancelTarget.id, "cancelled");
            setCancelTarget(null);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Orders</h1>
                    <p className="text-muted-foreground">Monitor customer transactions, track fulfillment, and manage refunds.</p>
                </div>
                {canExport && (
                <div className="flex gap-2">
                    <Button 
                        variant="outline" 
                        className="gap-2 rounded-xl"
                        onClick={() => exportReport()}
                        disabled={isExportingReport}
                    >
                        <Download className="w-4 h-4" />
                        {isExportingReport ? "Exporting..." : "Export Report"}
                    </Button>
                </div>
                )}
            </div>

            {/* Order Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                        <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalOrders}</div>
                        <p className="text-xs text-muted-foreground">All time orders</p>
                    </CardContent>
                </Card>
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Pending Processing</CardTitle>
                        <Clock className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pendingOrders}</div>
                        <p className="text-xs text-orange-500 font-medium">Requires attention</p>
                    </CardContent>
                </Card>
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Order Value</CardTitle>
                        <ArrowUpRight className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${avgOrderValue}</div>
                         <p className="text-xs text-muted-foreground">Per order revenue</p>
                    </CardContent>
                </Card>
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Successful Deliveries</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{successRate}%</div>
                        <p className="text-xs text-muted-foreground">Completion rate</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-border/50">
                <CardHeader className="bg-muted/10 border-b border-border/50">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search order ID..." 
                                className="pl-10 h-10 rounded-xl"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                             <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="gap-2 rounded-lg">
                                        <Filter className="h-4 w-4" />
                                        Status: {statusFilter === 'all' ? 'All' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => setStatusFilter("all")}>All</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setStatusFilter("pending")}>Pending</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setStatusFilter("processing")}>Processing</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setStatusFilter("completed")}>Completed</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setStatusFilter("cancelled")}>Cancelled</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setStatusFilter("refunded")}>Refunded</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/5 hover:bg-transparent">
                                <TableHead className="w-[120px]">Order ID</TableHead>
                                <TableHead className="min-w-[200px]">Items</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                        <TableCell><Skeleton className="h-8 w-8 rounded-full ml-auto" /></TableCell>
                                    </TableRow>
                                ))
                            ) : filteredOrders.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-40 text-center">
                                        <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground">
                                            <ShoppingCart className="w-12 h-12 opacity-50" />
                                            <p className="font-medium">
                                                {orders.length === 0 ? "No orders yet." : "No orders match your filters."}
                                            </p>
                                            {orders.length > 0 && (
                                                <Button variant="outline" size="sm" onClick={() => { setSearchQuery(""); setStatusFilter("all"); }}>
                                                    Clear filters
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredOrders.map((o) => (
                                    <TableRow key={o.id} className="group hover:bg-primary/5 transition-colors">
                                        <TableCell className="font-mono text-xs font-bold">
                                            <Link href={`/dashboard/orders/${o.id}`} className="hover:text-primary underline decoration-primary/30 underline-offset-4">
                                                {(o.id || '—').substring(0, 8)}...
                                            </Link>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                {o.items?.slice(0, 2).map((item, idx) => (
                                                     <span key={idx} className="text-sm font-medium truncate max-w-[200px]">{item.productName} (x{item.quantity})</span>
                                                ))}
                                                {o.items?.length > 2 && <span className="text-xs text-muted-foreground">+{o.items.length - 2} more</span>}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <Calendar className="w-3 h-3" />
                                                {o.createdAt ? format(new Date(o.createdAt), 'MMM d, yyyy') : 'N/A'}
                                            </div>
                                        </TableCell>
                                        <TableCell><StatusBadge status={o.status} /></TableCell>
                                        <TableCell className="font-semibold text-primary">${(Number(o.total) || 0).toFixed(2)}</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48 rounded-xl">
                                                    <DropdownMenuLabel>Manage Order</DropdownMenuLabel>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/dashboard/orders/${o.id}`} className="flex items-center gap-2 cursor-pointer text-primary">
                                                            <Eye className="w-4 h-4" /> View Details
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="flex items-center gap-2 cursor-pointer"
                                                        onClick={() => downloadInvoice(o.id)}
                                                        disabled={isDownloadingInvoice}
                                                    >
                                                        <Download className="w-4 h-4" /> {isDownloadingInvoice ? "Downloading..." : "Download Invoice"}
                                                    </DropdownMenuItem>
                                                    {o.status !== "cancelled" && o.status !== "refunded" && canManage && (
                                                        <>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem className="flex items-center gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
                                                                onClick={() => setCancelTarget({ id: o.id })}
                                                            >
                                                                <XCircle className="w-4 h-4" /> Cancel order
                                                            </DropdownMenuItem>
                                                        </>
                                                    )}
                                                    {o.status === "completed" && hasRole(["SuperAdmin", "Admin"]) && (
                                                        <DropdownMenuItem className="flex items-center gap-2 text-orange-500 focus:bg-orange-500/10 focus:text-orange-500 cursor-pointer"
                                                            onClick={() => setRefundTarget({ id: o.id })}
                                                        >
                                                            <XCircle className="w-4 h-4" /> Refund & Revoke
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <AlertDialog open={!!cancelTarget} onOpenChange={(open) => !open && setCancelTarget(null)}>
                <AlertDialogContent className="rounded-2xl border-border/50 max-w-md">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <XCircle className="w-5 h-5 text-destructive" /> Cancel order?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            This will mark the order as cancelled. The customer can place a new order if needed.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2 sm:gap-0">
                        <AlertDialogCancel className="rounded-xl font-bold">Keep order</AlertDialogCancel>
                        <AlertDialogAction variant="destructive"
                            className="rounded-xl font-bold bg-destructive text-destructive-foreground"
                            onClick={handleConfirmCancel}
                            disabled={isUpdatingStatus}
                        >
                            {isUpdatingStatus ? "Cancelling..." : "Cancel order"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={!!refundTarget} onOpenChange={(open) => !open && setRefundTarget(null)}>
                <AlertDialogContent className="rounded-2xl border-border/50 max-w-md">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-orange-500">
                            <XCircle className="w-5 h-5" /> Refund & Revoke Access?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            This will process a Stripe refund, revoke all licenses for this order, 
                            and remove the customer&apos;s access to the purchased products. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2 sm:gap-0">
                        <AlertDialogCancel className="rounded-xl font-bold">Keep order</AlertDialogCancel>
                        <AlertDialogAction className="rounded-xl font-bold bg-orange-500 text-white hover:bg-orange-600"
                            onClick={() => refundTarget && refundMutation.mutate(refundTarget.id)}
                            disabled={refundMutation.isPending}
                        >
                            {refundMutation.isPending ? "Processing..." : "Refund & Revoke"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

export default OrdersPage;

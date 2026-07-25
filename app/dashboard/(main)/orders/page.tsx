"use client";

import { useState, useMemo } from "react";
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
    ShoppingCart,
    Trash2,
    AlertCircle,
    DollarSign,
    ChevronLeft,
    ChevronRight,
    User,
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

const ORDERS_PER_PAGE = 10;

const OrdersPage = () => {
    const { hasRole } = useRole();
    const canManage = hasRole(["SuperAdmin", "Admin", "Editor"]);
    const canExport = hasRole(["SuperAdmin", "Admin"]);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [cancelTarget, setCancelTarget] = useState<{ id: string } | null>(null);
    const [refundTarget, setRefundTarget] = useState<{ id: string } | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<{ id: string } | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const queryClient = useQueryClient();
    const { orders = [], isLoading, isError, refetch, exportReport, isExportingReport, downloadInvoice, isDownloadingInvoice, updateStatus, isUpdatingStatus, deleteOrder, isDeletingOrder } = useOrders();

    const refundMutation = useMutation({
        mutationFn: adminAPI.refundOrder,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            toast.success("Order refunded and assets revoked");
            setRefundTarget(null);
        },
        onError: (err: any) => toast.error(err?.response?.data?.message || "Refund failed"),
    });

    const filteredOrders = useMemo(() => {
        return orders.filter(o => {
            if (!o) return false;
            const matchesStatus = statusFilter === "all" || (o.status && o.status.toLowerCase() === statusFilter.toLowerCase());
            const searchTerm = searchQuery.toLowerCase();
            const matchesSearch =
                !searchQuery ||
                (o.id && o.id.toLowerCase().includes(searchTerm)) ||
                (o.status && o.status.toLowerCase().includes(searchTerm)) ||
                (o.user?.name && o.user.name.toLowerCase().includes(searchTerm)) ||
                (o.user?.email && o.user.email.toLowerCase().includes(searchTerm)) ||
                (o.paymentMethod && o.paymentMethod.toLowerCase().includes(searchTerm));
            return matchesStatus && matchesSearch;
        });
    }, [orders, statusFilter, searchQuery]);

    // Pagination
    const totalPages = Math.ceil(filteredOrders.length / ORDERS_PER_PAGE);
    const paginatedOrders = useMemo(() => {
        const start = (currentPage - 1) * ORDERS_PER_PAGE;
        return filteredOrders.slice(start, start + ORDERS_PER_PAGE);
    }, [filteredOrders, currentPage]);

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

    const statCards = [
        { label: "Total Orders", value: totalOrders, icon: ShoppingBag, color: "text-primary", sub: "All time orders" },
        { label: "Pending Processing", value: pendingOrders, icon: Clock, color: "text-orange-500", sub: "Requires attention", subColor: "text-orange-500" },
        { label: "Total Revenue", value: `$${totalRevenue.toFixed(2)}`, icon: DollarSign, color: "text-green-500", sub: "Net revenue" },
        { label: "Successful Deliveries", value: `${successRate}%`, icon: CheckCircle2, color: "text-green-500", sub: "Completion rate" },
    ];

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
                {statCards.map((stat) => (
                    <Card key={stat.label} className="border-border/50 bg-card/50 backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                            <stat.icon className={`h-4 w-4 ${stat.color}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {isLoading ? <Skeleton className="h-8 w-20" /> : stat.value}
                            </div>
                            <p className={`text-xs ${stat.subColor || 'text-muted-foreground'}`}>{stat.sub}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Error State */}
            {isError && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-6 text-center">
                    <AlertCircle className="w-10 h-10 text-destructive mx-auto mb-3" />
                    <h3 className="text-lg font-bold mb-2">Failed to load orders</h3>
                    <p className="text-sm text-muted-foreground mb-4">Something went wrong while fetching your orders.</p>
                    <Button variant="outline" onClick={() => refetch()}>
                        Try Again
                    </Button>
                </div>
            )}

            <Card className="border-border/50">
                <CardHeader className="bg-muted/10 border-b border-border/50">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by ID, customer, or payment method..."
                                className="pl-10 h-10 rounded-xl"
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
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
                                    <DropdownMenuItem onClick={() => { setStatusFilter("all"); setCurrentPage(1); }}>All</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => { setStatusFilter("pending"); setCurrentPage(1); }}>Pending</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => { setStatusFilter("processing"); setCurrentPage(1); }}>Processing</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => { setStatusFilter("completed"); setCurrentPage(1); }}>Completed</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => { setStatusFilter("cancelled"); setCurrentPage(1); }}>Cancelled</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => { setStatusFilter("refunded"); setCurrentPage(1); }}>Refunded</DropdownMenuItem>
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
                                <TableHead className="min-w-[180px]">Customer</TableHead>
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
                                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                        <TableCell><Skeleton className="h-8 w-8 rounded-full ml-auto" /></TableCell>
                                    </TableRow>
                                ))
                            ) : filteredOrders.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-40 text-center">
                                        <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground">
                                            <ShoppingCart className="w-12 h-12 opacity-50" />
                                            <p className="font-medium">
                                                {orders.length === 0 ? "No orders yet." : "No orders match your filters."}
                                            </p>
                                            {orders.length > 0 && (
                                                <Button variant="outline" size="sm" onClick={() => { setSearchQuery(""); setStatusFilter("all"); setCurrentPage(1); }}>
                                                    Clear filters
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedOrders.map((o) => (
                                    <TableRow key={o.id} className="group hover:bg-primary/5 transition-colors">
                                        <TableCell className="font-mono text-xs font-bold">
                                            <Link href={`/dashboard/orders/${o.id}`} className="hover:text-primary underline decoration-primary/30 underline-offset-4">
                                                {(o.id || '—').substring(0, 8)}...
                                            </Link>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                                                    {o.user?.name?.[0] || <User className="w-3 h-3" />}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium">{o.user?.name || 'Guest'}</span>
                                                    <span className="text-xs text-muted-foreground">{o.user?.email || ''}</span>
                                                </div>
                                            </div>
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
                                                    {hasRole(["SuperAdmin", "Admin"]) && (
                                                        <>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem className="flex items-center gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
                                                                onClick={() => setDeleteTarget({ id: o.id })}
                                                            >
                                                                <Trash2 className="w-4 h-4" /> Delete order
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

                {/* Pagination */}
                {filteredOrders.length > ORDERS_PER_PAGE && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-border/50">
                        <p className="text-sm text-muted-foreground">
                            Showing {((currentPage - 1) * ORDERS_PER_PAGE) + 1} to {Math.min(currentPage * ORDERS_PER_PAGE, filteredOrders.length)} of {filteredOrders.length} orders
                        </p>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <span className="text-sm font-medium px-2">
                                {currentPage} / {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                            >
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                )}
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

            <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <AlertDialogContent className="rounded-2xl border-border/50 max-w-md">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                            <Trash2 className="w-5 h-5" /> Delete order?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete this order and all its data. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-3">
                        <AlertDialogCancel className="rounded-xl font-bold">Keep order</AlertDialogCancel>
                        <AlertDialogAction className="rounded-xl font-bold bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => {
                                if (deleteTarget) {
                                    deleteOrder(deleteTarget.id);
                                    setDeleteTarget(null);
                                }
                            }}
                            disabled={isDeletingOrder}
                        >
                            {isDeletingOrder ? "Deleting..." : "Delete order"}
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

"use client"
import { AnimatedDiv, AnimatePresence } from "@/lib/animated";

import { useState, useMemo } from "react";
import {
    Search,
    Filter,
    MoreHorizontal,
    Eye,
    Download,
    Repeat,
    Calendar,
    ShoppingBag,
    CheckCircle2,
    Clock,
    XCircle,
    RotateCcw,
    Hash,
    ExternalLink,
    FileText,
    ChevronRight,
    ChevronLeft,
    X,
    Loader2,
    AlertCircle,
    DollarSign,
    Package,
    Truck,
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
    DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useOrders } from "@/hooks/useOrders";
import { useCart } from "@/hooks/use-cart";
import { ReportIssueDialog } from "@/components/report-issue-dialog";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

const ORDERS_PER_PAGE = 10;

// Order Details Dialog
const OrderDetailsDialog = ({ isOpen, onClose, order }: any) => {
    if (!isOpen || !order) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <AnimatedDiv initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-card w-full max-w-2xl rounded-xl border border-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
                <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30 shrink-0">
                    <div>
                        <h3 className="text-lg font-semibold">Order Details</h3>
                        <p className="text-sm text-muted-foreground font-mono">#{order.id}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
                        <X size={18} />
                    </button>
                </div>
                <div className="p-6 space-y-6 overflow-y-auto grow">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs text-muted-foreground uppercase font-medium mb-1">Status</p>
                            <p className="font-medium capitalize">{order.status}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground uppercase font-medium mb-1">Total</p>
                            <p className="font-medium text-lg">${order.total}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground uppercase font-medium mb-1">Payment Method</p>
                            <p className="font-medium capitalize">{order.paymentMethod || "Credit Card"}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground uppercase font-medium mb-1">Order Date</p>
                            <p className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                    </div>

                    {order.trackingNumber && (
                        <div className="bg-muted/30 p-4 rounded-lg border border-border/50">
                            <p className="text-xs text-muted-foreground uppercase font-medium mb-2 flex items-center gap-2">
                                <Hash className="w-3 h-3" /> Tracking Number
                            </p>
                            <div className="flex items-center justify-between">
                                <p className="font-mono text-sm font-medium">{order.trackingNumber}</p>
                                <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => window.open(`https://www.google.com/search?q=${order.trackingNumber}`, '_blank')}>
                                    Track <ExternalLink className="w-3 h-3 ml-1" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {order.shippingAddress && (
                        <div>
                            <p className="text-xs text-muted-foreground uppercase font-medium mb-2">Shipping Address</p>
                            <div className="bg-muted/30 p-4 rounded-lg space-y-1 border border-border/50">
                                <p className="font-medium">{order.shippingAddress.street}</p>
                                <p className="text-sm">{order.shippingAddress.city}, {order.shippingAddress.zip}</p>
                                <p className="text-sm">{order.shippingAddress.country}</p>
                            </div>
                        </div>
                    )}

                    <div>
                        <p className="text-xs text-muted-foreground uppercase font-medium mb-3">Items</p>
                        <div className="space-y-2">
                            {order.items.map((item: any, idx: number) => (
                                <div key={idx} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg border border-border/50">
                                    <div className="flex items-center gap-3">
                                        <div>
                                            <p className="font-medium">{item.productName}</p>
                                            <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                                            {item.downloadUrl && order.status === 'completed' && (
                                                <a
                                                    href={item.downloadUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1"
                                                >
                                                    <Download className="w-3 h-3" /> Download
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                    <p className="font-medium">${item.price}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="p-6 border-t border-border flex gap-3 shrink-0 bg-background">
                    <Button variant="outline" onClick={onClose} className="flex-1 rounded-lg">
                        Close
                    </Button>
                </div>
            </AnimatedDiv>
        </div>
    );
};

export default function MyOrdersPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [reportingOrder, setReportingOrder] = useState<any>(null);
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [currentPage, setCurrentPage] = useState(1);

    const { orders, isLoading, isError, refetch, downloadInvoice, exportReport, isDownloadingInvoice, isExportingReport } = useOrders();
    const { addItem } = useCart();
    const router = useRouter();

    const filteredOrders = useMemo(() => {
        return (orders || []).filter(o => {
            const matchesSearch = (o.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (o.items || []).some(item => (item.productName || '').toLowerCase().includes(searchQuery.toLowerCase()));

            const matchesStatus = statusFilter === "all" || o.status === statusFilter;

            return matchesSearch && matchesStatus;
        }) || [];
    }, [orders, searchQuery, statusFilter]);

    // Pagination
    const totalPages = Math.ceil(filteredOrders.length / ORDERS_PER_PAGE);
    const paginatedOrders = useMemo(() => {
        const start = (currentPage - 1) * ORDERS_PER_PAGE;
        return filteredOrders.slice(start, start + ORDERS_PER_PAGE);
    }, [filteredOrders, currentPage]);

    const activeOrders = orders?.filter(o => o.status === "processing" || o.status === "pending") || [];

    // Stats
    const totalSpent = orders?.filter(o => o.status !== "cancelled" && o.status !== "refunded").reduce((acc, o) => acc + Number(o.total), 0) || 0;
    const completedOrders = orders?.filter(o => o.status === "completed").length || 0;
    const totalProducts = orders?.reduce((acc, o) => acc + (o.items?.length || 0), 0) || 0;

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "completed":
                return <Badge className="bg-green-500/10 text-green-500 border-green-500/20 gap-1.5 hover:bg-green-500/20"><CheckCircle2 className="w-3 h-3" /> Delivered</Badge>;
            case "processing":
                return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 gap-1.5 hover:bg-blue-500/20"><Clock className="w-3 h-3 animate-pulse" /> On the Way</Badge>;
            case "pending":
                return <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20 gap-1.5 hover:bg-orange-500/20"><Clock className="w-3 h-3" /> Preparing</Badge>;
            case "cancelled":
                return <Badge className="bg-destructive/10 text-destructive border-destructive/20 gap-1.5 hover:bg-destructive/20"><XCircle className="w-3 h-3" /> Cancelled</Badge>;
            case "refunded":
                return <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20 gap-1.5 hover:bg-purple-500/20"><RotateCcw className="w-3 h-3" /> Refunded</Badge>;
            default:
                return <Badge variant="outline" className="capitalize">{status}</Badge>;
        }
    };

    const handleReorder = (order: any) => {
        order.items.forEach((item: any) => {
            addItem({
                id: item.productId,
                name: item.productName,
                price: item.price,
                image: item.productImage || "",
                slug: item.productSlug || `product-${item.productId}`,
                type: 'product'
            });
        });
        toast.success(`Items from order #${(order.id || '—').substring(0, 8)} added to cart!`);
    };

    const handleDownloadInvoice = (orderId: string) => {
        downloadInvoice(orderId, {
            onSuccess: () => toast.success("Invoice download started"),
            onError: () => toast.error("Failed to download invoice")
        });
    };

    const handleExportReport = () => {
        exportReport(undefined, {
            onSuccess: () => toast.success("Report export started"),
            onError: () => toast.error("Failed to export report")
        });
    };

    const handleDownloadProduct = (url: string) => {
        window.open(url, '_blank');
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    if (isLoading) {
        return (
            <div className="space-y-8 pb-20">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <Skeleton className="h-9 w-48 mb-2" />
                        <Skeleton className="h-4 w-72" />
                    </div>
                    <Skeleton className="h-9 w-36 rounded-lg" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Card key={i} className="border-border/50">
                            <CardContent className="p-6">
                                <Skeleton className="h-4 w-24 mb-3" />
                                <Skeleton className="h-8 w-20" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
                <Card className="border-border/50">
                    <CardContent className="p-6">
                        <div className="space-y-4">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-6 w-20 rounded-full" />
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-4 w-16" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-semibold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                        My Purchases
                    </h1>
                    <p className="text-muted-foreground mt-0.5 text-sm">Access your digital assets, track active orders, and manage invoices.</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        className="rounded-lg gap-2 h-9 border-border/50 bg-card/50 backdrop-blur-sm hover:bg-muted/50 transition-all"
                        onClick={handleExportReport}
                        disabled={isExportingReport}
                    >
                        {isExportingReport ? <Clock className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                        {isExportingReport ? "Exporting..." : "Export Report"}
                    </Button>
                </div>
            </div>

            {/* Error State */}
            {isError && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-6 text-center">
                    <AlertCircle className="w-10 h-10 text-destructive mx-auto mb-3" />
                    <h3 className="text-lg font-semibold mb-2">Failed to load purchases</h3>
                    <p className="text-sm text-muted-foreground mb-4">Something went wrong while fetching your orders.</p>
                    <Button variant="outline" onClick={() => refetch()}>
                        Try Again
                    </Button>
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground font-medium">Total Spent</p>
                                <p className="text-2xl font-bold text-primary">${totalSpent.toFixed(2)}</p>
                            </div>
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <DollarSign className="w-5 h-5 text-primary" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground font-medium">Completed Orders</p>
                                <p className="text-2xl font-bold">{completedOrders}</p>
                            </div>
                            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground font-medium">Total Products</p>
                                <p className="text-2xl font-bold">{totalProducts}</p>
                            </div>
                            <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                                <Package className="w-5 h-5 text-orange-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tracking Quick Access */}
            {activeOrders.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {activeOrders.slice(0, 2).map(activeOrder => (
                            <AnimatedDiv
                                key={activeOrder.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Card className="border-primary/20 bg-primary/[0.03] shadow-lg shadow-primary/5 relative overflow-hidden group h-full">
                                    <div className="absolute top-0 right-0 p-4">
                                        <Clock className="w-5 h-5 text-primary animate-pulse" />
                                    </div>
                                    <CardHeader className="pb-2">
                                        <CardDescription className="text-xs uppercase font-medium text-muted-foreground">Active Shipment</CardDescription>
                                        <CardTitle className="text-lg font-semibold">Order #{(activeOrder.id || '—').substring(0, 8)}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="font-medium capitalize">Status: {activeOrder.status}</span>
                                            <span className="text-muted-foreground">
                                                {activeOrder.trackingNumber ? "Tracking available" : "Awaiting shipment"}
                                            </span>
                                        </div>
                                        <div className="h-1.5 bg-primary/10 rounded-full overflow-hidden">
                                            <AnimatedDiv
                                                initial={{ width: 0 }}
                                                animate={{ width: activeOrder.status === 'processing' ? "65%" : "20%" }}
                                                className="h-full bg-primary"
                                            />
                                        </div>
                                        {activeOrder.trackingNumber && (
                                            <div className="flex items-center gap-2 text-sm font-mono bg-background/50 p-2 rounded-lg border border-border/50 hover:border-primary/30 transition-colors cursor-pointer" onClick={() => window.open(`https://www.google.com/search?q=${activeOrder.trackingNumber}`, '_blank')}>
                                                <Hash className="w-3 h-3 text-primary" /> {activeOrder.trackingNumber}
                                                <ExternalLink className="w-3 h-3 ml-auto opacity-50 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </AnimatedDiv>
                        ))}
                    </AnimatePresence>

                    <Card className="border-border/50 bg-card/80 backdrop-blur-sm flex flex-col justify-center items-center p-8 text-center space-y-4 h-full">
                        <div className="w-12 h-12 rounded-lg bg-muted/50 flex items-center justify-center shadow-inner">
                            <ShoppingBag className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <div>
                            <p className="text-sm font-medium">Need help with an order?</p>
                            <p className="text-sm text-muted-foreground px-4">Our support agents are available 24/7 to assist you.</p>
                        </div>
                        <Button variant="link" className="text-primary font-medium text-xs p-0 h-auto" onClick={() => router.push('/dashboard/support')}>
                            Contact Support <ChevronRight className="w-3 h-3" />
                        </Button>
                    </Card>
                </div>
            )}

            {/* Order History Table */}
            <Card className="border-border/50 bg-card/50 backdrop-blur-md overflow-hidden rounded-xl">
                <CardHeader className="bg-muted/5 border-b border-border/50 px-6 py-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by order ID or product name..."
                                className="pl-10 h-9 rounded-lg border-border/50 focus:ring-primary/20 bg-background/50"
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="rounded-lg h-9 gap-2 border-border/50 bg-background/50">
                                        <Filter className="w-3 h-3" /> Filter: <span className="capitalize">{statusFilter}</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48 rounded-lg p-1">
                                    <DropdownMenuLabel>Status</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuCheckboxItem checked={statusFilter === "all"} onCheckedChange={() => { setStatusFilter("all"); setCurrentPage(1); }}>All Orders</DropdownMenuCheckboxItem>
                                    <DropdownMenuCheckboxItem checked={statusFilter === "completed"} onCheckedChange={() => { setStatusFilter("completed"); setCurrentPage(1); }}>Completed</DropdownMenuCheckboxItem>
                                    <DropdownMenuCheckboxItem checked={statusFilter === "processing"} onCheckedChange={() => { setStatusFilter("processing"); setCurrentPage(1); }}>Processing</DropdownMenuCheckboxItem>
                                    <DropdownMenuCheckboxItem checked={statusFilter === "pending"} onCheckedChange={() => { setStatusFilter("pending"); setCurrentPage(1); }}>Pending</DropdownMenuCheckboxItem>
                                    <DropdownMenuCheckboxItem checked={statusFilter === "cancelled"} onCheckedChange={() => { setStatusFilter("cancelled"); setCurrentPage(1); }}>Cancelled</DropdownMenuCheckboxItem>
                                    <DropdownMenuCheckboxItem checked={statusFilter === "refunded"} onCheckedChange={() => { setStatusFilter("refunded"); setCurrentPage(1); }}>Refunded</DropdownMenuCheckboxItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/5 hover:bg-transparent border-border/50">
                                <TableHead className="px-6 h-12 text-xs uppercase font-medium text-muted-foreground">Order</TableHead>
                                <TableHead className="h-12 text-xs uppercase font-medium text-muted-foreground">Date</TableHead>
                                <TableHead className="h-12 text-xs uppercase font-medium text-muted-foreground">Status</TableHead>
                                <TableHead className="h-12 text-xs uppercase font-medium text-muted-foreground">Products</TableHead>
                                <TableHead className="h-12 text-xs uppercase font-medium text-muted-foreground">Total</TableHead>
                                <TableHead className="text-right px-6 h-12 text-xs uppercase font-medium text-muted-foreground">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredOrders.length > 0 ? paginatedOrders.map((o) => (
                                <TableRow key={o.id} className="group hover:bg-primary/[0.02] transition-colors border-border/50">
                                    <TableCell className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-mono text-sm font-medium text-primary/80">#{(o.id || '—').substring(0, 8)}</span>
                                            <span className="text-sm text-muted-foreground uppercase">{o.items.length} Item(s)</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-4">
                                        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                                            <Calendar className="w-3.5 h-3.5 text-primary/40" />
                                            {formatDate(o.createdAt)}
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-4">{getStatusBadge(o.status)}</TableCell>
                                    <TableCell className="py-4">
                                        <div className="flex flex-col gap-1.5">
                                            {(o.items || []).slice(0, 2).map((item, idx) => (
                                                <div key={idx} className="flex items-center gap-2">
                                                    <span className="text-sm font-medium line-clamp-1">{item.productName}</span>
                                                    {item.downloadUrl && o.status === "completed" && (
                                                        <Badge
                                                            variant="outline"
                                                            className="text-xs h-4 px-1.5 border-green-500/30 text-green-500 bg-green-500/5 cursor-pointer hover:bg-green-500/10 transition-colors"
                                                            onClick={() => handleDownloadProduct(item.downloadUrl)}
                                                        >
                                                            <Download className="w-2.5 h-2.5 mr-0.5" /> Download
                                                        </Badge>
                                                    )}
                                                </div>
                                            ))}
                                            {o.items.length > 2 && (
                                                <span className="text-sm text-muted-foreground font-medium">+ {o.items.length - 2} more items</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-4 font-semibold text-base text-foreground/80">${Number(o.total).toFixed(2)}</TableCell>
                                    <TableCell className="text-right px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            {o.status === "completed" && (
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    className="h-9 rounded-lg text-xs gap-2 bg-primary/5 text-primary hover:bg-primary/10 border-none transition-colors"
                                                    onClick={() => handleReorder(o)}
                                                >
                                                    <Repeat className="w-3 h-3" /> Reorder
                                                </Button>
                                            )}
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-muted/50">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-56 rounded-xl p-2 border-border/50 backdrop-blur-xl bg-card/95">
                                                    <DropdownMenuLabel className="text-xs uppercase font-medium text-muted-foreground p-3 pt-2">Order Options</DropdownMenuLabel>
                                                    <DropdownMenuItem
                                                        className="rounded-xl flex items-center gap-3 p-3 cursor-pointer group hover:bg-primary/5 focus:bg-primary/5"
                                                        onClick={() => setSelectedOrder(o)}
                                                    >
                                                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                                            <Eye size={14} />
                                                        </div>
                                                        <span className="font-medium text-xs">View Details</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="rounded-xl flex items-center gap-3 p-3 cursor-pointer group hover:bg-primary/5 focus:bg-primary/5"
                                                        onClick={() => handleDownloadInvoice(o.id)}
                                                        disabled={isDownloadingInvoice}
                                                    >
                                                        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center group-hover:bg-foreground group-hover:text-background transition-colors">
                                                            {isDownloadingInvoice ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download size={14} />}
                                                        </div>
                                                        <span className="font-medium text-xs">Tax Invoice (PDF)</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator className="bg-border/50 my-2" />
                                                    <DropdownMenuItem
                                                        className="rounded-xl flex items-center gap-3 p-3 cursor-pointer group hover:bg-destructive/10 focus:bg-destructive/10"
                                                        onClick={() => setReportingOrder(o)}
                                                    >
                                                        <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center text-destructive transition-colors">
                                                            <RotateCcw size={14} />
                                                        </div>
                                                        <span className="font-medium text-xs text-destructive">Report Issue</span>
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-64 text-center">
                                        <div className="flex flex-col items-center justify-center gap-4 opacity-50">
                                            <ShoppingBag className="w-16 h-16 text-muted-foreground" />
                                            <div className="space-y-1">
                                                <p className="font-medium text-lg">No results</p>
                                                <p className="text-sm text-muted-foreground">Try adjusting your filters or search query.</p>
                                            </div>
                                            {(searchQuery || statusFilter !== "all") && (
                                                <Button variant="outline" size="sm" onClick={() => { setSearchQuery(""); setStatusFilter("all"); setCurrentPage(1); }}>
                                                    Clear Filters
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>

                {/* Pagination */}
                {filteredOrders.length > ORDERS_PER_PAGE && (
                    <CardFooter className="bg-muted/5 border-t border-border/50 px-6 py-4 justify-between items-center">
                        <p className="text-sm text-muted-foreground font-medium">
                            Showing {((currentPage - 1) * ORDERS_PER_PAGE) + 1} to {Math.min(currentPage * ORDERS_PER_PAGE, filteredOrders.length)} of {filteredOrders.length} orders
                        </p>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0 rounded-lg"
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
                                className="h-8 w-8 p-0 rounded-lg"
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                            >
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </CardFooter>
                )}
            </Card>

            {/* Order Details Dialog */}
            <AnimatePresence>
                {selectedOrder && (
                    <OrderDetailsDialog isOpen={!!selectedOrder}
                        onClose={() => setSelectedOrder(null)}
                        order={selectedOrder}
                    />
                )}
            </AnimatePresence>

            {/* Report Issue Dialog */}
            {reportingOrder && (
                <ReportIssueDialog isOpen={!!reportingOrder}
                    onClose={() => setReportingOrder(null)}
                    orderId={reportingOrder.id}
                />
            )}
        </div>
    );
}

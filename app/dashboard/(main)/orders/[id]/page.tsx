"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Download,
  Printer,
  Mail,
  Package,
  Truck,
  Receipt,
  MapPin,
  CreditCard,
  RotateCcw,
  CheckCircle2,
  Clock,
  XCircle,
  MessageCircle,
  Store,
  AlertCircle,
  ExternalLink,
  Save,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { toast } from "sonner";
import { useOrders } from "@/hooks/useOrders";
import { useRole } from "@/hooks/useRole";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { messagesAPI } from "@/lib/api";

import { StatusBadge } from "@/components/orders/status-badge";

export default function OrderDetailsPage() {
  const { hasRole } = useRole();
  const canManage = hasRole(["SuperAdmin", "Admin", "Editor"]);
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const {
    order,
    isLoading,
    isError,
    refetch,
    updateStatus,
    updateOrder,
    isUpdatingOrder,
    downloadInvoice,
    isDownloadingInvoice,
    isUpdatingStatus,
  } = useOrders(id);
  const [status, setStatus] = useState<string>("");
  const [internalNotes, setInternalNotes] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");

  useEffect(() => {
    if (order) {
      setStatus(order.status);
      setInternalNotes(order.internalNotes ?? "");
      setTrackingNumber(order.trackingNumber ?? "");
    }
  }, [order]);

  if (isLoading) {
    return (
      <div className="space-y-8 mx-auto pb-20">
        <Skeleton className="h-12 w-1/3" />
        <div className="grid lg:grid-cols-3 gap-8">
          <Skeleton className="h-[400px] w-full lg:col-span-2" />
          <Skeleton className="h-[200px] w-full" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <AlertCircle className="w-12 h-12 text-destructive" />
        <h1 className="text-2xl font-bold">Failed to load order</h1>
        <p className="text-muted-foreground">Something went wrong while fetching the order details.</p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            Try Again
          </Button>
          <Button onClick={() => router.push("/dashboard/orders")}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <h1 className="text-2xl font-bold">Order not found</h1>
        <Button onClick={() => router.push("/dashboard/orders")}>
          Go Back
        </Button>
      </div>
    );
  }

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    updateStatus(id, newStatus);
  };

  const handleRefund = () => {
    updateStatus(id, "refunded");
  };

  const handleSaveNotes = () => {
    if (id)
      updateOrder(id, { internalNotes: internalNotes.trim() || undefined });
  };

  const handleSaveTracking = () => {
    if (id)
      updateOrder(id, { trackingNumber: trackingNumber.trim() || undefined });
  };

  const handleEmailReceipt = () => {
    if (order?.user?.email) {
      window.location.href = `mailto:${order.user.email}?subject=Order%20Receipt%20${(order.id || '').slice(0, 8)}&body=Thank%20you%20for%20your%20order.`;
    } else {
      toast.info("Customer email not available.");
    }
  };

  return (
    <div className="space-y-8  mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon" className="rounded-full">
            <Link href="/dashboard/orders">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-semibold">
                Order {(order.id || '—').substring(0, 8)}...
              </h1>
              <StatusBadge status={status} className="text-base px-3 py-1" />
            </div>
            <p className="text-muted-foreground text-sm">
              Placed on {format(new Date(order.createdAt), "PPP")} •{" "}
              {order.items?.length ?? 0} items
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            className="gap-2 rounded-xl h-11"
            onClick={() => window.print()}
          >
            <Printer className="w-4 h-4" />
            Print
          </Button>
          <Button
            variant="outline"
            className="gap-2 rounded-xl h-11"
            onClick={() => downloadInvoice(id)}
            disabled={isDownloadingInvoice}
          >
            <Download className="w-4 h-4" />
            {isDownloadingInvoice ? "Downloading..." : "Invoice"}
          </Button>
          <Button
            className="gap-2 rounded-xl h-11 shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 px-6"
            onClick={handleEmailReceipt}
          >
            <Mail className="w-4 h-4" />
            Email Receipt
          </Button>
          <Button
            variant="outline"
            className="gap-2 rounded-xl h-11 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/20"
            onClick={async () => {
              try {
                const conv = await messagesAPI.getOrderConversation(id);
                router.push(`/dashboard/messages?chat=${conv.id}`);
                toast.success("Chat opened with seller");
              } catch {
                router.push(`/dashboard/messages`);
              }
            }}
          >
            <Store className="w-4 h-4" />
            Contact Seller
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Order Items */}
          <Card className="border-border/50">
            <CardHeader className="bg-muted/10">
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                Order Items
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/50">
                {(order.items ?? []).map((item) => (
                  <div
                    key={item.id}
                    className="p-6 flex items-center justify-between group hover:bg-muted/5 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {(item.productName || '?').charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold">{item.productName || '—'}</p>
                        <p className="text-xs text-muted-foreground font-mono">
                          ID: {item.productId}
                        </p>
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
                    <div className="text-right">
                      <p className="font-bold">
                        ${Number(item.price).toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground font-medium">
                        Qty: {item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="bg-muted/5 block p-8">
              <div className="space-y-3 w-full max-w-[300px] ml-auto">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Subtotal</span>
                  <span>${Number(order.total).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Tax (0%)</span>
                  <span>$0.00</span>
                </div>
                <Separator className="bg-border/50 my-4" />
                <div className="flex justify-between text-xl font-semibold">
                  <span>Total</span>
                  <span className="text-primary">
                    ${Number(order.total).toFixed(2)}
                  </span>
                </div>
              </div>
            </CardFooter>
          </Card>

          {/* Shipping Tracking */}
          {order.shippingAddress && (
            <Card className="border-border/50 border-dashed bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-primary" />
                  Shipping Information & Tracking
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-muted-foreground">
                        Tracking Status
                      </p>
                      <p className="font-bold">
                        {order.trackingNumber ? "Shipped" : "Pending"}
                      </p>
                    </div>
                    {canManage ? (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground">
                          Tracking Number
                        </p>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Enter tracking number"
                            value={trackingNumber}
                            onChange={(e) => setTrackingNumber(e.target.value)}
                            className="font-mono text-sm"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleSaveTracking}
                            disabled={isUpdatingOrder}
                          >
                            <Save className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-muted-foreground">
                          Tracking Number
                        </p>
                        <span className="font-mono text-primary font-bold">
                          {order.trackingNumber || "—"}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="shrink-0 w-8 flex flex-col items-center">
                        <div
                          className={`w-2 h-2 rounded-full ring-4 ${status !== "pending" ? "bg-primary ring-primary/20" : "bg-muted ring-muted/20"}`}
                        />
                        <div className="w-0.5 h-12 bg-border" />
                      </div>
                      <div>
                        <p className="text-sm font-bold">Order placed</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(order.createdAt), "MMM d, h:mm a")}
                        </p>
                      </div>
                    </div>
                    {(status === "processing" || status === "completed") && (
                      <div className="flex gap-4">
                        <div className="shrink-0 w-8 flex flex-col items-center">
                          <div className="w-2 h-2 rounded-full bg-primary ring-4 ring-primary/20" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-primary">
                            {status === "completed"
                              ? "Completed"
                              : "Processing"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {order.updatedAt
                              ? format(
                                  new Date(order.updatedAt),
                                  "MMM d, h:mm a",
                                )
                              : "—"}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {canManage && (
          <Card className="border-border/50 shadow-xl shadow-primary/5">
            <CardHeader>
              <CardTitle className="text-lg">Order Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold  text-muted-foreground">
                  Status
                </label>
                <Select
                  value={status}
                  onValueChange={handleStatusChange}
                  disabled={
                    status === "cancelled" ||
                    status === "refunded" ||
                    isUpdatingStatus
                  }
                >
                  <SelectTrigger className="rounded-xl h-11 font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {status !== "refunded" && status !== "cancelled" && (
                <div className="pt-4 space-y-2">
                  <Button
                    variant="outline"
                    className="w-full rounded-xl gap-2 font-bold h-11 text-destructive hover:bg-destructive/5 hover:text-destructive"
                    onClick={handleRefund}
                    disabled={isUpdatingStatus}
                  >
                    <RotateCcw
                      className={cn(
                        "w-4 h-4",
                        isUpdatingStatus && "animate-spin",
                      )}
                    />
                    {isUpdatingStatus ? "Processing..." : "Process Full Refund"}
                  </Button>
                  <p className="text-sm text-center text-muted-foreground  font-semibold">
                    Process takes 3-5 business days
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          )}

          {/* Customer Info */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                Customer Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="text-xs font-semibold  text-muted-foreground mb-1">
                  Name
                </p>
                <p className="font-bold">{order.user?.name ?? "—"}</p>
                <p className="text-sm text-primary">
                  {order.user?.email ?? "—"}
                </p>
              </div>

              {order.shippingAddress && (
                <div>
                  <p className="text-xs font-semibold  text-muted-foreground mb-1">
                    Shipping Address
                  </p>
                  <p className="text-sm leading-relaxed font-medium">
                    {order.shippingAddress.street}
                    <br />
                    {order.shippingAddress.city}, {order.shippingAddress.zip}
                    <br />
                    {order.shippingAddress.country}
                  </p>
                </div>
              )}

              <div>
                <p className="text-xs font-semibold  text-muted-foreground mb-2">
                  Payment
                </p>
                <div className="p-4 rounded-xl bg-muted/30 border border-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-bold">
                      {order.paymentMethod}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-sm bg-background">
                    Paid
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {canManage && (
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Receipt className="w-4 h-4 text-primary" />
                Internal Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <textarea
                className="w-full min-h-[100px] rounded-xl border border-border/50 bg-background px-4 py-3 text-sm resize-y"
                placeholder="Add internal notes (not visible to customer)..."
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
              />
              <Button
                variant="outline"
                size="sm"
                className="w-full rounded-xl font-bold"
                onClick={handleSaveNotes}
                disabled={isUpdatingOrder}
              >
                {isUpdatingOrder ? "Saving..." : "Save notes"}
              </Button>
            </CardContent>
          </Card>
          )}
        </div>
      </div>
    </div>
  );
}

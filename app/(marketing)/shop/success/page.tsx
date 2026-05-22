"use client"
import { AnimatedDiv, AnimatedH1, AnimatedH2, AnimatedH3, AnimatedP } from "@/lib/animated";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Download, Copy, Mail, ShieldCheck, ArrowRight, Home, LayoutDashboard, MessageSquare, Loader2, Package, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { api, billingAPI } from "@/lib/api";
import { useCart } from "@/hooks/use-cart";

interface OrderItem {
  id: string;
  product: {
    id: string;
    name: string;
    description: string;
    icon: string;
    price: number;
  };
  quantity: number;
  price: number;
  licenseKey: string | null;
  downloadUrl: string | null;
}

interface OrderData {
  order: {
    id: string;
    orderNumber: string;
    status: string;
    createdAt: string;
    completedAt: string;
  };
  items: OrderItem[];
  totals: {
    subtotal: string;
    tax: string;
    total: string;
    currency: string;
  };
  customer: {
    name: string;
    email: string;
  };
  message: string;
}

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const sessionId = searchParams.get("session_id");
  
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(!!orderId || !!sessionId);
  const [error, setError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const { clearCart } = useCart();

  useEffect(() => {
    if (orderId) {
      fetchOrderData();
    } else if (sessionId) {
      completeCheckout();
    }
  }, [orderId, sessionId]);

  const completeCheckout = async () => {
    try {
      const data = await billingAPI.completeCheckout(sessionId!);
      setOrderData(data);
      clearCart();
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Failed to process order");
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderData = async () => {
    try {
      const response = await api.get(`/orders/${orderId}/success`);
      setOrderData(response.data);
      clearCart();
    } catch (err: any) {
      setError(err.response?.data?.message ?? "");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, itemId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(itemId);
    toast.success("License key copied to clipboard!");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  if (loading) {
    return (
      <div className="container px-4 py-16 md:py-24 mx-auto max-w-4xl text-center">
        <AnimatedDiv initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading your order details...</p>
        </AnimatedDiv>
      </div>
    );
  }

  if (!orderData) {
    return <GenericSuccess sessionId={sessionId} error={error} />;
  }

  const { order, items, totals, customer, message } = orderData;

  return (
    <div className="container px-4 py-16 md:py-24 mx-auto max-w-5xl">
      {/* Success Header */}
      <div className="text-center mb-12">
        <AnimatedDiv initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="w-24 h-24 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle2 className="w-12 h-12" />
        </AnimatedDiv>
        <AnimatedH1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-extrabold mb-4"
        >
          Payment Successful!
        </AnimatedH1>
        <AnimatedP 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-muted-foreground text-lg"
        >
          Thank you for your purchase. Your order <span className="text-foreground font-bold">#{order.orderNumber}</span> has been confirmed.
        </AnimatedP>
        <AnimatedP initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-sm text-muted-foreground mt-2"
        >
          A confirmation email has been sent to {customer.email}
        </AnimatedP>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Products Section */}
        <AnimatedDiv initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 space-y-6"
        >
          <Card className="border-primary/20 shadow-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Your Purchase</CardTitle>
                  <CardDescription>{items.length} item{items.length !== 1 ? 's' : ''} in this order</CardDescription>
                </div>
                <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                  {order.status}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {items.map((item, index) => (
                <AnimatedDiv key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="p-4 rounded-2xl bg-muted/50 border border-border"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Package className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold truncate">{item.product.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{item.product.description}</p>
                      <p className="text-sm font-medium mt-1">
                        Qty: {item.quantity} Ã— ${parseFloat(item.price.toString()).toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>

                  {item.licenseKey && (
                    <div className="mb-3">
                      <p className="text-sm font-medium mb-2">License Key:</p>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 p-3 bg-background rounded-lg border font-mono text-xs overflow-x-auto">
                          {item.licenseKey}
                        </code>
                        <Button 
                          size="icon" 
                          variant="outline" 
                          className="h-10 w-10 shrink-0"
                          onClick={() => copyToClipboard(item.licenseKey!, item.id)}
                        >
                          <Copy className={`w-4 h-4 ${copiedKey === item.id ? "text-green-500" : ""}`} />
                        </Button>
                      </div>
                    </div>
                  )}

                  {item.downloadUrl && (
                    <Button 
                      className="w-full h-12 rounded-xl font-bold gap-2"
                      size="lg"
                      asChild
                    >
                      <a href={item.downloadUrl} download>
                        <Download className="w-5 h-5" />
                        Download Files
                      </a>
                    </Button>
                  )}
                </AnimatedDiv>
              ))}

              {/* Order Totals */}
              <div className="border-t border-border pt-6 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${totals.subtotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span>${totals.tax}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${totals.total} {totals.currency}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </AnimatedDiv>

        {/* Sidebar */}
        <AnimatedDiv initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          <Card>
            <CardHeader>
              <CardTitle>What's Next?</CardTitle>
              <CardDescription>Manage your purchase</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/dashboard" className="flex items-center justify-between p-4 rounded-2xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <LayoutDashboard className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">Dashboard</p>
                    <p className="text-xs text-muted-foreground">View all orders</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link href="/dashboard/downloads" className="flex items-center justify-between p-4 rounded-2xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                    <Download className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">Downloads</p>
                    <p className="text-xs text-muted-foreground">Access your files</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link href="/support" className="flex items-center justify-between p-4 rounded-2xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">Get Support</p>
                    <p className="text-xs text-muted-foreground">Need help?</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-secondary/20 border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <span className="font-bold">Lifetime Support</span>
              </div>
              <p className="text-sm text-muted-foreground">
                All purchases include free updates and technical support.
              </p>
            </CardContent>
          </Card>
        </AnimatedDiv>
      </div>
    </div>
  );
}

function GenericSuccess({ sessionId, error }: { sessionId: string | null; error: string | null }) {
  const router = useRouter();
  const hasError = !!error;

  useEffect(() => {
    if (sessionId && !error) {
      const timer = setTimeout(() => {
        router.push("/dashboard/orders");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [sessionId, error, router]);

  return (
    <div className="container px-4 py-16 md:py-24 mx-auto max-w-4xl">
      <Card className={hasError ? "border-red-500/20 bg-red-500/5" : "border-green-500/20 bg-green-500/5"}>
        <CardHeader className="text-center">
          <div className={cn("w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6", hasError ? "bg-red-500/20 text-red-500" : "bg-green-500/20 text-green-500")}>
            {hasError ? <AlertCircle className="w-12 h-12" /> : <CheckCircle2 className="w-12 h-12" />}
          </div>
          <CardTitle className={hasError ? "text-red-400 text-3xl" : "text-green-400 text-3xl"}>
            {hasError ? "Order Processing Failed" : "Payment Successful!"}
          </CardTitle>
          <CardDescription className="text-lg mt-2">
            {hasError ? error : "Your payment has been processed successfully."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <p className="text-muted-foreground text-center max-w-md">
            {hasError
              ? "Your payment was taken but we couldn't create your order. Our team has been notified and will resolve this shortly."
              : "Your order is being processed. You can view all your orders and download your purchases from the dashboard."}
          </p>
          {!hasError && (
            <p className="text-xs text-muted-foreground">
              Redirecting to your dashboard in 5 seconds...
            </p>
          )}
          <div className="flex gap-4 mt-4">
            {hasError ? (
              <Button asChild>
                <Link href="/dashboard/support">Contact Support</Link>
              </Button>
            ) : (
              <Button asChild>
                <Link href="/dashboard/orders">View My Orders</Link>
              </Button>
            )}
            <Button variant="outline" asChild>
              <Link href="/shop">Continue Shopping</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Export with Suspense wrapper
export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="container px-4 py-16 md:py-24 mx-auto max-w-4xl text-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}

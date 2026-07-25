"use client"
import { AnimatedDiv } from "@/lib/animated";
import { useState, useMemo, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
    CreditCard, Download, AlertCircle, Shield, FileText, Plus, Lock, Loader2, Trash2, RefreshCw, Zap, Check,
    CheckCircle2, XCircle, DollarSign, Calendar, ArrowRight, ChevronLeft, ChevronRight, Tag, X
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from "recharts";
import { useInvoices } from "@/hooks/useInvoices";
import { useSubscription } from "@/hooks/useSubscription";
import { usePaymentMethods } from "@/hooks/usePaymentMethods";
import { useRole } from "@/hooks/useRole";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { billingAPI, SubscriptionPlan } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

const planDetails: Record<string, { product: string; free: string; pro: string; business: string }[]> = {
    snippets: [
        { product: 'Code Snippets', free: 'Basic Library', pro: 'Full Library', business: 'Full Library' },
        { product: 'Website Templates', free: '—', pro: 'Full Access', business: 'Full Access' },
        { product: 'SaaS Tools', free: '—', pro: 'Basic Tools', business: 'Full Suite' },
        { product: 'Chatbots', free: '—', pro: '—', business: 'Full Access' },
    ],
    limits: [
        { product: 'Downloads / Month', free: '5', pro: '50', business: 'Unlimited' },
        { product: 'Storage', free: '100MB', pro: '5GB', business: '50GB' },
        { product: 'API Requests / Day', free: '—', pro: '1,000', business: '10,000' },
        { product: 'Team Members', free: '1', pro: '3', business: '10' },
    ],
    support: [
        { product: 'Support', free: 'Community', pro: 'Priority Email', business: '24/7 Dedicated' },
        { product: 'White-label', free: '—', pro: '—', business: 'Included' },
        { product: 'Audit Logs', free: '—', pro: '—', business: 'Included' },
    ],
};

export default function BillingOverview() {
    const searchParams = useSearchParams();
    const paymentStatus = searchParams.get('payment');
    const { invoices, isLoading: isLoadingInvoices, isError: isInvoicesError, refetch: refetchInvoices } = useInvoices();
    const { subscription, refetch: refetchSubscription } = useSubscription();
    const { paymentMethods, isLoading: isLoadingMethods, refetch: refetchPaymentMethods, deleteMethod, setDefaultMethod } = usePaymentMethods();
    const { hasPermission } = useRole();

    const [usage, setUsage] = useState<any>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [billingInterval, setBillingInterval] = useState<string>('month');
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [isPlansLoading, setIsPlansLoading] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [currentPlanPrice, setCurrentPlanPrice] = useState(0);
    const [isCancelOpen, setIsCancelOpen] = useState(false);
    const [discountCode, setDiscountCode] = useState("");
    const [isDiscountOpen, setIsDiscountOpen] = useState(false);
    const [invoicePage, setInvoicePage] = useState(1);
    const [isSettingDefault, setIsSettingDefault] = useState<string | null>(null);

    useEffect(() => {
        if (subscription?.plan && subscription?.interval) {
            billingAPI.getPlans().then((plans: any) => {
                if (Array.isArray(plans)) {
                    const p = plans.find((pl: any) => pl.name === subscription.plan);
                    if (p) setCurrentPlanPrice(p.price);
                }
            }).catch(() => {});
        }
    }, [subscription?.plan, subscription?.interval]);

    const canManageBilling = hasPermission("billing.manage");

    const fetchUsage = useCallback(() => {
        billingAPI.getUsage().then(setUsage).catch(() => setUsage(null));
    }, []);

    const fetchPlans = useCallback(async (interval: string) => {
        setIsPlansLoading(true);
        try {
            const data = await billingAPI.getPlans();
            if (Array.isArray(data)) {
                setPlans(data);
            } else {
                setPlans([]);
            }
        } catch { setPlans([]); }
        finally { setIsPlansLoading(false); }
    }, []);

    useEffect(() => {
        if (subscription?.interval) {
            setBillingInterval(subscription.interval);
        }
    }, [subscription?.interval]);

    useEffect(() => { fetchPlans(billingInterval); }, [billingInterval, fetchPlans]);

    useEffect(() => { fetchUsage(); }, [fetchUsage, subscription?.plan]);

    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        try { await Promise.all([refetchInvoices(), refetchSubscription(), refetchPaymentMethods()]); fetchUsage(); }
        finally { setIsRefreshing(false); }
    }, [refetchInvoices, refetchSubscription, refetchPaymentMethods, fetchUsage]);

    const handlePlanChange = async () => {
        if (!selectedPlan) return;
        setIsRedirecting(true);
        try {
            const planObj = plans.find(p => p.name === selectedPlan);
            if (!planObj) {
                toast.error("Plan not found");
                setIsRedirecting(false);
                return;
            }

            const result = await billingAPI.createSubscriptionCheckout(planObj.id, {
                trialPeriodDays: 0,
            });

            if (result?.checkoutUrl) {
                window.location.href = result.checkoutUrl;
            } else {
                toast.error("Failed to create checkout session");
                setIsRedirecting(false);
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to initiate checkout");
            setIsRedirecting(false);
        }
    };

    const chartData = useMemo(() => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentMonth = new Date().getMonth();
        const last6Months: { name: string; amount: number }[] = [];
        for (let i = 5; i >= 0; i--) { const m = (currentMonth - i + 12) % 12; last6Months.push({ name: months[m], amount: 0 }); }
        invoices.forEach(inv => {
            const date = new Date(inv.createdAt);
            const mName = months[date.getMonth()];
            const dataPoint = last6Months.find(d => d.name === mName);
            if (dataPoint) { const amt = parseFloat((inv.amount || "0").replace(/[^0-9.-]+/g, "")); dataPoint.amount += isNaN(amt) ? 0 : amt; }
        });
        return last6Months;
    }, [invoices]);

    const handleInvoiceDownload = async (inv: { id?: string; invoiceId?: string }) => {
        const id = inv.invoiceId || inv.id;
        if (!id) { toast.error("Invoice reference not found"); return; }
        try { await billingAPI.downloadInvoice(id); toast.success("Invoice downloaded"); }
        catch { toast.error("Failed to download invoice. Please try again."); }
    };

    const hasError = isInvoicesError;
    const isLoading = isLoadingInvoices || (subscription === null && !hasError);
    const currentPlan = subscription?.plan || 'Free';
    const currentInterval = subscription?.interval || 'month';
    const isCurrentPlan = (name: string, interval?: string) => {
        if (name !== currentPlan) return false;
        if (interval && interval !== currentInterval) return false;
        return true;
    };
    const nextBillingDate = subscription?.nextBillingDate
        ? new Date(subscription.nextBillingDate).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
        : "—";
    const storagePercent = usage?.storage?.percent ?? 0;
    const apiPercent = usage?.apiCalls?.percent ?? 0;

    if (hasError) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
                <AlertCircle className="w-16 h-16 text-red-500/80" />
                <h3 className="text-xl font-semibold">Failed to load billing data</h3>
                <p className="text-muted-foreground text-sm text-center max-w-sm">Something went wrong. Please try again.</p>
                <Button onClick={handleRefresh} className="gap-2 rounded-lg"><RefreshCw className="w-4 h-4" /> Retry</Button>
            </div>
        );
    }

    // Handle payment success/failure banner
    useEffect(() => {
        if (paymentStatus === 'success') {
            toast.success("Payment successful! Your subscription has been updated.");
            refetchSubscription();
            refetchInvoices();
        } else if (paymentStatus === 'failed') {
            toast.error("Payment failed. Please try again.");
        }
    }, [paymentStatus, refetchSubscription, refetchInvoices]);

    const handleCancelSubscription = async () => {
        try {
            await billingAPI.cancelSubscription();
            toast.success("Subscription cancelled successfully");
            setIsCancelOpen(false);
            refetchSubscription();
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to cancel subscription");
        }
    };

    const handleSetDefault = async (methodId: string) => {
        setIsSettingDefault(methodId);
        try {
            await setDefaultMethod(methodId);
            toast.success("Default payment method updated");
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to update default method");
        } finally {
            setIsSettingDefault(null);
        }
    };

    const handleApplyDiscount = async () => {
        if (!discountCode.trim()) {
            toast.error("Please enter a discount code");
            return;
        }
        try {
            const result = await billingAPI.validateDiscount(discountCode);
            if (result?.valid) {
                toast.success(`Discount applied: ${result.discount}% off`);
                setIsDiscountOpen(false);
            } else {
                toast.error("Invalid discount code");
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to validate discount");
        }
    };

    const INVOICES_PER_PAGE = 4;
    const paginatedInvoices = useMemo(() => {
        const start = (invoicePage - 1) * INVOICES_PER_PAGE;
        return invoices.slice(start, start + INVOICES_PER_PAGE);
    }, [invoices, invoicePage]);
    const totalInvoicePages = Math.ceil(invoices.length / INVOICES_PER_PAGE);

    // Stats
    const totalSpent = invoices.filter(inv => inv.status === 'completed').reduce((acc, inv) => {
        const amt = parseFloat((inv.amount || "0").replace(/[^0-9.-]+/g, ""));
        return acc + (isNaN(amt) ? 0 : amt);
    }, 0);
    const pendingInvoices = invoices.filter(inv => inv.status === 'pending').length;

    return (
        <div className="space-y-8 mx-auto">
            {/* Payment Success/Failure Banner */}
            {paymentStatus && (
                <AnimatedDiv initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className={cn(
                    "rounded-lg p-4 flex items-center gap-4",
                    paymentStatus === 'success' ? "bg-green-500/10 border border-green-500/20" : "bg-destructive/10 border border-destructive/20"
                )}>
                    {paymentStatus === 'success' ? (
                        <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0" />
                    ) : (
                        <XCircle className="w-6 h-6 text-destructive shrink-0" />
                    )}
                    <div className="flex-1">
                    <p className="text-sm font-semibold">
                        {paymentStatus === 'success' ? "Payment Successful" : "Payment Failed"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            {paymentStatus === 'success' ? "Your subscription has been updated." : "Please try again or contact support."}
                        </p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => window.history.replaceState({}, '', '/dashboard/billing')}>
                        <X className="w-4 h-4" />
                    </Button>
                </AnimatedDiv>
            )}

            <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-semibold">Billing</h1>
                    <p className="text-muted-foreground text-sm">Manage your subscription, payment methods and monitor usage.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing} className="rounded-lg gap-2">
                        <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} /> Refresh
                    </Button>
                    <a href="/dashboard/billing/invoices" className="px-4 py-2 border border-border/50 bg-card rounded-lg hover:bg-muted transition-all text-sm inline-flex items-center">
                        Invoices
                    </a>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground font-medium">Current Plan</p>
                            <p className="text-lg font-semibold mt-0.5">{currentPlan}</p>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Zap className="w-5 h-5 text-primary" />
                        </div>
                    </div>
                </div>
                <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground font-medium">Total Spent</p>
                            <p className="text-lg font-semibold text-green-500 mt-0.5">${totalSpent.toFixed(2)}</p>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-green-500" />
                        </div>
                    </div>
                </div>
                <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground font-medium">Next Payment</p>
                            <p className="text-lg font-semibold mt-0.5">{nextBillingDate}</p>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-orange-500" />
                        </div>
                    </div>
                </div>
                <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground font-medium">Pending</p>
                            <p className="text-lg font-semibold mt-0.5">{pendingInvoices}</p>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-blue-500" />
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Plan Interval Toggle ── */}
            <AnimatedDiv initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-center gap-4">
                <Tabs value={billingInterval} onValueChange={setBillingInterval} className="bg-card/50 border border-border/50 rounded-lg p-1 shadow-sm">
                    <TabsList className="bg-transparent h-auto gap-1">
                        <TabsTrigger value="month" className="px-4 py-1.5 rounded-md text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm">Monthly</TabsTrigger>
                        <TabsTrigger value="year" className="px-4 py-1.5 rounded-md text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm">
                            Yearly <Badge variant="outline" className="ml-1.5 text-xs bg-green-500/10 text-green-600 border-green-500/20">Save 17%</Badge>
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </AnimatedDiv>

            {/* ── Plan Cards ── */}
            <AnimatedDiv initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                {isPlansLoading ? (
                    <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {plans.map((plan) => {
                            const isCurrent = isCurrentPlan(plan.name, plan.interval);
                            const featuresRaw = typeof plan.features === 'string' ? JSON.parse(plan.features || '[]') : plan.features;
                            const features = Array.isArray(featuresRaw) ? featuresRaw : [];
                            return (
                                <div key={plan.id} className={cn(
                                    "relative rounded-xl border p-6 transition-all duration-500 flex flex-col",
                                    isCurrent
                                        ? "bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30 shadow-xl shadow-primary/10 scale-[1.02]"
                                        : "bg-card/50 border-border/50 hover:border-primary/20 hover:shadow-lg"
                                )}>
                                    {isCurrent && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full shadow-lg">
                                            Current Plan
                                        </div>
                                    )}
                                    <div className="mb-6">
                                        <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                                        <div className="flex items-baseline gap-1 mb-1">
                                            <span className="text-3xl font-semibold">${plan.price}</span>
                                            <span className="text-muted-foreground text-sm">/{plan.interval === 'year' ? 'yr' : 'mo'}</span>
                                        </div>
                                        {plan.interval === 'year' && plan.price > 0 && (
                                            <p className="text-xs text-green-600 font-medium">${(plan.price / 12).toFixed(2)}/mo billed annually</p>
                                        )}
                                        <p className="text-sm text-muted-foreground mt-3">{plan.description}</p>
                                    </div>
                                    <ul className="space-y-3 mb-8 flex-1">
                                        {features.map((f: string, i: number) => (
                                            <li key={i} className="flex items-center gap-3 text-sm">
                                                <Check className="w-4 h-4 text-green-500 shrink-0" />
                                                <span>{f}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <Button
                                        disabled={isCurrent || isRedirecting}
                                        onClick={() => { setSelectedPlan(plan.name); setIsConfirmOpen(true); }}
                                        className={cn("w-full rounded-lg", isCurrent ? "bg-muted text-muted-foreground cursor-default" : "shadow-sm")}
                                        variant={isCurrent ? "outline" : "default"}
                                    >
                                        {isCurrent ? 'Current Plan' : `Switch to ${plan.name}`}
                                    </Button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </AnimatedDiv>

            {/* ── Product Access Comparison Table ── */}
            <AnimatedDiv initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card/50 border border-border/50 rounded-xl p-6 shadow-sm overflow-x-auto">
                <h3 className="font-semibold text-lg mb-1">Product Access & Limits</h3>
                <p className="text-sm text-muted-foreground mb-6">What you get with each plan</p>

                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border/50">
                            <th className="text-left py-3 pr-6 text-xs font-medium text-muted-foreground">Feature</th>
                            {plans.map(p => <th key={p.id} className={cn("text-center py-3 px-3 text-xs font-medium", isCurrentPlan(p.name) ? "text-primary" : "text-muted-foreground")}>{p.name}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-b border-border/30">
                            <td colSpan={plans.length + 1} className="py-3 text-xs font-medium text-muted-foreground">Products</td>
                        </tr>
                        {planDetails.snippets.map((row, i) => (
                            <tr key={i} className="border-b border-border/20 hover:bg-muted/20 transition-colors">
                                <td className="py-2.5 pr-6 font-medium text-sm">{row.product}</td>
                                {plans.map(p => {
                                    const val = p.name === 'Free' ? row.free : p.name === 'Pro' ? row.pro : row.business;
                                    return (<td key={p.id} className={cn("text-center py-2.5 px-3", val === '—' ? 'text-muted-foreground/40' : 'text-green-600 font-medium text-sm')}>{val}</td>);
                                })}
                            </tr>
                        ))}
                        <tr className="border-b border-border/30">
                            <td colSpan={plans.length + 1} className="py-3 text-xs font-medium text-muted-foreground">Limits</td>
                        </tr>
                        {planDetails.limits.map((row, i) => (
                            <tr key={i} className="border-b border-border/20 hover:bg-muted/20 transition-colors">
                                <td className="py-2.5 pr-6 font-medium text-sm">{row.product}</td>
                                {plans.map(p => {
                                    const val = p.name === 'Free' ? row.free : p.name === 'Pro' ? row.pro : row.business;
                                    return <td key={p.id} className={cn("text-center py-2.5 px-3 text-sm", val === '—' ? 'text-muted-foreground/40' : '')}>{val}</td>;
                                })}
                            </tr>
                        ))}
                        <tr className="border-b border-border/30">
                            <td colSpan={plans.length + 1} className="py-3 text-xs font-medium text-muted-foreground">Support & Features</td>
                        </tr>
                        {planDetails.support.map((row, i) => (
                            <tr key={i} className="border-b border-border/20 hover:bg-muted/20 transition-colors">
                                <td className="py-2.5 pr-6 font-medium text-sm">{row.product}</td>
                                {plans.map(p => {
                                    const val = p.name === 'Free' ? row.free : p.name === 'Pro' ? row.pro : row.business;
                                    return (<td key={p.id} className={cn("text-center py-2.5 px-3", val === '—' ? 'text-muted-foreground/40' : 'text-green-600 font-medium text-sm')}>{val}</td>);
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </AnimatedDiv>

            {/* ── Current Plan + Usage ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <AnimatedDiv initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className={cn("md:col-span-1 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl transition-all duration-500",
                        currentPlan === 'Business' ? "bg-gradient-to-br from-slate-900 to-slate-800" :
                        currentPlan === 'Pro' ? "bg-gradient-to-br from-indigo-600 to-purple-700" :
                        "bg-gradient-to-br from-blue-500 to-cyan-600"
                    )}
                >
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <p className="text-white/60 text-xs mb-1">Current Plan</p>
                                <h2 className="text-3xl font-semibold flex items-center gap-3">
                                    {currentPlan} <Zap className="w-6 h-6 text-yellow-400 fill-yellow-400 animate-pulse" />
                                </h2>
                            </div>
                            <div className="bg-white/10 px-3 py-1 rounded-lg text-sm backdrop-blur-md border border-white/20">
                                ${currentPlanPrice}/{currentInterval === 'year' ? 'yr' : 'mo'}
                            </div>
                        </div>

                        <div className="space-y-6 mb-10">
                            <div className="space-y-1 group/usage">
                                <div className="flex justify-between text-xs">
                                    <span className="text-white/70 flex items-center gap-1.5">Storage{ storagePercent > 85 && <AlertCircle className="w-3 h-3 text-orange-300 animate-pulse" /> }</span>
                                    <span>{usage?.storage?.used ?? "—"} / {usage?.storage?.total ?? "—"}</span>
                                </div>
                                <div className="w-full bg-black/30 rounded-full h-2 p-0.5 overflow-hidden border border-white/10">
                                    <AnimatedDiv initial={{ width: 0 }} animate={{ width: `${storagePercent}%` }}
                                        className={cn("h-full rounded-full transition-colors duration-500",
                                            storagePercent > 90 ? "bg-red-400 shadow-[0_0_15px_rgba(248,113,113,0.8)]" :
                                            storagePercent > 75 ? "bg-orange-400 shadow-[0_0_15px_rgba(251,146,60,0.8)]" :
                                            "bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                                        )}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="flex justify-between text-xs">
                                    <span className="text-white/70">API / Downloads</span>
                                    <span>{usage?.apiCalls?.used ?? "—"} / {usage?.apiCalls?.total ?? "—"}</span>
                                </div>
                                <div className="w-full bg-black/30 rounded-full h-2 p-0.5 overflow-hidden border border-white/10">
                                    <AnimatedDiv initial={{ width: 0 }} animate={{ width: `${apiPercent}%` }}
                                        className={cn("h-full rounded-full transition-colors duration-500",
                                            apiPercent > 90 ? "bg-red-400 shadow-[0_0_15px_rgba(248,113,113,0.8)]" :
                                            apiPercent > 80 ? "bg-orange-400 shadow-[0_0_15px_rgba(251,146,60,0.8)]" :
                                            "bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]"
                                        )}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between items-center text-sm border-t border-white/10 pt-6">
                            <span className="text-white/50">Next Cycle: {nextBillingDate}</span>
                            <span className="text-white flex items-center gap-1.5">
                                <Lock className="w-2.5 h-2.5 opacity-50" />
                                {currentPlanPrice === 0 ? "Free Tier" : `$${currentPlanPrice}/${currentInterval === 'year' ? 'yr' : 'mo'}`}
                            </span>
                        </div>
                    </div>
                    <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/5 rounded-full blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-black/20 rounded-full blur-3xl" />
                </AnimatedDiv>

                {/* Usage Chart */}
                <div className="md:col-span-2 bg-card/50 border border-border/50 rounded-xl p-6 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="font-semibold text-lg leading-none mb-1">Spending Overview</h3>
                            <p className="text-sm text-muted-foreground">Last 6 months</p>
                        </div>
                        <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-full border border-border/50">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                            <span className="text-xs text-muted-foreground">Trend 6M</span>
                        </div>
                    </div>
                    <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <defs><linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6366f1" stopOpacity={1} /><stop offset="100%" stopColor="#6366f1" stopOpacity={0.6} /></linearGradient></defs>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }} />
                                <Tooltip cursor={{ fill: 'rgba(99, 102, 241, 0.05)', radius: 12 }}
                                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: 'none', borderRadius: '24px', color: '#fff', backdropFilter: 'blur(12px)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}
                                    itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                                    labelStyle={{ fontWeight: 'black', color: '#6366f1', marginBottom: '6px', fontSize: '10px', letterSpacing: '0.15em' }}
                                />
                                <Bar dataKey="amount" radius={[10, 10, 10, 10]} barSize={40}>
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? 'url(#barGradient)' : 'rgba(99, 102, 241, 0.15)'}
                                            className="transition-all duration-500 hover:opacity-80 cursor-pointer"
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Payment Methods */}
                <div className="bg-card/50 border border-border/50 rounded-xl p-6 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="font-semibold text-lg">Payment Methods</h3>
                            <p className="text-sm text-muted-foreground">Active payment methods</p>
                        </div>
                        {canManageBilling && (
                            <Button variant="outline" size="sm" className="rounded-lg gap-2" onClick={() => setIsDiscountOpen(true)}>
                                <Tag className="w-4 h-4" /> Discount
                            </Button>
                        )}
                    </div>
                    <div className="space-y-3">
                        {isLoadingMethods ? (
                            <div className="py-8 flex flex-col items-center justify-center gap-3">
                                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                <span className="text-sm text-muted-foreground">Loading payment methods...</span>
                            </div>
                        ) : paymentMethods.length === 0 ? (
                            <div className="py-12 flex flex-col items-center justify-center text-center gap-4 border-2 border-dashed border-border/50 rounded-lg bg-muted/5">
                                <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground"><CreditCard className="w-6 h-6" /></div>
                                <div><p className="font-medium text-sm text-muted-foreground">No methods found</p><p className="text-xs text-muted-foreground/60">Payment methods are managed via Dodo Payments checkout.</p></div>
                                {canManageBilling && (
                                    <Button variant="outline" size="sm" className="rounded-lg gap-2" onClick={() => toast.info("Add payment method via checkout flow")}>
                                        <Plus className="w-4 h-4" /> Add Method
                                    </Button>
                                )}
                            </div>
                        ) : (
                            paymentMethods.map((card) => (
                                <div key={card.id} className="group relative flex items-center justify-between p-4 border border-border/50 rounded-lg bg-background/50 hover:bg-muted/10 transition-all hover:border-primary/20">
                                    <div className="flex items-center gap-4">
                                        <div className={cn("w-14 h-9 rounded-lg flex items-center justify-center shadow border relative overflow-hidden",
                                            (card.brand || '').toLowerCase() === 'visa' ? "bg-blue-600 border-blue-400/30" : "bg-slate-800 border-slate-600/30"
                                        )}>
                                            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent" />
                                            <span className="text-xs font-medium text-white z-10">{card.brand}</span>
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm leading-none mb-1">•••• •••• •••• {card.last4}</p>
                                            <div className="flex items-center gap-2">
                                                <p className="text-xs text-muted-foreground">Expires {card.expiry}</p>
                                                <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                                                <p className="text-xs text-muted-foreground">{card.type}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {card.isDefault ? (
                                            <div className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 flex items-center gap-1.5">
                                                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                                <span className="text-xs font-medium text-green-600">Primary</span>
                                            </div>
                                        ) : (
                                            canManageBilling && (
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                                    <Button variant="ghost" size="sm" onClick={() => handleSetDefault(card.id)} disabled={isSettingDefault === card.id} className="h-8 px-2 rounded-md text-xs">
                                                        {isSettingDefault === card.id ? <Loader2 className="w-3 h-3 animate-spin" /> : "Set Default"}
                                                    </Button>
                                                    <Button variant="ghost" size="sm" onClick={() => deleteMethod(card.id)} className="h-8 w-8 p-0 hover:bg-red-500/10 hover:text-red-500 rounded-md text-muted-foreground"><Trash2 size={14} /></Button>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Recent Invoices */}
                <div className="bg-card/50 border border-border/50 rounded-xl p-6 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-semibold text-lg">Recent Invoices</h3>
                        <a href="/dashboard/billing/invoices" className="text-sm text-primary font-medium hover:underline">View All</a>
                    </div>
                    <div className="space-y-1">
                        {isLoadingInvoices ? (
                            <div className="py-8 flex flex-col items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
                        ) : invoices.length === 0 ? (
                            <p className="text-center py-8 text-sm text-muted-foreground">No transactions recorded yet.</p>
                        ) : (
                            paginatedInvoices.map((inv, i) => (
                                <div key={inv.id} className="flex items-center justify-between p-3 hover:bg-primary/[0.03] rounded-lg transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center text-muted-foreground"><FileText className="w-5 h-5" /></div>
                                        <div><p className="font-medium text-sm">{inv.amount}</p><p className="text-xs text-muted-foreground">{new Date(inv.createdAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}</p></div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={cn("text-xs font-medium px-2 py-0.5 rounded-md border",
                                            inv.status === 'completed' ? "bg-green-500/10 text-green-600 border-green-500/10" : "bg-orange-500/10 text-orange-600 border-orange-500/10"
                                        )}>{inv.status}</span>
                                        <button onClick={() => handleInvoiceDownload(inv)} className="p-2 hover:bg-muted bg-background border border-border rounded-lg text-muted-foreground hover:text-foreground transition-all"><Download className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    {/* Pagination */}
                    {invoices.length > INVOICES_PER_PAGE && (
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
                            <p className="text-xs text-muted-foreground">
                                {invoicePage} / {totalInvoicePages}
                            </p>
                            <div className="flex items-center gap-1">
                                <Button variant="outline" size="sm" className="h-7 w-7 p-0 rounded-md" onClick={() => setInvoicePage(p => Math.max(1, p - 1))} disabled={invoicePage === 1}>
                                    <ChevronLeft className="w-3 h-3" />
                                </Button>
                                <Button variant="outline" size="sm" className="h-7 w-7 p-0 rounded-md" onClick={() => setInvoicePage(p => Math.min(totalInvoicePages, p + 1))} disabled={invoicePage === totalInvoicePages}>
                                    <ChevronRight className="w-3 h-3" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Confirm Plan Change Dialog */}
            <Dialog open={isConfirmOpen} onOpenChange={(o) => { if (!o) setIsConfirmOpen(false); }}>
                <DialogContent className="sm:max-w-md rounded-xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-semibold">Switch to {selectedPlan}?</DialogTitle>
                        <DialogDescription className="text-sm text-muted-foreground">You'll be redirected to Dodo Payments secure checkout to complete your upgrade.</DialogDescription>
                    </DialogHeader>
                    <div className="p-4 bg-primary/5 rounded-lg border border-primary/10 flex items-start gap-3">
                        <Shield className="w-5 h-5 text-primary mt-0.5" />
                        <p className="text-sm text-muted-foreground">You will be redirected to a secure checkout page to complete payment.</p>
                    </div>
                    <DialogFooter className="flex gap-3 sm:justify-end">
                        <Button variant="outline" onClick={() => setIsConfirmOpen(false)} className="rounded-lg" disabled={isRedirecting}>Cancel</Button>
                        <Button onClick={handlePlanChange} disabled={isRedirecting} className="rounded-lg">
                            {isRedirecting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Redirecting...</> : `Continue to Checkout`}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Cancel Subscription Dialog */}
            <Dialog open={isCancelOpen} onOpenChange={(o) => { if (!o) setIsCancelOpen(false); }}>
                <DialogContent className="sm:max-w-md rounded-xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-semibold text-destructive">Cancel Subscription?</DialogTitle>
                        <DialogDescription className="text-sm text-muted-foreground">You will lose access to all premium features at the end of your current billing period.</DialogDescription>
                    </DialogHeader>
                    <div className="p-4 bg-destructive/5 rounded-lg border border-destructive/10 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
                        <p className="text-sm text-muted-foreground">This action cannot be undone. You can resubscribe at any time.</p>
                    </div>
                    <DialogFooter className="flex gap-3 sm:justify-end">
                        <Button variant="outline" onClick={() => setIsCancelOpen(false)} className="rounded-lg">Keep Subscription</Button>
                        <Button variant="destructive" onClick={handleCancelSubscription} className="rounded-lg">
                            Cancel Subscription
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Discount Code Dialog */}
            <Dialog open={isDiscountOpen} onOpenChange={(o) => { if (!o) setIsDiscountOpen(false); }}>
                <DialogContent className="sm:max-w-md rounded-xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-semibold">Apply Discount Code</DialogTitle>
                        <DialogDescription className="text-sm text-muted-foreground">Enter a valid discount code to apply to your subscription.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <Input
                            placeholder="Enter discount code"
                            value={discountCode}
                            onChange={(e) => setDiscountCode(e.target.value)}
                            className="h-9 rounded-lg"
                        />
                    </div>
                    <DialogFooter className="flex gap-3 sm:justify-end">
                        <Button variant="outline" onClick={() => setIsDiscountOpen(false)} className="rounded-lg">Cancel</Button>
                        <Button onClick={handleApplyDiscount} className="rounded-lg">
                            Apply Code
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

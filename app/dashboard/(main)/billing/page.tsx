"use client"
import { AnimatedDiv } from "@/lib/animated";
import { useState, useMemo, useCallback, useEffect } from "react";
import {
    CreditCard, Download, AlertCircle, Shield, FileText, Plus, Lock, Loader2, Trash2, RefreshCw, Zap, Check
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
import { toast } from "sonner";
import { billingAPI, SubscriptionPlan } from "@/lib/api";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { stripePromise as defaultStripePromise } from "@/lib/stripe";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

function AddCardForm({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!stripe || !elements) return;
        setIsProcessing(true);
        setErrorMessage(null);
        try {
            const { clientSecret } = await billingAPI.createSetupIntent();
            const { error, setupIntent } = await stripe.confirmSetup({
                elements,
                clientSecret,
                redirect: 'if_required',
            });
            if (error) { setErrorMessage(error.message || "Failed to save payment method"); return; }
            if (setupIntent?.payment_method) {
                await billingAPI.attachPaymentMethod(setupIntent.payment_method as string);
                toast.success("Payment method added successfully");
                onSuccess();
            }
        } catch (err: unknown) {
            setErrorMessage(err instanceof Error ? err.message : "Failed to save payment method");
        } finally { setIsProcessing(false); }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <PaymentElement />
            {errorMessage && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-600 font-medium">{errorMessage}</div>
            )}
            <div className="flex gap-3">
                <Button type="button" variant="ghost" className="rounded-xl flex-1" onClick={onCancel} disabled={isProcessing}>Cancel</Button>
                <Button type="submit" disabled={!stripe || isProcessing} className="rounded-xl flex-1 shadow-lg shadow-primary/20">
                    {isProcessing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : <><Lock className="w-4 h-4 mr-2" /> Save Card</>}
                </Button>
            </div>
        </form>
    );
}

function PlanPaymentForm({ clientSecret, plan, interval, onSuccess, onCancel }: { clientSecret: string; plan: string; interval: string; onSuccess: () => void; onCancel: () => void }) {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!stripe || !elements) return;
        setIsProcessing(true);
        setErrorMessage(null);
        try {
            const { error, paymentIntent } = await stripe.confirmPayment({
                elements,
                clientSecret,
                redirect: 'if_required',
            });
            if (error) { setErrorMessage(error.message || "Payment failed"); return; }
            if (paymentIntent?.status === 'succeeded') {
                await billingAPI.updateSubscription(plan, paymentIntent.id, interval);
                toast.success(`Switched to ${plan} plan!`);
                onSuccess();
            }
        } catch (err: unknown) {
            setErrorMessage(err instanceof Error ? err.message : "Payment failed");
        } finally { setIsProcessing(false); }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <PaymentElement />
            {errorMessage && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-600 font-medium">{errorMessage}</div>
            )}
            <div className="flex gap-3">
                <Button type="button" variant="ghost" className="rounded-xl flex-1" onClick={onCancel} disabled={isProcessing}>Cancel</Button>
                <Button type="submit" disabled={!stripe || isProcessing} className="rounded-xl flex-1 shadow-lg shadow-primary/20">
                    {isProcessing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</> : <><Lock className="w-4 h-4 mr-2" /> Pay &amp; Upgrade</>}
                </Button>
            </div>
        </form>
    );
}

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
    const { invoices, isLoading: isLoadingInvoices, isError: isInvoicesError, refetch: refetchInvoices } = useInvoices();
    const { subscription, refetch: refetchSubscription, updateSubscription, isUpdating } = useSubscription();
    const { paymentMethods, isLoading: isLoadingMethods, refetch: refetchPaymentMethods, setDefaultMethod, deleteMethod } = usePaymentMethods();
    const { hasPermission } = useRole();

    const [isAddCardOpen, setIsAddCardOpen] = useState(false);
    const [usage, setUsage] = useState<any>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [stripeReady, setStripeReady] = useState<boolean | null>(null);
    const [billingInterval, setBillingInterval] = useState<string>('month');
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [isPlansLoading, setIsPlansLoading] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [paymentClientSecret, setPaymentClientSecret] = useState<string | null>(null);
    const [currentPlanPrice, setCurrentPlanPrice] = useState(0);

    useEffect(() => {
        if (subscription?.plan && subscription?.interval) {
            billingAPI.getPlans(subscription.interval).then(plans => {
                const p = plans.find(pl => pl.name === subscription.plan);
                if (p) setCurrentPlanPrice(p.price);
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
            const data = await billingAPI.getPlans(interval);
            setPlans(data);
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

    useEffect(() => {
        defaultStripePromise.then(() => setStripeReady(true), () => setStripeReady(false));
    }, []);

    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        try { await Promise.all([refetchInvoices(), refetchSubscription(), refetchPaymentMethods()]); fetchUsage(); }
        finally { setIsRefreshing(false); }
    }, [refetchInvoices, refetchSubscription, refetchPaymentMethods, fetchUsage]);

    const handlePlanChange = async () => {
        if (!selectedPlan) return;
        try {
            const result = await updateSubscription(selectedPlan, undefined, billingInterval);
            if (result.requiresPayment && result.clientSecret) {
                setPaymentClientSecret(result.clientSecret);
                setIsConfirmOpen(false);
                setIsPaymentOpen(true);
            } else {
                setIsConfirmOpen(false);
                toast.success(`Switched to ${selectedPlan} plan!`);
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to update plan");
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
                <h3 className="text-xl font-bold">Failed to load billing data</h3>
                <p className="text-muted-foreground text-sm text-center max-w-sm">Something went wrong. Please try again.</p>
                <Button onClick={handleRefresh} className="gap-2 rounded-xl"><RefreshCw className="w-4 h-4" /> Retry</Button>
            </div>
        );
    }

    return (
        <div className="space-y-8 mx-auto">
            <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-semibold">Billing & Usage</h1>
                    <p className="text-muted-foreground font-medium">Manage your subscription, payment methods and monitor usage.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing} className="rounded-2xl font-bold gap-2">
                        <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} /> Refresh
                    </Button>
                    <a href="/dashboard/billing/invoices" className="px-5 py-2.5 border border-border/50 bg-card rounded-2xl font-bold hover:bg-muted transition-all text-sm shadow-sm inline-flex items-center">
                        View Ledger
                    </a>
                </div>
            </div>

            {/* ── Plan Interval Toggle ── */}
            <AnimatedDiv initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-center gap-4">
                <Tabs value={billingInterval} onValueChange={setBillingInterval} className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl p-1.5 shadow-sm">
                    <TabsList className="bg-transparent h-auto gap-1">
                        <TabsTrigger value="month" className="px-6 py-2 rounded-xl text-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20">Monthly</TabsTrigger>
                        <TabsTrigger value="year" className="px-6 py-2 rounded-xl text-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20">
                            Yearly <Badge variant="outline" className="ml-2 text-xs bg-green-500/10 text-green-600 border-green-500/20">Save 17%</Badge>
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
                                    "relative rounded-3xl border p-8 transition-all duration-500 flex flex-col",
                                    isCurrent
                                        ? "bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30 shadow-xl shadow-primary/10 scale-[1.02]"
                                        : "bg-card/50 backdrop-blur-xl border-border/50 hover:border-primary/20 hover:shadow-lg"
                                )}>
                                    {isCurrent && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full shadow-lg">
                                            Current Plan
                                        </div>
                                    )}
                                    <div className="mb-6">
                                        <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                                        <div className="flex items-baseline gap-1 mb-1">
                                            <span className="text-4xl font-black">${plan.price}</span>
                                            <span className="text-muted-foreground font-medium">/{plan.interval === 'year' ? 'yr' : 'mo'}</span>
                                        </div>
                                        {plan.interval === 'year' && plan.price > 0 && (
                                            <p className="text-xs text-green-600 font-semibold">${(plan.price / 12).toFixed(2)}/mo billed annually</p>
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
                                        disabled={isCurrent || isUpdating}
                                        onClick={() => { setSelectedPlan(plan.name); setIsConfirmOpen(true); }}
                                        className={cn("w-full rounded-xl font-semibold", isCurrent ? "bg-muted text-muted-foreground cursor-default" : "shadow-lg shadow-primary/20")}
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
            <AnimatedDiv initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-3xl p-8 shadow-sm overflow-x-auto">
                <h3 className="font-semibold text-xl mb-1">Product Access & Limits</h3>
                <p className="text-sm font-bold text-muted-foreground mb-8">What you get with each plan</p>

                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border/50">
                            <th className="text-left py-4 pr-8 font-bold text-muted-foreground">Feature</th>
                            {plans.map(p => <th key={p.id} className={cn("text-center py-4 px-4 font-bold", isCurrentPlan(p.name) ? "text-primary" : "text-muted-foreground")}>{p.name}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-b border-border/30">
                            <td colSpan={plans.length + 1} className="py-4 text-xs font-bold text-muted-foreground/60 uppercase tracking-wider">Products</td>
                        </tr>
                        {planDetails.snippets.map((row, i) => (
                            <tr key={i} className="border-b border-border/20 hover:bg-muted/20 transition-colors">
                                <td className="py-3 pr-8 font-semibold">{row.product}</td>
                                {plans.map(p => {
                                    const val = p.name === 'Free' ? row.free : p.name === 'Pro' ? row.pro : row.business;
                                    return (<td key={p.id} className={cn("text-center py-3 px-4", val === '—' ? 'text-muted-foreground/40' : 'text-green-600 font-medium')}>{val}</td>);
                                })}
                            </tr>
                        ))}
                        <tr className="border-b border-border/30">
                            <td colSpan={plans.length + 1} className="py-4 text-xs font-bold text-muted-foreground/60 uppercase tracking-wider">Limits</td>
                        </tr>
                        {planDetails.limits.map((row, i) => (
                            <tr key={i} className="border-b border-border/20 hover:bg-muted/20 transition-colors">
                                <td className="py-3 pr-8 font-semibold">{row.product}</td>
                                {plans.map(p => {
                                    const val = p.name === 'Free' ? row.free : p.name === 'Pro' ? row.pro : row.business;
                                    return <td key={p.id} className={cn("text-center py-3 px-4 font-medium", val === '—' ? 'text-muted-foreground/40' : '')}>{val}</td>;
                                })}
                            </tr>
                        ))}
                        <tr className="border-b border-border/30">
                            <td colSpan={plans.length + 1} className="py-4 text-xs font-bold text-muted-foreground/60 uppercase tracking-wider">Support & Features</td>
                        </tr>
                        {planDetails.support.map((row, i) => (
                            <tr key={i} className="border-b border-border/20 hover:bg-muted/20 transition-colors">
                                <td className="py-3 pr-8 font-semibold">{row.product}</td>
                                {plans.map(p => {
                                    const val = p.name === 'Free' ? row.free : p.name === 'Pro' ? row.pro : row.business;
                                    return (<td key={p.id} className={cn("text-center py-3 px-4", val === '—' ? 'text-muted-foreground/40' : 'text-green-600 font-medium')}>{val}</td>);
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
                                <p className="text-white/60 text-xs font-semibold mb-1">Current Plan</p>
                                <h2 className="text-3xl font-semibold flex items-center gap-3">
                                    {currentPlan} <Zap className="w-6 h-6 text-yellow-400 fill-yellow-400 animate-pulse" />
                                </h2>
                            </div>
                            <div className="bg-white/10 px-4 py-1.5 rounded-xl text-sm font-semibold backdrop-blur-md border border-white/20">
                                ${currentPlanPrice}/{currentInterval === 'year' ? 'yr' : 'mo'}
                            </div>
                        </div>

                        <div className="space-y-6 mb-10">
                            <div className="space-y-2 group/usage">
                                <div className="flex justify-between text-xs font-bold">
                                    <span className="text-white/70 flex items-center gap-1.5">Storage{ storagePercent > 85 && <AlertCircle className="w-3 h-3 text-orange-300 animate-pulse" /> }</span>
                                    <span className="font-semibold">{usage?.storage?.used ?? "—"} / {usage?.storage?.total ?? "—"}</span>
                                </div>
                                <div className="w-full bg-black/30 rounded-full h-2.5 p-0.5 overflow-hidden border border-white/10 relative">
                                    <AnimatedDiv initial={{ width: 0 }} animate={{ width: `${storagePercent}%` }}
                                        className={cn("h-full rounded-full transition-colors duration-500",
                                            storagePercent > 90 ? "bg-red-400 shadow-[0_0_15px_rgba(248,113,113,0.8)]" :
                                            storagePercent > 75 ? "bg-orange-400 shadow-[0_0_15px_rgba(251,146,60,0.8)]" :
                                            "bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                                        )}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-bold">
                                    <span className="text-white/70">API / Downloads</span>
                                    <span className="font-semibold">{usage?.apiCalls?.used ?? "—"} / {usage?.apiCalls?.total ?? "—"}</span>
                                </div>
                                <div className="w-full bg-black/30 rounded-full h-2.5 p-0.5 overflow-hidden border border-white/10">
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

                        <div className="flex justify-between items-center text-sm font-semibold border-t border-white/10 pt-6">
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
                <div className="md:col-span-2 bg-card/50 backdrop-blur-xl border border-border/50 rounded-[2.5rem] p-8 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-opacity">
                        <BarChart className="w-5 h-5 text-primary/20" />
                    </div>
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="font-semibold text-xl leading-none mb-1">Spending Overview</h3>
                            <p className="text-sm font-bold text-muted-foreground">Last 6 months</p>
                        </div>
                        <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-full border border-border/50 shadow-inner">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                            <span className="text-sm font-semibold text-muted-foreground">Trend 6M</span>
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
                <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-[2.5rem] p-8 shadow-sm">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="font-semibold text-xl">Authorized Methods</h3>
                            <p className="text-sm font-bold text-muted-foreground">Active payment vectors</p>
                        </div>
                        {canManageBilling && (
                            <Button variant="ghost" size="sm" onClick={() => setIsAddCardOpen(true)}
                                className="text-primary h-10 px-4 bg-primary/5 font-semibold text-sm hover:bg-primary/10 rounded-xl border border-primary/10 transition-all"
                            ><Plus size={14} className="mr-2 stroke-[3px]" /> Add Entity</Button>
                        )}
                    </div>
                    <div className="space-y-4">
                        {isLoadingMethods ? (
                            <div className="py-12 flex flex-col items-center justify-center gap-3 opacity-50">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                <span className="text-sm font-semibold text-primary">Loading payment methods...</span>
                            </div>
                        ) : paymentMethods.length === 0 ? (
                            <div className="py-16 flex flex-col items-center justify-center text-center gap-4 border-2 border-dashed border-border/50 rounded-[2rem] bg-muted/5">
                                <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground/30"><CreditCard className="w-8 h-8" /></div>
                                <div><p className="font-semibold text-sm text-muted-foreground">No Methods Found</p><p className="text-xs text-muted-foreground/60 font-medium">Connect a credit source to enable services.</p></div>
                            </div>
                        ) : (
                            paymentMethods.map((card) => (
                                <div key={card.id} className="group relative flex items-center justify-between p-6 border border-border/50 rounded-[1.75rem] bg-background/50 hover:bg-muted/10 transition-all duration-500 hover:border-primary/20 hover:scale-[1.01]">
                                    <div className="flex items-center gap-6">
                                        <div className={cn("w-16 h-10 rounded-xl flex items-center justify-center shadow-lg border relative overflow-hidden transition-all duration-500 group-hover:scale-110 group-hover:-rotate-3",
                                            (card.brand || '').toLowerCase() === 'visa' ? "bg-blue-600 border-blue-400/30" : "bg-slate-800 border-slate-600/30"
                                        )}>
                                            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent" />
                                            <span className="text-sm font-semibold text-white z-10">{card.brand}</span>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm leading-none mb-1.5 opacity-80 group-hover:opacity-100 transition-opacity">•••• •••• •••• {card.last4}</p>
                                            <div className="flex items-center gap-2">
                                                <p className="text-xs font-semibold text-muted-foreground opacity-60">Cycle {card.expiry}</p>
                                                <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                                                <p className="text-xs font-semibold text-muted-foreground opacity-60">{card.type}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {card.isDefault ? (
                                            <div className="px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 flex items-center gap-2 shadow-sm">
                                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                                <span className="text-sm font-semibold text-green-600">Primary</span>
                                            </div>
                                        ) : (
                                            canManageBilling && (
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                                                    <Button variant="ghost" size="sm" onClick={() => setDefaultMethod(card.id)} className="h-9 px-4 text-sm font-semibold text-primary hover:bg-primary/10 rounded-xl">Activate</Button>
                                                    <Button variant="ghost" size="sm" onClick={() => deleteMethod(card.id)} className="h-9 w-9 p-0 hover:bg-red-500/10 hover:text-red-500 rounded-xl text-muted-foreground"><Trash2 size={16} /></Button>
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
                <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-[2.5rem] p-8 shadow-sm">
                    <div className="flex justify-between items-center mb-8"><h3 className="font-semibold text-xl">Recent Ledger</h3></div>
                    <div className="space-y-1">
                        {isLoadingInvoices ? (
                            <div className="py-12 flex flex-col items-center justify-center opacity-50"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
                        ) : invoices.length === 0 ? (
                            <p className="text-center py-12 text-muted-foreground text-sm font-medium">No transactions recorded yet.</p>
                        ) : (
                            invoices.slice(0, 4).map((inv, i) => (
                                <div key={inv.id} className="flex items-center justify-between p-4 hover:bg-primary/[0.03] rounded-2xl transition-all cursor-pointer group animate-in fade-in slide-in-from-right-4 duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                                    <div className="flex items-center gap-5">
                                        <div className="w-11 h-11 rounded-xl bg-muted/50 flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-all group-hover:rotate-6"><FileText className="w-5 h-5" /></div>
                                        <div><p className="font-semibold text-sm">{inv.amount}</p><p className="text-sm font-bold text-muted-foreground opacity-60">{new Date(inv.createdAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}</p></div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-lg border",
                                            inv.status === 'completed' ? "bg-green-500/10 text-green-600 border-green-500/10" : "bg-orange-500/10 text-orange-600 border-orange-500/10"
                                        )}>{inv.status}</span>
                                        <button onClick={() => handleInvoiceDownload(inv)} className="p-2.5 hover:bg-muted bg-background border border-border rounded-xl text-muted-foreground hover:text-foreground transition-all shadow-sm"><Download className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Confirm Plan Change Dialog */}
            <Dialog open={isConfirmOpen} onOpenChange={(o) => { if (!o) setIsConfirmOpen(false); }}>
                <DialogContent className="sm:max-w-md rounded-[2.5rem] border-border/50">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-semibold">Switch to {selectedPlan}?</DialogTitle>
                        <DialogDescription className="text-sm">{billingInterval === 'year' ? 'Yearly' : 'Monthly'} billing — proceed to payment.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex gap-3 sm:justify-end">
                        <Button variant="ghost" onClick={() => setIsConfirmOpen(false)} className="rounded-xl">Cancel</Button>
                        <Button onClick={handlePlanChange} disabled={isUpdating} className="rounded-xl shadow-lg shadow-primary/20">
                            {isUpdating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</> : `Continue to Payment`}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Payment Dialog with Stripe Elements */}
            <Dialog open={isPaymentOpen} onOpenChange={(o) => { if (!o) { setIsPaymentOpen(false); setPaymentClientSecret(null); } }}>
                <DialogContent className="sm:max-w-md rounded-[2.5rem] border-border/50">
                    <DialogHeader>
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6"><CreditCard className="w-7 h-7 text-primary" /></div>
                        <DialogTitle className="text-2xl font-semibold">Complete Payment</DialogTitle>
                        <DialogDescription className="text-sm">Enter your card details to upgrade to {selectedPlan} ({billingInterval}ly).</DialogDescription>
                    </DialogHeader>
                    {paymentClientSecret && stripeReady ? (
                        <Elements stripe={defaultStripePromise} options={{ clientSecret: paymentClientSecret, appearance: { theme: 'night' } }}>
                            <PlanPaymentForm
                                clientSecret={paymentClientSecret}
                                plan={selectedPlan || ''}
                                interval={billingInterval}
                                onSuccess={() => { setIsPaymentOpen(false); setPaymentClientSecret(null); refetchSubscription(); }}
                                onCancel={() => { setIsPaymentOpen(false); setPaymentClientSecret(null); }}
                            />
                        </Elements>
                    ) : (
                        <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Add Card Dialog */}
            <Dialog open={isAddCardOpen} onOpenChange={(open) => { if (!open) setIsAddCardOpen(false); }}>
                <DialogContent className="sm:max-w-md rounded-[2.5rem] border-border/50">
                    <DialogHeader>
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6"><CreditCard className="w-7 h-7 text-primary" /></div>
                        <DialogTitle className="text-3xl font-semibold">Register Method</DialogTitle>
                        <DialogDescription className="text-sm">Connect a new payment method to your account via secure tokenization.</DialogDescription>
                    </DialogHeader>
                    {stripeReady === null ? (
                        <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
                    ) : stripeReady === false ? (
                        <div className="flex flex-col items-center gap-4 py-12">
                            <AlertCircle className="w-12 h-12 text-muted-foreground" />
                            <p className="text-muted-foreground text-center">Payment system is not configured.</p>
                            <Button variant="ghost" onClick={() => setIsAddCardOpen(false)} className="rounded-xl">Close</Button>
                        </div>
                    ) : (
                        <>
                            <div className="p-4 bg-green-500/5 rounded-2xl border border-green-500/20 flex items-start gap-4">
                                <Shield className="w-5 h-5 text-green-500 mt-0.5" />
                                <p className="text-sm text-muted-foreground font-medium leading-relaxed">CARD DETAILS ARE TOKENIZED VIA STRIPE ELEMENTS.</p>
                            </div>
                            <div className="py-4">
                                <Elements stripe={defaultStripePromise} options={{ appearance: { theme: 'night' } }}>
                                    <AddCardForm onSuccess={() => { setIsAddCardOpen(false); refetchPaymentMethods(); }} onCancel={() => setIsAddCardOpen(false)} />
                                </Elements>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
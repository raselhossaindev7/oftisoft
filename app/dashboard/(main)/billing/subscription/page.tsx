"use client"
import { AnimatedDiv } from "@/lib/animated";

import { Check, Zap, Shield, ArrowLeft, Loader2, Sparkles, RefreshCw, AlertCircle, Lock, CreditCard } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useSubscription } from "@/hooks/useSubscription";
import { useRole } from "@/hooks/useRole";
import { useState, useCallback, useEffect } from "react";
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
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { stripePromise as defaultStripePromise } from "@/lib/stripe";
import { systemAPI, billingAPI } from "@/lib/api";
import type { SubscriptionPlan } from "@/lib/api/domains/billing";
import { useQuery } from "@tanstack/react-query";

function PaymentForm({ clientSecret, onSuccess, onBack }: { clientSecret: string; onSuccess: (paymentIntentId: string) => void; onBack: () => void }) {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        setIsProcessing(true);
        setErrorMessage(null);

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            clientSecret,
            redirect: 'if_required',
        });

        if (error) {
            setErrorMessage(error.message || "Payment failed");
            setIsProcessing(false);
        } else if (paymentIntent?.status === 'succeeded') {
            onSuccess(paymentIntent.id);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <PaymentElement />
            {errorMessage && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-600 font-medium">
                    {errorMessage}
                </div>
            )}
            <div className="flex gap-3">
                <Button type="button" variant="ghost" className="rounded-xl flex-1" onClick={onBack} disabled={isProcessing}>
                    Back
                </Button>
                <Button type="submit" disabled={!stripe || isProcessing} className="rounded-xl flex-1 shadow-lg shadow-primary/20">
                    {isProcessing ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
                    ) : (
                        <><Lock className="w-4 h-4 mr-2" /> Pay & Upgrade</>
                    )}
                </Button>
            </div>
        </form>
    );
}

function parseFeatures(val: string): string[] {
  try { return JSON.parse(val); } catch { return val.split('\n').filter(Boolean); }
}

export default function SubscriptionPage() {
    const { subscription, isLoading, isError, updateSubscription, refetch } = useSubscription();
    const { hasPermission } = useRole();
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [stripePromise, setStripePromise] = useState<Promise<any> | null>(defaultStripePromise);
    const [stripeLoading, setStripeLoading] = useState(true);
    const [stripeError, setStripeError] = useState(false);
    const [paymentStep, setPaymentStep] = useState<'confirm' | 'pay'>('confirm');
    const [clientSecret, setClientSecret] = useState<string | null>(null);

    const { data: dbPlans, isError: isPlansError, isLoading: isPlansLoading } = useQuery({
        queryKey: ['billing-plans'],
        queryFn: () => billingAPI.getPlans(),
        staleTime: 1000 * 60 * 10,
        retry: 1,
    });

    const canManageBilling = hasPermission("billing.manage");

    useEffect(() => {
        systemAPI.getPublicConfig().then(config => {
            if (config.stripePublishableKey) {
                setStripePromise(loadStripe(config.stripePublishableKey));
            }
            setStripeLoading(false);
        }).catch(() => {
            setStripeError(true);
            setStripeLoading(false);
        });
    }, []);

    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        await refetch();
        setIsRefreshing(false);
    }, [refetch]);

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6">
                <AlertCircle className="w-16 h-16 text-red-500/80" />
                <h3 className="text-xl font-bold">Failed to load subscription</h3>
                <p className="text-muted-foreground text-sm text-center max-w-sm">Something went wrong. Please try again.</p>
                <Button onClick={handleRefresh} className="gap-2 rounded-xl">
                    <RefreshCw className="w-4 h-4" /> Retry
                </Button>
                <Link href="/dashboard/billing">
                    <Button variant="outline" className="rounded-xl">Back to Billing</Button>
                </Link>
            </div>
        );
    }

    if (isPlansError) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6">
                <AlertCircle className="w-16 h-16 text-red-500/80" />
                <h3 className="text-xl font-bold">Failed to load pricing plans</h3>
                <p className="text-muted-foreground text-sm text-center max-w-sm">Unable to retrieve available plans. Please try again later.</p>
                <Button onClick={handleRefresh} className="gap-2 rounded-xl">
                    <RefreshCw className="w-4 h-4" /> Retry
                </Button>
                <Link href="/dashboard/billing">
                    <Button variant="outline" className="rounded-xl">Back to Billing</Button>
                </Link>
            </div>
        );
    }

    const handlePlanSelect = (planName: string) => {
        if (subscription?.plan === planName) {
            toast.info(`You are already on the ${planName} plan.`);
            return;
        }
        setSelectedPlan(planName);
        setPaymentStep('confirm');
        setClientSecret(null);
        setIsConfirmOpen(true);
    };

    const handleStartPayment = async () => {
        if (!selectedPlan) return;
        try {
            const result = await updateSubscription(selectedPlan);
            if (result?.requiresPayment && result?.clientSecret) {
                setClientSecret(result.clientSecret);
                setPaymentStep('pay');
            }
        } catch {
            // error toast handled by mutation
        }
    };

    const handlePaymentSuccess = async (paymentIntentId: string) => {
        if (!selectedPlan) return;
        try {
            await updateSubscription(selectedPlan, paymentIntentId);
            toast.success(`${selectedPlan} Tier successfully deployed`, {
                description: "Your new computational capacity is now online."
            });
            setIsConfirmOpen(false);
            setSelectedPlan(null);
            setClientSecret(null);
            setPaymentStep('confirm');
        } catch {
            toast.error("Provisioning failed", {
                description: "Rolling back changes. Please try again."
            });
        }
    };

    const handleDialogClose = (open: boolean) => {
        if (!open) {
            setIsConfirmOpen(false);
            setClientSecret(null);
            setPaymentStep('confirm');
        }
    };

    const handleContactSales = async () => {
        try {
            toast.loading("Connecting to enterprise solutions architect...");
            await new Promise((resolve) => setTimeout(resolve, 1500));
            toast.dismiss();
            toast.success("Request sent! We will contact you within 2 hours.");
        } catch {
            toast.error("Connection failed. Please check your network.");
        }
    };

    const selectedPlanData = dbPlans?.find(p => p.name === selectedPlan);
    const plansToShow = dbPlans || [];

    if (isPlansLoading) {
        return (
            <div className="mx-auto py-10 space-y-12">
                <div className="flex items-center justify-center min-h-[50vh]">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto py-10 space-y-12">

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/billing" className="p-2 bg-muted/50 rounded-xl hover:bg-muted transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-semibold">System Tier</h1>
                        <p className="text-muted-foreground">Select the computational power that fits your workflow.</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing} className="rounded-xl gap-2 font-bold">
                        <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} /> Refresh
                    </Button>
                    {subscription && (
                        <div className="px-5 py-2.5 rounded-2xl bg-primary/5 border border-primary/20 flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            <span className="text-sm font-bold">Current: <span className="text-primary">{subscription.plan}</span></span>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {plansToShow.map((plan, i) => (
                    <AnimatedDiv key={plan.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={cn(
                            "relative p-8 rounded-[2.5rem] border flex flex-col transition-all duration-500 group",
                            plan.name === 'Pro' || plan.name === 'Business'
                                ? "bg-gradient-to-b from-primary/[0.05] to-card border-primary ring-2 ring-primary/20 shadow-2xl shadow-primary/10 scale-105 z-10"
                                : "bg-card border-border hover:border-primary/30 hover:shadow-xl hover:-translate-y-2",
                            subscription?.plan === plan.name && "border-green-500/50 bg-green-500/[0.02]"
                        )}
                    >
                        {(plan.name === 'Pro' || plan.name === 'Business') && (
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white px-5 py-2 rounded-full text-xs font-semibold shadow-xl flex items-center gap-2">
                                <Sparkles className="w-3.5 h-3.5 fill-white" /> Power Choice
                            </div>
                        )}

                        {subscription?.plan === plan.name && (
                            <div className="absolute top-0 right-8 -translate-y-1/2 bg-green-500 text-white px-3 py-1 rounded-lg text-sm font-semibold shadow-lg">
                                Active
                            </div>
                        )}

                        <h3 className="text-2xl font-semibold mb-2">{plan.name}</h3>
                        <p className="text-sm text-muted-foreground mb-8 h-10 leading-relaxed">{plan.description}</p>

                        <div className="flex items-baseline gap-1 mb-10">
                            <span className="text-3xl font-semibold">${plan.price}</span>
                            <span className="text-muted-foreground font-bold text-lg opacity-50">/{plan.interval === 'year' ? 'yr' : 'mo'}</span>
                        </div>

                        <div className="space-y-4 mb-10 flex-1">
                            {(typeof plan.features === 'string' ? parseFeatures(plan.features) : plan.features || []).map(feat => (
                                <div key={feat} className="flex items-center gap-3 text-sm font-medium">
                                    <div className="w-5 h-5 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                                        <Check className="w-3 h-3 stroke-[3px]" />
                                    </div>
                                    <span className="text-muted-foreground group-hover:text-foreground transition-colors">{feat}</span>
                                </div>
                            ))}
                        </div>

                        <Button
                            disabled={isLoading || subscription?.plan === plan.name || !canManageBilling}
                            onClick={() => handlePlanSelect(plan.name)}
                            className={cn(
                                "w-full h-14 rounded-2xl font-semibold text-sm transition-all duration-300",
                                plan.name === 'Pro' || plan.name === 'Business'
                                    ? "bg-primary text-white hover:bg-primary/90 shadow-xl shadow-primary/30 hover:shadow-primary/40"
                                    : "bg-muted text-foreground hover:bg-muted/80",
                                subscription?.plan === plan.name && "bg-green-500/10 text-green-600 border-2 border-green-500/20",
                                !canManageBilling && "opacity-50 cursor-not-allowed"
                            )}
                        >
                            {isLoading && selectedPlan === plan.name ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : subscription?.plan === plan.name ? (
                                "Current Tier"
                            ) : !canManageBilling ? (
                                "View Only"
                            ) : plan.name === 'Pro' || plan.name === 'Business' ? (
                                "Switch to " + plan.name
                            ) : (
                                "Select " + plan.name
                            )}
                        </Button>
                    </AnimatedDiv>
                ))}
            </div>

            <AnimatedDiv
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-card/50 backdrop-blur-xl border border-primary/20 rounded-[3rem] p-10 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-primary/5"
            >
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-primary/10 rounded-[1.5rem] flex items-center justify-center text-primary shadow-inner">
                        <Shield className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-2xl">Enterprise Infrastructure</h3>
                        <p className="text-muted-foreground font-medium max-w-md">Quantum-ready security, dedicated throughput, and global compliance for high-scale operations.</p>
                    </div>
                </div>
                <Button
                    variant="outline"
                    size="lg"
                    className="rounded-2xl h-14 px-10 font-semibold border-border/50 bg-background hover:bg-muted transition-all text-xs"
                    onClick={handleContactSales}
                >
                    Contact Fleet Support
                </Button>
            </AnimatedDiv>

            {/* Confirm Upgrade Dialog */}
            <Dialog open={isConfirmOpen} onOpenChange={handleDialogClose}>
                <DialogContent className="sm:max-w-md rounded-[2.5rem] border-border/50">
                    {paymentStep === 'pay' && clientSecret && !stripeLoading ? (
                        stripePromise ? (
                            <>
                                <DialogHeader>
                                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                                        <CreditCard className="w-7 h-7 text-primary" />
                                    </div>
                                    <DialogTitle className="text-3xl font-semibold">Enter Payment</DialogTitle>
                                    <DialogDescription className="text-lg">
                                        Complete payment to upgrade to <span className="text-primary font-bold">{selectedPlan}</span>.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="py-6">
                                    <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'night' } }}>
                                        <PaymentForm
                                            clientSecret={clientSecret}
                                            onSuccess={handlePaymentSuccess}
                                            onBack={() => setPaymentStep('confirm')}
                                        />
                                    </Elements>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center gap-4 py-12">
                                <AlertCircle className="w-12 h-12 text-muted-foreground" />
                                <p className="text-muted-foreground text-center">Stripe is not configured. Please set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.</p>
                                <Button variant="ghost" onClick={() => setIsConfirmOpen(false)} className="rounded-xl">Close</Button>
                            </div>
                        )
                    ) : paymentStep === 'pay' && stripeLoading ? (
                        <div className="flex flex-col items-center gap-4 py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            <p className="text-muted-foreground">Initializing payment system...</p>
                        </div>
                    ) : paymentStep === 'pay' && stripeError ? (
                        <div className="flex flex-col items-center gap-4 py-12">
                            <AlertCircle className="w-12 h-12 text-red-500" />
                            <p className="text-muted-foreground text-center">Failed to initialize payment system. Please try again later.</p>
                            <Button variant="ghost" onClick={() => setIsConfirmOpen(false)} className="rounded-xl">Close</Button>
                        </div>
                    ) : (
                        <>
                            <DialogHeader>
                                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                                    <Zap className="w-7 h-7 text-primary" />
                                </div>
                                <DialogTitle className="text-3xl font-semibold">Confirm Tier Upgrade</DialogTitle>
                                <DialogDescription className="text-lg">
                                    You are about to switch your computational tier to <span className="text-primary font-bold">{selectedPlan}</span>.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="py-6 space-y-4">
                                <div className="p-6 rounded-3xl bg-muted/20 border border-border/50">
                                    <p className="text-xs font-bold text-muted-foreground mb-2">UPGRADE SUMMARY</p>
                                    <div className="flex justify-between items-center bg-background p-4 rounded-2xl border border-border/50">
                                        <span className="font-bold text-muted-foreground">Monthly Billing</span>
                                        <span className="text-xl font-semibold text-primary">
                                            ${selectedPlanData?.price}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-xs text-muted-foreground px-2">
                                    Note: Subscription changes are processed immediately. Any remaining credit from your current tier will be pro-rated.
                                </p>
                            </div>
                            <DialogFooter className="gap-3 sm:gap-0">
                                <Button variant="ghost" className="rounded-xl h-auto font-bold flex-1" onClick={() => setIsConfirmOpen(false)}>
                                    Abort
                                </Button>
                                <Button
                                    className="rounded-xl h-auto px-8 font-semibold flex-1 shadow-lg shadow-primary/20"
                                    onClick={() => ['Pro', 'Business'].includes(selectedPlan || '') ? handleStartPayment() : handlePaymentSuccess('')}
                                >
                                    {['Pro', 'Business'].includes(selectedPlan || '') ? 'Proceed to Payment' : 'Confirm Upgrade'}
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>

        </div>
    );
}

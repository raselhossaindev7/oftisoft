"use client"
import { AnimatedDiv } from "@/lib/animated";
;

import { useState } from "react";
import { CreditCard, X, CheckCircle2, Lock } from "lucide-react";
import { Project } from "@/lib/api";
import { cn } from "@/lib/utils";

interface PaymentModalProps {
    project: Project;
    onClose: () => void;
    onPaymentComplete: (id: string) => void;
}

export function PaymentModal({ project, onClose, onPaymentComplete }: PaymentModalProps) {
    const [method, setMethod] = useState<"stripe" | "paypal">("stripe");
    const [processing, setProcessing] = useState(false);
    const [success, setSuccess] = useState(false);

    const handlePay = () => {
        setProcessing(true);
        // Simulate API call
        setTimeout(() => {
            setProcessing(false);
            setSuccess(true);
            onPaymentComplete(project.id);
            setTimeout(onClose, 2000);
        }, 2000);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <AnimatedDiv initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-card w-full max-w-md rounded-3xl border border-border shadow-2xl overflow-hidden"
            >
                {/* Header */}
                <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
                    <div>
                        <h3 className="text-xl font-bold">Secure Payment</h3>
                        <p className="text-xs text-muted-foreground mt-1">Project: {project.title}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors"><X size={18} /></button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    {success ? (
                        <div className="py-10 flex flex-col items-center text-center space-y-4">
                            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 mb-2">
                                <CheckCircle2 size={32} />
                            </div>
                            <h4 className="text-2xl font-bold text-green-500">Payment Successful!</h4>
                            <p className="text-muted-foreground">Thank you for your payment. A receipt has been sent to your email.</p>
                        </div>
                    ) : (
                        <>
                            <div className="flex bg-muted/50 p-1 rounded-xl">
                                <button onClick={() => setMethod("stripe")}
                                    className={cn("flex-1 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all", method === "stripe" ? "bg-white text-black shadow-sm" : "text-muted-foreground hover:text-foreground")}
                                >
                                    <CreditCard size={16} /> Credit Card
                                </button>
                                <button onClick={() => setMethod("paypal")}
                                    className={cn("flex-1 py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all", method === "paypal" ? "bg-[#003087] text-white shadow-sm" : "text-muted-foreground hover:text-foreground")}
                                >
                                    <span className="italic font-serif font-black">P</span> PayPal
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center pb-4 border-b border-border">
                                    <span className="text-muted-foreground font-medium">Total Amount</span>
                                    <span className="text-2xl font-bold">${project.budget?.toLocaleString()}</span>
                                </div>

                                {method === "stripe" && (
                                    <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handlePay(); }}>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase text-muted-foreground">Card Number</label>
                                            <div className="relative">
                                                <input placeholder="0000 0000 0000 0000" className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 font-mono text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
                                                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold uppercase text-muted-foreground">Expiry</label>
                                                <input placeholder="MM/YY" className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 font-mono text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold uppercase text-muted-foreground">CVC</label>
                                                <input placeholder="123" className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 font-mono text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
                                            </div>
                                        </div>
                                        <button disabled={processing} className="w-full py-4 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 disabled:opacity-50 flex items-center justify-center gap-2 mt-4">
                                            {processing ? "Processing..." : `Pay $${project.budget?.toLocaleString()}`}
                                        </button>
                                        <div className="flex justify-center items-center gap-2 text-micro text-muted-foreground">
                                            <Lock size={10} /> Powered by Dodo Payments
                                        </div>
                                    </form>
                                )}

                                {method === "paypal" && (
                                    <div className="text-center py-4 space-y-6">
                                        <p className="text-sm text-muted-foreground">You will be redirected to PayPal to complete your purchase securely.</p>
                                        <button onClick={handlePay}
                                            disabled={processing}
                                            className="w-full py-4 bg-[#FFC439] text-black rounded-xl font-bold hover:brightness-105 transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2"
                                        >
                                            {processing ? "Connecting..." : "Check out with PayPal"}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </AnimatedDiv>
        </div>
    );
};

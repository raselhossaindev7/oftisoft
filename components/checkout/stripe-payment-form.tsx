"use client";

import { Loader2, Lock } from "lucide-react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/use-cart";
import { toast } from "sonner";

export function StripePaymentForm({ checkoutUrl }: { checkoutUrl: string }) {
    const router = useRouter();
    const clearCart = useCart((state) => state.clearCart);

    useEffect(() => {
        clearCart();
        window.location.href = checkoutUrl;
    }, [checkoutUrl, clearCart, router]);

    return (
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground font-medium">Redirecting to secure checkout...</p>
            <p className="text-xs text-muted-foreground/60 flex items-center gap-1">
                <Lock className="w-3 h-3" /> Powered by Dodo Payments
            </p>
        </div>
    );
}

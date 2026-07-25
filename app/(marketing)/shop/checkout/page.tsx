"use client";

import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Lock, Truck, ArrowLeft, Loader2, ShoppingCart, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { billingAPI } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

export default function CheckoutPage() {
    const { items: cartItems, clearCart } = useCart();
    const [isMounted, setIsMounted] = useState(false);
    const { user } = useAuth();
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const tax = subtotal * 0.08;
    const finalTotal = subtotal + tax;

    useEffect(() => {
        if (user?.email && !email) setEmail(user.email);
        if (user?.name && !name) setName(user.name);
    }, [user?.email, user?.name]);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const handlePayNow = useCallback(async () => {
        if (!email || !email.includes("@")) {
            toast.error("Please enter a valid email address.");
            return;
        }
        setIsProcessing(true);
        const items = cartItems.map(item => ({
            productId: item.id,
            quantity: item.quantity,
        }));
        try {
            const { checkoutUrl } = await billingAPI.shopCheckout(items, email, {
                name: name || undefined,
                cancelUrl: `${window.location.origin}/shop`,
            });
            if (checkoutUrl) {
                window.location.href = checkoutUrl;
            } else {
                toast.error("Failed to start checkout. Please try again.");
                setIsProcessing(false);
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Payment setup failed. Please try again.");
            setIsProcessing(false);
        }
    }, [cartItems, email, name, finalTotal]);

    if (!isMounted) return null;

    if (cartItems.length === 0) {
        return (
            <div className="container px-4 py-24 mx-auto text-center">
                <Card className="max-w-md mx-auto border-border/50 bg-card/80 backdrop-blur-sm">
                    <CardHeader>
                        <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
                            <ShoppingCart className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <CardTitle>Your cart is empty</CardTitle>
                        <CardDescription>Add some items before checking out.</CardDescription>
                    </CardHeader>
                    <CardFooter>
                        <Button asChild className="w-full">
                            <Link href="/shop">Browse Shop</Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    return (
        <div className="container px-4 py-8 md:py-16 mx-auto ">
            <Link href="/shop" className="inline-flex items-center text-muted-foreground hover:text-primary mb-8 transition-colors text-sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Continue Shopping
            </Link>

            <div className="grid lg:grid-cols-2 gap-12">
                {/* Left: Contact Info */}
                <div className="space-y-8">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Checkout</h1>
                        <p className="text-muted-foreground">Complete your purchase securely.</p>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold">Contact Information</h2>
                        <div className="grid gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address <span className="text-destructive">*</span></Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="h-12"
                                    required
                                />
                                <p className="text-xs text-muted-foreground">We'll send your order confirmation and receipts here.</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name <span className="text-muted-foreground text-xs">(optional)</span></Label>
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="John Doe"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="h-12"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Order Summary */}
                <div>
                    <div className="lg:sticky lg:top-24 space-y-6">
                        <Card className="border-border/50 bg-card/80 backdrop-blur-md shadow-xl">
                            <CardHeader>
                                <CardTitle>Order Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-4 max-h-[250px] overflow-auto pr-2">
                                    {cartItems.map((item) => (
                                        <div key={item.id} className="flex gap-3 items-center">
                                            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted shrink-0 border border-border">
                                                {item.image ? (
                                                    <Image
                                                        src={item.image}
                                                        alt={item.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                                        <ShoppingCart className="w-4 h-4" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium text-sm truncate">{item.name}</h4>
                                                <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                                            </div>
                                            <div className="font-medium text-sm shrink-0">
                                                ${(item.price * item.quantity).toFixed(2)}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <Separator />

                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Subtotal</span>
                                        <span>${subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Tax (8%)</span>
                                        <span>${tax.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-green-500">
                                        <span className="flex items-center gap-1"><Truck className="w-3 h-3" /> Shipping</span>
                                        <span>Free</span>
                                    </div>
                                </div>

                                <Separator />

                                <div className="flex justify-between text-lg font-bold">
                                    <span>Total</span>
                                    <span className="text-primary">${finalTotal.toFixed(2)}</span>
                                </div>
                            </CardContent>
                            <CardFooter className="flex flex-col gap-3">
                                <Button
                                    onClick={handlePayNow}
                                    disabled={isProcessing || !email || !email.includes("@")}
                                    className="w-full h-12 text-lg font-bold shadow-lg shadow-primary/25 rounded-full"
                                >
                                    {isProcessing ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Redirecting to checkout...
                                        </>
                                    ) : (
                                        <>
                                            Pay ${finalTotal.toFixed(2)}
                                            <Lock className="w-4 h-4 ml-2" />
                                        </>
                                    )}
                                </Button>
                                <p className="text-xs text-muted-foreground text-center">
                                    <Lock className="w-3 h-3 inline mr-1" />
                                    Secure checkout powered by Dodo Payments
                                </p>
                            </CardFooter>
                        </Card>

                        <div className="text-center text-xs text-muted-foreground space-y-1">
                            <p>By placing this order, you agree to our <Link href="/terms" className="underline hover:text-primary">Terms</Link> and <Link href="/privacy" className="underline hover:text-primary">Privacy Policy</Link>.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

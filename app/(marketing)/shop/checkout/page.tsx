"use client";

import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Lock, Truck, ArrowLeft, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { billingAPI } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

export default function CheckoutPage() {
    const { items: cartItems } = useCart();
    const [isMounted, setIsMounted] = useState(false);
    const { user } = useAuth();
    const [email, setEmail] = useState(user?.email ?? "");
    const [isProcessing, setIsProcessing] = useState(false);

    const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const tax = subtotal * 0.08;
    const finalTotal = subtotal + tax;

    useEffect(() => {
        if (user?.email && !email) {
            setEmail(user.email);
        }
    }, [user?.email]);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const handlePayNow = useCallback(async () => {
        if (!email) {
            toast.error("Please enter your email address.");
            return;
        }
        setIsProcessing(true);
        const items = cartItems.map(item => ({
            productId: item.id,
            productName: item.name,
            price: item.price,
            quantity: item.quantity,
            licenseType: item.licenseType || 'regular',
        }));
        try {
            const { url } = await billingAPI.createCheckoutSession(finalTotal, 'usd', items);
            if (url) {
                window.location.href = url;
            } else {
                toast.error("Failed to start checkout. Please try again.");
                setIsProcessing(false);
            }
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Payment setup failed. Please try again.");
            setIsProcessing(false);
        }
    }, [finalTotal, email]);

    if (!isMounted) return null;

    if (cartItems.length === 0) {
        return (
            <div className="container px-4 py-24 mx-auto text-center">
                <Card className="max-w-md mx-auto border-border/50 bg-card/80 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle>Cart is Empty</CardTitle>
                        <CardDescription>You need to add items before checking out.</CardDescription>
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
        <>
            {isProcessing && (
                <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
                    <Loader2 className="w-12 h-12 animate-spin text-primary" />
                    <p className="mt-4 text-lg font-medium text-muted-foreground">Redirecting to Stripe...</p>
                </div>
            )}
        <div className="container px-4 py-8 md:py-16 mx-auto">
            <Link href="/shop/cart" className="inline-flex items-center text-muted-foreground hover:text-primary mb-8 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Cart
            </Link>

            <div className="grid lg:grid-cols-2 gap-12">
                {/* Checkout Form */}
                <div className="space-y-8">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Checkout</h1>
                        <p className="text-muted-foreground">Complete your purchase securely.</p>
                    </div>

                    <div className="space-y-8">
                        {/* Contact Info */}
                        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle>Contact Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Order Summary */}
                <div className="lg:sticky lg:top-24 h-fit space-y-6">
                    <Card className="border-primary/10 bg-card/80 backdrop-blur-md shadow-2xl">
                        <CardHeader>
                            <CardTitle>Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4 max-h-[300px] overflow-auto pr-2">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="flex gap-4">
                                        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted shrink-0 border border-border">
                                            <Image 
                                                src={item.image ?? null} 
                                                alt={item.name} 
                                                fill 
                                                className="object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium text-sm truncate">{item.name}</h4>
                                            <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                                        </div>
                                        <div className="font-medium text-sm">
                                            ${(item.price * item.quantity).toFixed(2)}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Separator />

                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>${subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Tax (8%)</span>
                                    <span>${tax.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm text-green-500 font-medium">
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
                            <Button onClick={handlePayNow} disabled={isProcessing || !email}
                                className="w-full h-12 text-lg font-bold shadow-lg shadow-primary/25 rounded-full"
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Redirecting to Stripe...
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
                                Payments are secure and encrypted by Stripe
                            </p>
                        </CardFooter>
                    </Card>

                    <div className="text-center text-xs text-muted-foreground space-y-2">
                        <p>By placing this order, you agree to our <Link href="/terms" className="underline hover:text-primary">Terms of Service</Link> and <Link href="/privacy" className="underline hover:text-primary">Privacy Policy</Link>.</p>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
}


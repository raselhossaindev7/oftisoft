"use client"
import { AnimatedDiv } from "@/lib/animated";

import { useShopContentStore } from "@/lib/store/shop-content";
import type { Bundle } from "@/lib/store/shop-content";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, ArrowRight, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { useCart } from "@/hooks/use-cart";
interface BundleDealsProps {
    bundles?: Bundle[];
}

export function BundleDeals({ bundles: bundlesProp }: BundleDealsProps = {}) {
    const { content } = useShopContentStore();
    const bundles = bundlesProp ?? content?.bundles ?? [];
    const { addItem } = useCart();

    const handleAddBundle = (bundle: Bundle) => {
        addItem({
            id: `bundle-${bundle.id}`,
            name: bundle.name,
            price: bundle.price,
            image: bundle.image || '',
            slug: `bundle-${bundle.id}`,
            type: 'product'
        });
        toast.success('Bundle added to cart!');
    };

    return (
        <section className="py-24 bg-secondary/10">
            <div className="container px-4 mx-auto">
                <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-16">
                    <div className="max-w-2xl">
                        <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20 mb-4 px-4 py-1.5 font-semibold text-xs">
                            Limited Time Offer
                        </Badge>
                        <h2 className="text-4xl md:text-6xl font-semibold mb-6">Stack & Save</h2>
                        <p className="text-muted-foreground text-xl">Get our most popular assets bundled together for a massive discount. Perfect for enterprise-ready production apps.</p>
                    </div>
                    <Button variant="ghost" className="hidden md:flex gap-2 text-primary font-bold" asChild>
                        <Link href="/shop">
                            View All Bundles <ArrowRight className="w-4 h-4" />
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-8">
                    {bundles.map((bundle) => (
                        <AnimatedDiv key={bundle.id}
                            initial={{ opacity: 0, scale: 0.98 }}
                            style={{ willChange: "transform, opacity" }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                        >
                            <Card className="border-primary/20 bg-gradient-to-r from-background via-primary/5 to-background overflow-hidden relative group">
                                <CardContent className="p-0">
                                    <div className="flex flex-col lg:flex-row items-center">
                                        <div className="relative w-full lg:w-[400px] aspect-[16/10] overflow-hidden shrink-0">
                                            <Image src={bundle.image} alt={bundle.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent flex items-end p-8 lg:hidden">
                                                 <h3 className="text-2xl font-semibold">{bundle.name}</h3>
                                            </div>
                                        </div>
                                        
                                        <div className="p-8 lg:p-12 flex-1 space-y-6">
                                            <div className="hidden lg:block">
                                                 <div className="flex gap-2 mb-4">
                                                    {bundle.tags.map(tag => (
                                                        <Badge key={tag} className="bg-primary/10 text-primary border-primary/20">{tag}</Badge>
                                                    ))}
                                                 </div>
                                                 <h3 className="text-3xl font-semibold mb-4">{bundle.name}</h3>
                                            </div>
                                            
                                            <p className="text-muted-foreground text-lg leading-relaxed">{bundle.description}</p>
                                            
                                            <div className="flex items-center gap-8">
                                                <div className="space-y-1">
                                                    <p className="text-sm text-muted-foreground line-through">${bundle.originalPrice}</p>
                                                    <p className="text-4xl font-semibold text-primary">${bundle.price}</p>
                                                </div>
                                                <Button size="lg" className="rounded-full h-14 px-8 font-bold text-lg gap-2 shadow-xl shadow-primary/30" onClick={() => handleAddBundle(bundle)}>
                                                    <ShoppingCart className="w-5 h-5" />
                                                    Grab the Bundle
                                                </Button>
                                            </div>

                                            <p className="text-xs text-muted-foreground flex items-center gap-2">
                                                <Sparkles className="w-3 h-3 text-orange-500" />
                                                Includes {bundle.products.length} premium products with separate update streams.
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </AnimatedDiv>
                    ))}
                </div>
            </div>
        </section>
    );
}

"use client";

import { useMemo } from "react";
import { usePublicProducts, mapApiProductsToShop } from "@/hooks/usePublicMarketing";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Check, ShoppingCart, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/hooks/use-cart";

export default function ComparisonPage() {
    const { data: apiProducts = [], isLoading } = usePublicProducts();
    const products = useMemo(() => mapApiProductsToShop(apiProducts), [apiProducts]);
    // Compare up to 3 products from the API
  const compareItems = products.slice(0, 3);
    const cart = useCart();

    if (isLoading) {
        return (
            <div className="container px-4 py-16 mx-auto">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-muted-foreground">Loading products for comparison...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (compareItems.length === 0) {
        return (
            <div className="container px-4 py-16 mx-auto">
                <Button asChild variant="ghost" className="mb-4 -ml-4 gap-2">
                    <Link href="/shop"><ArrowLeft className="w-4 h-4" /> Back to Shop</Link>
                </Button>
                <div className="text-center py-20">
                    <h1 className="text-4xl font-semibold tracking-tighter mb-4">Compare Products</h1>
                    <p className="text-muted-foreground text-lg mb-8">No products available to compare.</p>
                    <Button asChild>
                        <Link href="/shop">Browse Shop</Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container px-4 py-16 mx-auto">
            <div className="mb-12">
                <Button asChild variant="ghost" className="mb-4 -ml-4 gap-2">
                    <Link href="/shop"><ArrowLeft className="w-4 h-4" /> Back to Shop</Link>
                </Button>
                <h1 className="text-4xl md:text-6xl font-semibold tracking-tighter">Compare Products</h1>
                <p className="text-muted-foreground text-lg">Compare features side-by-side to make the best choice for your project.</p>
            </div>

            <div className="overflow-x-auto rounded-[2rem] border border-border bg-card/30 backdrop-blur-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent border-border/50">
                            <TableHead className="w-[200px] font-semibold text-xs">Features</TableHead>
                            {compareItems.map(product => (
                                <TableHead key={product.id} className="min-w-[250px] p-6">
                                    <div className="space-y-4">
                                        <div className="relative aspect-video rounded-xl overflow-hidden border border-border">
                                            <Image src={product.image} alt={product.name} fill className="object-cover" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-base leading-tight mb-1">{product.name}</h3>
                                            <p className="text-2xl font-semibold text-primary">${product.price}</p>
                                        </div>
                                        <Button className="w-full rounded-xl gap-2 h-10"
                                            onClick={() => cart.addItem({
                                                id: product.id,
                                                name: product.name,
                                                price: product.price,
                                                image: product.image,
                                                slug: product.slug,
                                                type: 'service'
                                            })}
                                        >
                                            <ShoppingCart className="w-4 h-4" />
                                            Add to Cart
                                        </Button>
                                    </div>
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow className="border-border/50 hover:bg-primary/5">
                            <TableCell className="font-bold py-6 px-4">Category</TableCell>
                            {compareItems.map(p => (
                                <TableCell key={p.id} className="py-6 px-6">
                                    <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/10 whitespace-nowrap">
                                        {p.category}
                                    </Badge>
                                </TableCell>
                            ))}
                        </TableRow>
                        <TableRow className="border-border/50 hover:bg-primary/5">
                            <TableCell className="font-bold py-6 px-4">License (Regular)</TableCell>
                            {compareItems.map(p => (
                                <TableCell key={p.id} className="py-6 px-6 text-sm">
                                    ${p.licenseRegular}
                                </TableCell>
                            ))}
                        </TableRow>
                        <TableRow className="border-border/50 hover:bg-primary/5">
                            <TableCell className="font-bold py-6 px-4">License (Extended)</TableCell>
                            {compareItems.map(p => (
                                <TableCell key={p.id} className="py-6 px-6 text-sm">
                                    ${p.licenseExtended}
                                </TableCell>
                            ))}
                        </TableRow>
                        <TableRow className="border-border/50 hover:bg-primary/5">
                            <TableCell className="font-bold py-6 px-4">Updates</TableCell>
                            {compareItems.map(p => (
                                <TableCell key={p.id} className="py-6 px-6 text-sm">
                                    {p.updatePolicy}
                                </TableCell>
                            ))}
                        </TableRow>
                        <TableRow className="border-border/50 hover:bg-primary/5">
                            <TableCell className="font-bold py-6 px-4">Responsive</TableCell>
                            {compareItems.map(p => (
                                <TableCell key={p.id} className="py-6 px-6 text-sm">
                                    <Check className="w-5 h-5 text-green-500" />
                                </TableCell>
                            ))}
                        </TableRow>
                        <TableRow className="border-border/50 hover:bg-primary/5">
                            <TableCell className="font-bold py-6 px-4">Compatibility</TableCell>
                            {compareItems.map(p => (
                                <TableCell key={p.id} className="py-6 px-6">
                                    <div className="flex flex-wrap gap-1">
                                        {p.compatibility.slice(0, 3).map(c => (
                                            <span key={c} className="text-xs bg-muted px-2 py-0.5 rounded border border-border">{c}</span>
                                        ))}
                                    </div>
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
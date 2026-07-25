"use client"
import { AnimatedDiv } from "@/lib/animated";

import { useState, useEffect, useMemo } from "react";
import {
    Heart,
    Bell,
    ArrowRightLeft,
    ShoppingCart,
    Trash2,
    TrendingDown,
    Star,
    Search,
    X,
    ShieldCheck,
    Loader2,
    Package,
    Plus,
    RefreshCw
} from "lucide-react";
import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Link from "next/link";

import { useFavorites } from "@/hooks/useFavorites";

const COMPARE_KEY = "favorites_compare";

function loadCompareList(): string[] {
    if (typeof window === "undefined") return [];
    try {
        const saved = localStorage.getItem(COMPARE_KEY);
        return saved ? JSON.parse(saved) : [];
    } catch {
        return [];
    }
}

function ProductSkeleton() {
    return (
        <div className="border border-border/50 bg-card/50 rounded-[32px] overflow-hidden animate-pulse">
            <div className="aspect-video bg-muted" />
            <div className="p-6 space-y-4">
                <div className="h-4 w-20 bg-muted rounded" />
                <div className="h-5 w-40 bg-muted rounded" />
                <div className="flex justify-between">
                    <div className="h-7 w-16 bg-muted rounded" />
                    <div className="h-5 w-16 bg-muted rounded-full" />
                </div>
            </div>
            <div className="px-6 pb-6 space-y-2">
                <div className="h-11 w-full bg-muted rounded-xl" />
                <div className="h-11 w-full bg-muted rounded-xl" />
            </div>
        </div>
    );
}

export default function FavoritesPage() {
    const { favorites, isLoading, isLoadingMore, error, isError, refresh, removeFromFavorites, loadMore, hasMore } = useFavorites();
    const [compareList, setCompareList] = useState<string[]>(loadCompareList);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState("saved");

    useEffect(() => {
        localStorage.setItem(COMPARE_KEY, JSON.stringify(compareList));
    }, [compareList]);

    const toggleCompare = (id: string) => {
        if (compareList.includes(id)) {
            setCompareList(prev => prev.filter(i => i !== id));
        } else {
            if (compareList.length >= 3) {
                toast.warning("You can compare up to 3 items at a time.");
                return;
            }
            setCompareList(prev => [...prev, id]);
            toast.success("Added to comparison");
        }
    };

    const filteredFavorites = useMemo(() =>
        (favorites || []).filter(p =>
            (p.name || '').toLowerCase().includes(searchQuery.toLowerCase())
        ),
        [favorites, searchQuery]
    );

    const productsToCompare = favorites.filter(p => compareList.includes(p.id));

    return (
        <div className="space-y-8 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-semibold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                        My Favorites
                    </h1>
                    <p className="text-muted-foreground font-medium mt-1">Products you've saved for quick access.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button
                        variant="outline"
                        className="rounded-xl gap-2 font-bold h-11 border-border/50 bg-card/50 backdrop-blur-sm"
                        onClick={refresh}
                        disabled={isLoading}
                    >
                        <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} /> Refresh
                    </Button>
                    <Button
                        variant="outline"
                        className="rounded-xl gap-2 font-bold h-11 border-border/50 bg-card/50 backdrop-blur-sm"
                        onClick={() => setActiveTab("alerts")}
                    >
                        <Bell className="w-4 h-4" /> Price Alerts
                    </Button>
                    <Link href="/shop" passHref>
                        <Button className="rounded-xl gap-2 font-bold h-11 bg-primary text-white shadow-lg shadow-primary/20">
                            Browse Shop
                        </Button>
                    </Link>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="bg-muted/50 p-1 rounded-2xl h-14 w-fit border border-border">
                    <TabsTrigger value="saved" className="rounded-xl h-auto gap-2 data-[state=active]:bg-background data-[state=active]:shadow-md font-bold px-8">
                        <Heart className="w-4 h-4" /> Saved Items
                    </TabsTrigger>
                    <TabsTrigger value="comparison" className="rounded-xl h-auto gap-2 data-[state=active]:bg-background data-[state=active]:shadow-md font-bold px-8">
                        <ArrowRightLeft className="w-4 h-4" /> Compare
                        {compareList.length > 0 && <Badge className="ml-2 h-5 min-w-5 px-1 bg-primary text-white border-none">{compareList.length}</Badge>}
                    </TabsTrigger>
                    <TabsTrigger value="alerts" className="rounded-xl h-auto gap-2 data-[state=active]:bg-background data-[state=active]:shadow-md font-bold px-8">
                        <TrendingDown className="w-4 h-4" /> Price Drops
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="saved" className="space-y-6">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="relative max-w-md w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search favorites..."
                                className="pl-11 h-auto rounded-2xl bg-card/50 border-border/50 focus:ring-primary/20 transition-all shadow-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {isError ? (
                        <div className="py-16 flex flex-col items-center justify-center gap-6 rounded-[40px] border-2 border-dashed border-destructive/30 bg-destructive/5 p-12">
                            <p className="font-semibold text-destructive text-center max-w-md">Failed to load favorites. {error || "Please try again."}</p>
                            <Button onClick={refresh} variant="outline" className="rounded-2xl font-semibold" size="lg">Retry</Button>
                        </div>
                    ) : isLoading && favorites.length === 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {Array.from({ length: 4 }).map((_, i) => <ProductSkeleton key={i} />)}
                        </div>
                    ) : (
                    <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {filteredFavorites.map((product) => (
                            <div key={product.id} className="group">
                                <Card className="border-border/50 bg-card/50 backdrop-blur-md overflow-hidden hover:border-primary/30 transition-all rounded-[32px] h-full flex flex-col shadow-sm">
                                    <div className="relative aspect-video overflow-hidden group/img bg-muted">
                                        {product.image ? (
                                            <Image
                                                src={product.image}
                                                alt={product.name}
                                                fill
                                                className="object-cover group-hover/img:scale-110 transition-transform duration-700"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-muted-foreground"><Package className="w-12 h-12" /></div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity duration-500" />
                                        <button
                                            onClick={() => removeFromFavorites(product.id)}
                                            className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-background/80 backdrop-blur-md flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-lg"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end translate-y-full group-hover/img:translate-y-0 transition-transform duration-500">
                                            <Badge className="bg-primary/90 text-white border-none font-semibold ">{Number(product.rating) || 0} <Star className="w-3 h-3 ml-1 fill-white" /></Badge>
                                        </div>
                                    </div>
                                    <CardContent className="p-6 flex-1 space-y-4">
                                        <div>
                                            <p className="text-sm font-semibold text-primary mb-1">{product.category}</p>
                                            <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors">{product.name}</h3>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <p className="text-2xl font-semibold ">${Number(product.price) || 0}</p>
                                            <Badge variant="outline" className="text-xs font-bold border-green-500/30 text-green-500 bg-green-500/5">In Stock</Badge>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="px-6 pb-6 pt-0 flex flex-col gap-2">
                                        <Button
                                            className="w-full rounded-xl bg-primary text-white font-bold h-11 gap-2 shadow-lg shadow-primary/20"
                                            asChild
                                        >
                                            <Link href={`/shop${product.slug ? `?highlight=${product.id}` : ""}`}>
                                                <ShoppingCart className="w-4 h-4" /> View Product
                                            </Link>
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className={cn("w-full rounded-xl h-11 gap-2 font-bold border-border/50",
                                                compareList.includes(product.id) ? "bg-primary/10 border-primary text-primary" : "bg-card/50"
                                            )}
                                            onClick={() => toggleCompare(product.id)}
                                        >
                                            <ArrowRightLeft className="w-4 h-4" /> {compareList.includes(product.id) ? "In Comparison" : "Compare"}
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </div>
                        ))}
                    </div>

                    {hasMore && filteredFavorites.length > 0 && (
                        <div className="flex justify-center pt-4">
                            <Button
                                variant="outline"
                                className="rounded-xl px-8 h-11 font-bold gap-2"
                                onClick={loadMore}
                                disabled={isLoadingMore}
                            >
                                {isLoadingMore ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                                Load More
                            </Button>
                        </div>
                    )}

                    {filteredFavorites.length === 0 && !isLoading && (
                        <div className="py-20 text-center space-y-4 bg-muted/20 rounded-[40px] border-2 border-dashed border-border/50">
                            <Heart className="w-16 h-16 text-muted-foreground mx-auto opacity-20" />
                            <div className="space-y-1">
                                <h3 className="text-xl font-semibold ">No Favorites Yet</h3>
                                <p className="text-muted-foreground text-sm font-medium">Browse the shop and save products you like.</p>
                            </div>
                            <Button className="rounded-xl bg-primary font-bold" asChild>
                                <Link href="/shop">Go to Shop</Link>
                            </Button>
                        </div>
                    )}
                    </>
                    )}
                </TabsContent>

                <TabsContent value="comparison" className="space-y-8">
                    {compareList.length > 0 ? (
                        <div className="overflow-x-auto pb-4 custom-scrollbar">
                            <div className="min-w-[800px] grid grid-cols-4 gap-4">
                                <div className="p-8 flex flex-col justify-end space-y-4">
                                    <h4 className="text-sm font-semibold text-muted-foreground border-l-4 border-primary pl-4">Specifications</h4>
                                    <div className="space-y-8 py-10">
                                        <p className="text-xs font-semibold text-muted-foreground">Category</p>
                                        <p className="text-xs font-semibold text-muted-foreground">Price</p>
                                        <p className="text-xs font-semibold text-muted-foreground">Tags</p>
                                        <p className="text-xs font-semibold text-muted-foreground">Version</p>
                                        <p className="text-xs font-semibold text-muted-foreground">Update Policy</p>
                                    </div>
                                </div>

                                {productsToCompare.map((p) => (
                                    <Card key={p.id} className="border-border/50 bg-card/60 backdrop-blur-md overflow-hidden rounded-[40px] shadow-lg">
                                        <div className="p-6 space-y-6">
                                            <div className="relative aspect-square rounded-3xl overflow-hidden border border-border/50 group bg-muted">
                                                {p.image ? (
                                                    <Image src={p.image} alt={p.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground"><Package className="w-16 h-16" /></div>
                                                )}
                                                <button
                                                    onClick={() => toggleCompare(p.id)}
                                                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-background/80 flex items-center justify-center text-muted-foreground hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <div className="text-center h-16 flex flex-col justify-center">
                                                <h5 className="font-semibold text-lg leading-tight line-clamp-2">{p.name}</h5>
                                            </div>

                                            <div className="space-y-8 py-4 text-center border-t border-border/30">
                                                <p className="text-xs font-bold truncate px-2">{p.category}</p>
                                                <p className="text-xl font-semibold ">${Number(p.price) || 0}</p>
                                                <div className="flex flex-wrap justify-center gap-1">
                                                    {Array.isArray(p.tags) && p.tags.slice(0, 2).map((t: string, i: number) => (
                                                        <Badge key={i} variant="outline" className="text-xs border-primary/20 text-primary font-semibold ">{t}</Badge>
                                                    ))}
                                                </div>
                                                <p className="text-xs font-bold text-muted-foreground">{p.version || "\u2014"}</p>
                                                <p className="text-sm font-semibold leading-tight opacity-70 px-4">{p.updatePolicy || "\u2014"}</p>
                                            </div>

                                            <Button className="w-full rounded-2xl h-auto bg-primary text-white font-semibold shadow-lg shadow-primary/20" asChild>
                                                <Link href={`/shop${p.slug ? `?highlight=${p.id}` : ""}`}>View Product</Link>
                                            </Button>
                                        </div>
                                    </Card>
                                ))}

                                {compareList.length < 3 && (
                                    <div className="border-2 border-dashed border-border/50 rounded-[40px] bg-muted/10 flex flex-col items-center justify-center p-8 text-center space-y-4 group cursor-default">
                                        <div className="w-16 h-16 rounded-full bg-background flex items-center justify-center text-muted-foreground">
                                            <Plus className="w-8 h-8 opacity-20" />
                                        </div>
                                        <p className="text-sm font-semibold text-muted-foreground">Add items from Saved Items to compare</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="py-20 text-center space-y-4 bg-muted/20 rounded-[40px] border-2 border-dashed border-border/50">
                            <ArrowRightLeft className="w-16 h-16 text-muted-foreground mx-auto opacity-20" />
                            <div className="space-y-1">
                                <h3 className="text-xl font-semibold ">Nothing to Compare</h3>
                                <p className="text-muted-foreground text-sm font-medium">Select up to 3 products from your favorites to compare side by side.</p>
                            </div>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="alerts" className="space-y-6">
                    <div className="grid gap-4 max-w-4xl">
                        {favorites.length > 0 ? (
                            <>
                                <p className="text-sm text-muted-foreground font-medium">Price-drop alerts are coming soon. You'll be notified here when a product's price changes.</p>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    {favorites.slice(0, 6).map((p) => (
                                        <Card key={p.id} className="border-border/50 overflow-hidden rounded-[24px] p-6 flex flex-row gap-4 items-center">
                                            <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-muted shrink-0">
                                                {p.image ? (
                                                    <Image src={p.image} alt={p.name} fill className="object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground"><Package className="w-8 h-8" /></div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-semibold text-base truncate">{p.name}</h4>
                                                <p className="text-lg font-semibold text-primary">${Number(p.price) || 0}</p>
                                            </div>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="rounded-xl border-orange-500/20 text-orange-600 shrink-0"
                                                onClick={() => toast.info("Price-drop alerts are coming soon.")}
                                            >
                                                Notify Me
                                            </Button>
                                        </Card>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="py-16 text-center space-y-4 bg-muted/20 rounded-[40px] border-2 border-dashed border-border/50">
                                <TrendingDown className="w-14 h-14 text-muted-foreground mx-auto opacity-30" />
                                <h3 className="text-xl font-semibold ">No Favorites Yet</h3>
                                <p className="text-muted-foreground text-sm font-medium max-w-md mx-auto">Add products to your favorites first. Price-drop alerts will appear here once available.</p>
                                <Button className="rounded-xl bg-primary font-bold" asChild>
                                    <Link href="/shop">Go to Shop</Link>
                                </Button>
                            </div>
                        )}

                        <div className="p-10 rounded-[40px] bg-primary/5 border border-border/50 relative overflow-hidden">
                            <div className="flex items-center gap-8">
                                <div className="w-16 h-16 rounded-[24px] bg-background border border-border/50 flex items-center justify-center text-primary shadow-xl shrink-0">
                                    <ShieldCheck className="w-8 h-8" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-lg">Coming Soon</h4>
                                    <p className="text-xs text-muted-foreground font-medium leading-relaxed max-w-lg mt-1">
                                        Price-drop alerts are not yet available. We'll notify you when this feature launches.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
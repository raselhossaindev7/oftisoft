"use client"
import { AnimatedDiv, AnimatePresence } from "@/lib/animated";
import { useState, use, useMemo } from "react";
import { toast } from "sonner";
import { useCart } from "@/hooks/use-cart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductCard } from "@/components/sections/shop/product-card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
    Check, 
    ShieldCheck, 
    Star, 
    ShoppingCart, 
    ExternalLink, 
    BookOpen, 
    Award, 
    Info, 
    MessageSquare,
    ChevronRight,
    Play,
    Clock
} from "lucide-react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { useShopContentStore } from "@/lib/store/shop-content";
import { usePublicProducts, mapApiProductsToShop } from "@/hooks/usePublicMarketing";
import { useProductReviews } from "@/hooks/usePublicMarketing";
import Link from 'next/link';

export default function ProductDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const { content } = useShopContentStore();
    const { data: apiProducts = [] } = usePublicProducts();
    const apiMapped = useMemo(() => mapApiProductsToShop(apiProducts), [apiProducts]);
    const products = apiMapped.length > 0 ? apiMapped : (content?.products || []);
    const product = products.find(p => p.slug === slug);
    const productId = product?.id ?? "";
    const { data: productReviews = [] } = useProductReviews(productId);

    const reviewDistribution = useMemo(() => {
        const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        productReviews.forEach((r: { rating: number }) => {
            const star = Math.round(r.rating);
            if (star >= 1 && star <= 5) dist[star as keyof typeof dist]++;
        });
        const total = productReviews.length;
        if (total === 0) return dist;
        const percentages: Record<number, number> = {};
        for (const key of Object.keys(dist)) {
            const k = Number(key) as keyof typeof dist;
            percentages[k] = Math.round((dist[k] / total) * 100);
        }
        return percentages;
    }, [productReviews]);
    const [selectedLicense, setSelectedLicense] = useState<'regular' | 'extended'>('regular');
    const [activeScreenshot, setActiveScreenshot] = useState(0);

    if (!product) {
        return notFound();
    }

    if (!product) return null;

    const cart = useCart();
    const handleAddToCart = () => {
        cart.addItem({
            id: product.id,
            name: product.name,
            slug: product.slug,
            price: selectedLicense === 'regular' ? product.licenseRegular : product.licenseExtended,
            image: product.image,
        });
        toast.success("Added to cart!");
    };

    const relatedProducts = products.filter(p => p.id !== product.id).slice(0, 3);
    const allScreenshots = [product.image, ...product.screenshots];

    return (
        <div className="container px-4 py-8 md:py-16 mx-auto max-w-7xl">
            {/* Breadcrumb - Optional but good for UX */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
                <Link href="/shop" className="hover:text-primary transition-colors">Shop</Link>
                <ChevronRight className="w-3 h-3" />
                <span className="text-foreground font-medium">{product.name}</span>
            </div>

            <div className="grid lg:grid-cols-12 gap-12 mb-20">
                {/* Left Column: Gallery & Content (8 cols) */}
                <div className="lg:col-span-8 space-y-12">
                    {/* Gallery Section */}
                    <div className="space-y-4">
                        <AnimatedDiv 
                            layoutId={`img-${product.id}`}
                            className="relative aspect-[16/10] rounded-3xl overflow-hidden border border-border bg-muted/30 shadow-2xl"
                        >
                            <AnimatePresence mode="wait">
                                <AnimatedDiv key={activeScreenshot}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="absolute inset-0"
                                >
                                    <Image src={allScreenshots[activeScreenshot] ?? ""}
                                        alt={product.name}
                                        fill className="object-cover"
                                        priority
                                    />
                                </AnimatedDiv>
                            </AnimatePresence>
                            
                            {/* Overlay Controls */}
                            <div className="absolute bottom-6 right-6 flex gap-3">
                                {product.demoUrl !== "#" && (
                                    <Button asChild className="rounded-full bg-background/80 backdrop-blur-md text-foreground hover:bg-background shadow-lg pr-6">
                                        <a href={product.demoUrl} target="_blank" rel="noopener noreferrer">
                                            <Play className="w-4 h-4 mr-2 fill-current" />
                                            Live Demo
                                        </a>
                                    </Button>
                                )}
                            </div>
                        </AnimatedDiv>

                        <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                            {allScreenshots.map((img, i) => (
                                <button key={i}
                                    onClick={() => setActiveScreenshot(i)}
                                    className={`relative flex-shrink-0 w-24 aspect-[16/10] rounded-xl overflow-hidden border-2 transition-all ${
                                        activeScreenshot === i ? "border-primary ring-2 ring-primary/20 scale-105" : "border-transparent opacity-60 hover:opacity-100"
                                    }`}
                                >
                                    <Image src={img} alt={`Screenshot ${i + 1}`} fill className="object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Detailed Content Tabs */}
                    <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="w-full justify-start h-12 bg-transparent border-b border-border p-0 gap-8">
                            <TabsTrigger value="overview" className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 font-bold">Overview</TabsTrigger>
                            <TabsTrigger value="features" className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 font-bold">Features</TabsTrigger>
                            <TabsTrigger value="docs" className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 font-bold">Docs</TabsTrigger>
                            <TabsTrigger value="faq" className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 font-bold">FAQ</TabsTrigger>
                            <TabsTrigger value="reviews" className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 font-bold">Reviews</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="pt-8 prose prose-gray dark:prose-invert max-w-none">
                            <h3 className="text-2xl font-bold mb-4">Product Overview</h3>
                            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                                {product.description} This solution is engineered to high standards, focus on performance, scalability, and ease of use. Whether you are a solo developer or an enterprise team, this kit provides everything you need to hit the ground running.
                            </p>
                            
                            <div className="grid md:grid-cols-2 gap-6 not-prose">
                                <Card className="bg-primary/5 border-primary/10">
                                    <CardContent className="p-6 space-y-3">
                                        <Award className="w-8 h-8 text-primary" />
                                        <h4 className="font-bold">Premium Quality</h4>
                                        <p className="text-sm text-muted-foreground">Highest coding standards with full type safety and documentation.</p>
                                    </CardContent>
                                </Card>
                                <Card className="bg-purple-500/5 border-purple-500/10">
                                    <CardContent className="p-6 space-y-3">
                                        <Clock className="w-8 h-8 text-purple-500" />
                                        <h4 className="font-bold">Constant Updates</h4>
                                        <p className="text-sm text-muted-foreground">Regular bug fixes and feature additions based on feedback.</p>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="features" className="pt-8">
                            <h3 className="text-2xl font-bold mb-6">Key Features</h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                {product.features.map((feature, i) => (
                                    <div key={i} className="flex gap-4 p-4 rounded-2xl bg-muted/30 border border-border/50">
                                        <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                                            <Check className="w-4 h-4 text-green-500" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm mb-1">{feature}</p>
                                            <p className="text-xs text-muted-foreground">Optimized for performance and accessibility using industry best practices.</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="docs" className="pt-8">
                            <div className="text-center py-12 px-6 rounded-3xl bg-secondary/20 border border-dashed border-border">
                                <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-xl font-bold mb-2">Technical Documentation</h3>
                                <p className="text-muted-foreground mb-8 max-w-sm mx-auto">Access our comprehensive guide for setup, configuration, and advanced customization.</p>
                                <Button asChild size="lg" className="rounded-full gap-2">
                                    <a href={product.docUrl} target="_blank" rel="noopener noreferrer">
                                        Open Docs
                                        <ExternalLink className="w-4 h-4" />
                                    </a>
                                </Button>
                            </div>
                        </TabsContent>

                        <TabsContent value="faq" className="pt-8">
                            <Accordion type="single" collapsible className="w-full">
                                {product.faqs.length > 0 ? product.faqs.map((faq, i) => (
                                    <AccordionItem key={i} value={`item-${i}`} className="border-b border-border/50">
                                        <AccordionTrigger className="text-left font-bold py-5 hover:text-primary transition-colors">{faq.question}</AccordionTrigger>
                                        <AccordionContent className="text-muted-foreground leading-relaxed pb-6">
                                            {faq.answer}
                                        </AccordionContent>
                                    </AccordionItem>
                                )) : (
                                    <p className="text-muted-foreground">No FAQs currently available for this product.</p>
                                )}
                            </Accordion>
                        </TabsContent>

                        <TabsContent value="reviews" className="pt-8">
                            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start mb-12 bg-muted/20 p-8 rounded-3xl border border-border/50">
                                <div className="text-center md:w-1/3">
                                    <span className="text-6xl font-bold text-primary">{product.rating}</span>
                                    <div className="flex justify-center text-yellow-500 my-2">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={`w-5 h-5 ${i < Math.floor(product.rating) ? "fill-current" : ""}`} />
                                        ))}
                                    </div>
                                    <p className="text-sm text-muted-foreground">Based on {productReviews.length || product.reviews} reviews</p>
                                </div>
                                <div className="flex-1 space-y-2 w-full">
                                    {[5, 4, 3, 2, 1].map((stars) => {
                                        const pct = reviewDistribution[stars as keyof typeof reviewDistribution] || 0;
                                        return (
                                            <div key={stars} className="flex items-center gap-4 text-sm">
                                                <span className="w-12 font-medium">{stars} Star</span>
                                                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                                    <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${pct}%` }} />
                                                </div>
                                                <span className="w-10 text-right text-muted-foreground">{pct}%</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Right Column: Pricing & Meta (4 cols) */}
                <aside className="lg:col-span-4 space-y-8">
                    {/* Purchase Card */}
                    <Card className="sticky top-24 border-primary/20 shadow-2xl overflow-hidden bg-card/80 backdrop-blur-md">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
                        <CardHeader className="relative pb-2">
                            <div className="flex justify-between items-center mb-4">
                                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                                    License Options
                                </Badge>
                                <div className="flex text-yellow-500 items-center gap-1">
                                    <Star className="w-4 h-4 fill-current" />
                                    <span className="text-sm font-bold text-foreground">{product.rating}</span>
                                </div>
                            </div>
                            <CardTitle className="text-3xl font-bold">
                                ${selectedLicense === 'regular' ? product.licenseRegular : product.licenseExtended}
                            </CardTitle>
                        </CardHeader>
                        
                        <CardContent className="space-y-6 relative">
                            {/* License Toggle */}
                            <div className="grid grid-cols-2 p-1 bg-muted rounded-xl border border-border">
                                <button onClick={() => setSelectedLicense('regular')}
                                    className={`py-2 text-sm font-bold rounded-lg transition-all ${
                                        selectedLicense === 'regular' ? "bg-background shadow-sm text-primary" : "text-muted-foreground"
                                    }`}
                                >
                                    Regular
                                </button>
                                <button onClick={() => setSelectedLicense('extended')}
                                    className={`py-2 text-sm font-bold rounded-lg transition-all ${
                                        selectedLicense === 'extended' ? "bg-background shadow-sm text-primary" : "text-muted-foreground"
                                    }`}
                                >
                                    Extended
                                </button>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-sm">
                                    <Check className="w-4 h-4 text-green-500 shrink-0" />
                                    <span>{selectedLicense === 'regular' ? 'Single personal/commercial project' : 'Unlimited SaaS/Internal projects'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Check className="w-4 h-4 text-green-500 shrink-0" />
                                    <span>{product.updatePolicy}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Check className="w-4 h-4 text-green-500 shrink-0" />
                                    <span>Full Source Code Access</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Check className="w-4 h-4 text-green-500 shrink-0" />
                                    <span>Dedicated Support via Discord</span>
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-3">
                                <Button size="lg" className="w-full rounded-2xl h-14 font-bold text-lg shadow-xl shadow-primary/20" onClick={handleAddToCart}>
                                    <ShoppingCart className="mr-2 h-5 w-5" />
                                    Add to Cart
                                </Button>
                                <Button variant="outline" size="lg" className="w-full rounded-2xl h-14 font-bold" onClick={() => { handleAddToCart(); setTimeout(() => window.location.href = '/shop/checkout', 100); }}>
                                    Buy Now
                                </Button>
                            </div>

                            <p className="text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                                <ShieldCheck className="w-3 h-3" />
                                100% Secure Checkout via Stripe
                            </p>
                        </CardContent>
                    </Card>

                    {/* Meta Info Card */}
                    <Card className="border-border/50 bg-secondary/10 overflow-hidden">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <Info className="w-4 h-4 text-primary" />
                                Product Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Compatibility</span>
                                <div className="flex flex-wrap gap-1 justify-end max-w-[150px]">
                                    {product.compatibility.map(c => (
                                        <Badge key={c} variant="outline" className="text-xs px-2 py-0">{c}</Badge>
                                    ))}
                                </div>
                            </div>
                            <div className="flex justify-between text-sm border-t border-border pt-3">
                                <span className="text-muted-foreground">Version</span>
                                <span className="font-bold">{product.version}</span>
                            </div>
                            <div className="flex justify-between text-sm border-t border-border pt-3">
                                <span className="text-muted-foreground">Last Updated</span>
                                <span className="font-bold">{product.lastUpdated}</span>
                            </div>
                            <div className="flex justify-between text-sm border-t border-border pt-3">
                                <span className="text-muted-foreground">Category</span>
                                <Link href="/shop" className="text-primary font-bold hover:underline">{product.subcategory}</Link>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Need Help Card */}
                    <div className="p-6 rounded-3xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 text-center">
                        <MessageSquare className="w-8 h-8 text-primary mx-auto mb-3" />
                        <h4 className="font-bold mb-2">Got Questions?</h4>
                        <p className="text-xs text-muted-foreground mb-4">Our developers are online and ready to assist with any pre-sale questions.</p>
                        <Button variant="outline" size="sm" className="rounded-full w-full" onClick={() => {
                            window.dispatchEvent(new CustomEvent('open-live-chat'));
                            toast.info("Opening live chat...");
                        }}>
                            Chat with Support
                        </Button>
                    </div>
                </aside>
            </div>

            {/* Related Products Section */}
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold">Related Products</h2>
                        <p className="text-muted-foreground">Explore more premium assets from the {product.category} category.</p>
                    </div>
                    <Button variant="ghost" className="hidden md:flex gap-2" asChild>
                        <Link href="/shop">
                            View All Assets
                            <ChevronRight className="w-4 h-4" />
                        </Link>
                    </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {relatedProducts.map(p => (
                        <ProductCard key={p.id} product={p} />
                    ))}
                </div>
            </div>
        </div>
    );
}

"use client"
import { AnimatedDiv } from "@/lib/animated";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, ShoppingCart, Heart, Eye, Clock, TrendingUp, ShieldCheck } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner";
import { useCart } from "@/hooks/use-cart";
import { ServiceOffer } from "@/lib/store/services-content";

interface ServiceOfferCardProps {
    offer: ServiceOffer;
    index?: number;
}

export function ServiceOfferCard({ offer, index = 0 }: ServiceOfferCardProps) {
    const [isWishlisted, setIsWishlisted] = useState(false);
    const { addItem } = useCart();

    const handleAddToCart = () => {
        const tier = offer.tiers?.[0];
        addItem({
            id: offer.id,
            name: offer.title,
            price: tier?.price ?? 0,
            image: offer.image || "",
            slug: offer.id,
            type: "service",
        });
    };

    const toggleWishlist = () => {
        setIsWishlisted((prev) => !prev);
        toast(isWishlisted ? "Removed from saved" : "Saved to favorites", {
            icon: <Heart className={cn("h-4 w-4", !isWishlisted ? "fill-red-500 text-red-500" : "")} />
        });
    };

    return (
        <AnimatedDiv
            initial={{ opacity: 0, y: 20 }}
            style={{ willChange: "transform, opacity" }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
        >
            <Card className="h-full group relative overflow-hidden bg-card/50 backdrop-blur-sm border-white/5 hover:border-primary/40 transition-all duration-300 pt-0 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 pb-0">
                {/* Thumbnail */}
                <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-muted via-background to-muted">
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-transparent" />
                    {offer.image ? (
                        <Image src={offer.image} alt={offer.title} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <div className="text-4xl font-bold text-muted-foreground/20 select-none">
                                {offer.category.charAt(0)}{offer.subcategory.charAt(0)}
                            </div>
                        </div>
                    )}

                    {/* Overlay Actions */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute top-3 right-3 flex flex-col gap-2">
                            <Button
                                onClick={toggleWishlist}
                                size="icon"
                                variant="secondary"
                                className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm hover:bg-primary hover:text-primary-foreground"
                            >
                                <Heart className={cn("h-4 w-4", isWishlisted && "fill-red-500 text-red-500")} />
                            </Button>
                        </div>
                    </div>

                    {/* Category Badge */}
                    <Badge className="absolute top-3 left-3 bg-background/80 backdrop-blur-sm text-foreground hover:bg-background text-xs">
                        {offer.subcategory}
                    </Badge>

                    {/* Trending Badge */}
                    {offer.trending && (
                        <Badge className="absolute top-3 left-3 translate-y-8 bg-orange-500/90 text-white backdrop-blur-sm border-0 text-xs gap-1">
                            <TrendingUp className="w-3 h-3" />
                            Trending
                        </Badge>
                    )}
                </div>

                <CardContent className="p-4">
                    {/* Provider - Oftisoft as sole seller */}
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-[10px] font-bold text-primary-foreground">
                            O
                        </div>
                        <span className="text-xs font-medium text-foreground">Oftisoft</span>
                        <span className="flex items-center gap-0.5 text-[10px] font-semibold text-green-500 ml-auto">
                            <ShieldCheck className="w-3 h-3" />
                            Pro Seller
                        </span>
                    </div>

                    {/* Title */}
                    <Link href={`/services/${offer.id}`} className="block group-hover:text-primary transition-colors">
                        <h3 className="font-semibold text-sm leading-snug line-clamp-2 mb-2">{offer.title}</h3>
                    </Link>

                    {/* Tech Tags */}
                    <div className="flex flex-wrap gap-1 mb-3">
                        {offer.techs.slice(0, 3).map((tech) => (
                            <span key={tech} className="text-[10px] px-2 py-0.5 rounded-full bg-muted/50 border border-white/5 text-muted-foreground">
                                {tech}
                            </span>
                        ))}
                        {offer.techs.length > 3 && (
                            <span className="text-[10px] px-2 py-0.5 text-muted-foreground">
                                +{offer.techs.length - 3}
                            </span>
                        )}
                    </div>

                    {/* Rating & Orders */}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-1">
                        <div className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                            <span className="font-semibold text-foreground">{offer.rating}</span>
                            <span>({offer.reviewCount})</span>
                        </div>
                        <span className="flex items-center gap-1">
                            {offer.orderCount} orders
                        </span>
                    </div>

                    {/* Delivery Time */}
                    {offer.tiers && offer.tiers[0] && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>{offer.tiers[0].deliveryTime}</span>
                        </div>
                    )}
                </CardContent>

                <CardFooter className="p-4 pt-0 flex items-center justify-between border-t border-border/40 mt-2">
                    <div>
                        <span className="text-[10px] text-muted-foreground">From</span>
                        <div className="text-lg font-bold text-foreground">
                            ${(offer.tiers?.[0]?.price ?? 0).toLocaleString()}
                        </div>
                    </div>
                    <Button
                        onClick={handleAddToCart}
                        size="sm"
                        className="rounded-full gap-1.5 shadow-lg shadow-primary/20 h-9 text-xs"
                    >
                        <ShoppingCart className="h-3.5 w-3.5" />
                        Order Now
                    </Button>
                </CardFooter>
            </Card>
        </AnimatedDiv>
    );
}

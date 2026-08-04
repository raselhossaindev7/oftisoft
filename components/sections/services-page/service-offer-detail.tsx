"use client";
import { AnimatedDiv, AnimatedSpan } from "@/lib/animated";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Star,
  Clock,
  User,
  ShoppingCart,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  ArrowLeft,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Zap,
  Sparkles,
  Crown,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner";
import { useCart } from "@/hooks/use-cart";
import type { ServiceOffer } from "@/lib/store/services-content";

interface ServiceOfferDetailProps {
  offer: ServiceOffer;
}

export default function ServiceOfferDetail({ offer }: ServiceOfferDetailProps) {
  const [selectedTier, setSelectedTier] = useState<
    "Basic" | "Standard" | "Premium"
  >("Standard");

  const tierData =
    offer.tiers.find((t) => t.name === selectedTier) ||
    offer.tiers[1] ||
    offer.tiers[0];

  if (!tierData) return null;
  const tierIndex = offer.tiers.findIndex((t) => t.name === selectedTier);

  const { addItem } = useCart();

  const handleOrder = () => {
    addItem({
      id: `${offer.id}-${selectedTier}`,
      name: `${offer.title} (${selectedTier})`,
      price: tierData.price,
      image: offer.image || "",
      slug: offer.id,
      type: "service",
    });
  };

  const handleContact = () => {
    window.location.href = '/contact';
  };

  const tierIcon = (name: string) => {
    if (name === "Basic") return <Zap className="w-5 h-5" />;
    if (name === "Standard") return <Sparkles className="w-5 h-5" />;
    return <Crown className="w-5 h-5" />;
  };

  const tierAccent = (name: string) => {
    if (name === "Basic") return "blue";
    if (name === "Standard") return "primary";
    return "orange";
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Top Bar */}
      <div className="sticky top-0 z-50   border-border/40">
        <div className="container px-4 mx-auto flex items-center justify-between h-16">
          <Link
            href="/services"
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Services
          </Link>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full gap-2"
              onClick={handleContact}
            >
              <MessageSquare className="w-4 h-4" />
              Contact Me
            </Button>
          </div>
        </div>
      </div>

      <div className="container px-4 mx-auto py-8 md:py-12">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
          {/* ─── LEFT: Offer Details ─── */}
          <div className="flex-1 max-w-3xl">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
              <Link href="/services" className="hover:text-foreground">
                Services
              </Link>
              <span>/</span>
              <span className="text-foreground font-medium">
                {offer.category}
              </span>
              <span>/</span>
              <span className="text-foreground">{offer.subcategory}</span>
            </div>

            {/* Title & Badges */}
            <div className="flex items-start gap-3 mb-4">
              {offer.trending && (
                <Badge className="bg-orange-500/90 text-white border-0 gap-1 shrink-0 mt-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  Trending
                </Badge>
              )}
            </div>
            <h1 className="text-2xl md:text-4xl font-bold tracking-tight mb-4">
              {offer.title}
            </h1>

            {/* Seller & Rating Row */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-xs font-bold text-primary-foreground">
                  O
                </div>
                <div>
                  <span className="text-sm font-semibold">Oftisoft</span>
                  <div className="flex items-center gap-1 text-xs text-green-500 font-medium">
                    <ShieldCheck className="w-3 h-3" />
                    Pro Seller
                  </div>
                </div>
              </div>
              <div className="h-6 w-px bg-border hidden sm:block" />
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                <span className="font-bold text-sm">{offer.rating}</span>
                <span className="text-sm text-muted-foreground">
                  ({offer.reviewCount} reviews)
                </span>
              </div>
              <div className="h-6 w-px bg-border hidden sm:block" />
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <User className="w-3.5 h-3.5" />
                {offer.orderCount} orders completed
              </span>
            </div>

            {/* Thumbnail */}
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-muted via-background to-muted mb-8 border border-border/40">
              {offer.image ? (
                <Image
                  src={offer.image}
                  alt={offer.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl font-bold text-muted-foreground/10 select-none mb-2">
                      {offer.category.charAt(0)}
                      {offer.subcategory.charAt(0)}
                    </div>
                    <p className="text-muted-foreground/30 text-sm">
                      {offer.category}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="mb-10">
              <h2 className="text-xl font-bold mb-3">What I&apos;ll Do</h2>
              <p className="text-muted-foreground leading-relaxed">
                {offer.description}
              </p>
            </div>

            {/* Tech Stack */}
            <div className="mb-10">
              <h2 className="text-xl font-bold mb-3">Technologies I Use</h2>
              <div className="flex flex-wrap gap-2">
                {offer.techs.map((tech) => (
                  <span
                    key={tech}
                    className="px-3 py-1.5 rounded-lg bg-muted/50 border border-border/40 text-sm font-medium text-muted-foreground"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* What's Included - per selected tier */}
            <div className="mb-10">
              <h2 className="text-xl font-bold mb-4">
                What&apos;s Included in{" "}
                <span
                  className={cn(
                    selectedTier === "Basic" && "text-blue-500",
                    selectedTier === "Standard" && "text-primary",
                    selectedTier === "Premium" && "text-orange-500",
                  )}
                >
                  {selectedTier}
                </span>
              </h2>
              <div className="space-y-3">
                {tierData.features.map((feat, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2
                      className={cn(
                        "w-5 h-5 shrink-0 mt-0.5",
                        selectedTier === "Basic" && "text-blue-500",
                        selectedTier === "Standard" && "text-primary",
                        selectedTier === "Premium" && "text-orange-500",
                      )}
                    />
                    <span className="text-muted-foreground">{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <Separator className="mb-10" />

            {/* FAQ */}
            {offer.faqs.length > 0 && (
              <div className="mb-10">
                <h2 className="text-xl font-bold mb-4">
                  Frequently Asked Questions
                </h2>
                <div className="space-y-3">
                  {offer.faqs.map((faq, i) => (
                    <FAQItem
                      key={i}
                      question={faq.question}
                      answer={faq.answer}
                    />
                  ))}
                </div>
              </div>
            )}

            <Separator className="mb-10" />

            {/* Reviews Summary */}
            <div className="mb-16">
              <h2 className="text-xl font-bold mb-4">
                Reviews ({offer.reviewCount})
              </h2>
              <div className="flex items-center gap-4 mb-6">
                <div className="text-center">
                  <div className="text-4xl font-bold">{offer.rating}</div>
                  <div className="flex items-center gap-0.5 mt-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        className={cn(
                          "w-4 h-4",
                          i <= Math.round(offer.rating)
                            ? "fill-yellow-500 text-yellow-500"
                            : "text-muted-foreground/30",
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground mt-1">
                    {offer.reviewCount} reviews
                  </span>
                </div>
                <div className="flex-1 space-y-1.5">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const pct =
                      star === 5
                        ? 72
                        : star === 4
                          ? 18
                          : star === 3
                            ? 7
                            : star === 2
                              ? 2
                              : 1;
                    return (
                      <div
                        key={star}
                        className="flex items-center gap-2 text-xs"
                      >
                        <span className="w-6 text-right text-muted-foreground">
                          {star}
                        </span>
                        <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                        <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-yellow-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-8 text-right text-muted-foreground">
                          {pct}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
              {[0, 1].map((i) => (
                <ReviewCard key={i} index={i} />
              ))}
            </div>
          </div>

          {/* ─── RIGHT: Pricing Sidebar (Sticky) ─── */}
          <div className="w-full lg:w-[400px] shrink-0">
            <div className="lg:sticky lg:top-24 space-y-5">
              {/* Tier Cards */}
              {offer.tiers.map((tier, i) => {
                const isSelected = selectedTier === tier.name;
                const accent = tierAccent(tier.name);
                const isBestValue = tier.name === "Standard";

                return (
                  <button
                    key={tier.name}
                    onClick={() =>
                      setSelectedTier(
                        tier.name as "Basic" | "Standard" | "Premium",
                      )
                    }
                    className="w-full text-left"
                  >
                    <Card
                      className={cn(
                        "relative overflow-hidden transition-all duration-200 border-2 cursor-pointer hover:shadow-lg",
                        isSelected
                          ? accent === "primary"
                            ? "border-primary shadow-primary/10"
                            : accent === "blue"
                              ? "border-blue-500 shadow-blue-500/10"
                              : "border-orange-500 shadow-orange-500/10"
                          : "border-border/60 hover:border-border",
                      )}
                    >
                      {isBestValue && (
                        <div className="absolute top-0 right-0">
                          <div className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-xl">
                            BEST VALUE
                          </div>
                        </div>
                      )}
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center",
                                isSelected
                                  ? accent === "primary"
                                    ? "bg-primary text-primary-foreground"
                                    : accent === "blue"
                                      ? "bg-blue-500 text-white"
                                      : "bg-orange-500 text-white"
                                  : "bg-muted text-muted-foreground",
                              )}
                            >
                              {tierIcon(tier.name)}
                            </div>
                            <CardTitle className="text-lg font-bold">
                              {tier.name}
                            </CardTitle>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold">
                              ${tier.price.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-4">
                        <p className="text-xs text-muted-foreground mb-3">
                          {tier.description}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{tier.deliveryTime} delivery</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>
                            {tier.revisions === "Unlimited"
                              ? "Unlimited"
                              : `${tier.revisions} revision${tier.revisions > 1 ? "s" : ""}`}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </button>
                );
              })}

              {/* Order Button */}
              <div className="space-y-3 pt-2">
                <Button
                  onClick={handleOrder}
                  size="lg"
                  className="w-full h-14 text-base font-bold rounded-2xl gap-2 shadow-xl shadow-primary/20"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Continue (${tierData.price.toLocaleString()})
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  You can discuss details after ordering
                </p>
              </div>

              {/* Delivery Summary */}
              <Card className="bg-muted/30 border-border/40">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Package</span>
                    <span className="font-semibold">{selectedTier}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Price</span>
                    <span className="font-semibold">
                      ${tierData.price.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Delivery</span>
                    <span className="font-semibold">
                      {tierData.deliveryTime}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Revision</span>
                    <span className="font-semibold">
                      {tierData.revisions === "Unlimited"
                        ? "Unlimited"
                        : `${tierData.revisions} revision${tierData.revisions > 1 ? "s" : ""}`}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border/40 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors"
      >
        <span className="font-medium text-sm">{question}</span>
        {open ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
        )}
      </button>
      {open && (
        <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  );
}

function ReviewCard({ index = 0 }: { index?: number }) {
  const reviews = [
    {
      name: "Sarah M.",
      date: "2 weeks ago",
      rating: 5,
      text: "Amazing work! Delivered exactly what I needed ahead of schedule. Very professional and communicative throughout the process.",
    },
    {
      name: "James K.",
      date: "1 month ago",
      rating: 5,
      text: "Second time working with Oftisoft and once again exceeded expectations. Highly recommend for any programming project.",
    },
  ];
  const review = reviews[index % reviews.length];
  return (
    <div className="border border-border/40 rounded-xl p-4 mb-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
            {review.name.charAt(0)}
          </div>
          <div>
            <span className="text-sm font-semibold">{review.name}</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className={cn(
                    "w-3 h-3",
                    i <= review.rating
                      ? "fill-yellow-500 text-yellow-500"
                      : "text-muted-foreground/30",
                  )}
                />
              ))}
            </div>
          </div>
        </div>
        <span className="text-xs text-muted-foreground">{review.date}</span>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {review.text}
      </p>
    </div>
  );
}

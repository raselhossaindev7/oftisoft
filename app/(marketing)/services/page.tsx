"use client";

import { useState, useMemo, useEffect } from "react";
import ServicesOverview from "@/components/sections/services-page/services-overview";
import ServiceComparison from "@/components/sections/services-page/service-comparison";
import ServicePackages from "@/components/sections/services-page/service-packages";
import ServiceProcess from "@/components/sections/services-page/service-process";
import ServiceFAQ from "@/components/sections/services-page/service-faq";
import ServiceTechStack from "@/components/sections/services-page/service-tech-stack";
import TrendingServices from "@/components/sections/services-page/trending-services";
import { ServicesSidebar } from "@/components/sections/services-page/services-sidebar";
import { ServiceOfferCard } from "@/components/sections/services-page/service-offer-card";
import CTA from "@/components/sections/cta";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Search, SlidersHorizontal, Sparkles, Code2, Server, Smartphone, Brain, Cloud, Database, ArrowUpDown, X, Globe, Monitor
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useServicesContentStore } from "@/lib/store/services-content";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const categories = [
    { id: "all", label: "All Services", icon: Sparkles },
    { id: "WordPress", label: "WordPress", icon: Globe },
    { id: "Web Development", label: "Web Development", icon: Code2 },
    { id: "Backend Development", label: "Backend & API", icon: Server },
    { id: "Mobile Development", label: "Mobile Apps", icon: Smartphone },
    { id: "AI & Machine Learning", label: "AI & ML", icon: Brain },
    { id: "DevOps & Cloud", label: "DevOps & Cloud", icon: Cloud },
    { id: "Data Engineering", label: "Data & Analytics", icon: Database },
    { id: "Desktop Applications", label: "Desktop Apps", icon: Monitor },
];

export default function ServicesPage() {
    const { content } = useServicesContentStore();

    // Inject JSON-LD structured data for SEO
    useEffect(() => {
        const script = document.createElement("script");
        script.type = "application/ld+json";
        script.id = "services-jsonld";
        script.textContent = JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "Programming Services | Oftisoft",
            description: "50+ programming services including WordPress development, web apps, mobile apps, AI chatbots, backend APIs, and more.",
            url: "https://oftisoft.com/services",
            numberOfItems: 25,
            itemListElement: [
                { "@type": "ListItem", position: 1, name: "WordPress Website Creation", url: "https://oftisoft.com/services/svc-wordpress-create" },
                { "@type": "ListItem", position: 2, name: "WordPress Fix & Repair", url: "https://oftisoft.com/services/svc-wordpress-fix" },
                { "@type": "ListItem", position: 3, name: "WordPress Speed Optimization", url: "https://oftisoft.com/services/svc-wordpress-speed" },
                { "@type": "ListItem", position: 4, name: "Full-Stack SaaS Development", url: "https://oftisoft.com/services/svc-fullstack-saas" },
                { "@type": "ListItem", position: 5, name: "React/Next.js Frontend Development", url: "https://oftisoft.com/services/svc-react-frontend" },
                { "@type": "ListItem", position: 6, name: "E-Commerce Store Development", url: "https://oftisoft.com/services/svc-ecommerce" },
                { "@type": "ListItem", position: 7, name: "API & Backend Development", url: "https://oftisoft.com/services/svc-api-backend" },
                { "@type": "ListItem", position: 8, name: "Mobile App Development", url: "https://oftisoft.com/services/svc-mobile-app" },
                { "@type": "ListItem", position: 9, name: "AI Chatbot Integration", url: "https://oftisoft.com/services/svc-ai-chatbot" },
                { "@type": "ListItem", position: 10, name: "Bug Fixing & Debugging", url: "https://oftisoft.com/services/svc-bug-fix" },
            ],
            provider: { "@type": "Organization", name: "Oftisoft", url: "https://oftisoft.com" },
        });
        document.head.appendChild(script);
        return () => { const el = document.getElementById("services-jsonld"); if (el) el.remove(); };
    }, []);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [selectedSort, setSelectedSort] = useState("popular");
    const [priceRange, setPriceRange] = useState([0, 15000]);
    const [page, setPage] = useState(1);
    const PER_PAGE = 12;

    const offers = content?.offers ?? [];

    const filteredOffers = useMemo(() => {
        let result = [...offers];

        if (selectedCategory !== "all") {
            result = result.filter(o => o.category === selectedCategory);
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(
                o => o.title.toLowerCase().includes(query) ||
                    o.description.toLowerCase().includes(query) ||
                    o.techs.some(t => t.toLowerCase().includes(query)) ||
                    o.category.toLowerCase().includes(query) ||
                    o.subcategory.toLowerCase().includes(query)
            );
        }

        const p = (o: typeof offers[0]) => o.tiers?.[0]?.price ?? 0;
        result = result.filter(o => {
            const price = p(o);
            return price >= priceRange[0] && price <= priceRange[1];
        });

        if (selectedSort === "popular") result.sort((a, b) => b.orderCount - a.orderCount);
        else if (selectedSort === "rating") result.sort((a, b) => b.rating - a.rating);
        else if (selectedSort === "price-low") result.sort((a, b) => p(a) - p(b));
        else if (selectedSort === "price-high") result.sort((a, b) => p(b) - p(a));
        else if (selectedSort === "newest") result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return result;
    }, [searchQuery, selectedCategory, selectedSort, priceRange, offers]);

    const totalPages = Math.ceil(filteredOffers.length / PER_PAGE);
    const paged = filteredOffers.slice((page - 1) * PER_PAGE, page * PER_PAGE);
    const goToPage = (p: number) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); };
    // Reset page when filters change
    useEffect(() => { setPage(1); }, [searchQuery, selectedCategory, selectedSort, priceRange]);

    return (
        <main className="flex min-h-screen flex-col bg-background text-foreground overflow-hidden">
            {/* Hero / Search Section */}
            <section className="relative pt-32 md:pt-44 pb-16 md:pb-24 overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
                <div className="absolute top-0 right-0 w-[60vw] h-[60vw] max-w-[500px] max-h-[500px] bg-primary/10 rounded-full blur-[150px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[50vw] h-[50vw] max-w-[400px] max-h-[400px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

                <div className="container px-4 mx-auto relative z-10 text-center">
                    <Badge variant="outline" className="gap-2 px-4 py-1.5 bg-primary/10 border-primary/20 text-primary mb-6 backdrop-blur-sm">
                        <Sparkles className="w-4 h-4" />
                        50+ Programming Services — One Developer
                    </Badge>

                    <h1 className="text-4xl md:text-7xl font-semibold tracking-tight leading-[0.95] mb-6 max-w-4xl mx-auto">
                        WordPress, Web Apps, Mobile, AI —<br />
                        <span className="text-primary">I Build It All</span>
                    </h1>

                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
                        Need a website, fix WordPress issues, build a mobile app, or add AI? I offer 50+ programming services
                        — from a simple bug fix to a full SaaS platform. Starting at $199.
                    </p>

                    {/* Search Bar */}
                    <div className="max-w-2xl mx-auto relative">
                        <div className="relative flex items-center">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <Input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder='Search services — "WordPress fix", "React app", "AI chatbot"...'
                                className="pl-14 pr-14 h-16 rounded-2xl bg-card/80 border-border/50 focus:bg-card transition-all text-lg shadow-xl shadow-primary/5 backdrop-blur-md"
                            />
                            {searchQuery && (
                                <button onClick={() => setSearchQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-muted/80 transition-colors">
                                    <X className="w-4 h-4 text-muted-foreground" />
                                </button>
                            )}
                        </div>

                        {/* Popular Search Suggestions */}
                        {!searchQuery && (
                            <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                                <span className="text-xs text-muted-foreground font-medium">Popular:</span>
                                {["WordPress fix", "React app", "AI chatbot", "bug fix", "mobile app", "WooCommerce"].map((term) => (
                                    <button
                                        key={term}
                                        onClick={() => setSearchQuery(term)}
                                        className="text-xs px-3 py-1 rounded-full bg-muted/50 border border-border/30 text-muted-foreground hover:bg-card hover:text-foreground hover:border-primary/30 transition-all"
                                    >
                                        {term}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Search Results Count */}
                        {searchQuery && (
                            <div className="mt-3 text-center">
                                <p className="text-sm text-muted-foreground">
                                    Showing <span className="text-foreground font-semibold">{filteredOffers.length}</span> results for "<span className="text-foreground font-medium">{searchQuery}</span>"
                                    <button onClick={() => setSearchQuery("")} className="ml-2 text-primary text-xs hover:underline">Clear</button>
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Category Pills */}
                    {/* {!searchQuery && (
                        <div className="flex flex-wrap justify-center gap-2 mt-8">
                            {categories.map((cat) => {
                                const Icon = cat.icon;
                                const isActive = selectedCategory === cat.id;
                                return (
                                    <button
                                        key={cat.id}
                                        onClick={() => setSelectedCategory(cat.id)}
                                        className={cn(
                                            "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all border",
                                            isActive
                                                ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                                                : "bg-card/50 text-muted-foreground border-border/30 hover:bg-card hover:text-foreground hover:border-primary/30"
                                        )}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {cat.label}
                                    </button>
                                );
                            })}
                        </div>
                    )} */}
                </div>
            </section>

            {/* Trending Services */}
            {!searchQuery && <TrendingServices offers={offers} />}

            {/* All Services Grid */}
            <section className="py-16 md:py-24 bg-background relative overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

                <div className="container px-4 mx-auto relative z-10">
                    {/* Toolbar */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                        <div>
                            <h2 className="text-2xl md:text-4xl font-semibold tracking-tight">All Services</h2>
                            <p className="text-muted-foreground text-sm mt-1">
                                <span className="text-foreground font-semibold">{filteredOffers.length}</span> services available
                            </p>
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto">
                            {/* Mobile Filter */}
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button variant="outline" className="md:hidden h-11 rounded-xl gap-2">
                                        <SlidersHorizontal className="w-4 h-4" />
                                        Filters
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="left" className="w-[280px] p-0">
                                    <ServicesSidebar
                                        selectedCategory={selectedCategory}
                                        onCategoryChange={setSelectedCategory}
                                        priceRange={priceRange}
                                        onPriceRangeChange={setPriceRange}
                                        onReset={() => { setSearchQuery(""); setSelectedCategory("all"); setPriceRange([0, 15000]); }}
                                        className="p-6"
                                    />
                                </SheetContent>
                            </Sheet>

                            <Select value={selectedSort} onValueChange={setSelectedSort}>
                                <SelectTrigger className="w-[140px] sm:w-[180px] h-11 rounded-xl">
                                    <SelectValue placeholder="Sort by" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="popular">Most Popular</SelectItem>
                                    <SelectItem value="rating">Highest Rated</SelectItem>
                                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                                    <SelectItem value="newest">Newest</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Desktop Sidebar */}
                        <aside className="hidden lg:block w-[280px] shrink-0">
                            <div className="sticky top-24">
                                <ServicesSidebar
                                    selectedCategory={selectedCategory}
                                    onCategoryChange={setSelectedCategory}
                                    priceRange={priceRange}
                                    onPriceRangeChange={setPriceRange}
                                    onReset={() => { setSearchQuery(""); setSelectedCategory("all"); setPriceRange([0, 15000]); }}
                                />
                            </div>
                        </aside>

                        {/* Services Grid */}
                        <div className="flex-1 min-w-0">
                            {filteredOffers.length > 0 ? (
                                <>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                                        {paged.map((offer, i) => (
                                            <ServiceOfferCard key={offer.id} offer={offer} index={i} />
                                        ))}
                                    </div>

                                    {/* Pagination */}
                                    {totalPages > 1 && (
                                        <div className="flex items-center justify-center gap-2 mt-12">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="rounded-full h-10 w-10 p-0"
                                                disabled={page <= 1}
                                                onClick={() => goToPage(page - 1)}
                                            >
                                                <ArrowUpDown className="w-4 h-4 rotate-90" />
                                            </Button>
                                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                                                const isActive = p === page;
                                                const show = p === 1 || p === totalPages || Math.abs(p - page) <= 1;
                                                const ellipsis = !show && (p === 2 || p === totalPages - 1);
                                                if (!show) return ellipsis ? <span key={p} className="text-muted-foreground text-sm px-1">...</span> : null;
                                                return (
                                                    <Button
                                                        key={p}
                                                        variant={isActive ? "default" : "outline"}
                                                        size="sm"
                                                        className={cn("rounded-full h-10 w-10 p-0 font-bold text-sm", isActive && "shadow-md")}
                                                        onClick={() => goToPage(p)}
                                                    >
                                                        {p}
                                                    </Button>
                                                );
                                            })}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="rounded-full h-10 w-10 p-0"
                                                disabled={page >= totalPages}
                                                onClick={() => goToPage(page + 1)}
                                            >
                                                <ArrowUpDown className="w-4 h-4 -rotate-90" />
                                            </Button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-20 bg-muted/20 rounded-[3rem] border border-dashed border-border">
                                    <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-xl font-bold mb-2">No services found</h3>
                                    <p className="text-muted-foreground">Try changing filters or search terms.</p>
                                    <div className="flex gap-3 justify-center mt-6">
                                        <Button onClick={() => { setSearchQuery(""); setSelectedCategory("all"); setPriceRange([0, 15000]); setPage(1); }} variant="outline" className="rounded-full">
                                            Clear all filters
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            <ServicesOverview />
            <ServiceComparison />
            <ServicePackages />
            <ServiceProcess />
            <ServiceTechStack />
            <ServiceFAQ />
            <CTA />
        </main>
    );
}

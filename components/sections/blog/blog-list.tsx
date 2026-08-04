"use client"
import { Animated, AnimatedDiv, AnimatePresence } from "@/lib/animated";


import { useState } from "react";
import { Search, Grid, Code, Smartphone, Brain, Cloud, Briefcase, Clock, Calendar, ArrowUpRight, Filter } from "lucide-react";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

import { useBlogContentStore, type BlogCategory } from "@/lib/store/blog-content";


// Map icon string names to components
const iconMap: Record<string, React.ComponentType<{ className?: string; size?: number }>> = {
    Grid, Code, Smartphone, Brain, Cloud, Briefcase
};

export default function BlogList() {
    const { content } = useBlogContentStore();
    const categories = content?.categories || [];
    const posts = content?.posts || [];

    const [activeCategory, setActiveCategory] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [visibleCount, setVisibleCount] = useState(6);

    // Filter Logic
  const filteredPosts = posts.filter(post => {
        const matchesCategory = activeCategory === "all" || post.category === activeCategory;
        const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <section className="py-24 bg-background relative min-h-screen">
            {/* Ambient Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[10%] right-[5%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[10%] left-[5%] w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px]" />
            </div>

            <div className="container px-4 mx-auto relative z-10">
                
                {/* Header & Controls */}
                <div className="flex flex-col lg:flex-row items-center justify-between gap-8 mb-16">
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 mb-4">
                            Latest Insights
                        </h2>
                        <p className="text-muted-foreground max-w-md">
                            Discover the latest trends, tutorials, and deep dives from our engineering team.
                        </p>
                    </div>

                    <Sheet>
                        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                            {/* Search Bar */}
                            <div className={cn(
                                "relative group transition-all duration-300",
                                isSearchFocused ? "w-full lg:w-[320px]" : "w-full lg:w-[280px]"
                            )}>
                                <div className={cn(
                                    "absolute inset-0 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-xl blur-md transition-opacity",
                                    isSearchFocused ? "opacity-100" : "opacity-0"
                                )} />
                                <div className="relative flex items-center">
                                    <Search className="absolute left-3 w-4 h-4 text-muted-foreground z-10" />
                                    <Input 
                                        type="text" 
                                        placeholder="Search articles..." 
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onFocus={() => setIsSearchFocused(true)}
                                        onBlur={() => setIsSearchFocused(false)}
                                        className="pl-10 h-12 bg-card border-border shadow-sm focus-visible:ring-primary/50 transition-all rounded-xl"
                                    />
                                </div>
                            </div>

                            {/* Filter Button (Mobile only perhaps, or just extra action) */}
                            <SheetTrigger asChild>
                                <Button variant="outline" className="lg:hidden h-12 gap-2 rounded-xl">
                                    <Filter className="w-4 h-4" />
                                    <span>Filters</span>
                                </Button>
                            </SheetTrigger>
                        </div>
                        <SheetContent side="right">
                            <SheetHeader>
                                <SheetTitle>Filters</SheetTitle>
                            </SheetHeader>
                            <div className="mt-6 space-y-4">
                                {categories.map((cat) => {
                                    const Icon = iconMap[cat.icon || 'Grid'] || Grid;
                                    return (
                                        <Button key={cat.id}
                                            onClick={() => setActiveCategory(cat.id)}
                                            variant={activeCategory === cat.id ? "default" : "outline"}
                                            className="w-full justify-start gap-2 rounded-xl"
                                        >
                                            <Icon className="w-4 h-4" />
                                            <span>{cat.label}</span>
                                        </Button>
                                    );
                                })}
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>

                {/* Categories - Scrollable on mobile */}
                <div className="relative mb-12 overflow-hidden">
                    <div className="flex items-center gap-3 overflow-x-auto pb-4 no-scrollbar mask-gradient-right px-1">
                        {categories.map((cat) => {
                             const Icon = iconMap[cat.icon || 'Grid'] || Grid;
                             return (
                                <Button key={cat.id}
                                    onClick={() => setActiveCategory(cat.id)}
                                    variant={activeCategory === cat.id ? "default" : "outline"}
                                    className={cn(
                                        "flex-shrink-0 flex items-center gap-2 rounded-full transition-all duration-300",
                                        activeCategory === cat.id
                                            ? "shadow-lg shadow-primary/25"
                                            : "bg-background/50 backdrop-blur-sm hover:bg-muted"
                                    )}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span>{cat.label}</span>
                                </Button>
                             );
                        })}
                    </div>
                </div>

                {/* Posts Grid */}
                <AnimatedDiv 
                    layout 
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
                >
                    <AnimatePresence mode="popLayout">
                        {filteredPosts.slice(0, visibleCount).map((post, index) => (
                            <div key={`post-wrapper-${post.id}`} className="contents">
                                <Animated as="article"
                                    layout key={post.id}
                                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                    style={{ willChange: "transform, opacity" }}
                                    transition={{ duration: 0.4, delay: Math.min(index, 5) * 0.1 }}
                                    className="h-full"
                                >
                                    <Link href={`/blog/${post.slug || post.id}`} className="group relative flex flex-col h-full block">
                                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl -z-10 blur-xl" />
                                        
                                        <Card className="py-0 h-full flex flex-col bg-card/50 backdrop-blur-md border-border/50 rounded-3xl overflow-hidden hover:border-primary/30 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-2">
                                            
                                            {/* Image Area */}
                                            <div className="relative h-52 overflow-hidden bg-muted">
                                                {post.coverImage ? (
                                                    <img src={post.coverImage}
                                                        alt={post.title}
                                                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                    />
                                                ) : (
                                                    <div className={cn(
                                                        "absolute inset-0 bg-gradient-to-br",
                                                        post.category === 'web' ? 'from-blue-600/20 to-purple-600/20' :
                                                        post.category === 'ai' ? 'from-emerald-600/20 to-cyan-600/20' :
                                                        post.category === 'mobile' ? 'from-orange-600/20 to-red-600/20' :
                                                        'from-slate-600/20 to-gray-600/20'
                                                    )} />
                                                )}

                                                <div className="absolute top-4 left-4 z-10">
                                                     <Badge variant="secondary" className="backdrop-blur-md bg-background/80 hover:bg-background/90 border-white/10 shadow-sm">
                                                        {categories.find(c => c.id === post.category)?.label || post.category.toUpperCase()}
                                                    </Badge>
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <CardContent className="p-6 flex flex-col flex-grow">
                                                <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium mb-4">
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="w-3.5 h-3.5" />
                                                        <span>{post.date}</span>
                                                    </div>
                                                    <span className="w-1 h-1 rounded-full bg-border" />
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        <span>{post.readTime}</span>
                                                    </div>
                                                </div>

                                                <h3 className="text-xl font-bold mb-3 leading-tight group-hover:text-primary transition-colors">
                                                    {post.title}
                                                </h3>

                                                <p className="text-muted-foreground text-sm leading-relaxed mb-6 flex-grow">
                                                    {post.excerpt}
                                                </p>
                                            </CardContent>

                                            <CardFooter className="p-6 pt-0 mt-auto border-t border-border/50 flex items-center justify-between pt-6">
                                                <span className="text-sm font-semibold text-primary group-hover:underline decoration-primary/30 underline-offset-4">
                                                    Read Article
                                                </span>
                                                <Button size="icon" variant="secondary" className="rounded-full group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 w-8 h-8">
                                                    <ArrowUpRight className="w-4 h-4" />
                                                </Button>
                                            </CardFooter>
                                        </Card>
                                    </Link>
                                </Animated>

                            </div>
                        ))}
                    </AnimatePresence>
                </AnimatedDiv>

                {/* Empty State */}
                {filteredPosts.length === 0 && (
                    <AnimatedDiv 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        className="text-center py-20"
                    >
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-bold">No articles found</h3>
                        <p className="text-muted-foreground">Try adjusting your search or filter.</p>
                        <Button 
                            variant="link"
                            onClick={() => { setSearchQuery(""); setActiveCategory("all"); }}
                            className="mt-4 text-primary font-medium hover:underline"
                        >
                            Clear all filters
                        </Button>
                    </AnimatedDiv>
                )}

                {/* Load More Trigger (Visual Only for now) */}
                {visibleCount < filteredPosts.length && (
                    <div className="mt-16 text-center">
                        <Button variant="outline" className="px-8 py-6 rounded-full bg-card hover:bg-muted hover:border-primary/30 transition-all font-medium text-sm shadow-sm hover:shadow-md" onClick={() => setVisibleCount(prev => prev + 6)}>
                            Load More Articles
                        </Button>
                    </div>
                )}

            </div>
        </section>
    );
}

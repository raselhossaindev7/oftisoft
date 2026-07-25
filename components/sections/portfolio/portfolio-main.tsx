"use client"
import { AnimatedDiv, AnimatedH1, AnimatedH2, AnimatedH3, AnimatedP } from "@/lib/animated";

import { useState, useMemo } from "react";
import { Globe, Smartphone, Brain, ShoppingCart, Building, Search, ArrowRight, Sparkles, Layers, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";

import { usePortfolioContentStore, defaultContent, type ProjectItem } from "@/lib/store/portfolio-content";
import { usePublicPortfolio, mapApiPortfolioToProjects } from "@/hooks/usePublicMarketing";

// Re-export type for component usage if needed, or just use ProjectItem
type Project = ProjectItem;

// Removed static projects array

const categories = [
    { id: "All", label: "All Works", icon: Layers },
    { id: "Web", label: "Web Platforms", icon: Globe },
    { id: "Mobile", label: "Mobile Apps", icon: Smartphone },
    { id: "AI", label: "AI & ML", icon: Brain },
    { id: "Ecommerce", label: "E-commerce", icon: ShoppingCart },
    { id: "Enterprise", label: "Enterprise", icon: Building },
];

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ... existing imports

export default function PortfolioMain() {
    const { content } = usePortfolioContentStore();
    const { data: apiPortfolio = [] } = usePublicPortfolio();
    const apiProjects = useMemo(() => mapApiPortfolioToProjects(apiPortfolio), [apiPortfolio]);
    const fallback = defaultContent;
    const projects = apiProjects.length > 0 ? apiProjects : (content?.projects || fallback.projects);
    const header = content?.header ?? fallback.header;

    const [filter, setFilter] = useState("All");
    const [search, setSearch] = useState("");

    const filteredProjects = projects.filter(p =>
        (filter === "All" || p.category === filter) &&
        (p.title.toLowerCase().includes(search.toLowerCase()) || p.tags.some(t => t.toLowerCase().includes(search.toLowerCase())))
    );

    return (
        <section className="py-24 bg-background min-h-screen relative overflow-hidden">
             {/* ... ambient background ... */}

            <div className="container px-4 mx-auto relative z-10">

                {/* Header Section */}
                <div className="flex flex-col items-center justify-center text-center mb-16 space-y-6">
                    <AnimatedDiv initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <Badge variant="outline" className="gap-2 px-3 py-1 bg-primary/10 border-primary/20 text-primary hover:bg-primary/20">
                            <Sparkles className="w-4 h-4" />
                            {header?.badge ?? ""}
                        </Badge>
                    </AnimatedDiv>
                    
                    <AnimatedH1 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground/90 to-foreground/50"
                    >
                        {header?.title ?? ""}
                    </AnimatedH1>
                    
                    <AnimatedP 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-lg md:text-xl text-muted-foreground max-w-2xl px-4"
                    >
                        {header?.description ?? ""}
                    </AnimatedP>
                </div>

                {/* Filter & Search Bar - Floating Glass Dock */}
                <AnimatedDiv 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="sticky top-4 z-40 mb-12"
                >
                    <div className="mx-auto bg-background/80 backdrop-blur-xl border border-border/50 shadow-2xl rounded-2xl p-2 flex flex-col md:flex-row gap-4 items-center justify-between">
                        
                        {/* Scrollable Categories */}
                        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar w-full md:w-auto pb-2 md:pb-0 mask-gradient-right px-2">
                            {categories.map((cat) => (
                                <Button key={cat.id}
                                    variant={filter === cat.id ? "default" : "ghost"}
                                    size="sm"
                                    onClick={() => setFilter(cat.id)}
                                    className={cn(
                                        "rounded-xl gap-2 font-medium transition-all whitespace-nowrap",
                                        filter === cat.id ? "shadow-md" : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    <cat.icon className="w-4 h-4" />
                                    <span>{cat.label}</span>
                                </Button>
                            ))}
                        </div>

                        {/* Search Input */}
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input type="text"
                                placeholder="Search..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-9 pr-4 h-10 rounded-xl bg-muted/50 border-transparent focus-visible:bg-background focus-visible:ring-primary/20 transition-all placeholder:text-muted-foreground/50"
                            />
                        </div>
                    </div>
                </AnimatedDiv>

                {/* Project Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                    {filteredProjects.map((project) => (
                        <AnimatedDiv key={project.id} layout
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            whileInView={{ opacity: 1, scale: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="group h-full cursor-pointer"
                            onClick={() => window.location.href = `/portfolio/${project.slug || project.id}`}
                        >
                            <div className="h-full bg-card hover:bg-card/80 border border-border/50 hover:border-primary/20 rounded-[2rem] overflow-hidden cursor-pointer shadow-sm hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 flex flex-col relative group-hover:-translate-y-2">
                                
                                {/* Image Area */}
                                <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted group/image">
                                    {project.image ? (
                                        <Image src={project.image} alt={project.title} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-4xl font-semibold text-foreground/5 tracking-tighter">{project.category}</span>
                                        </div>
                                    )}
                                    {project.url && (
                                        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover/image:opacity-100 transition-opacity duration-300">
                                            <a href={project.url} target="_blank" rel="noopener noreferrer"
                                                onClick={(e) => e.stopPropagation()}
                                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-bold text-sm shadow-lg shadow-primary/25 hover:bg-primary/90 hover:scale-105 transition-all">
                                                <ExternalLink className="w-4 h-4" />
                                                Live Preview
                                            </a>
                                        </div>
                                    )}
                                </div>

                                {/* Info Area */}
                                <div className="p-6 md:p-8 flex flex-col flex-grow bg-card">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-xl font-bold group-hover:text-primary transition-colors">{project.title}</h3>
                                    </div>
                                    <p className="text-muted-foreground text-sm line-clamp-2 mb-6 flex-grow">{project.description}</p>
                                    
                                    <div className="pt-6 border-t border-border/50 flex items-center justify-between text-xs font-medium text-muted-foreground">
                                        <span>{project.client}</span>
                                        <div className="flex items-center gap-1 text-primary hover:underline">
                                            View Case Study <ArrowRight className="w-3 h-3" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </AnimatedDiv>
                    ))}
                </div>

                {/* Empty State */}
                {filteredProjects.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-muted-foreground">No projects found for your search.</p>
                        <Button 
                            variant="link"
                            onClick={() => { setFilter("All"); setSearch(""); }}
                            className="mt-4 text-primary"
                        >
                            Reset Filters
                        </Button>
                    </div>
                )}


            </div>
        </section>
    );
}

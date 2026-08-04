"use client"
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Globe, Code2, Server, Smartphone, Brain, Cloud, Database, Monitor, Sparkles, ShieldCheck, Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ServicesSidebarProps {
    className?: string;
    selectedCategory: string;
    onCategoryChange: (cat: string) => void;
    priceRange: number[];
    onPriceRangeChange: (range: number[]) => void;
    onReset: () => void;
}

const sidebarCategories = [
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

export function ServicesSidebar({ className, selectedCategory, onCategoryChange, priceRange, onPriceRangeChange, onReset }: ServicesSidebarProps) {
    return (
        <div className={cn("space-y-6", className)}>
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold flex items-center gap-2">
                    <Filter className="w-5 h-5 text-primary" />
                    Filters
                </h3>
                <Button variant="ghost" size="sm" className="h-8 text-muted-foreground hover:text-foreground" onClick={onReset}>
                    Reset
                </Button>
            </div>

            <Separator />

            {/* Oftisoft Seller Card */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-sm font-bold text-primary-foreground">O</div>
                    <div>
                        <p className="font-bold text-sm">Oftisoft</p>
                        <div className="flex items-center gap-1 text-xs text-green-500">
                            <ShieldCheck className="w-3 h-3" />
                            Pro Seller
                        </div>
                    </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">50+ programming services from WordPress to AI. Starting at $99.</p>
            </div>

            <Separator />

            {/* Price Range */}
            <div className="space-y-4">
                <h4 className="font-semibold text-sm">Price Range</h4>
                <Slider
                    min={0}
                    max={15000}
                    step={50}
                    value={priceRange}
                    onValueChange={onPriceRangeChange}
                    className="py-4"
                />
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>${priceRange[0].toLocaleString()}</span>
                    <span>${priceRange[1].toLocaleString()}</span>
                </div>
            </div>

            <Separator />

            {/* Categories */}
            <div className="space-y-1">
                <h4 className="font-semibold text-sm mb-3">Categories</h4>
                {sidebarCategories.map((cat) => {
                    const Icon = cat.icon;
                    const isActive = selectedCategory === cat.id;
                    return (
                        <button
                            key={cat.id}
                            onClick={() => onCategoryChange(cat.id)}
                            className={cn(
                                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left",
                                isActive
                                    ? "bg-primary text-primary-foreground shadow-sm"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <Icon className="w-4 h-4 shrink-0" />
                            <span>{cat.label}</span>
                            {isActive && (
                                <X className="w-3.5 h-3.5 ml-auto" onClick={(e) => { e.stopPropagation(); onCategoryChange("all"); }} />
                            )}
                        </button>
                    );
                })}
            </div>

            <Separator />

            {/* Quick Filters */}
            <div className="space-y-3">
                <h4 className="font-semibold text-sm">Quick Filters</h4>
                <div className="space-y-2">
                    <button onClick={() => onCategoryChange("WordPress")} className={cn("w-full text-left px-3 py-2 rounded-lg text-sm transition-colors", selectedCategory === "WordPress" ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted")}>
                        🔹 WordPress Fix & Setup
                    </button>
                    <button onClick={() => onCategoryChange("Web Development")} className={cn("w-full text-left px-3 py-2 rounded-lg text-sm transition-colors", selectedCategory === "Web Development" ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted")}>
                        🔹 React / Next.js Apps
                    </button>
                    <button onClick={() => onCategoryChange("AI & Machine Learning")} className={cn("w-full text-left px-3 py-2 rounded-lg text-sm transition-colors", selectedCategory === "AI & Machine Learning" ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted")}>
                        🔹 AI Chatbots & Automation
                    </button>
                    <button onClick={() => onCategoryChange("Mobile Development")} className={cn("w-full text-left px-3 py-2 rounded-lg text-sm transition-colors", selectedCategory === "Mobile Development" ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted")}>
                        🔹 Mobile App Development
                    </button>
                </div>
            </div>
        </div>
    );
}

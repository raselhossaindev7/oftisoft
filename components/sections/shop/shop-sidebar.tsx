"use client";

import { useShopContentStore } from "@/lib/store/shop-content";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ShopSidebarProps {
    className?: string;
    priceRange: number[];
    onPriceRangeChange: (range: number[]) => void;
    selectedSubcategories: string[];
    onSubcategoryChange: (subcategories: string[]) => void;
}

export function ShopSidebar({ className, priceRange, onPriceRangeChange, selectedSubcategories, onSubcategoryChange }: ShopSidebarProps) {
    const { content } = useShopContentStore();
    const categories = content?.categories || [];

    const handleSubcategoryToggle = (sub: string) => {
        if (selectedSubcategories.includes(sub)) {
            onSubcategoryChange(selectedSubcategories.filter(s => s !== sub));
        } else {
            onSubcategoryChange([...selectedSubcategories, sub]);
        }
    };

    return (
        <div className={cn("space-y-6", className)}>
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold flex items-center gap-2">
                    <Filter className="w-5 h-5 text-primary" />
                    Filters
                </h3>
                <Button variant="ghost" size="sm" className="h-8 text-muted-foreground hover:text-foreground" onClick={() => { onPriceRangeChange([0, 1000]); onSubcategoryChange([]); }}>
                    Reset
                </Button>
            </div>

            <Separator />

            {/* Price Range */}
            <div className="space-y-4">
                <h4 className="font-semibold text-sm">Price Range</h4>
                <Slider defaultValue={[0, 1000]}
                    max={2000}
                    step={10}
                    value={priceRange}
                    onValueChange={onPriceRangeChange}
                    className="py-4"
                    aria-label="Price range filter"
                />
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                </div>
            </div>

            <Separator />

            {/* Categories */}
            <div className="space-y-4">
                <h4 className="font-semibold text-sm">Categories</h4>
                <Accordion type="multiple" className="w-full">
                    {categories.map((category) => (
                        <AccordionItem key={category.id} value={category.id} className="border-none">
                            <AccordionTrigger className="py-2 text-sm hover:no-underline hover:text-primary">
                                {category.name}
                            </AccordionTrigger>
                            <AccordionContent>
                                <div className="space-y-2 pt-1 pl-2">
                                    {category.subcategories.map((sub) => (
                                        <div key={sub} className="flex items-center gap-2">
                                            <Checkbox
                                                id={`${category.id}-${sub}`}
                                                checked={selectedSubcategories.includes(sub)}
                                                onCheckedChange={() => handleSubcategoryToggle(sub)}
                                            />
                                            <Label htmlFor={`${category.id}-${sub}`} className="text-xs font-normal text-muted-foreground cursor-pointer hover:text-foreground">
                                                {sub}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>

            <Separator />

            {/* Compatibility */}
            <div className="space-y-4">
                <h4 className="font-semibold text-sm">Compatibility</h4>
                <div className="space-y-2">
                    {["Next.js 14+", "React 18+", "Tailwind 4+", "WordPress 6.0+", "iOS 15+", "Android 12+", "Figma"].map((tech) => (
                        <div key={tech} className="flex items-center gap-2">
                            <Checkbox
                                id={`tech-${tech}`}
                                checked={selectedSubcategories.includes(tech)}
                                onCheckedChange={() => handleSubcategoryToggle(tech)}
                            />
                            <Label htmlFor={`tech-${tech}`} className="text-xs font-normal text-muted-foreground cursor-pointer hover:text-foreground">
                                {tech}
                            </Label>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

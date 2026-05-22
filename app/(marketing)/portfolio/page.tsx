"use client";
import PortfolioMain from "@/components/sections/portfolio/portfolio-main";
import SuccessStories from "@/components/sections/portfolio/success-stories";
import TechBreakdown from "@/components/sections/portfolio/tech-breakdown";
import CTA from "@/components/sections/cta";

export default function PortfolioPage() {
    return (
        <main className="flex min-h-screen flex-col bg-background text-foreground overflow-hidden">
            <PortfolioMain />
            <SuccessStories />
            <TechBreakdown />
            <CTA />
        </main>
    );
}


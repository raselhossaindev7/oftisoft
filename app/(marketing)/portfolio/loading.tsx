import { PortfolioGridSkeleton, SectionHeaderSkeleton } from "@/components/sections/marketing-skeletons";

export default function PortfolioLoading() {
    return (
        <div className="min-h-screen bg-background overflow-hidden">
            <div className="container px-6 mx-auto space-y-24 pt-32 pb-24">
                <SectionHeaderSkeleton />
                <PortfolioGridSkeleton />
                <SectionHeaderSkeleton />
                <PortfolioGridSkeleton />
            </div>
        </div>
    );
}

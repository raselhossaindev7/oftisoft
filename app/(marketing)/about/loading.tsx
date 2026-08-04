import { HeroSkeleton, CardGridSkeleton, SectionHeaderSkeleton, MarqueeSkeleton } from "@/components/sections/marketing-skeletons";

export default function AboutLoading() {
    return (
        <div className="min-h-screen pt-32 pb-24 bg-[#020202]">
            <div className="container px-6 mx-auto space-y-24">
                <HeroSkeleton />
                <MarqueeSkeleton />
                <CardGridSkeleton count={4} />
                <SectionHeaderSkeleton />
                <CardGridSkeleton count={3} />
                <SectionHeaderSkeleton />
            </div>
        </div>
    );
}

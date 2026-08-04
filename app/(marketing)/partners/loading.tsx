import { HeroSkeleton, CardGridSkeleton } from "@/components/sections/marketing-skeletons";

export default function PartnersLoading() {
    return (
        <div className="min-h-screen pt-32 pb-24 bg-[#020202]">
            <div className="container px-6 mx-auto space-y-24">
                <HeroSkeleton />
                <CardGridSkeleton count={4} />
            </div>
        </div>
    );
}

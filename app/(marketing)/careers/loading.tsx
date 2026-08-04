import { HeroSkeleton, CardGridSkeleton } from "@/components/sections/marketing-skeletons";
import { Skeleton } from "@/components/ui/skeleton";

export default function CareersLoading() {
    return (
        <div className="min-h-screen pt-32 pb-24 bg-[#020202]">
            <div className="container px-6 mx-auto space-y-24">
                <HeroSkeleton />
                <CardGridSkeleton count={4} />
                <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-white/10 pb-8">
                        <Skeleton className="h-10 w-64 rounded-xl" />
                        <Skeleton className="h-8 w-28 rounded-full" />
                    </div>
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="rounded-[32px] border border-white/5 bg-white/[0.01] p-8 md:p-10 flex items-center justify-between gap-8">
                            <div className="flex items-center gap-8">
                                <Skeleton className="h-14 w-14 rounded-2xl shrink-0" />
                                <div className="space-y-2">
                                    <Skeleton className="h-6 w-56 rounded-lg" />
                                    <Skeleton className="h-4 w-40 rounded-lg" />
                                </div>
                            </div>
                            <Skeleton className="h-14 w-44 rounded-2xl shrink-0" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

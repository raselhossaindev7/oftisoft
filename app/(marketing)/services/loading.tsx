import { HeroSkeleton, CardGridSkeleton, SectionHeaderSkeleton } from "@/components/sections/marketing-skeletons";
import { Skeleton } from "@/components/ui/skeleton";

export default function ServicesLoading() {
    return (
        <div className="min-h-screen bg-background overflow-hidden">
            <div className="container px-4 mx-auto space-y-24 pt-32 md:pt-44 pb-24">
                <div className="space-y-6 text-center">
                    <Skeleton className="h-8 w-64 rounded-full mx-auto" />
                    <Skeleton className="h-16 w-3/4 max-w-3xl mx-auto rounded-xl" />
                    <Skeleton className="h-5 w-full max-w-2xl mx-auto rounded-lg" />
                    <Skeleton className="h-5 w-2/3 max-w-md mx-auto rounded-lg" />
                    <Skeleton className="h-16 w-full max-w-2xl mx-auto rounded-2xl mt-4" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    {Array.from({ length: 9 }).map((_, i) => (
                        <div key={i} className="rounded-3xl border border-white/5 bg-white/[0.02] p-6 space-y-4">
                            <Skeleton className="h-10 w-10 rounded-xl" />
                            <Skeleton className="h-6 w-3/4 rounded-lg" />
                            <Skeleton className="h-4 w-full rounded-lg" />
                            <Skeleton className="h-4 w-5/6 rounded-lg" />
                            <Skeleton className="h-8 w-24 rounded-full mt-4" />
                        </div>
                    ))}
                </div>
                <SectionHeaderSkeleton />
                <CardGridSkeleton count={3} />
            </div>
        </div>
    );
}

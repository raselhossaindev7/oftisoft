import { Skeleton } from "@/components/ui/skeleton";

export function HeroSkeleton() {
    return (
        <div className="flex flex-col items-center text-center space-y-6 py-12">
            <Skeleton className="h-8 w-32 rounded-full" />
            <Skeleton className="h-14 w-3/4 max-w-lg rounded-xl" />
            <Skeleton className="h-5 w-full max-w-md rounded-lg" />
            <Skeleton className="h-5 w-2/3 max-w-sm rounded-lg" />
            <Skeleton className="h-14 w-48 rounded-2xl mt-4" />
        </div>
    );
}

export function CardGridSkeleton({ count = 3 }: { count?: number }) {
    return (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="rounded-3xl border border-white/5 bg-white/[0.02] p-8 space-y-6">
                    <Skeleton className="h-14 w-14 rounded-2xl" />
                    <Skeleton className="h-6 w-2/3 rounded-lg" />
                    <div className="space-y-3">
                        <Skeleton className="h-4 w-full rounded-lg" />
                        <Skeleton className="h-4 w-5/6 rounded-lg" />
                        <Skeleton className="h-4 w-4/6 rounded-lg" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export function SectionHeaderSkeleton() {
    return (
        <div className="flex flex-col items-center text-center space-y-4 py-8">
            <Skeleton className="h-6 w-28 rounded-full" />
            <Skeleton className="h-12 w-2/3 max-w-lg rounded-xl" />
            <Skeleton className="h-5 w-full max-w-md rounded-lg" />
        </div>
    );
}

export function MarqueeSkeleton() {
    return (
        <div className="flex gap-4 items-center overflow-hidden py-6">
            {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-36 rounded-full shrink-0" />
            ))}
        </div>
    );
}

export function FaqSkeleton() {
    return (
        <div className="max-w-3xl mx-auto space-y-4 py-12">
            <SectionHeaderSkeleton />
            {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-white/5 p-6 space-y-3">
                    <Skeleton className="h-5 w-3/4 rounded-lg" />
                    <Skeleton className="h-4 w-full rounded-lg" />
                    <Skeleton className="h-4 w-5/6 rounded-lg" />
                </div>
            ))}
        </div>
    );
}

export function ContactFormSkeleton() {
    return (
        <div className="grid lg:grid-cols-2 gap-16 py-12">
            <div className="space-y-10">
                <div className="space-y-4">
                    <Skeleton className="h-6 w-28 rounded-full" />
                    <Skeleton className="h-14 w-full max-w-sm rounded-xl" />
                    <Skeleton className="h-5 w-full max-w-md rounded-lg" />
                </div>
                <div className="space-y-6">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-6">
                            <Skeleton className="h-16 w-16 rounded-2xl shrink-0" />
                            <div className="space-y-2">
                                <Skeleton className="h-3 w-16 rounded-lg" />
                                <Skeleton className="h-5 w-48 rounded-lg" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="rounded-[40px] border border-white/5 bg-white/[0.02] p-10 space-y-6">
                <Skeleton className="h-8 w-48 rounded-xl" />
                <Skeleton className="h-5 w-3/4 rounded-lg" />
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Skeleton className="h-3 w-20 rounded-lg" />
                        <Skeleton className="h-14 w-full rounded-2xl" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-3 w-20 rounded-lg" />
                        <Skeleton className="h-14 w-full rounded-2xl" />
                    </div>
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-3 w-20 rounded-lg" />
                    <Skeleton className="h-14 w-full rounded-2xl" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-3 w-20 rounded-lg" />
                    <Skeleton className="h-40 w-full rounded-[32px]" />
                </div>
                <Skeleton className="h-16 w-full rounded-[28px]" />
            </div>
        </div>
    );
}

export function PortfolioGridSkeleton() {
    return (
        <div className="space-y-12 py-12">
            <SectionHeaderSkeleton />
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="rounded-3xl border border-white/5 bg-white/[0.02] overflow-hidden space-y-0">
                        <Skeleton className="h-48 w-full rounded-none" />
                        <div className="p-6 space-y-3">
                            <Skeleton className="h-3 w-20 rounded-full" />
                            <Skeleton className="h-6 w-3/4 rounded-lg" />
                            <Skeleton className="h-4 w-full rounded-lg" />
                            <Skeleton className="h-4 w-2/3 rounded-lg" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

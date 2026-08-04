"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function ShopError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
            <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
            <p className="text-muted-foreground mb-8 max-w-md">
                An unexpected error occurred while loading the shop. Please try again or contact support if the problem persists.
            </p>
            <div className="flex gap-4">
                <Button onClick={reset} variant="outline">Try Again</Button>
                <Button onClick={() => (window.location.href = "/")}>Go Home</Button>
            </div>
        </div>
    );
}

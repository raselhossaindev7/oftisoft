import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, XCircle, RotateCcw, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
    status: string | undefined;
    className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
    switch ((status || '').toLowerCase()) {
        case "completed":
            return (
                <Badge className={cn("bg-green-500/10 text-green-500 border-green-500/20 gap-1.5 hover:bg-green-500/20 transition-colors", className)}>
                    <CheckCircle2 className="w-3 h-3" /> Completed
                </Badge>
            );
        case "processing":
            return (
                <Badge className={cn("bg-blue-500/10 text-blue-500 border-blue-500/20 gap-1.5 hover:bg-blue-500/20 transition-colors", className)}>
                    <Clock className="w-3 h-3" /> Processing
                </Badge>
            );
        case "pending":
            return (
                <Badge className={cn("bg-orange-500/10 text-orange-500 border-orange-500/20 gap-1.5 hover:bg-orange-500/20 transition-colors", className)}>
                    <AlertCircle className="w-3 h-3" /> Pending
                </Badge>
            );
        case "cancelled":
            return (
                <Badge className={cn("bg-destructive/10 text-destructive border-destructive/20 gap-1.5 hover:bg-destructive/20 transition-colors", className)}>
                    <XCircle className="w-3 h-3" /> Cancelled
                </Badge>
            );
        case "refunded":
            return (
                <Badge className={cn("bg-purple-500/10 text-purple-500 border-purple-500/20 gap-1.5 hover:bg-purple-500/20 transition-colors", className)}>
                    <RotateCcw className="w-3 h-3" /> Refunded
                </Badge>
            );
        default:
            return <Badge variant="outline" className={cn("gap-1.5", className)}>{status || "—"}</Badge>;
    }
}

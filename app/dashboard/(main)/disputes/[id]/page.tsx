"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Flag, ArrowLeft, CheckCircle2, XCircle, Clock, Send, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { disputesAPI, type Dispute } from "@/lib/api/domains/disputes";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  open: "bg-red-500/10 text-red-500",
  under_review: "bg-amber-500/10 text-amber-500",
  resolved: "bg-green-500/10 text-green-500",
  closed: "bg-muted/10 text-muted-foreground",
};

export default function DisputeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [resolution, setResolution] = useState("");
  const [action, setAction] = useState<"resolved" | "closed">("resolved");

  const { data: disputeData, isLoading } = useQuery({
    queryKey: ["disputes", id],
    queryFn: () => disputesAPI.getOne(id),
    enabled: !!id,
  });

  const dispute = disputeData as Dispute | undefined;

  const resolveMutation = useMutation({
    mutationFn: (data: { resolution: string; status: "resolved" | "closed" }) =>
      disputesAPI.resolve(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["disputes"] });
      toast.success("Dispute resolved");
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || "Failed to resolve"),
  });

  const isStaff = ["SuperAdmin", "Admin"].includes(user?.role || "");
  const canResolve = isStaff && dispute?.status !== "resolved" && dispute?.status !== "closed";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!dispute) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <AlertCircle className="w-16 h-16 text-muted-foreground opacity-20" />
        <h2 className="text-2xl font-bold">Dispute Not Found</h2>
        <Button asChild><Link href="/dashboard/disputes"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Disputes</Link></Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 mx-auto pb-20 max-w-3xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon" className="rounded-full">
            <Link href="/dashboard/disputes"><ArrowLeft className="w-5 h-5" /></Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-semibold">Dispute Details</h1>
              <Badge className={`${statusColors[dispute.status] || ""} border-none`}>
                {dispute.status.replace("_", " ")}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flag className="w-5 h-5 text-destructive" /> {dispute.reason}
          </CardTitle>
          <CardDescription>
            Raised by {dispute.users?.name || "Unknown"} on{" "}
            {new Date(dispute.createdAt).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {dispute.description && (
            <div className="p-4 rounded-xl bg-muted/20 border border-border/50">
              <p className="text-sm font-semibold mb-2">Description</p>
              <p className="text-sm text-muted-foreground">{dispute.description}</p>
            </div>
          )}

          <div className="p-4 rounded-xl bg-muted/20 border border-border/50">
            <p className="text-sm font-semibold mb-2">Related Project</p>
            <Link
              href={`/dashboard/services/${dispute.projectId}`}
              className="text-sm text-primary hover:underline font-medium"
            >
              {dispute.projects?.title || "View Project"} →
            </Link>
          </div>

          {dispute.resolution && (
            <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/20">
              <p className="text-sm font-semibold text-green-500 mb-2">Resolution</p>
              <p className="text-sm text-muted-foreground">{dispute.resolution}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {canResolve && (
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Resolve Dispute</CardTitle>
            <CardDescription>Provide a resolution and close this dispute.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={action === "resolved" ? "default" : "outline"}
                className="rounded-xl gap-1"
                onClick={() => setAction("resolved")}
              >
                <CheckCircle2 className="w-4 h-4" /> Resolved
              </Button>
              <Button
                size="sm"
                variant={action === "closed" ? "default" : "outline"}
                className="rounded-xl gap-1"
                onClick={() => setAction("closed")}
              >
                <XCircle className="w-4 h-4" /> Close without resolution
              </Button>
            </div>
            <Textarea
              placeholder="Write your resolution..."
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              className="min-h-[120px] rounded-xl"
            />
            <Button
              className="rounded-xl gap-2"
              disabled={!resolution.trim() || resolveMutation.isPending}
              onClick={() => resolveMutation.mutate({ resolution, status: action })}
            >
              {resolveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Submit Resolution
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

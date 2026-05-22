"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Flag, ArrowLeft, Search, CheckCircle2, XCircle, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { disputesAPI, type Dispute } from "@/lib/api/domains/disputes";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  open: "bg-red-500/10 text-red-500",
  under_review: "bg-amber-500/10 text-amber-500",
  resolved: "bg-green-500/10 text-green-500",
  closed: "bg-muted/10 text-muted-foreground",
};

export default function DisputesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  const { data: disputesData, isLoading } = useQuery({
    queryKey: ["disputes"],
    queryFn: () => disputesAPI.getAll(),
  });

  const disputes = Array.isArray(disputesData) ? disputesData : (disputesData as any)?.data || [];

  const filtered = search
    ? disputes.filter(
        (d: Dispute) =>
          d.reason?.toLowerCase().includes(search.toLowerCase()) ||
          d.projects?.title?.toLowerCase().includes(search.toLowerCase()) ||
          d.users?.name?.toLowerCase().includes(search.toLowerCase())
      )
    : disputes;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "resolved": return <CheckCircle2 className="w-4 h-4" />;
      case "closed": return <XCircle className="w-4 h-4" />;
      case "under_review": return <Clock className="w-4 h-4" />;
      default: return <Flag className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-8 mx-auto pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon" className="rounded-full">
            <Link href="/dashboard">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-semibold flex items-center gap-3">
              <Flag className="w-6 h-6 text-destructive" /> Disputes
            </h1>
            <p className="text-muted-foreground text-sm">
              Review and resolve client disputes
            </p>
          </div>
        </div>
      </div>

      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search disputes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 rounded-xl h-10"
              />
            </div>
            <Badge variant="secondary" className="text-xs">
              {filtered.length} dispute{filtered.length !== 1 ? "s" : ""}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <Flag className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No disputes found</p>
            </div>
          ) : (
            filtered.map((dispute: Dispute) => (
              <Link
                key={dispute.id}
                href={`/dashboard/disputes/${dispute.id}`}
                className="flex items-center justify-between p-4 rounded-xl bg-muted/20 border border-border/50 hover:bg-muted/40 transition-colors group"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    dispute.status === "resolved" ? "bg-green-500/10" :
                    dispute.status === "closed" ? "bg-muted/20" :
                    "bg-red-500/10"
                  }`}>
                    {getStatusIcon(dispute.status)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{dispute.reason}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {dispute.projects?.title} — {dispute.users?.name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Badge className={`${statusColors[dispute.status] || ""} border-none text-xs`}>
                    {dispute.status.replace("_", " ")}
                  </Badge>
                </div>
              </Link>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

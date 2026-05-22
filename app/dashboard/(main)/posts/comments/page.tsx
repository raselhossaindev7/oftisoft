"use client";

import { useState } from "react";
import {
  MessageCircle,
  Search,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  RefreshCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { commentsAPI, type Comment } from "@/lib/api";
import { format } from "date-fns";
import { toast } from "sonner";
import Link from "next/link";

const statusColors: Record<string, string> = {
  approved: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  spam: "bg-red-500/10 text-red-500 border-red-500/20",
};

const statusIcons: Record<string, any> = {
  approved: CheckCircle2,
  pending: Clock,
  spam: AlertCircle,
};

export default function CommentsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const queryClient = useQueryClient();

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ["admin-comments"],
    queryFn: () => commentsAPI.getAll(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => commentsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-comments"] });
      toast.success("Comment deleted");
    },
    onError: () => toast.error("Failed to delete comment"),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      commentsAPI.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-comments"] });
      toast.success("Status updated");
    },
    onError: () => toast.error("Failed to update status"),
  });

  const filtered = comments.filter((c) => {
    const matchesSearch =
              (c.content || '').toLowerCase().includes(search.toLowerCase()) ||
      c.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.post?.title?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const counts = {
    total: comments.length,
    approved: comments.filter((c) => c.status === "approved").length,
    pending: comments.filter((c) => c.status === "pending").length,
    spam: comments.filter((c) => c.status === "spam").length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Comments</h1>
        <p className="text-muted-foreground mt-1">
          Moderate comments across all posts
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total", value: counts.total, color: "" },
          { label: "Approved", value: counts.approved, color: "text-emerald-500" },
          { label: "Pending", value: counts.pending, color: "text-amber-500" },
          { label: "Spam", value: counts.spam, color: "text-red-500" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search comments, authors, posts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="spam">Spam</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline"
          size="icon"
          onClick={() => queryClient.invalidateQueries({ queryKey: ["admin-comments"] })}
        >
          <RefreshCcw className="w-4 h-4" />
        </Button>
      </div>

      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Comment</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Post</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[180px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  Loading comments...
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  No comments found
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((comment) => {
                const StatusIcon = statusIcons[comment.status] || Clock;
                return (
                  <TableRow key={comment.id}>
                    <TableCell className="max-w-xs">
                      <p className="text-sm line-clamp-2">{comment.content}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                          {(comment.user?.name || "A")[0].toUpperCase()}
                        </div>
                        <span className="text-sm">{comment.user?.name || "Anonymous"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {comment.post ? (
                        <Link href={`/blog/${comment.post.slug}`}
                          target="_blank"
                          className="text-sm text-primary hover:underline flex items-center gap-1"
                        >
                          {comment.post.title.length > 30
                            ? comment.post.title.slice(0, 30) + "..."
                            : comment.post.title}
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      ) : (
                        <span className="text-sm text-muted-foreground">Deleted</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {format(new Date(comment.createdAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline"
                        className={`gap-1 ${statusColors[comment.status] || ""}`}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {comment.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Select value={comment.status}
                          onValueChange={(value) =>
                            statusMutation.mutate({ id: comment.id, status: value })
                          }
                        >
                          <SelectTrigger className="h-8 w-[110px] text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="spam">Spam</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          onClick={() => {
                            if (confirm("Delete this comment?")) {
                              deleteMutation.mutate(comment.id);
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

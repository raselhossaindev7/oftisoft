"use client";

import { useState } from "react";
import { ShoppingBag, CheckCircle2, Clock, AlertCircle, Search, Loader2, RefreshCw, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { projectsAPI } from "@/lib/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function ServiceOrdersQueuePage() {
    const [searchQuery, setSearchQuery] = useState("");
    const router = useRouter();
    const queryClient = useQueryClient();

    const { data: ordersResponse, isLoading, refetch, isError, error } = useQuery({
        queryKey: ['service-orders-queue'],
        queryFn: projectsAPI.getServiceOrders,
        retry: 1,
    });

    const orders = Array.isArray(ordersResponse) ? ordersResponse : (ordersResponse as any)?.data || [];

    const acceptMutation = useMutation({
        mutationFn: projectsAPI.acceptOrderAsProject,
        onSuccess: (project) => {
            queryClient.invalidateQueries({ queryKey: ['service-orders-queue'] });
            toast.success("Order accepted! Project created successfully.");
            router.push(`/dashboard/services/${project.id}`);
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || "Failed to accept order");
        },
    });

    const filtered = orders.filter((o: any) =>
        o.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.order_items?.some((i: any) => i.productName?.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <AlertCircle className="w-16 h-16 text-destructive opacity-50" />
                <h2 className="text-2xl font-bold">Failed to load orders</h2>
                <p className="text-muted-foreground text-sm">{(error as any)?.message || 'An unexpected error occurred'}</p>
                <Button variant="outline" onClick={() => refetch()} className="gap-2 rounded-xl">
                    <RefreshCw className="w-4 h-4" /> Try Again
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Service Orders Queue</h1>
                    <p className="text-muted-foreground mt-1">Review and accept incoming service orders from customers.</p>
                </div>
                <Button variant="outline" onClick={() => refetch()} className="gap-2 rounded-xl">
                    <RefreshCw className="w-4 h-4" /> Refresh
                </Button>
            </div>

            <Card className="border-border/50">
                <CardHeader className="p-4 border-b border-border/50">
                    <div className="flex items-center gap-3">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search orders..."
                                className="pl-10 h-10 rounded-xl"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Badge variant="secondary" className="text-sm px-3 py-1">
                            {filtered.length} pending
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {filtered.length > 0 ? (
                        <div className="divide-y divide-border/50">
                            {filtered.map((order: any) => {
                                const firstItem = order.order_items?.[0];
                                return (
                                    <div key={order.id} className="p-6 hover:bg-muted/5 transition-colors">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20 gap-1">
                                                        <Clock className="w-3 h-3" /> Pending
                                                    </Badge>
                                                    <span className="text-sm font-mono text-muted-foreground">
                                                        #{order.orderNumber || order.id?.slice(0, 8) || "—"}
                                                    </span>
                                                </div>
                                                <h3 className="font-bold text-lg mb-1">{firstItem?.productName || "Service Order"}</h3>
                                                {order.order_items && order.order_items.length > 0 && (
                                                    <p className="text-sm text-muted-foreground mb-1">
                                                        Items: {order.order_items.map((i: any) => i.productName).join(", ")}
                                                    </p>
                                                )}
                                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                    <span>Customer: {order.users?.name || order.users?.email || "Unknown"}</span>
                                                    <span>Total: ${Number(order.total).toFixed(2)}</span>
                                                    <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 shrink-0">
                                                <Button
                                                    onClick={() => { if (order.id) acceptMutation.mutate(order.id); else toast.error("Invalid order ID"); }}
                                                    disabled={acceptMutation.isPending}
                                                    className="rounded-xl gap-2"
                                                >
                                                    {acceptMutation.isPending ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <CheckCircle2 className="w-4 h-4" />
                                                    )}
                                                    Accept & Create Project
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => router.push(`/dashboard/orders?search=${order.id}`)}>
                                                    <ChevronRight className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="p-12 text-center">
                            <ShoppingBag className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                            <h3 className="text-lg font-bold mb-1">No pending service orders</h3>
                            <p className="text-muted-foreground text-sm">All service orders have been accepted and converted to projects.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

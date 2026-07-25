"use client"

import { useState } from "react"
import { Download, Users, Package, Calendar, Loader2, RefreshCw, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useQuery } from "@tanstack/react-query"
import { adminAPI } from "@/lib/api"
import { RoleGuard } from "@/components/auth/role-guard"
import { format } from "date-fns"

export default function DownloadAnalyticsPage() {
  const [days, setDays] = useState(30)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-analytics-downloads", days],
    queryFn: () => adminAPI.getDownloadAnalytics(days),
  })

  const summary = data?.summary
  const byDay = data?.downloadsByDay || []
  const topProducts = data?.topProducts || []
  const recent = data?.recentDownloads || []

  const maxCount = byDay.length > 0 ? Math.max(...byDay.map((d: any) => d.count)) : 1;

  return (
    <RoleGuard allowedRoles={["Admin", "SuperAdmin"]}>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Download Analytics</h1>
            <p className="text-muted-foreground">Track who is downloading your products and how often.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => refetch()} className="rounded-xl font-bold text-sm h-10 gap-2">
              <RefreshCw className="w-4 h-4" /> Refresh
            </Button>
            {[7, 30, 90].map((d) => (
              <Button key={d}
                variant={days === d ? "default" : "outline"}
                className="rounded-xl font-bold text-sm h-10"
                onClick={() => setDays(d)}
              >
                {d}d
              </Button>
            ))}
          </div>
        </div>

        {/* Error State */}
        {isError && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-6 text-center">
            <AlertCircle className="w-10 h-10 text-destructive mx-auto mb-3" />
            <h3 className="text-lg font-bold mb-2">Failed to load download analytics</h3>
            <p className="text-sm text-muted-foreground mb-4">Something went wrong while fetching analytics data.</p>
            <Button variant="outline" onClick={() => refetch()}>
              Try Again
            </Button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
              <Download className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? <Skeleton className="h-8 w-16" /> : summary?.totalDownloads || 0}</div>
              <p className="text-xs text-muted-foreground">Last {days} days</p>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Unique Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? <Skeleton className="h-8 w-16" /> : summary?.uniqueUsers || 0}</div>
              <p className="text-xs text-muted-foreground">Distinct downloaders</p>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Products Downloaded</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoading ? <Skeleton className="h-8 w-16" /> : summary?.uniqueProducts || 0}</div>
              <p className="text-xs text-muted-foreground">Unique products</p>
            </CardContent>
          </Card>
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Date Range</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{days}</div>
              <p className="text-xs text-muted-foreground">Days analyzed</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Downloads by Day Chart */}
          <Card className="lg:col-span-2 border-border/50 overflow-hidden">
            <CardHeader className="bg-muted/20 border-b border-border/50">
              <CardTitle className="text-lg font-bold">Downloads by Day</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-6 flex-1 rounded-lg" />
                      <Skeleton className="h-4 w-8" />
                    </div>
                  ))}
                </div>
              ) : byDay.length === 0 ? (
                <p className="text-center text-muted-foreground py-8 font-bold">No download data</p>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {byDay.slice().reverse().map((d: any) => (
                    <div key={d.date} className="flex items-center gap-4">
                      <span className="text-xs font-bold text-muted-foreground w-24">{d.date}</span>
                      <div className="flex-1 h-6 bg-muted/30 rounded-lg overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-lg transition-all"
                          style={{ width: `${Math.min((d.count / maxCount) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold w-8 text-right">{d.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Products */}
          <Card className="border-border/50 overflow-hidden">
            <CardHeader className="bg-muted/20 border-b border-border/50">
              <CardTitle className="text-lg font-bold">Top Products</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-6 space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div>
                        <Skeleton className="h-4 w-32 mb-1" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                      <Skeleton className="h-6 w-10 rounded-full" />
                    </div>
                  ))}
                </div>
              ) : topProducts.length === 0 ? (
                <p className="text-center text-muted-foreground py-8 font-bold">No data</p>
              ) : (
                <div className="divide-y divide-border/30">
                  {topProducts.slice(0, 10).map((p: any) => (
                    <div key={p.productId} className="flex items-center justify-between px-6 py-4">
                      <div>
                        <p className="text-sm font-bold">{p.productName}</p>
                        <p className="text-xs text-muted-foreground">{p.uniqueUsers} downloaders</p>
                      </div>
                      <Badge variant="secondary" className="font-bold">{p.totalDownloads}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Downloads Table */}
        <Card className="border-border/50 overflow-hidden">
          <CardHeader className="bg-muted/20 border-b border-border/50">
            <CardTitle className="text-lg font-bold">Recent Downloads</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/10 hover:bg-transparent">
                  <TableHead className="font-bold">Product</TableHead>
                  <TableHead className="font-bold">User</TableHead>
                  <TableHead className="font-bold">Version</TableHead>
                  <TableHead className="font-bold">Date</TableHead>
                  <TableHead className="font-bold">IP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    </TableRow>
                  ))
                ) : recent.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-12 text-center text-muted-foreground font-bold">
                      No recent downloads
                    </TableCell>
                  </TableRow>
                ) : recent.map((r: any) => (
                  <TableRow key={r.id} className="group hover:bg-primary/5 transition-colors">
                    <TableCell className="font-bold text-sm">{r.productName}</TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-bold">{r.userName}</p>
                        <p className="text-xs text-muted-foreground">{r.userEmail}</p>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="outline" className="font-mono font-bold text-xs">{r.version}</Badge></TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {format(new Date(r.downloadedAt), "MMM d, yyyy HH:mm")}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{r.ip}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  )
}

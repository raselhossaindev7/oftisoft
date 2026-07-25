"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRole } from "@/hooks/useRole";
import { PermissionGuard } from "@/components/auth/role-guard";
import {
  LayoutDashboard,
  Users,
  DollarSign,
  Wallet,
  Settings,
  TrendingUp,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  MoreHorizontal,
  Download,
  RefreshCw,
  Check,
  X,
  ExternalLink,
  BarChart3,
  History,
  Shield,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAffiliateAdmin } from "@/hooks/useAffiliateAdmin";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

const THEME_PRIMARY = "#6366f1";
const THEME_SECONDARY = "#0ea5e9";
const THEME_SUCCESS = "#22c55e";
const THEME_WARNING = "#f59e0b";
const THEME_DANGER = "#ef4444";

export default function AffiliateAdminPage() {
  const { hasPermission, isStaff, isAdmin, isSuperAdmin } = useRole();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const
{
    dashboardStats,
    affiliates,
    commissions,
    withdrawals,
    auditLogs,
    auditStats,
    isLoading,
    isLoadingAffiliates,
    isLoadingCommissions,
    isLoadingWithdrawals,
    isLoadingAuditLogs,
    pagination,
    fetchDashboard,
    fetchAffiliates,
    fetchCommissions,
    fetchWithdrawals,
    fetchAuditLogs,
    fetchAuditStats,
    approveAffiliate,
    suspendAffiliate,
    banAffiliate,
    updateTier,
    updateRate,
    approveCommission,
    rejectCommission,
    approveWithdrawal,
    rejectWithdrawal,
    completeWithdrawal,
    processWithdrawal,
  } = useAffiliateAdmin();

  // Redirect if no admin permission
  useEffect(() => {
    if (!hasPermission("affiliate.admin")) {
      router.push("/dashboard/affiliate");
    }
  }, [hasPermission, router]);

  if (!hasPermission("affiliate.admin")) {
    return null;
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Affiliate Admin Portal
          </h1>
          <p className="text-muted-foreground font-medium mt-1">
            Comprehensive management system for affiliate program operations.
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => {
              fetchDashboard();
              fetchAffiliates();
              fetchCommissions();
              fetchWithdrawals();
            }}
            disabled={isLoading}
            className="rounded-xl gap-2 font-bold h-11"
          >
            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} /> Refresh
          </Button>
          <PermissionGuard permission="affiliate.settings">
            <Button 
              className="rounded-xl gap-2 font-bold h-11 bg-primary text-white"
              onClick={() => setActiveTab("settings")}
            >
              <Settings className="w-4 h-4" /> Settings
            </Button>
          </PermissionGuard>
        </div>
      </div>

      {/* Stats Overview */}
      {!isLoading && dashboardStats?.overview && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { 
              label: "Total Affiliates", 
              value: dashboardStats.overview.totalAffiliates,
              sub: `${dashboardStats.overview.activeAffiliates} active`,
              icon: Users,
              color: THEME_PRIMARY,
            },
            { 
              label: "Pending Commissions", 
              value: `$${Number(dashboardStats.overview.pendingCommissionAmount || 0).toLocaleString()}`,
              sub: `${dashboardStats.overview.pendingCommissions} orders`,
              icon: DollarSign,
              color: THEME_WARNING,
            },
            { 
              label: "Pending Withdrawals", 
              value: dashboardStats.overview.pendingWithdrawals,
              sub: "Requests awaiting approval",
              icon: Wallet,
              color: THEME_SUCCESS,
            },
            { 
              label: "Total Paid Out", 
              value: `$${Number(dashboardStats.overview.totalPayout || 0).toLocaleString()}`,
              sub: `${dashboardStats.overview.totalCommissions} commissions`,
              icon: TrendingUp,
              color: THEME_SECONDARY,
            },
          ].map((stat, i) => (
            <Card key={i} className="border-border/50 bg-card/50 backdrop-blur-md rounded-[32px] p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold  text-muted-foreground mb-1">
                    {stat.label}
                  </p>
                  <h4 className="text-2xl font-semibold">{stat.value}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{stat.sub}</p>
                </div>
                <div 
                  className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: `${stat.color}20`, color: stat.color }}
                >
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted/50 p-1 rounded-2xl h-14 w-fit border border-border">
          <TabsTrigger value="overview" className="rounded-xl h-auto gap-2 data-[state=active]:bg-background data-[state=active]:shadow-md font-bold px-6">
            <LayoutDashboard className="w-4 h-4" /> Overview
          </TabsTrigger>
          <TabsTrigger value="affiliates" className="rounded-xl h-auto gap-2 data-[state=active]:bg-background data-[state=active]:shadow-md font-bold px-6">
            <Users className="w-4 h-4" /> Affiliates
          </TabsTrigger>
          <TabsTrigger value="commissions" className="rounded-xl h-auto gap-2 data-[state=active]:bg-background data-[state=active]:shadow-md font-bold px-6">
            <DollarSign className="w-4 h-4" /> Commissions
          </TabsTrigger>
          <TabsTrigger value="withdrawals" className="rounded-xl h-auto gap-2 data-[state=active]:bg-background data-[state=active]:shadow-md font-bold px-6">
            <Wallet className="w-4 h-4" /> Withdrawals
          </TabsTrigger>
          <TabsTrigger value="audit" className="rounded-xl h-auto gap-2 data-[state=active]:bg-background data-[state=active]:shadow-md font-bold px-6">
            <History className="w-4 h-4" /> Audit Log
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Monthly Performance Chart */}
            <Card className="border-border/50 bg-card/60 backdrop-blur-md rounded-[32px] p-6">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" /> Monthly Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dashboardStats?.monthlyPerformance || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis 
                        dataKey="month" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: "#888888", fontSize: 12 }} 
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: "#888888", fontSize: 12 }} 
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          borderRadius: '12px', 
                          border: '1px solid hsl(var(--border))',
                        }}
                      />
                      <Bar dataKey="commissions" fill={THEME_PRIMARY} radius={[4, 4, 0, 0]} />
                      <Bar dataKey="withdrawals" fill={THEME_SECONDARY} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Top Affiliates */}
            <Card className="border-border/50 bg-card/60 backdrop-blur-md rounded-[32px] p-6">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" /> Top Affiliates
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-3">
                  {(dashboardStats?.topAffiliates || []).slice(0, 5).map((affiliate: any, index: number) => (
                    <div 
                      key={affiliate.id} 
                      className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                          index === 0 ? "bg-yellow-500/20 text-yellow-500" :
                          index === 1 ? "bg-gray-400/20 text-gray-400" :
                          index === 2 ? "bg-orange-700/20 text-orange-700" :
                          "bg-muted text-muted-foreground"
                        )}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-bold text-sm">{affiliate.user?.name || 'Unknown'}</p>
                          <p className="text-xs text-muted-foreground">{affiliate.user?.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-sm" style={{ color: THEME_PRIMARY }}>
                          ${Number(affiliate.totalEarnings || 0).toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground  font-bold">
                          {affiliate.tier}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Affiliates Tab */}
        <TabsContent value="affiliates" className="space-y-6">
          <AffiliatesList 
            affiliates={affiliates}
            isLoading={isLoadingAffiliates}
            pagination={pagination.affiliates}
            onPageChange={(page: number) => fetchAffiliates({ page })}
            onApprove={approveAffiliate}
            onSuspend={suspendAffiliate}
            onBan={banAffiliate}
            onUpdateTier={updateTier}
            onUpdateRate={updateRate}
            isAdmin={isAdmin || isSuperAdmin}
          />
        </TabsContent>

        {/* Commissions Tab */}
        <TabsContent value="commissions" className="space-y-6">
          <CommissionsList 
            commissions={commissions}
            isLoading={isLoadingCommissions}
            pagination={pagination.commissions}
            onPageChange={(page: number) => fetchCommissions({ page })}
            onApprove={approveCommission}
            onReject={rejectCommission}
            isAdmin={isAdmin || isSuperAdmin}
          />
        </TabsContent>

        {/* Withdrawals Tab */}
        <TabsContent value="withdrawals" className="space-y-6">
          <WithdrawalsList
            withdrawals={withdrawals}
            isLoading={isLoadingWithdrawals}
            pagination={pagination.withdrawals}
            onPageChange={(page: number) => fetchWithdrawals({ page })}
            onApprove={approveWithdrawal}
            onReject={rejectWithdrawal}
            onComplete={completeWithdrawal}
            onProcess={processWithdrawal}
            isAdmin={isAdmin || isSuperAdmin}
          />
        </TabsContent>

        {/* Audit Log Tab */}
        <TabsContent value="audit" className="space-y-6">
          <AuditLogsList
            auditLogs={auditLogs}
            auditStats={auditStats}
            isLoading={isLoadingAuditLogs}
            pagination={pagination.auditLogs}
            onPageChange={(page: number) => fetchAuditLogs({ page })}
            onRefresh={() => {
              fetchAuditLogs();
              fetchAuditStats();
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Affiliates List Component
function AffiliatesList({ 
  affiliates, 
  isLoading, 
  pagination, 
  onPageChange,
  onApprove,
  onSuspend,
  onBan,
  onUpdateTier,
  onUpdateRate,
  isAdmin,
}: any) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tierFilter, setTierFilter] = useState("all");

  const filteredAffiliates = (affiliates?.data || []).filter((a: any) => {
    if (statusFilter !== "all" && a.status !== statusFilter) return false;
    if (tierFilter !== "all" && a.tier !== tierFilter) return false;
    if (search && !a.user?.name?.toLowerCase().includes(search.toLowerCase()) && 
        !a.user?.email?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: "bg-green-500/10 text-green-500 border-green-500/20",
      pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      suspended: "bg-orange-500/10 text-orange-500 border-orange-500/20",
      banned: "bg-red-500/10 text-red-500 border-red-500/20",
    };
    return styles[status] || "bg-gray-500/10 text-gray-500";
  };

  return (
    <Card className="border-border/50 bg-card/60 backdrop-blur-md rounded-[32px] overflow-hidden">
      {/* Filters */}
      <div className="p-6 border-b border-border/50">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search affiliates..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-11 h-12 rounded-2xl"
            />
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] h-12 rounded-2xl">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="banned">Banned</SelectItem>
              </SelectContent>
            </Select>
            <Select value={tierFilter} onValueChange={setTierFilter}>
              <SelectTrigger className="w-[140px] h-12 rounded-2xl">
                <SelectValue placeholder="Tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="bronze">Bronze</SelectItem>
                <SelectItem value="silver">Silver</SelectItem>
                <SelectItem value="gold">Gold</SelectItem>
                <SelectItem value="platinum">Platinum</SelectItem>
                <SelectItem value="diamond">Diamond</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-muted/30 border-b border-border/50 text-sm font-semibold  text-muted-foreground">
              <th className="px-6 py-4">Affiliate</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Tier</th>
              <th className="px-6 py-4">Earnings</th>
              <th className="px-6 py-4">Balance</th>
              <th className="px-6 py-4">Rate</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-8 w-20" /></td>
                </tr>
              ))
            ) : (
              filteredAffiliates.map((affiliate: any) => (
                <tr key={affiliate.id} className="group hover:bg-primary/[0.02]">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {affiliate.user?.name?.[0] || '?'}
                      </div>
                      <div>
                        <p className="font-bold text-sm">{affiliate.user?.name}</p>
                        <p className="text-xs text-muted-foreground">{affiliate.user?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge className={cn("text-sm font-semibold ", getStatusBadge(affiliate.status))}>
                      {affiliate.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="outline" className="text-sm font-semibold ">
                      {affiliate.tier}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 font-mono font-bold">
                    ${Number(affiliate.totalEarnings || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 font-mono font-bold" style={{ color: THEME_PRIMARY }}>
                    ${Number(affiliate.balance || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 font-bold">
                    {affiliate.commissionRate}%
                  </td>
                  <td className="px-6 py-4">
                    {isAdmin && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {affiliate.status === "pending" && (
                            <DropdownMenuItem onClick={() => onApprove(affiliate.id)}>
                              <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Approve
                            </DropdownMenuItem>
                          )}
                          {affiliate.status !== "suspended" && affiliate.status !== "banned" && (
                            <DropdownMenuItem onClick={() => onSuspend(affiliate.id)}>
                              <AlertCircle className="mr-2 h-4 w-4 text-orange-500" /> Suspend
                            </DropdownMenuItem>
                          )}
                          {affiliate.status !== "banned" && (
                            <DropdownMenuItem onClick={() => onBan(affiliate.id)} className="text-red-500">
                              <XCircle className="mr-2 h-4 w-4" /> Ban
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuLabel>Change Tier</DropdownMenuLabel>
                          {["standard", "bronze", "silver", "gold", "platinum", "diamond"].map((tier) => (
                            <DropdownMenuItem 
                              key={tier} 
                              onClick={() => onUpdateTier(affiliate.id, tier)}
                              disabled={affiliate.tier === tier}
                            >
                              {tier.charAt(0).toUpperCase() + tier.slice(1)}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="p-4 border-t border-border/50 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
          </p>
          <div className="flex gap-2">
            <Button variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

// Commissions List Component
function CommissionsList({ 
  commissions, 
  isLoading, 
  pagination, 
  onPageChange,
  onApprove,
  onReject,
  isAdmin,
}: any) {
  const [statusFilter, setStatusFilter] = useState("all");

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      cleared: "bg-green-500/10 text-green-500 border-green-500/20",
      pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
      disputed: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    };
    return styles[status] || "bg-gray-500/10 text-gray-500";
  };

  const filteredCommissions = (commissions?.data || []).filter((c: any) => {
    if (statusFilter === "all") return true;
    return c.status === statusFilter;
  });

  return (
    <Card className="border-border/50 bg-card/60 backdrop-blur-md rounded-[32px] overflow-hidden">
      {/* Filters */}
      <div className="p-6 border-b border-border/50">
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] h-12 rounded-2xl">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Commissions</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="cleared">Cleared</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="disputed">Disputed</SelectItem>
            </SelectContent>
          </Select>
          {isAdmin && (
            <Button variant="outline" className="h-12 rounded-2xl gap-2">
              <Check className="w-4 h-4" /> Bulk Approve
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-muted/30 border-b border-border/50 text-sm font-semibold  text-muted-foreground">
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Affiliate</th>
              <th className="px-6 py-4">Order</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-8 w-20" /></td>
                </tr>
              ))
            ) : (
              filteredCommissions.map((commission: any) => (
                <tr key={commission.id} className="group hover:bg-primary/[0.02]">
                  <td className="px-6 py-4 font-mono text-xs">{commission.id?.substring(0, 8)}</td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-bold text-sm">{commission.affiliate?.user?.name}</p>
                      <p className="text-xs text-muted-foreground">{commission.affiliate?.user?.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs">
                    {commission.order?.id?.substring(0, 8) || 'N/A'}
                  </td>
                  <td className="px-6 py-4 font-mono font-bold" style={{ color: THEME_SUCCESS }}>
                    +${Number(commission.amount).toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <Badge className={cn("text-sm font-semibold ", getStatusBadge(commission.status))}>
                      {commission.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {new Date(commission.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    {isAdmin && commission.status === "pending" && (
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-8 rounded-lg text-green-500 hover:text-green-600 hover:bg-green-500/10"
                          onClick={() => onApprove(commission.id)}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-8 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-500/10"
                          onClick={() => onReject(commission.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="p-4 border-t border-border/50 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <Button variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

// Withdrawals List Component
function WithdrawalsList({ 
  withdrawals, 
  isLoading, 
  pagination, 
  onPageChange,
  onApprove,
  onReject,
  onComplete,
  onProcess,
  isAdmin,
}: any) {
  const [statusFilter, setStatusFilter] = useState("all");

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      processing: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      approved: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
      completed: "bg-green-500/10 text-green-500 border-green-500/20",
      rejected: "bg-red-500/10 text-red-500 border-red-500/20",
      failed: "bg-red-500/10 text-red-500 border-red-500/20",
    };
    return styles[status] || "bg-gray-500/10 text-gray-500";
  };

  const filteredWithdrawals = (withdrawals?.data || []).filter((w: any) => {
    if (statusFilter === "all") return true;
    return w.status === statusFilter;
  });

  return (
    <Card className="border-border/50 bg-card/60 backdrop-blur-md rounded-[32px] overflow-hidden">
      {/* Filters */}
      <div className="p-6 border-b border-border/50">
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] h-12 rounded-2xl">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Withdrawals</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-muted/30 border-b border-border/50 text-sm font-semibold  text-muted-foreground">
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Affiliate</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Method</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-8 w-20" /></td>
                </tr>
              ))
            ) : (
              filteredWithdrawals.map((withdrawal: any) => (
                <tr key={withdrawal.id} className="group hover:bg-primary/[0.02]">
                  <td className="px-6 py-4 font-mono text-xs">{withdrawal.id?.substring(0, 8)}</td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-bold text-sm">{withdrawal.affiliate?.user?.name}</p>
                      <p className="text-xs text-muted-foreground">{withdrawal.affiliate?.user?.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono font-bold" style={{ color: THEME_DANGER }}>
                    -${Number(withdrawal.amount).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-sm ">{withdrawal.method}</td>
                  <td className="px-6 py-4">
                    <Badge className={cn("text-sm font-semibold ", getStatusBadge(withdrawal.status))}>
                      {withdrawal.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {new Date(withdrawal.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    {isAdmin && (
                      <div className="flex gap-2">
                        {withdrawal.status === "pending" && (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-8 rounded-lg text-green-500 hover:text-green-600 hover:bg-green-500/10"
                              onClick={() => onApprove(withdrawal.id)}
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-8 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-500/10"
                              onClick={() => onReject(withdrawal.id)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        {withdrawal.status === "approved" && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-8 rounded-lg text-blue-500 hover:text-blue-600 hover:bg-blue-500/10"
                            onClick={() => onProcess(withdrawal.id)}
                          >
                            Process
                          </Button>
                        )}
                        {withdrawal.status === "processing" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 rounded-lg text-green-500 hover:text-green-600 hover:bg-green-500/10"
                            onClick={() => onComplete(withdrawal.id)}
                          >
                            Complete
                          </Button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="p-4 border-t border-border/50 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <Button variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

// Audit Logs List Component
function AuditLogsList({
  auditLogs,
  auditStats,
  isLoading,
  pagination,
  onPageChange,
  onRefresh,
}: any) {
  const [actionFilter, setActionFilter] = useState("all");
  const [search, setSearch] = useState("");

  const getActionBadge = (action: string) => {
    const styles: Record<string, string> = {
      'affiliate.approved': "bg-green-500/10 text-green-500 border-green-500/20",
      'affiliate.suspended': "bg-orange-500/10 text-orange-500 border-orange-500/20",
      'affiliate.banned': "bg-red-500/10 text-red-500 border-red-500/20",
      'affiliate.tier_changed': "bg-blue-500/10 text-blue-500 border-blue-500/20",
      'affiliate.rate_changed': "bg-purple-500/10 text-purple-500 border-purple-500/20",
      'affiliate.note_added': "bg-gray-500/10 text-gray-500 border-gray-500/20",
      'commission.approved': "bg-green-500/10 text-green-500 border-green-500/20",
      'commission.rejected': "bg-red-500/10 text-red-500 border-red-500/20",
      'commission.bulk_approved': "bg-green-500/10 text-green-500 border-green-500/20",
      'withdrawal.approved': "bg-green-500/10 text-green-500 border-green-500/20",
      'withdrawal.processed': "bg-blue-500/10 text-blue-500 border-blue-500/20",
      'withdrawal.completed': "bg-green-500/10 text-green-500 border-green-500/20",
      'withdrawal.rejected': "bg-red-500/10 text-red-500 border-red-500/20",
    };
    return styles[action] || "bg-gray-500/10 text-gray-500";
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      'affiliate.approved': 'Approved',
      'affiliate.suspended': 'Suspended',
      'affiliate.banned': 'Banned',
      'affiliate.tier_changed': 'Tier Changed',
      'affiliate.rate_changed': 'Rate Changed',
      'affiliate.note_added': 'Note Added',
      'commission.approved': 'Commission Approved',
      'commission.rejected': 'Commission Rejected',
      'commission.bulk_approved': 'Bulk Approved',
      'withdrawal.approved': 'Withdrawal Approved',
      'withdrawal.processed': 'Withdrawal Processed',
      'withdrawal.completed': 'Withdrawal Completed',
      'withdrawal.rejected': 'Withdrawal Rejected',
    };
    return labels[action] || action;
  };

  const getActionIcon = (action: string) => {
    if (action.includes('approved') || action.includes('completed')) return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (action.includes('suspended') || action.includes('rejected') || action.includes('banned')) return <XCircle className="w-4 h-4 text-red-500" />;
    if (action.includes('processed') || action.includes('changed')) return <AlertCircle className="w-4 h-4 text-blue-500" />;
    return <Clock className="w-4 h-4 text-gray-500" />;
  };

  const filteredLogs = (auditLogs?.data || []).filter((log: any) => {
    if (actionFilter !== "all" && log.action !== actionFilter) return false;
    if (search && !log.description?.toLowerCase().includes(search.toLowerCase()) &&
        !log.userEmail?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {auditStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-border/50 bg-card/50 backdrop-blur-md rounded-[24px] p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <History className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Actions</p>
                <p className="text-xl font-bold">{auditStats.totalActions}</p>
              </div>
            </div>
          </Card>
          <Card className="border-border/50 bg-card/50 backdrop-blur-md rounded-[24px] p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Approvals</p>
                <p className="text-xl font-bold">
                  {(auditStats.byAction?.['affiliate.approved'] || 0) +
                   (auditStats.byAction?.['commission.approved'] || 0) +
                   (auditStats.byAction?.['withdrawal.approved'] || 0)}
                </p>
              </div>
            </div>
          </Card>
          <Card className="border-border/50 bg-card/50 backdrop-blur-md rounded-[24px] p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rejections</p>
                <p className="text-xl font-bold">
                  {(auditStats.byAction?.['commission.rejected'] || 0) +
                   (auditStats.byAction?.['withdrawal.rejected'] || 0)}
                </p>
              </div>
            </div>
          </Card>
          <Card className="border-border/50 bg-card/50 backdrop-blur-md rounded-[24px] p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Suspensions</p>
                <p className="text-xl font-bold">
                  {(auditStats.byAction?.['affiliate.suspended'] || 0) +
                   (auditStats.byAction?.['affiliate.banned'] || 0)}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Audit Logs Table */}
      <Card className="border-border/50 bg-card/60 backdrop-blur-md rounded-[32px] overflow-hidden">
        {/* Filters */}
        <div className="p-6 border-b border-border/50">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search audit logs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-11 h-12 rounded-2xl"
              />
            </div>
            <div className="flex gap-2">
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-[200px] h-12 rounded-2xl">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="affiliate.approved">Affiliate Approved</SelectItem>
                  <SelectItem value="affiliate.suspended">Affiliate Suspended</SelectItem>
                  <SelectItem value="affiliate.banned">Affiliate Banned</SelectItem>
                  <SelectItem value="affiliate.tier_changed">Tier Changed</SelectItem>
                  <SelectItem value="affiliate.rate_changed">Rate Changed</SelectItem>
                  <SelectItem value="commission.approved">Commission Approved</SelectItem>
                  <SelectItem value="commission.rejected">Commission Rejected</SelectItem>
                  <SelectItem value="withdrawal.approved">Withdrawal Approved</SelectItem>
                  <SelectItem value="withdrawal.completed">Withdrawal Completed</SelectItem>
                  <SelectItem value="withdrawal.rejected">Withdrawal Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={onRefresh}
                className="h-12 rounded-2xl gap-2"
              >
                <RefreshCw className="w-4 h-4" /> Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-muted/30 border-b border-border/50 text-sm font-semibold text-muted-foreground">
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Target</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Changes</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-48" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                  </tr>
                ))
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    No audit logs found
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log: any) => (
                  <tr key={log.id} className="group hover:bg-primary/[0.02]">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getActionIcon(log.action)}
                        <Badge className={cn("text-xs font-semibold", getActionBadge(log.action))}>
                          {getActionLabel(log.action)}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-sm">{log.userEmail}</p>
                        <p className="text-xs text-muted-foreground">{log.userRole}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-sm capitalize">{log.targetType}</p>
                        <p className="text-xs text-muted-foreground font-mono">{log.targetId?.substring(0, 8)}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm max-w-xs truncate">{log.description}</p>
                    </td>
                    <td className="px-6 py-4">
                      {log.oldValue && log.newValue && (
                        <div className="text-xs space-y-1">
                          {Object.keys(log.newValue).map((key) => (
                            <div key={key} className="flex items-center gap-1">
                              <span className="text-muted-foreground">{key}:</span>
                              <span className="text-red-500 line-through">{JSON.stringify(log.oldValue[key])}</span>
                              <span className="text-green-500">{JSON.stringify(log.newValue[key])}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && (
          <div className="p-4 border-t border-border/50 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Page {pagination.page} of {pagination.totalPages}
            </p>
            <div className="flex gap-2">
              <Button variant="outline"
                size="sm"
                onClick={() => onPageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline"
                size="sm"
                onClick={() => onPageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  History,
  Settings,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  Globe,
  Zap,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Layout,
  Pencil,
  Copy,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";
import { ShoppingBag, Users, BarChart3, Link2, CreditCard } from "lucide-react";

import { useFinance } from "@/hooks/useFinance";
import { withRoleProtection } from "@/components/auth/role-guard";

function FinanceManagementPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [transactionSearch, setTransactionSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [sandboxMode, setSandboxMode] = useState(false);
  const [auditInterval, setAuditInterval] = useState("realtime");
  const [baseCurrency, setBaseCurrency] = useState("usd");
  const [isPayoutDialogOpen, setIsPayoutDialogOpen] = useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState("");
  const [payoutRecipient, setPayoutRecipient] = useState("");
  const [scheduleType, setScheduleType] = useState("monthly");

  const {
    transactions,
    payouts,
    stats,
    config,
    dodoData,
    isLoading,
    isLoadingTransactions,
    isLoadingPayouts,
    isLoadingStats,
    isLoadingDodo,
    isProcessingPayout,
    isSavingConfig,
    fetchTransactions,
    fetchPayouts,
    fetchStats,
    fetchConfig,
    fetchDodoData,
    processPayout,
    updateConfig,
    exportTransactions,
  } = useFinance();

  useEffect(() => {
    fetchStats();
    fetchTransactions();
    fetchPayouts();
    fetchConfig();
    fetchDodoData();
  }, [fetchStats, fetchTransactions, fetchPayouts, fetchConfig, fetchDodoData]);

  useEffect(() => {
    if (config) {
      setSandboxMode(config.sandboxMode);
      setAuditInterval(config.auditInterval || "realtime");
      setBaseCurrency(config.baseCurrency || "usd");
      setScheduleType(config.payoutSchedule || "monthly");
    }
  }, [config]);

  const getStatusBadge = (status: string | undefined) => {
    const s = (status || '').toLowerCase();
    switch (s) {
      case "success":
      case "paid":
      case "completed":
        return (
          <Badge className="bg-primary/10 text-primary border-primary/20 gap-1.5 h-6 px-2.5 font-medium text-xs rounded-md">
            <CheckCircle2 className="w-3 h-3 fill-primary" /> Completed
          </Badge>
        );
      case "pending":
      case "processing":
      case "scheduled":
        return (
          <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 gap-1.5 h-6 px-2.5 font-medium text-xs rounded-md">
            <Clock className="w-3 h-3" /> {s.charAt(0).toUpperCase() + s.slice(1)}
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-destructive/10 text-destructive border-destructive/20 gap-1.5 h-6 px-2.5 font-medium text-xs rounded-md">
            <AlertCircle className="w-3 h-3" /> Failed
          </Badge>
        );
      default:
        return <Badge variant="outline" className="h-6 px-2.5 font-medium text-xs rounded-md">{s}</Badge>;
    }
  };

  // Client-side filtering for search
  const filteredTransactions = useMemo(() => {
    return transactions.filter(
      (txn) =>
        txn.id?.toLowerCase().includes(transactionSearch.toLowerCase()) ||
        txn.user?.name?.toLowerCase().includes(transactionSearch.toLowerCase()) ||
        txn.description?.toLowerCase().includes(transactionSearch.toLowerCase()) ||
        txn.invoiceId?.toLowerCase().includes(transactionSearch.toLowerCase())
    );
  }, [transactions, transactionSearch]);

  // Handle date filter change - triggers server-side fetch
  const handleDateFilterChange = (value: string) => {
    setDateFilter(value);
    const now = new Date();
    let dateFrom: string | undefined;

    switch (value) {
      case "today":
        dateFrom = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
        break;
      case "week":
        dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
        break;
      case "month":
        dateFrom = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        break;
      case "year":
        dateFrom = new Date(now.getFullYear(), 0, 1).toISOString();
        break;
      default:
        dateFrom = undefined;
    }

    const params: any = {};
    if (dateFrom) params.dateFrom = dateFrom;
    if (statusFilter !== "all") params.status = statusFilter;
    fetchTransactions(params);
  };

  // Handle status filter change - triggers server-side fetch
  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    const params: any = {};
    if (value !== "all") params.status = value;
    if (dateFilter !== "all") {
      const now = new Date();
      switch (dateFilter) {
        case "today":
          params.dateFrom = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
          break;
        case "week":
          params.dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
          break;
        case "month":
          params.dateFrom = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
          break;
        case "year":
          params.dateFrom = new Date(now.getFullYear(), 0, 1).toISOString();
          break;
      }
    }
    fetchTransactions(params);
  };

  const handleExport = () => {
    exportTransactions('csv');
  };

  const handleProcessPayout = () => {
    setIsPayoutDialogOpen(true);
  };

  const handleConfirmPayout = async () => {
    if (!payoutAmount || !payoutRecipient) {
      toast.error("Please fill in recipient and amount");
      return;
    }
    const success = await processPayout({
      amount: payoutAmount,
      recipient: payoutRecipient,
    });
    if (success) {
      setIsPayoutDialogOpen(false);
      setPayoutAmount("");
      setPayoutRecipient("");
    }
  };

  const handleConfigureGateway = () => {
    toast.info("Configure gateways in Settings → Payments (Stripe/PayPal).");
  };

  const handleGatewaySettings = (name: string) => {
    toast.info(`Configure ${name} in Settings → Payments.`);
  };

  const handleCustomizeInvoice = () => {
    toast.info("Invoice design: use Billing/Invoices or document template settings when available.");
  };

  const handleEditSchedule = () => {
    setIsScheduleDialogOpen(true);
  };

  const handleSaveSchedule = async () => {
    const success = await updateConfig({ payoutSchedule: scheduleType });
    if (success) {
      setIsScheduleDialogOpen(false);
    }
  };

  const handleSaveConfig = async () => {
    const success = await updateConfig({
      sandboxMode,
      auditInterval,
      baseCurrency,
    });
    if (success) {
      toast.success("Configuration saved");
    }
  };

  const handleResetDefaults = () => {
    setSandboxMode(false);
    setAuditInterval("realtime");
    setBaseCurrency("usd");
    toast.info("Settings reset to defaults. Click Save to apply.");
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-20 sm:pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-semibold ">
            Finance
          </h1>
          <p className="text-muted-foreground text-sm">Manage transactions, payouts, and financial settings.</p>
        </div>
        <div className="flex flex-wrap gap-3 shrink-0">
          <Button variant="outline"
            className="rounded-lg h-9 px-4 gap-2"
            onClick={handleExport}
          >
            <Download className="w-4 h-4" /> Export CSV
          </Button>
          <Button className="rounded-lg h-9 px-4 gap-2"
            onClick={handleProcessPayout}
          >
            <Plus className="w-4 h-4" /> Process Payout
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Available Balance",
            value: isLoadingStats ? null : stats ? `$${stats.availableBalance}` : "$0.00",
            icon: Wallet,
            iconBg: "bg-primary/10",
            iconColor: "text-primary",
          },
          {
            label: "Pending Sales",
            value: isLoadingStats ? null : stats ? `$${stats.pendingSales}` : "$0.00",
            icon: Clock,
            iconBg: "bg-amber-500/10",
            iconColor: "text-amber-500",
          },
          {
            label: "Partner Payouts",
            value: isLoadingStats ? null : stats ? `$${stats.partnerPayouts}` : "$0.00",
            icon: ArrowDownRight,
            iconBg: "bg-destructive/10",
            iconColor: "text-destructive",
          },
          {
            label: "Gateway Status",
            value: isLoadingStats ? null : stats?.gatewayStatus || "Verified",
            icon: ShieldCheck,
            iconBg: "bg-green-500/10",
            iconColor: "text-green-500",
          },
        ].map((stat) => (
          <div key={stat.label}
            className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-5"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                <div className="text-lg font-semibold mt-0.5">
                  {stat.value === null ? <Skeleton className="h-6 w-20" /> : stat.value}
                </div>
              </div>
              <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", stat.iconBg)}>
                <stat.icon className={cn("w-5 h-5", stat.iconColor)} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <Tabs defaultValue="overview"
        className="space-y-8"
        onValueChange={setActiveTab}
      >
        <TabsList className="bg-muted/30 p-1 rounded-lg h-10 w-fit border border-border/50 mb-8">
          <TabsTrigger value="overview"
            className="rounded-md h-8 gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm text-sm px-4"
          >
            <Layout className="w-4 h-4" /> Overview
          </TabsTrigger>
          <TabsTrigger value="transactions"
            className="rounded-md h-8 gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm text-sm px-4"
          >
            <History className="w-4 h-4" /> Transactions
          </TabsTrigger>
          <TabsTrigger value="payouts"
            className="rounded-md h-8 gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm text-sm px-4"
          >
            <Zap className="w-4 h-4" /> Payouts
          </TabsTrigger>
          <TabsTrigger value="dodo"
            className="rounded-md h-8 gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm text-sm px-4"
          >
            <Globe className="w-4 h-4" /> Dodo
          </TabsTrigger>
          <TabsTrigger value="settings"
            className="rounded-md h-8 gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm text-sm px-4"
          >
            <Settings className="w-4 h-4" /> Config
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-0">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <Card className="border-border/40 rounded-xl overflow-hidden bg-card/40 shadow-sm">
                <CardHeader className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg font-semibold">Payment Gateways</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">Connected payment processors</p>
                    </div>
                    <Badge className="bg-primary/10 text-primary border-none font-medium text-xs px-3 h-6 rounded-md">
                      Active
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 p-6 pt-0">
                  {[
                    {
                      name: "Stripe",
                      status: "Connected",
                      account: "acct_1NZ...92J",
                      icon: "S",
                    },
                    {
                      name: "PayPal",
                      status: "Verified",
                      account: "payments@oftisoft.com",
                      icon: "P",
                    },
                    {
                      name: "Dodo Payments",
                      status: dodoData.products.length > 0 ? "Connected" : "Configured",
                      account: dodoData.products.length > 0 ? `${dodoData.products.length} products` : "dodopayments.com",
                      icon: "D",
                    },
                    {
                      name: "Coinbase",
                      status: "Inactive",
                      account: "Not Configured",
                      icon: "C",
                    },
                  ].map((gateway) => (
                    <div key={gateway.name}
                      className="flex items-center justify-between p-4 rounded-lg border border-border/40 bg-muted/20 hover:bg-muted/30 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-background border border-border/50 flex items-center justify-center font-semibold text-base text-primary">
                          {gateway.icon}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{gateway.name}</p>
                          <p className="text-xs font-mono text-muted-foreground mt-1">
                            ID: {gateway.account}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={
                            gateway.status === "Inactive" ? "outline" : "secondary"
                          }
                          className={cn(
                            "h-6 px-3 font-medium text-xs rounded-md",
                            gateway.status === "Inactive"
                              ? "opacity-30"
                              : "bg-primary/10 text-primary border-primary/20"
                          )}
                        >
                          {gateway.status === "Inactive" ? "Offline" : "Active"}
                        </Badge>
                        <Button variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg hover:bg-muted"
                          onClick={() => handleGatewaySettings(gateway.name)}
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
                <CardFooter className="bg-muted/10 border-t border-border/20 px-6 py-4">
                  <Button variant="link"
                    className="text-primary font-medium text-sm gap-2 p-0 h-auto"
                    onClick={handleConfigureGateway}
                  >
                    Configure New Gateway <Plus className="w-4 h-4" />
                  </Button>
                </CardFooter>
              </Card>

              <Card className="border-border/40 rounded-xl overflow-hidden bg-card/40 shadow-sm">
                <CardHeader className="p-6">
                  <CardTitle className="text-lg font-semibold">Tax Settings</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Tax configuration by region</p>
                </CardHeader>
                <CardContent className="grid sm:grid-cols-2 gap-4 p-6 pt-0">
                  <div className="p-4 rounded-lg border border-border/40 bg-muted/20 hover:border-primary/20 transition-all">
                    <p className="text-sm text-muted-foreground font-medium mb-3">
                      Standard VAT
                    </p>
                    <div className="flex items-end justify-between">
                      <span className="text-2xl font-semibold text-primary">
                        20.00%
                      </span>
                      <Badge variant="outline" className="text-xs font-medium h-5 px-2 rounded-sm">
                        Default
                      </Badge>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg border border-border/40 bg-muted/20 hover:border-primary/20 transition-all">
                    <p className="text-sm text-muted-foreground font-medium mb-3">
                      US Sales Tax
                    </p>
                    <div className="flex items-end justify-between">
                      <span className="text-2xl font-semibold text-primary">
                        Variable
                      </span>
                      <Badge variant="outline" className="text-xs font-medium h-5 px-2 rounded-sm">
                        Calculated
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-8">
              <Card className="border-border/40 rounded-xl overflow-hidden bg-card/40 shadow-sm">
                <CardHeader className="bg-primary/5 border-b border-border/20 p-4">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" /> Invoice Template
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="aspect-3/4 rounded-lg border-2 border-dashed border-border/50 flex flex-col items-center justify-center p-6 text-center bg-muted/10 hover:bg-muted/20 hover:border-primary/40 transition-all cursor-pointer group"
                    onClick={handleCustomizeInvoice}
                  >
                    <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center border border-border shadow group-hover:scale-110 transition-transform mb-3">
                      <Pencil className="w-5 h-5 text-primary" />
                    </div>
                    <p className="text-xs font-medium">Standard Plan</p>
                    <p className="text-xs font-mono text-muted-foreground mt-1">
                      REF: 2026_V1.PDF
                    </p>
                  </div>
                  <Button variant="outline"
                    className="w-full mt-4 rounded-lg h-9 text-sm"
                    onClick={handleCustomizeInvoice}
                  >
                    Customize Design
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-border/40 rounded-xl overflow-hidden bg-card/40 shadow-sm">
                <CardHeader className="p-4">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-primary" /> Security
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 px-4 pb-4 pt-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Settlement Lag</span>
                    <span className="text-xs font-medium">3-5 business days</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">FX Sync Channel</span>
                    <div className="flex items-center gap-2 text-primary font-medium text-xs">
                      <Globe className="w-3 h-3" /> Live
                    </div>
                  </div>
                  <Separator className="bg-border/30" />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    PCI-DSS Level 1 Compliant. All transactions encrypted and secure.
                  </p>
                </CardContent>
              </Card>

              {/* Related pages */}
              <Card className="border-border/40 rounded-xl overflow-hidden bg-card/40 shadow-sm">
                <CardHeader className="p-4">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Link2 className="w-4 h-4 text-primary" /> Quick Links
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 pt-0 space-y-2">
                  {[
                    { href: "/dashboard/orders", icon: ShoppingBag, label: "Orders", sub: "View all orders" },
                    { href: "/dashboard/analytics", icon: BarChart3, label: "Analytics", sub: "Revenue metrics" },
                    { href: "/dashboard/affiliate", icon: Zap, label: "Affiliate", sub: "Commission payouts" },
                    { href: "/dashboard/settings/billing", icon: CreditCard, label: "Billing", sub: "Payment settings" },
                    { href: "/dashboard/billing/invoices", icon: FileText, label: "Invoices", sub: "Invoice history" },
                  ].map((link) => (
                    <Link key={link.label}
                      href={link.href}
                      className="flex items-center gap-3 p-3 rounded-lg border border-border/40 bg-muted/10 hover:bg-primary/5 hover:border-primary/20 transition-all"
                    >
                      <div className="w-7 h-7 rounded-md bg-background border border-border flex items-center justify-center">
                        <link.icon className="w-3.5 h-3.5 text-muted-foreground" />
                      </div>
                      <p className="text-sm font-medium flex-1">{link.label}</p>
                      <span className="text-xs text-muted-foreground">{link.sub}</span>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-6 mt-0">
          <Card className="border-border/40 rounded-xl overflow-hidden bg-card/40 shadow-sm">
            <CardHeader className="p-6 border-b border-border/20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-full sm:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input placeholder="Search transactions..."
                  className="pl-10 h-9 rounded-lg"
                  value={transactionSearch}
                  onChange={(e) => setTransactionSearch(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                  <SelectTrigger className="w-[130px] h-9 rounded-lg">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl p-1">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={dateFilter} onValueChange={handleDateFilterChange}>
                  <SelectTrigger className="w-[130px] h-9 rounded-lg">
                    <SelectValue placeholder="Date" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl p-1">
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">Last 7 Days</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline"
                  className="rounded-lg h-9 px-3 gap-1 text-sm"
                  onClick={() => {
                    setStatusFilter("all");
                    setDateFilter("all");
                    fetchTransactions();
                  }}
                >
                  Reset
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="w-full">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/10 border-b border-border/20">
                      <TableHead className="px-6 h-10 text-xs font-medium uppercase text-muted-foreground">Reference</TableHead>
                      <TableHead className="h-10 text-xs font-medium uppercase text-muted-foreground">User</TableHead>
                      <TableHead className="hidden md:table-cell h-10 text-xs font-medium uppercase text-muted-foreground">Description</TableHead>
                      <TableHead className="h-10 text-xs font-medium uppercase text-muted-foreground">Type</TableHead>
                      <TableHead className="h-10 text-xs font-medium uppercase text-muted-foreground">Value</TableHead>
                      <TableHead className="h-10 text-xs font-medium uppercase text-muted-foreground">Status</TableHead>
                      <TableHead className="text-right w-[80px] pr-6 h-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingTransactions ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell className="px-6 py-4"><Skeleton className="h-4 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                          <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-40" /></TableCell>
                          <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                          <TableCell className="text-right pr-6"><Skeleton className="h-8 w-8 rounded-lg" /></TableCell>
                        </TableRow>
                      ))
                    ) : filteredTransactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-32 text-center text-sm text-muted-foreground">
                          No transactions found
                        </TableCell>
                      </TableRow>
                    ) : filteredTransactions.map((txn) => (
                      <TableRow key={txn.id}
                        className="group hover:bg-primary/5 border-b border-border/10 transition-colors"
                      >
                        <TableCell className="px-8 py-5 font-mono text-sm font-semibold text-muted-foreground">
                          {(txn.id || '—').substring(0, 12).toUpperCase()}
                        </TableCell>
                        <TableCell>
                          <Link href={`/dashboard/admin/users/${txn.user?.id}`}
                            className="flex flex-col group/link"
                          >
                            <span className="text-sm font-medium group-hover/link:text-primary transition-colors">
                              {txn.user?.name || "System"}
                            </span>
                            <span className="text-xs font-mono text-muted-foreground">
                              {txn.user?.email || ""}
                            </span>
                          </Link>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground hidden md:table-cell max-w-[200px] truncate">
                          {txn.type || txn.description}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline"
                            className="h-5 px-2 text-xs rounded-sm bg-muted/20"
                          >
                            {txn.invoiceId ? "Invoice" : "Payment"}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium text-sm">
                          {txn.amount}
                        </TableCell>
                        <TableCell>{getStatusBadge(txn.status)}</TableCell>
                        <TableCell className="text-right pr-6">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-lg opacity-40 group-hover:opacity-100 transition-all hover:bg-muted"
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-xl p-1">
                              <DropdownMenuItem asChild className="rounded-md text-sm py-2">
                                <Link href={`/dashboard/orders/${txn.orderId || txn.id}`}>
                                  <Eye className="w-4 h-4 mr-2" /> View Order
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem className="rounded-md text-sm py-2"
                                onClick={() => {
                                  navigator.clipboard.writeText(txn.id);
                                  toast.success("ID copied to clipboard");
                                }}
                              >
                                <Copy className="w-4 h-4 mr-2" /> Copy ID
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payouts Tab */}
        <TabsContent value="payouts" className="space-y-8 mt-0">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <Card className="border-border/40 rounded-xl overflow-hidden bg-card/40 shadow-sm">
                <CardHeader className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-lg font-semibold">Partner Payout Ledger</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">Disbursement history</p>
                    </div>
                    <Button variant="outline" className="rounded-lg h-9 px-4 gap-2 text-sm" asChild>
                      <Link href="/dashboard/affiliate">
                        <Zap className="w-4 h-4" /> Affiliates
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="w-full">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/10 border-b border-border/20">
                          <TableHead className="px-6 h-10 text-xs font-medium uppercase text-muted-foreground">ID</TableHead>
                          <TableHead className="h-10 text-xs font-medium uppercase text-muted-foreground">Recipient</TableHead>
                          <TableHead className="h-10 text-xs font-medium uppercase text-muted-foreground">Type</TableHead>
                          <TableHead className="hidden sm:table-cell h-10 text-xs font-medium uppercase text-muted-foreground">Date</TableHead>
                          <TableHead className="h-10 text-xs font-medium uppercase text-muted-foreground">Amount</TableHead>
                          <TableHead className="h-10 text-xs font-medium uppercase text-muted-foreground">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isLoadingPayouts ? (
                          Array.from({ length: 3 }).map((_, i) => (
                            <TableRow key={i}>
                              <TableCell className="px-6 py-4"><Skeleton className="h-4 w-24" /></TableCell>
                              <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                              <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                              <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                              <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                              <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                            </TableRow>
                          ))
                        ) : payouts.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="h-32 text-center text-sm text-muted-foreground">
                              No payouts found
                            </TableCell>
                          </TableRow>
                        ) : (
                          payouts.map((p) => (
                            <TableRow key={p.id} className="border-b border-border/10 hover:bg-primary/5 transition-colors">
                        <TableCell className="px-6 py-4 font-mono text-sm text-muted-foreground">
                                {(p.id || '—').toUpperCase()}
                              </TableCell>
                              <TableCell className="text-sm font-medium">
                                <span className="hover:text-primary transition-colors">
                                  {p.recipient || "—"}
                                </span>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline"
                                  className="h-5 px-2 text-xs rounded-sm border-primary/20 text-primary"
                                >
                                  {(p.type || '—').toUpperCase()}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground hidden sm:table-cell">
                                {p.date || "—"}
                              </TableCell>
                              <TableCell className="font-medium text-sm">
                                ${(p.amount || 0).toFixed(2)}
                              </TableCell>
                              <TableCell>{getStatusBadge(p.status)}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                    <ScrollBar orientation="horizontal" />
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-8">
              <Card className="border-border/40 rounded-xl overflow-hidden bg-primary/5 shadow-sm">
                <CardHeader className="p-6">
                  <CardTitle className="text-lg font-semibold">Payout Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 p-6 pt-0">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Minimum Payout
                    </Label>
                    <div className="flex items-end gap-2">
                      <span className="text-2xl font-semibold text-primary">${config?.minimumPayout || 100}.00</span>
                      <span className="text-xs text-muted-foreground mb-1">USD</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Schedule
                    </Label>
                    <p className="text-sm font-medium capitalize">
                      {config?.payoutSchedule || "monthly"}
                    </p>
                  </div>
                  <Button className="w-full rounded-lg h-9 text-sm"
                    onClick={handleEditSchedule}
                  >
                    Edit Schedule
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Dodo Payments Tab */}
        <TabsContent value="dodo" className="space-y-6 mt-0">
          <div className="grid lg:grid-cols-4 gap-4">
            <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-5">
              <p className="text-sm text-muted-foreground font-medium">Products</p>
              <div className="text-lg font-semibold mt-0.5">
                {isLoadingDodo ? <Skeleton className="h-6 w-16" /> : dodoData.products.length}
              </div>
            </div>
            <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-5">
              <p className="text-sm text-muted-foreground font-medium">Payments</p>
              <div className="text-lg font-semibold mt-0.5">
                {isLoadingDodo ? <Skeleton className="h-6 w-16" /> : dodoData.payments.length}
              </div>
            </div>
            <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-5">
              <p className="text-sm text-muted-foreground font-medium">Subscriptions</p>
              <div className="text-lg font-semibold mt-0.5">
                {isLoadingDodo ? <Skeleton className="h-6 w-16" /> : dodoData.subscriptions.length}
              </div>
            </div>
            <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-xl p-5">
              <p className="text-sm text-muted-foreground font-medium">Customers</p>
              <div className="text-lg font-semibold mt-0.5">
                {isLoadingDodo ? <Skeleton className="h-6 w-16" /> : dodoData.customers.length}
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="border-border/40 rounded-xl overflow-hidden bg-card/40 shadow-sm">
              <CardHeader className="p-6">
                <CardTitle className="text-lg font-semibold">Products</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Dodo Payments product catalog</p>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="w-full max-h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/10 border-b border-border/20">
                        <TableHead className="px-6 h-10 text-xs font-medium uppercase text-muted-foreground">Name</TableHead>
                        <TableHead className="h-10 text-xs font-medium uppercase text-muted-foreground">Price</TableHead>
                        <TableHead className="h-10 text-xs font-medium uppercase text-muted-foreground">Interval</TableHead>
                        <TableHead className="h-10 text-xs font-medium uppercase text-muted-foreground">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoadingDodo ? (
                        Array.from({ length: 3 }).map((_, i) => (
                          <TableRow key={i}>
                            <TableCell className="px-6 py-4"><Skeleton className="h-4 w-32" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                            <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                          </TableRow>
                        ))
                      ) : dodoData.products.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="h-32 text-center text-sm text-muted-foreground">
                            No products found. Configure Dodo Payments API key in Settings.
                          </TableCell>
                        </TableRow>
                      ) : dodoData.products.map((p: any) => (
                        <TableRow key={p.product_id} className="border-b border-border/10 hover:bg-primary/5 transition-colors">
                          <TableCell className="px-6 py-4 text-sm font-medium">{p.name || '—'}</TableCell>
                          <TableCell className="text-sm">
                            {p.prices?.[0] ? `$${(p.prices[0].unit_amount / 100).toFixed(2)}` : '—'}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {p.prices?.[0]?.interval || 'one-time'}
                          </TableCell>
                          <TableCell>
                            <Badge className={cn(
                              "h-5 px-2 text-xs rounded-sm",
                              p.status === 'active'
                                ? "bg-primary/10 text-primary border-primary/20"
                                : "bg-muted/10 text-muted-foreground border-border/50"
                            )}>
                              {p.status || 'active'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card className="border-border/40 rounded-xl overflow-hidden bg-card/40 shadow-sm">
              <CardHeader className="p-6">
                <CardTitle className="text-lg font-semibold">Recent Payments</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Latest Dodo Payments transactions</p>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="w-full max-h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/10 border-b border-border/20">
                        <TableHead className="px-6 h-10 text-xs font-medium uppercase text-muted-foreground">ID</TableHead>
                        <TableHead className="h-10 text-xs font-medium uppercase text-muted-foreground">Amount</TableHead>
                        <TableHead className="h-10 text-xs font-medium uppercase text-muted-foreground">Status</TableHead>
                        <TableHead className="h-10 text-xs font-medium uppercase text-muted-foreground">Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoadingDodo ? (
                        Array.from({ length: 3 }).map((_, i) => (
                          <TableRow key={i}>
                            <TableCell className="px-6 py-4"><Skeleton className="h-4 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                            <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                          </TableRow>
                        ))
                      ) : dodoData.payments.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="h-32 text-center text-sm text-muted-foreground">
                            No payments yet.
                          </TableCell>
                        </TableRow>
                      ) : dodoData.payments.map((p: any) => (
                        <TableRow key={p.payment_id} className="border-b border-border/10 hover:bg-primary/5 transition-colors">
                          <TableCell className="px-6 py-4 font-mono text-xs text-muted-foreground">
                            {(p.payment_id || '—').substring(0, 12)}
                          </TableCell>
                          <TableCell className="text-sm font-medium">
                            ${(p.unit_amount ? p.unit_amount / 100 : 0).toFixed(2)}
                          </TableCell>
                          <TableCell>{getStatusBadge(p.status)}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {p.created_at ? new Date(p.created_at).toLocaleDateString() : '—'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="border-border/40 rounded-xl overflow-hidden bg-card/40 shadow-sm">
              <CardHeader className="p-6">
                <CardTitle className="text-lg font-semibold">Subscriptions</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Active and recent subscriptions</p>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="w-full max-h-[300px]">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/10 border-b border-border/20">
                        <TableHead className="px-6 h-10 text-xs font-medium uppercase text-muted-foreground">Customer</TableHead>
                        <TableHead className="h-10 text-xs font-medium uppercase text-muted-foreground">Status</TableHead>
                        <TableHead className="h-10 text-xs font-medium uppercase text-muted-foreground">Next Billing</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoadingDodo ? (
                        Array.from({ length: 2 }).map((_, i) => (
                          <TableRow key={i}>
                            <TableCell className="px-6 py-4"><Skeleton className="h-4 w-32" /></TableCell>
                            <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                          </TableRow>
                        ))
                      ) : dodoData.subscriptions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="h-32 text-center text-sm text-muted-foreground">
                            No subscriptions yet.
                          </TableCell>
                        </TableRow>
                      ) : dodoData.subscriptions.map((s: any) => (
                        <TableRow key={s.subscription_id} className="border-b border-border/10 hover:bg-primary/5 transition-colors">
                          <TableCell className="px-6 py-4 text-sm font-medium">
                            {s.customer?.name || s.customer?.email || s.customer_id?.substring(0, 12) || '—'}
                          </TableCell>
                          <TableCell>{getStatusBadge(s.status)}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {s.current_period_end ? new Date(s.current_period_end).toLocaleDateString() : '—'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card className="border-border/40 rounded-xl overflow-hidden bg-card/40 shadow-sm">
              <CardHeader className="p-6">
                <CardTitle className="text-lg font-semibold">Discounts</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Active discount codes</p>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="w-full max-h-[300px]">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/10 border-b border-border/20">
                        <TableHead className="px-6 h-10 text-xs font-medium uppercase text-muted-foreground">Code</TableHead>
                        <TableHead className="h-10 text-xs font-medium uppercase text-muted-foreground">Amount</TableHead>
                        <TableHead className="h-10 text-xs font-medium uppercase text-muted-foreground">Uses</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoadingDodo ? (
                        Array.from({ length: 2 }).map((_, i) => (
                          <TableRow key={i}>
                            <TableCell className="px-6 py-4"><Skeleton className="h-4 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                            <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                          </TableRow>
                        ))
                      ) : dodoData.discounts.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="h-32 text-center text-sm text-muted-foreground">
                            No discounts configured.
                          </TableCell>
                        </TableRow>
                      ) : dodoData.discounts.map((d: any) => (
                        <TableRow key={d.discount_id} className="border-b border-border/10 hover:bg-primary/5 transition-colors">
                          <TableCell className="px-6 py-4 font-mono text-sm font-medium">{(d.code || d.discount_id)?.substring(0, 16)}</TableCell>
                          <TableCell className="text-sm">{d.amount ? `${d.amount}%` : '—'}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{d.usage_count || 0}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          <div className="text-center text-xs text-muted-foreground p-4">
            Managed by Dodo Payments —{' '}
            <a href="https://app.dodopayments.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              Open Dodo Dashboard
            </a>
          </div>
        </TabsContent>

        {/* Settings/Config Tab */}
        <TabsContent value="settings" className="space-y-8 mt-0">
          <Card className="border-border/40 rounded-xl overflow-hidden bg-card/40 shadow-sm">
            <CardHeader className="p-6 border-b border-border/20">
              <CardTitle className="text-lg font-semibold">Settings</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Gateway and financial system settings</p>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-4 rounded-lg border border-border/40 bg-muted/10">
                <div className="space-y-1">
                  <h4 className="text-sm font-medium">Sandbox Mode</h4>
                  <p className="text-sm text-muted-foreground">
                    Toggle sandbox mode for test payments and verification.
                  </p>
                </div>
                <div className="flex items-center gap-4 bg-background/50 p-2 rounded-lg border border-border/50">
                  <Switch checked={sandboxMode}
                    onCheckedChange={setSandboxMode}
                    className="data-[state=checked]:bg-amber-500"
                  />
                  <Badge variant="outline"
                    className={cn(
                      "font-medium text-xs px-3 h-6 rounded-md transition-all",
                      sandboxMode
                        ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                        : "bg-muted/10 text-muted-foreground border-border/50 opacity-40"
                    )}
                  >
                    {sandboxMode ? "Sandbox Active" : "Live"}
                  </Badge>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Audit Interval</Label>
                  <Select value={auditInterval} onValueChange={setAuditInterval}>
                    <SelectTrigger className="h-9 rounded-lg">
                      <SelectValue placeholder="Select interval" />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg p-1">
                      <SelectItem value="realtime">Real-time</SelectItem>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Base Currency</Label>
                  <Select value={baseCurrency} onValueChange={setBaseCurrency}>
                    <SelectTrigger className="h-9 rounded-lg">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg p-1">
                      <SelectItem value="usd">USD</SelectItem>
                      <SelectItem value="eur">EUR</SelectItem>
                      <SelectItem value="gbp">GBP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/10 border-t border-border/20 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <Button variant="ghost"
                className="rounded-lg h-9 px-4 text-sm"
                onClick={handleResetDefaults}
              >
                Reset to Defaults
              </Button>
              <Button
                className="rounded-lg h-9 px-6"
                onClick={handleSaveConfig}
                disabled={isSavingConfig}
              >
                {isSavingConfig ? "Saving..." : "Save"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Process Payout Dialog */}
      <Dialog open={isPayoutDialogOpen} onOpenChange={setIsPayoutDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Process Payout</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">Send a payout to an affiliate or user.</DialogDescription>
          </DialogHeader>
          <form id="payout-form" onSubmit={(e) => { e.preventDefault(); handleConfirmPayout(); }} className="space-y-4">
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Available Balance
                </p>
                <p className="text-xl font-semibold text-primary">{stats ? `$${stats.availableBalance}` : "$0.00"}</p>
              </div>
            </div>
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label className="text-sm font-medium">Recipient</Label>
                    <Input 
                        placeholder="Affiliate referral code or user email" 
                        className="h-9 rounded-lg"
                        value={payoutRecipient}
                        onChange={(e) => setPayoutRecipient(e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-sm font-medium">Amount (USD)</Label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                        <Input 
                            type="number" 
                            placeholder="0.00" 
                            className="h-9 rounded-lg pl-7"
                            value={payoutAmount}
                            onChange={(e) => setPayoutAmount(e.target.value)}
                        />
                    </div>
                </div>
            </div>
          </form>
          <DialogFooter className="flex gap-3">
            <Button type="button" variant="outline" className="rounded-lg h-9 flex-1" onClick={() => setIsPayoutDialogOpen(false)}>Cancel</Button>
            <Button type="submit" form="payout-form" className="rounded-lg h-9 flex-1">
                Process Payout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Schedule Dialog */}
      <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Payout Schedule</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">Set how often payouts are processed.</DialogDescription>
          </DialogHeader>
          <form id="schedule-form" onSubmit={(e) => { e.preventDefault(); handleSaveSchedule(); }} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
                {[
                    { id: "weekly", label: "Weekly", desc: "Every Monday" },
                    { id: "biweekly", label: "Bi-weekly", desc: "1st and 15th" },
                    { id: "monthly", label: "Monthly", desc: "End of cycle" },
                    { id: "manual", label: "Manual", desc: "On demand" },
                ].map((s) => (
                    <div 
                        key={s.id}
                        onClick={() => setScheduleType(s.id)}
                        className={cn(
                            "p-4 rounded-lg border-2 transition-all cursor-pointer flex flex-col justify-between h-24",
                            scheduleType === s.id 
                              ? "bg-primary/5 border-primary" 
                              : "bg-muted/10 border-transparent hover:bg-muted/20"
                        )}
                    >
                        <p className={cn("text-xs font-medium", scheduleType === s.id ? "text-primary" : "text-muted-foreground")}>{s.label}</p>
                        <p className="text-xs text-muted-foreground">{s.desc}</p>
                    </div>
                ))}
            </div>
            <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 text-xs text-amber-600/70 text-center">
                Automated payouts require verified payment information. Review pending before first cycle.
            </div>
          </form>
          <DialogFooter className="flex gap-3">
            <Button type="button" variant="outline" className="rounded-lg h-9 flex-1" onClick={() => setIsScheduleDialogOpen(false)}>Cancel</Button>
            <Button type="submit" form="schedule-form" className="rounded-lg h-9 flex-1">
                Save Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default withRoleProtection(FinanceManagementPage, ["Admin", "SuperAdmin"]);

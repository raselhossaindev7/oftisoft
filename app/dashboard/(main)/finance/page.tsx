"use client";

import { useState } from "react";
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
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";
import { ShoppingBag, Users, BarChart3, Link2, CreditCard } from "lucide-react";

import { useFinance } from "@/hooks/useFinance";
import { useEffect } from "react";
import { withRoleProtection } from "@/components/auth/role-guard";

function FinanceManagementPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [transactionSearch, setTransactionSearch] = useState("");
  const [sandboxMode, setSandboxMode] = useState(false);
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
    isLoading, 
    fetchTransactions, 
    fetchPayouts,
    fetchStats,
    fetchConfig,
    processPayout,
    updateConfig
  } = useFinance();

  useEffect(() => {
    fetchStats();
    fetchTransactions();
    fetchPayouts();
    fetchConfig();
  }, [fetchStats, fetchTransactions, fetchPayouts, fetchConfig]);

  useEffect(() => {
    if (config) {
      setSandboxMode(config.sandboxMode);
    }
  }, [config]);

  const getStatusBadge = (status: string | undefined) => {
    const s = (status || '').toLowerCase();
    switch (s) {
      case "success":
      case "paid":
      case "completed":
        return (
          <Badge className="bg-primary/10 text-primary border-primary/20 gap-2 h-7 px-3 font-semibold text-xs rounded-lg  ">
            <CheckCircle2 className="w-3 h-3 fill-primary" /> Completed
          </Badge>
        );
      case "pending":
      case "processing":
      case "scheduled":
        return (
          <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 gap-2 h-7 px-3 font-semibold text-xs rounded-lg   animate-pulse">
            <Clock className="w-3 h-3" /> {s.charAt(0).toUpperCase() + s.slice(1)}
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-destructive/10 text-destructive border-destructive/20 gap-2 h-7 px-3 font-semibold text-xs rounded-lg  ">
            <AlertCircle className="w-3 h-3" /> Failed
          </Badge>
        );
      default:
        return <Badge variant="outline" className="h-7 px-3 font-semibold text-xs rounded-lg   border-2">{s}</Badge>;
    }
  };

  const filteredTransactions = transactions.filter(
    (txn) =>
      txn.id?.toLowerCase().includes(transactionSearch.toLowerCase()) ||
      txn.user?.name?.toLowerCase().includes(transactionSearch.toLowerCase()) ||
      txn.description?.toLowerCase().includes(transactionSearch.toLowerCase()) ||
      txn.invoiceId?.toLowerCase().includes(transactionSearch.toLowerCase())
  );

  const handleDownloadStatement = () => {
    toast.info("Export: use Transactions tab and export when your backend supports CSV/PDF.");
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

  const handleSaveSchedule = () => {
    toast.success(`Payout schedule set to ${scheduleType}.`);
    setIsScheduleDialogOpen(false);
  };

  const handleSaveConfig = async () => {
    const success = await updateConfig({
      sandboxMode,
    });
    if (success) {
      toast.success("Configuration saved");
    }
  };

  const handleResetDefaults = () => {
    setSandboxMode(false);
    toast.info("Sandbox mode reset to off. Click WRITE_CFG_TO_LEDGER to save.");
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-20 sm:pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-semibold ">
            Finance
          </h1>
          <p className="text-muted-foreground text-sm font-semibold  mt-1 opacity-70">
            Manage transactions, payouts, and financial settings
          </p>
        </div>
        <div className="flex flex-wrap gap-3 shrink-0">
          <Button variant="ghost"
            className="rounded-[1.2rem] h-12 px-6 font-semibold text-sm border border-border/50 hover:bg-muted/20  transition-all"
            onClick={handleDownloadStatement}
          >
            <Download className="w-4 h-4 mr-3" /> Export
          </Button>
          <Button className="rounded-[1.2rem] h-12 px-8 font-semibold text-sm shadow-xl shadow-primary/20 bg-primary hover:scale-[1.02] transition-transform "
            onClick={handleProcessPayout}
          >
            <Plus className="w-4 h-4 mr-3" /> Process Payout
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Available Balance",
            value: stats ? `$${stats.availableBalance}` : "$0.00",
            icon: Wallet,
            iconClass: "bg-primary/10 text-primary",
            sub: "Revenue"
          },
          {
            label: "Pending Sales",
            value: stats ? `$${stats.pendingSales}` : "$0.00",
            icon: Clock,
            iconClass: "bg-amber-500/10 text-amber-500",
            sub: "Awaiting settlement"
          },
          {
            label: "Partner Payouts",
            value: stats ? `$${stats.partnerPayouts}` : "$0.00",
            icon: ArrowDownRight,
            iconClass: "bg-destructive/10 text-destructive",
            sub: "Paid to affiliates"
          },
          {
            label: "Gateway Status",
            value: stats?.gatewayStatus || "Verified",
            icon: ShieldCheck,
            iconClass: "bg-green-500/10 text-green-500",
            sub: "Connected"
          },
        ].map((stat) => (
          <Card key={stat.label}
            className="border-border/40 bg-card/40 backdrop-blur-md shadow-sm rounded-[2rem] overflow-hidden group hover:border-primary/20 transition-all h-full flex flex-col"
          >
            <CardHeader className="flex flex-row items-center justify-between pb-1 p-5">
              <span className="text-sm font-semibold text-muted-foreground  opacity-60">
                {stat.label}
              </span>
              <div className={cn("p-1.5 rounded-xl group-hover:scale-110 transition-transform", stat.iconClass)}>
                <stat.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="p-5 pt-0 flex-1">
              <div className="text-2xl font-semibold leading-none mb-2">
                {stat.value}
              </div>
              <div className="text-xs font-semibold text-primary  opacity-40">
                {stat.sub}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview"
        className="space-y-8"
        onValueChange={setActiveTab}
      >
        <TabsList className="bg-muted/30 p-1.5 rounded-[1.5rem] h-16 w-fit border border-border/50 backdrop-blur-md mb-8">
          <TabsTrigger value="overview"
            className="rounded-xl h-full gap-3 data-[state=active]:bg-background data-[state=active]:shadow-lg font-semibold text-sm  px-8 py-3 transition-all"
          >
            <Layout className="w-4 h-4" /> Overview
          </TabsTrigger>
          <TabsTrigger value="transactions"
            className="rounded-xl h-full gap-3 data-[state=active]:bg-background data-[state=active]:shadow-lg font-semibold text-sm  px-8 py-3 transition-all"
          >
            <History className="w-4 h-4" /> Transactions
          </TabsTrigger>
          <TabsTrigger value="payouts"
            className="rounded-xl h-full gap-3 data-[state=active]:bg-background data-[state=active]:shadow-lg font-semibold text-sm  px-8 py-3 transition-all"
          >
            <Zap className="w-4 h-4" /> Payouts
          </TabsTrigger>
          <TabsTrigger value="settings"
            className="rounded-xl h-full gap-3 data-[state=active]:bg-background data-[state=active]:shadow-lg font-semibold text-sm  px-8 py-3 transition-all"
          >
            <Settings className="w-4 h-4" /> Config
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-0">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <Card className="border-border/40 rounded-[2.5rem] overflow-hidden bg-card/40 backdrop-blur-md shadow-sm">
                <CardHeader className="p-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl font-semibold ">Payment Gateways</CardTitle>
                      <p className="text-sm font-semibold  text-muted-foreground mt-1 opacity-60">Connected payment processors</p>
                    </div>
                    <Badge className="bg-primary/20 text-primary border-none font-semibold text-xs px-4 h-7 rounded-lg ">
                      Active
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 p-8 pt-0">
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
                      name: "Coinbase",
                      status: "Inactive",
                      account: "Not Configured",
                      icon: "C",
                    },
                  ].map((gateway) => (
                    <div key={gateway.name}
                      className="flex items-center justify-between p-6 rounded-[2rem] border border-border/40 bg-muted/20 hover:bg-muted/30 transition-all group"
                    >
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 rounded-2xl bg-background border-2 border-border/50 flex items-center justify-center font-semibold text-xl text-primary shadow-inner group-hover:scale-110 transition-transform">
                          {gateway.icon}
                        </div>
                        <div>
                          <p className="font-semibold text-lg  leading-none">{gateway.name}</p>
                          <p className="text-sm font-mono text-muted-foreground  mt-2 opacity-50">
                            ID: {gateway.account}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <Badge variant={
                            gateway.status === "Inactive" ? "outline" : "secondary"
                          }
                          className={cn(
                            "h-8 px-4 font-semibold text-xs rounded-lg   border-2 transition-all",
                            gateway.status === "Inactive"
                              ? "opacity-30"
                              : "bg-primary/10 text-primary border-primary/20 shadow-[0_0_15px_rgba(var(--primary),0.1)]"
                          )}
                        >
                          {gateway.status === "Inactive" ? "Offline" : "Active"}
                        </Badge>
                        <Button variant="ghost"
                          size="icon"
                          className="h-10 w-10 rounded-xl hover:bg-muted"
                          onClick={() => handleGatewaySettings(gateway.name)}
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
                <CardFooter className="bg-muted/10 border-t border-border/20 px-8 py-5">
                  <Button variant="link"
                    className="text-primary font-semibold text-sm gap-3 p-0 h-auto "
                    onClick={handleConfigureGateway}
                  >
                    Configure New Gateway <Plus className="w-4 h-4" />
                  </Button>
                </CardFooter>
              </Card>

              <Card className="border-border/40 rounded-[2.5rem] overflow-hidden bg-card/40 backdrop-blur-md shadow-sm">
                <CardHeader className="p-8">
                  <CardTitle className="text-2xl font-semibold ">Tax Settings</CardTitle>
                  <p className="text-sm font-semibold  text-muted-foreground mt-1 opacity-60">Tax configuration by region</p>
                </CardHeader>
                <CardContent className="grid sm:grid-cols-2 gap-6 p-8 pt-0">
                  <div className="p-6 rounded-[2rem] border border-border/40 bg-muted/20 group hover:border-primary/20 transition-all">
                    <p className="text-sm text-muted-foreground  font-semibold mb-4 opacity-70">
                      Standard VAT
                    </p>
                    <div className="flex items-end justify-between">
                      <span className="text-3xl font-semibold text-primary">
                        20.00%
                      </span>
                      <Badge variant="outline" className="text-xs font-semibold  h-6 px-3 rounded-md border-2">
                        Default
                      </Badge>
                    </div>
                  </div>
                  <div className="p-6 rounded-[2rem] border border-border/40 bg-muted/20 group hover:border-primary/20 transition-all">
                    <p className="text-sm text-muted-foreground  font-semibold mb-4 opacity-70">
                      US Sales Tax
                    </p>
                    <div className="flex items-end justify-between">
                      <span className="text-3xl font-semibold text-primary">
                        Variable
                      </span>
                      <Badge variant="outline" className="text-xs font-semibold  h-6 px-3 rounded-md border-2">
                        Calculated
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-8">
              <Card className="border-border/40 rounded-[2.5rem] overflow-hidden bg-card/40 backdrop-blur-md shadow-sm">
                <CardHeader className="bg-primary/5 border-b border-border/20 p-6">
                  <CardTitle className="text-sm font-semibold  flex items-center gap-3">
                    <FileText className="w-4 h-4 text-primary" /> Invoice Template
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="aspect-3/4 rounded-[2rem] border-2 border-dashed border-border/50 flex flex-col items-center justify-center p-8 text-center bg-muted/10 hover:bg-muted/20 hover:border-primary/40 transition-all cursor-pointer group"
                    onClick={handleCustomizeInvoice}
                  >
                    <div className="w-16 h-16 rounded-full bg-background flex items-center justify-center border-2 border-border shadow-lg group-hover:scale-110 transition-transform mb-4">
                      <Pencil className="w-6 h-6 text-primary" />
                    </div>
                    <p className="text-xs font-semibold ">Standard Plan</p>
                    <p className="text-sm font-mono text-muted-foreground mt-2 opacity-50 ">
                      REF: 2026_V1.PDF
                    </p>
                  </div>
                  <Button variant="outline"
                    className="w-full mt-6 rounded-xl h-11 px-6 font-semibold text-sm  border-2"
                    onClick={handleCustomizeInvoice}
                  >
                    Customize Design
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-border/40 rounded-[2.5rem] overflow-hidden bg-card/40 backdrop-blur-md shadow-sm">
                <CardHeader className="p-6">
                  <CardTitle className="text-sm font-semibold  flex items-center gap-3">
                    <ShieldCheck className="w-4 h-4 text-primary" /> Security
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 px-6 pb-6 pt-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold  opacity-60">Settlement Lag</span>
                    <span className="text-xs font-semibold ">3-5 business days</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold  opacity-60">FX Sync Channel</span>
                    <div className="flex items-center gap-2 text-primary font-semibold text-sm  ">
                      <Globe className="w-3 h-3 animate-spin-slow" /> Live
                    </div>
                  </div>
                  <Separator className="bg-border/30" />
                  <p className="text-xs font-semibold text-muted-foreground leading-relaxed  opacity-60">
                    PCI-DSS Level 1 Compliant. All transactions encrypted and secure.
                  </p>
                </CardContent>
              </Card>

              {/* Related pages */}
              <Card className="border-border/40 rounded-[2.5rem] overflow-hidden bg-card/40 backdrop-blur-md shadow-sm">
                <CardHeader className="p-6">
                  <CardTitle className="text-sm font-semibold  flex items-center gap-3">
                    <Link2 className="w-4 h-4 text-primary" /> Quick Links
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-6 pb-6 pt-0 space-y-3">
                  {[
                    { href: "/dashboard/orders", icon: ShoppingBag, label: "Orders", sub: "View all orders" },
                    { href: "/dashboard/analytics", icon: BarChart3, label: "Analytics", sub: "Revenue metrics" },
                    { href: "/dashboard/affiliate", icon: Zap, label: "Affiliate", sub: "Commission payouts" },
                    { href: "/dashboard/settings/billing", icon: CreditCard, label: "Billing", sub: "Payment settings" },
                    { href: "/dashboard/billing/invoices", icon: FileText, label: "Invoices", sub: "Invoice history" },
                  ].map((link) => (
                    <Link key={link.label}
                      href={link.href}
                      className="flex items-center gap-4 p-4 rounded-[1.2rem] border border-border/40 bg-muted/10 hover:bg-primary/5 hover:border-primary/20 transition-all group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-background border border-border flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all">
                        <link.icon className="w-4 h-4 text-muted-foreground group-hover:text-white transition-colors" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold ">{link.label}</p>
                      </div>
                      <span className="text-xs font-semibold text-muted-foreground  opacity-40 group-hover:opacity-100 transition-opacity">
                        {link.sub}
                      </span>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-6 mt-0">
          <Card className="border-border/40 rounded-[2.5rem] overflow-hidden bg-card/40 backdrop-blur-md shadow-sm">
            <CardHeader className="p-8 border-b border-border/20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-6">
              <div className="relative flex-1 max-w-full sm:max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input placeholder="Search transactions..."
                  className="pl-12 h-12 rounded-xl bg-muted/20 border-border/40 font-semibold text-sm  "
                  value={transactionSearch}
                  onChange={(e) => setTransactionSearch(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline"
                      className="rounded-xl h-12 px-6 gap-3 font-semibold text-sm   border-2"
                    >
                      <Filter className="w-4 h-4" /> Filter
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 rounded-xl p-2">
                    <DropdownMenuItem className="rounded-lg font-semibold text-sm  py-3 " onClick={() => toast.info("Status filter coming soon")}>
                      Filter by Status
                    </DropdownMenuItem>
                    <DropdownMenuItem className="rounded-lg font-semibold text-sm  py-3 " onClick={() => toast.info("Date filter coming soon")}>
                      Filter by Date
                    </DropdownMenuItem>
                    <DropdownMenuItem className="rounded-lg font-semibold text-sm  py-3 " onClick={() => toast.info("Amount filter coming soon")}>
                      Filter by Amount
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="w-full">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/10 border-b border-border/20">
                      <TableHead className="px-8 h-14 font-semibold text-sm  opacity-50">Reference</TableHead>
                      <TableHead className="h-14 font-semibold text-sm  opacity-50">User</TableHead>
                      <TableHead className="hidden md:table-cell h-14 font-semibold text-sm  opacity-50">Description</TableHead>
                      <TableHead className="h-14 font-semibold text-sm  opacity-50">Type</TableHead>
                      <TableHead className="h-14 font-semibold text-sm  opacity-50 text-primary">Value</TableHead>
                      <TableHead className="h-14 font-semibold text-sm  opacity-50 ">Pulse</TableHead>
                      <TableHead className="text-right w-[80px] pr-8 h-14"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading && transactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-32 text-center text-muted-foreground text-sm">
                          Loading transactions...
                        </TableCell>
                      </TableRow>
                    ) : filteredTransactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-32 text-center text-sm font-semibold  text-muted-foreground opacity-60 ">
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
                            <span className="text-sm font-semibold  group-hover/link:text-primary transition-colors">
                              {txn.user?.name || "System"}
                            </span>
                            <span className="text-sm font-mono text-muted-foreground opacity-50">
                              {txn.user?.email || ""}
                            </span>
                          </Link>
                        </TableCell>
                        <TableCell className="text-sm font-semibold  text-muted-foreground hidden md:table-cell max-w-[200px] truncate opacity-60">
                          {txn.type || txn.description}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline"
                            className="h-6 px-3 font-semibold text-xs rounded-md   border-2 bg-muted/20"
                          >
                            {txn.invoiceId ? "Invoice" : "Payment"}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold text-sm text-primary">
                          {txn.amount}
                        </TableCell>
                        <TableCell>{getStatusBadge(txn.status)}</TableCell>
                        <TableCell className="text-right pr-8">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost"
                                size="icon"
                                className="h-10 w-10 rounded-xl opacity-40 group-hover:opacity-100 transition-all hover:bg-muted"
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-xl p-2">
                              <DropdownMenuItem asChild className="rounded-lg font-semibold text-sm  py-3 ">
                                <Link href={`/dashboard/orders/${txn.orderId || txn.id}`}>
                                  <Eye className="w-4 h-4 mr-3" /> View Order
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem className="rounded-lg font-semibold text-sm  py-3 "
                                onClick={() => {
                                  navigator.clipboard.writeText(txn.id);
                                  toast.success("ID copied to clipboard");
                                }}
                              >
                                <Copy className="w-4 h-4 mr-3" /> Copy ID
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
              <Card className="border-border/40 rounded-[2.5rem] overflow-hidden bg-card/40 backdrop-blur-md shadow-sm">
                <CardHeader className="p-8">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div>
                      <CardTitle className="text-2xl font-semibold ">Partner Payout Ledger</CardTitle>
                      <p className="text-sm font-semibold  text-muted-foreground mt-1 opacity-60">Disbursement History for External Nodes</p>
                    </div>
                    <Button variant="ghost" className="rounded-xl h-12 px-6 gap-3 font-semibold text-sm   border-2" asChild>
                      <Link href="/dashboard/affiliate">
                        <Zap className="w-4 h-4" /> Affiliate_HUB
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="w-full">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/10 border-b border-border/20">
                          <TableHead className="px-8 h-14 font-semibold text-sm  opacity-50 ">PAY_ID</TableHead>
                          <TableHead className="h-14 font-semibold text-sm  opacity-50 ">Identity</TableHead>
                          <TableHead className="h-14 font-semibold text-sm  opacity-50 ">Class</TableHead>
                          <TableHead className="hidden sm:table-cell h-14 font-semibold text-sm  opacity-50 ">Timestamp</TableHead>
                          <TableHead className="h-14 font-semibold text-sm  opacity-50  text-primary">Volume</TableHead>
<TableHead className="h-14 font-semibold text-sm  opacity-50">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {payouts.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="h-32 text-center text-sm font-semibold  text-muted-foreground opacity-40 ">
                                No payouts found
                            </TableCell>
                          </TableRow>
                        ) : (
                          payouts.map((p) => (
                            <TableRow key={p.id} className="border-b border-border/10 hover:bg-primary/5 transition-colors">
                              <TableCell className="px-8 py-5 font-mono text-sm font-semibold text-muted-foreground">
                                {(p.id || '—').toUpperCase()}
                              </TableCell>
                              <TableCell className="text-sm font-semibold ">
                                <span className="hover:text-primary transition-colors">
                                  {p.recipient || "—"}
                                </span>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline"
                                  className="h-6 px-3 font-semibold text-xs rounded-md   border-2 border-primary/20 text-primary"
                                >
                                  {(p.type || '—').toUpperCase()}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm font-semibold text-muted-foreground hidden sm:table-cell  opacity-60">
                                  {p.date || "—"}
                              </TableCell>
                              <TableCell className="font-semibold text-sm text-primary">
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
              <Card className="border-border/40 rounded-[2.5rem] overflow-hidden bg-primary/5 backdrop-blur-md shadow-sm">
                <CardHeader className="p-8">
                  <CardTitle className="text-lg font-semibold ">Payout Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-10 p-8 pt-0">
                  <div className="space-y-4">
                    <Label className="text-sm  font-semibold text-muted-foreground opacity-60">
                      Minimum Payout
                    </Label>
                    <div className="flex items-end gap-3 font-semibold">
                      <span className="text-3xl text-primary">$100.00</span>
                      <span className="text-sm mb-1  opacity-40">USD</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <Label className="text-sm  font-semibold text-muted-foreground opacity-60">
                      Disbursement Schedule
                    </Label>
                    <p className="text-sm font-semibold ">
                      1st and 15th of every cycle
                    </p>
                  </div>
                  <Button className="w-full rounded-[1.2rem] h-14 font-semibold text-sm   shadow-xl shadow-primary/10"
                    onClick={handleEditSchedule}
                  >
                    Edit Schedule
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Settings/Config Tab */}
        <TabsContent value="settings" className="space-y-8 mt-0">
          <Card className="border-border/40 rounded-[2.5rem] overflow-hidden bg-card/40 backdrop-blur-md shadow-sm">
            <CardHeader className="p-8 border-b border-border/20">
              <CardTitle className="text-2xl font-semibold ">Finance Configuration</CardTitle>
              <p className="text-sm font-semibold  text-muted-foreground mt-1 opacity-60">Gateway and financial system settings</p>
            </CardHeader>
            <CardContent className="p-8 space-y-10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8 p-6 rounded-[2rem] border border-border/40 bg-muted/10">
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold ">Sandbox Mode</h4>
                  <p className="text-sm font-semibold  text-muted-foreground opacity-60">
                    Toggle sandbox mode for test payments and verification.
                  </p>
                </div>
                <div className="flex items-center gap-6 bg-background/50 p-3 rounded-2xl border border-border/50">
                  <Switch checked={sandboxMode}
                    onCheckedChange={setSandboxMode}
                    className="data-[state=checked]:bg-amber-500"
                  />
                  <Badge variant="outline"
                    className={cn(
                      "font-semibold text-xs px-4 h-7 rounded-lg   border-2 transition-all",
                      sandboxMode
                        ? "bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]"
                        : "bg-muted/10 text-muted-foreground border-border/50 opacity-40"
                    )}
                  >
                    {sandboxMode ? "Sandbox Active" : "Live"}
                  </Badge>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <Label className="text-sm  font-semibold text-muted-foreground opacity-60 ml-2">Audit Interval</Label>
                  <Select defaultValue="realtime">
                    <SelectTrigger className="h-14 rounded-[1.2rem] bg-muted/20 border-border/40 font-semibold text-sm   border-2">
                      <SelectValue placeholder="Select interval" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl p-2 font-semibold text-sm  ">
                      <SelectItem value="realtime">Real-time</SelectItem>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-4">
                  <Label className="text-sm  font-semibold text-muted-foreground opacity-60 ml-2">Base Currency</Label>
                  <Select defaultValue="usd">
                    <SelectTrigger className="h-14 rounded-[1.2rem] bg-muted/20 border-border/40 font-semibold text-sm   border-2">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl p-2 font-semibold text-sm  ">
                      <SelectItem value="usd">USD</SelectItem>
                      <SelectItem value="eur">EUR</SelectItem>
                      <SelectItem value="gbp">GBP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/10 border-t border-border/20 p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <Button variant="ghost"
                className="rounded-xl h-12 px-8 font-semibold text-sm   opacity-60 hover:opacity-100"
                onClick={handleResetDefaults}
              >
                Reset to Defaults
              </Button>
              <Button className="rounded-xl h-12 px-10 font-semibold text-sm   shadow-xl shadow-primary/20 bg-primary hover:scale-[1.02] transition-transform"
                onClick={handleSaveConfig}
              >
                Save Configuration
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Process Payout Dialog */}
      <Dialog open={isPayoutDialogOpen} onOpenChange={setIsPayoutDialogOpen}>
        <DialogContent className="sm:max-w-3xl rounded-[2.5rem] border-border/40 bg-card/60 backdrop-blur-xl shadow-2xl p-0 flex flex-col max-h-[85vh]">
          <DialogHeader className="shrink-0 p-8 pb-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
              <Zap className="w-7 h-7 text-primary" />
            </div>
            <DialogTitle className="text-3xl font-semibold ">Process Payout</DialogTitle>
            <DialogDescription className="text-sm font-semibold  opacity-60 mt-1">Send a payout to an affiliate or user.</DialogDescription>
          </DialogHeader>
          <form id="payout-form" onSubmit={(e) => { e.preventDefault(); handleConfirmPayout(); }} className="flex-1 overflow-y-auto px-8 space-y-5 pb-4" data-lenis-prevent>
            <div className="p-8 rounded-[2rem] bg-primary/5 border border-primary/20 shadow-inner flex items-center justify-between">
              <div>
                <p className="text-sm  font-semibold text-muted-foreground opacity-60 mb-2">
                  Available Balance
                </p>
                <p className="text-3xl font-semibold text-primary">{stats ? `$${stats.availableBalance}` : "$0.00"}</p>
              </div>
              <div className="w-12 h-12 rounded-full border-2 border-primary/20 flex items-center justify-center animate-pulse">
                <div className="w-2 h-2 rounded-full bg-primary" />
              </div>
            </div>
            <div className="space-y-6">
                <div className="space-y-2">
                    <Label className="text-sm font-semibold  ml-1 opacity-70">Recipient</Label>
                    <Input 
                        placeholder="Affiliate referral code or user email" 
                        className="rounded-[1.2rem] h-12 bg-background/50 border-border/50 font-semibold"
                        value={payoutRecipient}
                        onChange={(e) => setPayoutRecipient(e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-sm font-semibold  ml-1 opacity-70">Amount (USD)</Label>
                    <div className="relative">
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 font-semibold text-primary  opacity-50">$</span>
                        <Input 
                            type="number" 
                            placeholder="0.00" 
                            className="rounded-[1.2rem] h-12 bg-background/50 border-border/50 font-semibold pl-10"
                            value={payoutAmount}
                            onChange={(e) => setPayoutAmount(e.target.value)}
                        />
                    </div>
                </div>
            </div>
          </form>
          <DialogFooter className="shrink-0 p-8 bg-muted/10 border-t border-border/20 flex gap-4">
            <Button type="button" variant="ghost" className="rounded-[1.2rem] h-12 px-6 font-semibold text-sm   opacity-60 hover:opacity-100 flex-1" onClick={() => setIsPayoutDialogOpen(false)}>Cancel</Button>
            <Button type="submit" form="payout-form" className="rounded-[1.2rem] h-12 px-10 font-semibold text-sm   shadow-xl shadow-primary/20 bg-primary hover:scale-[1.02] transition-transform flex-1">
                Process Payout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Schedule Dialog */}
      <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
        <DialogContent className="sm:max-w-3xl rounded-[2.5rem] border-border/40 bg-card/60 backdrop-blur-xl shadow-2xl p-0 flex flex-col max-h-[85vh]">
          <DialogHeader className="shrink-0 p-8 pb-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-6">
              <Clock className="w-7 h-7 text-amber-500" />
            </div>
            <DialogTitle className="text-3xl font-semibold ">Payout Schedule</DialogTitle>
            <DialogDescription className="text-sm font-semibold  opacity-60 mt-1">Set how often payouts are processed.</DialogDescription>
          </DialogHeader>
          <form id="schedule-form" onSubmit={(e) => { e.preventDefault(); handleSaveSchedule(); }} className="flex-1 overflow-y-auto px-8 space-y-5 pb-4" data-lenis-prevent>
            <div className="grid grid-cols-2 gap-4">
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
                            "p-6 rounded-[1.5rem] border-2 transition-all cursor-pointer group flex flex-col justify-between h-28",
                            scheduleType === s.id 
                              ? "bg-primary/5 border-primary shadow-[0_0_20px_rgba(var(--primary),0.05)]" 
                              : "bg-muted/10 border-transparent hover:bg-muted/20"
                        )}
                    >
                        <p className={cn("font-semibold text-xs ", scheduleType === s.id ? "text-primary" : "text-muted-foreground opacity-60")}>{s.label}</p>
                        <p className="text-xs font-semibold  opacity-40">{s.desc}</p>
                    </div>
                ))}
            </div>
            <div className="p-6 rounded-[1.2rem] bg-amber-500/5 border border-amber-500/20 text-xs font-semibold text-amber-500/70  leading-relaxed  text-center">
                Automated payouts require verified payment information. Review pending before first cycle.
            </div>
          </form>
          <DialogFooter className="shrink-0 p-8 bg-muted/10 border-t border-border/20 flex gap-4">
            <Button type="button" variant="ghost" className="rounded-[1.2rem] h-12 px-6 font-semibold text-sm   opacity-60 hover:opacity-100 flex-1" onClick={() => setIsScheduleDialogOpen(false)}>Cancel</Button>
            <Button type="submit" form="schedule-form" className="rounded-[1.2rem] h-12 px-10 font-semibold text-sm   shadow-lg shadow-amber-500/20 bg-amber-500 text-white hover:scale-[1.02] transition-transform flex-1">
                Save Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default withRoleProtection(FinanceManagementPage, ["Admin", "SuperAdmin"]);

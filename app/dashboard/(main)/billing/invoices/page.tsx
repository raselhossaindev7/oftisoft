"use client"
import { Animated } from "@/lib/animated";

import Link from "next/link";
import {
    Download, Search, Filter, MoreHorizontal, CheckCircle2, Clock, AlertCircle, Plus,
    FileText, Eye, ShieldAlert, Printer, History, RefreshCw, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";
import { useInvoices } from "@/hooks/useInvoices";
import { useRole } from "@/hooks/useRole";
import { billingAPI, Transaction } from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const STATUS_STYLES: Record<string, string> = {
    "completed": "bg-green-500/10 text-green-500 border-green-500/20",
    "pending": "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    "failed": "bg-red-500/10 text-red-500 border-red-500/20",
    "paid": "bg-green-500/10 text-green-500 border-green-500/20",
};

function escapeCSV(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
}

export default function InvoicesPage() {
    const { invoices, isLoading, isError, refetch } = useInvoices();
    const { hasPermission } = useRole();
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [newInvoice, setNewInvoice] = useState({
        amount: "",
        type: "Professional Services"
    });

    const [selectedInvoice, setSelectedInvoice] = useState<Transaction | null>(null);

    const canCreateInvoice = hasPermission("billing.manage");

    const filteredInvoices = useMemo(() => {
        return invoices.filter(inv => {
            const matchesSearch =
                (inv.invoiceId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (inv.type || '').toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === "all" || inv.status?.toLowerCase() === statusFilter.toLowerCase();
            return matchesSearch && matchesStatus;
        });
    }, [invoices, searchQuery, statusFilter]);

    const toggleSelect = (id: string) => {
        if (selectedIds.includes(id)) setSelectedIds(selectedIds.filter(i => i !== id));
        else setSelectedIds([...selectedIds, id]);
    }

    const handleCreateInvoice = async () => {
        if (!newInvoice.amount) {
            toast.error("Please enter an amount");
            return;
        }
        const amount = parseFloat(newInvoice.amount);
        if (isNaN(amount) || amount <= 0) {
            toast.error("Please enter a valid amount");
            return;
        }
        setIsCreating(true);
        try {
            await billingAPI.createTransaction({
                amount: `$${amount.toFixed(2)}`,
                type: newInvoice.type,
                status: "pending"
            });
            toast.success("Ledger entry created");
            setIsCreateOpen(false);
            setNewInvoice({ amount: "", type: "Professional Services" });
            refetch();
        } catch {
            toast.error("Failed to create invoice. Please try again.");
        } finally {
            setIsCreating(false);
        }
    };

    const handleDownload = async (id: string) => {
        try {
            await billingAPI.downloadInvoice(id);
            toast.success("Invoice downloaded");
        } catch {
            toast.error("Failed to download invoice. Please try again.");
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleReport = (id: string) => {
        toast.info("Dispute support: contact billing support with invoice reference " + id);
    };

    const handleExportCSV = () => {
        if (filteredInvoices.length === 0) {
            toast.error("No invoices to export");
            return;
        }
        const headers = ["Reference", "Type", "Date", "Amount", "Status"];
        const rows = filteredInvoices.map(inv => [
            inv.invoiceId,
            inv.type,
            new Date(inv.createdAt).toLocaleDateString(),
            inv.amount,
            inv.status
        ]);
        const csv = [headers.join(","), ...rows.map(r => r.map(escapeCSV).join(","))].join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;header=present" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `invoices-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Export complete");
    };

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6">
                <AlertCircle className="w-16 h-16 text-red-500/80" />
                <h3 className="text-xl font-bold">Failed to load ledger</h3>
                <p className="text-muted-foreground text-sm text-center max-w-sm">Something went wrong. Please try again.</p>
                <Button onClick={() => refetch()} className="gap-2 rounded-xl">
                    <RefreshCw className="w-4 h-4" /> Retry
                </Button>
                <Link href="/dashboard/billing">
                    <Button variant="outline" className="rounded-xl">Back to Billing</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20">

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                        Financial History
                    </h1>
                    <p className="text-muted-foreground">Detailed ledger of your transactions and billing movements.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => refetch()} disabled={isLoading} className="rounded-xl gap-2 font-bold">
                        <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} /> Refresh
                    </Button>
                    <Link href="/dashboard/billing">
                        <Button variant="ghost" className="rounded-xl font-bold">Back to Billing</Button>
                    </Link>
                </div>
                {canCreateInvoice && (
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button className="rounded-xl h-auto gap-2 font-bold shadow-lg shadow-primary/20">
                                <Plus className="w-5 h-5" /> Generate Invoice
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="w-[95vw] max-w-lg sm:max-w-[425px] rounded-3xl border-border/50">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-semibold">Create New Invoice</DialogTitle>
                                <DialogDescription>
                                    Set up a manual billing entry for your ledger.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="type" className="font-bold">Billing Category</Label>
                                    <Input 
                                        id="type" 
                                        placeholder="e.g. Consultation Asset Purchase" 
                                        className="rounded-xl h-11"
                                        value={newInvoice.type}
                                        onChange={(e) => setNewInvoice({...newInvoice, type: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="amount" className="font-bold">Total Amount (USD)</Label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">$</span>
                                        <Input 
                                            id="amount" 
                                            type="number" 
                                            placeholder="0.00" 
                                            className="rounded-xl h-11 pl-8"
                                            value={newInvoice.amount}
                                            onChange={(e) => setNewInvoice({...newInvoice, amount: e.target.value})}
                                        />
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="ghost" className="rounded-xl h-11" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                                <Button className="rounded-xl h-11 px-8 font-bold shadow-lg shadow-primary/20" onClick={handleCreateInvoice} disabled={isCreating}>
                                    {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Ledger Entry"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            {/* Toolbar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Search invoice number or service type..."
                        className="w-full pl-11 h-auto bg-card/50 border-border/50 rounded-2xl shadow-sm focus:ring-primary/20"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[140px] h-auto rounded-2xl border-border/50 gap-2 font-bold">
                            <Filter className="w-4 h-4" />
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="paid">Paid</SelectItem>
                            <SelectItem value="failed">Failed</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline" className="h-auto rounded-2xl border-border/50 gap-2 font-bold" onClick={handleExportCSV}>
                        <Download className="w-4 h-4" /> Export
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-card/30 backdrop-blur-md border border-border/50 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black/5">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                        <thead className="bg-muted/30 text-muted-foreground font-bold uppercase text-sm">
                            <tr>
                                <th className="p-6 w-12">
                                    <input 
                                        type="checkbox" 
                                        className="rounded-md w-5 h-5 border-border/50 bg-background text-primary focus:ring-primary/20" 
                                        onChange={(e) => setSelectedIds(e.target.checked ? filteredInvoices.map(i => i.id) : [])} 
                                        checked={selectedIds.length === filteredInvoices.length && filteredInvoices.length > 0}
                                    />
                                </th>
                                <th className="p-6 whitespace-nowrap">Reference #</th>
                                <th className="p-6 whitespace-nowrap">Service Type</th>
                                <th className="p-6 whitespace-nowrap">Issue Date</th>
                                <th className="p-6 whitespace-nowrap">Net Total</th>
                                <th className="p-6 whitespace-nowrap">Current Status</th>
                                <th className="p-6 w-20"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {isLoading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={7} className="p-10 text-center text-muted-foreground">
                                            <div className="flex items-center justify-center gap-3">
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                <span>Loading system ledger...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : filteredInvoices.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-16 h-16 rounded-3xl bg-muted/50 flex items-center justify-center">
                                                <History className="w-8 h-8 text-muted-foreground/50" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-lg">No records found</p>
                                                <p className="text-muted-foreground text-sm">Your financial history is currently empty.</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredInvoices.map((inv, i) => (
                                <Animated as="tr"
                                    key={inv.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    style={{ willChange: "transform, opacity" }}
                                    transition={{ delay: i * 0.1 }}
                                    className={cn(
                                        "group hover:bg-primary/[0.02] transition-colors",
                                        selectedIds.includes(inv.id) && "bg-primary/[0.04]"
                                    )}
                                >
                                    <td className="p-6">
                                        <input type="checkbox"
                                            className="rounded-md w-5 h-5 border-border/50 bg-background text-primary focus:ring-primary/20"
                                            checked={selectedIds.includes(inv.id)}
                                            onChange={() => toggleSelect(inv.id)}
                                        />
                                    </td>
                                    <td className="p-6">
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-foreground font-mono text-xs">{inv.invoiceId}</span>
                                            <span className="text-sm text-muted-foreground uppercase font-bold opacity-50">PROCESSED SYSTEM PKT</span>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center">
                                                <FileText className="w-4 h-4 text-muted-foreground" />
                                            </div>
                                            <span className="font-bold">{inv.type}</span>
                                        </div>
                                    </td>
                                    <td className="p-6 text-muted-foreground font-medium">
                                        {new Date(inv.createdAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </td>
                                    <td className="p-6 font-semibold text-primary text-base">{inv.amount ?? '—'}</td>
                                    <td className="p-6">
                                        <span className={cn(
                                            "px-4 py-1.5 rounded-full text-sm font-semibold uppercase border-2 flex items-center gap-2 w-fit",
                                            STATUS_STYLES[(inv.status || '').toLowerCase()] || "border-border text-muted-foreground bg-muted/20"
                                        )}>
                                            {(inv.status === 'Paid' || inv.status === 'completed') && <CheckCircle2 className="w-3.5 h-3.5" />}
                                            {inv.status === 'Pending' && <Clock className="w-3.5 h-3.5" />}
                                            {inv.status === 'failed' && <AlertCircle className="w-3.5 h-3.5" />}
                                            {inv.status || '—'}
                                        </span>
                                    </td>
                                    <td className="p-6">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-muted">
                                                    <MoreHorizontal className="w-5 h-5" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl border-border/50">
                                                <DropdownMenuItem className="rounded-xl gap-3 cursor-pointer py-2.5" onClick={() => setSelectedInvoice(inv)}>
                                                    <Eye className="w-4 h-4" /> View Details
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="rounded-xl gap-3 cursor-pointer py-2.5" onClick={() => handleDownload(inv.invoiceId)}>
                                                    <Download className="w-4 h-4" /> Download PDF
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="rounded-xl gap-3 cursor-pointer py-2.5" onClick={handlePrint}>
                                                    <Printer className="w-4 h-4" /> Print Receipt
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator className="my-2 bg-border/50" />
                                                <DropdownMenuItem className="rounded-xl gap-3 cursor-pointer py-2.5 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleReport(inv.invoiceId)}>
                                                    <ShieldAlert className="w-4 h-4" /> Dispute Invoice
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </td>
                                </Animated>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Detail Dialog */}
            <Dialog open={!!selectedInvoice} onOpenChange={(open) => !open && setSelectedInvoice(null)}>
                <DialogContent className="w-[95vw] max-w-lg sm:max-w-[600px] rounded-[2rem] border-border/50 overflow-hidden p-0">
                    {selectedInvoice && (
                        <div className="flex flex-col">
                            <div className="bg-primary/5 p-8 border-b border-border/50">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-16 h-16 rounded-[1.25rem] bg-background border border-border/50 flex items-center justify-center font-semibold text-2xl text-primary shadow-sm">
                                        OF
                                    </div>
                                    <span className={cn(
                                        "px-5 py-2 rounded-full text-xs font-semibold uppercase border-2",
                                        STATUS_STYLES[(selectedInvoice.status || '').toLowerCase()]
                                    )}>
                                        {selectedInvoice.status}
                                    </span>
                                </div>
                                <h3 className="text-3xl font-semibold mb-1">{selectedInvoice.invoiceId}</h3>
                                <p className="text-muted-foreground font-medium">{selectedInvoice.type}</p>
                            </div>
                            
                            <div className="p-8 space-y-8">
                                <div className="grid grid-cols-3 gap-8">
                                    <div className="space-y-1">
                                        <p className="text-sm uppercase font-bold text-muted-foreground">Issued Date</p>
                                        <p className="font-bold">{new Date(selectedInvoice.createdAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm uppercase font-bold text-muted-foreground">Due Date</p>
                                        <p className="font-bold text-orange-500">
                                            {selectedInvoice.dueAt 
                                                ? new Date(selectedInvoice.dueAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
                                                : "Immediate"
                                            }
                                        </p>
                                    </div>
                                    <div className="space-y-1 text-right">
                                        <p className="text-sm uppercase font-bold text-muted-foreground">Method</p>
                                        <p className="font-bold text-sm uppercase opacity-70">Balance Payout</p>
                                    </div>
                                </div>

                                <div className="bg-muted/30 rounded-3xl p-6">
                                    <div className="flex justify-between items-center mb-4 pb-4 border-b border-border/50">
                                        <span className="text-muted-foreground font-bold">Line Amount</span>
                                        <span className="font-bold text-foreground">{selectedInvoice.amount}</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-background p-4 rounded-2xl border border-border/50">
                                        <span className="text-lg font-semibold uppercase text-sm text-muted-foreground">Grand Total</span>
                                        <span className="text-2xl font-semibold text-primary">{selectedInvoice.amount}</span>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <Button className="flex-1 rounded-2xl h-14 font-semibold text-sm uppercase" onClick={() => handleDownload(selectedInvoice.invoiceId)}>
                                        <Download className="w-5 h-5 mr-3" /> Get PDF
                                    </Button>
                                    <Button variant="outline" className="flex-1 rounded-2xl h-14 font-semibold text-sm uppercase border-border/50" onClick={handlePrint}>
                                        <Printer className="w-5 h-5 mr-3" /> Print
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

        </div>
    );
}

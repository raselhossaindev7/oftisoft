import { useState, useCallback } from "react";
import { adminFinanceAPI } from "@/lib/api";
import { toast } from "sonner";

export function useFinance() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [payouts, setPayouts] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [config, setConfig] = useState<any>(null);
    const [taxRates, setTaxRates] = useState<any[]>([]);

    // Separate loading states for each data type
    const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
    const [isLoadingPayouts, setIsLoadingPayouts] = useState(false);
    const [isLoadingStats, setIsLoadingStats] = useState(false);
    const [isLoadingConfig, setIsLoadingConfig] = useState(false);
    const [isLoadingTaxRates, setIsLoadingTaxRates] = useState(false);
    const [dodoData, setDodoData] = useState<{ products: any[]; payments: any[]; subscriptions: any[]; customers: any[]; discounts: any[] }>({
        products: [],
        payments: [],
        subscriptions: [],
        customers: [],
        discounts: [],
    });
    const [isLoadingDodo, setIsLoadingDodo] = useState(false);
    const [isProcessingPayout, setIsProcessingPayout] = useState(false);
    const [isSavingConfig, setIsSavingConfig] = useState(false);

    const [error, setError] = useState<string | null>(null);

    // Combined loading for initial page load
    const isLoading = isLoadingStats || isLoadingTransactions || isLoadingPayouts || isLoadingConfig;

    const fetchTransactions = useCallback(async (params?: { status?: string; dateFrom?: string; dateTo?: string }) => {
        setIsLoadingTransactions(true);
        setError(null);
        try {
            const data = await adminFinanceAPI.getTransactions(params);
            setTransactions(data);
        } catch (err: any) {
            const message = err.response?.data?.message || err.message || "Failed to fetch transactions";
            setError(message);
            toast.error(message);
        } finally {
            setIsLoadingTransactions(false);
        }
    }, []);

    const fetchPayouts = useCallback(async () => {
        setIsLoadingPayouts(true);
        try {
            const data = await adminFinanceAPI.getPayouts();
            setPayouts(data);
        } catch (err: any) {
            console.error("Failed to fetch payouts", err);
        } finally {
            setIsLoadingPayouts(false);
        }
    }, []);

    const fetchStats = useCallback(async () => {
        setIsLoadingStats(true);
        try {
            const data = await adminFinanceAPI.getStats();
            setStats(data);
        } catch (err: any) {
            console.error("Failed to fetch stats", err);
        } finally {
            setIsLoadingStats(false);
        }
    }, []);

    const fetchConfig = useCallback(async () => {
        setIsLoadingConfig(true);
        try {
            const data = await adminFinanceAPI.getConfig();
            setConfig(data);
        } catch (err: any) {
            console.error("Failed to fetch config", err);
        } finally {
            setIsLoadingConfig(false);
        }
    }, []);

    const fetchTaxRates = useCallback(async () => {
        setIsLoadingTaxRates(true);
        try {
            const data = await adminFinanceAPI.getTaxRates();
            setTaxRates(data);
        } catch (err: any) {
            console.error("Failed to fetch tax rates", err);
        } finally {
            setIsLoadingTaxRates(false);
        }
    }, []);

    const processPayout = async (data: any) => {
        setIsProcessingPayout(true);
        try {
            const res = await adminFinanceAPI.processPayout(data);
            toast.success(res.message || "Payout processed");
            fetchStats();
            fetchPayouts();
            return true;
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to process payout");
            return false;
        } finally {
            setIsProcessingPayout(false);
        }
    };

    const updateConfig = async (newConfig: any) => {
        setIsSavingConfig(true);
        try {
            await adminFinanceAPI.updateConfig(newConfig);
            toast.success("Configuration updated");
            fetchConfig();
            return true;
        } catch (err: any) {
            toast.error("Failed to update configuration");
            return false;
        } finally {
            setIsSavingConfig(false);
        }
    };

    const fetchDodoData = useCallback(async () => {
        setIsLoadingDodo(true);
        try {
            const [products, payments, subscriptions, customers, discounts] = await Promise.all([
                adminFinanceAPI.getDodoProducts().catch(() => []),
                adminFinanceAPI.getDodoPayments().catch(() => []),
                adminFinanceAPI.getDodoSubscriptions().catch(() => []),
                adminFinanceAPI.getDodoCustomers().catch(() => []),
                adminFinanceAPI.getDodoDiscounts().catch(() => []),
            ]);
            setDodoData({ products, payments, subscriptions, customers, discounts });
        } catch {
            setDodoData({ products: [], payments: [], subscriptions: [], customers: [], discounts: [] });
        } finally {
            setIsLoadingDodo(false);
        }
    }, []);

    const exportTransactions = useCallback(async (format: 'csv' | 'json' = 'csv') => {
        try {
            const data = await adminFinanceAPI.getTransactions();
            if (format === 'csv') {
                downloadCSV(data, 'transactions');
            } else {
                downloadJSON(data, 'transactions');
            }
            toast.success("Export downloaded");
        } catch (err: any) {
            toast.error("Failed to export transactions");
        }
    }, []);

    return {
        transactions,
        payouts,
        stats,
        config,
        taxRates,
        dodoData,
        isLoading,
        isLoadingTransactions,
        isLoadingPayouts,
        isLoadingStats,
        isLoadingConfig,
        isLoadingTaxRates,
        isLoadingDodo,
        isProcessingPayout,
        isSavingConfig,
        error,
        fetchTransactions,
        fetchPayouts,
        fetchStats,
        fetchConfig,
        fetchTaxRates,
        fetchDodoData,
        processPayout,
        updateConfig,
        exportTransactions,
    };
}

function downloadCSV(data: any[], filename: string) {
    if (!data.length) return;

    const headers = Object.keys(data[0]);
    const csvRows = [
        headers.join(','),
        ...data.map(row =>
            headers.map(h => {
                let val = row[h];
                if (val === null || val === undefined) val = '';
                if (typeof val === 'object') val = JSON.stringify(val);
                // Escape quotes and wrap in quotes
                val = String(val).replace(/"/g, '""');
                return `"${val}"`;
            }).join(',')
        )
    ];

    const csv = csvRows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
}

function downloadJSON(data: any[], filename: string) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
}

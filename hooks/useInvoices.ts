import { useState, useCallback, useEffect } from "react";
import { billingAPI, Transaction } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "./useAuth";

function getErrorMessage(err: unknown, fallback: string): string {
    if (err && typeof err === "object" && "response" in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        return axiosErr.response?.data?.message || fallback;
    }
    if (err instanceof Error) return err.message;
    return fallback;
}

export function useInvoices() {
    const { user } = useAuth();
    const [invoices, setInvoices] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchInvoices = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await billingAPI.getTransactions();
            setInvoices(data || []);
        } catch (err: unknown) {
            const message = getErrorMessage(err, "Failed to fetch invoices");
            setError(message);
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (user) {
            fetchInvoices();
        }
    }, [user, fetchInvoices]);

    return {
        invoices,
        isLoading,
        error,
        isError: !!error,
        refetch: fetchInvoices,
    };
}

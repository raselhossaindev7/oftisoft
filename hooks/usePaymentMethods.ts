import { useState, useCallback, useEffect } from "react";
import { billingAPI, PaymentMethod } from "@/lib/api";
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

export function usePaymentMethods() {
    const { user } = useAuth();
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchPaymentMethods = useCallback(async () => {
        setIsFetching(true);
        setError(null);
        try {
            const data = await billingAPI.getPaymentMethods();
            setPaymentMethods(data);
        } catch (err: unknown) {
            const message = getErrorMessage(err, "Failed to fetch payment methods");
            setError(message);
        } finally {
            setIsFetching(false);
        }
    }, []);

    const addPaymentMethod = useCallback(async (data: Partial<PaymentMethod>) => {
        setIsLoading(true);
        try {
            const newMethod = await billingAPI.addPaymentMethod(data);
            setPaymentMethods(prev => [...prev, newMethod]);
            toast.success("Payment method added successfully");
            return newMethod;
        } catch (err: unknown) {
            const message = getErrorMessage(err, "Failed to add payment method");
            toast.error(message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const setDefaultMethod = useCallback(async (id: string) => {
        setPaymentMethods(prev => prev.map(m => ({ ...m, isDefault: m.id === id })));
        try {
            await billingAPI.setDefaultPaymentMethod(id);
            toast.success("Default payment method updated");
        } catch (err: unknown) {
            const message = getErrorMessage(err, "Failed to set default payment method");
            toast.error(message);
            await fetchPaymentMethods();
        }
    }, [fetchPaymentMethods]);

    const deleteMethod = useCallback(async (id: string) => {
        const previous = paymentMethods;
        setPaymentMethods(prev => prev.filter(m => m.id !== id));
        try {
            await billingAPI.deletePaymentMethod(id);
            toast.success("Payment method removed");
        } catch (err: unknown) {
            const message = getErrorMessage(err, "Failed to remove payment method");
            toast.error(message);
            setPaymentMethods(previous);
        }
    }, [paymentMethods]);

    useEffect(() => {
        if (user) {
            fetchPaymentMethods();
        }
    }, [user, fetchPaymentMethods]);

    return {
        paymentMethods,
        isLoading: isLoading || isFetching,
        error,
        refetch: fetchPaymentMethods,
        addPaymentMethod,
        setDefaultMethod,
        deleteMethod,
    };
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { billingAPI } from '@/lib/api';
import { toast } from 'sonner';

export function useSubscription() {
    const queryClient = useQueryClient();

    const { data: subscription, isLoading, isError } = useQuery({
        queryKey: ['subscription'],
        queryFn: billingAPI.getSubscription,
        staleTime: 1000 * 60 * 5,
        retry: 1,
    });

    const updateMutation = useMutation({
        mutationFn: async ({ plan }: { plan: string }) => {
            return billingAPI.updateSubscription(plan);
        },
        onSuccess: (data, variables) => {
            toast.success(`Switched to ${variables.plan} Plan!`);
            queryClient.invalidateQueries({ queryKey: ['subscription'] });
            queryClient.invalidateQueries({ queryKey: ['plans'] });
        },
        onError: (err: any) => {
            const message = err.response?.data?.message || "Failed to update subscription";
            toast.error(message);
        },
    });

    return {
        subscription: subscription ?? null,
        isLoading,
        isError,
        error: isError ? "Failed to load subscription" : null,
        updateSubscription: (plan: string) =>
            updateMutation.mutateAsync({ plan }),
        isUpdating: updateMutation.isPending,
        refetch: () => queryClient.refetchQueries({ queryKey: ['subscription'] }),
    };
}
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { portfolioAPI, type PortfolioItem, type PortfolioFilters } from '@/lib/api';
import { toast } from 'sonner';

export function usePortfolio(filters?: PortfolioFilters) {
    const queryClient = useQueryClient();

    const { data, isLoading, error, refetch, isError } = useQuery({
        queryKey: ['portfolio', filters],
        queryFn: () => portfolioAPI.getAll(filters),
    });

    const { data: stats, isLoading: isStatsLoading } = useQuery({
        queryKey: ['portfolio-stats'],
        queryFn: () => portfolioAPI.getStats(),
        staleTime: 1000 * 60 * 5,
    });

    const items = data?.items ?? [];
    const total = data?.total ?? 0;

    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: ['portfolio'] });
        queryClient.invalidateQueries({ queryKey: ['portfolio-stats'] });
    };

    const createItem = useMutation({
        mutationFn: portfolioAPI.create,
        onSuccess: () => { invalidate(); toast.success('Portfolio item created'); },
        onError: (error: any) => toast.error(error?.response?.data?.message || 'Failed to create item'),
    });

    const updateItem = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<PortfolioItem> }) => portfolioAPI.update(id, data),
        onSuccess: () => { invalidate(); toast.success('Portfolio item updated'); },
        onError: (error: any) => toast.error(error?.response?.data?.message || 'Failed to update item'),
    });

    const deleteItem = useMutation({
        mutationFn: portfolioAPI.delete,
        onSuccess: () => { invalidate(); toast.success('Portfolio item deleted'); },
        onError: (error: any) => toast.error(error?.response?.data?.message || 'Failed to delete item'),
    });

    const bulkDeleteItems = useMutation({
        mutationFn: portfolioAPI.bulkDelete,
        onSuccess: () => { invalidate(); toast.success('Portfolio items deleted'); },
        onError: (error: any) => toast.error(error?.response?.data?.message || 'Failed to delete items'),
    });

    const bulkUpdateStatus = useMutation({
        mutationFn: ({ ids, status }: { ids: string[]; status: string }) => portfolioAPI.bulkUpdateStatus(ids, status),
        onSuccess: (_data, variables) => { invalidate(); toast.success(`Items ${variables.status === 'published' ? 'published' : 'drafted'}`); },
        onError: (error: any) => toast.error(error?.response?.data?.message || 'Failed to update items'),
    });

    const reorderItems = useMutation({
        mutationFn: portfolioAPI.reorder,
        onSuccess: () => { invalidate(); toast.success('Order updated'); },
        onError: (error: any) => toast.error(error?.response?.data?.message || 'Failed to reorder'),
    });

    return {
        items, total, stats, isLoading, isStatsLoading, error, isError, refetch,
        createItem: createItem.mutate, isCreating: createItem.isPending,
        updateItem: updateItem.mutate, isUpdating: updateItem.isPending,
        deleteItem: deleteItem.mutate, isDeleting: deleteItem.isPending,
        bulkDeleteItems: bulkDeleteItems.mutate, isBulkDeleting: bulkDeleteItems.isPending,
        bulkUpdateStatus: bulkUpdateStatus.mutate, isBulkUpdating: bulkUpdateStatus.isPending,
        reorderItems: reorderItems.mutate, isReordering: reorderItems.isPending,
    };
}

export function usePortfolioItem(id: string) {
    return useQuery({
        queryKey: ['portfolio-item', id],
        queryFn: () => portfolioAPI.getOne(id),
        enabled: !!id,
    });
}

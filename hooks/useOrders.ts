
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersAPI, Order } from '@/lib/api';
import { toast } from 'sonner';

export function useOrders(orderId?: string) {
    const queryClient = useQueryClient();

    const { data: ordersResponse = [], isLoading: ordersLoading, isError: ordersError, refetch: refetchOrders } = useQuery({
        queryKey: ['orders'],
        queryFn: ordersAPI.getOrders,
        enabled: !orderId
    });

    const orders = Array.isArray(ordersResponse) ? ordersResponse : (ordersResponse as any)?.data ?? [];

    const { data: order, isLoading: orderLoading, isError: orderError, refetch: refetchOrder } = useQuery({
        queryKey: ['orders', orderId],
        queryFn: () => ordersAPI.getOrder(orderId!),
        enabled: !!orderId
    });

    const createOrderMutation = useMutation({
        mutationFn: ordersAPI.createOrder,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            toast.success("Order created successfully");
        },
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) => ordersAPI.updateStatus(id, status),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            queryClient.invalidateQueries({ queryKey: ['orders', variables.id] });
            toast.success(`Order status updated to ${variables.status}`);
        },
        onError: () => toast.error('Failed to update order status'),
    });

    const updateOrderMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: { internalNotes?: string; trackingNumber?: string } }) => ordersAPI.updateOrder(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            queryClient.invalidateQueries({ queryKey: ['orders', variables.id] });
            toast.success('Order updated');
        },
        onError: () => toast.error('Failed to update order'),
    });

    const downloadInvoiceMutation = useMutation({
        mutationFn: ordersAPI.downloadInvoice,
        onSuccess: () => {
            toast.success("Invoice downloaded successfully");
        },
        onError: () => {
            toast.error("Failed to download invoice");
        }
    });

    const exportReportMutation = useMutation({
        mutationFn: ordersAPI.exportReport,
        onSuccess: () => {
            toast.success("Report exported successfully");
        },
        onError: () => {
            toast.error("Failed to export report");
        }
    });

    const deleteOrderMutation = useMutation({
        mutationFn: ordersAPI.deleteOrder,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            toast.success("Order deleted successfully");
        },
        onError: (err: any) => toast.error(err?.response?.data?.message || "Failed to delete order"),
    });

    return {
        orders: orders as Order[],
        order: order as Order,
        isLoading: orderId ? orderLoading : ordersLoading,
        isError: orderId ? orderError : ordersError,
        refetch: orderId ? refetchOrder : refetchOrders,
        createOrder: createOrderMutation.mutate,
        updateStatus: (id: string, status: string) => updateStatusMutation.mutate({ id, status }),
        updateOrder: (id: string, data: { internalNotes?: string; trackingNumber?: string }) => updateOrderMutation.mutate({ id, data }),
        downloadInvoice: (id: string, options?: any) => downloadInvoiceMutation.mutate(id, options),
        exportReport: (variables?: any, options?: any) => exportReportMutation.mutate(variables, options),
        deleteOrder: (id: string) => deleteOrderMutation.mutate(id),
        isDownloadingInvoice: downloadInvoiceMutation.isPending,
        isExportingReport: exportReportMutation.isPending,
        isUpdatingStatus: updateStatusMutation.isPending,
        isUpdatingOrder: updateOrderMutation.isPending,
        isDeletingOrder: deleteOrderMutation.isPending,
    };
}

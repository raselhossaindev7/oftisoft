import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsAPI, Product } from '@/lib/api';
import { toast } from 'sonner';

export function useProducts(productId?: string, search?: string, category?: string) {
    const queryClient = useQueryClient();

    const { data: products = [], isLoading: productsLoading } = useQuery({
        queryKey: ['products', search, category],
        queryFn: () => productsAPI.getProducts(search, category),
        enabled: !productId
    });

    const { data: product, isLoading: productLoading } = useQuery({
        queryKey: ['products', productId],
        queryFn: () => productsAPI.getProduct(productId!),
        enabled: !!productId
    });

    const { data: stats, isLoading: statsLoading } = useQuery({
        queryKey: ['products', 'stats'],
        queryFn: productsAPI.getStats,
        enabled: !productId
    });

    const createProductMutation = useMutation({
        mutationFn: productsAPI.createProduct,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['products', 'stats'] });
            toast.success("Product created successfully");
        },
        onError: () => {
            toast.error("Failed to create product");
        }
    });

    const updateProductMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Product> }) =>
            productsAPI.updateProduct(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['products', 'stats'] });
            toast.success("Product updated successfully");
        },
        onError: () => {
            toast.error("Failed to update product");
        }
    });

    const deleteProductMutation = useMutation({
        mutationFn: productsAPI.deleteProduct,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['products', 'stats'] });
            toast.success("Product deleted successfully");
        },
        onError: () => {
            toast.error("Failed to delete product");
        }
    });

    return {
        products: products as Product[],
        product: product as Product,
        stats,
        isLoading: productId ? productLoading : productsLoading,
        isStatsLoading: statsLoading,
        createProduct: (data: Partial<Product>, options?: { onSuccess?: () => void }) => {
            createProductMutation.mutate(data, {
                onSuccess: () => {
                    options?.onSuccess?.();
                }
            });
        },
        updateProduct: (id: string, data: Partial<Product>, options?: { onSuccess?: () => void }) => {
            updateProductMutation.mutate({ id, data }, {
                onSuccess: () => {
                    options?.onSuccess?.();
                }
            });
        },
        deleteProduct: (id: string) => deleteProductMutation.mutate(id),
        isCreating: createProductMutation.isPending,
        isUpdating: updateProductMutation.isPending,
        isDeleting: deleteProductMutation.isPending,
    };
}
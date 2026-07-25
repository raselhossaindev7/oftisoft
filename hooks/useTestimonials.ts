import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { testimonialsAPI, type Testimonial, type TestimonialsFilters } from '@/lib/api';
import { toast } from 'sonner';

export function useTestimonials(filters?: TestimonialsFilters) {
    const queryClient = useQueryClient();

    const { data, isLoading, error, refetch, isError } = useQuery({
        queryKey: ['testimonials', filters],
        queryFn: () => testimonialsAPI.getAll(filters),
    });

    const { data: stats, isLoading: isStatsLoading } = useQuery({
        queryKey: ['testimonials-stats'],
        queryFn: () => testimonialsAPI.getStats(),
        staleTime: 1000 * 60 * 5,
    });

    const testimonials = data?.items ?? [];
    const total = data?.total ?? 0;

    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: ['testimonials'] });
        queryClient.invalidateQueries({ queryKey: ['testimonials-stats'] });
    };

    const createTestimonial = useMutation({
        mutationFn: testimonialsAPI.create,
        onSuccess: () => {
            invalidate();
            toast.success('Testimonial created successfully');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || error.message || 'Failed to create testimonial');
        },
    });

    const updateTestimonial = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Testimonial> }) =>
            testimonialsAPI.update(id, data),
        onSuccess: () => {
            invalidate();
            toast.success('Testimonial updated successfully');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || error.message || 'Failed to update testimonial');
        },
    });

    const deleteTestimonial = useMutation({
        mutationFn: testimonialsAPI.delete,
        onSuccess: () => {
            invalidate();
            toast.success('Testimonial deleted');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || error.message || 'Failed to delete testimonial');
        },
    });

    const bulkDeleteTestimonials = useMutation({
        mutationFn: testimonialsAPI.bulkDelete,
        onSuccess: () => {
            invalidate();
            toast.success('Testimonials deleted');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || error.message || 'Failed to delete testimonials');
        },
    });

    const bulkUpdateStatus = useMutation({
        mutationFn: ({ ids, isActive }: { ids: string[]; isActive: boolean }) =>
            testimonialsAPI.bulkUpdateStatus(ids, isActive),
        onSuccess: (_data, variables) => {
            invalidate();
            toast.success(`Testimonials ${variables.isActive ? 'activated' : 'deactivated'}`);
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || error.message || 'Failed to update testimonials');
        },
    });

    const reorderTestimonials = useMutation({
        mutationFn: testimonialsAPI.reorder,
        onSuccess: () => {
            invalidate();
            toast.success('Order updated');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || error.message || 'Failed to reorder');
        },
    });

    return {
        testimonials,
        total,
        stats,
        isLoading,
        isStatsLoading,
        error,
        isError,
        refetch,
        createTestimonial: createTestimonial.mutate,
        isCreating: createTestimonial.isPending,
        updateTestimonial: updateTestimonial.mutate,
        isUpdating: updateTestimonial.isPending,
        deleteTestimonial: deleteTestimonial.mutate,
        isDeleting: deleteTestimonial.isPending,
        bulkDeleteTestimonials: bulkDeleteTestimonials.mutate,
        isBulkDeleting: bulkDeleteTestimonials.isPending,
        bulkUpdateStatus: bulkUpdateStatus.mutate,
        isBulkUpdating: bulkUpdateStatus.isPending,
        reorderTestimonials: reorderTestimonials.mutate,
        isReordering: reorderTestimonials.isPending,
    };
}

export function useTestimonial(id: string) {
    return useQuery({
        queryKey: ['testimonial', id],
        queryFn: () => testimonialsAPI.getOne(id),
        enabled: !!id,
    });
}

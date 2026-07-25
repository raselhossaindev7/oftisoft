import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewsAPI, type Review } from '@/lib/api';
import { toast } from 'sonner';

export function useReviews(options?: { forModeration?: boolean }) {
    const queryClient = useQueryClient();
    const forModeration = options?.forModeration ?? false;

    const { data, isLoading, error, refetch, isError } = useQuery({
        queryKey: ['reviews', forModeration ? 'moderation' : 'mine'],
        queryFn: () => {
            const fn = forModeration ? reviewsAPI.getReviewsForModeration : reviewsAPI.getReviews;
            return fn(0, 100);
        },
    });

    const reviews = data?.items ?? [];

    const createReview = useMutation({
        mutationFn: reviewsAPI.createReview,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reviews'] });
            toast.success("Review submitted for moderation.");
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || error.message || "Failed to submit review");
        }
    });

    const updateReview = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Review> }) => reviewsAPI.updateReview(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reviews'] });
            toast.success("Review updated");
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || error.message || "Failed to update review");
        }
    });

    const deleteReview = useMutation({
        mutationFn: reviewsAPI.deleteReview,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reviews'] });
            toast.success("Review removed.");
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || error.message || "Failed to delete review");
        }
    });

    return {
        reviews, total: data?.total ?? 0,
        isLoading,
        error,
        isError,
        refetch,
        createReview: createReview.mutate,
        isCreating: createReview.isPending,
        updateReview: updateReview.mutate,
        isUpdating: updateReview.isPending,
        deleteReview: deleteReview.mutate,
        isDeleting: deleteReview.isPending,
    };
}

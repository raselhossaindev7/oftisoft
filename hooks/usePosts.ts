import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { postsAPI, Post } from '@/lib/api';
import { toast } from 'sonner';

export function usePosts(params?: { status?: string; search?: string; categoryId?: string; limit?: number; offset?: number }) {
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['posts', params?.status, params?.search, params?.categoryId, params?.limit, params?.offset],
        queryFn: () => postsAPI.getPosts(params),
    });

    const { data: stats, isLoading: isStatsLoading } = useQuery({
        queryKey: ['posts', 'stats'],
        queryFn: postsAPI.getStats,
    });

    const createMutation = useMutation({
        mutationFn: postsAPI.createPost,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['posts'] });
            toast.success("Post created successfully");
        },
        onError: () => {
            toast.error("Failed to create post");
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Parameters<typeof postsAPI.updatePost>[1] }) =>
            postsAPI.updatePost(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['posts'] });
            toast.success("Post updated successfully");
        },
        onError: () => {
            toast.error("Failed to update post");
        }
    });

    const deleteMutation = useMutation({
        mutationFn: postsAPI.deletePost,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['posts'] });
            toast.success("Post deleted successfully");
        },
        onError: () => {
            toast.error("Failed to delete post");
        }
    });

    const publishMutation = useMutation({
        mutationFn: postsAPI.publishPost,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['posts'] });
            toast.success("Post published successfully");
        }
    });

    const archiveMutation = useMutation({
        mutationFn: postsAPI.archivePost,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['posts'] });
            toast.success("Post archived successfully");
        }
    });

    const duplicateMutation = useMutation({
        mutationFn: postsAPI.duplicatePost,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['posts'] });
            toast.success("Post duplicated successfully");
        },
        onError: () => {
            toast.error("Failed to duplicate post");
        }
    });

    const unpublishMutation = useMutation({
        mutationFn: postsAPI.unpublishPost,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['posts'] });
            toast.success("Post unpublished successfully");
        }
    });

    const restoreMutation = useMutation({
        mutationFn: postsAPI.restorePost,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['posts'] });
            toast.success("Post restored successfully");
        }
    });

    return {
        posts: data?.posts || [],
        total: data?.total || 0,
        stats,
        isLoading,
        isStatsLoading,
        createPost: (postData: Parameters<typeof postsAPI.createPost>[0], options?: { onSuccess?: () => void }) => {
            createMutation.mutate(postData, {
                onSuccess: () => options?.onSuccess?.()
            });
        },
        updatePost: (id: string, data: Parameters<typeof postsAPI.updatePost>[1], options?: { onSuccess?: () => void }) => {
            updateMutation.mutate({ id, data }, {
                onSuccess: () => options?.onSuccess?.()
            });
        },
        deletePost: (id: string) => deleteMutation.mutate(id),
        publishPost: (id: string) => publishMutation.mutate(id),
        archivePost: (id: string) => archiveMutation.mutate(id),
        duplicatePost: (id: string) => duplicateMutation.mutate(id),
        unpublishPost: (id: string) => unpublishMutation.mutate(id),
        restorePost: (id: string) => restoreMutation.mutate(id),
        isCreating: createMutation.isPending,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
        isPublishing: publishMutation.isPending,
    };
}

export function usePost(id?: string) {
    const { data: post, isLoading } = useQuery({
        queryKey: ['posts', id],
        queryFn: () => postsAPI.getPost(id!),
        enabled: !!id,
    });

    return { post, isLoading };
}

export function usePostTags() {
    return useQuery({
        queryKey: ['post-tags'],
        queryFn: postsAPI.getTags,
    });
}

export function usePostCategories() {
    return useQuery({
        queryKey: ['post-categories'],
        queryFn: postsAPI.getCategories,
    });
}

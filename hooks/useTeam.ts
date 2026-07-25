import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teamMembersAPI, type TeamMember, type TeamFilters } from '@/lib/api';
import { toast } from 'sonner';

export function useTeam(filters?: TeamFilters) {
    const queryClient = useQueryClient();

    const { data, isLoading, error, refetch, isError } = useQuery({
        queryKey: ['team', filters],
        queryFn: () => teamMembersAPI.getAll(filters),
    });

    const { data: stats, isLoading: isStatsLoading } = useQuery({
        queryKey: ['team-stats'],
        queryFn: () => teamMembersAPI.getStats(),
        staleTime: 1000 * 60 * 5,
    });

    const members = data?.items ?? [];
    const total = data?.total ?? 0;

    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: ['team'] });
        queryClient.invalidateQueries({ queryKey: ['team-stats'] });
    };

    const createMember = useMutation({
        mutationFn: teamMembersAPI.create,
        onSuccess: () => { invalidate(); toast.success('Team member created'); },
        onError: (error: any) => toast.error(error?.response?.data?.message || 'Failed to create member'),
    });

    const updateMember = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<TeamMember> }) => teamMembersAPI.update(id, data),
        onSuccess: () => { invalidate(); toast.success('Team member updated'); },
        onError: (error: any) => toast.error(error?.response?.data?.message || 'Failed to update member'),
    });

    const deleteMember = useMutation({
        mutationFn: teamMembersAPI.delete,
        onSuccess: () => { invalidate(); toast.success('Team member removed'); },
        onError: (error: any) => toast.error(error?.response?.data?.message || 'Failed to delete member'),
    });

    const bulkDeleteMembers = useMutation({
        mutationFn: teamMembersAPI.bulkDelete,
        onSuccess: () => { invalidate(); toast.success('Team members removed'); },
        onError: (error: any) => toast.error(error?.response?.data?.message || 'Failed to delete members'),
    });

    const bulkUpdateStatus = useMutation({
        mutationFn: ({ ids, isActive }: { ids: string[]; isActive: boolean }) => teamMembersAPI.bulkUpdateStatus(ids, isActive),
        onSuccess: (_data, variables) => { invalidate(); toast.success(`Team members ${variables.isActive ? 'activated' : 'deactivated'}`); },
        onError: (error: any) => toast.error(error?.response?.data?.message || 'Failed to update members'),
    });

    const reorderMembers = useMutation({
        mutationFn: teamMembersAPI.reorder,
        onSuccess: () => { invalidate(); toast.success('Order updated'); },
        onError: (error: any) => toast.error(error?.response?.data?.message || 'Failed to reorder'),
    });

    return {
        members, total, stats, isLoading, isStatsLoading, error, isError, refetch,
        createMember: createMember.mutate, isCreating: createMember.isPending,
        updateMember: updateMember.mutate, isUpdating: updateMember.isPending,
        deleteMember: deleteMember.mutate, isDeleting: deleteMember.isPending,
        bulkDeleteMembers: bulkDeleteMembers.mutate, isBulkDeleting: bulkDeleteMembers.isPending,
        bulkUpdateStatus: bulkUpdateStatus.mutate, isBulkUpdating: bulkUpdateStatus.isPending,
        reorderMembers: reorderMembers.mutate, isReordering: reorderMembers.isPending,
    };
}

export function useTeamMember(id: string) {
    return useQuery({
        queryKey: ['team-member', id],
        queryFn: () => teamMembersAPI.getOne(id),
        enabled: !!id,
    });
}

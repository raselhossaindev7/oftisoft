import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsAPI, type Event, type EventFilters } from '@/lib/api';
import { toast } from 'sonner';

export function useEvents(filters?: EventFilters) {
    const queryClient = useQueryClient();

    const { data, isLoading, error, refetch, isError } = useQuery({
        queryKey: ['events', filters],
        queryFn: () => eventsAPI.getAll(filters),
    });

    const { data: stats, isLoading: isStatsLoading } = useQuery({
        queryKey: ['events-stats'],
        queryFn: () => eventsAPI.getStats(),
        staleTime: 1000 * 60 * 5,
    });

    const items = data?.items ?? [];
    const total = data?.total ?? 0;

    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: ['events'] });
        queryClient.invalidateQueries({ queryKey: ['events-stats'] });
    };

    const createEvent = useMutation({
        mutationFn: eventsAPI.create,
        onSuccess: () => { invalidate(); toast.success('Event created'); },
        onError: (error: any) => toast.error(error?.response?.data?.message || 'Failed to create event'),
    });

    const updateEvent = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Event> }) => eventsAPI.update(id, data),
        onSuccess: () => { invalidate(); toast.success('Event updated'); },
        onError: (error: any) => toast.error(error?.response?.data?.message || 'Failed to update event'),
    });

    const deleteEvent = useMutation({
        mutationFn: eventsAPI.delete,
        onSuccess: () => { invalidate(); toast.success('Event deleted'); },
        onError: (error: any) => toast.error(error?.response?.data?.message || 'Failed to delete event'),
    });

    const publishEvent = useMutation({
        mutationFn: eventsAPI.publish,
        onSuccess: () => { invalidate(); toast.success('Event published'); },
        onError: (error: any) => toast.error(error?.response?.data?.message || 'Failed to publish event'),
    });

    const bulkDeleteEvents = useMutation({
        mutationFn: eventsAPI.bulkDelete,
        onSuccess: () => { invalidate(); toast.success('Events deleted'); },
        onError: (error: any) => toast.error(error?.response?.data?.message || 'Failed to delete events'),
    });

    const bulkUpdateStatus = useMutation({
        mutationFn: ({ ids, status }: { ids: string[]; status: string }) => eventsAPI.bulkUpdateStatus(ids, status),
        onSuccess: (_data, variables) => { invalidate(); toast.success(`Events set to ${variables.status}`); },
        onError: (error: any) => toast.error(error?.response?.data?.message || 'Failed to update events'),
    });

    return {
        items, total, stats, isLoading, isStatsLoading, error, isError, refetch,
        createEvent: createEvent.mutate, isCreating: createEvent.isPending,
        updateEvent: updateEvent.mutate, isUpdating: updateEvent.isPending,
        deleteEvent: deleteEvent.mutate, isDeleting: deleteEvent.isPending,
        publishEvent: publishEvent.mutate, isPublishing: publishEvent.isPending,
        bulkDeleteEvents: bulkDeleteEvents.mutate, isBulkDeleting: bulkDeleteEvents.isPending,
        bulkUpdateStatus: bulkUpdateStatus.mutate, isBulkUpdating: bulkUpdateStatus.isPending,
    };
}

export function useEvent(id: string) {
    return useQuery({
        queryKey: ['event', id],
        queryFn: () => eventsAPI.getOne(id),
        enabled: !!id,
    });
}

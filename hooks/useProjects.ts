import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsAPI, Project } from '@/lib/api';
import { toast } from 'sonner';

export function useProjects(projectId?: string, status?: string) {
    const queryClient = useQueryClient();

    const { data: projectsResponse = [], isLoading: projectsLoading, isError: projectsError, refetch: refetchProjects } = useQuery({
        queryKey: ['projects', status],
        queryFn: () => projectsAPI.getProjects(status),
        enabled: !projectId
    });

    const projects = Array.isArray(projectsResponse) ? projectsResponse : (projectsResponse as any)?.data ?? [];

    const { data: project, isLoading: projectLoading, isError: projectError, refetch: refetchProject } = useQuery({
        queryKey: ['projects', projectId],
        queryFn: () => projectsAPI.getProject(projectId!),
        enabled: !!projectId
    });

    const { data: stats, refetch: refetchStats } = useQuery({
        queryKey: ['projects', 'stats'],
        queryFn: projectsAPI.getStats,
        enabled: !projectId
    });

    const createProjectMutation = useMutation({
        mutationFn: projectsAPI.createProject,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            toast.success("Project created successfully");
        },
        onError: () => {
            toast.error("Failed to create project");
        }
    });

    const updateProjectMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Project> }) =>
            projectsAPI.updateProject(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            toast.success("Project updated successfully");
        },
        onError: () => {
            toast.error("Failed to update project");
        }
    });

    const deleteProjectMutation = useMutation({
        mutationFn: projectsAPI.deleteProject,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            toast.success("Project deleted successfully");
        },
        onError: () => {
            toast.error("Failed to delete project");
        }
    });

    const updatePaymentStatusMutation = useMutation({
        mutationFn: ({ id, paymentStatus }: { id: string; paymentStatus: string }) =>
            projectsAPI.updatePaymentStatus(id, paymentStatus),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            toast.success("Payment status updated successfully");
        },
        onError: () => {
            toast.error("Failed to update payment status");
        }
    });

    return {
        projects: projects as Project[],
        project: project as Project,
        stats,
        isLoading: projectId ? projectLoading : projectsLoading,
        isError: projectId ? projectError : projectsError,
        refetch: projectId ? refetchProject : refetchProjects,
        fetchStats: refetchStats,
        createProject: (data: Partial<Project>, options?: any) => createProjectMutation.mutate(data, options),
        updateProject: (id: string, data: Partial<Project>, options?: any) => updateProjectMutation.mutate({ id, data }, options),
        deleteProject: (id: string, options?: any) => deleteProjectMutation.mutate(id, options),
        updatePaymentStatus: (id: string, paymentStatus: string, options?: any) => updatePaymentStatusMutation.mutate({ id, paymentStatus }, options),
        isCreating: createProjectMutation.isPending,
        isUpdating: updateProjectMutation.isPending,
        isDeleting: deleteProjectMutation.isPending,
        isUpdatingPayment: updatePaymentStatusMutation.isPending,
    };
}

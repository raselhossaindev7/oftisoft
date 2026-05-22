import { useQuery } from '@tanstack/react-query';
import { messagesAPI, ordersAPI, leadsAPI } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/useAuthStore';

interface BadgeCounts {
    messages: number;
    orders: number;
    leads: number;
}

export function useBadgeCounts() {
    const { user, isAuthenticated } = useAuth();
    const authCheckComplete = useAuthStore((state) => state.authCheckComplete);

    // Check if user has permission to view leads stats
    const canViewLeads = isAuthenticated && Boolean(user?.role && ['Admin', 'Editor', 'Support'].includes(user.role));

    const { data: conversations = [] } = useQuery({
        queryKey: ['conversations', user?.id],
        queryFn: messagesAPI.getConversations,
        refetchInterval: 5000, // Real-time: refetch every 5 seconds
        // Only run after auth check is complete AND user is authenticated
        enabled: authCheckComplete && !!user?.id && isAuthenticated,
    });

    const { data: ordersResponse = [] } = useQuery({
        queryKey: ['orders'],
        queryFn: ordersAPI.getOrders,
        refetchInterval: 60000, // Refetch every minute
        // Only run after auth check is complete AND user is authenticated
        enabled: authCheckComplete && isAuthenticated,
    });

    const orders = Array.isArray(ordersResponse) ? ordersResponse : (ordersResponse as any)?.data ?? [];

    const { data: leadsStats } = useQuery({
        queryKey: ['leads-stats'],
        queryFn: leadsAPI.getStats,
        refetchInterval: 60000, // Refetch every minute
        // Only run after auth check is complete AND user has permission and is authenticated
        enabled: authCheckComplete && canViewLeads,
        retry: false, // Don't retry on 403 errors
    });

    // Calculate unread messages: conversations where lastMessage is from someone else and not read
    const currentUserId = user?.id || '';
    const unreadMessages = conversations.reduce((count: number, conv: any) => {
        const lastMsg = conv.lastMessage;
        if (!lastMsg) return count;
        const isFromMe = lastMsg.sender?.id === currentUserId;
        const isUnread = !lastMsg.read && !isFromMe;
        return count + (isUnread ? 1 : 0);
    }, 0);

    // Calculate pending orders count
    const pendingOrders = orders.filter((order: any) =>
        order.status === 'pending' || order.status === 'processing'
    ).length;

    // Get new leads count from stats (backend returns 'newLeads' not 'newCount')
    const newLeads = leadsStats?.newLeads || 0;

    const badgeCounts: BadgeCounts = {
        messages: unreadMessages,
        orders: pendingOrders,
        leads: newLeads,
    };

    return badgeCounts;
}

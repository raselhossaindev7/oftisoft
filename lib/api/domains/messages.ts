import { api } from "@/lib/api";
export const messagesAPI = {
    getOrderConversation: async (orderId: string): Promise<any> => {
        const response = await api.post('/messages/order-conversation', { orderId });
        return response.data;
    },
    getSeller: async (): Promise<any> => {
        const response = await api.get('/messages/seller');
        return response.data;
    },
    getConversations: async (): Promise<any[]> => {
        const response = await api.get('/messages/conversations');
        return response.data;
    },
    getAvailableUsers: async (): Promise<any[]> => {
        const response = await api.get('/messages/available-users');
        return response.data;
    },
    getMessages: async (conversationId: string): Promise<any> => {
        const response = await api.get(`/messages/${conversationId}`);
        return response.data;
    },
    markAsRead: async (conversationId: string): Promise<void> => {
        await api.get(`/messages/${conversationId}/read`);
    },
    sendMessage: async (
        conversationId: string, 
        content: string, 
        replyToId?: string,
        attachments?: { id: string; name: string; url: string; type: string; size: number }[]
    ): Promise<any> => {
        const response = await api.post(`/messages/${conversationId}`, { 
            content, 
            replyToId,
            attachments 
        });
        return response.data;
    },
    editMessage: async (messageId: string, content: string): Promise<any> => {
        const response = await api.patch(`/messages/message/${messageId}`, { content });
        return response.data;
    },
    deleteMessage: async (messageId: string): Promise<void> => {
        await api.delete(`/messages/message/${messageId}`);
    },
    startConversation: async (recipientId: string): Promise<any> => {
        const response = await api.post('/messages', { recipientId });
        return response.data;
    },
    getSupportBot: async (): Promise<any> => {
        const response = await api.get('/messages/support-bot');
        return response.data;
    },
    uploadAttachment: async (file: File): Promise<any> => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post('/messages/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },
    pinConversation: async (conversationId: string, pinned: boolean): Promise<void> => {
        await api.patch(`/messages/${conversationId}/pin`, { pinned });
    },
    muteConversation: async (conversationId: string, muted: boolean): Promise<void> => {
        await api.patch(`/messages/${conversationId}/mute`, { muted });
    },
    blockUser: async (userId: string): Promise<void> => {
        await api.post(`/messages/block/${userId}`);
    },
    unblockUser: async (userId: string): Promise<void> => {
        await api.delete(`/messages/block/${userId}`);
    },
    addReaction: async (messageId: string, emoji: string): Promise<void> => {
        await api.post(`/messages/message/${messageId}/reaction`, { emoji });
    },
    removeReaction: async (messageId: string, emoji: string): Promise<void> => {
        await api.delete(`/messages/message/${messageId}/reaction/${encodeURIComponent(emoji)}`);
    },
    searchMessages: async (conversationId: string, query: string): Promise<any[]> => {
        const response = await api.get(`/messages/${conversationId}/search`, { params: { query } });
        return response.data;
    },
    sendTypingIndicator: async (conversationId: string): Promise<void> => {
        await api.post(`/messages/${conversationId}/typing`);
    },
    getTypingUsers: async (conversationId: string): Promise<string[]> => {
        const response = await api.get(`/messages/${conversationId}/typing`);
        return response.data;
    }
};

export const notificationsAPI = {
    getNotifications: async (): Promise<any[]> => {
        const response = await api.get('/notifications');
        return response.data;
    },
    getCounts: async (): Promise<{ unread: number; highPriority: number; archived: number }> => {
        const response = await api.get('/notifications/counts');
        return response.data;
    },
    getArchivedNotifications: async (): Promise<any[]> => {
        const response = await api.get('/notifications/archived');
        return response.data;
    },
    markAsRead: async (id: string): Promise<void> => {
        await api.put(`/notifications/${id}/read`);
    },
    markAllAsRead: async (): Promise<void> => {
        await api.put('/notifications/read-all');
    },
    archive: async (id: string): Promise<void> => {
        await api.put(`/notifications/${id}/archive`);
    },
    unarchive: async (id: string): Promise<void> => {
        await api.put(`/notifications/${id}/unarchive`);
    },
    delete: async (id: string): Promise<void> => {
        await api.delete(`/notifications/${id}`);
    }
};


import { useState, useCallback, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { messagesAPI } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";

const NOTIFICATION_SOUND = "/sounds/notification.mp3";

function playNotificationSound() {
    try {
        const audio = new Audio(NOTIFICATION_SOUND);
        audio.volume = 0.6;
        audio.play().catch(() => {});
    } catch {}
}

export type MessageStatus = 'sent' | 'delivered' | 'read';
export type UserRole = 'SuperAdmin' | 'Admin' | 'Support' | 'Editor' | 'User' | 'Viewer';

export interface MessageAttachment {
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
}

export interface MessageReaction {
    emoji: string;
    users: string[];
}

export interface Message {
    id: string;
    sender: string;
    senderId: string;
    senderRole: UserRole;
    text: string;
    time: string;
    isMe: boolean;
    chatId: string;
    status: MessageStatus;
    attachments?: MessageAttachment[];
    replyTo?: {
        id: string;
        text: string;
        sender: string;
    };
    reactions?: MessageReaction[];
    isSystem?: boolean;
    edited?: boolean;
    editedAt?: string;
}

export interface ConversationUser {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    avatar: string;
    status: 'online' | 'offline';
    lastSeen?: string;
}

export interface OrderInfo {
    id: string;
    orderNumber: string;
    status: string;
    total: number;
    items: { id: string; productName: string; quantity: number; price: number }[];
}

export interface Conversation {
    id: string;
    name: string;
    role: UserRole;
    email: string;
    avatar: string;
    avatarUrl?: string;
    status: 'online' | 'offline';
    lastMsg: string;
    lastMsgIds: string;
    time: string;
    unread: number;
    color: string;
    recipientId: string;
    isSupport: boolean;
    isPinned?: boolean;
    isMuted?: boolean;
    blockedBy?: string[];
    isOrder?: boolean;
    isSeller?: boolean;
    order?: OrderInfo | null;
}

export interface MessagingPermissions {
    canMessageAllUsers: boolean;
    canMessageAdmins: boolean;
    canMessageSupport: boolean;
    canMessageStaff: boolean;
    canUploadFiles: boolean;
    maxFileSize: number;
    allowedFileTypes: string[];
    canCreateGroup: boolean;
    canDeleteMessages: boolean;
    canEditMessages: boolean;
    canBlockUsers: boolean;
    canReportMessages: boolean;
}

const ROLE_HIERARCHY: Record<UserRole, number> = {
    'SuperAdmin': 5,
    'Admin': 4,
    'Support': 3,
    'Editor': 2,
    'User': 1,
    'Viewer': 0
};

export function getRolePermissions(role: UserRole): MessagingPermissions {
    const basePermissions: MessagingPermissions = {
        canMessageAllUsers: false,
        canMessageAdmins: false,
        canMessageSupport: true,
        canMessageStaff: false,
        canUploadFiles: true,
        maxFileSize: 10 * 1024 * 1024, // 10MB
        allowedFileTypes: ['image/*', 'application/pdf', '.doc', '.docx', '.txt', '.zip'],
        canCreateGroup: false,
        canDeleteMessages: false,
        canEditMessages: true,
        canBlockUsers: true,
        canReportMessages: true
    };

    switch (role) {
        case 'SuperAdmin':
        case 'Admin':
            return {
                ...basePermissions,
                canMessageAllUsers: true,
                canMessageAdmins: true,
                canMessageSupport: true,
                canMessageStaff: true,
                canCreateGroup: true,
                canDeleteMessages: true,
                canEditMessages: true,
                canBlockUsers: true,
                maxFileSize: 50 * 1024 * 1024, // 50MB
            };
        case 'Support':
            return {
                ...basePermissions,
                canMessageAllUsers: true,
                canMessageAdmins: true,
                canMessageSupport: true,
                canMessageStaff: true,
                canCreateGroup: true,
                canDeleteMessages: true,
                maxFileSize: 20 * 1024 * 1024,
            };
        case 'Editor':
            return {
                ...basePermissions,
                canMessageStaff: true,
                canMessageSupport: true,
                maxFileSize: 15 * 1024 * 1024,
            };
        case 'User':
        case 'Viewer':
        default:
            return basePermissions;
    }
}

export function canMessageUser(
    senderRole: UserRole,
    recipientRole: UserRole,
    recipientIsSupport: boolean = false
): boolean {
    // SuperAdmin can message anyone
    if (senderRole === 'SuperAdmin') return true;
    
    // Admin can message anyone except SuperAdmin
    if (senderRole === 'Admin') return recipientRole !== 'SuperAdmin';
    
    // Support can message anyone except SuperAdmin and Admin
    if (senderRole === 'Support') {
        return recipientRole !== 'SuperAdmin' && recipientRole !== 'Admin';
    }
    
    // Editor can message Support, other Editors, and Users
    if (senderRole === 'Editor') {
        return ['Support', 'Editor', 'User', 'Viewer'].includes(recipientRole);
    }
    
    // Fiverr-style: regular users can only message the seller (admin)
    if (senderRole === 'User' || senderRole === 'Viewer') {
        return recipientRole === 'SuperAdmin' || recipientRole === 'Admin';
    }
    
    return false;
}

function formatConversation(c: any, currentUserId: string): Conversation | null {
    const participants = Array.isArray(c.participants) ? c.participants : [];
    const uid = String(currentUserId || "");
    const other = participants.find((p: any) => {
        const pid = String(p?.id ?? p?.user?.id ?? "");
        return pid && uid && pid !== uid;
    }) || (participants.length >= 2 ? participants[1] : null);
    
    if (!other) return null;
    const otherId = String(other?.id ?? other?.user?.id ?? "");
    if (otherId === uid) return null;

    const lastMsg = c.lastMessage;
    const isMe = lastMsg?.sender?.id === currentUserId;

    let timeStr = "";
    if (lastMsg?.createdAt) {
        const date = new Date(lastMsg.createdAt);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
            timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (diffDays === 1) {
            timeStr = 'Yesterday';
        } else if (diffDays < 7) {
            timeStr = date.toLocaleDateString([], { weekday: 'short' });
        } else {
            timeStr = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        }
    }

    const isSeller = ['SuperAdmin', 'Admin'].includes(other.role);
    const isOrder = c.type === 'order' || false;
    const displayName = isOrder && c.name ? c.name : (other.name || "Unknown");

    return {
        id: c.id,
        name: displayName,
        role: other.role || "User",
        email: other.email,
        avatarUrl: other.avatarUrl || undefined,
        avatar: (other.name || "??").slice(0, 2).toUpperCase(),
        status: other.isActive ? "online" : "offline",
        lastMsg: lastMsg ? (isMe ? `You: ${lastMsg.content}` : lastMsg.content) : "No messages yet",
        lastMsgIds: lastMsg?.id || "init",
        time: timeStr,
        unread: c.unreadCount || 0,
        color: getRoleColor(other.role),
        recipientId: other.id,
        isSupport: other.isAI || other.role === 'Support',
        isPinned: c.isPinned || false,
        isMuted: c.isMuted || false,
        blockedBy: c.blockedBy || [],
        isOrder,
        isSeller,
        order: c.order || null,
    };
}

function getRoleColor(role: string): string {
    switch (role) {
        case 'SuperAdmin': return 'bg-purple-600';
        case 'Admin': return 'bg-red-500';
        case 'Support': return 'bg-green-500';
        case 'Editor': return 'bg-orange-500';
        case 'User': return 'bg-blue-500';
        default: return 'bg-gray-500';
    }
}

function parseJsonField(val: any): any[] {
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') {
        try { return JSON.parse(val); } catch { return []; }
    }
    return [];
}

function formatMessage(m: any, currentUserId: string, chatId: string, currentUserName?: string): Message {
    const isMe = m.sender?.id === currentUserId;
    const timeStr = m.createdAt
        ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : "";
    
    let status: MessageStatus = 'sent';
    if (m.read) {
        status = 'read';
    } else if (m.delivered) {
        status = 'delivered';
    }
    
    return {
        id: m.id,
        sender: isMe ? (currentUserName || "You") : (m.sender?.name || "Unknown"),
        senderId: m.sender?.id,
        senderRole: m.sender?.role || 'User',
        text: m.content,
        time: timeStr,
        isMe,
        chatId,
        status,
        attachments: parseJsonField(m.attachments),
        replyTo: m.replyTo ? {
            id: m.replyTo.id,
            text: m.replyTo.content,
            sender: m.replyTo.sender?.name || "Unknown"
        } : undefined,
        reactions: parseJsonField(m.reactions),
        isSystem: Array.isArray(m.reactions) && m.reactions.some((r: any) => r.isSystem === true),
        edited: m.edited || false,
        editedAt: m.editedAt
    };
}

export function useMessages() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [selectedChat, setSelectedChatState] = useState<Conversation | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isMessagesLoading, setIsMessagesLoading] = useState(false);
    const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
    const [permissions, setPermissions] = useState<MessagingPermissions | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredMessages, setFilteredMessages] = useState<Message[]>([]);
    
    const pollRef = useRef<NodeJS.Timeout | null>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const seenMessageIdsRef = useRef<Set<string>>(new Set());
    const lastTypingRef = useRef<number>(0);
    const selectedChatRef = useRef<Conversation | null>(null);

    const userRole = (user?.role || 'User') as UserRole;
    const userPermissions = permissions || getRolePermissions(userRole);

    // Update permissions when user changes
    useEffect(() => {
        if (user?.role) {
            setPermissions(getRolePermissions(user.role as UserRole));
        }
    }, [user?.role]);

    const setSelectedChat = useCallback((chat: Conversation | null) => {
        setSelectedChatState(chat);
        selectedChatRef.current = chat;
        const params = new URLSearchParams(searchParams.toString());
        if (chat?.id) {
            params.set('chat', chat.id);
        } else {
            params.delete('chat');
        }
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }, [searchParams, pathname, router]);

    // Fetch conversations from backend
    const fetchConversations = useCallback(async (silent = false) => {
        if (!user?.id) return;
        if (!silent) setIsLoading(true);
        try {
            const data = await messagesAPI.getConversations();
            const formatted = (Array.isArray(data) ? data : [])
                .map((c: any) => formatConversation(c, user.id))
                .filter(Boolean) as Conversation[];
            
            // Sort: pinned first, then by unread count, then by last message time
            const sorted = formatted.sort((a, b) => {
                if (a.isPinned && !b.isPinned) return -1;
                if (!a.isPinned && b.isPinned) return 1;
                if (a.unread !== b.unread) return b.unread - a.unread;
                return 0;
            });
            
            setConversations(sorted);
        } catch (e) {
            if (!silent) {
                console.error("Failed to fetch conversations", e);
                setConversations([]);
            }
        } finally {
            if (!silent) setIsLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        if (!user?.id) {
            setConversations([]);
            return;
        }
        fetchConversations(false);
        const interval = setInterval(() => fetchConversations(true), 10000);
        return () => clearInterval(interval);
    }, [user?.id, fetchConversations]);

    // Filter conversations based on search
    const filteredConversations = useCallback(() => {
        if (!searchQuery.trim()) return conversations;
        const query = searchQuery.toLowerCase();
        return conversations.filter(c =>
            c.name.toLowerCase().includes(query) ||
            c.email.toLowerCase().includes(query) ||
            c.role.toLowerCase().includes(query) ||
            c.lastMsg.toLowerCase().includes(query)
        );
    }, [conversations, searchQuery]);

    // Fetch messages when chat selected
    useEffect(() => {
        if (!selectedChat?.id || !user?.id) {
            setMessages([]);
            setFilteredMessages([]);
            return;
        }

        const chatId = selectedChat.id;
        const userId = user.id;
        let isFirstLoad = true;
        seenMessageIdsRef.current = new Set();

        const load = async () => {
            try {
                if (isFirstLoad) setIsMessagesLoading(true);
                const data = await messagesAPI.getMessages(chatId);
                const msgs = data?.messages || data || [];
                const convData = data?.conversation || null;
                const formatted = (Array.isArray(msgs) ? msgs : []).map((m: any) =>
                    formatMessage(m, userId, chatId, user?.name)
                );
                
                // Update selectedChat with order data from API
                if (convData?.order && selectedChatRef.current) {
                    setSelectedChatState(prev => prev ? { ...prev, order: convData.order } : prev);
                }
                
                // Play sound on new incoming messages
                if (!isFirstLoad && formatted.length > 0) {
                    const newFromOthers = formatted.filter(
                        (m: Message) => !m.isMe && !seenMessageIdsRef.current.has(m.id)
                    );
                    if (newFromOthers.length > 0) playNotificationSound();
                }
                
                formatted.forEach((m: Message) => seenMessageIdsRef.current.add(m.id));
                setMessages(formatted);
                setFilteredMessages(formatted);
            } catch (e) {
                console.error("Failed to fetch messages", e);
            } finally {
                if (isFirstLoad) {
                    isFirstLoad = false;
                    setIsMessagesLoading(false);
                }
            }
        };

        load();

        messagesAPI.markAsRead(chatId).then(() => {
            fetchConversations(true);
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
        }).catch(() => {});

        // Poll for new messages
        pollRef.current = setInterval(load, 3000);
        return () => {
            if (pollRef.current) clearInterval(pollRef.current);
        };
    }, [selectedChat?.id, user?.id, user?.name, fetchConversations, queryClient]);

    // Search messages in current chat
    const searchMessages = useCallback((query: string) => {
        setSearchQuery(query);
        if (!query.trim()) {
            setFilteredMessages(messages);
            return;
        }
        const lowerQuery = query.toLowerCase();
        const filtered = messages.filter(m =>
            m.text.toLowerCase().includes(lowerQuery) ||
            m.sender.toLowerCase().includes(lowerQuery)
        );
        setFilteredMessages(filtered);
    }, [messages]);

    const clearSearch = useCallback(() => {
        setSearchQuery('');
        setFilteredMessages(messages);
    }, [messages]);

    const sendMessage = async (content: string, attachments?: File[], replyToId?: string) => {
        if (!selectedChat || !content.trim() || !user) return false;
        
        // Check permissions
        if (!userPermissions.canMessageAllUsers && selectedChat.role !== 'Support') {
            const recipientRole = selectedChat.role as UserRole;
            if (!canMessageUser(userRole, recipientRole, selectedChat.isSupport)) {
                toast.error("You don't have permission to message this user");
                return false;
            }
        }

        try {
            let uploadedAttachments: MessageAttachment[] = [];
            
            // Upload attachments if any
            if (attachments && attachments.length > 0) {
                if (!userPermissions.canUploadFiles) {
                    toast.error("You don't have permission to upload files");
                    return false;
                }
                
                for (const file of attachments) {
                    if (file.size > userPermissions.maxFileSize) {
                        toast.error(`File ${file.name} exceeds maximum size`);
                        return false;
                    }
                }
                
                // Upload files
                const uploadPromises = attachments.map(file => messagesAPI.uploadAttachment(file));
                uploadedAttachments = await Promise.all(uploadPromises);
            }

            await messagesAPI.sendMessage(selectedChat.id, content.trim(), replyToId, uploadedAttachments);
            const data = await messagesAPI.getMessages(selectedChat.id);
            const msgs = data?.messages || data || [];
            const convData = data?.conversation || null;
            const formatted = (Array.isArray(msgs) ? msgs : []).map((m: any) =>
                formatMessage(m, user.id, selectedChat.id, user?.name)
            );
            if (convData?.order) {
                setSelectedChatState(prev => prev ? { ...prev, order: convData.order } : prev);
            }
            setMessages(formatted);
            setFilteredMessages(formatted);
            fetchConversations(true);
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
            return true;
        } catch (e) {
            console.error("Failed to send message", e);
            toast.error("Failed to send message");
            return false;
        }
    };

    const editMessage = async (messageId: string, newContent: string) => {
        if (!userPermissions.canEditMessages) {
            toast.error("You don't have permission to edit messages");
            return false;
        }
        
        try {
            await messagesAPI.editMessage(messageId, newContent);
            if (selectedChat) {
                const data = await messagesAPI.getMessages(selectedChat.id);
                const msgs = data?.messages || data || [];
                const convData = data?.conversation || null;
                const formatted = (Array.isArray(msgs) ? msgs : []).map((m: any) =>
                    formatMessage(m, user!.id, selectedChat.id, user?.name)
                );
                if (convData?.order) {
                    setSelectedChatState(prev => prev ? { ...prev, order: convData.order } : prev);
                }
                setMessages(formatted);
                setFilteredMessages(formatted);
            }
            return true;
        } catch (e) {
            console.error("Failed to edit message", e);
            toast.error("Failed to edit message");
            return false;
        }
    };

    const deleteMessage = async (messageId: string) => {
        if (!userPermissions.canDeleteMessages) {
            toast.error("You don't have permission to delete messages");
            return false;
        }
        
        try {
            await messagesAPI.deleteMessage(messageId);
            setMessages(prev => prev.filter(m => m.id !== messageId));
            setFilteredMessages(prev => prev.filter(m => m.id !== messageId));
            return true;
        } catch (e) {
            console.error("Failed to delete message", e);
            toast.error("Failed to delete message");
            return false;
        }
    };

    const addReaction = async (messageId: string, emoji: string) => {
        try {
            await messagesAPI.addReaction(messageId, emoji);
            if (selectedChat) {
                const data = await messagesAPI.getMessages(selectedChat.id);
                const msgs = data?.messages || data || [];
                const formatted = (Array.isArray(msgs) ? msgs : []).map((m: any) =>
                    formatMessage(m, user!.id, selectedChat.id, user?.name)
                );
                setMessages(formatted);
                setFilteredMessages(formatted);
            }
        } catch (e) {
            console.error("Failed to add reaction", e);
        }
    };

    const removeReaction = async (messageId: string, emoji: string) => {
        try {
            await messagesAPI.removeReaction(messageId, emoji);
            if (selectedChat) {
                const data = await messagesAPI.getMessages(selectedChat.id);
                const msgs = data?.messages || data || [];
                const formatted = (Array.isArray(msgs) ? msgs : []).map((m: any) =>
                    formatMessage(m, user!.id, selectedChat.id, user?.name)
                );
                setMessages(formatted);
                setFilteredMessages(formatted);
            }
        } catch (e) {
            console.error("Failed to remove reaction", e);
        }
    };

    const sendTypingIndicator = useCallback(() => {
        if (!selectedChat || !user) return;
        
        const now = Date.now();
        // Throttle typing indicators to every 3 seconds
        if (now - lastTypingRef.current < 3000) return;
        lastTypingRef.current = now;
        
        messagesAPI.sendTypingIndicator(selectedChat.id).catch(() => {});
    }, [selectedChat, user]);

    const startConversation = async (recipientId: string, recipientData?: any) => {
        if (!user) return null;

        const existing = conversations.find((c: Conversation) => c.recipientId === recipientId);
        if (existing) {
            setSelectedChat(existing);
            return existing;
        }

        // Check if can message this user
        if (!userPermissions.canMessageAllUsers && recipientData) {
            const recipientRole = recipientData.role as UserRole;
            const isSupport = recipientData.isAI || recipientData.role === 'Support';
            if (!canMessageUser(userRole, recipientRole, isSupport)) {
                toast.error("You don't have permission to message this user");
                return null;
            }
        }

        try {
            const conv = await messagesAPI.startConversation(recipientId);
            const formatted = formatConversation(conv, user.id);
            if (!formatted) {
                toast.error("Failed to start conversation");
                return null;
            }
            setConversations(prev => {
                const exists = prev.some(c => c.id === formatted.id);
                if (exists) return prev;
                return [formatted, ...prev];
            });
            setSelectedChat(formatted);
            return formatted;
        } catch (e) {
            console.error("Failed to start conversation", e);
            toast.error("Failed to start conversation");
            return null;
        }
    };

    const startSupportChat = async () => {
        try {
            const bot = await messagesAPI.getSupportBot();
            return await startConversation(bot.id, bot);
        } catch (e) {
            console.error("Failed to start support chat", e);
            toast.error("Support is temporarily unavailable. Please try again.");
            return null;
        }
    };

    const pinConversation = async (conversationId: string, pinned: boolean) => {
        try {
            await messagesAPI.pinConversation(conversationId, pinned);
            setConversations(prev => prev.map(c => 
                c.id === conversationId ? { ...c, isPinned: pinned } : c
            ));
            toast.success(pinned ? "Conversation pinned" : "Conversation unpinned");
        } catch (e) {
            toast.error("Failed to update conversation");
        }
    };

    const muteConversation = async (conversationId: string, muted: boolean) => {
        try {
            await messagesAPI.muteConversation(conversationId, muted);
            setConversations(prev => prev.map(c => 
                c.id === conversationId ? { ...c, isMuted: muted } : c
            ));
            toast.success(muted ? "Conversation muted" : "Conversation unmuted");
        } catch (e) {
            toast.error("Failed to update conversation");
        }
    };

    const blockUser = async (userId: string) => {
        if (!userPermissions.canBlockUsers) {
            toast.error("You don't have permission to block users");
            return false;
        }
        
        try {
            await messagesAPI.blockUser(userId);
            toast.success("User blocked");
            fetchConversations(true);
            return true;
        } catch (e) {
            toast.error("Failed to block user");
            return false;
        }
    };

    const unblockUser = async (userId: string) => {
        try {
            await messagesAPI.unblockUser(userId);
            toast.success("User unblocked");
            fetchConversations(true);
            return true;
        } catch (e) {
            toast.error("Failed to unblock user");
            return false;
        }
    };

    // Listen for typing indicators
    useEffect(() => {
        if (!selectedChat) return;
        
        const checkTyping = setInterval(async () => {
            try {
                const typing = await messagesAPI.getTypingUsers(selectedChat.id);
                setTypingUsers(new Set(typing.filter((id: string) => id !== user?.id)));
            } catch {}
        }, 2000);
        
        return () => clearInterval(checkTyping);
    }, [selectedChat, user?.id]);

    // Restore chat from URL on load
    useEffect(() => {
        const chatIdFromUrl = searchParams.get('chat');
        if (chatIdFromUrl && conversations.length > 0 && !selectedChat) {
            const found = conversations.find(
                (c: Conversation) => c.id === chatIdFromUrl || c.recipientId === chatIdFromUrl
            );
            if (found) setSelectedChatState(found);
        }
    }, [conversations, searchParams, selectedChat]);

    const startOrderConversation = async (orderId: string) => {
        if (!user) return null;

        try {
            const conv = await messagesAPI.getOrderConversation(orderId);
            const formatted = formatConversation(conv, user.id);
            if (!formatted) {
                toast.error("Failed to open conversation");
                return null;
            }
            setConversations(prev => {
                const exists = prev.some(c => c.id === formatted.id);
                if (exists) return prev;
                return [formatted, ...prev];
            });
            setSelectedChat(formatted);
            return formatted;
        } catch (e) {
            console.error("Failed to start order conversation", e);
            toast.error("Failed to open conversation");
            return null;
        }
    };

    const refreshConversations = useCallback((silent = true) => {
        fetchConversations(silent);
    }, [fetchConversations]);

    const refreshMessages = useCallback(async () => {
        const chat = selectedChatRef.current;
        if (!chat) return;
        try {
            const data = await messagesAPI.getMessages(chat.id);
            const msgs = data?.messages || data || [];
            const convData = data?.conversation || null;
            const formatted = (Array.isArray(msgs) ? msgs : []).map((m: any) =>
                formatMessage(m, user!.id, chat.id, user?.name)
            );
            if (convData?.order) {
                setSelectedChatState(prev => prev ? { ...prev, order: convData.order } : prev);
            }
            setMessages(formatted);
            setFilteredMessages(formatted);
        } catch (e) {
            console.error("Failed to refresh messages", e);
        }
    }, [user]);

    return {
        conversations: filteredConversations(),
        allConversations: conversations,
        messages: filteredMessages,
        allMessages: messages,
        selectedChat,
        setSelectedChat,
        isLoading,
        isMessagesLoading,
        typingUsers,
        permissions: userPermissions,
        userRole,
        searchQuery,
        setSearchQuery,
        sendMessage,
        editMessage,
        deleteMessage,
        addReaction,
        removeReaction,
        sendTypingIndicator,
        startConversation,
        startSupportChat,
        startOrderConversation,
        refreshConversations,
        refreshMessages,
        pinConversation,
        muteConversation,
        blockUser,
        unblockUser,
        searchMessages,
        clearSearch,
        canMessageUser: (recipientRole: UserRole, isSupport?: boolean) => 
            canMessageUser(userRole, recipientRole, isSupport)
    };
}

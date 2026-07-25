import { api } from "@/lib/api";

export interface AiMessage {
  id: string;
  conversationId: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export interface AiConversation {
  id: string;
  userId: string;
  title: string;
  model: string;
  lastMessage?: string | null;
  createdAt: string;
  updatedAt: string;
  messages?: AiMessage[];
  user?: { id: string; name: string; email: string };
}

export interface ChatResponse {
  reply: string;
  conversation: AiConversation;
}

export interface AiStats {
  totalConversations: number;
  totalMessages: number;
  todayMessages: number;
  activeConversations?: number;
  uniqueUsers?: number;
  successRate: number;
  avgResponseTime: number;
}

export const aiAPI = {
  chat: async (message: string, conversationId?: string): Promise<ChatResponse> => {
    const response = await api.post("/ai/chat", { message, conversationId });
    return response.data;
  },

  getConversations: async (): Promise<AiConversation[]> => {
    const response = await api.get("/ai/conversations");
    return response.data;
  },

  getConversation: async (id: string): Promise<AiConversation> => {
    const response = await api.get(`/ai/conversations/${id}`);
    return response.data;
  },

  renameConversation: async (id: string, title: string): Promise<AiConversation> => {
    const response = await api.patch(`/ai/conversations/${id}`, { title });
    return response.data;
  },

  deleteConversation: async (id: string): Promise<{ success: boolean }> => {
    const response = await api.delete(`/ai/conversations/${id}`);
    return response.data;
  },

  getStats: async (): Promise<AiStats> => {
    const response = await api.get("/ai/stats");
    return response.data;
  },

  getAdminConversations: async (): Promise<AiConversation[]> => {
    const response = await api.get("/ai/admin/conversations");
    return response.data;
  },

  getAdminStats: async (): Promise<AiStats> => {
    const response = await api.get("/ai/admin/stats");
    return response.data;
  },

  generate: async (message: string, pageKey?: string): Promise<{ response: string }> => {
    const response = await api.post("/ai/generate", { message, pageKey });
    return response.data;
  },
};

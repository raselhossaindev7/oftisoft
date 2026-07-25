"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { aiAPI, type AiConversation, type AiMessage, type AiStats } from "@/lib/api/domains/ai";

export function useAiChat() {
  const [conversations, setConversations] = useState<AiConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<AiStats | null>(null);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = useCallback(async () => {
    try {
      setIsLoadingConversations(true);
      const data = await aiAPI.getConversations();
      setConversations(data);
    } catch (err: any) {
      console.error("Failed to load conversations:", err);
    } finally {
      setIsLoadingConversations(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const data = await aiAPI.getStats();
      setStats(data);
    } catch {
    }
  }, []);

  const loadConversation = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setActiveConversationId(id);
      const data = await aiAPI.getConversation(id);
      setMessages(data.messages || []);
    } catch (err: any) {
      setError("Failed to load conversation");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendMessage = useCallback(async (message: string, conversationId?: string) => {
    if (!message.trim()) return;
    setIsLoading(true);
    setError(null);

    const tempUserMsg: AiMessage = {
      id: "temp-" + Date.now(),
      conversationId: conversationId || "",
      role: "user",
      content: message,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const data = await aiAPI.chat(message, conversationId || activeConversationId || undefined);
      setActiveConversationId(data.conversation.id);

      const assistantMsg: AiMessage = {
        id: "resp-" + Date.now(),
        conversationId: data.conversation.id,
        role: "assistant",
        content: data.reply,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      await fetchConversations();
      return data.conversation.id;
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to send message");
      setMessages((prev) => prev.filter((m) => m.id !== tempUserMsg.id));
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [activeConversationId, fetchConversations]);

  const startNewChat = useCallback(() => {
    setActiveConversationId(null);
    setMessages([]);
    setError(null);
  }, []);

  const deleteConversation = useCallback(async (id: string) => {
    try {
      await aiAPI.deleteConversation(id);
      if (activeConversationId === id) {
        setActiveConversationId(null);
        setMessages([]);
      }
      await fetchConversations();
    } catch {
      setError("Failed to delete conversation");
    }
  }, [activeConversationId, fetchConversations]);

  const renameConversation = useCallback(async (id: string, title: string) => {
    try {
      await aiAPI.renameConversation(id, title);
      await fetchConversations();
    } catch {
      setError("Failed to rename conversation");
    }
  }, [fetchConversations]);

  useEffect(() => {
    fetchConversations();
    fetchStats();
  }, [fetchConversations, fetchStats]);

  return {
    conversations,
    activeConversationId,
    messages,
    isLoading,
    stats,
    isLoadingConversations,
    error,
    fetchConversations,
    loadConversation,
    sendMessage,
    startNewChat,
    deleteConversation,
    renameConversation,
  };
}

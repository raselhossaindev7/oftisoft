"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/store/useAuthStore";

interface UseSocketOptions {
  autoConnect?: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

export function useSocket(options: UseSocketOptions = {}) {
  const { autoConnect = true, onConnect, onDisconnect, onError } = options;
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isAuthenticatedWs, setIsAuthenticatedWs] = useState(false);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!autoConnect || !isAuthenticated) return;

    const overrideUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
    const socketUrl =
      overrideUrl ||
      (apiUrl.startsWith("/") ? "http://localhost:5500" : apiUrl.replace(/\/api$/, ""));

    socketRef.current = io(socketUrl, {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    const socket = socketRef.current;

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      setIsConnected(true);

      // Authenticate via JWT cookie (httpOnly, sent automatically with withCredentials)
      socket.emit("authenticate", {});
    });

    socket.on("authenticated", (data: { userId: string; name: string; unreadCount: number }) => {
      console.log("Socket authenticated as:", data.name);
      setIsAuthenticatedWs(true);
      onConnect?.();
    });

    socket.on("auth_error", (data: { message: string }) => {
      console.error("Socket auth error:", data.message);
      setIsAuthenticatedWs(false);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
      setIsConnected(false);
      setIsAuthenticatedWs(false);
      onDisconnect?.();
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      onError?.(error);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [autoConnect, isAuthenticated, onConnect, onDisconnect, onError]);

  const emit = useCallback((event: string, data: any) => {
    socketRef.current?.emit(event, data);
  }, []);

  const on = useCallback((event: string, callback: (...args: any[]) => void) => {
    socketRef.current?.on(event, callback);

    return () => {
      socketRef.current?.off(event, callback);
    };
  }, []);

  const joinConversation = useCallback((conversationId: string) => {
    socketRef.current?.emit("joinConversation", { conversationId });
  }, []);

  const leaveConversation = useCallback((conversationId: string) => {
    socketRef.current?.emit("leaveConversation", { conversationId });
  }, []);

  const sendMessage = useCallback((conversationId: string, content: string) => {
    socketRef.current?.emit("sendMessage", { conversationId, content });
  }, []);

  const sendTyping = useCallback((conversationId: string, isTyping: boolean) => {
    socketRef.current?.emit("typing", { conversationId, isTyping });
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    isAuthenticatedWs,
    emit,
    on,
    joinConversation,
    leaveConversation,
    sendMessage,
    sendTyping,
  };
}
"use client"
import { Animated, AnimatedDiv, AnimatePresence } from "@/lib/animated";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Paperclip, ChevronDown, User, Bot, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useSocket } from "@/hooks/useSocket";

type Message = {
    id: string;
    sender: "user" | "ai" | "system" | "human";
    text: string;
    timestamp: Date;
};

type ChatState = "minimized" | "expanded";
type AgentState = "ai" | "human";

const QUICK_REPLIES = [
    "I need help with a project",
    "I want to discuss services",
    "Technical support",
    "Just browsing",
];

const SUPPORT_EMAILS = ["sarah@oftisoft.com", "alex@oftisoft.com"];

export default function LiveChatPopup() {
    const [chatState, setChatState] = useState<ChatState>("minimized");
    const [agentState, setAgentState] = useState<AgentState>("ai");
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [badgeCount, setBadgeCount] = useState(1);
    const [hasOpened, setHasOpened] = useState(false);
    const [conversationId, setConversationId] = useState<string | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const pendingReplyRef = useRef(false);
    const fallbackTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

    const { isConnected, isAuthenticatedWs, sendMessage: wsSendMessage, on, emit, joinConversation } = useSocket({ autoConnect: true });

    // Cleanup fallback timers on unmount
    useEffect(() => {
        return () => {
            fallbackTimersRef.current.forEach(clearTimeout);
            fallbackTimersRef.current = [];
        };
    }, []);

    // Listen for custom event to open chat from other components
    useEffect(() => {
        const handler = () => {
            setChatState("expanded");
            setBadgeCount(0);
            if (!hasOpened) {
                setHasOpened(true);
                addMessage({
                    id: "welcome",
                    sender: "ai",
                    text: "Hi there! I'm Alex from Oftisoft. How can I help you today?",
                    timestamp: new Date()
                });
            }
        };
        window.addEventListener('open-live-chat', handler);
        return () => window.removeEventListener('open-live-chat', handler);
    }, [hasOpened]);

    // Listen for incoming messages from support bot via WebSocket
    useEffect(() => {
        if (!isAuthenticatedWs) return;

        const unsubMsg = on("newMessage", (data: { conversationId: string; sender: { email: string; name: string }; content: string; id: string }) => {
            if (!conversationId && data.conversationId) {
                setConversationId(data.conversationId);
            }
            if (conversationId && data.conversationId !== conversationId) return;
            if (SUPPORT_EMAILS.includes(data.sender.email)) {
                setIsTyping(false);
                pendingReplyRef.current = false;
                addMessage({
                    id: data.id,
                    sender: data.sender.email === "sarah@oftisoft.com" ? "human" : "ai",
                    text: data.content,
                    timestamp: new Date()
                });
                if (data.sender.email === "sarah@oftisoft.com") {
                    setAgentState("human");
                }
            }
        });

        const unsubConv = on("conversation:created", (data: { conversationId: string }) => {
            setConversationId(data.conversationId);
        });

        // Try to start a support conversation
        emit("support:start", {});

        return () => { unsubMsg(); unsubConv(); };
    }, [isAuthenticatedWs, conversationId, on, emit]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    useEffect(() => {
        if (chatState === "expanded" && !hasOpened) {
            setHasOpened(true);
            setBadgeCount(0);
            setIsTyping(true);
            setTimeout(() => {
                setIsTyping(false);
                addMessage({
                    id: "init-1",
                    sender: "ai",
                    text: "Hi there! 👋 I'm Alex from Oftisoft. How can I help you today?",
                    timestamp: new Date()
                });
            }, 1500);
        }
    }, [chatState, hasOpened]);

    const addMessage = (msg: Message) => {
        setMessages((prev) => [...prev, msg]);
    };

    const getLocalResponse = (text: string): { responseText: string; nextAction: (() => void) | null } => {
        let responseText = "That sounds interesting! Could you tell me a bit more about your requirements?";
        let nextAction: (() => void) | null = null;

        if (text.toLowerCase().includes("project") || text.toLowerCase().includes("services")) {
            responseText = "Great! We specialize in turning visions into reality. What kind of project are you looking to build? (Web, Mobile, AI, etc.)";
        } else if (text.toLowerCase().includes("wordpress")) {
            responseText = "WordPress is a fantastic choice for scalable content sites. Are you looking for a custom theme or a full E-commerce setup?";
        } else if (text.toLowerCase().includes("human") || text.toLowerCase().includes("support")) {
            responseText = "I've flagged this for our team. To reach a human faster, please email oftisoft@gmail.com or submit the contact form on our site. In the meantime, I'm happy to help with any questions!";
            nextAction = () => {
                toast.success("Your request has been noted. Our team typically responds within 1 hour during business hours.");
                setTimeout(() => {
                    addMessage({
                        id: "sys-transfer",
                        sender: "system",
                        text: "📧 For urgent matters: oftisoft@gmail.com\n🕐 Response time: Under 1 hour\n\nYou can also use the contact form on the website.",
                        timestamp: new Date()
                    });
                }, 1500);
            };
        }
        return { responseText, nextAction };
    };

    const handleUserMessage = async (text: string) => {
        addMessage({
            id: Date.now().toString(),
            sender: "user",
            text,
            timestamp: new Date()
        });
        setInput("");
        setIsTyping(true);

        const useWebSocket = isConnected && isAuthenticatedWs;

        if (useWebSocket) {
            const cid = conversationId || "support";
            pendingReplyRef.current = true;
            wsSendMessage(cid, text);
            if (!conversationId) {
                joinConversation(cid);
            }
            // Fall back to local if no socket response within 8 seconds
            const timer = setTimeout(() => {
                if (!pendingReplyRef.current) return;
                pendingReplyRef.current = false;
                setIsTyping(false);
                const { responseText, nextAction } = getLocalResponse(text);
                if (nextAction) {
                    addMessage({ id: Date.now() + "-ai", sender: "ai", text: responseText, timestamp: new Date() });
                    nextAction();
                } else {
                    addMessage({ id: Date.now() + "-ai", sender: "ai", text: responseText, timestamp: new Date() });
                }
            }, 8000);
            fallbackTimersRef.current.push(timer);
        } else {
            const baseDelay = 1000;
            const typingSpeed = 50;
            const variableDelay = Math.random() * 2000;
            const { responseText, nextAction } = getLocalResponse(text);
            const totalDelay = baseDelay + (responseText.length * typingSpeed) + variableDelay;

            setTimeout(() => {
                setIsTyping(false);
                if (nextAction) {
                    addMessage({ id: Date.now() + "-ai", sender: "ai", text: responseText, timestamp: new Date() });
                    nextAction();
                } else {
                    addMessage({
                        id: Date.now() + "-ai",
                        sender: agentState === "human" ? "human" : "ai",
                        text: responseText,
                        timestamp: new Date()
                    });
                }
            }, totalDelay);
        }
    };

    const handleSend = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim()) return;
        handleUserMessage(input);
    };

    return (
        <div className="fixed bottom-8 right-8 z-[100] font-sans">
            <AnimatePresence mode="wait">

                {chatState === "minimized" && (
                    <Animated as="button"
                        key="minimized"
                        layoutId="chat-window"
                        initial={{ scale: 0, opacity: 0, y: 50 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setChatState("expanded")}
                        className="w-16 h-16 rounded-full bg-gradient-to-tr from-primary to-secondary shadow-[0_8px_30px_rgb(0,0,0,0.3)] flex items-center justify-center relative group"
                    >
                        <span className="absolute inset-0 rounded-full border-2 border-green-500 opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-all" />
                        <MessageCircle className="w-8 h-8 text-white relative z-10" />
                        {badgeCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-background animate-pulse">
                                {badgeCount}
                            </span>
                        )}
                    </Animated>
                )}

                {chatState === "expanded" && (
                    <AnimatedDiv key="expanded"
                        layoutId="chat-window"
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
                        className="w-[380px] h-[600px] bg-background border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col"
                    >
                        <div className="bg-gradient-to-r from-primary/90 to-secondary/90 p-4 flex items-center justify-between text-white shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center overflow-hidden border border-white/30">
                                        {agentState === "ai" ? <Bot className="w-6 h-6" /> : <User className="w-6 h-6" />}
                                    </div>
                                    {isConnected && (
                                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-primary rounded-full animate-pulse" />
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm flex items-center gap-2">
                                        {agentState === "ai" ? "Oftisoft Support" : "Sarah (Senior Agent)"}
                                        {agentState === "ai" && <span className="text-micro bg-white/20 px-1.5 py-0.5 rounded uppercase tracking-wide">Bot</span>}
                                    </h3>
                                    {isTyping ? (
                                        <span className="text-xs opacity-90 animate-pulse">Typing...</span>
                                    ) : (
                                        <span className="text-xs opacity-80">{isConnected ? "Online" : "We're here to help"}</span>
                                    )}
                                </div>
                            </div>
                            <button onClick={() => setChatState("minimized")}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors rotate-0 hover:rotate-90 duration-300"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/10 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
                            <div className="text-center text-xs text-muted-foreground my-4">
                                Today, {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>

                            {messages.map((msg) => (
                                <AnimatedDiv key={msg.id}
                                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    className={cn(
                                        "flex w-full mb-4",
                                        msg.sender === "user" ? "justify-end" : "justify-start",
                                        msg.sender === "system" ? "justify-center" : ""
                                    )}
                                >
                                    {msg.sender === "system" ? (
                                        <span className="text-xs text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">{msg.text}</span>
                                    ) : (
                                        <div className={cn(
                                            "max-w-[80%] rounded-2xl p-3 shadow-sm relative group",
                                            msg.sender === "user"
                                                ? "bg-primary text-primary-foreground rounded-br-none"
                                                : "bg-card border border-border text-foreground rounded-bl-none"
                                        )}>
                                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                                            <span className="text-micro opacity-0 group-hover:opacity-60 transition-opacity absolute -bottom-5 right-0 text-muted-foreground block min-w-[50px] text-right">
                                                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    )}
                                </AnimatedDiv>
                            ))}

                            {isTyping && (
                                <AnimatedDiv initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex justify-start w-full"
                                >
                                    <div className="bg-card border border-border rounded-2xl rounded-bl-none p-3 shadow-sm flex gap-1 items-center h-10 w-16">
                                        <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                        <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                        <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" />
                                    </div>
                                </AnimatedDiv>
                            )}

                            {messages.length === 1 && messages[0].sender === "ai" && !isTyping && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {QUICK_REPLIES.map((reply, i) => (
                                        <Animated as="button"
                                            key={reply}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: i * 0.1 }}
                                            onClick={() => handleUserMessage(reply)}
                                            className="text-xs bg-background border border-primary/20 hover:bg-primary/5 hover:border-primary text-primary px-3 py-2 rounded-full transition-all"
                                        >
                                            {reply}
                                        </Animated>
                                    ))}
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        <div className="p-4 bg-background border-t border-border shrink-0">
                            <form onSubmit={handleSend}
                                className="flex items-end gap-2 bg-muted/30 p-2 rounded-xl border border-border focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition-all"
                            >
                                <button 
                                    type="button" 
                                    onClick={() => toast.info("File upload is not available in demo mode.")}
                                    className="p-2 text-muted-foreground hover:text-primary transition-colors cursor-pointer hover:rotate-12 duration-300"
                                >
                                    <Paperclip className="w-5 h-5" />
                                </button>

                                <input className="flex-1 bg-transparent border-none focus:ring-0 min-h-[40px] max-h-[100px] py-2 text-sm resize-none placeholder:text-muted-foreground/50 outline-none"
                                    placeholder="Type your message..."
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                />

                                <button type="submit"
                                    disabled={!input.trim()}
                                    className="p-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </form>
                            <div className="text-center mt-2">
                                <span className="text-micro text-muted-foreground">Powered by Oftisoft AI</span>
                            </div>
                        </div>

                    </AnimatedDiv>
                )}
            </AnimatePresence>
        </div>
    );
}

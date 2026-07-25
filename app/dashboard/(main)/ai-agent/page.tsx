"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Sparkles, Bot, MessageSquare, Plus, Trash2, Edit3, SendHorizontal,
  PanelLeftOpen, PanelLeftClose, Loader2, Check, X, Brain,
  Terminal, BarChart3, Users, ShoppingCart, Copy, CheckCheck,
  Clock, ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { withRoleProtection } from "@/components/auth/role-guard";
import { useAiChat } from "@/hooks/useAiChat";
import type { AiMessage, AiConversation } from "@/lib/api/domains/ai";
import { cn } from "@/lib/utils";

const MODELS = [
  { value: "gpt-4o-mini", label: "GPT-4o Mini", icon: Brain },
  { value: "gpt-4o", label: "GPT-4o", icon: Brain },
  { value: "claude-3", label: "Claude 3", icon: Bot },
] as const;

const SUGGESTIONS = [
  { icon: Users, label: "Show me users", query: "Show me the latest users on the platform", color: "from-blue-500/20 to-blue-600/10" },
  { icon: ShoppingCart, label: "Recent orders", query: "What are the recent orders?", color: "from-green-500/20 to-green-600/10" },
  { icon: BarChart3, label: "System stats", query: "Give me system-wide statistics", color: "from-purple-500/20 to-purple-600/10" },
  { icon: Terminal, label: "Find projects", query: "List all active projects", color: "from-amber-500/20 to-amber-600/10" },
];

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-1">
      <span className="w-2 h-2 rounded-full bg-foreground/40 animate-bounce" style={{ animationDelay: "0ms" }} />
      <span className="w-2 h-2 rounded-full bg-foreground/40 animate-bounce" style={{ animationDelay: "150ms" }} />
      <span className="w-2 h-2 rounded-full bg-foreground/40 animate-bounce" style={{ animationDelay: "300ms" }} />
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2 p-1 rounded-md hover:bg-foreground/10"
      type="button"
    >
      {copied ? <CheckCheck className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5 text-foreground/50" />}
    </button>
  );
}

function MessageBubble({ msg }: { msg: AiMessage }) {
  const isUser = msg.role === "user";
  return (
    <div className={cn("flex gap-3 group", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <Avatar className="w-8 h-8 ring-2 ring-primary/20 shrink-0 mt-1">
          <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600">
            <Bot className="h-4 w-4 text-white" />
          </AvatarFallback>
        </Avatar>
      )}
      <div className="relative max-w-[75%]">
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
            isUser
              ? "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-br-md"
              : "bg-card border border-border/50 shadow-sm rounded-bl-md",
          )}
        >
          <div className={cn("whitespace-pre-wrap", isUser ? "text-primary-foreground/90" : "text-foreground")}>
            {msg.content}
          </div>
        </div>
        <div className={cn("flex items-center gap-1.5 mt-1", isUser ? "justify-end" : "justify-start")}>
          <span className={cn("text-[10px]", isUser ? "text-primary-foreground/50" : "text-muted-foreground")}>
            {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
        {!isUser && <CopyButton text={msg.content} />}
      </div>
      {isUser && (
        <Avatar className="w-8 h-8 shrink-0 mt-1">
          <AvatarFallback className="bg-gradient-to-br from-foreground to-foreground/70 text-background text-xs font-bold">
            U
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}

function ConversationItem({
  conv, isActive, onSelect, onRename, onDelete,
}: {
  conv: AiConversation; isActive: boolean;
  onSelect: () => void; onRename: (title: string) => void; onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editVal, setEditVal] = useState(conv.title);
  const [showActions, setShowActions] = useState(false);

  return (
    <div
      onClick={onSelect}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      className={cn(
        "group relative flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer text-sm transition-all duration-200",
        isActive
          ? "bg-gradient-to-r from-primary/15 to-primary/5 border border-primary/20 shadow-sm"
          : "hover:bg-muted/50 hover:border-border/80 border border-transparent",
      )}
    >
      <div className={cn(
        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors",
        isActive ? "bg-primary text-primary-foreground" : "bg-muted/80 text-muted-foreground",
      )}>
        <MessageSquare className="h-3.5 w-3.5" />
      </div>
      {editing ? (
        <div className="flex-1 flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <Input
            value={editVal}
            onChange={(e) => setEditVal(e.target.value)}
            className="h-7 text-xs"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") { if (editVal.trim()) onRename(editVal.trim()); setEditing(false); }
              if (e.key === "Escape") { setEditing(false); setEditVal(conv.title); }
            }}
          />
          <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => { if (editVal.trim()) onRename(editVal.trim()); setEditing(false); }}>
            <Check className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => { setEditing(false); setEditVal(conv.title); }}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <>
          <div className="flex-1 min-w-0">
            <div className="truncate font-medium text-sm">{conv.title || "New Chat"}</div>
            {!!conv.lastMessage && (
              <div className="truncate text-[11px] text-muted-foreground mt-0.5">{conv.lastMessage}</div>
            )}
          </div>
          {(showActions || isActive) && (
            <div className="flex items-center gap-0.5 shrink-0">
              <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-background" onClick={(e) => { e.stopPropagation(); setEditing(true); }}>
                <Edit3 className="h-3 w-3 text-muted-foreground" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-destructive/10" onClick={(e) => { e.stopPropagation(); onDelete(); }}>
                <Trash2 className="h-3 w-3 text-destructive/70" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function AiAgentContent() {
  const {
    conversations, activeConversationId, messages, isLoading, stats,
    isLoadingConversations, error, loadConversation, sendMessage,
    startNewChat, deleteConversation, renameConversation,
  } = useAiChat();

  const [input, setInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [model, setModel] = useState("gpt-4o-mini");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    const msg = input.trim();
    if (!msg || isLoading) return;
    setInput("");
    await sendMessage(msg);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleDelete = useCallback((id: string) => {
    if (confirm("Delete this conversation?")) {
      deleteConversation(id);
    }
  }, [deleteConversation]);

  const hasMessages = messages.length > 0;

  return (
    <div className="h-[calc(100vh-7rem)] flex gap-3">
      <div className={cn(
        "flex flex-col transition-all duration-300 ease-in-out overflow-hidden",
        sidebarOpen ? "w-72 opacity-100" : "w-0 opacity-0",
      )}>
        <Card className="flex-1 border-border/50 flex flex-col overflow-hidden bg-card/50 backdrop-blur-sm">
          <div className="p-4 pb-0 shrink-0">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                  <Bot className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="font-semibold text-sm">History</span>
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-muted/50" onClick={() => setSidebarOpen(false)}>
                <PanelLeftClose className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
            {!!stats && (
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-gradient-to-br from-primary/5 to-primary/0 rounded-xl p-2.5 text-center border border-primary/10">
                  <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Total</div>
                  <div className="text-lg font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                    {stats.totalConversations}
                  </div>
                  <div className="text-[10px] text-muted-foreground">conversations</div>
                </div>
                <div className="bg-gradient-to-br from-purple-500/5 to-purple-500/0 rounded-xl p-2.5 text-center border border-purple-500/10">
                  <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Today</div>
                  <div className="text-lg font-bold bg-gradient-to-r from-purple-500 to-purple-400 bg-clip-text text-transparent">
                    {stats.todayMessages}
                  </div>
                  <div className="text-[10px] text-muted-foreground">messages</div>
                </div>
              </div>
            )}
            <Separator className="mb-2" />
          </div>

          <ScrollArea className="flex-1 px-3 pb-3">
            {isLoadingConversations ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center mx-auto mb-3">
                  <MessageSquare className="h-5 w-5 text-muted-foreground/50" />
                </div>
                <p className="text-sm text-muted-foreground">No conversations yet</p>
                <p className="text-xs text-muted-foreground/50 mt-1">Start a new chat to begin</p>
              </div>
            ) : (
              <div className="space-y-1">
                {conversations.map((conv) => (
                  <ConversationItem
                    key={conv.id}
                    conv={conv}
                    isActive={activeConversationId === conv.id}
                    onSelect={() => loadConversation(conv.id)}
                    onRename={(title) => renameConversation(conv.id, title)}
                    onDelete={() => handleDelete(conv.id)}
                  />
                ))}
              </div>
            )}
          </ScrollArea>

          <div className="p-3 border-t border-border/50 shrink-0">
            <Button className="w-full gap-2 rounded-xl h-9 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white shadow-lg shadow-primary/20" size="sm" onClick={startNewChat}>
              <Plus className="h-4 w-4" /> New Chat
            </Button>
          </div>
        </Card>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        {!sidebarOpen && (
          <Button variant="outline" size="icon" className="h-8 w-8 mb-2 rounded-xl border-dashed" onClick={() => setSidebarOpen(true)}>
            <PanelLeftOpen className="h-4 w-4" />
          </Button>
        )}

        {!hasMessages && !isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/20 via-purple-500/20 to-pink-500/10 flex items-center justify-center shadow-2xl shadow-primary/10">
                <Bot className="w-12 h-12 text-primary" />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-green-500 border-2 border-background" />
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
                AI Assistant
              </h2>
              <p className="text-muted-foreground text-sm mt-2 max-w-md">
                Ask me about your business — users, orders, projects, or general questions. I can access your backend data for real answers.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 max-w-md w-full">
              {SUGGESTIONS.map((s) => (
                <Button
                  key={s.label}
                  variant="outline"
                  className="h-auto flex-col gap-2 py-4 rounded-2xl border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all duration-200"
                  onClick={() => { sendMessage(s.query); }}
                >
                  <div className={cn("w-9 h-9 rounded-xl bg-gradient-to-br flex items-center justify-center", s.color)}>
                    <s.icon className="h-4 w-4 text-foreground" />
                  </div>
                  <span className="text-xs font-medium">{s.label}</span>
                </Button>
              ))}
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <Badge variant="outline" className="rounded-lg gap-1.5 border-dashed">
                <Sparkles className="w-3 h-3" /> GPT-4o Mini
              </Badge>
              <Badge variant="outline" className="rounded-lg gap-1.5 border-dashed">
                <Clock className="w-3 h-3" /> Real-time data
              </Badge>
            </div>
          </div>
        ) : (
          <Card className="flex-1 border-border/50 flex flex-col overflow-hidden bg-card/50 backdrop-blur-sm">
            <div className="px-5 py-3 border-b border-border/50 shrink-0 flex items-center justify-between bg-background/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg shadow-primary/20">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className="text-sm font-semibold">
                    {conversations.find((c) => c.id === activeConversationId)?.title || "New Chat"}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    <span className="text-[10px] text-muted-foreground">AI Ready</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <select
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="h-8 rounded-lg border border-border/50 bg-background/50 px-3 pr-8 text-xs appearance-none cursor-pointer hover:border-primary/30 transition-colors"
                  >
                    {MODELS.map((m) => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 pointer-events-none text-muted-foreground" />
                </div>
              </div>
            </div>

            <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-5">
              <div className="space-y-4 max-w-3xl mx-auto">
                {messages.map((msg) => (
                  <div key={msg.id}>
                    <MessageBubble msg={msg} />
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-3">
                    <Avatar className="w-8 h-8 ring-2 ring-primary/20 shrink-0">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600">
                        <Bot className="h-4 w-4 text-white" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="rounded-2xl rounded-bl-md bg-card border border-border/50 shadow-sm px-5 py-3.5">
                      <TypingDots />
                    </div>
                  </div>
                )}
                {!!error && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-2xl px-4 py-3 text-sm text-destructive text-center">
                    {error}
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            <div className="px-4 py-3 border-t border-border/50 shrink-0 bg-background/30 backdrop-blur-sm">
              <div className="flex gap-2 max-w-3xl mx-auto">
                <div className="flex-1 relative">
                  <Input
                    ref={inputRef}
                    placeholder="Type your message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isLoading}
                    className="pr-12 rounded-xl bg-background/50 border-border/50 h-11 text-sm focus-visible:ring-primary/30"
                  />
                  <Button
                    onClick={handleSend}
                    disabled={isLoading || !input.trim()}
                    size="icon"
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <SendHorizontal className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

function AIAgentPage() {
  return (
    <div className="h-full">
      <AiAgentContent />
    </div>
  );
}

export default withRoleProtection(AIAgentPage, ["Admin", "SuperAdmin"]);

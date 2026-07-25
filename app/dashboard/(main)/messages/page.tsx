"use client"
import { AnimatedDiv, AnimatePresence } from "@/lib/animated";
import { useState, useRef, useEffect, Suspense, memo } from "react";
import {
  Search,
  Plus,
  Send,
  Video,
  Info,
  CheckCheck,
  Check,
  ArrowLeft,
  Bot,
  MessageSquare,
  MoreVertical,
  Pin,
  BellOff,
  Trash2,
  Edit3,
  Reply,
  Smile,
  X,
  Paperclip,
  FileText,
  Download,
  Shield,
  User,
  Crown,
  Ban,
  Loader2,
  SearchX
} from "lucide-react";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMessages, UserRole, Message as MessageType, Conversation } from "@/hooks/useMessages";
import { messagesAPI } from "@/lib/api";
import { ordersAPI } from "@/lib/api/domains/orders";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useMutation } from "@tanstack/react-query";
import { Store, ShoppingBag, Package as PackageIcon } from "lucide-react";

const GOOGLE_MEET_URL = "https://meet.google.com/new";

const EMOJI_GRID = [
  "😀", "😃", "😄", "😁", "😅", "🤣", "😂", "🙂", "🙃", "😉",
  "😊", "😇", "🥰", "😍", "🤩", "😘", "😗", "😚", "😙", "🥲",
  "😋", "😛", "😜", "🤪", "😝", "🤑", "🤗", "🤭", "🤫", "🤔",
  "😐", "😑", "😶", "😏", "😒", "🙄", "😬", "🤥", "😌", "😔",
  "😪", "🤤", "😴", "😷", "🤒", "🤕", "🤢", "🤮", "🤧", "🥵",
  "🥶", "🥴", "😵", "🤯", "🤠", "🥳", "🥸", "😎", "👍", "👎",
  "👏", "🙌", "🤝", "🙏", "💪", "❤️", "🧡", "💛", "💚", "💙",
  "💜", "🖤", "🤍", "🤎", "💔", "❣️", "💕", "💞", "💓", "💗",
  "🔥", "💯", "✨", "🎉", "🎊", "🎁", "💡", "⭐", "🌟", "⚡",
];

const ROLE_ICONS: Record<UserRole, React.ReactNode> = {
  'SuperAdmin': <Crown className="w-3 h-3 text-purple-500" />,
  'Admin': <Shield className="w-3 h-3 text-red-500" />,
  'Support': <Bot className="w-3 h-3 text-green-500" />,
  'Editor': <Edit3 className="w-3 h-3 text-orange-500" />,
  'User': <User className="w-3 h-3 text-blue-500" />,
  'Viewer': <User className="w-3 h-3 text-gray-500" />,
};

const ROLE_COLORS: Record<UserRole, string> = {
  'SuperAdmin': 'bg-purple-600',
  'Admin': 'bg-red-500',
  'Support': 'bg-green-500',
  'Editor': 'bg-orange-500',
  'User': 'bg-blue-500',
  'Viewer': 'bg-gray-500',
};

interface FileAttachment {
  file: File;
  preview?: string;
  id: string;
}

const MessageBubble = memo(function MessageBubble({ msg, selectedChat, currentUser, selectedMessageId, setSelectedMessageId, setReplyingTo, setEditingMessage, setEditInput, permissions, onDelete, onAddReaction, onRemoveReaction, onPreviewImage }: {
  msg: MessageType;
  selectedChat: Conversation | null;
  currentUser: any;
  selectedMessageId: string | null;
  setSelectedMessageId: (id: string | null) => void;
  setReplyingTo: (msg: MessageType | null) => void;
  setEditingMessage: (msg: MessageType | null) => void;
  setEditInput: (v: string) => void;
  permissions: any;
  onDelete: (id: string) => void;
  onAddReaction: (id: string, emoji: string) => void;
  onRemoveReaction: (id: string, emoji: string) => void;
  onPreviewImage: (url: string) => void;
}) {
  const isSelected = selectedMessageId === msg.id;
  const hasReactions = msg.reactions && msg.reactions.length > 0;

  // System messages (order status updates)
  if (msg.isSystem) {
    return (
      <div className="flex justify-center py-1.5">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/60 dark:bg-zinc-800/60 border border-border/30 text-xs text-muted-foreground max-w-[90%]">
          <Info className="w-3 h-3 shrink-0 text-primary/60" />
          <span className="text-center">{msg.text}</span>
        </div>
      </div>
    );
  }

  return (
    <AnimatedDiv key={msg.id}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex gap-2 max-w-[85%] sm:max-w-[75%] group",
        msg.isMe ? "ml-auto flex-row-reverse" : ""
      )}
      onClick={() => setSelectedMessageId(isSelected ? null : msg.id)}
    >
      {!msg.isMe && (
        <Avatar className="h-8 w-8 rounded-full shrink-0 mt-auto">
          <AvatarFallback className={cn("rounded-full text-white text-xs font-medium", ROLE_COLORS[msg.senderRole])}>
            {selectedChat?.avatar}
          </AvatarFallback>
        </Avatar>
      )}

      <div className="flex flex-col gap-1">
        {msg.replyTo && (
          <div className={cn(
            "px-3 py-1.5 rounded-t-xl text-xs border-l-2",
            msg.isMe
              ? "bg-[#0084ff]/20 border-white/50 ml-auto"
              : "bg-gray-100 border-gray-400 dark:bg-zinc-700/50 dark:border-zinc-400 mr-auto"
          )}>
            <span className="font-medium">{msg.replyTo.sender}</span>
            <p className="truncate max-w-[200px] opacity-75">{msg.replyTo.text}</p>
          </div>
        )}

        <div className={cn(
            "relative px-3 py-2 rounded-2xl text-sm shadow-sm cursor-pointer transition-all",
            msg.isMe
              ? "bg-[#0084ff] text-white rounded-br-md rounded-tr-md rounded-tl-xl rounded-bl-xl"
              : "bg-white dark:bg-zinc-800 text-foreground rounded-bl-md rounded-tl-md rounded-tr-xl rounded-br-xl border border-border/50"
          )}
        >
          <AnimatePresence>
            {isSelected && (
              <AnimatedDiv initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={cn(
                  "absolute -top-8 flex items-center gap-1 bg-popover border border-border rounded-lg shadow-lg p-1 z-10",
                  msg.isMe ? "right-0" : "left-0"
                )}
              >
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e) => {
                          e.stopPropagation();
                          setReplyingTo(msg);
                          setSelectedMessageId(null);
                        }}
                      >
                        <Reply className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Reply</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                {msg.isMe && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingMessage(msg);
                            setEditInput(msg.text);
                            setSelectedMessageId(null);
                          }}
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Edit</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}

                {(msg.isMe || permissions?.canDeleteMessages) && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(msg.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Delete</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </AnimatedDiv>
            )}
          </AnimatePresence>

          <p className="break-words leading-snug">{msg.text}</p>

          {msg.attachments && msg.attachments.length > 0 && (
            <div className="mt-2 space-y-1.5">
              {msg.attachments.map((att) => (
                att.type.startsWith('image/') ? (
                  <div key={att.id}
                    className="relative cursor-pointer overflow-hidden rounded-lg group"
                    onClick={(e) => { e.stopPropagation(); onPreviewImage(att.url); }}
                  >
                    <img src={att.url} alt={att.name}
                      className="max-w-[260px] max-h-[200px] w-full h-full object-cover rounded-lg transition-transform group-hover:scale-[1.02]"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                      <Search className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                    </div>
                  </div>
                ) : (
                  <div key={att.id} className="flex items-center gap-2 p-2 bg-black/10 rounded-lg">
                    <FileText className="w-4 h-4 shrink-0" />
                    <span className="text-xs truncate flex-1">{att.name}</span>
                    <a href={att.url} target="_blank" rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                )
              ))}
            </div>
          )}

          <div className={cn(
            "text-sm mt-0.5 flex items-center justify-end gap-1",
            msg.isMe ? "text-white/80" : "text-muted-foreground"
          )}>
            {msg.edited && <span>edited</span>}
            {msg.time}
            {msg.isMe && (
              <>
                {msg.status === 'sent' && <Check className="w-3 h-3 shrink-0 opacity-60" />}
                {msg.status === 'delivered' && <CheckCheck className="w-3 h-3 shrink-0 opacity-60" />}
                {msg.status === 'read' && <CheckCheck className="w-3 h-3 shrink-0 text-blue-300" />}
              </>
            )}
          </div>
        </div>

        {hasReactions && (
          <div className={cn(
            "flex gap-1 mt-1",
            msg.isMe ? "justify-end" : "justify-start"
          )}>
            {msg.reactions?.map((reaction) => (
              <button key={reaction.emoji}
                onClick={(e) => {
                  e.stopPropagation();
                  if (reaction.users.includes(currentUser?.id || '')) {
                    onRemoveReaction(msg.id, reaction.emoji);
                  } else {
                    onAddReaction(msg.id, reaction.emoji);
                  }
                }}
                className={cn(
                  "flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs border transition-colors",
                  reaction.users.includes(currentUser?.id || '')
                    ? "bg-[#0084ff]/10 border-[#0084ff] text-[#0084ff]"
                    : "bg-popover border-border hover:bg-muted"
                )}
              >
                <span>{reaction.emoji}</span>
                <span>{reaction.users.length}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {msg.isMe && <div className="w-8 shrink-0" />}
    </AnimatedDiv>
  );
});

function MessagesPageContent() {
  const { 
    conversations,
    messages,
    selectedChat, 
    setSelectedChat,
    isLoading, 
    isMessagesLoading, 
    typingUsers,
    permissions,
    userRole,
    sendMessage, 
    editMessage,
    deleteMessage,
    addReaction,
    removeReaction,
    sendTypingIndicator,
    startConversation, 
    startSupportChat,
    refreshConversations,
    refreshMessages,
    pinConversation,
    muteConversation,
    blockUser,
    unblockUser,
    searchMessages,
    clearSearch,
    searchQuery,
    canMessageUser
  } = useMessages();
  const { user: currentUser } = useAuth();

  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [isUsersLoading, setIsUsersLoading] = useState(false);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [showChatView, setShowChatView] = useState(false);
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [newChatSearch, setNewChatSearch] = useState("");
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [replyingTo, setReplyingTo] = useState<MessageType | null>(null);
  const [editingMessage, setEditingMessage] = useState<MessageType | null>(null);
  const [editInput, setEditInput] = useState("");
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [messageSearch, setMessageSearch] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isUpdatingOrder, setIsUpdatingOrder] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredConversations = conversations.filter((c) => {
    if (activeTab === "unread") return c.unread > 0;
    if (activeTab === "support") return c.isSupport;
    return (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
           (c.lastMsg || "").toLowerCase().includes(search.toLowerCase());
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedChat]);

  // Fetch seller and users for new chat
  useEffect(() => {
    if (isNewChatOpen) {
      setIsUsersLoading(true);
      Promise.all([
        messagesAPI.getSeller(),
        messagesAPI.getAvailableUsers(),
        messagesAPI.getSupportBot().catch(() => null)
      ])
        .then(([seller, users, bot]) => {
          const list: any[] = [];
          // Seller (admin) first with label
          if (seller) {
            list.push({ ...seller, isSeller: true });
          }
          // Other available users (excluding duplicates)
          const seenIds = new Set(list.map(u => u.id));
          for (const u of users) {
            if (!seenIds.has(u.id)) {
              seenIds.add(u.id);
              list.push(u);
            }
          }
          if (bot && !seenIds.has(bot.id)) {
            list.push({ ...bot, role: 'Support' as UserRole });
          }
          setAvailableUsers(list);
        })
        .catch(() => setAvailableUsers([]))
        .finally(() => setIsUsersLoading(false));
    }
  }, [isNewChatOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    sendTypingIndicator();
  };

  const handleSelectChat = (chat: Conversation) => {
    setSelectedChat(chat);
    setShowChatView(true);
    setMessageSearch("");
    setIsSearchOpen(false);
  };

  const handleBackToList = () => {
    setShowChatView(false);
    setReplyingTo(null);
    setEditingMessage(null);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!input.trim() && attachments.length === 0) || !selectedChat || isSending) return;
    
    setIsSending(true);
    const files = attachments.map(a => a.file);
    const success = await sendMessage(input, files, replyingTo?.id);
    setIsSending(false);
    
    if (success) {
      setInput("");
      setAttachments([]);
      setReplyingTo(null);
    }
  };

  const handleStartNewChat = async (recipientId: string, recipientData?: any) => {
    const existing = conversations.find(c => c.recipientId === recipientId);
    if (existing) {
      handleSelectChat(existing);
      setIsNewChatOpen(false);
      return;
    }
    
    setIsNewChatOpen(false);
    toast.success("Starting chat...");
    const chat = await startConversation(recipientId, recipientData);
    if (chat) {
      setShowChatView(true);
    }
  };

  const handleSupportChat = async () => {
    const chat = await startSupportChat();
    if (chat) {
      handleSelectChat(chat);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate file sizes
  const oversizedFiles = files.filter(f => f.size > (permissions?.maxFileSize || 10 * 1024 * 1024));
    if (oversizedFiles.length > 0) {
      toast.error(`Some files exceed the maximum size limit`);
      return;
    }

    const newAttachments: FileAttachment[] = files.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
    }));

    setAttachments(prev => [...prev, ...newAttachments]);
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => {
      const attachment = prev.find(a => a.id === id);
      if (attachment?.preview) {
        URL.revokeObjectURL(attachment.preview);
      }
      return prev.filter(a => a.id !== id);
    });
  };

  const handleMessageSearch = async () => {
    if (!messageSearch.trim() || !selectedChat) return;
    searchMessages(messageSearch);
    setIsSearchOpen(false);
  };

  const handleEditMessage = async () => {
    if (!editingMessage || !editInput.trim()) return;
    
    const success = await editMessage(editingMessage.id, editInput.trim());
    if (success) {
      setEditingMessage(null);
      setEditInput("");
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    const success = await deleteMessage(messageId);
    if (success) {
      setSelectedMessageId(null);
    }
  };

  const getTypingText = () => {
    const typing = Array.from(typingUsers);
    if (typing.length === 0) return null;
    if (typing.length === 1) return "typing...";
    return `${typing.length} people are typing...`;
  };

  const filteredUsers = availableUsers.filter(u => 
    u.id !== currentUser?.id && 
    (u.name?.toLowerCase().includes(newChatSearch.toLowerCase()) || 
     u.email?.toLowerCase().includes(newChatSearch.toLowerCase()))
  );

  const chatArea = (
    <Card className="flex-1 flex flex-col overflow-hidden rounded-xl border min-h-0 bg-[#f0f2f5] dark:bg-zinc-950/50">
      {/* Chat Header */}
      <CardHeader className="px-4 py-3 border-b border-border flex flex-row items-center justify-between gap-3 shrink-0 bg-background/95 backdrop-blur">
        <div className="flex items-center gap-3 min-w-0">
          <Button variant="ghost"
            size="icon"
            className="lg:hidden shrink-0 h-9 w-9"
            onClick={handleBackToList}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          {selectedChat && (
            <>
              <Avatar className={cn("h-10 w-10 rounded-full shrink-0")}>
                {selectedChat.avatarUrl && (
                  <AvatarImage src={selectedChat.avatarUrl} alt={selectedChat.name} className="object-cover" />
                )}
                <AvatarFallback className={cn("rounded-full text-white font-bold", ROLE_COLORS[selectedChat.role])}>
                  {selectedChat.avatar}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold leading-none truncate">
                    {selectedChat.name}
                  </h3>
                  {selectedChat.isSeller ? (
                    <Badge variant="secondary" className="text-xs px-1.5 py-0 font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-0">
                      <Store className="w-3 h-3 mr-1" /> Seller
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs px-1.5 py-0">
                      {selectedChat.isOrder ? "Buyer" : selectedChat.role}
                    </Badge>
                  )}
                  {selectedChat.isOrder && (
                    <Badge variant="outline" className="text-xs px-1.5 py-0 border-primary/30 text-primary">
                      <ShoppingBag className="w-3 h-3 mr-1" /> Order
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className={cn(
                      "text-xs font-medium flex items-center gap-1",
                      selectedChat.status === "online"
                        ? "text-green-500"
                        : "text-muted-foreground"
                    )}
                  >
                    {selectedChat.status === "online" ? (
                      <>
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shrink-0" />
                        Active Now
                      </>
                    ) : (
                      "Offline"
                    )}
                  </p>
                  {getTypingText() && (
                    <>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-xs text-[#0084ff] animate-pulse">
                        {getTypingText()}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => setIsSearchOpen(true)}
          >
            <Search className="w-5 h-5" />
          </Button>
          <Button variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => window.open(GOOGLE_MEET_URL, "_blank", "noopener,noreferrer")}
          >
            <Video className="w-5 h-5" />
          </Button>
          <Button variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => setIsInfoOpen(true)}
          >
            <Info className="w-5 h-5" />
          </Button>
        </div>
      </CardHeader>

      {/* Order Context Panel */}
      {selectedChat?.order && (
        <div className="px-3 sm:px-4 py-2.5 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-b border-amber-200/50 dark:border-amber-800/20 shrink-0">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 dark:text-amber-400 shrink-0" />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-xs sm:text-sm font-bold truncate">
                    {selectedChat.order.orderNumber}
                  </p>
                  <Badge variant="outline" className={cn(
                    "shrink-0 text-micro sm:text-xs capitalize border px-1.5 py-0",
                    selectedChat.order.status === 'completed' && "bg-green-50 text-green-700 border-green-300 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800",
                    selectedChat.order.status === 'pending' && "bg-yellow-50 text-yellow-700 border-yellow-300 dark:bg-yellow-950/30 dark:text-yellow-400 dark:border-yellow-800",
                    selectedChat.order.status === 'processing' && "bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800",
                    selectedChat.order.status === 'cancelled' && "bg-red-50 text-red-700 border-red-300 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800",
                    selectedChat.order.status === 'refunded' && "bg-purple-50 text-purple-700 border-purple-300 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-800",
                  )}>
                    {selectedChat.order.status}
                  </Badge>
                </div>
                <p className="text-micro sm:text-xs text-muted-foreground mt-0.5">
                  {selectedChat.order.items.length} item{selectedChat.order.items.length !== 1 ? 's' : ''} • ${Number(selectedChat.order.total).toFixed(2)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {selectedChat.isSeller && selectedChat.order.status === 'processing' && (
                <Button variant="default" size="sm" className="h-7 sm:h-8 text-xs rounded-lg gap-1 bg-green-600 hover:bg-green-700 text-white"
                  onClick={async () => {
                    setIsUpdatingOrder(true);
                    try {
                      await ordersAPI.updateStatus(selectedChat.order!.id, 'completed');
                      toast.success('Order delivered successfully');
                      refreshConversations();
                      refreshMessages();
                    } catch {
                      toast.error('Failed to deliver order');
                    } finally {
                      setIsUpdatingOrder(false);
                    }
                  }}
                  disabled={isUpdatingOrder}
                >
                  <Check className="w-3 h-3" /> Deliver
                </Button>
              )}
              <Button variant="ghost" size="sm" className="h-7 sm:h-8 text-xs shrink-0 rounded-lg gap-1"
                onClick={() => window.open(`/dashboard/orders/${selectedChat.order!.id}`, '_self')}
              >
                <ArrowLeft className="w-3 h-3 rotate-180" />
                View
              </Button>
            </div>
          </div>
          {/* Order Items - scrollable on mobile */}
          <div className="mt-1.5 flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
            {selectedChat.order.items.slice(0, 3).map((item, i) => (
              <div key={i} className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-background/80 dark:bg-background/40 rounded-lg border border-border/50 text-micro sm:text-xs whitespace-nowrap shrink-0">
                <PackageIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-muted-foreground shrink-0" />
                <span className="font-medium truncate max-w-[80px] sm:max-w-[120px]">{item.productName}</span>
                <span className="text-muted-foreground">x{item.quantity}</span>
              </div>
            ))}
            {selectedChat.order.items.length > 3 && (
              <span className="text-micro sm:text-xs text-muted-foreground self-center shrink-0">
                +{selectedChat.order.items.length - 3}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Empty state when no chat selected */}
      {!selectedChat && (
        <div className="flex-1 flex items-center justify-center flex-col gap-3 p-8">
          <MessageSquare className="w-12 h-12 text-muted-foreground/30" />
          <p className="text-lg font-semibold text-muted-foreground/50">Select a conversation</p>
          <p className="text-sm text-muted-foreground/30">Choose a chat from the sidebar to start messaging</p>
        </div>
      )}

      {/* Messages Feed */}
      {selectedChat && (
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-1">
          {/* Search Results Banner */}
          {searchQuery && (
            <div className="flex items-center justify-between px-3 py-2 mb-2 bg-primary/5 rounded-lg border border-primary/20">
              <p className="text-sm text-primary flex items-center gap-2">
                <Search className="w-4 h-4" />
                Search results for "<span className="font-semibold">{searchQuery}</span>"
                <span className="text-muted-foreground font-normal">
                  ({messages.length} match{messages.length !== 1 ? 'es' : ''})
                </span>
              </p>
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => clearSearch()}>
                <X className="w-3.5 h-3.5 mr-1" /> Clear
              </Button>
            </div>
          )}
          {selectedChat && isMessagesLoading && messages.length === 0 && (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          )}
          {selectedChat && !isMessagesLoading &&
            messages.map((msg) => (
              <MessageBubble key={msg.id} msg={msg}
                selectedChat={selectedChat}
                currentUser={currentUser}
                selectedMessageId={selectedMessageId}
                setSelectedMessageId={setSelectedMessageId}
                setReplyingTo={setReplyingTo}
                setEditingMessage={setEditingMessage}
                setEditInput={setEditInput}
                permissions={permissions}
                onDelete={handleDeleteMessage}
                onAddReaction={addReaction}
                onRemoveReaction={removeReaction}
                onPreviewImage={setPreviewImage}
              />
            ))
          }
          {selectedChat && !isMessagesLoading && messages.length === 0 && (
            <div className="flex h-32 items-center justify-center text-muted-foreground text-sm">
              {searchQuery ? "No messages match your search." : "No messages yet. Say hello!"}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      )}

      {/* Reply Preview */}
      <AnimatePresence>
        {replyingTo && (
          <AnimatedDiv initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 py-2 bg-muted/50 border-t border-border"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <Reply className="w-4 h-4 text-[#0084ff]" />
                <span className="text-muted-foreground">Replying to</span>
                <span className="font-medium">{replyingTo.sender}</span>
                <span className="text-muted-foreground truncate max-w-[200px]">
                  "{(replyingTo.text || '').substring(0, 50)}..."
                </span>
              </div>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setReplyingTo(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </AnimatedDiv>
        )}
      </AnimatePresence>

      {/* Attachment Preview */}
      {attachments.length > 0 && (
        <div className="px-4 py-2 bg-muted/50 border-t border-border flex gap-2 overflow-x-auto">
          {attachments.map((att) => (
            <div key={att.id} className="relative shrink-0">
              {att.preview ? (
                <img src={att.preview} alt={att.file.name} className="w-16 h-16 object-cover rounded-lg" />
              ) : (
                <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-muted-foreground" />
                </div>
              )}
              <button onClick={() => removeAttachment(att.id)}
                className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-white rounded-full flex items-center justify-center text-xs"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input Area */}
      {selectedChat && (
      <div className="p-3 bg-background/95 backdrop-blur border-t border-border shrink-0">
        <form onSubmit={handleSendMessage}
          className="flex items-end gap-2 bg-muted/50 dark:bg-zinc-800/50 rounded-2xl px-3 py-2"
        >
          <input type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            multiple className="hidden"
            accept={permissions?.allowedFileTypes?.join(',')}
          />
          <Button type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 rounded-full hover:bg-muted"
            onClick={() => fileInputRef.current?.click()}
            disabled={!permissions?.canUploadFiles}
          >
            <Paperclip className="w-5 h-5 text-muted-foreground" />
          </Button>
          <Textarea value={input}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Message"
            className="flex-1 min-h-[38px] max-h-28 border-0 focus-visible:ring-0 resize-none bg-transparent py-2.5 px-2 text-sm placeholder:text-muted-foreground"
            rows={1}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 rounded-full hover:bg-muted"
              >
                <Smile className="w-5 h-5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end"
              side="top"
              sideOffset={8}
              className="w-[320px] p-2 rounded-2xl"
            >
              <div className="grid grid-cols-10 gap-0.5">
                {EMOJI_GRID.map((emoji) => (
                  <button key={emoji}
                    type="button"
                    className="h-8 w-8 flex items-center justify-center text-lg rounded-lg hover:bg-muted transition-colors"
                    onClick={() => setInput((prev) => prev + emoji)}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button type="submit"
            disabled={(!input.trim() && attachments.length === 0) || isSending}
            size="icon"
            className="h-8 w-8 shrink-0 rounded-full bg-[#0084ff] hover:bg-[#0073e6] text-white"
          >
            {isSending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </form>
        {attachments.length > 0 && (
          <p className="text-xs text-muted-foreground mt-1 ml-2">
            {attachments.length} file{attachments.length > 1 ? 's' : ''} attached
          </p>
        )}
      </div>
      )}
    </Card>
  );

  const sidebar = (
    <Card className="w-full lg:w-96 flex flex-col overflow-hidden rounded-xl border shrink-0 h-full min-h-0">
      <div className="p-3 border-b border-border shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold">Messages</h2>
          <Button variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0 rounded-full"
            onClick={() => setIsNewChatOpen(true)}
          >
            <Plus className="w-5 h-5 text-[#0084ff]" />
          </Button>
        </div>
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search messages"
            className="pl-9 h-9 rounded-full bg-muted/50 border-0"
          />
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-8">
            <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
            <TabsTrigger value="unread" className="text-xs">
              Unread {conversations.some(c => c.unread > 0) && (
                <span className="ml-1 w-4 h-4 bg-[#0084ff] text-white rounded-full text-sm flex items-center justify-center">
                  {conversations.filter(c => c.unread > 0).length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="support" className="text-xs">Support</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className="py-1">
          {isLoading && (
            <div className="p-8 text-center">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
            </div>
          )}
          {!isLoading && conversations.length === 0 && (
            <div className="p-6 sm:p-8 text-center space-y-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/20 dark:to-orange-900/20 rounded-full flex items-center justify-center mx-auto border border-amber-200/50 dark:border-amber-700/30">
                <Store className="w-7 h-7 sm:w-8 sm:h-8 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-sm">No conversations yet</p>
                <p className="text-xs text-muted-foreground max-w-[240px] mx-auto leading-relaxed">
                  When you place an order, a chat with the seller will be automatically created here
                </p>
              </div>
              <div className="flex flex-col gap-2 pt-2">
                <Button 
                  asChild
                  size="sm" 
                  className="rounded-xl h-10 font-bold"
                >
                  <a href="/dashboard/orders">
                    <ShoppingBag className="w-4 h-4 mr-2" /> Browse Orders
                  </a>
                </Button>
              </div>
            </div>
          )}
          {!isLoading && (() => {
            const orderChats = filteredConversations.filter(c => c.isOrder);
            const directChats = filteredConversations.filter(c => !c.isOrder);
            const renderChat = (chat: Conversation) => (
              <div key={chat.id}
                className={cn(
                  "group relative flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors",
                  selectedChat?.id === chat.id
                    ? "bg-muted"
                    : "hover:bg-muted/50"
                )}
                onClick={() => handleSelectChat(chat)}
              >
                {chat.isPinned && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-[#0084ff] rounded-r-full" />
                )}
                <div className="relative shrink-0">
                  <Avatar className={cn("h-10 w-10 sm:h-12 sm:w-12 rounded-full")}>
                    {chat.avatarUrl && (
                      <AvatarImage src={chat.avatarUrl} alt={chat.name} className="object-cover" />
                    )}
                    <AvatarFallback className={cn("rounded-full text-white text-xs sm:text-sm font-medium", ROLE_COLORS[chat.role])}>
                      {chat.avatar}
                    </AvatarFallback>
                  </Avatar>
                  {chat.status === "online" && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 border-2 border-background rounded-full" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className={cn(
                        "truncate text-sm",
                        chat.unread > 0 ? "font-semibold" : "font-medium"
                      )}>
                        {chat.name}
                      </span>
                      {chat.isSeller ? (
                        <Badge variant="secondary" className="text-micro px-1 py-0 h-4 font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-0">
                          <Store className="w-2.5 h-2.5 mr-0.5" /> Seller
                        </Badge>
                      ) : (
                        ROLE_ICONS[chat.role]
                      )}
                      {chat.isOrder && !chat.isSeller && (
                        <Badge variant="outline" className="text-micro px-1 py-0 h-4 font-normal border-primary/30 text-primary">
                          Order
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap shrink-0">
                      {chat.time}
                    </span>
                  </div>
                  <p className={cn(
                    "text-xs truncate",
                    chat.unread > 0 ? "text-foreground font-medium" : "text-muted-foreground"
                  )}>
                    {chat.lastMsg}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {chat.unread > 0 && (
                    <span className="min-w-[18px] h-4.5 sm:min-w-[20px] sm:h-5 px-1 rounded-full bg-[#0084ff] text-white text-micro sm:text-xs font-bold flex items-center justify-center">
                      {chat.unread}
                    </span>
                  )}
                  {chat.isMuted && <BellOff className="w-3 h-3 text-muted-foreground" />}
                </div>
                
                {/* Hover actions */}
                <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-7 w-7 bg-background shadow-sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => pinConversation(chat.id, !chat.isPinned)}>
                        <Pin className="w-4 h-4 mr-2" />
                        {chat.isPinned ? 'Unpin' : 'Pin'}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => muteConversation(chat.id, !chat.isMuted)}>
                        <BellOff className="w-4 h-4 mr-2" />
                        {chat.isMuted ? 'Unmute' : 'Mute'}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive"
                        onClick={() => blockUser(chat.recipientId)}
                      >
                        <Ban className="w-4 h-4 mr-2" /> Block
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
            return (
              <>
                {orderChats.length > 0 && (
                  <>
                    <div className="px-3 pt-3 pb-1 flex items-center gap-2">
                      <ShoppingBag className="w-3 h-3 text-amber-500" />
                      <span className="text-micro font-semibold text-muted-foreground uppercase tracking-wider">Orders</span>
                    </div>
                    {orderChats.map(renderChat)}
                  </>
                )}
                {directChats.length > 0 && (
                  <>
                    <div className={cn("px-3 pt-3 pb-1 flex items-center gap-2", orderChats.length > 0 && "mt-2 border-t border-border/50 pt-4")}>
                      <MessageSquare className="w-3 h-3 text-muted-foreground" />
                      <span className="text-micro font-semibold text-muted-foreground uppercase tracking-wider">Direct Messages</span>
                    </div>
                    {directChats.map(renderChat)}
                  </>
                )}
                {orderChats.length === 0 && directChats.length === 0 && search && (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    <SearchX className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    No chats found
                  </div>
                )}
              </>
            );
          })()}
          {filteredConversations.length === 0 && search && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              <SearchX className="w-8 h-8 mx-auto mb-2 opacity-50" />
              No chats found
            </div>
          )}
        </div>
      </ScrollArea>
    </Card>
  );

  return (
    <>
      {/* Main Layout */}
      <div className="flex min-h-full gap-0 lg:gap-4">
        <div className={cn(
          "w-full lg:w-96 shrink-0",
          showChatView && "hidden lg:block"
        )}>
          {sidebar}
        </div>
        <div className={cn(
          "flex-1 min-w-0",
          !showChatView && "hidden lg:flex"
        )}>
          {chatArea}
        </div>
      </div>

      {/* Message Search Dialog */}
      <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Search Messages</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input value={messageSearch}
                onChange={(e) => setMessageSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleMessageSearch()}
                placeholder="Search in conversation..."
                className="pl-9"
              />
            </div>
            <Button onClick={handleMessageSearch} className="w-full">
              Search
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Preview Lightbox */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="sm:max-w-4xl p-0 bg-transparent border-none shadow-none">
          <button onClick={() => setPreviewImage(null)}
            className="absolute -top-10 right-0 text-white/80 hover:text-white z-10"
          >
            <X className="w-6 h-6" />
          </button>
          {previewImage && (
            <img src={previewImage} alt="Preview"
              className="w-full h-auto max-h-[80vh] object-contain rounded-xl"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Message Dialog */}
      <Dialog open={!!editingMessage} onOpenChange={() => setEditingMessage(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Message</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea value={editInput}
              onChange={(e) => setEditInput(e.target.value)}
              placeholder="Edit your message..."
              className="min-h-[100px]"
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingMessage(null)}>Cancel</Button>
              <Button onClick={handleEditMessage}>Save Changes</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Info Dialog */}
      <Dialog open={isInfoOpen} onOpenChange={setIsInfoOpen}>
        <DialogContent className="sm:max-w-sm">
          {selectedChat && (
            <>
              <DialogHeader>
                <DialogTitle>User Info</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className={cn("h-16 w-16 rounded-full", ROLE_COLORS[selectedChat.role])}>
                    <AvatarFallback className="rounded-full text-white font-bold text-lg">
                      {selectedChat.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-bold text-lg">{selectedChat.name}</h3>
                    <Badge variant="secondary">{selectedChat.role}</Badge>
                    <p className="text-sm text-muted-foreground mt-1">{selectedChat.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="p-3 rounded-xl bg-muted/50">
                    <p className="text-muted-foreground">Status</p>
                    <p className="font-semibold flex items-center gap-1 mt-1">
                      <span className={cn("w-2 h-2 rounded-full", selectedChat.status === "online" ? "bg-green-500" : "bg-gray-400")} />
                      {selectedChat.status === "online" ? "Active Now" : "Offline"}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/50">
                    <p className="text-muted-foreground">Role</p>
                    <p className="font-semibold mt-1 flex items-center gap-1">{ROLE_ICONS[selectedChat.role]} {selectedChat.role}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => { setIsInfoOpen(false); setSelectedChat(null); }}>
                    Close Chat
                  </Button>
                  <Button variant="destructive" className="flex-1" onClick={() => { blockUser(selectedChat.recipientId); setIsInfoOpen(false); }}>
                    <Ban className="w-4 h-4 mr-2" /> Block
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* New Chat Dialog */}
      <Dialog open={isNewChatOpen} onOpenChange={setIsNewChatOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New Conversation</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground -mt-2">
            Chat directly with the seller about your orders
          </p>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input value={newChatSearch}
                onChange={(e) => setNewChatSearch(e.target.value)}
                placeholder="Search users..."
                className="pl-9"
              />
            </div>
            {isUsersLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <ScrollArea className="max-h-72">
                <div className="space-y-1">
                  {filteredUsers.length > 0 ? filteredUsers.map((u) => (
                    <div key={u.id}
                      className={cn(
                        "flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-colors",
                        u.isSeller ? "bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30 hover:bg-amber-100 dark:hover:bg-amber-950/30" : "hover:bg-muted"
                      )}
                      onClick={() => handleStartNewChat(u.id, u)}
                    >
                      <Avatar className={cn("h-10 w-10 rounded-full", ROLE_COLORS[u.role as UserRole] || 'bg-gray-500')}>
                        <AvatarFallback className="rounded-full text-white text-xs font-medium">
                          {(u.name || "??").slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-semibold truncate">{u.name}</p>
                          {u.isSeller && (
                            <Badge variant="secondary" className="text-micro px-1 py-0 h-4 font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-0">
                              <Store className="w-2.5 h-2.5 mr-0.5" /> Seller
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          {ROLE_ICONS[u.role as UserRole]} {u.role}
                        </p>
                      </div>
                    </div>
                  )) : (
                    <p className="text-center text-sm text-muted-foreground py-8">
                      {newChatSearch ? "No users found" : "No users available to message"}
                    </p>
                  )}
                </div>
              </ScrollArea>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={
      <div className="h-[calc(100vh-7rem)] sm:h-[calc(100vh-8rem)] flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    }>
      <MessagesPageContent />
    </Suspense>
  );
}

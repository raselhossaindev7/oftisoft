"use client"
import { AnimatedDiv, AnimatePresence } from "@/lib/animated";

import { useState } from "react";
import { Check, Settings, Inbox, RefreshCw, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/hooks/useNotifications";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { NotificationItem } from "@/components/notifications/notification-item";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function NotificationsPage() {
    const {
        notifications,
        isLoading,
        filter,
        setFilter,
        markAsRead,
        markAllAsRead,
        archive,
        unarchive,
        deleteNotification,
        unreadCount,
        highPriorityCount,
        archivedCount,
        refetch,
        isMarkingAllRead,
    } = useNotifications();

    const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const canMarkAllRead = unreadCount > 0 && !isMarkingAllRead;

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await refetch();
        setIsRefreshing(false);
    };

    const handleDeleteClick = (id: string, title: string) => setDeleteTarget({ id, title });
    const handleConfirmDelete = () => {
        if (deleteTarget) {
            deleteNotification(deleteTarget.id);
            setDeleteTarget(null);
        }
    };

    const tabs = [
        { id: "all" as const, label: "All" },
        { id: "unread" as const, label: "Unread", count: unreadCount },
        { id: "high" as const, label: "High Priority", count: highPriorityCount },
        { id: "archived" as const, label: "Archived", count: archivedCount ?? 0 },
    ];

    const emptyMessage = () => {
        switch (filter) {
            case "unread": return { title: "No unread notifications", subtitle: "You're all caught up." };
            case "high": return { title: "No high priority", subtitle: "No high priority notifications right now." };
            case "archived": return { title: "No archived items", subtitle: "Archived notifications will appear here." };
            default: return { title: "No notifications found", subtitle: "You're all caught up!" };
        }
    };

    return (
        <div className="mx-auto space-y-8 pb-20">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-semibold">Notifications</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        {unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up"}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="ghost"
                        size="sm"
                        onClick={handleRefresh}
                        disabled={isLoading || isRefreshing}
                        className="text-muted-foreground hover:text-primary disabled:opacity-50"
                    >
                        <RefreshCw className={cn("w-4 h-4 mr-2", isRefreshing && "animate-spin")} />
                        Refresh
                    </Button>
                    <Button variant="ghost"
                        size="sm"
                        onClick={() => markAllAsRead()}
                        disabled={!canMarkAllRead}
                        className="text-muted-foreground hover:text-primary disabled:opacity-50"
                    >
                        <Check className="w-4 h-4 mr-2" /> Mark all read
                    </Button>
                    <Link href="/dashboard/settings/notifications">
                        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                            <Settings className="w-4 h-4 mr-2" /> Settings
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-border/50">
                <div className="flex items-center gap-8 overflow-x-auto no-scrollbar">
                    {tabs.map((tab) => {
                        const isActive = filter === tab.id;
                        const count = "count" in tab ? tab.count ?? 0 : 0;
                        return (
                            <button key={tab.id}
                                type="button"
                                onClick={() => setFilter(tab.id)}
                                className={cn(
                                    "pb-4 text-sm font-bold transition-all relative whitespace-nowrap flex items-center gap-2",
                                    isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {tab.label}
                                {count > 0 && (
                                    <span className={cn(
                                            "min-w-5 h-5 px-1.5 rounded-full text-sm font-semibold flex items-center justify-center",
                                            isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                        )}
                                    >
                                        {count > 99 ? "99+" : count}
                                    </span>
                                )}
                                {isActive && (
                                    <AnimatedDiv layoutId="notif-tab"
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* List */}
            <div className="space-y-4 min-h-[400px]">
                {isLoading ? (
                    Array(5).fill(0).map((_, i) => (
                        <div key={i} className="flex items-start gap-4 p-6 rounded-[24px] border border-border/50 bg-card/50">
                            <Skeleton className="w-12 h-12 rounded-full" />
                            <div className="space-y-2 flex-1">
                                <Skeleton className="h-4 max-w-[33%]" />
                                <Skeleton className="h-3 max-w-[66%]" />
                            </div>
                        </div>
                    ))
                ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-24 h-24 bg-muted/20 rounded-full flex items-center justify-center mb-6">
                            <Inbox className="w-10 h-10 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-bold">{emptyMessage().title}</h3>
                        <p className="text-muted-foreground mt-1">{emptyMessage().subtitle}</p>
                    </div>
                ) : (
                    <AnimatePresence mode="popLayout">
                        {notifications.map((notif, i) => (
                            <NotificationItem key={notif.id}
                                notification={notif}
                                filter={filter}
                                onMarkAsRead={markAsRead}
                                onArchive={archive}
                                onUnarchive={unarchive}
                                onDelete={(id, title) => handleDeleteClick(id, title)}
                                index={i}
                            />
                        ))}
                    </AnimatePresence>
                )}
            </div>

            <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <AlertDialogContent className="rounded-2xl border-border/50 max-w-md">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <Trash2 className="w-5 h-5 text-destructive" /> Delete notification?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently remove &quot;{deleteTarget?.title}&quot;. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2 sm:gap-0">
                        <AlertDialogCancel className="rounded-xl font-bold">Cancel</AlertDialogCancel>
                        <AlertDialogAction variant="destructive"
                            className="rounded-xl font-bold bg-destructive text-destructive-foreground"
                            onClick={handleConfirmDelete}
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

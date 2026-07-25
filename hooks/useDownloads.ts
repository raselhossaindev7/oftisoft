import { useState, useCallback, useEffect, useRef } from "react";
import { downloadsAPI, type InventoryItem, type HistoryItem, type NotificationItem } from "@/lib/api/domains/billing";

const PAGE_SIZE = 20;

export function useDownloads() {
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [inventoryTotal, setInventoryTotal] = useState(0);
    const [historyTotal, setHistoryTotal] = useState(0);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const abortRef = useRef<AbortController | null>(null);

    const fetchAll = useCallback(async () => {
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        setIsLoading(true);
        setError(null);
        setIsLoadingMore(false);

        const [inv, hist, notes] = await Promise.allSettled([
            downloadsAPI.getInventory(0, PAGE_SIZE),
            downloadsAPI.getHistory(0, PAGE_SIZE),
            downloadsAPI.getNotifications(),
        ]);

        if (controller.signal.aborted) return;

        let errMsg = '';
        if (inv.status === 'fulfilled') {
            setInventory(inv.value.items);
            setInventoryTotal(inv.value.total);
        } else {
            errMsg = inv.reason?.message || 'Failed to load inventory';
        }

        if (hist.status === 'fulfilled') {
            setHistory(hist.value.items);
            setHistoryTotal(hist.value.total);
        } else {
            errMsg = errMsg || hist.reason?.message || 'Failed to load history';
        }

        if (notes.status === 'fulfilled') {
            setNotifications(notes.value);
        } else {
            errMsg = errMsg || notes.reason?.message || 'Failed to load notifications';
        }

        setError(errMsg || null);
        setIsLoading(false);
    }, []);

    const loadMore = useCallback(async (type: 'inventory' | 'history') => {
        setIsLoadingMore(true);
        if (type === 'inventory') {
            const res = await downloadsAPI.getInventory(inventory.length, PAGE_SIZE);
            setInventory(prev => [...prev, ...res.items]);
            setInventoryTotal(res.total);
        } else {
            const res = await downloadsAPI.getHistory(history.length, PAGE_SIZE);
            setHistory(prev => [...prev, ...res.items]);
            setHistoryTotal(res.total);
        }
        setIsLoadingMore(false);
    }, [inventory.length, history.length]);

    useEffect(() => {
        fetchAll();
        return () => abortRef.current?.abort();
    }, [fetchAll]);

    const recordDownload = async (id: string): Promise<string | null> => {
        const res = await downloadsAPI.recordDownload(id);
        await fetchAll();
        return res.downloadUrl;
    };

    const getVersions = async (productId: string) => {
        try {
            return await downloadsAPI.getVersions(productId);
        } catch {
            return [];
        }
    };

    const getChangelog = async (productId: string) => {
        try {
            return await downloadsAPI.getChangelog(productId);
        } catch {
            return null;
        }
    };

    return {
        inventory, history, notifications, isLoading, isLoadingMore,
        error, isError: !!error,
        inventoryTotal, historyTotal,
        hasMoreInventory: inventory.length < inventoryTotal,
        hasMoreHistory: history.length < historyTotal,
        loadMoreInventory: () => loadMore('inventory'),
        loadMoreHistory: () => loadMore('history'),
        recordDownload, getVersions, getChangelog, refresh: fetchAll,
    };
}

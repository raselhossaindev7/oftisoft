import { useState, useCallback, useEffect, useRef } from "react";
import { favoritesAPI, type FavoriteItem } from "@/lib/api/domains/favorites";
import { toast } from "sonner";

const PAGE_SIZE = 20;

export function useFavorites() {
    const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [total, setTotal] = useState(0);

    const abortRef = useRef<AbortController | null>(null);

    const fetchFavorites = useCallback(async () => {
        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        setIsLoading(true);
        setError(null);
        setIsLoadingMore(false);

        try {
            const data = await favoritesAPI.getFavorites(0, PAGE_SIZE);
            if (controller.signal.aborted) return;
            setFavorites(data.items);
            setTotal(data.total);
        } catch (err: any) {
            if (!controller.signal.aborted) {
                setError(err?.response?.data?.message || err.message || 'Failed to load favorites');
            }
        } finally {
            if (!controller.signal.aborted) {
                setIsLoading(false);
            }
        }
    }, []);

    const loadMore = useCallback(async () => {
        setIsLoadingMore(true);
        try {
            const data = await favoritesAPI.getFavorites(favorites.length, PAGE_SIZE);
            setFavorites(prev => [...prev, ...data.items]);
            setTotal(data.total);
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Failed to load more');
        } finally {
            setIsLoadingMore(false);
        }
    }, [favorites.length]);

    const addToFavorites = async (productId: string) => {
        try {
            await favoritesAPI.addFavorite(productId);
            toast.success("Added to favorites");
            fetchFavorites();
        } catch (err: any) {
            const status = err?.response?.status;
            if (status === 401) toast.error("Sign in to save favorites");
            else if (status === 400) toast.error("This product can't be added to favorites.");
            else toast.error("Failed to add to favorites");
        }
    };

    const removeFromFavorites = async (productId: string) => {
        setFavorites(prev => prev.filter(p => p.id !== productId));
        toast.success("Removed from favorites");
        try {
            await favoritesAPI.removeFavorite(productId);
        } catch {
            setError("Failed to remove from favorites");
            fetchFavorites();
        }
    };

    const checkIsFavorite = async (productId: string) => {
        try {
            const { isFavorite } = await favoritesAPI.checkFavorite(productId);
            return isFavorite;
        } catch {
            return false;
        }
    }

    useEffect(() => {
        fetchFavorites();
        return () => abortRef.current?.abort();
    }, [fetchFavorites]);

    return {
        favorites, total,
        isLoading, isLoadingMore,
        error, isError: !!error,
        hasMore: favorites.length < total,
        loadMore,
        addToFavorites,
        removeFromFavorites,
        checkIsFavorite,
        refresh: fetchFavorites,
    };
}

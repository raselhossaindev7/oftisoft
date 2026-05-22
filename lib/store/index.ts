/**
 * Zustand Global State Management
 * Ultra-fast, lightweight state management with persistence
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

/**
 * User Store - Authentication & User Data
 */
interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'user';
    avatar?: string;
}

interface UserState {
    user: User | null;
    isAuthenticated: boolean;
    setUser: (user: User | null) => void;
    logout: () => void;
}

export const useUserStore = create<UserState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            setUser: (user) => set({ user, isAuthenticated: !!user }),
            logout: () => set({ user: null, isAuthenticated: false }),
        }),
        {
            name: 'user-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);

/**
 * Cart Store - Shopping Cart Management
 */
interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
}

interface CartState {
    items: CartItem[];
    total: number;
    addItem: (item: CartItem) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
    persist(
        immer((set, get) => ({
            items: [],
            total: 0,

            addItem: (item) => set((state) => {
                const existingItem = state.items.find(i => i.id === item.id);
                if (existingItem) {
                    existingItem.quantity += item.quantity;
                } else {
                    state.items.push(item);
                }
                state.total = state.items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
            }),

            removeItem: (id) => set((state) => {
                state.items = state.items.filter(i => i.id !== id);
                state.total = state.items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
            }),

            updateQuantity: (id, quantity) => set((state) => {
                const item = state.items.find(i => i.id === id);
                if (item) {
                    item.quantity = quantity;
                    if (quantity <= 0) {
                        state.items = state.items.filter(i => i.id !== id);
                    }
                }
                state.total = state.items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
            }),

            clearCart: () => set({ items: [], total: 0 }),

            getItemCount: () => {
                return get().items.reduce((sum, item) => sum + item.quantity, 0);
            },
        })),
        {
            name: 'cart-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);

/**
 * UI Store - Global UI State (Sidebar, Modals, etc.)
 */
interface UIState {
    sidebarOpen: boolean;
    theme: 'light' | 'dark' | 'system';
    activeModal: string | null;
    toggleSidebar: () => void;
    setSidebarOpen: (open: boolean) => void;
    setTheme: (theme: 'light' | 'dark' | 'system') => void;
    openModal: (modalId: string) => void;
    closeModal: () => void;
}

export const useUIStore = create<UIState>()(
    persist(
        (set) => ({
            sidebarOpen: true,
            theme: 'system',
            activeModal: null,

            toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
            setSidebarOpen: (open) => set({ sidebarOpen: open }),
            setTheme: (theme) => set({ theme }),
            openModal: (modalId) => set({ activeModal: modalId }),
            closeModal: () => set({ activeModal: null }),
        }),
        {
            name: 'ui-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);

/**
 * Filters Store - Search & Filter State
 */
interface FiltersState {
    searchQuery: string;
    category: string | null;
    priceRange: [number, number];
    sortBy: 'name' | 'price' | 'date';
    sortOrder: 'asc' | 'desc';
    setSearchQuery: (query: string) => void;
    setCategory: (category: string | null) => void;
    setPriceRange: (range: [number, number]) => void;
    setSortBy: (sortBy: 'name' | 'price' | 'date') => void;
    setSortOrder: (order: 'asc' | 'desc') => void;
    resetFilters: () => void;
}

export const useFiltersStore = create<FiltersState>((set) => ({
    searchQuery: '',
    category: null,
    priceRange: [0, 10000],
    sortBy: 'date',
    sortOrder: 'desc',

    setSearchQuery: (query) => set({ searchQuery: query }),
    setCategory: (category) => set({ category }),
    setPriceRange: (range) => set({ priceRange: range }),
    setSortBy: (sortBy) => set({ sortBy }),
    setSortOrder: (order) => set({ sortOrder: order }),
    resetFilters: () => set({
        searchQuery: '',
        category: null,
        priceRange: [0, 10000],
        sortBy: 'date',
        sortOrder: 'desc',
    }),
}));

/**
 * Notifications Store - Toast & Alert Management
 */
interface Notification {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    timestamp: number;
}

interface NotificationsState {
    notifications: Notification[];
    addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
    removeNotification: (id: string) => void;
    clearNotifications: () => void;
}

export const useNotificationsStore = create<NotificationsState>()(
    immer((set) => ({
        notifications: [],

        addNotification: (notification) => set((state) => {
            state.notifications.push({
                ...notification,
                id: Math.random().toString(36).substr(2, 9),
                timestamp: Date.now(),
            });
            // Auto-remove after 5 seconds
            setTimeout(() => {
                set((state) => {
                    state.notifications = state.notifications.filter(
                        n => n.timestamp > Date.now() - 5000
                    );
                });
            }, 5000);
        }),

        removeNotification: (id) => set((state) => {
            state.notifications = state.notifications.filter(n => n.id !== id);
        }),

        clearNotifications: () => set({ notifications: [] }),
    }))
);

/**
 * Preferences Store - User Preferences
 */
interface PreferencesState {
    currency: 'USD' | 'BDT';
    notifications: {
        email: boolean;
        push: boolean;
        sms: boolean;
    };
    setCurrency: (currency: 'USD' | 'BDT') => void;
    updateNotificationPreference: (type: 'email' | 'push' | 'sms', enabled: boolean) => void;
}

export const usePreferencesStore = create<PreferencesState>()(
    persist(
        (set) => ({
            currency: 'USD',
            notifications: {
                email: true,
                push: true,
                sms: false,
            },

            setCurrency: (currency) => set({ currency }),
            updateNotificationPreference: (type, enabled) => set((state) => ({
                notifications: {
                    ...state.notifications,
                    [type]: enabled,
                },
            })),
        }),
        {
            name: 'preferences-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);

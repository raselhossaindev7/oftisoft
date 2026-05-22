/**
 * Navbar Content Store
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export interface NavLink {
    id: string;
    label: string;
    href: string;
    isExternal?: boolean;
}

export interface NavbarContent {
    brandName: string;
    links: NavLink[];
    showCart: boolean;
    ctaText: string;
    ctaHref: string;
    lastUpdated: string;
}

interface NavbarContentState {
    content: NavbarContent | null;
    isSaving: boolean;
    setContent: (content: NavbarContent) => void;
    updateBranding: (brandName: string) => void;
    updateLinks: (links: NavLink[]) => void;
    updateCTA: (text: string, href: string) => void;
    toggleCart: (show: boolean) => void;
    setSaving: (saving: boolean) => void;
    resetToDefaults: () => void;
}

const defaultContent: NavbarContent = {
    brandName: 'Oftisoft',
    links: [
        { id: '1', label: 'Home', href: '/' },
        { id: '2', label: 'About', href: '/about' },
        { id: '3', label: 'Services', href: '/services' },
        { id: '4', label: 'Shop', href: '/shop' },
        { id: '5', label: 'Portfolio', href: '/portfolio' },
        { id: '6', label: 'Blog', href: '/blog' },
        { id: '7', label: 'Support', href: '/support' },
    ],
    showCart: true,
    ctaText: 'Get Started',
    ctaHref: '/register',
    lastUpdated: new Date().toISOString(),
};

export const useNavbarContentStore = create<NavbarContentState>()(
    persist(
        immer((set) => ({
    content: null,
            isSaving: false,

            setContent: (content) => set({ content }),

            updateBranding: (brandName) => set((state) => {
                if (state.content) {
                    state.content.brandName = brandName;
                    state.content.lastUpdated = new Date().toISOString();
                }
            }),

            updateLinks: (links) => set((state) => {
                if (state.content) {
                    state.content.links = links;
                    state.content.lastUpdated = new Date().toISOString();
                }
            }),

            updateCTA: (text, href) => set((state) => {
                if (state.content) {
                    state.content.ctaText = text;
                    state.content.ctaHref = href;
                    state.content.lastUpdated = new Date().toISOString();
                }
            }),

            toggleCart: (show) => set((state) => {
                if (state.content) {
                    state.content.showCart = show;
                    state.content.lastUpdated = new Date().toISOString();
                }
            }),

            setSaving: (saving) => set({ isSaving: saving }),

            resetToDefaults: () => set({ content: null }),
        })),
        {
            name: 'navbar-content-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);

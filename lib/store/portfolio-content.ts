import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export interface ProjectItem {
    id: string;
    slug?: string;
    title: string;
    category: string;
    image: string | null;
    tags: string[];
    description: string;
    longDescription: string;
    client: string;
    stats: { label: string; value: string }[];
    gradient: string;
    url?: string;
    github?: string;
}

export interface PortfolioPageContent {
    header: {
        badge: string;
        title: string;
        description: string;
        videoUrl?: string;
    };
    projects: ProjectItem[];
    lastUpdated: string;
}

interface PortfolioContentState {
    content: PortfolioPageContent | null;
    isLoading: boolean;
    isSaving: boolean;
    error: string | null;
    setContent: (content: PortfolioPageContent) => void;
    updateHeader: (header: Partial<PortfolioPageContent['header']>) => void;
    addProject: (item: ProjectItem) => void;
    updateProject: (id: string, item: Partial<ProjectItem>) => void;
    deleteProject: (id: string) => void;
    resetToDefaults: () => void;
}

export const defaultContent: PortfolioPageContent = {
    header: {
        badge: "World Class Engineering",
        title: "Our Work",
        description: "We build digital products that scale. Explore our portfolio of applications and systems delivered for clients worldwide.",
        videoUrl: ""
    },
    projects: [
        {
            id: "proj-1",
            slug: "proj-1",
            title: "EcoSmart E-commerce",
            category: "Ecommerce",
            image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&auto=format&fit=crop&q=80",
            url: "#",
            tags: ["Next.js", "Stripe", "Tailwind", "Redis"],
            description: "A sustainable fashion marketplace with real-time inventory and personalized recommendations.",
            longDescription: "EcoSmart is a pioneering e-commerce platform dedicated to sustainable fashion. We engineered a real-time inventory system using Redis and developed a personalized recommendation engine that increased conversion rates by 40%.",
            client: "EcoLife Inc.",
            stats: [{ label: "Conversion", value: "+40%" }, { label: "Products", value: "50k+" }],
            gradient: "from-emerald-500/20 to-teal-500/20"
        },
        {
            id: "proj-2",
            slug: "proj-2",
            title: "FinTech Analytics Core",
            category: "Enterprise",
            image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80",
            url: "#",
            tags: ["React", "D3.js", "Node.js", "GraphQL"],
            description: "High-performance dashboard processing millions of transactions with sub-50ms latency.",
            longDescription: "Built for high-frequency trading firms, this dashboard visualizes millions of data points in real-time without rendering lag. Utilizes WebWorkers and canvas-based rendering for maximum performance.",
            client: "FinanceFlow",
            stats: [{ label: "Latency", value: "<50ms" }, { label: "Users", value: "50k" }],
            gradient: "from-blue-600/20 to-indigo-600/20"
        },
        {
            id: "proj-3",
            slug: "proj-3",
            title: "Nexus AI Assistant",
            category: "AI",
            image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop&q=80",
            url: "#",
            tags: ["Python", "LangChain", "FastAPI", "Pinecone"],
            description: "Customer service automation handling 80% of inquiries with context-aware responses.",
            longDescription: "A context-aware AI agent that integrates with existing helpdesk categories. It uses RAG (Retrieval Augmented Generation) to provide accurate answers based on company knowledge bases.",
            client: "TechHelp",
            stats: [{ label: "Automation", value: "80%" }, { label: "Response Time", value: "<5s" }],
            gradient: "from-purple-600/20 to-pink-600/20"
        },
        {
            id: "proj-4",
            slug: "proj-4",
            title: "Nomad Travel App",
            category: "Mobile",
            image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&auto=format&fit=crop&q=80",
            url: "#",
            tags: ["React Native", "Firebase", "Google Maps"],
            description: "Cross-platform mobile app for offline travel planning with automatic sync.",
            longDescription: "Designed for digital nomads, this app features robust offline-first architecture. Syncs data automatically when connection is restored, ensuring seamless travel planning in remote areas.",
            client: "GoTravel",
            stats: [{ label: "Downloads", value: "100k+" }, { label: "Rating", value: "4.8" }],
            gradient: "from-orange-500/20 to-yellow-500/20"
        },
        {
            id: "proj-5",
            slug: "proj-5",
            title: "MediCare Portal",
            category: "Enterprise",
            image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80",
            url: "#",
            tags: ["Next.js", "PostgreSQL", "HIPAA", "Docker"],
            description: "Secure HIPAA-compliant patient management system for hospital networks.",
            longDescription: "A HIPAA-compliant platform connecting patients with doctors. Features end-to-end encryption for all medical records and a highly accessible UI for elderly patients.",
            client: "MediCare",
            stats: [{ label: "Efficiency", value: "+45%" }, { label: "Patients", value: "10k+" }],
            gradient: "from-cyan-500/20 to-blue-500/20"
        },
        {
            id: "proj-6",
            slug: "proj-6",
            title: "Chronos Luxury",
            category: "Web",
            image: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=800&auto=format&fit=crop&q=80",
            url: "#",
            tags: ["GSAP", "Three.js", "WebGL", "Blender"],
            description: "Award-winning immersive 3D website for luxury watch brand with interactive product showcase.",
            longDescription: "To capture the craftsmanship of luxury timepieces, we built a fully 3D interactive product showcase using Three.js and WebGL. The result is a showroom experience in the browser.",
            client: "Chronos",
            stats: [{ label: "Visitors", value: "500k" }, { label: "Engagement", value: "+120%" }],
            gradient: "from-amber-600/20 to-red-600/20"
        }
    ],
    lastUpdated: new Date().toISOString()
};

export const usePortfolioContentStore = create<PortfolioContentState>()(
    persist(
        immer((set) => ({
            content: null,
            isLoading: false,
            isSaving: false,
            error: null,
            setContent: (content) => set({ content: { ...content, lastUpdated: new Date().toISOString() } }),
            updateHeader: (header) => set((state) => {
                if (state.content) {
                    state.content.header = { ...state.content.header, ...header };
                    state.content.lastUpdated = new Date().toISOString();
                }
            }),
            addProject: (item) => set((state) => {
                if (state.content) {
                    state.content.projects.push(item);
                    state.content.lastUpdated = new Date().toISOString();
                }
            }),
            updateProject: (id, item) => set((state) => {
                if (state.content) {
                    const index = state.content.projects.findIndex(p => p.id === id);
                    if (index !== -1) {
                        state.content.projects[index] = { ...state.content.projects[index], ...item };
                        state.content.lastUpdated = new Date().toISOString();
                    }
                }
            }),
            deleteProject: (id) => set((state) => {
                if (state.content) {
                    state.content.projects = state.content.projects.filter(p => p.id !== id);
                    state.content.lastUpdated = new Date().toISOString();
                }
            }),
            resetToDefaults: () => set({ content: null })
        })),
        { name: 'portfolio-content-storage', storage: createJSONStorage(() => localStorage) }
    )
);

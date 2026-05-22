/**
 * Home Page Content Store
 * Manages all home page sections with persistence
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// Section Types
export interface HeroSection {
    id: string;
    title: string;
    subtitle: string;
    description: string;
    badge: string;
    primaryCTA: {
        text: string;
        link: string;
    };
    secondaryCTA: {
        text: string;
        link: string;
    };
    stats?: {
        value: number;
        suffix: string;
        label: string;
    }[];
    backgroundImage?: string;
    backgroundVideo?: string;
    subtitles?: string[]; // Multiple words for typewriter
    enabled: boolean;
}

export interface ServiceCard {
    id: string;
    title: string;
    description: string;
    icon: string;
    tags: string[];
    gradient: string;
    color?: string;
    link?: string;
    features?: string[];
}

export interface ServicesSection {
    id: string;
    title: string;
    subtitle: string;
    badge: string;
    services: ServiceCard[];
    enabled: boolean;
}

export interface ProjectCard {
    id: string;
    title: string;
    description: string;
    category: string;
    imageGradient: string;
    tech: string[];
    stats: { label: string; value: string }[];
    year: string;
}

export interface ProjectsSection {
    id: string;
    title: string;
    subtitle: string;
    badge: string;
    projects: ProjectCard[];
    enabled: boolean;
}

export interface WhyUsFeature {
    id?: string;
    title: string;
    description: string;
    icon: string;
    color: string;
    gradient: string;
    stat: string;
    statLabel: string;
}

export interface WhyUsStat {
    value: string;
    label: string;
}

export interface WhyUsSection {
    id: string;
    title: string;
    subtitle: string;
    badge: string;
    description: string;
    features: WhyUsFeature[];
    stats: WhyUsStat[];
    enabled: boolean;
}

export interface ProcessStep {
    id: string;
    number: number;
    title: string;
    description: string;
    icon: string;
    gradient: string;
}

export interface ProcessSection {
    id: string;
    title: string;
    subtitle: string;
    badge: string;
    steps: ProcessStep[];
    enabled: boolean;
}

export interface Testimonial {
    id?: string;
    name: string;
    role: string;
    company?: string;
    avatar: string;
    quote: string;
    content?: string;
    gradient: string;
    rating?: number;
}

export interface TestimonialsSection {
    id: string;
    title: string;
    subtitle: string;
    badge: string;
    testimonials: Testimonial[];
    enabled: boolean;
}

export interface TechItem {
    id?: string;
    name: string;
    icon: string;
    color: string;
    category?: string;
}

export interface TechStackSection {
    id: string;
    title: string;
    subtitle: string;
    badge: string;
    technologies: TechItem[];
    enabled: boolean;
}

export interface BlogPost {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    category: string;
    date: string;
    readTime: string;
    gradient: string;
    image?: string;
    author?: {
        name: string;
        avatar: string;
    };
    link?: string;
}

export interface BlogSection {
    id: string;
    title: string;
    subtitle: string;
    badge: string;
    posts: BlogPost[];
    enabled: boolean;
}

export interface CTASection {
    id: string;
    title: string;
    description: string;
    buttonText: string;
    buttonLink: string;
    backgroundImage?: string;
    contactInfo?: {
        email: string;
        phone: string;
        location: string;
    };
    enabled: boolean;
}

export interface SEOMetadata {
    title: string;
    description: string;
    keywords: string[];
    ogImage: string;
    ogTitle: string;
    ogDescription: string;
    twitterCard: string;
    canonicalUrl: string;
}

export interface ContentRevision {
    id: string;
    timestamp: Date;
    author: string;
    description: string;
    changes: {
        field: string;
        oldValue: string;
        newValue: string;
    }[];
    data: HomePageContent;
}

export interface HomePageContent {
    hero: HeroSection;
    services: ServicesSection;
    projects: ProjectsSection;
    whyUs: WhyUsSection;
    process: ProcessSection;
    testimonials: TestimonialsSection;
    techStack: TechStackSection;
    blog: BlogSection;
    cta: CTASection;
    seo: SEOMetadata;
    lastUpdated: string;
    publishedAt?: string;
    status: 'draft' | 'published';
    revisions?: ContentRevision[];
    currentRevisionId?: string;
}

interface HomeContentState {
    content: HomePageContent | null;
    isLoading: boolean;
    isSaving: boolean;
    error: string | null;

    // Actions
    setContent: (content: HomePageContent) => void;
    updateSection: <K extends keyof HomePageContent>(
        section: K,
        data: Partial<HomePageContent[K]>
    ) => void;
    toggleSection: (section: keyof Omit<HomePageContent, 'seo' | 'lastUpdated' | 'publishedAt' | 'status' | 'revisions' | 'currentRevisionId'>) => void;
    updateSEO: (seo: Partial<SEOMetadata>) => void;
    setStatus: (status: 'draft' | 'published') => void;
    setLoading: (loading: boolean) => void;
    setSaving: (saving: boolean) => void;
    setError: (error: string | null) => void;

    // Revision methods
    saveRevision: (description: string, author: string) => void;
    restoreRevision: (revisionId: string) => void;
    deleteRevision: (revisionId: string) => void;
    getRevisions: () => ContentRevision[];

    reset: () => void;
}

const defaultContent: HomePageContent = {
    hero: {
        id: 'hero-1',
        title: 'Future-Ready',
        subtitle: 'Digital Solutions.',
        description: 'We engineer premium software experiences that redefine industries. Built for performance, scalability, and impact.',
        badge: 'Accepting New Projects',
        primaryCTA: { text: 'Start Project', link: '/#contact' },
        secondaryCTA: { text: 'Showreel', link: '/portfolio' },
        stats: [
            { value: 500, suffix: '+', label: 'Projects Completed' },
            { value: 98, suffix: '%', label: 'Client Satisfaction' },
            { value: 6, suffix: 'Y', label: 'Years Experience' }
        ],
        subtitles: ["Digital Solutions.", "Web Architecture.", "AI Innovation.", "SaaS Platforms."],
        enabled: true,
    },
    services: {
        id: 'services-1',
        title: 'Engineering the',
        subtitle: 'Digital Future',
        badge: 'Capabilities',
        services: [
            {
                id: 'svc-1',
                title: 'Web Development',
                description: 'Lightning-fast, SEO-optimized web applications built with Next.js, React, and cutting-edge frameworks.',
                icon: 'Globe',
                tags: ['Next.js', 'React', 'TypeScript'],
                gradient: 'from-blue-500 to-cyan-500',
                color: 'text-blue-400'
            },
            {
                id: 'svc-2',
                title: 'Mobile Apps',
                description: 'Native iOS and Android apps with React Native. Beautiful, performant, and scalable.',
                icon: 'Smartphone',
                tags: ['React Native', 'iOS', 'Android'],
                gradient: 'from-purple-500 to-pink-500',
                color: 'text-purple-400'
            },
            {
                id: 'svc-3',
                title: 'AI Integration',
                description: 'Leverage GPT-4, Claude, and custom ML models to automate workflows and enhance user experiences.',
                icon: 'Cpu',
                tags: ['OpenAI', 'Machine Learning', 'Automation'],
                gradient: 'from-green-500 to-emerald-500',
                color: 'text-green-400'
            },
            {
                id: 'svc-4',
                title: 'Cloud Infrastructure',
                description: 'Serverless architectures on AWS, Vercel, and Cloudflare. Auto-scaling, cost-optimized, and secure.',
                icon: 'Cloud',
                tags: ['AWS', 'Serverless', 'DevOps'],
                gradient: 'from-orange-500 to-red-500',
                color: 'text-orange-400'
            }
        ],
        enabled: true,
    },
    projects: {
        id: 'projects-1',
        title: 'Building the',
        subtitle: 'Impossible.',
        badge: 'Selected Work',
        projects: [
            {
                id: 'proj-1',
                title: 'FinTech Dashboard',
                description: 'Real-time trading platform handling $2B+ daily volume',
                category: 'Finance',
                imageGradient: 'from-blue-600 via-indigo-600 to-violet-600',
                tech: ['Next.js', 'WebSocket', 'Redis'],
                stats: [
                    { label: 'Users', value: '50K+' },
                    { label: 'Uptime', value: '99.9%' }
                ],
                year: '2025'
            },
            {
                id: 'proj-2',
                title: 'AI Content Studio',
                description: 'GPT-powered content generation platform for enterprises',
                category: 'AI/ML',
                imageGradient: 'from-purple-600 via-pink-600 to-rose-600',
                tech: ['OpenAI', 'Python', 'FastAPI'],
                stats: [
                    { label: 'Generated', value: '1M+ Posts' },
                    { label: 'Accuracy', value: '94%' }
                ],
                year: '2025'
            },
            {
                id: 'proj-3',
                title: 'E-Commerce Platform',
                description: 'Headless commerce solution with AR product previews',
                category: 'E-Commerce',
                imageGradient: 'from-green-600 via-emerald-600 to-teal-600',
                tech: ['Shopify', 'Three.js', 'Stripe'],
                stats: [
                    { label: 'Revenue', value: '$5M+' },
                    { label: 'Conversion', value: '+45%' }
                ],
                year: '2024'
            }
        ],
        enabled: true,
    },
    whyUs: {
        id: 'whyus-1',
        title: 'Why Visionaries',
        subtitle: 'Choose Us.',
        badge: 'The Oftisoft Edge',
        description: 'We bridge the gap between creative ambition and technical reality.',
        features: [
            {
                title: 'Top 1% Talent Network',
                description: 'Access a curated team of elite engineers, designers, and strategists. We hire only the best to ensure your product is world-class.',
                icon: 'Users',
                color: 'text-blue-500',
                gradient: 'from-blue-500/20 to-blue-600/5',
                stat: '10k+',
                statLabel: 'Dev Hours'
            },
            {
                title: 'Agile Rapid Delivery',
                description: 'Our streamlined CI/CD pipelines and agile methodologies ensure we ship features 2x faster than traditional agencies.',
                icon: 'Zap',
                color: 'text-yellow-500',
                gradient: 'from-yellow-500/20 to-orange-600/5',
                stat: '2x',
                statLabel: 'Faster'
            },
            {
                title: 'Enterprise Architecture',
                description: 'Built for scale from day one. We use microservices and serverless tech that can handle millions of users without breaking.',
                icon: 'Cpu',
                color: 'text-purple-500',
                gradient: 'from-purple-500/20 to-indigo-600/5',
                stat: '99.99%',
                statLabel: 'Uptime'
            },
            {
                title: 'Dedicated 24/7 Support',
                description: 'We don\'t just launch and leave. Our global support team monitors your infrastructure around the clock for peace of mind.',
                icon: 'Shield',
                color: 'text-green-500',
                gradient: 'from-green-500/20 to-emerald-600/5',
                stat: '15min',
                statLabel: 'Response'
            }
        ],
        stats: [
            { value: '98%', label: 'Retention' },
            { value: '150+', label: 'Launches' },
            { value: 'Top 3%', label: 'Global Talent' }
        ],
        enabled: true,
    },
    process: {
        id: 'process-1',
        title: 'From Concept to',
        subtitle: 'Reality.',
        badge: 'How We Work',
        steps: [
            {
                id: 'step-1',
                number: 1,
                title: 'Discovery & Strategy',
                description: 'We dive deep into your business goals, user needs, and market landscape to build a blueprint for success.',
                icon: 'Search',
                gradient: 'from-blue-500 to-cyan-500'
            },
            {
                id: 'step-2',
                number: 2,
                title: 'UX/UI Design',
                description: 'Crafting intuitive, high-fidelity prototypes. We focus on user journeys that convert visitors into loyal customers.',
                icon: 'PenTool',
                gradient: 'from-purple-500 to-pink-500'
            },
            {
                id: 'step-3',
                number: 3,
                title: 'Development Sprint',
                description: 'Agile development with weekly demos. You see progress in real-time and can course-correct instantly.',
                icon: 'Code2',
                gradient: 'from-green-500 to-emerald-500'
            },
            {
                id: 'step-4',
                number: 4,
                title: 'Testing & QA',
                description: 'Rigorous automated and manual testing. We catch bugs before your users do.',
                icon: 'CheckCircle2',
                gradient: 'from-orange-500 to-red-500'
            },
            {
                id: 'step-5',
                number: 5,
                title: 'Launch & Scale',
                description: 'Smooth deployment with zero downtime. Post-launch monitoring and optimization for peak performance.',
                icon: 'Rocket',
                gradient: 'from-pink-500 to-rose-500'
            },
            {
                id: 'step-6',
                number: 6,
                title: 'Growth & Support',
                description: 'Ongoing maintenance, feature updates, and analytics-driven improvements to maximize ROI.',
                icon: 'BarChart3',
                gradient: 'from-cyan-500 to-blue-500'
            }
        ],
        enabled: true,
    },
    testimonials: {
        id: 'testimonials-1',
        title: 'Voices of',
        subtitle: 'Innovation.',
        badge: 'Trusted by Market Leaders',
        testimonials: [
            {
                name: 'Alex Rivera',
                role: 'CTO, FinTech Global',
                avatar: 'https://i.pravatar.cc/150?u=alex',
                quote: 'Oftisoft\'s architecture handled our Black Friday traffic without a single hiccup. Absolute engineering mastery.',
                gradient: 'from-blue-500 to-indigo-500'
            },
            {
                name: 'Jessica Chen',
                role: 'Product Lead, Nexus AI',
                avatar: 'https://i.pravatar.cc/150?u=jessica',
                quote: 'They didn\'t just build what we asked for. They anticipated what we needed 6 months down the line.',
                gradient: 'from-purple-500 to-pink-500'
            },
            {
                name: 'Marcus Thorne',
                role: 'Founder, Zenith',
                avatar: 'https://i.pravatar.cc/150?u=marcus',
                quote: 'The level of polish in the UI/UX is unmatched. Best dev agency I\'ve worked with in a decade.',
                gradient: 'from-green-500 to-emerald-500'
            },
            {
                name: 'Sarah Jenkins',
                role: 'Director, Creative Pulse',
                avatar: 'https://i.pravatar.cc/150?u=sarah',
                quote: 'Incredible attention to detail. The animations and micro-interactions make our app feel alive.',
                gradient: 'from-orange-500 to-amber-500'
            },
            {
                name: 'David Kim',
                role: 'VP Eng, CloudScale',
                avatar: 'https://i.pravatar.cc/150?u=david',
                quote: 'Scalable, secure, and delivered early. Their DevOps game is strong.',
                gradient: 'from-cyan-500 to-blue-500'
            }
        ],
        enabled: true,
    },
    techStack: {
        id: 'techstack-1',
        title: 'Powered By Modern Tech',
        subtitle: 'Tech Stack',
        badge: 'Powered By Modern Tech',
        technologies: [
            { name: 'Next.js 14', icon: 'Globe', color: 'text-white' },
            { name: 'React', icon: 'Code2', color: 'text-blue-400' },
            { name: 'TypeScript', icon: 'Code2', color: 'text-blue-500' },
            { name: 'Tailwind', icon: 'Layers', color: 'text-cyan-400' },
            { name: 'Framer', icon: 'Zap', color: 'text-pink-500' },
            { name: 'Node.js', icon: 'Server', color: 'text-green-500' },
            { name: 'PostgreSQL', icon: 'Database', color: 'text-blue-300' },
            { name: 'MongoDB', icon: 'Database', color: 'text-green-400' },
            { name: 'Redis', icon: 'Layers', color: 'text-red-500' },
            { name: 'Docker', icon: 'Box', color: 'text-blue-500' },
            { name: 'AWS', icon: 'Cloud', color: 'text-orange-500' },
            { name: 'Rust', icon: 'Terminal', color: 'text-orange-400' },
            { name: 'Python', icon: 'Terminal', color: 'text-yellow-400' }
        ],
        enabled: true,
    },
    blog: {
        id: 'blog-1',
        title: 'Insights from the',
        subtitle: 'Bleeding Edge.',
        badge: 'Thought Leadership',
        posts: [
            {
                id: 'post-1',
                slug: 'ai-web-dev',
                title: 'The Agentic Web: How AI is Rewriting the Frontend',
                excerpt: 'Why traditional UI components are being replaced by generative interfaces that adapt to user intent in real-time.',
                category: 'Deep Tech',
                date: 'Oct 15, 2026',
                readTime: '5 min',
                gradient: 'from-blue-600 via-indigo-600 to-violet-600'
            },
            {
                id: 'post-2',
                slug: 'nextjs-optimization',
                title: 'Server Components at Scale: Lessons from 10M Users',
                excerpt: 'How we reduced our Next.js bundle size by 60% and achieved sub-200ms TTFB globally.',
                category: 'Performance',
                date: 'Sep 28, 2026',
                readTime: '8 min',
                gradient: 'from-purple-600 via-pink-600 to-rose-600'
            },
            {
                id: 'post-3',
                slug: 'serverless-architecture',
                title: 'Why We Ditched Kubernetes for Serverless (And Never Looked Back)',
                excerpt: 'The economics and developer experience of going fully serverless with Cloudflare Workers and Vercel Edge.',
                category: 'Architecture',
                date: 'Sep 12, 2026',
                readTime: '6 min',
                gradient: 'from-green-600 via-emerald-600 to-teal-600'
            }
        ],
        enabled: true,
    },
    cta: {
        id: 'cta-1',
        title: 'Ready to Start Your Project?',
        description: 'Let\'s discuss how we can help you achieve your goals.',
        buttonText: 'Get in Touch',
        buttonLink: '/contact',
        contactInfo: {
            email: 'oftisoft@gmail.com',
            phone: '+8801757220402',
            location: 'San Francisco, CA'
        },
        enabled: true,
    },
    seo: {
        title: 'Oftisoft - Premium Software Solutions',
        description: 'Transform your digital vision into reality with modern, high-performance software solutions.',
        keywords: ['software development', 'web development', 'mobile apps', 'custom software'],
        ogImage: '/og-image.svg',
        ogTitle: 'Oftisoft - Premium Software Solutions',
        ogDescription: 'Transform your digital vision into reality with modern, high-performance software solutions.',
        twitterCard: 'summary_large_image',
        canonicalUrl: 'https://oftisoft.com',
    },
    lastUpdated: new Date().toISOString(),
    status: 'draft',
};

export const useHomeContentStore = create<HomeContentState>()(
    persist(
        immer((set) => ({
            content: null,
            isLoading: false,
            isSaving: false,
            error: null,

            setContent: (content) => set((state) => {
                state.content = { ...content, lastUpdated: new Date().toISOString() };
            }),

            updateSection: (section, data) => set((state) => {
                if (state.content) {
                    const current = state.content[section] as Record<string, unknown>;
                    (state.content as Record<string, unknown>)[section] = { ...current, ...data };
                    state.content.lastUpdated = new Date().toISOString();
                }
            }),

            toggleSection: (section) => set((state) => {
                if (state.content && section in state.content) {
                    const sectionData = state.content[section] as any;
                    if ('enabled' in sectionData) {
                        sectionData.enabled = !sectionData.enabled;
                        state.content.lastUpdated = new Date().toISOString();
                    }
                }
            }),

            updateSEO: (seo) => set((state) => {
                if (state.content) {
                    state.content.seo = { ...state.content.seo, ...seo };
                    state.content.lastUpdated = new Date().toISOString();
                }
            }),

            setStatus: (status) => set((state) => {
                if (state.content) {
                    state.content.status = status;
                    if (status === 'published') {
                        state.content.publishedAt = new Date().toISOString();
                    }
                    state.content.lastUpdated = new Date().toISOString();
                }
            }),

            setLoading: (loading) => set({ isLoading: loading }),
            setSaving: (saving) => set({ isSaving: saving }),
            setError: (error) => set({ error }),

            // Revision methods
            saveRevision: (description, author) => set((state) => {
                if (state.content) {
                    const revisionId = `rev-${Date.now()}`;
                    const newRevision: ContentRevision = {
                        id: revisionId,
                        timestamp: new Date(),
                        author,
                        description,
                        changes: [], // TODO: Calculate actual changes
                        data: JSON.parse(JSON.stringify(state.content)) // Deep clone
                    };

                    state.content.revisions = [newRevision, ...(state.content.revisions || [])].slice(0, 50); // Keep last 50
                    state.content.currentRevisionId = revisionId;
                }
            }),

            restoreRevision: (revisionId) => set((state) => {
                if (state.content && state.content.revisions) {
                    const revision = state.content.revisions.find(r => r.id === revisionId);
                    if (revision) {
                        // Save current state as a new revision before restoring
                        const currentRevision: ContentRevision = {
                            id: `rev-${Date.now()}`,
                            timestamp: new Date(),
                            author: 'System',
                            description: 'Auto-saved before restore',
                            changes: [],
                            data: JSON.parse(JSON.stringify(state.content))
                        };

                        const restoredData = JSON.parse(JSON.stringify(revision.data));
                        restoredData.revisions = [currentRevision, ...(state.content.revisions || [])].slice(0, 50);
                        restoredData.currentRevisionId = revisionId;
                        restoredData.lastUpdated = new Date().toISOString();

                        state.content = restoredData;
                    }
                }
            }),

            deleteRevision: (revisionId) => set((state) => {
                if (state.content && state.content.revisions) {
                    state.content.revisions = state.content.revisions.filter(r => r.id !== revisionId);
                }
            }),

            getRevisions: (): ContentRevision[] => [],

            reset: () => set({ content: null, error: null }),
        })),
        {
            name: 'home-content-storage',
            storage: createJSONStorage(() => localStorage),
            skipHydration: true,
        }
    )
);

// Helper function to get revisions (avoids circular reference in store)
export const getHomeContentRevisions = (): ContentRevision[] => {
    const state = useHomeContentStore.getState();
    return state.content?.revisions || [];
};


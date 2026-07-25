
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

// Types for different sections of the services page

export interface ServiceItem {
    id: string;
    label: string;
    iconName: string;
    iconImage?: string;
    gradient: string;
    title: string;
    subtitle?: string;
    description: string;
    features: { iconName: string; title: string; desc: string }[];
    techs?: string[];
}

export interface ComparisonTier {
    id: string;
    name: string;
    price: string;
    description: string;
    iconName: string;
    color: string;
    highlight: boolean;
    features: (boolean | string)[];
    btnVariant?: string;
}

export interface ComparisonFeature {
    name: string;
    tooltip: string;
}

export interface ServicePackage {
    id: string;
    name: string;
    price: number | string;
    monthlyPrice: number | string;
    description: string;
    features: string[];
    highlight: boolean;
    iconName: string;
    gradient: string;
}

export interface ProcessStep {
    id: number;
    title: string;
    desc: string;
    iconName: string;
    color: string;
}

export interface FAQItem {
    id: string;
    category: string;
    question: string;
    answer: string;
}

export interface TechCategory {
    id: string;
    label: string;
    iconName: string;
    description: string;
    techs: string[];
}

export interface ServiceTier {
    name: string;
    price: number;
    deliveryTime: string;
    description: string;
    features: string[];
    revisions: number | "Unlimited";
}

export interface ServiceOffer {
    id: string;
    title: string;
    description: string;
    category: string;
    subcategory: string;
    rating: number;
    reviewCount: number;
    orderCount: number;
    image: string;
    techs: string[];
    featured: boolean;
    trending: boolean;
    createdAt: string;
    tiers: ServiceTier[];
    faqs: { question: string; answer: string }[];
}

export interface ServicesPageContent {
    heroVideoUrl?: string;
    overview: ServiceItem[];
    comparison: {
        features: ComparisonFeature[];
        tiers: ComparisonTier[];
    };
    packages: ServicePackage[];
    process: ProcessStep[];
    startId: number; // to sync process step IDs if needed
    faqs: FAQItem[];
    techStack: TechCategory[];
    offers: ServiceOffer[];
    lastUpdated: string;
}

interface ServicesContentState {
    content: ServicesPageContent | null;
    isLoading: boolean;
    isSaving: boolean;
    error: string | null;

    // Actions
    setContent: (content: ServicesPageContent) => void;
    updateHeroVideo: (url: string) => void;

    // Services Overview
    addServiceItem: (item: ServiceItem) => void;
    updateServiceItem: (id: string, item: Partial<ServiceItem>) => void;
    deleteServiceItem: (id: string) => void;

    // Comparison
    addComparisonFeature: (feature: ComparisonFeature) => void;
    updateComparisonFeature: (index: number, feature: ComparisonFeature) => void;
    deleteComparisonFeature: (index: number) => void;
    addComparisonTier: (tier: ComparisonTier) => void;
    updateComparisonTier: (id: string, tier: Partial<ComparisonTier>) => void;
    deleteComparisonTier: (id: string) => void;

    // Packages
    addPackage: (pkg: ServicePackage) => void;
    updatePackage: (id: string, pkg: Partial<ServicePackage>) => void;
    deletePackage: (id: string) => void;

    // Process
    addProcessStep: (step: ProcessStep) => void;
    updateProcessStep: (id: number, step: Partial<ProcessStep>) => void;
    deleteProcessStep: (id: number) => void;

    // FAQs
    addFAQ: (item: FAQItem) => void;
    updateFAQ: (id: string, item: Partial<FAQItem>) => void;
    deleteFAQ: (id: string) => void;

    // Tech Stack
    addTechCategory: (category: TechCategory) => void;
    updateTechCategory: (id: string, category: Partial<TechCategory>) => void;
    deleteTechCategory: (id: string) => void;

    // Service Offers
    addOffer: (offer: ServiceOffer) => void;
    updateOffer: (id: string, offer: Partial<ServiceOffer>) => void;
    deleteOffer: (id: string) => void;

    resetToDefaults: () => void;
}

export const defaultContent: ServicesPageContent = {
    heroVideoUrl: "",
    overview: [
        {
            id: "web",
            label: "Modern Web",
            iconName: "Globe",
            gradient: "from-blue-600 to-cyan-500",
            title: "High-Performance Web Applications",
            subtitle: "Future-Proof Web Architecture",
            description: "We build pixel-perfect, SEO-optimized web applications using Next.js 15 and React Server Components. Our sites aren't just beautiful; they are lightning fast and score 100 on Core Web Vitals.",
            features: [
                { iconName: "Zap", title: "Speed Optimization", desc: "Sub-second load times and interaction to next paint (INP) optimization." },
                { iconName: "Globe", title: "Edge Scalability", desc: "Global distribution for near-zero latency worldwide." },
                { iconName: "Layers", title: "Modular Architecture", desc: "Service-oriented structure for effortless scaling." },
                { iconName: "ShieldCheck", title: "Enterprise Security", desc: "Advanced protection mechanisms and data privacy compliance." }
            ],
            techs: ["Next.js 15", "React Server Components", "TypeScript", "Tailwind CSS", "Framer Motion", "Vercel Edge"]
        },
        // ... (other default services can be added here, mimicking original file)
    ],
    comparison: {
        features: [
            { name: "Custom Design", tooltip: "Tailored UI/UX specifically for your brand" },
            { name: "SEO Optimization", tooltip: "Advanced technical SEO setup" },
            { name: "CMS Integration", tooltip: "Easy content management" },
            { name: "E-commerce", tooltip: "Full shopping cart & checkout" },
            { name: "API Integration", tooltip: "Connect 3rd party services" },
            { name: "Database Setup", tooltip: "Scalable data architecture" },
            { name: "Maintenance", tooltip: "Ongoing support duration" },
            { name: "Source Code", tooltip: "Full ownership of codebase" }
        ],
        tiers: [
            {
                id: "starter", name: "Starter", price: "$2,999", description: "Perfect for landing pages and small business sites.", iconName: "Zap", color: "text-blue-500", highlight: false, features: [true, true, true, false, false, false, "1 Month", false]
            },
            {
                id: "growth", name: "Growth", price: "$5,499", description: "Ideal for growing startups and e-commerce brands.", iconName: "Sparkles", color: "text-purple-500", highlight: true, features: [true, true, true, true, true, true, "3 Months", true]
            },
            {
                id: "enterprise", name: "Enterprise", price: "Custom", description: "Full-scale solution for large organizations.", iconName: "Crown", color: "text-orange-500", highlight: false, features: [true, true, true, true, true, true, "12 Months", true]
            }
        ]
    },
    packages: [
        {
            id: "starter", name: "Starter", price: 2999, monthlyPrice: 299, description: "Perfect for landing pages and small business websites.", features: ["Custom Design", "Mobile Responsive", "SEO Optimized", "CMS Integration", "1 Month Support"], highlight: false, iconName: "Rocket", gradient: "from-blue-500/20 to-cyan-500/20"
        },
        {
            id: "growth", name: "Growth", price: 5499, monthlyPrice: 599, description: "Ideal for growing startups and e-commerce brands.", features: ["Everything in Starter", "Shopping Cart", "Payment Gateway", "User Authentication", "3 Months Support", "Analytics Dashboard"], highlight: true, iconName: "Sparkles", gradient: "from-purple-500/20 to-pink-500/20"
        },
        {
            id: "enterprise", name: "Enterprise", price: "Custom", monthlyPrice: "Custom", description: "Full-scale solution for large organizations.", features: ["Everything in Growth", "Custom API Integration", "Cloud Infrastructure", "Advanced Security", "12 Months Support", "Dedicated Project Manager"], highlight: false, iconName: "Crown", gradient: "from-orange-500/20 to-red-500/20"
        }
    ],
    process: [
        { id: 1, title: "Discovery & Strategy", desc: "We start by understanding your vision, target audience, and technical requirements. We deliver a detailed project roadmap and technical specifications.", iconName: "Video", color: "text-blue-500" },
        { id: 2, title: "UX/UI Design", desc: "Our designers create high-fidelity interactive prototypes. We focus on user journey mapping and creating a visual identity that resonates with your brand.", iconName: "FileText", color: "text-purple-500" },
        { id: 3, title: "Agile Development", desc: "Development happens in 2-week sprints with regular updates. You get access to a staging environment to see progress in real-time.", iconName: "Code2", color: "text-yellow-500" },
        { id: 4, title: "Quality Assurance", desc: "Rigorous testing across devices and browsers. We perform security audits, performance benchmarking, and accessibility checks.", iconName: "ClipboardCheck", color: "text-red-500" },
        { id: 5, title: "Launch & Training", desc: "Seamless deployment to your production environment. We provide training sessions and documentation for your team to manage the platform.", iconName: "Rocket", color: "text-green-500" },
        { id: 6, title: "Evolution", desc: "Post-launch monitoring and iterative improvements based on user data. We ensure your product stays ahead of the curve.", iconName: "HeartPulse", color: "text-cyan-500" }
    ],
    startId: 1,
    faqs: [
        { id: "timeline", category: "General", question: "How long does a typical project take?", answer: "Timeline depends on complexity. A simple website takes 2-4 weeks, while a complex web app can take 2-4 months. We provide a detailed Gantt chart during the onboarding phase so you always know what to expect." },
        { id: "hosting", category: "Technical", question: "Do you provide hosting services?", answer: "We typically set up hosting for you on industry-standard platforms like AWS, Vercel, or DigitalOcean. You retain full ownership of the accounts. We can also manage the infrastructure for a monthly maintenance fee." },
        { id: "payment", category: "Billing", question: "What is your payment structure?", answer: "We work on a milestone basis to ensure trust. Typically, it's 40% upfront to kickstart resources, 30% after the design phase approval, and 30% upon final delivery and deployment." },
        { id: "redesign", category: "General", question: "Can you update my existing website?", answer: "Yes! We specialize in modernization. We can refactor your legacy code, improve performance metrics (Core Web Vitals), and give the UI a fresh '2026' aesthetic without losing your SEO ranking." },
        { id: "support", category: "Support", question: "Do you offer post-launch support?", answer: "Absolutely. All our packages come with a 30-day bug-fix warranty. Beyond that, we offer tiered maintenance plans that cover security updates, feature additions, and server monitoring." },
        { id: "tech", category: "Technical", question: "What technologies do you use?", answer: "We are full-stack experts. Frontend: React, Next.js, Tailwind, Three.js. Backend: Node.js, Python (Django/FastAPI), Go. Database: PostgreSQL, MongoDB, Redis. We choose the best tool for your specific goals." }
    ],
    techStack: [
        { id: "frontend", label: "Frontend", iconName: "Layout", description: "Pixel-perfect interfaces", techs: ["React", "Next.js 14", "Vue.js", "Tailwind CSS", "Framer Motion", "Three.js", "TypeScript", "Redux"] },
        { id: "backend", label: "Backend", iconName: "Server", description: "Robust scalable logic", techs: ["Node.js", "NestJS", "Express", "Python", "Django", "GoLang", "GraphQL", "WebSockets"] },
        { id: "database", label: "Database", iconName: "Database", description: "High-performance storage", techs: ["PostgreSQL", "MongoDB", "Redis", "Supabase", "Prisma", "MySQL", "Elasticsearch"] },
        { id: "cloud", label: "DevOps & Cloud", iconName: "Cloud", description: "CI/CD & Infrastructure", techs: ["AWS", "Vercel", "Docker", "Kubernetes", "Terraform", "GitHub Actions", "Cloudflare"] },
        { id: "ai", label: "AI & ML", iconName: "Brain", description: "Intelligent solutions", techs: ["OpenAI API", "PyTorch", "TensorFlow", "LangChain", "Hugging Face", "Pinecone", "LlamaIndex"] },
        { id: "mobile", label: "Mobile", iconName: "Smartphone", description: "Native experiences", techs: ["React Native", "Expo", "Flutter", "Swift", "Kotlin", "PWA"] }
    ],
    offers: (function buildOffers(): ServiceOffer[] {
        function o(
            id: string, title: string, desc: string, cat: string, sub: string,
            price: number, delivery: string, rating: number, reviews: number, orders: number,
            techs: string[], featured: boolean, trending: boolean, createdAt: string,
            bFeat: string[], sFeat: string[], pFeat: string[],
            faqs: { q: string; a: string }[]
        ): ServiceOffer {
            const m = delivery.match(/\d+/);
            const days = m ? parseInt(m[0]) : 14;
            return {
                id, title, description: desc, category: cat, subcategory: sub,
                rating, reviewCount: reviews, orderCount: orders, image: "",
                techs, featured, trending, createdAt,
                tiers: [
                    { name: "Basic", price: Math.round(price * 0.5), deliveryTime: `${Math.ceil(days * 1.5)} days`, description: "Essential — get the core work done", features: bFeat, revisions: 1 },
                    { name: "Standard", price, deliveryTime: delivery, description: "Best value — most popular choice", features: sFeat, revisions: 2 },
                    { name: "Premium", price: Math.round(price * 1.8), deliveryTime: `${Math.max(Math.ceil(days * 0.5), 1)} days`, description: "Full package — everything included", features: pFeat, revisions: "Unlimited" },
                ],
                faqs: faqs.map(f => ({ question: f.q, answer: f.a })),
            };
        }
        return [
            // ── WordPress ──
            o("svc-wordpress-create", "I will create a custom WordPress website from scratch", "Fully responsive WordPress site with custom theme, page builder, SEO optimization, and contact forms.", "WordPress", "Website Creation", 999, "10 days", 4.9, 204, 589, ["WordPress", "Elementor", "PHP", "MySQL", "WooCommerce"], true, true, "2026-04-01",
                ["1-page site", "Free theme", "Contact form", "Mobile responsive"],
                ["5-page site", "Elementor builder", "SEO", "Contact form", "Google Analytics"],
                ["Unlimited pages", "Custom theme", "Advanced SEO", "E-commerce ready", "Speed optimization", "Priority support"],
                [{ q: "Do I need hosting?", a: "Yes, but I can help set up the best hosting for your needs." }, { q: "Mobile-friendly?", a: "Absolutely! Fully responsive on all devices." }]),
            o("svc-wordpress-fix", "I will fix your WordPress website issues — errors, speed, security", "Fix any WordPress problem: white screen, 404 errors, plugin conflicts, malware, and more.", "WordPress", "Fix & Repair", 199, "2 days", 4.8, 312, 845, ["WordPress", "PHP", "MySQL", "cPanel"], true, true, "2026-04-05",
                ["Single issue fix", "Basic troubleshooting", "Report"],
                ["Up to 3 issues", "Plugin conflict fix", "Security scan", "Performance check"],
                ["Unlimited fixes", "Malware removal", "Full security audit", "Speed optimization", "30-day support"],
                [{ q: "How fast?", a: "Most issues fixed within 24 hours." }, { q: "Emergency support?", a: "Yes, priority support for critical issues." }]),
            o("svc-wordpress-speed", "I will speed optimize your WordPress site for 90+ PageSpeed", "WordPress speed optimization: caching, CDN, images, database, and Core Web Vitals.", "WordPress", "Speed Optimization", 349, "3 days", 4.7, 156, 423, ["WordPress", "WP Rocket", "Cloudflare", "LiteSpeed"], false, true, "2026-03-20",
                ["Image optimization", "Caching setup", "Basic optimization", "Report"],
                ["Full optimization", "CDN (Cloudflare)", "Database optimization", "Gzip + lazy load"],
                ["Core Web Vitals fix", "Advanced CDN + cache", "Server optimization", "30-day monitoring", "90+ guarantee"],
                [{ q: "PageSpeed score?", a: "I guarantee 90+ on mobile and desktop." }, { q: "Will it break my site?", a: "I backup before every change." }]),
            o("svc-wordpress-elementor", "I will build a WordPress site with Elementor or Divi", "Professional WordPress site using Elementor or Divi builder.", "WordPress", "Page Builder", 599, "7 days", 4.8, 178, 512, ["WordPress", "Elementor", "Divi", "PHP", "CSS"], false, true, "2026-03-15",
                ["1-page design", "Builder setup", "Mobile responsive", "Contact form"],
                ["3-page design", "Custom animations", "SEO", "Contact form", "Social media"],
                ["5+ page design", "Full branding", "Advanced animations", "Speed optimization", "Training video"],
                [{ q: "Elementor or Divi?", a: "I recommend based on your needs." }, { q: "Can I edit myself?", a: "Yes, both are beginner-friendly." }]),
            o("svc-wordpress-woocommerce", "I will set up WooCommerce store with payment gateway", "Complete WooCommerce store with products, cart, checkout, and payments.", "WordPress", "WooCommerce", 799, "7 days", 4.8, 98, 267, ["WordPress", "WooCommerce", "Stripe", "PHP", "MySQL"], true, false, "2026-03-10",
                ["Up to 10 products", "Basic setup", "Stripe/PayPal", "Shipping"],
                ["Up to 50 products", "Categories & tags", "Coupons", "Tax config", "Email alerts"],
                ["Unlimited products", "Custom types", "Subscriptions", "Multi-currency", "Analytics"],
                [{ q: "Payment gateways?", a: "Stripe, PayPal, bank transfer." }, { q: "CSV import?", a: "Yes, bulk import from CSV/XML." }]),
            o("svc-wordpress-malware", "I will remove malware & secure your hacked WordPress site", "Complete malware removal, security hardening, and firewall setup.", "WordPress", "Security", 299, "2 days", 4.9, 87, 234, ["WordPress", "Wordfence", "Sucuri", "cPanel", "SSL"], false, false, "2026-02-28",
                ["Malware scan & remove", "Security plugin", "Findings report"],
                ["Full cleanup", "File integrity check", "Firewall setup", "User audit"],
                ["Full security audit", "Prevention setup", "SSL", "30-day monitoring", "Backup"],
                [{ q: "How hacked?", a: "Common causes: outdated plugins, weak passwords." }, { q: "Data loss?", a: "I backup before starting." }]),

            // ── Web Development ──
            o("svc-fullstack-saas", "I will build a full-stack SaaS web application with Next.js & Node.js", "Production-ready SaaS platform with auth, payments, dashboard, and scalable architecture.", "Web Development", "Full-Stack", 4999, "30 days", 4.9, 127, 342, ["Next.js", "Node.js", "PostgreSQL", "Stripe", "AWS"], true, true, "2026-04-01",
                ["Core pages (up to 5)", "Auth", "Basic dashboard", "Database"],
                ["Up to 10 pages", "Auth + social login", "Admin dashboard", "Payments", "APIs"],
                ["Unlimited pages", "Team management", "Analytics", "Multi-tenant", "CI/CD", "30-day support"],
                [{ q: "Tech stack?", a: "Next.js, Node.js, PostgreSQL, AWS." }, { q: "Scalable?", a: "Yes, built for horizontal scaling." }]),
            o("svc-react-frontend", "I will develop a pixel-perfect React / Next.js frontend for your app", "Modern, responsive UI with React, TypeScript, and Tailwind CSS. 100 Lighthouse score.", "Web Development", "Frontend", 2499, "14 days", 4.8, 89, 215, ["React", "Next.js", "TypeScript", "Tailwind CSS", "Framer Motion"], true, true, "2026-03-15",
                ["1-page design", "Responsive", "Basic animations"],
                ["Up to 5 pages", "TypeScript + Tailwind", "SEO", "Animations", "Forms"],
                ["Unlimited pages", "Design system", "Advanced animations", "Storybook", "Performance"],
                [{ q: "Figma designs?", a: "Yes, I work from Figma or create them." }, { q: "Production-ready?", a: "Yes, TypeScript + testing + optimization." }]),
            o("svc-ecommerce", "I will develop a full e-commerce store with payment gateway", "Complete store with cart, checkout, Stripe/PayPal, order tracking, and admin.", "Web Development", "E-Commerce", 4499, "30 days", 4.8, 72, 196, ["Next.js", "Stripe", "PostgreSQL", "Tailwind CSS", "Redis"], true, true, "2026-04-10",
                ["Up to 20 products", "Cart & checkout", "Stripe/PayPal", "Basic admin"],
                ["Up to 100 products", "Variants", "Order management", "Accounts", "Email"],
                ["Unlimited products", "Multi-vendor", "Analytics", "Inventory", "CRM", "Subscriptions"],
                [{ q: "Digital products?", a: "Yes, with license key generation." }, { q: "Shipping APIs?", a: "Shippo, ShipStation, FedEx, UPS." }]),
            o("svc-website-redesign", "I will redesign and modernize your existing website with Next.js", "Transform outdated site into a modern, high-performance web app.", "Web Development", "Redesign", 1999, "10 days", 4.7, 95, 267, ["Next.js", "TypeScript", "Tailwind CSS", "GSAP"], false, true, "2026-03-05",
                ["Homepage redesign", "Mobile responsive", "Speed"],
                ["Up to 5 pages", "Full UI refresh", "SEO improvement", "Performance boost", "Content migration"],
                ["Complete redesign", "New design system", "Advanced animations", "SEO strategy", "30-day support"],
                [{ q: "SEO affected?", a: "No, I preserve and improve SEO." }, { q: "Content migration?", a: "Yes, all existing content migrated." }]),
            o("svc-landing-page", "I will design and develop a high-converting landing page", "Fast, conversion-optimized landing page with animations and analytics.", "Web Development", "Landing Pages", 899, "5 days", 4.9, 145, 398, ["Next.js", "TypeScript", "Tailwind CSS", "Framer Motion"], false, true, "2026-04-08",
                ["Single page", "Responsive", "Contact form"],
                ["Page + sections", "Animations", "SEO", "Google Analytics", "Forms"],
                ["Multi-page funnel", "Advanced animations", "A/B testing", "Heatmap", "Email capture"],
                [{ q: "Load speed?", a: "Under 2 seconds, 90+ Lighthouse." }, { q: "Use my brand?", a: "Yes, your brand colors and logo." }]),
            o("svc-bug-fix", "I will fix bugs and errors in your web application", "Debug JS errors, API failures, UI glitches, performance issues.", "Web Development", "Bug Fixing", 249, "2 days", 4.8, 267, 723, ["React", "Node.js", "TypeScript", "Chrome DevTools"], false, true, "2026-03-25",
                ["Single fix", "Basic debugging", "Fix report"],
                ["Up to 3 bugs", "Cross-browser testing", "Performance check", "Code cleanup"],
                ["Unlimited fixes", "Full audit", "Security check", "Performance optimization", "30-day warranty"],
                [{ q: "Technologies?", a: "React, Next.js, Node.js, Python, PHP, WordPress." }, { q: "Warranty?", a: "30-day warranty on all fixes." }]),

            // ── Backend Development ──
            o("svc-api-backend", "I will create a scalable REST API or GraphQL backend", "Production backend with auth, real-time, database, docs, and tests.", "Backend Development", "API Development", 2999, "21 days", 4.9, 64, 178, ["NestJS", "GraphQL", "PostgreSQL", "Redis", "Docker"], true, true, "2026-03-10",
                ["5 endpoints", "Basic auth", "Database", "API docs"],
                ["15 endpoints", "JWT auth", "DB + caching", "GraphQL or REST", "Swagger"],
                ["Unlimited endpoints", "Full RBAC", "WebSocket real-time", "Redis", "Docker", "Load testing"],
                [{ q: "REST or GraphQL?", a: "REST for CRUD, GraphQL for complex data." }, { q: "Tests?", a: "Unit + integration for all endpoints." }]),
            o("svc-auth-system", "I will implement secure authentication with SSO and 2FA", "JWT, OAuth, 2FA, email verification, RBAC, and audit logging.", "Backend Development", "Authentication", 1499, "7 days", 4.9, 113, 312, ["Node.js", "Passport.js", "Redis", "JWT"], false, true, "2026-04-08",
                ["Email/password auth", "JWT", "Login/signup"],
                ["Google + GitHub OAuth", "Email verification", "Password reset", "Dashboard"],
                ["SSO + 2FA", "RBAC", "Session management", "Audit logs", "Admin panel"],
                [{ q: "OAuth providers?", a: "Google, GitHub, Facebook, Twitter." }, { q: "2FA required?", a: "Optional, recommended for admins." }]),
            o("svc-database-design", "I will design and optimize your database schema", "Schema design, query optimization, indexes, migrations, normalization.", "Backend Development", "Database Design", 999, "5 days", 4.8, 56, 148, ["PostgreSQL", "MongoDB", "Prisma", "TypeORM", "Redis"], false, false, "2026-03-18",
                ["Up to 10 tables", "Schema design", "Basic indexes", "ER diagram"],
                ["Up to 25 tables", "Normalization", "Advanced indexes", "Migrations", "Query opt."],
                ["Unlimited tables", "Sharding", "Replication", "Performance tuning", "Backup", "Migration plan"],
                [{ q: "SQL or NoSQL?", a: "PostgreSQL or MongoDB based on needs." }, { q: "Data migration?", a: "Yes, with custom migration scripts." }]),

            // ── Mobile Development ──
            o("svc-mobile-app", "I will build a cross-platform mobile app with React Native", "iOS and Android from one codebase. Push, offline, and app store deployment.", "Mobile Development", "Cross-Platform", 3999, "28 days", 4.7, 53, 142, ["React Native", "Expo", "Firebase", "Stripe"], false, true, "2026-02-20",
                ["5 screens", "Navigation", "API integration"],
                ["10 screens", "Push notifications", "Auth", "Offline", "App store submission"],
                ["Unlimited screens", "Real-time", "In-app purchases", "Analytics", "Admin dashboard"],
                [{ q: "iOS + Android?", a: "Yes, from one codebase." }, { q: "Review time?", a: "App Store 1-3 days, Play Store 1-2." }]),
            o("svc-ios-app", "I will develop a native iOS app with Swift", "Native iOS with SwiftUI, Core Data, push notifications, and App Store submission.", "Mobile Development", "iOS", 5499, "35 days", 4.8, 28, 76, ["Swift", "SwiftUI", "Core Data", "Firebase", "Xcode"], false, false, "2026-02-15",
                ["5 screens", "SwiftUI", "Core Data", "Basic navigation"],
                ["10 screens", "Push notifications", "Firebase", "API integration", "App Store"],
                ["Unlimited screens", "Advanced animations", "In-app purchases", "Apple Pay", "Watch app", "Testing"],
                [{ q: "Need a Mac?", a: "Yes, but I handle the build process." }, { q: "Test before launch?", a: "Yes, via TestFlight." }]),

            // ── AI & Machine Learning ──
            o("svc-ai-chatbot", "I will integrate an AI chatbot with custom LLM for your business", "Custom chatbot trained on your data. RAG pipeline, multi-platform deployment.", "AI & Machine Learning", "Chatbots", 5999, "21 days", 4.9, 41, 98, ["OpenAI", "LangChain", "Pinecone", "Next.js", "Python"], true, true, "2026-04-05",
                ["Basic chatbot (1 source)", "Web interface", "Q&A"],
                ["Custom LLM (3 sources)", "RAG pipeline", "Web + Slack", "Memory"],
                ["Advanced AI assistant", "RAG + fine-tuning", "Web + Slack + WhatsApp", "Analytics", "Human handoff"],
                [{ q: "Training data?", a: "PDFs, websites, docs, databases." }, { q: "LLM model?", a: "GPT-4, Claude, or open-source Llama." }]),
            o("svc-python-automation", "I will write Python scripts for automation and data processing", "Web scraping, data extraction, file processing, report generation.", "AI & Machine Learning", "Scripting", 599, "5 days", 4.8, 134, 367, ["Python", "Selenium", "BeautifulSoup", "Pandas", "FastAPI"], false, true, "2026-04-12",
                ["Single script", "Basic processing", "CSV/Excel output"],
                ["Complex automation", "Scraping + API", "Data transformation", "Scheduled runs", "Reports"],
                ["Full workflow", "Multi-source scraping", "Database integration", "Dashboard", "Alerts", "30-day support"],
                [{ q: "Schedule scripts?", a: "Yes, cron jobs or cloud schedulers." }, { q: "Data sources?", a: "Websites, APIs, PDFs, emails, databases." }]),

            // ── DevOps & Cloud ──
            o("svc-cloud-devops", "I will set up cloud infrastructure with CI/CD pipeline on AWS", "Infrastructure-as-code, automated deployments, monitoring, auto-scaling.", "DevOps & Cloud", "Infrastructure", 3499, "14 days", 4.8, 36, 87, ["AWS", "Docker", "Kubernetes", "Terraform", "GitHub Actions"], false, false, "2026-03-25",
                ["Single server", "Docker", "Basic monitoring"],
                ["CI/CD pipeline", "Docker Compose", "Auto-scaling", "CloudWatch", "SSL"],
                ["Kubernetes cluster", "Full CI/CD", "Multi-region", "Terraform IaC", "24/7 monitoring", "DR"],
                [{ q: "AWS, GCP, Azure?", a: "I specialize in AWS but work with any." }, { q: "Migration?", a: "Zero-downtime migration." }]),

            // ── Data Engineering ──
            o("svc-data-pipeline", "I will build a real-time data pipeline and analytics dashboard", "End-to-end data infrastructure from ingestion to visualization.", "Data Engineering", "Data Pipelines", 5499, "35 days", 4.9, 28, 67, ["Kafka", "Spark", "dbt", "Snowflake", "Metabase"], false, false, "2026-02-28",
                ["Single source", "Batch pipeline", "Basic dashboard"],
                ["3 sources", "Real-time pipeline", "Data warehouse", "Advanced dashboards", "Alerts"],
                ["Unlimited sources", "Kafka streaming", "Spark processing", "Data lake", "ML pipeline", "Training"],
                [{ q: "Data sources?", a: "DBs, APIs, CSV, cloud storage." }, { q: "Data freshness?", a: "Real-time (seconds) or batch on schedule." }]),

            // ── Desktop Applications ──
            o("svc-electron-app", "I will build a cross-platform desktop app with Electron", "Windows, Mac, Linux desktop app with auto-updates and native features.", "Desktop Applications", "Electron", 3499, "21 days", 4.7, 32, 89, ["Electron", "React", "TypeScript", "Node.js"], false, false, "2026-02-10",
                ["1 window", "React UI", "File system", "Windows build"],
                ["Multi-window", "Auto-updates", "System tray", "Native menus", "Win + Mac"],
                ["Full suite", "Auto-updates + releases", "DB integration", "IPC", "Win + Mac + Linux", "Code signing"],
                [{ q: "Local database?", a: "Yes, SQLite or local server." }, { q: "Updates?", a: "Auto-updates via electron-updater." }]),
        ];
    })(),
    lastUpdated: new Date().toISOString()
};

export const useServicesContentStore = create<ServicesContentState>()(
    immer((set) => ({
            content: defaultContent,
            isLoading: false,
            isSaving: false,
            error: null,

            setContent: (content) => set({ content: { ...content, lastUpdated: new Date().toISOString() } }),

            updateHeroVideo: (url) => set((state) => {
                if (state.content) {
                    state.content.heroVideoUrl = url;
                    state.content.lastUpdated = new Date().toISOString();
                }
            }),

            addServiceItem: (item) => set((state) => {
                if (state.content) {
                    state.content.overview.push(item);
                    state.content.lastUpdated = new Date().toISOString();
                }
            }),

            updateServiceItem: (id, item) => set((state) => {
                if (state.content) {
                    const index = state.content.overview.findIndex(p => p.id === id);
                    if (index !== -1) {
                        state.content.overview[index] = { ...state.content.overview[index], ...item };
                        state.content.lastUpdated = new Date().toISOString();
                    }
                }
            }),

            deleteServiceItem: (id) => set((state) => {
                if (state.content) {
                    state.content.overview = state.content.overview.filter(p => p.id !== id);
                    state.content.lastUpdated = new Date().toISOString();
                }
            }),

            addComparisonFeature: (feature) => set((state) => {
                if (state.content) {
                    state.content.comparison.features.push(feature);
                    state.content.comparison.tiers.forEach(tier => {
                        tier.features.push(false);
                    });
                    state.content.lastUpdated = new Date().toISOString();
                }
            }),

            updateComparisonFeature: (index, feature) => set((state) => {
                if (state.content && state.content.comparison.features[index]) {
                    state.content.comparison.features[index] = feature;
                    state.content.lastUpdated = new Date().toISOString();
                }
            }),

            deleteComparisonFeature: (index) => set((state) => {
                if (state.content) {
                    state.content.comparison.features.splice(index, 1);
                    state.content.comparison.tiers.forEach(tier => {
                        tier.features.splice(index, 1);
                    });
                    state.content.lastUpdated = new Date().toISOString();
                }
            }),

            addComparisonTier: (tier) => set((state) => {
                if (state.content) {
                    state.content.comparison.tiers.push(tier);
                    state.content.lastUpdated = new Date().toISOString();
                }
            }),

            updateComparisonTier: (id, tier) => set((state) => {
                if (state.content) {
                    const index = state.content.comparison.tiers.findIndex(p => p.id === id);
                    if (index !== -1) {
                        state.content.comparison.tiers[index] = { ...state.content.comparison.tiers[index], ...tier };
                        state.content.lastUpdated = new Date().toISOString();
                    }
                }
            }),

            deleteComparisonTier: (id) => set((state) => {
                if (state.content) {
                    state.content.comparison.tiers = state.content.comparison.tiers.filter(p => p.id !== id);
                    state.content.lastUpdated = new Date().toISOString();
                }
            }),

            addPackage: (pkg) => set((state) => {
                if (state.content) {
                    state.content.packages.push(pkg);
                    state.content.lastUpdated = new Date().toISOString();
                }
            }),

            updatePackage: (id, pkg) => set((state) => {
                if (state.content) {
                    const index = state.content.packages.findIndex(p => p.id === id);
                    if (index !== -1) {
                        state.content.packages[index] = { ...state.content.packages[index], ...pkg };
                        state.content.lastUpdated = new Date().toISOString();
                    }
                }
            }),

            deletePackage: (id) => set((state) => {
                if (state.content) {
                    state.content.packages = state.content.packages.filter(p => p.id !== id);
                    state.content.lastUpdated = new Date().toISOString();
                }
            }),

            addProcessStep: (step) => set((state) => {
                if (state.content) {
                    state.content.process.push(step);
                    state.content.lastUpdated = new Date().toISOString();
                }
            }),

            updateProcessStep: (id, step) => set((state) => {
                if (state.content) {
                    const index = state.content.process.findIndex(p => p.id === id);
                    if (index !== -1) {
                        state.content.process[index] = { ...state.content.process[index], ...step };
                        state.content.lastUpdated = new Date().toISOString();
                    }
                }
            }),

            deleteProcessStep: (id) => set((state) => {
                if (state.content) {
                    state.content.process = state.content.process.filter(p => p.id !== id);
                    state.content.lastUpdated = new Date().toISOString();
                }
            }),

            addFAQ: (item) => set((state) => {
                if (state.content) {
                    state.content.faqs.push(item);
                    state.content.lastUpdated = new Date().toISOString();
                }
            }),

            updateFAQ: (id, item) => set((state) => {
                if (state.content) {
                    const index = state.content.faqs.findIndex(p => p.id === id);
                    if (index !== -1) {
                        state.content.faqs[index] = { ...state.content.faqs[index], ...item };
                        state.content.lastUpdated = new Date().toISOString();
                    }
                }
            }),

            deleteFAQ: (id) => set((state) => {
                if (state.content) {
                    state.content.faqs = state.content.faqs.filter(p => p.id !== id);
                    state.content.lastUpdated = new Date().toISOString();
                }
            }),

            addTechCategory: (category) => set((state) => {
                if (state.content) {
                    state.content.techStack.push(category);
                    state.content.lastUpdated = new Date().toISOString();
                }
            }),

            updateTechCategory: (id, category) => set((state) => {
                if (state.content) {
                    const index = state.content.techStack.findIndex(p => p.id === id);
                    if (index !== -1) {
                        state.content.techStack[index] = { ...state.content.techStack[index], ...category };
                        state.content.lastUpdated = new Date().toISOString();
                    }
                }
            }),

            deleteTechCategory: (id) => set((state) => {
                if (state.content) {
                    state.content.techStack = state.content.techStack.filter(p => p.id !== id);
                    state.content.lastUpdated = new Date().toISOString();
                }
            }),

            // Service Offers
            addOffer: (offer) => set((state) => {
                if (state.content) {
                    state.content.offers.push(offer);
                    state.content.lastUpdated = new Date().toISOString();
                }
            }),

            updateOffer: (id, data) => set((state) => {
                if (state.content) {
                    const index = state.content.offers.findIndex(o => o.id === id);
                    if (index !== -1) {
                        state.content.offers[index] = { ...state.content.offers[index], ...data };
                        state.content.lastUpdated = new Date().toISOString();
                    }
                }
            }),

            deleteOffer: (id) => set((state) => {
                if (state.content) {
                    state.content.offers = state.content.offers.filter(o => o.id !== id);
                    state.content.lastUpdated = new Date().toISOString();
                }
            }),

            resetToDefaults: () => set({ content: defaultContent })
        }))
);


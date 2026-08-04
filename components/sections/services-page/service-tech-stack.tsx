"use client"
import { AnimatedDiv, AnimatedH1, AnimatedH2, AnimatedH3, AnimatedP, AnimatePresence } from "@/lib/animated";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
    Layout, Server, Database, Cloud, Brain, Smartphone, Code2, Globe, Cpu, Layers,
    Plus, Save, Trash2, LayoutTemplate, Grid, HelpCircle, Video, FileText, 
    ClipboardCheck, Rocket, HeartPulse, Zap, Code, ShieldCheck, Sparkles, Crown, ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

// Icon mapping
const iconMap: Record<string, React.ComponentType<{ className?: string; size?: number }>> = {
    Layout, Server, Database, Cloud, Brain, Smartphone, Code2, Globe, Cpu, Layers,
    Plus, Save, Trash2, LayoutTemplate, Grid, HelpCircle, Video, FileText, 
    ClipboardCheck, Rocket, HeartPulse, Zap, Code, ShieldCheck, Sparkles, Crown, ArrowRight
};

const techCategories = [
    { id: "frontend", iconName: "Layout", label: "Frontend", description: "Modern web frameworks and tools", gradient: "from-blue-500 to-cyan-500", techs: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Framer Motion"] },
    { id: "backend", iconName: "Server", label: "Backend", description: "Scalable server-side technologies", gradient: "from-green-500 to-teal-500", techs: ["Node.js", "Python", "Go", "GraphQL", "gRPC"] },
    { id: "mobile", iconName: "Smartphone", label: "Mobile", description: "Cross-platform mobile development", gradient: "from-purple-500 to-pink-500", techs: ["React Native", "Flutter", "Expo", "Swift", "Kotlin"] },
    { id: "ai", iconName: "Brain", label: "AI & ML", description: "Artificial intelligence and machine learning", gradient: "from-orange-500 to-red-500", techs: ["TensorFlow", "PyTorch", "LangChain", "OpenAI", "Hugging Face"] },
    { id: "data", iconName: "Database", label: "Data & Analytics", description: "Data engineering and analytics", gradient: "from-indigo-500 to-violet-500", techs: ["PostgreSQL", "MongoDB", "Redis", "Kafka", "Elasticsearch"] },
    { id: "infra", iconName: "Cloud", label: "Infrastructure", description: "Cloud and DevOps infrastructure", gradient: "from-cyan-500 to-blue-500", techs: ["AWS", "Docker", "Kubernetes", "Terraform", "Cloudflare"] },
];

export default function ServiceTechStack() {
    const [activeTab, setActiveTab] = useState(techCategories[0]?.id || "");

    return (
        <section className="py-16 md:py-24 bg-background relative overflow-hidden">
            {/* Consistent Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
            
            {/* Ambient Background */}
            <div className="absolute top-0 right-0 w-[400px] md:w-[800px] h-[400px] md:h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="container px-4 mx-auto relative z-10">
                <div className="text-center mb-12 md:mb-16">
                     <AnimatedDiv 
                        initial={{ opacity: 0, y: 20 }}
                        style={{ willChange: "transform, opacity" }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="mb-6 flex justify-center"
                    >
                        <Badge variant="outline" className="gap-2 px-3 py-1 bg-primary/10 border-primary/20 text-primary hover:bg-primary/20 transition-colors backdrop-blur-sm">
                            <Layers className="w-3.5 h-3.5" />
                            Our Toolkit
                        </Badge>
                    </AnimatedDiv>
                    
                    <AnimatedH2 
                        initial={{ opacity: 0, y: 20 }}
                        style={{ willChange: "transform, opacity" }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold mb-4 md:mb-6 tracking-tight"
                    >
                        Powerful <span className="text-primary">Technology Stack</span>
                    </AnimatedH2>
                    <AnimatedP 
                        initial={{ opacity: 0, y: 20 }}
                        style={{ willChange: "transform, opacity" }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto"
                    >
                        We leverage the latest frameworks and tools to build future-proof, high-performance applications.
                    </AnimatedP>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                    {/* Left: Sidebar Navigation (Scrollable on Mobile) */}
                    <div className="w-full lg:w-1/4">
                        <div className="flex lg:flex-col overflow-x-auto pb-4 lg:pb-0 gap-3 lg:gap-3 sticky lg:top-24 no-scrollbar snap-x">
                            {techCategories.map((cat) => (
                                <button key={cat.id}
                                    onClick={() => setActiveTab(cat.id)}
                                    className={cn(
                                        "min-w-[240px] lg:min-w-0 snap-center flex items-center gap-4 p-4 rounded-xl transition-all duration-300 border text-left group relative overflow-hidden",
                                        activeTab === cat.id 
                                            ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20" 
                                            : "bg-card/50 backdrop-blur-sm hover:bg-card border-border/50 text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    {/* Active Indicator Splash */}
                                    {activeTab === cat.id && (
                                        <AnimatedDiv layoutId="active-bg"
                                            className="absolute inset-0 bg-primary z-0"
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}

                                    <div className="relative z-10 flex items-center gap-4 w-full">
                                        <div className={cn(
                                            "w-10 h-10 rounded-lg flex items-center justify-center transition-colors shrink-0",
                                            activeTab === cat.id ? "bg-white/20" : "bg-muted group-hover:bg-background"
                                        )}>
                                            {(() => {
                                                const Icon = iconMap[cat.iconName] || Layout;
                                                return <Icon className="w-5 h-5" />;
                                            })()}
                                        </div>
                                        <div className="shrink-0 max-w-[150px] lg:max-w-none">
                                            <div className="font-bold truncate text-sm lg:text-base">{cat.label}</div>
                                            <div className={cn("text-xs opacity-80 truncate", activeTab === cat.id ? "text-primary-foreground" : "text-muted-foreground")}>
                                                {cat.description}
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right: Content Grid */}
                    <div className="w-full lg:w-3/4 min-h-[400px]">
                        <AnimatePresence mode="wait">
                            <AnimatedDiv key={activeTab}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                            >
                                {techCategories.find(c => c.id === activeTab)?.techs.map((tech, index) => {
                                    // Comprehensive mappings for Simple Icons
                                    const slugMap: Record<string, string> = {
                                        // Frontend
                                        'react': 'react',
                                        'react native': 'react',
                                        'next.js': 'nextdotjs',
                                        'next.js 13': 'nextdotjs',
                                        'next.js 14': 'nextdotjs',
                                        'next.js 15': 'nextdotjs',
                                        'vue.js': 'vuedotjs',
                                        'three.js': 'threedotjs',
                                        'tailwind css': 'tailwindcss',
                                        'framer motion': 'framermotion',
                                        'typescript': 'typescript',
                                        'redux': 'redux',
                                        
                                        // Backend
                                        'node.js': 'nodedotjs',
                                        'nestjs': 'nestjs',
                                        'express.js': 'express',
                                        'express': 'express',
                                        'python': 'python',
                                        'django': 'django',
                                        'golang': 'go',
                                        'graphql': 'graphql',
                                        'websockets': 'socketdotio', // fallback
                                        
                                        // Database & Cloud
                                        'aws': 'amazonwebservices',
                                        'google cloud': 'googlecloud',
                                        'github actions': 'githubactions',
                                        'postgresql': 'postgresql',
                                        'mongodb': 'mongodb',
                                        'redis': 'redis',
                                        'supabase': 'supabase',
                                        'prisma': 'prisma',
                                        'mysql': 'mysql',
                                        'elasticsearch': 'elasticsearch',
                                        'cloudflare': 'cloudflare',
                                        'terraform': 'terraform',
                                        
                                        // AI & Tools
                                        'openai': 'openai',
                                        'openai api': 'openai',
                                        'hugging face': 'huggingface',
                                        'tensorflow': 'tensorflow',
                                        'pytorch': 'pytorch',
                                        'langchain': 'langchain',
                                        'vercel': 'vercel',
                                        'docker': 'docker',
                                        'kubernetes': 'kubernetes',
                                        'figma': 'figma',
                                        'pinecone': 'pinecone', // might not exist, will fallback
                                        'llamaindex': 'llamaindex', // might not exist
                                        
                                        // Mobile
                                        'expo': 'expo',
                                        'flutter': 'flutter',
                                        'swift': 'swift',
                                        'kotlin': 'kotlin',
                                        'pwa': 'pwa'
                                    };

                                    let techSlug = tech.toLowerCase();
                                    // Clean up version numbers if not explicitly mapped
  if (!slugMap[techSlug]) {
                                        techSlug = techSlug.replace(/\s\d+(\.\d+)?$/, '');
                                    }

                                    if (slugMap[techSlug]) {
                                        techSlug = slugMap[techSlug];
                                    } else {
                                        techSlug = techSlug
                                            .replace(/\./g, 'dot')
                                            .replace(/\s+/g, '');
                                    }

                                    return (
                                    <AnimatedDiv key={tech}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        style={{ willChange: "transform, opacity" }}
                                        transition={{ delay: index * 0.1 }}
                                        whileHover={{ y: -5, scale: 1.05 }}
                                    >
                                        <Card className="aspect-[4/3] relative group overflow-hidden border-border/50 hover:border-primary/50 transition-colors duration-300 bg-card/30 backdrop-blur-sm shadow-sm hover:shadow-md">
                                            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            
                                            {/* Glow Effect */}
                                            <div className="absolute inset-0 bg-primary/20 hover:bg-primary/30 blur-2xl rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-500" />

                                            <CardContent className="absolute inset-0 flex flex-col items-center justify-center p-4">
                                                 {/* Real Logo from CDN */}
                                                 <div className="w-14 h-14 mb-4 rounded-2xl bg-muted shadow-inner flex items-center justify-center border border-white/10 group-hover:border-primary/20 transition-colors relative overflow-hidden p-2">
                                                     <img 
                                                        src={`https://cdn.simpleicons.org/${techSlug}`}
                                                        alt={`${tech} logo`}
                                                        className="w-full h-full object-contain opacity-70 group-hover:opacity-100 transition-all duration-300 grayscale group-hover:grayscale-0"
                                                        onError={(e) => {
                                                            e.currentTarget.style.display = 'none';
                                                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                                            e.currentTarget.nextElementSibling?.classList.add('flex');
                                                        }}
                                                    />
                                                     {/* Text Fallback */}
                                                     <div className="hidden absolute inset-0 bg-primary/10 opacity-100 items-center justify-center">
                                                        <span className="text-2xl font-semibold text-foreground/70 group-hover:text-primary relative z-10">
                                                            {tech.charAt(0)}
                                                        </span>
                                                     </div>
                                                 </div>
                                                 
                                                 <span className="font-bold text-center text-sm text-muted-foreground group-hover:text-foreground transition-colors truncate w-full px-2">
                                                     {tech}
                                                 </span>
                                            </CardContent>
                                        </Card>
                                    </AnimatedDiv>
                                    );
                                })}
                            </AnimatedDiv>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </section>
    );
}

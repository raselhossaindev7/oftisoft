"use client";

import { 
    Code2, 
    Database, 
    Globe, 
    Server, 
    Cpu, 
    Cloud, 
    Layers, 
    Zap,
    Box,
    Terminal,
    Smartphone
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Tech {
    name: string;
    icon: string;
    color: string;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    Code2,
    Database,
    Globe,
    Server,
    Cpu,
    Cloud,
    Layers,
    Zap,
    Box,
    Terminal,
    Smartphone
};

import { Badge } from "@/components/ui/badge";

export default function TechStack() {
    const techStackContent: {
        title: string;
        subtitle: string;
        badge: string;
        technologies: Tech[];
    } = {
        title: "Powered By Modern Tech",
        subtitle: "Tech Stack",
        badge: "Powered By Modern Tech",
        technologies: [
            { name: "React", icon: "Code2", color: "text-cyan-400" },
            { name: "Next.js", icon: "Server", color: "text-white" },
            { name: "TypeScript", icon: "Code2", color: "text-blue-400" },
            { name: "Node.js", icon: "Server", color: "text-green-400" },
            { name: "Python", icon: "Terminal", color: "text-yellow-400" },
            { name: "PostgreSQL", icon: "Database", color: "text-blue-300" },
            { name: "MongoDB", icon: "Database", color: "text-green-300" },
            { name: "Docker", icon: "Box", color: "text-blue-400" },
            { name: "Kubernetes", icon: "Layers", color: "text-blue-500" },
            { name: "AWS", icon: "Cloud", color: "text-orange-400" },
            { name: "Redis", icon: "Zap", color: "text-red-400" },
            { name: "GraphQL", icon: "Layers", color: "text-pink-400" },
            { name: "React Native", icon: "Smartphone", color: "text-blue-400" },
            { name: "Tailwind CSS", icon: "Globe", color: "text-cyan-300" },
            { name: "Firebase", icon: "Cpu", color: "text-yellow-400" },
            { name: "Stripe", icon: "Zap", color: "text-purple-400" },
        ]
    };

    return (
        <section className="py-24 bg-transparent border-t border-white/5 relative overflow-hidden z-20">
            {/* Background Texture */}
            <div className="absolute inset-0 bg-transparent" />
            
            <div className="container px-4 mx-auto mb-16 text-center">
                 <Badge variant="outline" className="text-xs py-2 px-6 border-white/10 text-white/80 tracking-wide bg-white/5 backdrop-blur-sm font-semibold">
                    {techStackContent.badge}
                </Badge>
                <h2 className="type-h1 text-white mt-6">
                    {techStackContent.title}{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                        {techStackContent.subtitle}
                    </span>
                </h2>
            </div>
            
            <div className="relative flex flex-col gap-8 mask-gradient-x-tech">
                {/* Row 1: Left Scroll */}
                <div className="flex gap-4 animate-scroll-left min-w-full hover:pause">
                    {[...techStackContent.technologies, ...techStackContent.technologies, ...techStackContent.technologies, ...techStackContent.technologies].map((tech: Tech, i: number) => (
                        <TechPill key={`r1-${i}`} tech={tech} />
                    ))}
                </div>

                {/* Row 2: Right Scroll (Slower) */}
                 <div className="flex gap-4 animate-scroll-right min-w-full hover:pause">
                    {[...techStackContent.technologies, ...techStackContent.technologies, ...techStackContent.technologies, ...techStackContent.technologies].map((tech: Tech, i: number) => (
                        <TechPill key={`r2-${i}`} tech={tech} />
                    ))}
                </div>
            </div>

            <style jsx global>{`
                .mask-gradient-x-tech { mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent); }
                .pause:hover { animation-play-state: paused; }
                
                @keyframes scroll-left {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                @keyframes scroll-right {
                    0% { transform: translateX(-50%); }
                    100% { transform: translateX(0); }
                }

                .animate-scroll-left { animation: scroll-left 40s linear infinite; }
                .animate-scroll-right { animation: scroll-right 45s linear infinite; }

                /* Mobile optimization - slightly faster/slower depending on preference, but 40s is usually fine */
                @media (max-width: 768px) {
                     .animate-scroll-left { animation-duration: 30s; }
                     .animate-scroll-right { animation-duration: 35s; }
                }
            `}</style>
        </section>
    );
}

function TechPill({ tech }: { tech: Tech }) {
    const Icon = iconMap[tech.icon] || Globe;
    return (
        <Badge 
            variant="secondary"
            className="flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20 transition-all cursor-default shrink-0 h-auto pointer-events-auto group"
        >
             <div className={cn("p-1.5 rounded-full bg-white/5 group-hover:scale-110 transition-transform", tech.color)}>
                <Icon className="w-4 h-4 fill-current/20" />
             </div>
             <span className="text-sm font-semibold text-white/60 group-hover:text-white transition-colors whitespace-nowrap">
                {tech.name}
             </span>
        </Badge>
    );
}

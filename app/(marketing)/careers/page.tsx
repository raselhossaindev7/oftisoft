import { AnimatedDiv, AnimatedH1, AnimatedH2, AnimatedH3, AnimatedP } from "@/lib/animated";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
    Rocket, 
    ArrowRight, 
    Globe, 
    Cpu, 
    Terminal, 
    Server,
    Briefcase,
    Sparkles,
    Flame
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Icon Map
const iconMap: any = {
    Cpu, Sparkles, Globe, Terminal, Briefcase, Rocket, Server
};

const pageData = {
    hero: { badge: "JOIN THE TEAM", titlePrefix: "Build the", titleHighlight: "Future", titleSuffix: "", description: "Join a team of world-class engineers, designers, and innovators. Remote-first culture, competitive compensation, and projects that matter." },
    cultureValues: [
        { id: "innovate", iconName: "Cpu", title: "Innovation First", description: "We allocate 20% of engineering time to R&D and side projects. Some of our best products started as Friday experiments.", color: "text-blue-500" },
        { id: "grow", iconName: "Sparkles", title: "Continuous Growth", description: "Annual learning budget, conference tickets, certification programs, and a mentorship culture that helps you level up.", color: "text-purple-500" },
        { id: "global", iconName: "Globe", title: "Global Team", description: "35+ nationalities across 4 continents. Remote-first since day one with annual team retreats in incredible locations.", color: "text-cyan-500" },
        { id: "impact", iconName: "Rocket", title: "Real Impact", description: "Your code ships to production on day one. We move fast, iterate constantly, and every team member owns meaningful parts of the product.", color: "text-orange-500" },
    ],
    jobs: [
        { id: "fe-eng", title: "Senior Frontend Engineer", team: "Platform Engineering", type: "Remote / Full-time", iconName: "Terminal", isActive: true, color: "text-blue-400" },
        { id: "be-eng", title: "Senior Backend Engineer", team: "Core Infrastructure", type: "Remote / Full-time", iconName: "Server", isActive: true, color: "text-green-400" },
        { id: "ai-eng", title: "AI/ML Engineer", team: "AI Products", type: "Remote / Full-time", iconName: "Cpu", isActive: true, color: "text-purple-400" },
        { id: "pm", title: "Technical Product Manager", team: "Product", type: "Remote / Full-time", iconName: "Briefcase", isActive: true, color: "text-yellow-400" },
        { id: "designer", title: "Senior UX Designer", team: "Design", type: "Remote / Full-time", iconName: "Sparkles", isActive: true, color: "text-pink-400" },
        { id: "devops", title: "DevOps Engineer", team: "Infrastructure", type: "Remote / Full-time", iconName: "Rocket", isActive: true, color: "text-cyan-400" },
    ],
    contact: { title: "Don't See Your Role?", description: "We're always looking for exceptional talent. Send us your resume and we'll keep you in mind for future opportunities.", buttonText: "Send Open Application" }
};

export default function CareersPage() {
    const { hero, cultureValues: culture, jobs: allJobs, contact } = pageData;
    const jobs = allJobs.filter(j => j.isActive);

    return (
        <div className="relative min-h-screen pt-32 pb-24 bg-[#020202]">
            {/* Background Texture & Orbs */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[80vw] h-[80vw] bg-primary/10 rounded-full blur-[140px] opacity-40 animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-purple-600/5 rounded-full blur-[140px] opacity-30" />
                <div className="absolute inset-0 bg-grain opacity-[0.02]" />
            </div>

            <div className="container px-6 mx-auto relative z-10 space-y-24">
                {/* Header Section */}
                <div className="text-center space-y-8 max-w-4xl mx-auto">
                    <AnimatedDiv initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                        <Badge variant="outline" className="px-6 py-2 rounded-full border-primary/30 bg-primary/5 text-primary font-semibold tracking-[0.3em] text-xs shadow-[0_0_20px_rgba(var(--primary),0.2)]">
                            {hero?.badge ?? ""}
                        </Badge>
                    </AnimatedDiv>
                    <AnimatedH1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl sm:text-5xl md:text-8xl font-semibold tracking-tighter text-white"
                    >
                        {hero?.titlePrefix ?? ""} <span className="text-primary underline decoration-white/10 decoration-8 underline-offset-8">{hero?.titleHighlight ?? ""}</span>{hero?.titleSuffix ?? ""}
                    </AnimatedH1>
                    <AnimatedP className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">
                        {hero?.description ?? ""}
                    </AnimatedP>
                </div>

                {/* Culture Cards */}
                <div className="grid md:grid-cols-2 gap-8">
                    {culture.map((val) => {
                        const Icon = iconMap[val.iconName] || Flame;
                        return (
                            <Card key={val.id} className="border-white/5 bg-white/[0.02] backdrop-blur-3xl rounded-[32px] sm:rounded-[50px] p-8 sm:p-12 md:p-16 space-y-8 overflow-hidden relative group">
                                <div className={cn("absolute top-0 right-0 w-64 h-64 blur-[100px] rounded-full group-hover:scale-110 transition-transform duration-1000", val.color === 'text-blue-500' ? 'bg-blue-500/10' : 'bg-primary/10')} />
                                <Icon className={cn("w-12 sm:w-16 h-12 sm:h-16 group-hover:scale-110 transition-transform", val.color)} />
                                <div className="space-y-4 relative z-10">
                                    <h3 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-white tracking-tight">{val.title}</h3>
                                    <p className="text-sm sm:text-base md:text-lg text-muted-foreground font-medium">{val.description}</p>
                                </div>
                            </Card>
                        );
                    })}
                </div>

                {/* Job Board */}
                <div className="space-y-12">
                    <div className="flex items-center justify-between border-b border-white/10 pb-8">
                        <h2 className="text-3xl md:text-5xl font-semibold tracking-tighter text-white">Open Nodes (Jobs)</h2>
                        <Badge variant="outline" className="border-primary/30 text-primary font-semibold px-4 py-1">{jobs.length} Active Roles</Badge>
                    </div>

                    <div className="grid gap-6">
                        {jobs.map((job, idx) => {
                            const Icon = iconMap[job.iconName ?? ''] || Briefcase;
                            return (
                            <AnimatedDiv key={job.id}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                style={{ willChange: "transform, opacity" }}
                            >
                                <Card className="group border-white/5 bg-white/[0.01] hover:bg-white/[0.03] rounded-[32px] overflow-hidden transition-all duration-500 hover:border-primary/20 cursor-pointer">
                                    <CardContent className="p-8 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                                        <div className="flex items-center gap-8">
                                            <div className={cn("w-14 h-14 rounded-2xl bg-muted/30 flex items-center justify-center transition-transform group-hover:scale-110", job.color)}>
                                                <Icon size={28} />
                                            </div>
                                            <div className="space-y-1">
                                                <h3 className="text-2xl font-semibold text-white tracking-tight leading-none transition-colors group-hover:text-primary">{job.title}</h3>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-xs font-semibold tracking-widest text-primary">{job.team}</span>
                                                    <div className="w-1 h-1 rounded-full bg-white/10" />
                                                    <span className="text-xs font-semibold tracking-widest text-muted-foreground">{job.type}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <Button className="h-14 px-8 rounded-2xl bg-white/5 border border-white/10 text-white font-semibold hover:bg-primary hover:text-white hover:border-primary transition-all group-hover:translate-x-2" asChild>
                                            <Link href="/contact">
                                                Initiate Application <ArrowRight className="w-5 h-5 ml-3" />
                                            </Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                            </AnimatedDiv>
                        );})}
                    </div>
                </div>

                {/* Future Node Prompt */}
                <div className="text-center pt-24 space-y-6">
                    <h3 className="text-3xl font-semibold text-white/40">{contact.title}</h3>
                    <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto">
                        {contact.description}
                    </p>
                    <Button variant="outline" className="h-16 px-12 rounded-2xl border-white/10 bg-white/5 text-white font-semibold text-lg hover:bg-white/10" asChild>
                        <Link href="/contact">
                            {contact.buttonText} <ArrowRight className="w-5 h-5 ml-3" />
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}


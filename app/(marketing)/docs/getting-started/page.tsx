import { AnimatedDiv, AnimatedH1, AnimatedH2, Reveal } from "@/lib/animated";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight, Rocket, Layout, FolderOpen, BookOpen } from "lucide-react";

const sections = [
    {
        id: "account-setup",
        icon: Rocket,
        color: "text-blue-400",
        title: "Account Setup",
        steps: [
            "Visit oftisoft.com and click Get Started",
            "Sign up with your email or GitHub account",
            "Verify your email address",
            "Complete your profile and organization details",
            "Choose your subscription plan (Free tier available)"
        ]
    },
    {
        id: "navigating-dashboard",
        icon: Layout,
        color: "text-green-400",
        title: "Navigating the Dashboard",
        steps: [
            "Overview: Real-time metrics and activity feed",
            "Projects: Manage all your active and archived projects",
            "Analytics: View traffic, usage, and performance data",
            "Settings: Configure team, billing, and integrations",
            "Support: Access documentation, tickets, and live chat"
        ]
    },
    {
        id: "first-project",
        icon: FolderOpen,
        color: "text-purple-400",
        title: "Your First Project",
        steps: [
            "Click New Project from the dashboard",
            "Select a template (Web App, API, Mobile, or Blank)",
            "Configure your project name and environment",
            "Choose your stack: Next.js, Node.js, Python, or Go",
            "Deploy with one click — your project goes live instantly"
        ]
    },
    {
        id: "key-concepts",
        icon: BookOpen,
        color: "text-cyan-400",
        title: "Key Concepts",
        steps: [
            "Projects vs Environments — each project can have staging, production, and preview deployments",
            "API Keys — scoped keys for authentication, rate-limited per tier",
            "Webhooks — real-time event notifications for deployments, errors, and usage",
            "Teams — collaborate with role-based access (Owner, Admin, Developer, Viewer)",
            "Usage & Billing — pay-as-you-go for compute, storage, and bandwidth"
        ]
    }
];

export default function GettingStartedPage() {
    return (
        <div className="relative min-h-screen pt-32 pb-24 bg-[#020202]">
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-primary/10 rounded-full blur-[140px] opacity-40" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-indigo-600/5 rounded-full blur-[120px] opacity-30" />
            </div>

            <div className="container px-6 mx-auto relative z-10 space-y-24">
                <div className="text-center space-y-8 max-w-4xl mx-auto">
                    <AnimatedDiv initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                        <Badge variant="outline" className="px-6 py-2 rounded-full border-primary/30 bg-primary/5 text-primary font-semibold tracking-[0.3em] text-xs shadow-[0_0_20px_rgba(var(--primary),0.2)]">
                            GETTING STARTED
                        </Badge>
                    </AnimatedDiv>
                    <AnimatedH1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tighter text-white">
                        Get started with <span className="text-primary">Oftisoft</span>.
                    </AnimatedH1>
                    <AnimatedDiv initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                        <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto">Everything you need to go from signup to your first deployment in minutes.</p>
                    </AnimatedDiv>
                </div>

                <div className="max-w-4xl mx-auto space-y-16">
                    {sections.map((section, idx) => {
                        const Icon = section.icon;
                        return (
                            <Reveal key={section.id} delay={idx * 0.1}>
                                <Card className="border-white/5 bg-white/[0.02] backdrop-blur-3xl rounded-[40px] overflow-hidden hover:border-primary/30 transition-all duration-700">
                                    <CardHeader className="p-10 pb-0">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className={`w-12 h-12 rounded-2xl bg-muted/30 flex items-center justify-center ${section.color}`}>
                                                <Icon size={24} />
                                            </div>
                                            <CardTitle className="text-3xl font-semibold tracking-tight text-white">{section.title}</CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-10 pt-6">
                                        <ul className="space-y-4">
                                            {section.steps.map((step, i) => (
                                                <li key={i} className="flex items-start gap-3 text-muted-foreground font-medium">
                                                    <ChevronRight className={`w-5 h-5 mt-0.5 shrink-0 ${section.color}`} />
                                                    <span>{step}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            </Reveal>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

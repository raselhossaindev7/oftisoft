import { AnimatedDiv, AnimatedH1, AnimatedH2, AnimatedH3, AnimatedP } from "@/lib/animated";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
    Globe, 
    Share2, 
    Code2, 
    Zap, 
    ArrowRight,
    Github,
    Slack,
    Terminal,
    Bot,
    Database,
    Cloud
} from "lucide-react";

// Icon Map
const iconMap: any = {
    Github, Slack, Bot, Globe, Share2, Code2, Zap, Terminal, Database, Cloud
};

const pageData = {
    header: { badge: "INTEROPERABILITY", titlePrefix: "Seamless", titleHighlight: "Integrations", description: "Connect Oftisoft with your existing tech stack. 100+ pre-built integrations with industry-leading platforms." },
    integrations: [
        { id: "dodo", iconName: "Zap", name: "Dodo Payments", status: "Live", description: "Payment processing, subscription billing, invoicing, and marketplace payouts." },
        { id: "github", iconName: "Github", name: "GitHub", status: "Live", description: "Seamless CI/CD integration, code review automation, and deployment triggers." },
        { id: "slack", iconName: "Slack", name: "Slack", status: "Live", description: "Real-time notifications, deployment alerts, and interactive bot commands." },
        { id: "aws", iconName: "Cloud", name: "AWS", status: "Live", description: "S3, Lambda, ECS, RDS, CloudFront — full AWS ecosystem integration." },
        { id: "firebase", iconName: "Database", name: "Firebase", status: "Live", description: "Authentication, real-time database, push notifications, and analytics." },
        { id: "openai", iconName: "Bot", name: "OpenAI", status: "Beta", description: "GPT-4, DALL-E, and Whisper API integration for AI-powered features." },
        { id: "sendgrid", iconName: "Share2", name: "SendGrid", status: "Live", description: "Transactional emails, marketing campaigns, and email template management." },
        { id: "datadog", iconName: "Terminal", name: "Datadog", status: "Live", description: "Infrastructure monitoring, APM, log management, and real-time alerts." },
    ],
    cta: { title: "Need a Custom Integration?", description: "Our team can build custom integrations for any platform. We'll work with your existing stack to ensure seamless data flow.", buttonText: "Request Integration" }
};

export default function IntegrationsPage() {
    const { header, integrations, cta } = pageData;
    return (
        <div className="relative min-h-screen pt-32 pb-24 bg-[#020202]">
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-20%] w-[100vw] h-[100vw] bg-blue-600/5 rounded-full blur-[160px] opacity-20" />
            </div>

            <div className="container px-6 mx-auto relative z-10 space-y-20">
                <div className="text-center space-y-6 max-w-4xl mx-auto">
                    <AnimatedDiv initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                        <Badge variant="outline" className="px-6 py-2 rounded-full border-blue-500/20 bg-blue-500/5 text-blue-400 font-semibold tracking-[0.3em] text-xs">
                            {header?.badge ?? ""}
                        </Badge>
                    </AnimatedDiv>
                    <AnimatedH1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-semibold tracking-tighter text-white">
                        {header?.titlePrefix ?? ""} <span className="text-blue-500">{header?.titleHighlight ?? ""}</span>.
                    </AnimatedH1>
                    <AnimatedP className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto">
                        {header?.description ?? ""}
                    </AnimatedP>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {integrations.map((item, idx) => {
                        const Icon = iconMap[item.iconName ?? ''] || Zap;
                        return (
                        <AnimatedDiv key={item.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ delay: idx * 0.1 }} style={{ willChange: "transform, opacity" }}>
                            <Card className="h-full border-white/5 bg-white/[0.01] backdrop-blur-3xl rounded-[32px] overflow-hidden hover:border-blue-500/30 transition-all duration-700 group">
                                <CardContent className="p-8 space-y-6">
                                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-white group-hover:scale-110 group-hover:bg-blue-500/10 transition-all duration-500">
                                        <Icon size={32} />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-semibold text-xl text-white">{item.name}</h3>
                                            <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-400 border-none">{item.status}</Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground font-medium leading-relaxed">{item.description}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </AnimatedDiv>
                    );})}
                </div>

                <div className="bg-white/5 border border-white/10 rounded-[50px] p-8 md:p-16 flex flex-col md:flex-row items-center gap-12 overflow-hidden relative group">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />
                    <div className="flex-1 space-y-6 relative z-10 text-center md:text-left">
                        <h2 className="text-4xl md:text-6xl font-semibold tracking-tighter text-white">{cta?.title ?? ""}</h2>
                        <p className="text-lg text-muted-foreground font-medium">{cta?.description ?? ""}</p>
                        <Button className="h-14 px-10 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-xl shadow-blue-600/20" asChild>
                            <Link href="/contact">
                                {cta?.buttonText ?? ""} <ArrowRight className="w-5 h-5 ml-2" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

import Link from "next/link";
import { cn } from "@/lib/utils";


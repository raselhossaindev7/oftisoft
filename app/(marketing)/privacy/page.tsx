import { AnimatedDiv, AnimatedH1, AnimatedH2, AnimatedH3, AnimatedP } from "@/lib/animated";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { 
    ShieldCheck, Lock, Eye, Database, Globe, UserCheck, Server, Fingerprint
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string; size?: number }>> = {
    ShieldCheck, Lock, Eye, Database, Globe, UserCheck, Server, Fingerprint
};

const pageData = {
    header: { badge: "DATA GOVERNANCE", titlePrefix: "Your Privacy", titleHighlight: "Matters", description: "We take your data privacy seriously. This policy outlines how we collect, use, store, and protect your personal information when you use our services." },
    features: [
        { id: "encryption", iconName: "Lock", color: "text-blue-400", title: "End-to-End Encryption", description: "All data in transit is encrypted with TLS 1.3. Data at rest is encrypted using AES-256. We never store passwords in plain text — they're salted and hashed with bcrypt." },
        { id: "data-minimization", iconName: "Database", color: "text-green-400", title: "Data Minimization", description: "We only collect data necessary to provide our services. No unnecessary tracking, no third-party data brokers, and no invasive analytics." },
        { id: "gdpr", iconName: "Globe", color: "text-purple-400", title: "GDPR & CCPA Compliant", description: "Full compliance with GDPR, CCPA, and other global privacy regulations. You have the right to access, export, and delete your data at any time." },
        { id: "access-control", iconName: "UserCheck", color: "text-cyan-400", title: "Strict Access Control", description: "Role-based access control (RBAC) with multi-factor authentication. Every access is logged and audited. Zero-trust architecture across all systems." },
        { id: "breach-protection", iconName: "ShieldCheck", color: "text-orange-400", title: "Breach Protection", description: "24/7 intrusion detection, automated threat response, and regular third-party penetration testing. We have a dedicated security incident response team." },
        { id: "data-portability", iconName: "Server", color: "text-pink-400", title: "Data Portability", description: "You can export your data in standard formats (JSON, CSV) at any time. No vendor lock-in. We'll help you migrate your data if you choose another provider." },
    ],
    guarantee: {
        title: "Our Privacy Guarantee",
        description: "We will never sell your personal data to third parties. Your data belongs to you. Period.",
        stats: [
            { value: "99.99%", label: "DATA PROTECTED" },
            { value: "0", label: "DATA BREACHES" },
            { value: "24/7", label: "SECURITY MONITORING" },
        ]
    },
    footer: { status: "This policy was last updated on May 1, 2026. We'll notify you of any material changes via email." }
};

export default function PrivacyPage() {
    const { header, features, guarantee, footer } = pageData;

    return (
        <div className="relative min-h-screen pt-32 pb-24 bg-[#020202]">
            {/* Background Texture & Orbs */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-blue-600/10 rounded-full blur-[140px] opacity-40" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-primary/5 rounded-full blur-[120px] opacity-30" />
                <div className="absolute inset-0 bg-grain opacity-[0.02]" />
            </div>

            <div className="container px-6 mx-auto relative z-10 space-y-24">
                {/* Header Section */}
                <div className="text-center space-y-6 max-w-4xl mx-auto">
                    <AnimatedDiv initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                        <Badge variant="outline" className="px-6 py-2 rounded-full border-blue-500/30 bg-blue-500/5 text-blue-400 font-semibold tracking-[0.3em] text-xs">
                            {header?.badge ?? ""}
                        </Badge>
                    </AnimatedDiv>
                    <AnimatedH1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-semibold tracking-tighter text-white"
                    >
                        {header?.titlePrefix ?? ""} <span className="text-blue-500">{header?.titleHighlight ?? ""}</span>.
                    </AnimatedH1>
                    <AnimatedP className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto">
                        {header?.description ?? ""}
                    </AnimatedP>
                </div>

                {/* Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((item, idx) => {
                        const Icon = iconMap[item.iconName] || Lock;
                        return (
                        <AnimatedDiv key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-80px" }}
                            transition={{ delay: idx * 0.1 }}
                            style={{ willChange: "transform, opacity" }}
                        >
                            <Card className="group h-full border-white/5 bg-white/[0.02] backdrop-blur-3xl rounded-[40px] overflow-hidden hover:border-blue-500/30 hover:bg-white/[0.04] transition-all duration-700">
                                <CardContent className="p-10 space-y-6">
                                    <div className={cn("w-14 h-14 rounded-2xl bg-muted/30 flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-6", item.color)}>
                                        <Icon size={28} />
                                    </div>
                                    <div className="space-y-4">
                                        <h3 className="text-2xl font-semibold text-white tracking-tight leading-tight">{item.title}</h3>
                                        <p className="text-sm text-muted-foreground font-medium leading-relaxed">{item.description}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </AnimatedDiv>

                        );
                    })}
                </div>

                {/* Privacy Guarantee Block */}
                <div className="bg-gradient-to-br from-blue-500/5 via-background to-background border border-white/10 rounded-[50px] p-12 md:p-20 relative overflow-hidden group">
                     <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 blur-[120px] rounded-full pointer-events-none group-hover:scale-125 transition-transform duration-1000" />
                     <div className="grid lg:grid-cols-2 gap-12 items-center relative z-10">
                            <div className="space-y-6">
                                <div className="flex items-center gap-4 text-blue-500">
                                    <ShieldCheck size={40} />
                                    <h2 className="text-4xl md:text-6xl font-semibold tracking-tighter text-white">{guarantee?.title ?? ""}</h2>
                                </div>
                                <p className="text-xl text-muted-foreground font-medium leading-relaxed">
                                    {guarantee?.description ?? ""}
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-end">
                                {guarantee?.stats.map((stat, i) => (
                                    <Card key={i} className="bg-white/5 border-white/10 rounded-3xl p-6 text-center space-y-2">
                                        <h4 className="text-2xl font-semibold text-white tracking-tight">{stat.value}</h4>
                                        <p className="text-xs font-semibold text-blue-400 tracking-widest">{stat.label}</p>
                                    </Card>
                                ))}
                            </div>
                     </div>
                </div>

                {/* Sub-Footer Meta */}
                <div className="pt-12 text-center">
                    <p className="text-xs font-semibold tracking-[0.4rem] text-muted-foreground">
                        {footer?.status ?? ""}
                    </p>
                </div>
            </div>
        </div>
    );
}


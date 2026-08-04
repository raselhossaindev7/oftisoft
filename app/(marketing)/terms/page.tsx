import { AnimatedDiv, AnimatedH1, AnimatedH2, AnimatedH3, AnimatedP } from "@/lib/animated";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { 
    Shield, 
    Lock, 
    Eye, 
    FileText, 
    Clock, 
    Globe, 
    Scale,
    ShieldAlert
} from "lucide-react";
import { cn } from "@/lib/utils";
const iconMap: Record<string, React.ComponentType<{ className?: string; size?: number }>> = {
    Globe, Scale, ShieldAlert, Clock, Lock, Eye, FileText, ShieldCheck: Shield,
};

const pageData = {
    header: { badge: "LEGAL FRAMEWORK", title: "Terms of Service Sync.", description: "These terms govern your use of Oftisoft's software development services, digital products, and website. By engaging our services, you agree to these terms." },
    navigationRail: { title: "SECTIONS", items: ["Service Terms", "Intellectual Property", "Payment Terms", "Confidentiality", "Limitations", "Termination", "Dispute Resolution", "Governing Law"] },
    sections: [
        { id: "s1", iconName: "Scale", title: "1. Service Terms", content: "We agree to provide software development services as outlined in the mutually agreed Statement of Work (SOW). Each SOW shall specify deliverables, timelines, milestones, and payment terms. Services are provided on a best-efforts basis with commercially reasonable skill and care. Any changes to scope must be agreed upon in writing via a Change Order." },
        { id: "s2", iconName: "Lock", title: "2. Intellectual Property", content: "Upon full payment, all intellectual property rights for custom-developed code, designs, and deliverables are transferred to you. We retain the right to use generalized knowledge, methodologies, and non-client-specific code patterns acquired during the engagement. Any third-party libraries or tools used remain under their respective licenses." },
        { id: "s3", iconName: "ShieldAlert", title: "3. Payment Terms", content: "Invoices are due within 15 days of receipt. Late payments may incur a 1.5% monthly finance charge. All prices are in USD unless otherwise specified. We accept payments via bank transfer, Stripe, and PayPal. For projects over $10,000, a 50% deposit is required before work begins." },
        { id: "s4", iconName: "Eye", title: "4. Confidentiality", content: "Both parties agree to maintain strict confidentiality of all proprietary information shared during the engagement. This includes source code, business strategies, customer data, and trade secrets. This obligation survives the termination of our agreement for 3 years." },
        { id: "s5", iconName: "FileText", title: "5. Limitations of Liability", content: "Our liability is limited to the total amount paid for the specific service giving rise to the claim. We are not liable for indirect, incidental, or consequential damages, including lost profits or data. This does not apply in cases of gross negligence or willful misconduct." },
        { id: "s6", iconName: "Globe", title: "6. Termination", content: "Either party may terminate with 30 days written notice. In case of material breach, the non-breaching party may terminate immediately with written notice. Upon termination, you pay for all work completed up to the termination date. Proprietary deliverables completed before termination are transferred to you upon payment." },
        { id: "s7", iconName: "Scale", title: "7. Dispute Resolution", content: "Any disputes shall first be attempted to be resolved through good-faith negotiations. If unresolved within 30 days, disputes shall be settled by binding arbitration in accordance with the Bangladesh International Arbitration Centre (BIAC) rules." },
        { id: "s8", iconName: "Clock", title: "8. Governing Law", content: "These terms are governed by the laws of Bangladesh. Both parties submit to the exclusive jurisdiction of the courts of Khulna, Bangladesh for any matters not subject to arbitration." },
    ],
    revision: { prefix: "LAST SYNCHRONIZED:", updatedAt: "May 1, 2026" }
};

export default function TermsPage() {
    const { header, navigationRail, sections, revision } = pageData;

    return (
        <div className="relative min-h-screen pt-32 pb-24 bg-[#020202]">
            {/* Background Texture & Orbs */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[10%] right-[-10%] w-[60vw] h-[60vw] bg-primary/10 rounded-full blur-[140px] opacity-40" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-indigo-600/5 rounded-full blur-[120px] opacity-30" />
                <div className="absolute inset-0 bg-grain opacity-[0.02]" />
            </div>

            <div className="container px-6 mx-auto relative z-10 space-y-24">
                {/* Header Section */}
                <div className="text-center space-y-6 max-w-4xl mx-auto">
                    <AnimatedDiv initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                        <Badge variant="outline" className="px-6 py-2 rounded-full border-primary/30 bg-primary/5 text-primary font-semibold tracking-[0.3em] text-xs">
                            {header.badge}
                        </Badge>
                    </AnimatedDiv>
                    <AnimatedH1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-semibold tracking-tighter text-white"
                    >
                        {header.title.split(" ").map((word, i) => (
                            <span key={i} className={cn(word.toLowerCase() === "sync." ? "text-primary NOT-italic" : "")}>
                                {word}{" "}
                            </span>
                        ))}
                    </AnimatedH1>
                    <AnimatedP className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto">
                        {header.description}
                    </AnimatedP>
                </div>

                {/* Content Matrix */}
                <div className="grid lg:grid-cols-12 gap-12 max-w-7xl mx-auto">
                    {/* Navigation Rail */}
                    <div className="lg:col-span-4 space-y-8 hidden lg:block">
                        <Card className="border-white/5 bg-white/[0.02] backdrop-blur-3xl rounded-[40px] p-8 sticky top-32">
                            <h3 className="text-xs font-semibold tracking-[0.3em] text-primary mb-6">{navigationRail.title}</h3>
                            <ul className="space-y-6">
                                {navigationRail.items.map((item, idx) => (
                                    <li key={idx} className="flex items-center gap-4 group cursor-pointer hover:text-primary transition-all">
                                        <div className="w-1 h-1 rounded-full bg-border group-hover:bg-primary transition-all group-hover:scale-150" />
                                        <span className="text-sm font-bold text-muted-foreground group-hover:text-white transition-all">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </Card>
                    </div>

                    {/* Main Legal Artifacts */}
                    <div className="lg:col-span-12 xl:col-span-8 space-y-16">
                        {sections.map((section, idx) => {
                            const Icon = iconMap[section.iconName] || FileText;
                            return (
                                <AnimatedDiv key={section.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5 }}
                                    style={{ willChange: "transform, opacity" }}
                                >
                                    <Card className="border-white/5 bg-white/[0.01] rounded-[40px] p-10 md:p-14 space-y-8 hover:bg-white/[0.02] transition-all duration-700">
                                        <div className="flex items-center gap-6">
                                            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                                <Icon size={32} />
                                            </div>
                                            <h3 className="text-3xl font-semibold text-white tracking-tight">{section.title}</h3>
                                        </div>
                                        <p className="text-xl text-muted-foreground font-medium leading-relaxed">
                                            {section.content}
                                        </p>
                                    </Card>
                                </AnimatedDiv>
                            );
                        })}

                        {/* Revision Node */}
                        <div className="pt-12 text-center lg:text-left">
                            <p className="text-xs font-semibold tracking-[0.4rem] text-muted-foreground">
                                {revision.prefix} {revision.updatedAt}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}



"use client"
import { AnimatedDiv } from "@/lib/animated";

import { ShieldCheck, RotateCcw, Zap, BookmarkCheck } from "lucide-react";
const promises = [
    {
        icon: ShieldCheck,
        title: "6 Months Support",
        desc: "Direct support from our core development team."
    },
    {
        icon: RotateCcw,
        title: "Free Updates",
        desc: "Lifetime updates for minor versions and fixes."
    },
    {
        icon: BookmarkCheck,
        title: "Verified Codebase",
        desc: "Every line is audited for security and performance."
    },
    {
        icon: Zap,
        title: "Clean Documentation",
        desc: "Built-in guides for quick setup and scaling."
    }
];

export function SupportPromise() {
    return (
        <section className="py-20">
            <div className="container px-4 mx-auto">
                <div className="bg-primary/5 border border-primary/20 rounded-[3rem] p-8 md:p-16 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] -mr-32 -mt-32" />
                    
                    <div className="relative z-10 grid md:grid-cols-2 lg:grid-cols-4 gap-12">
                        {promises.map((p, i) => (
                            <AnimatedDiv key={p.title}
                                initial={{ opacity: 0, y: 10 }}
                                style={{ willChange: "transform, opacity" }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                viewport={{ once: true }}
                                className="space-y-4"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                    <p.icon className="w-6 h-6" />
                                </div>
                                <h3 className="font-bold text-lg">{p.title}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
                            </AnimatedDiv>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

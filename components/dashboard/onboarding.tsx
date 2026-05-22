"use client"
import { useState, useEffect } from "react";
import { X, ChevronRight, Zap, ShieldCheck, Rocket } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
    {
        id: "step-1",
        title: "Welcome to dashboard",
        desc: "Your new command center for scalable web management.",
        icon: Rocket,
        color: "from-blue-500 to-indigo-600",
        shadow: "shadow-blue-500/30"
    },
    {
        id: "step-2",
        title: "Smart Analytics",
        desc: "Real-time insights and predictive performance metrics.",
        icon: Zap,
        color: "from-yellow-500 to-amber-600",
        shadow: "shadow-yellow-500/30"
    },
    {
        id: "step-3",
        title: "Secure Operations",
        desc: "Enterprise-grade security with advanced encryption.",
        icon: ShieldCheck,
        color: "from-green-500 to-emerald-600",
        shadow: "shadow-green-500/30"
    }
];

export default function OnboardingTutorial() {
    const [step, setStep] = useState(0);
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined' && window.location.search.includes('demo=true')) {
            setShow(true);
        } else {
            const hasSeen = localStorage.getItem("onboarding_complete_v2");
            if (!hasSeen) {
                const timer = setTimeout(() => setShow(true), 1500);
                return () => clearTimeout(timer);
            }
        }
    }, []);

    const close = () => {
        setShow(false);
        localStorage.setItem("onboarding_complete_v2", "true");
    };

    const next = () => {
        if (step < STEPS.length - 1) {
            setStep(step + 1);
        } else {
            close();
        }
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-[100] grid place-items-center p-6 bg-black/60 backdrop-blur-md">
            <div className="w-full max-w-md bg-card/95 border border-border rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute -top-20 -right-20 w-60 h-60 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

                <button onClick={close}
                    className="absolute top-6 right-6 p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors z-10 cursor-pointer"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="relative z-10">
                    <div key={step} className="flex flex-col items-center text-center space-y-8 py-4">
                        <div className={cn(
                            "w-24 h-24 rounded-3xl flex items-center justify-center bg-gradient-to-br shadow-xl",
                            STEPS[step].color,
                            STEPS[step].shadow
                        )}>
                            {(() => {
                                const Icon = STEPS[step].icon;
                                return <Icon className="w-10 h-10 text-white" />;
                            })()}
                        </div>

                        <div className="space-y-4 max-w-xs">
                            <h2 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70">
                                {STEPS[step].title}
                            </h2>
                            <p className="text-muted-foreground leading-relaxed">
                                {STEPS[step].desc}
                            </p>
                        </div>
                    </div>

                    <div className="mt-12 space-y-8">
                        <div className="flex justify-center gap-2">
                            {STEPS.map((_, i) => (
                                <div key={i}
                                    className={cn("h-1.5 rounded-full transition-all duration-300",
                                        i === step ? "w-12 bg-primary" : "w-12 bg-muted"
                                    )}
                                />
                            ))}
                        </div>

                        <button onClick={next}
                            className="w-full py-4 bg-primary text-white rounded-2xl font-bold text-lg shadow-lg shadow-primary/25 hover:shadow-xl hover:scale-[1.02] hover:bg-primary/90 active:scale-95 transition-all flex items-center justify-center gap-3 group cursor-pointer"
                        >
                            <span>{step === STEPS.length - 1 ? "Get Started" : "Continue"}</span>
                            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

"use client"
import { Animated, AnimatedDiv, AnimatedH2, AnimatePresence } from "@/lib/animated";

import { CheckCircle2, ArrowRight, Mail, MapPin, Phone } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Link from "next/link";

// ... imports
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useLeads } from "@/hooks/useLeads";

export default function CTA() {
    const ctaContent = {
        title: "Let's Build the Next Big Thing.",
        description: "Have a project in mind? We'd love to hear about it. Schedule a free 15-min discovery call to discuss your vision.",
        buttonText: "Start Conversation",
        buttonLink: "/contact",
        contactInfo: {
            email: 'oftisoft@gmail.com',
            phone: '+8801757220402',
            location: 'Satkhira, Khulna, Bangladesh'
        }
    };

    const { createLead, isCreating } = useLeads();
    const [formState, setFormState] = useState<'idle' | 'success'>('idle');

    const handleSubmit = async (e: React.FormEvent<HTMLElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget as HTMLFormElement);
        const data = {
            name: `${formData.get('firstName')} ${formData.get('lastName')}`,
            email: formData.get('email') as string,
            message: formData.get('details') as string,
            type: 'contact' as any
        };

        createLead(data, {
            onSuccess: () => {
                setFormState('success');
            }
        });
    };


    return (
        <section id="contact" className="py-16 md:py-24 bg-background relative overflow-hidden z-10">
            {/* Consistent Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

            <div className="container px-4 mx-auto">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-start">
                    
                    {/* Left: Content Info */}
                    <div className="max-w-xl pt-8 order-2 lg:order-1">
                        <AnimatedH2 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-80px" }}
                            transition={{ duration: 0.5 }}
                            style={{ willChange: "transform, opacity" }}
                            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-6 leading-tight"
                        >
                            {ctaContent.title.split(' ').slice(0, -2).join(' ')}{' '}
                            <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                                {ctaContent.title.split(' ').slice(-2).join(' ')}
                            </span>
                        </AnimatedH2>

                        <p className="text-base sm:text-lg md:text-xl text-muted-foreground/80 mb-8 md:mb-12 leading-relaxed">
                            {ctaContent.description}
                        </p>

                        <div className="space-y-6">
                             {ctaContent.contactInfo && (
                                <>
                                    <ContactItem icon={Mail} title="Email Us" value={ctaContent.contactInfo.email} delay={0.1} />
                                    <ContactItem icon={Phone} title="Call Us" value={ctaContent.contactInfo.phone} delay={0.2} />
                                    <ContactItem icon={MapPin} title="HQ" value={ctaContent.contactInfo.location} delay={0.3} />
                                </>
                             )}
                        </div>
                    </div>

                    {/* Right: Modern Glass Form */}
                    <AnimatedDiv initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-80px" }}
                        transition={{ duration: 0.5 }}
                        style={{ willChange: "transform, opacity" }}
                        className="relative order-1 lg:order-2"
                    >
                        {/* Glow Behind Form */}
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-[2rem] blur-2xl transform rotate-3 scale-95 -z-10" />

                        <div className="bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 p-6 md:p-8 lg:p-10 xl:p-12 rounded-3xl md:rounded-[2rem] shadow-2xl overflow-hidden relative">
                             {/* Decorative noise */}
                            <div className="absolute inset-0 bg-grain opacity-[0.05] pointer-events-none" />

                            <AnimatePresence mode="wait">
                                {formState === 'success' ? (
                                    <AnimatedDiv key="success"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="min-h-[420px] flex flex-col items-center justify-center text-center p-8"
                                    >
                                        <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-6 text-green-500 animate-pulse">
                                            <CheckCircle2 className="w-12 h-12" />
                                        </div>
                                        <h3 className="text-3xl font-bold text-white mb-3">Message Received!</h3>
                                        <p className="text-muted-foreground mb-8 text-lg">
                                            We've sent a confirmation email to your inbox. Expect a reply within 24 hours.
                                        </p>
                                        <Button onClick={() => setFormState('idle')}
                                            variant="outline"
                                            className="px-6 py-3 rounded-full border-white/10 hover:bg-white/10 text-white font-medium transition-colors h-auto"
                                        >
                                            Send another message
                                        </Button>
                                    </AnimatedDiv>
                                ) : (
                                    <Animated as="form"
                                        key="form"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        onSubmit={handleSubmit}
                                        className="space-y-5"
                                    >
                                        <div className="grid grid-cols-2 gap-5">
                                            <div className="space-y-2">
                                                <Label htmlFor="firstName" className="text-xs font-semibold tracking-wide text-white/60 ml-1">First Name</Label>
                                                <Input id="firstName" name="firstName" required placeholder="Jane" className="bg-white/5 border-white/10 text-white placeholder:text-white/20 h-12 rounded-xl focus-visible:ring-primary/50" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="lastName" className="text-xs font-semibold tracking-wide text-white/60 ml-1">Last Name</Label>
                                                <Input id="lastName" name="lastName" required placeholder="Doe" className="bg-white/5 border-white/10 text-white placeholder:text-white/20 h-12 rounded-xl focus-visible:ring-primary/50" />
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <Label htmlFor="email" className="text-xs font-semibold tracking-wide text-white/60 ml-1">Email</Label>
                                            <Input id="email" name="email" required type="email" placeholder="jane@example.com" className="bg-white/5 border-white/10 text-white placeholder:text-white/20 h-12 rounded-xl focus-visible:ring-primary/50" />
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <Label htmlFor="details" className="text-xs font-semibold tracking-wide text-white/60 ml-1">Project Details</Label>
                                            <Textarea 
                                                id="details"
                                                name="details"
                                                required 
                                                rows={4} 
                                                className="bg-white/5 border-white/10 text-white placeholder:text-white/20 rounded-xl focus-visible:ring-primary/50 resize-none"
                                                placeholder="Tell us a bit about your goals..."
                                            />
                                        </div>

                                        <Button type="submit"
                                            disabled={isCreating}
                                            className="group w-full h-auto py-4 bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98]"
                                        >
                                            {isCreating ? (
                                                <span className="flex items-center gap-2">
                                                    <span className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                                                    Sending...
                                                </span>
                                            ) : (
                                                <>
                                                    {ctaContent.buttonText}
                                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                                </>
                                            )}
                                        </Button>
                                        
                                        <p className="text-xs text-center text-muted-foreground mt-4">
                                            By submitting, you agree to our <Link href="/privacy" className="underline hover:text-white">Privacy Policy</Link>.
                                        </p>
                                    </Animated>
                                )}
                            </AnimatePresence>
                        </div>
                    </AnimatedDiv>
                </div>
            </div>
        </section>
    );
}

function ContactItem({ icon: Icon, title, value, delay }: { icon: React.ComponentType<{ className?: string }>, title: string, value: string, delay: number }) {
    const isEmail = title.toLowerCase().includes('email');
    const isPhone = title.toLowerCase().includes('phone') || title.toLowerCase().includes('call');
    const href = isEmail ? `mailto:${value}` : isPhone ? `tel:${value.replace(/[^0-9+]/g, '')}` : undefined;

    const Content = (
        <AnimatedDiv 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.4, delay: delay }}
            style={{ willChange: "transform, opacity" }}
            className="flex items-center my-4 space-x-6 group cursor-pointer"
        >
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-primary/20 group-hover:border-primary/50 transition-colors duration-300">
                <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
                <h4 className="text-sm font-semibold text-white/40 tracking-wide mb-1 group-hover:text-primary transition-colors">{title}</h4>
                <p className="text-lg font-medium text-white">{value}</p>
            </div>
        </AnimatedDiv>
    );

    if (href) {
        return <a href={href}>{Content}</a>;
    }

    return Content;
}



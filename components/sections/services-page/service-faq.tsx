"use client"
import { AnimatedDiv, AnimatedH1, AnimatedH2, AnimatedH3, AnimatedP, AnimatePresence } from "@/lib/animated";
;

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
    Accordion, AccordionContent, AccordionItem, AccordionTrigger 
} from "@/components/ui/accordion";
import { HelpCircle, Search, Mail, MessageSquare, Sparkles } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
const faqs = [
    { id: "1", question: "How long does a typical project take?", answer: "MVP web applications typically take 4-8 weeks. Mobile apps 6-12 weeks. AI integrations 8-16 weeks. Timelines depend on scope and complexity — we'll give you a precise estimate during the discovery call." },
    { id: "2", question: "What is your development process?", answer: "We follow an agile methodology with 2-week sprints. You'll get a dedicated project manager, daily standup summaries, and access to a real-time project dashboard. Code is reviewed, tested, and deployed continuously." },
    { id: "3", question: "Do you offer post-launch support?", answer: "Yes. Every project includes a support period (1-6 months depending on package). We also offer ongoing maintenance retainers for monitoring, updates, security patches, and feature enhancements." },
    { id: "4", question: "Can you work with our existing codebase?", answer: "Absolutely. We regularly take over existing projects, conduct code audits, refactor legacy code, and add new features. Our team is experienced with a wide range of frameworks and codebases." },
    { id: "5", question: "How do you handle data security?", answer: "Security is baked into our process. We follow OWASP guidelines, encrypt data at rest and in transit, conduct regular vulnerability scans, and sign NDAs. Enterprise clients can request SOC 2 compliance." },
    { id: "6", question: "What technologies do you use?", answer: "Our core stack includes React/Next.js, Node.js, TypeScript, Python, PostgreSQL, and AWS. But we're technology-agnostic — we choose the best tools for your specific project requirements." },
    { id: "7", question: "How do you charge for projects?", answer: "We work on a fixed-price basis for well-defined projects and hourly/weekly retainers for ongoing work. Every quote is transparent with no hidden fees. We also offer milestone-based payments." },
    { id: "8", question: "Can you scale our team up or down?", answer: "Yes. Our team model allows you to scale engineering capacity up or down as your needs change. You can start with 2 engineers and grow to 10+ without changing vendors." },
];

export default function ServiceFAQ() {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredFaqs = faqs.filter((faq: any) => 
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <section className="py-16 md:py-24 bg-background relative overflow-hidden">
             {/* Consistent Grid Background */}
             <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
             
            <div className="container px-4 mx-auto max-w-4xl relative z-10">
                <div className="text-center mb-12">
                    <AnimatedDiv 
                        initial={{ opacity: 0, y: 20 }}
                        style={{ willChange: "transform, opacity" }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="flex justify-center"
                    >
                        <Badge variant="outline" className="gap-2 px-3 py-1 bg-primary/10 border-primary/20 text-primary hover:bg-primary/20 transition-colors backdrop-blur-sm">
                            <HelpCircle className="w-3.5 h-3.5" />
                            FAQ
                        </Badge>
                    </AnimatedDiv>
                    
                    <AnimatedH2 
                        initial={{ opacity: 0, y: 20 }}
                        style={{ willChange: "transform, opacity" }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold mt-6 mb-4 tracking-tight"
                    >
                        Got Questions?
                    </AnimatedH2>
                    <AnimatedP 
                        initial={{ opacity: 0, y: 20 }}
                        style={{ willChange: "transform, opacity" }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-muted-foreground text-lg"
                    >
                        We've got accurate answers.
                    </AnimatedP>
                </div>

                {/* Search Bar */}
                <AnimatedDiv 
                    initial={{ opacity: 0, y: 20 }}
                    style={{ willChange: "transform, opacity" }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                    className="relative mb-12"
                >
                    <div className="relative group max-w-lg mx-auto">
                        <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative bg-card/50 backdrop-blur-sm rounded-2xl border border-border shadow-lg overflow-hidden flex items-center p-2 focus-within:ring-2 focus-within:ring-primary/50 transition-all">
                            <Search className="w-5 h-5 text-muted-foreground ml-3 mr-2" />
                            <Input 
                                placeholder="Search questions..." 
                                className="border-none shadow-none focus-visible:ring-0 bg-transparent h-12 text-lg"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </AnimatedDiv>

                {/* FAQ Accordion */}
                <AnimatedDiv 
                    layout initial={{ opacity: 0 }}
                    style={{ willChange: "transform, opacity" }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 }}
                    className="space-y-4"
                >
                    <Accordion type="single" collapsible className="w-full space-y-4">
                        <AnimatePresence>
                            {filteredFaqs.length > 0 ? (
                                filteredFaqs.map((faq: any, i: number) => (
                                    <AnimatedDiv key={i}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                    >
                                        <AccordionItem value={`item-${i}`} className="border border-border/50 rounded-xl px-6 bg-card/30 backdrop-blur-sm hover:bg-card/50 transition-all duration-300">
                                            <AccordionTrigger className="text-left font-bold text-lg hover:text-primary hover:no-underline py-6">
                                                {faq.question}
                                            </AccordionTrigger>
                                            <AccordionContent className="text-muted-foreground leading-relaxed text-base pb-6">
                                                {faq.answer}
                                            </AccordionContent>
                                        </AccordionItem>
                                    </AnimatedDiv>
                                ))
                            ) : (
                                <AnimatedDiv 
                                    initial={{ opacity: 0 }} 
                                    animate={{ opacity: 1 }}
                                    className="text-center py-12 text-muted-foreground"
                                >
                                    <p>No matching questions found.</p>
                                </AnimatedDiv>
                            )}
                        </AnimatePresence>
                    </Accordion>
                </AnimatedDiv>

                {/* Contact CTA */}
                <AnimatedDiv 
                    initial={{ opacity: 0, y: 20 }}
                    style={{ willChange: "transform, opacity" }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="mt-16 text-center bg-card/30 backdrop-blur-md rounded-3xl p-8 md:p-12 border border-border relative overflow-hidden group"
                >
                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <h3 className="text-2xl font-bold mb-4 relative z-10">Still have questions?</h3>
                    <p className="text-muted-foreground mb-8 max-w-md mx-auto relative z-10">
                        Can't find the answer you're looking for? Please chat to our friendly team.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
                        <Button asChild size="lg" className="rounded-full font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all bg-primary text-primary-foreground">
                            <Link href="/contact">
                                <Mail className="mr-2 w-4 h-4" />
                                Contact Support
                            </Link>
                        </Button>
                        <Button asChild variant="outline" size="lg" className="rounded-full font-bold hover:scale-105 transition-all bg-background/50 backdrop-blur-sm">
                            <Link href="#chat">
                                <MessageSquare className="mr-2 w-4 h-4" />
                                Live Chat
                            </Link>
                        </Button>
                    </div>
                </AnimatedDiv>
            </div>
        </section>
    );
}

"use client";

import { useState } from "react";
import { Star, Quote, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { testimonialsAPI } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function TestimonialSubmissionForm() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [rating, setRating] = useState(5);
    const [hoveredStar, setHoveredStar] = useState(0);
    const [formData, setFormData] = useState({
        name: "",
        role: "",
        company: "",
        quote: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.quote.trim()) {
            toast.error("Name and quote are required");
            return;
        }
        setIsSubmitting(true);
        try {
            await testimonialsAPI.create({
                ...formData,
                rating,
                isActive: false,
            });
            setIsSubmitted(true);
            toast.success("Thank you! Your testimonial has been submitted for review.");
        } catch {
            toast.error("Failed to submit testimonial. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSubmitted) {
        return (
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm text-center">
                <CardContent className="py-12">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                        <Quote className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Thank You!</h3>
                    <p className="text-muted-foreground max-w-sm mx-auto">
                        Your testimonial has been submitted and will be visible after moderation.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                    <Quote className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-2xl">Share Your Experience</CardTitle>
                <CardDescription>
                    We value your feedback. Tell us about your experience working with us.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium">Name <span className="text-destructive">*</span></Label>
                            <Input placeholder="Your name" className="rounded-lg h-10"
                                value={formData.name}
                                onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium">Role</Label>
                            <Input placeholder="CEO, Founder, etc." className="rounded-lg h-10"
                                value={formData.role}
                                onChange={(e) => setFormData(p => ({ ...p, role: e.target.value }))} />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-xs font-medium">Company</Label>
                        <Input placeholder="Company name" className="rounded-lg h-10"
                            value={formData.company}
                            onChange={(e) => setFormData(p => ({ ...p, company: e.target.value }))} />
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-xs font-medium">Rating</Label>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button key={star} type="button"
                                    onMouseEnter={() => setHoveredStar(star)}
                                    onMouseLeave={() => setHoveredStar(0)}
                                    onClick={() => setRating(star)}
                                    className="transition-all hover:scale-110"
                                >
                                    <Star className={cn(
                                        "w-7 h-7 transition-colors",
                                        star <= (hoveredStar || rating)
                                            ? "fill-amber-500 text-amber-500"
                                            : "fill-none text-muted-foreground/30"
                                    )} />
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-xs font-medium">Your Story <span className="text-destructive">*</span></Label>
                        <Textarea placeholder="Tell us about your experience..." className="rounded-lg min-h-[120px] resize-none"
                            value={formData.quote}
                            onChange={(e) => setFormData(p => ({ ...p, quote: e.target.value }))} />
                    </div>
                    <Button type="submit" className="w-full rounded-xl h-11 gap-2 font-medium"
                        disabled={isSubmitting}>
                        {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : <><Send className="w-4 h-4" /> Submit Testimonial</>}
                    </Button>
                    <p className="text-xs text-center text-muted-foreground">
                        Your testimonial will be reviewed before being published.
                    </p>
                </form>
            </CardContent>
        </Card>
    );
}

"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Star, Quote, Edit, Trash2, Eye, EyeOff, Calendar, Building, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { testimonialsAPI, type Testimonial } from "@/lib/api";
import { toast } from "sonner";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

export default function TestimonialDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const [testimonial, setTestimonial] = useState<Testimonial | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [deleteOpen, setDeleteOpen] = useState(false);

    useEffect(() => {
        if (!id) return;
        setIsLoading(true);
        testimonialsAPI.getOne(id)
            .then(setTestimonial)
            .catch(() => { toast.error("Failed to load testimonial"); router.push("/dashboard/testimonials"); })
            .finally(() => setIsLoading(false));
    }, [id, router]);

    const handleDelete = async () => {
        try {
            await testimonialsAPI.delete(id);
            toast.success("Testimonial deleted");
            router.push("/dashboard/testimonials");
        } catch {
            toast.error("Failed to delete");
        }
    };

    const handleToggleActive = async () => {
        if (!testimonial) return;
        try {
            await testimonialsAPI.update(id, { isActive: !testimonial.isActive });
            setTestimonial(prev => prev ? { ...prev, isActive: !prev.isActive } : null);
            toast.success(`Testimonial ${testimonial.isActive ? "deactivated" : "activated"}`);
        } catch {
            toast.error("Failed to update status");
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-8">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-xl" />
                    <div><Skeleton className="h-8 w-64" /><Skeleton className="h-4 w-48 mt-2" /></div>
                </div>
                <Card className="border-border/50"><CardContent className="p-8 space-y-4">
                    <Skeleton className="h-8 w-48" /><Skeleton className="h-32 w-full" />
                </CardContent></Card>
            </div>
        );
    }

    if (!testimonial) return null;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild className="rounded-xl">
                        <Link href="/dashboard/testimonials"><ArrowLeft className="w-5 h-5" /></Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">{testimonial.name}</h1>
                        <p className="text-sm text-muted-foreground">Testimonial details</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="gap-2 rounded-xl" onClick={handleToggleActive}>
                        {testimonial.isActive ? <><EyeOff className="w-4 h-4" /> Deactivate</> : <><Eye className="w-4 h-4" /> Activate</>}
                    </Button>
                    <Button asChild variant="outline" className="gap-2 rounded-xl">
                        <Link href={`/dashboard/testimonials/${id}/edit`}><Edit className="w-4 h-4" /> Edit</Link>
                    </Button>
                    <Button variant="outline" className="gap-2 rounded-xl text-destructive" onClick={() => setDeleteOpen(true)}>
                        <Trash2 className="w-4 h-4" /> Delete
                    </Button>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                <Card className="md:col-span-2 border-border/50">
                    <CardHeader>
                        <div className="flex items-center gap-4 mb-4">
                            <Avatar className="h-16 w-16 border-2 border-background shadow-md rounded-xl">
                                <AvatarImage src={testimonial.avatar} />
                                <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg rounded-xl">
                                    {(testimonial.name || "T").split(" ").filter(Boolean).map(n => n[0]).join("").toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <CardTitle className="text-2xl">{testimonial.name}</CardTitle>
                                <div className="flex items-center gap-2 mt-1 text-muted-foreground text-sm">
                                    {testimonial.role && <span>{testimonial.role}</span>}
                                    {testimonial.company && <><span>&middot;</span><span>{testimonial.company}</span></>}
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Testimonial</h3>
                            <div className="bg-muted/20 rounded-2xl p-6 border border-border/30">
                                <Quote className="w-6 h-6 text-primary/30 mb-3" />
                                <p className="text-lg leading-relaxed italic">&ldquo;{testimonial.quote}&rdquo;</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                                <span className="font-bold">{testimonial.rating}/5</span>
                            </div>
                            <Badge variant={testimonial.isActive ? "default" : "secondary"}
                                className="rounded-lg gap-1">
                                {testimonial.isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                                {testimonial.isActive ? "Active" : "Inactive"}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border/50 h-fit">
                    <CardHeader>
                        <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-start gap-3">
                            <User className="w-4 h-4 text-muted-foreground mt-0.5" />
                            <div>
                                <p className="text-xs text-muted-foreground">Name</p>
                                <p className="text-sm font-medium">{testimonial.name}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Building className="w-4 h-4 text-muted-foreground mt-0.5" />
                            <div>
                                <p className="text-xs text-muted-foreground">Company</p>
                                <p className="text-sm font-medium">{testimonial.company || "\u2014"}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
                            <div>
                                <p className="text-xs text-muted-foreground">Created</p>
                                <p className="text-sm font-medium">{new Date(testimonial.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
                            <div>
                                <p className="text-xs text-muted-foreground">Updated</p>
                                <p className="text-sm font-medium">{new Date(testimonial.updatedAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Quote className="w-4 h-4 text-muted-foreground mt-0.5" />
                            <div>
                                <p className="text-xs text-muted-foreground">Order</p>
                                <p className="text-sm font-medium">{testimonial.order}</p>
                            </div>
                        </div>
                        {testimonial.gradient && (
                            <div className="flex items-start gap-3">
                                <div className={cn("w-4 h-4 rounded mt-0.5 bg-gradient-to-br", testimonial.gradient)} />
                                <div>
                                    <p className="text-xs text-muted-foreground">Gradient</p>
                                    <p className="text-sm font-medium font-mono text-xs">{testimonial.gradient}</p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogContent className="rounded-xl max-w-[400px] p-6">
                    <DialogHeader className="flex flex-col items-center text-center gap-2">
                        <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                            <Trash2 className="w-6 h-6 text-destructive" />
                        </div>
                        <DialogTitle>Delete testimonial?</DialogTitle>
                        <DialogDescription className="text-destructive">This action cannot be undone</DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex-col gap-2">
                        <Button className="w-full bg-destructive rounded-lg" onClick={handleDelete}>Delete</Button>
                        <Button variant="ghost" className="w-full rounded-lg" onClick={() => setDeleteOpen(false)}>Cancel</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

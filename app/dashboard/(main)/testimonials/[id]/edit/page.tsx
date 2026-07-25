"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Quote, ArrowLeft, Star, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { testimonialsAPI, type Testimonial } from "@/lib/api";
import { toast } from "sonner";
import Link from "next/link";

const RATING_OPTIONS = [1, 2, 3, 4, 5];

export default function EditTestimonialPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [testimonial, setTestimonial] = useState<Testimonial | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [avatar, setAvatar] = useState("");
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        role: "",
        company: "",
        quote: "",
        rating: 5,
        gradient: "",
        isActive: true,
        order: 0,
    });

    useEffect(() => {
        if (!id) return;
        setIsLoading(true);
        testimonialsAPI.getOne(id)
            .then((t) => {
                setTestimonial(t);
                setFormData({
                    name: t.name,
                    role: t.role || "",
                    company: t.company || "",
                    quote: t.quote,
                    rating: t.rating,
                    gradient: t.gradient || "",
                    isActive: t.isActive,
                    order: t.order,
                });
                setAvatar(t.avatar || "");
            })
            .catch(() => toast.error("Failed to load testimonial"))
            .finally(() => setIsLoading(false));
    }, [id]);

    const handleAvatarUpload = async (file: File) => {
        if (!file || !file.type.startsWith("image/")) { toast.error("Please select an image file"); return; }
        setIsUploading(true);
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);
        try {
            const fd = new FormData();
            fd.append("file", file);
            const response = await fetch("/api/upload", { method: "POST", body: fd });
            const result = await response.json();
            setAvatar(result?.url || result?.image || objectUrl);
            toast.success("Avatar uploaded");
        } catch {
            toast.error("Upload failed");
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.quote.trim()) {
            toast.error("Name and quote are required");
            return;
        }
        setIsSubmitting(true);
        try {
            await testimonialsAPI.update(id, { ...formData, avatar });
            toast.success("Testimonial updated successfully");
            router.push("/dashboard/testimonials");
        } catch {
            toast.error("Failed to update testimonial");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-8">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-xl" />
                    <div><Skeleton className="h-8 w-48" /><Skeleton className="h-4 w-64 mt-2" /></div>
                </div>
                <Card className="border-border/50 max-w-2xl">
                    <CardContent className="p-6 space-y-4">
                        <Skeleton className="h-10 w-full rounded-lg" />
                        <Skeleton className="h-10 w-full rounded-lg" />
                        <Skeleton className="h-24 w-full rounded-lg" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!testimonial) {
        return <div className="text-center py-20"><p className="text-muted-foreground">Testimonial not found</p></div>;
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild className="rounded-xl">
                    <Link href="/dashboard/testimonials">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold">Edit Testimonial</h1>
                    <p className="text-sm text-muted-foreground">Modify testimonial from {testimonial.name}</p>
                </div>
            </div>

            <Card className="border-border/50 max-w-2xl">
                <CardHeader>
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                        <Quote className="w-5 h-5 text-primary" />
                    </div>
                    <CardTitle>Testimonial Details</CardTitle>
                    <CardDescription>Update the testimonial information</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium">Name <span className="text-destructive">*</span></Label>
                                <Input className="rounded-lg h-9" value={formData.name}
                                    onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium">Role</Label>
                                <Input className="rounded-lg h-9" value={formData.role}
                                    onChange={(e) => setFormData(p => ({ ...p, role: e.target.value }))} />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium">Company</Label>
                                <Input className="rounded-lg h-9" value={formData.company}
                                    onChange={(e) => setFormData(p => ({ ...p, company: e.target.value }))} />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium">Rating</Label>
                                <Select value={String(formData.rating)}
                                    onValueChange={(v) => setFormData(p => ({ ...p, rating: Number(v) }))}>
                                    <SelectTrigger className="rounded-lg h-9"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {RATING_OPTIONS.map(r => (
                                            <SelectItem key={r} value={String(r)}>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex gap-0.5">{Array.from({ length: r }).map((_, i) => (
                                                        <Star key={i} className="w-3 h-3 fill-amber-500 text-amber-500" />
                                                    ))}</div>
                                                    <span className="text-xs">{r}/5</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium">Avatar</Label>
                                <div onClick={() => fileInputRef.current?.click()}
                                    className="rounded-xl h-28 bg-background/50 border-2 border-dashed border-border/50 hover:border-primary/40 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer overflow-hidden relative">
                                    {previewUrl || avatar ? (
                                        <img src={previewUrl || avatar} alt="" className="absolute inset-0 w-full h-full object-cover" />
                                    ) : (
                                        <><div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                            <Upload className="w-5 h-5 text-primary" />
                                        </div><span className="text-xs text-muted-foreground">Click to upload</span></>
                                    )}
                                    {isUploading && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                            <Loader2 className="w-6 h-6 animate-spin text-white" />
                                        </div>
                                    )}
                                </div>
                                <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleAvatarUpload(f); }} />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium">Gradient</Label>
                                <Input className="rounded-lg h-9" value={formData.gradient}
                                    onChange={(e) => setFormData(p => ({ ...p, gradient: e.target.value }))} />
                            </div>
                            <div className="md:col-span-2 space-y-1.5">
                                <Label className="text-xs font-medium">Quote <span className="text-destructive">*</span></Label>
                                <Textarea className="rounded-lg min-h-[80px] resize-none" value={formData.quote}
                                    onChange={(e) => setFormData(p => ({ ...p, quote: e.target.value }))} />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium">Order</Label>
                                <Input type="number" className="rounded-lg h-9" value={formData.order}
                                    onChange={(e) => setFormData(p => ({ ...p, order: Number(e.target.value) }))} />
                            </div>
                            <div className="flex items-end pb-1">
                                <div className="flex items-center gap-3">
                                    <Switch checked={formData.isActive}
                                        onCheckedChange={(v) => setFormData(p => ({ ...p, isActive: v }))} id="isActive" />
                                    <Label htmlFor="isActive" className="text-sm cursor-pointer">
                                        {formData.isActive ? "Active" : "Inactive"}
                                    </Label>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-4">
                            <Button variant="ghost" className="rounded-lg h-9" asChild>
                                <Link href="/dashboard/testimonials">Cancel</Link>
                            </Button>
                            <Button type="submit" className="rounded-lg h-9 px-6" disabled={isSubmitting}>
                                {isSubmitting ? "Saving..." : "Update Testimonial"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

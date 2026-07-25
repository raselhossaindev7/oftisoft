"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, ArrowLeft, Upload, Loader2, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { teamMembersAPI, authAPI } from "@/lib/api";
import { toast } from "sonner";
import Link from "next/link";

export default function NewTeamMemberPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [avatar, setAvatar] = useState("");
    const [formData, setFormData] = useState({
        name: "", role: "", bio: "", email: "", socialLinks: "", tags: "",
        order: 0, isActive: true,
    });

    const handleAvatarUpload = async (file: File) => {
        if (!file || !file.type.startsWith("image/")) { toast.error("Please select an image file"); return; }
        setIsUploading(true);
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);
        try {
            const data = await authAPI.uploadAvatar(file);
            setAvatar(data.avatarUrl || data.avatar || "");
            toast.success("Avatar uploaded");
        } catch {
            setPreviewUrl(null);
            toast.error("Upload failed");
        } finally { setIsUploading(false); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.role.trim()) {
            toast.error("Name and role are required");
            return;
        }
        setIsSubmitting(true);
        try {
            await teamMembersAPI.create({
                ...formData,
                avatar: avatar || undefined,
                tags: formData.tags ? formData.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
            });
            toast.success("Team member created");
            router.push("/dashboard/team");
        } catch {
            toast.error("Failed to create team member");
        } finally { setIsSubmitting(false); }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild className="rounded-xl">
                    <Link href="/dashboard/team"><ArrowLeft className="w-5 h-5" /></Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold">Add Member</h1>
                    <p className="text-sm text-muted-foreground">Register a new member to the team</p>
                </div>
            </div>
            <Card className="border-border/50 max-w-2xl">
                <CardHeader>
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                        <UserPlus className="w-5 h-5 text-primary" />
                    </div>
                    <CardTitle>Member Details</CardTitle>
                    <CardDescription>Fill in the details for the new team member</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium">Name <span className="text-destructive">*</span></Label>
                                <Input placeholder="John Doe" className="rounded-lg h-9" value={formData.name}
                                    onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium">Role <span className="text-destructive">*</span></Label>
                                <Input placeholder="Designer" className="rounded-lg h-9" value={formData.role}
                                    onChange={(e) => setFormData(p => ({ ...p, role: e.target.value }))} />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium">Email</Label>
                                <Input type="email" placeholder="john@example.com" className="rounded-lg h-9" value={formData.email}
                                    onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))} />
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
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium">Bio</Label>
                            <Textarea placeholder="Brief description..." className="rounded-lg min-h-[80px] resize-none"
                                value={formData.bio}
                                onChange={(e) => setFormData(p => ({ ...p, bio: e.target.value }))} />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium">Social Links (JSON)</Label>
                            <Textarea placeholder='[{"platform":"github","url":"https://..."}]'
                                className="rounded-lg font-mono text-xs min-h-[60px]" value={formData.socialLinks}
                                onChange={(e) => setFormData(p => ({ ...p, socialLinks: e.target.value }))} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium">Tags</Label>
                                <div className="relative">
                                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input placeholder="frontend, lead" className="rounded-lg h-9 pl-10" value={formData.tags}
                                        onChange={(e) => setFormData(p => ({ ...p, tags: e.target.value }))} />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium">Order</Label>
                                <Input type="number" placeholder="0" className="rounded-lg h-9" value={formData.order}
                                    onChange={(e) => setFormData(p => ({ ...p, order: Number(e.target.value) }))} />
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-background/30 border border-border/30">
                            <Switch checked={formData.isActive}
                                onCheckedChange={(v) => setFormData(p => ({ ...p, isActive: v }))} id="isActive" />
                            <Label htmlFor="isActive" className="text-sm cursor-pointer">Active</Label>
                        </div>
                        <div className="flex justify-end gap-2 pt-4">
                            <Button variant="ghost" className="rounded-lg h-9" asChild>
                                <Link href="/dashboard/team">Cancel</Link>
                            </Button>
                            <Button type="submit" className="rounded-lg h-9 px-6" disabled={isSubmitting}>
                                {isSubmitting ? "Creating..." : "Add Member"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, ArrowLeft, Calendar, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { eventsAPI, type Event } from "@/lib/api";
import { toast } from "sonner";
import Link from "next/link";

const EVENT_TYPES = [
    { label: 'Webinar', value: 'webinar' },
    { label: 'Workshop', value: 'workshop' },
    { label: 'Conference', value: 'conference' },
    { label: 'Meetup', value: 'meetup' },
    { label: 'Hackathon', value: 'hackathon' },
    { label: 'Training', value: 'training' },
];

export default function NewEventPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState<{
        title: string; slug: string; description: string; shortDescription: string;
        type: Event["type"]; status: Event["status"];
        startDate: string; endDate: string; timezone: string;
        location: string; venue: string; image: string;
        capacity: number; price: number; isFree: boolean; tags: string;
    }>({
        title: "", slug: "", description: "", shortDescription: "",
        type: "webinar", status: "draft",
        startDate: "", endDate: "", timezone: "",
        location: "", venue: "", image: "",
        capacity: 0, price: 0, isFree: true, tags: "",
    });

    const generateSlug = (title: string) =>
        title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title.trim() || !formData.startDate || !formData.endDate) {
            toast.error("Title, start date, and end date are required");
            return;
        }
        const slug = formData.slug.trim() || generateSlug(formData.title);
        setIsSubmitting(true);
        try {
            await eventsAPI.create({
                ...formData,
                slug,
                tags: formData.tags ? formData.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
                capacity: Number(formData.capacity),
                price: Number(formData.price),
                startDate: new Date(formData.startDate).toISOString(),
                endDate: new Date(formData.endDate).toISOString(),
            });
            toast.success("Event created");
            router.push("/dashboard/events");
        } catch {
            toast.error("Failed to create event");
        } finally { setIsSubmitting(false); }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild className="rounded-xl">
                    <Link href="/dashboard/events"><ArrowLeft className="w-5 h-5" /></Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold">Add Event</h1>
                    <p className="text-sm text-muted-foreground">Create a new event for your audience</p>
                </div>
            </div>
            <Card className="border-border/50 max-w-3xl">
                <CardHeader>
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                        <Plus className="w-5 h-5 text-primary" />
                    </div>
                    <CardTitle>Event Details</CardTitle>
                    <CardDescription>Fill in the details for the new event</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium">Title <span className="text-destructive">*</span></Label>
                                <Input placeholder="Event Name" className="rounded-lg h-9" value={formData.title}
                                    onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))} />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium">Slug</Label>
                                <Input placeholder="auto-generated" className="rounded-lg h-9 font-mono text-xs" value={formData.slug}
                                    onChange={(e) => setFormData(p => ({ ...p, slug: e.target.value }))} />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium">Type <span className="text-destructive">*</span></Label>
                                <Select value={formData.type} onValueChange={(v) => setFormData(p => ({ ...p, type: v as Event["type"] }))}>
                                    <SelectTrigger className="rounded-lg h-9"><SelectValue /></SelectTrigger>
                                    <SelectContent className="rounded-lg">
                                        {EVENT_TYPES.map(t => (
                                            <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium">Status</Label>
                                <Select value={formData.status} onValueChange={(v) => setFormData(p => ({ ...p, status: v as Event["status"] }))}>
                                    <SelectTrigger className="rounded-lg h-9"><SelectValue /></SelectTrigger>
                                    <SelectContent className="rounded-lg">
                                        <SelectItem value="draft">Draft</SelectItem>
                                        <SelectItem value="published">Published</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium">Description</Label>
                            <Textarea placeholder="Full event description..." className="rounded-lg min-h-[80px] resize-none"
                                value={formData.description}
                                onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))} />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium">Short Description</Label>
                            <Textarea placeholder="Brief event summary..." className="rounded-lg min-h-[60px] resize-none"
                                value={formData.shortDescription}
                                onChange={(e) => setFormData(p => ({ ...p, shortDescription: e.target.value }))} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium">Start Date <span className="text-destructive">*</span></Label>
                                <Input type="datetime-local" className="rounded-lg h-9" value={formData.startDate}
                                    onChange={(e) => setFormData(p => ({ ...p, startDate: e.target.value }))} />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium">End Date <span className="text-destructive">*</span></Label>
                                <Input type="datetime-local" className="rounded-lg h-9" value={formData.endDate}
                                    onChange={(e) => setFormData(p => ({ ...p, endDate: e.target.value }))} />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium">Timezone</Label>
                                <Input placeholder="America/New_York" className="rounded-lg h-9" value={formData.timezone}
                                    onChange={(e) => setFormData(p => ({ ...p, timezone: e.target.value }))} />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium">Location</Label>
                                <Input placeholder="New York, NY" className="rounded-lg h-9" value={formData.location}
                                    onChange={(e) => setFormData(p => ({ ...p, location: e.target.value }))} />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium">Venue</Label>
                                <Input placeholder="Convention Center" className="rounded-lg h-9" value={formData.venue}
                                    onChange={(e) => setFormData(p => ({ ...p, venue: e.target.value }))} />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium">Image URL</Label>
                                <Input placeholder="https://..." className="rounded-lg h-9" value={formData.image}
                                    onChange={(e) => setFormData(p => ({ ...p, image: e.target.value }))} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium">Capacity</Label>
                                <Input type="number" placeholder="100" className="rounded-lg h-9" value={formData.capacity}
                                    onChange={(e) => setFormData(p => ({ ...p, capacity: Number(e.target.value) }))} />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium">Price</Label>
                                <Input type="number" placeholder="0.00" className="rounded-lg h-9" value={formData.price} disabled={formData.isFree}
                                    onChange={(e) => setFormData(p => ({ ...p, price: Number(e.target.value) }))} />
                            </div>
                            <div className="flex items-end pb-1">
                                <div className="flex items-center gap-3">
                                    <Switch id="isFree" checked={formData.isFree}
                                        onCheckedChange={(v) => setFormData(p => ({ ...p, isFree: v, price: v ? 0 : p.price }))} />
                                    <Label htmlFor="isFree" className="text-sm cursor-pointer">Free</Label>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-medium">Tags</Label>
                            <div className="relative">
                                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="tech, workshop, react" className="rounded-lg h-9 pl-10" value={formData.tags}
                                    onChange={(e) => setFormData(p => ({ ...p, tags: e.target.value }))} />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <Button variant="ghost" className="rounded-lg h-9" asChild>
                                <Link href="/dashboard/events">Cancel</Link>
                            </Button>
                            <Button type="submit" className="rounded-lg h-9 px-6" disabled={isSubmitting}>
                                {isSubmitting ? "Creating..." : "Add Event"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

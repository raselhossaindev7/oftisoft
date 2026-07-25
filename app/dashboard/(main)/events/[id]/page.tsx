"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Edit, Trash2, Calendar, MapPin, Building, Users, DollarSign, Tag, Clock, Globe, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { eventsAPI, type Event } from "@/lib/api";
import { toast } from "sonner";
import Link from "next/link";
import { format } from "date-fns";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

const TYPE_STYLES: Record<string, string> = {
    webinar: "bg-sky-500/10 text-sky-500 border-sky-500/20",
    workshop: "bg-violet-500/10 text-violet-500 border-violet-500/20",
    conference: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    meetup: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    hackathon: "bg-rose-500/10 text-rose-500 border-rose-500/20",
    training: "bg-blue-500/10 text-blue-500 border-blue-500/20",
};

function getTypeBadge(type: string) {
    const s = TYPE_STYLES[type] || "bg-muted text-muted-foreground";
    return <Badge className={`${s} gap-1.5 rounded-md text-xs font-medium`}>{type}</Badge>;
}

function getStatusBadge(status: string) {
    const map: Record<string, { cls: string; label: string }> = {
        published: { cls: "bg-green-500/10 text-green-500 border-green-500/20", label: "Published" },
        draft: { cls: "bg-amber-500/10 text-amber-500 border-amber-500/20", label: "Draft" },
        cancelled: { cls: "bg-destructive/10 text-destructive border-destructive/20", label: "Cancelled" },
        completed: { cls: "bg-blue-500/10 text-blue-500 border-blue-500/20", label: "Completed" },
    };
    const m = map[status] || { cls: "bg-muted text-muted-foreground", label: status };
    return <Badge className={`${m.cls} gap-1 rounded-md text-xs font-medium`}>{m.label}</Badge>;
}

export default function EventDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const [event, setEvent] = useState<Event | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [deleteOpen, setDeleteOpen] = useState(false);

    useEffect(() => {
        if (!id) return;
        setIsLoading(true);
        eventsAPI.getOne(id)
            .then(setEvent)
            .catch(() => { toast.error("Failed to load event"); router.push("/dashboard/events"); })
            .finally(() => setIsLoading(false));
    }, [id, router]);

    const handleDelete = async () => {
        try {
            await eventsAPI.delete(id);
            toast.success("Event deleted");
            router.push("/dashboard/events");
        } catch { toast.error("Failed to delete"); }
    };

    const handlePublish = async () => {
        try {
            await eventsAPI.publish(id);
            setEvent(prev => prev ? { ...prev, status: 'published' } : null);
            toast.success("Event published");
        } catch { toast.error("Failed to publish"); }
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

    if (!event) return null;

    const tags = Array.isArray(event.tags) ? event.tags : [];

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild className="rounded-xl">
                        <Link href="/dashboard/events"><ArrowLeft className="w-5 h-5" /></Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">{event.title}</h1>
                        <p className="text-sm text-muted-foreground">Event details</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {event.status === 'draft' && (
                        <Button variant="outline" className="gap-2 rounded-xl" onClick={handlePublish}>
                            Publish
                        </Button>
                    )}
                    <Button asChild variant="outline" className="gap-2 rounded-xl">
                        <Link href={`/dashboard/events/${id}/edit`}><Edit className="w-4 h-4" /> Edit</Link>
                    </Button>
                    <Button variant="outline" className="gap-2 rounded-xl text-destructive" onClick={() => setDeleteOpen(true)}>
                        <Trash2 className="w-4 h-4" /> Delete
                    </Button>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                <Card className="md:col-span-2 border-border/50">
                    {event.image && (
                        <div className="relative w-full h-48 rounded-t-xl overflow-hidden">
                            <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                        </div>
                    )}
                    <CardHeader>
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                            {getTypeBadge(event.type)}
                            {getStatusBadge(event.status)}
                            {event.isFree && (
                                <Badge variant="outline" className="rounded-lg border-emerald-400 text-emerald-500 text-xs">Free</Badge>
                            )}
                        </div>
                        <CardTitle className="text-2xl">{event.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">/{event.slug}</p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {event.shortDescription && (
                            <div>
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Summary</h3>
                                <p className="text-sm leading-relaxed">{event.shortDescription}</p>
                            </div>
                        )}
                        <div>
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Description</h3>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{event.description}</p>
                        </div>
                        {tags.length > 0 && (
                            <div>
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Tags</h3>
                                <div className="flex flex-wrap gap-1.5">
                                    {tags.map((tag, i) => (
                                        <Badge key={i} variant="secondary" className="rounded-lg text-xs">{tag}</Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="border-border/50 h-fit">
                    <CardHeader>
                        <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-start gap-3">
                            <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
                            <div>
                                <p className="text-xs text-muted-foreground">Start</p>
                                <p className="text-sm font-medium">{format(new Date(event.startDate), "MMM d, yyyy h:mm a")}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
                            <div>
                                <p className="text-xs text-muted-foreground">End</p>
                                <p className="text-sm font-medium">{format(new Date(event.endDate), "MMM d, yyyy h:mm a")}</p>
                            </div>
                        </div>
                        {event.timezone && (
                            <div className="flex items-start gap-3">
                                <Globe className="w-4 h-4 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Timezone</p>
                                    <p className="text-sm font-medium">{event.timezone}</p>
                                </div>
                            </div>
                        )}
                        {event.location && (
                            <div className="flex items-start gap-3">
                                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Location</p>
                                    <p className="text-sm font-medium">{event.location}</p>
                                </div>
                            </div>
                        )}
                        {event.venue && (
                            <div className="flex items-start gap-3">
                                <Building className="w-4 h-4 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Venue</p>
                                    <p className="text-sm font-medium">{event.venue}</p>
                                </div>
                            </div>
                        )}
                        <div className="flex items-start gap-3">
                            <Users className="w-4 h-4 text-muted-foreground mt-0.5" />
                            <div>
                                <p className="text-xs text-muted-foreground">Capacity</p>
                                <p className="text-sm font-medium">{event.registeredCount} / {event.capacity}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <DollarSign className="w-4 h-4 text-muted-foreground mt-0.5" />
                            <div>
                                <p className="text-xs text-muted-foreground">Price</p>
                                <p className="text-sm font-medium">{event.isFree ? "Free" : `$${event.price}`}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Clock className="w-4 h-4 text-muted-foreground mt-0.5" />
                            <div>
                                <p className="text-xs text-muted-foreground">Created</p>
                                <p className="text-sm font-medium">{format(new Date(event.createdAt), "MMM d, yyyy")}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogContent className="rounded-xl max-w-[400px] p-6">
                    <DialogHeader className="flex flex-col items-center text-center gap-2">
                        <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                            <Trash2 className="w-6 h-6 text-destructive" />
                        </div>
                        <DialogTitle>Remove event?</DialogTitle>
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

"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, User, Edit, Trash2, Eye, EyeOff, Calendar, Mail, Tag, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { teamMembersAPI, type TeamMember } from "@/lib/api";
import { toast } from "sonner";
import Link from "next/link";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

export default function TeamMemberDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const [member, setMember] = useState<TeamMember | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [deleteOpen, setDeleteOpen] = useState(false);

    useEffect(() => {
        if (!id) return;
        setIsLoading(true);
        teamMembersAPI.getOne(id)
            .then(setMember)
            .catch(() => { toast.error("Failed to load member"); router.push("/dashboard/team"); })
            .finally(() => setIsLoading(false));
    }, [id, router]);

    const handleDelete = async () => {
        try {
            await teamMembersAPI.delete(id);
            toast.success("Team member removed");
            router.push("/dashboard/team");
        } catch { toast.error("Failed to delete"); }
    };

    const handleToggleActive = async () => {
        if (!member) return;
        try {
            await teamMembersAPI.update(id, { isActive: !member.isActive });
            setMember(prev => prev ? { ...prev, isActive: !prev.isActive } : null);
            toast.success(`Member ${member.isActive ? "deactivated" : "activated"}`);
        } catch { toast.error("Failed to update status"); }
    };

    const getInitials = (name: string) =>
        name.split(" ").filter(Boolean).map(n => n[0]).join("").toUpperCase().slice(0, 2) || "TM";

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

    if (!member) return null;

    const tags = Array.isArray(member.tags) ? member.tags : typeof member.tags === "string" && member.tags ? member.tags.split(",").map(t => t.trim()) : [];

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild className="rounded-xl">
                        <Link href="/dashboard/team"><ArrowLeft className="w-5 h-5" /></Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">{member.name}</h1>
                        <p className="text-sm text-muted-foreground">Team member details</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="gap-2 rounded-xl" onClick={handleToggleActive}>
                        {member.isActive ? <><EyeOff className="w-4 h-4" /> Deactivate</> : <><Eye className="w-4 h-4" /> Activate</>}
                    </Button>
                    <Button asChild variant="outline" className="gap-2 rounded-xl">
                        <Link href={`/dashboard/team/${id}/edit`}><Edit className="w-4 h-4" /> Edit</Link>
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
                                <AvatarImage src={member.avatar} />
                                <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg rounded-xl">
                                    {getInitials(member.name)}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <CardTitle className="text-2xl">{member.name}</CardTitle>
                                <div className="flex items-center gap-2 mt-1">
                                    <Badge className="bg-primary/10 text-primary border-primary/20 rounded-md text-sm">
                                        {member.role}
                                    </Badge>
                                    <Badge variant={member.isActive ? "default" : "secondary"} className="rounded-lg gap-1">
                                        {member.isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                                        {member.isActive ? "Active" : "Inactive"}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {member.bio && (
                            <div>
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Bio</h3>
                                <p className="text-sm leading-relaxed">{member.bio}</p>
                            </div>
                        )}
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
                        {member.socialLinks && (
                            <div>
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Social Links</h3>
                                <pre className="text-xs bg-muted/20 rounded-lg p-3 overflow-x-auto">{member.socialLinks}</pre>
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
                            <User className="w-4 h-4 text-muted-foreground mt-0.5" />
                            <div>
                                <p className="text-xs text-muted-foreground">Name</p>
                                <p className="text-sm font-medium">{member.name}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <BadgeCheck className="w-4 h-4 text-muted-foreground mt-0.5" />
                            <div>
                                <p className="text-xs text-muted-foreground">Role</p>
                                <p className="text-sm font-medium">{member.role}</p>
                            </div>
                        </div>
                        {member.email && (
                            <div className="flex items-start gap-3">
                                <Mail className="w-4 h-4 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Email</p>
                                    <p className="text-sm font-medium">{member.email}</p>
                                </div>
                            </div>
                        )}
                        <div className="flex items-start gap-3">
                            <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
                            <div>
                                <p className="text-xs text-muted-foreground">Created</p>
                                <p className="text-sm font-medium">{new Date(member.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
                            <div>
                                <p className="text-xs text-muted-foreground">Updated</p>
                                <p className="text-sm font-medium">{new Date(member.updatedAt).toLocaleDateString()}</p>
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
                        <DialogTitle>Remove member?</DialogTitle>
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

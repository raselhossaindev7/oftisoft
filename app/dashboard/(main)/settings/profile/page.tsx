"use client";

import { useState, useEffect, useRef } from "react";
import { Camera, Mail, Phone, MapPin, Loader2, Save, User as UserIcon, Building2, Map, ShieldCheck, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authAPI, User, UpdateProfileData } from "@/lib/api";
import { useForm } from "react-hook-form";
import { useUserStore } from "@/lib/store";
import { useAuthStore } from "@/store/useAuthStore";

export default function ProfileSettings() {
    const queryClient = useQueryClient();
    const { setUser } = useUserStore();
    const setAuthUser = useAuthStore((s) => s.setUser);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // Fetch user profile
  const { data: user, isLoading, error } = useQuery({
        queryKey: ["profile"],
        queryFn: () => authAPI.getProfile(),
    });

    const { register, handleSubmit, reset, watch } = useForm<Partial<User>>();

    // Update form when data is loaded
    useEffect(() => {
        if (user) {
            reset(user);
        }
    }, [user, reset]);

    const bioValue = watch("bio") || "";

    // Mutation for updating profile
  const updateMutation = useMutation({
        mutationFn: (data: Partial<User>) => authAPI.updateProfile(data),
        onSuccess: (updatedUser) => {
            queryClient.invalidateQueries({ queryKey: ["profile"] });
            setUser({
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: (updatedUser.role as 'admin' | 'user') || 'user',
            });
            setAuthUser(updatedUser as any);
            toast.success("Profile information updated successfully!", {
                description: "Your digital identity has been synchronized across all nodes.",
                icon: <ShieldCheck className="w-4 h-4 text-green-500" />
            });
        },
        onError: (err: any) => {
            toast.error("Failed to update profile", {
                description: err.response?.data?.message || "An unexpected error occurred."
            });
        }
    });

    // Mutation for avatar upload
  const avatarMutation = useMutation({
        mutationFn: (file: File) => authAPI.uploadAvatar(file),
        onSuccess: (updatedUser) => {
            queryClient.invalidateQueries({ queryKey: ["profile"] });
            setAuthUser(updatedUser as any);
            toast.success("Avatar Synchronization Complete", {
                description: "Your new visual identity has been encoded.",
                icon: <ShieldCheck className="w-4 h-4 text-green-500" />
            });
        },
        onError: (err: any) => {
            toast.error("Avatar Upload Failed", {
                description: err.response?.data?.message || "Failed to transmit visual data."
            });
        }
    });

    const onSubmit = (data: Partial<User>) => {
        // Filter out read-only or restricted fields that backend doesn't accept in updateProfile
  const allowedFields: (keyof UpdateProfileData)[] = [
            "name", "phone", "jobTitle", "bio", "address", 
            "city", "state", "zipCode", "unit",
            "emailNotifications", "pushNotifications", "smsNotifications", "marketingNotifications",
            "avatarUrl"
        ];

        const filteredData = Object.keys(data)
            .filter(key => allowedFields.includes(key as keyof UpdateProfileData))
            .reduce((obj, key) => {
                obj[key as keyof UpdateProfileData] = data[key as keyof User] as any;
                return obj;
            }, {} as Partial<UpdateProfileData>);

        updateMutation.mutate(filteredData);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            avatarMutation.mutate(file);
        }
    };

    const avatarSrc = user?.avatarUrl 
        ? (user.avatarUrl.startsWith('http') 
            ? user.avatarUrl 
            : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000'}${user.avatarUrl}`)
        : `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'Alex'}`;

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <Loader2 className="w-12 h-auto animate-spin text-primary opacity-20" />
                <p className="text-muted-foreground font-semibold animate-pulse">Retrieving Neural Identity...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 p-12 text-center bg-red-500/5 rounded-[40px] border border-red-500/20">
                <AlertCircle className="w-12 h-auto text-red-500" />
                <h3 className="text-xl font-semibold">Matrix Connection Error</h3>
                <p className="text-muted-foreground font-medium max-w-sm">Failed to establish link with the identity vault. Please verify your credentials and retry.</p>
                <Button variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: ["profile"] })} className="rounded-xl border-red-500/20 hover:bg-red-500/10 hover:text-red-500">Retry Synchronization</Button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-12 max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/50 pb-10">
                <div>
                    <h2 className="text-3xl md:text-3xl font-semibold bg-gradient-to-r from-foreground via-foreground to-foreground/40 bg-clip-text text-transparent">
                        Personal Intelligence
                    </h2>
                    <p className="text-muted-foreground font-medium mt-2">Configure your identity and professional presence across the Oftisoft network.</p>
                </div>
                <Badge variant="outline" className="h-8 px-4 border-primary/20 bg-primary/5 text-primary font-semibold uppercase text-sm rounded-full">
                    {user?.isActive ? 'Verified Resident' : 'Unverified Identity'}
                </Badge>
            </div>

            {/* Avatar Section */}
            <div className="flex flex-col sm:flex-row items-center gap-10 p-8 md:p-12 rounded-[40px] bg-muted/20 border border-border/40 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] rounded-full" />
                
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleFileUpload}
                />

                <div className="relative group/avatar cursor-pointer shrink-0" onClick={() => fileInputRef.current?.click()}>
                    <div className="w-36 h-36 rounded-[48px] bg-background p-1.5 shadow-2xl relative z-10 transition-transform group-hover/avatar:scale-105 duration-700">
                        <div className="w-full h-full rounded-[42px] overflow-hidden border border-border/50 bg-muted flex items-center justify-center">
                            {avatarMutation.isPending ? (
                                <Loader2 className="w-10 h-10 animate-spin text-primary opacity-40" />
                            ) : (
                                <img src={avatarSrc} alt="Avatar" className="w-full h-full object-cover" />
                            )}
                        </div>
                    </div>
                    <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-all duration-500 rounded-[48px] overflow-hidden">
                        <div className="w-full h-full bg-primary/60 backdrop-blur-sm flex items-center justify-center">
                            <Camera className="w-10 h-10 text-white animate-bounce" />
                        </div>
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-background border border-border rounded-2xl flex items-center justify-center shadow-xl z-30 group-hover/avatar:rotate-12 transition-transform">
                        <Camera className="w-5 h-5 text-primary" />
                    </div>
                </div>

                <div className="text-center sm:text-left space-y-4 relative z-10">
                    <div>
                        <h3 className="font-semibold text-3xl">{user?.name}</h3>
                        <p className="text-muted-foreground text-sm font-bold mt-1 uppercase opacity-70">{user?.jobTitle || "No Identity Assigned"}</p>
                    </div>
                    <div className="flex flex-wrap justify-center sm:justify-start gap-3">
                        <Button 
                            type="button" 
                            disabled={avatarMutation.isPending}
                            onClick={() => fileInputRef.current?.click()}
                            className="rounded-xl font-semibold px-6 h-11 shadow-lg shadow-primary/20"
                        >
                            {avatarMutation.isPending ? "Encoding..." : "Replace Identity"}
                        </Button>
                        <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => updateMutation.mutate({ avatarUrl: '' })}
                            className="rounded-xl font-semibold px-6 h-11 bg-background"
                        >
                            Reset Default
                        </Button>
                    </div>
                </div>
            </div>

            {/* Basic Info */}
            <div className="space-y-10">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                         <UserIcon className="w-4 h-4" />
                    </div>
                    <h3 className="text-xs font-semibold uppercase text-muted-foreground/60 underline decoration-primary/30 underline-offset-8">General Metadata</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
                    <div className="space-y-3">
                        <Label className="text-sm font-semibold uppercase text-muted-foreground/80 pl-1">Full Legal Name</Label>
                        <Input {...register("name")} className="h-14 px-6 rounded-2xl border-none bg-muted/30 focus-visible:ring-primary/20 font-bold" />
                    </div>
                    <div className="space-y-3">
                        <Label className="text-sm font-semibold uppercase text-muted-foreground/80 pl-1">Professional Title</Label>
                        <Input {...register("jobTitle")} placeholder="e.g. Senior Cloud Architect" className="h-14 px-6 rounded-2xl border-none bg-muted/30 focus-visible:ring-primary/20 font-bold" />
                    </div>

                    <div className="space-y-3">
                        <Label className="text-sm font-semibold uppercase text-muted-foreground/80 pl-1 flex items-center gap-2">
                            <Mail className="w-3.5 h-3.5" /> Synchronized Email
                        </Label>
                        <Input type="email" value={user?.email} disabled className="h-14 px-6 rounded-2xl border-none bg-muted/10 font-bold  opacity-60 cursor-not-allowed" />
                        <p className="px-2 text-xs text-muted-foreground font-bold">Primary email node is immutable for security integrity.</p>
                    </div>

                    <div className="space-y-3">
                        <Label className="text-sm font-semibold uppercase text-muted-foreground/80 pl-1 flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5" /> Direct Line
                        </Label>
                        <Input type="tel" {...register("phone")} placeholder="+1 (555) 000-0000" className="h-14 px-6 rounded-2xl border-none bg-muted/30 focus-visible:ring-primary/20 font-bold" />
                    </div>

                    <div className="md:col-span-2 space-y-3">
                        <Label className="text-sm font-semibold uppercase text-muted-foreground/80 pl-1">Professional Bio / Mission Statement</Label>
                        <Textarea {...register("bio")} rows={4} className="p-6 rounded-2xl border-none bg-muted/30 focus-visible:ring-primary/20 font-bold resize-none" placeholder="Elaborate on your professional trajectory..." />
                        <div className="flex justify-between items-center px-2">
                            <p className="text-xs text-primary font-semibold uppercase animate-pulse">AI Analysis: {bioValue.length > 50 ? 'High Professional Resonance' : 'Awaiting Input...'}</p>
                            <p className="text-xs text-muted-foreground font-semibold uppercase leading-none">{bioValue.length} / 500 characters</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Billing Address Section */}
            <div className="space-y-10 pt-12 border-t border-dashed border-border/50">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                         <Building2 className="w-4 h-4" />
                    </div>
                    <h3 className="text-xs font-semibold uppercase text-muted-foreground/60 underline decoration-primary/30 underline-offset-8">Global Billing & Settlement</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-3">
                        <Label className="text-sm font-semibold uppercase text-muted-foreground/80 pl-1 flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5" /> Base Registered Address
                        </Label>
                        <Input {...register("address")} placeholder="1248 Innovation Drive" className="h-14 px-6 rounded-2xl border-none bg-muted/30 focus-visible:ring-primary/20 font-bold" />
                    </div>
                    <div className="space-y-3">
                        <Label className="text-sm font-semibold uppercase text-muted-foreground/80 pl-1">Unit / Floor</Label>
                        <Input {...register("unit")} placeholder="Suite 400" className="h-14 px-6 rounded-2xl border-none bg-muted/30 focus-visible:ring-primary/20 font-bold" />
                    </div>

                    <div className="space-y-3">
                        <Label className="text-sm font-semibold uppercase text-muted-foreground/80 pl-1">City / District</Label>
                        <Input {...register("city")} placeholder="Palo Alto" className="h-14 px-6 rounded-2xl border-none bg-muted/30 focus-visible:ring-primary/20 font-bold" />
                    </div>
                    <div className="space-y-3">
                        <Label className="text-sm font-semibold uppercase text-muted-foreground/80 pl-1">State / Province</Label>
                        <Input {...register("state")} placeholder="California" className="h-14 px-6 rounded-2xl border-none bg-muted/30 focus-visible:ring-primary/20 font-bold" />
                    </div>
                    <div className="space-y-3">
                        <Label className="text-sm font-semibold uppercase text-muted-foreground/80 pl-1">Postal Infrastructure</Label>
                        <Input {...register("zipCode")} placeholder="94304" className="h-14 px-6 rounded-2xl border-none bg-muted/30 focus-visible:ring-primary/20 font-bold" />
                    </div>
                </div>
            </div>

            {/* Verification Footer */}
            <div className="pt-12 flex flex-col sm:flex-row items-center justify-between gap-8 border-t border-border/50">
                <div className="flex items-center gap-4 bg-muted/30 p-4 rounded-2xl border border-border/50">
                    <div className="w-12 h-auto rounded-xl bg-green-500/10 flex items-center justify-center text-green-500 shadow-inner">
                        <Map className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold uppercase text-muted-foreground">Registry Status: Synchronized</p>
                        <p className="text-xs text-green-500/70 font-bold uppercase mt-1 leading-none">Last verified via Global Node</p>
                    </div>
                </div>
                <Button type="submit"
                    disabled={updateMutation.isPending}
                    className="w-full sm:w-auto h-16 px-12 rounded-[24px] font-semibold text-lg shadow-2xl shadow-primary/30 transition-all hover:scale-[1.05] active:scale-[0.95]"
                >
                    {updateMutation.isPending ? (
                        <div className="flex items-center gap-3">
                            <Loader2 className="w-6 h-6 animate-spin" />
                            <span>Syncing Identity...</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Save className="w-6 h-6" />
                            <span>Confirm Profile Sync</span>
                        </div>
                    )}
                </Button>
            </div>

        </form>
    );
}

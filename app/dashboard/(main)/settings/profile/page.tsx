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
            toast.success("Profile updated successfully!");
        },
        onError: (err: any) => {
            toast.error("Failed to update profile", {
                description: err.response?.data?.message || "An unexpected error occurred."
            });
        }
    });

    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // Mutation for avatar upload
    const avatarMutation = useMutation({
        mutationFn: (file: File) => authAPI.uploadAvatar(file),
        onSuccess: (updatedUser) => {
            queryClient.invalidateQueries({ queryKey: ["profile"] });
            setAuthUser(updatedUser as any);
            setPreviewUrl(null);
            toast.success("Avatar updated successfully!");
        },
        onError: (err: any) => {
            setPreviewUrl(null);
            toast.error("Avatar upload failed", {
                description: err.response?.data?.message || "Failed to upload image."
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
            const objectUrl = URL.createObjectURL(file);
            setPreviewUrl(objectUrl);
            avatarMutation.mutate(file);
        }
    };

    const avatarSrc = previewUrl || (user?.avatarUrl 
        ? (user.avatarUrl.startsWith('http') 
            ? user.avatarUrl 
            : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000'}${user.avatarUrl}`)
        : `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'Alex'}`);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <Loader2 className="w-12 h-auto animate-spin text-primary opacity-20" />
                <p className="text-muted-foreground animate-pulse">Loading profile...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 p-12 text-center bg-red-500/5 rounded-xl border border-red-500/20">
                <AlertCircle className="w-12 h-auto text-red-500" />
                <h3 className="text-xl font-semibold">Connection Error</h3>
                <p className="text-muted-foreground max-w-sm">Failed to load profile. Please try again.</p>
                <Button variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: ["profile"] })} className="rounded-lg">Retry</Button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/50 pb-8">
                <div>
                    <h2 className="text-3xl font-semibold">
                        Profile Settings
                    </h2>
                    <p className="text-muted-foreground text-sm mt-1">Configure your personal information and preferences.</p>
                </div>
                <Badge variant="outline" className="h-7 px-3 text-xs font-medium">
                    {user?.isActive ? 'Active' : 'Inactive'}
                </Badge>
            </div>

            {/* Avatar Section */}
            <div className="flex flex-col sm:flex-row items-center gap-8 p-8 rounded-xl bg-muted/20 border border-border/40">

                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleFileUpload}
                />

                <div className="relative group/avatar cursor-pointer shrink-0" onClick={() => fileInputRef.current?.click()}>
                    <div className="w-28 h-28 rounded-xl bg-background p-1 shadow-md">
                        <div className="w-full h-full rounded-lg overflow-hidden border border-border/50 bg-muted flex items-center justify-center">
                            {avatarMutation.isPending ? (
                                <Loader2 className="w-8 h-8 animate-spin text-primary opacity-40" />
                            ) : (
                                <img src={avatarSrc} alt="Avatar" className="w-full h-full object-cover" />
                            )}
                        </div>
                    </div>
                    <div className="absolute inset-0 z-10 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity rounded-xl overflow-hidden">
                        <div className="w-full h-full bg-primary/60 backdrop-blur-sm flex items-center justify-center">
                            <Camera className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <div className="absolute -bottom-1.5 -right-1.5 w-8 h-8 bg-background border border-border rounded-lg flex items-center justify-center shadow z-20">
                        <Camera className="w-4 h-4 text-primary" />
                    </div>
                </div>

                <div className="text-center sm:text-left space-y-3">
                    <div>
                        <h3 className="font-semibold text-xl">{user?.name}</h3>
                        <p className="text-muted-foreground text-sm mt-0.5">{user?.jobTitle || "No title set"}</p>
                    </div>
                    <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                        <Button 
                            type="button" 
                            disabled={avatarMutation.isPending}
                            onClick={() => fileInputRef.current?.click()}
                            className="rounded-lg h-9"
                        >
                            {avatarMutation.isPending ? "Uploading..." : "Change Photo"}
                        </Button>
                        <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => updateMutation.mutate({ avatarUrl: '' })}
                            className="rounded-lg h-9"
                        >
                            Reset
                        </Button>
                    </div>
                </div>
            </div>

            {/* Basic Info */}
            <div className="space-y-6">
                <h3 className="text-sm font-medium text-muted-foreground">Personal Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Full Name</Label>
                        <Input {...register("name")} className="h-9 rounded-lg" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Job Title</Label>
                        <Input {...register("jobTitle")} placeholder="e.g. Senior Cloud Architect" className="h-9 rounded-lg" />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Email</Label>
                        <Input type="email" value={user?.email} disabled className="h-9 rounded-lg opacity-60 cursor-not-allowed" />
                        <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Phone</Label>
                        <Input type="tel" {...register("phone")} placeholder="+1 (555) 000-0000" className="h-9 rounded-lg" />
                    </div>

                    <div className="md:col-span-2 space-y-2">
                        <Label className="text-sm font-medium">Bio</Label>
                        <Textarea {...register("bio")} rows={4} className="rounded-lg resize-none" placeholder="Write something about yourself..." />
                        <div className="flex justify-between items-center">
                            <p className="text-xs text-muted-foreground">{bioValue.length} / 500 characters</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Billing Address Section */}
            <div className="space-y-6 pt-8 border-t border-border/50">
                <h3 className="text-sm font-medium text-muted-foreground">Billing Address</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-2">
                        <Label className="text-sm font-medium">Address</Label>
                        <Input {...register("address")} placeholder="1248 Innovation Drive" className="h-9 rounded-lg" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Unit / Floor</Label>
                        <Input {...register("unit")} placeholder="Suite 400" className="h-9 rounded-lg" />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-medium">City</Label>
                        <Input {...register("city")} placeholder="Palo Alto" className="h-9 rounded-lg" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">State</Label>
                        <Input {...register("state")} placeholder="California" className="h-9 rounded-lg" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">ZIP Code</Label>
                        <Input {...register("zipCode")} placeholder="94304" className="h-9 rounded-lg" />
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border/50">
                <div className="flex items-center gap-3 bg-muted/30 p-3 rounded-lg border border-border/50">
                    <Map className="w-5 h-5 text-green-500" />
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Status: Synchronized</p>
                        <p className="text-xs text-green-500/70">Last verified via Global Node</p>
                    </div>
                </div>
                <Button type="submit"
                    disabled={updateMutation.isPending}
                    className="rounded-lg h-9"
                >
                    {updateMutation.isPending ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                        </>
                    )}
                </Button>
            </div>

        </form>
    );
}

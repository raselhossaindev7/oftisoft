"use client"
import { AnimatedDiv } from "@/lib/animated";

import { useState } from "react";
import { Check, Shield, Smartphone, Key, LogOut, Lock, AlertTriangle, Fingerprint, ShieldCheck, Clock, ShieldAlert, Loader2, Server, Globe, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { 
    Dialog, 
    DialogContent, 
    DialogDescription, 
    DialogHeader, 
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authAPI, Session } from "@/lib/api";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const passwordSchema = z.object({
    oldPassword: z.string().min(1, "Old password is required"),
    newPassword: z.string().min(8, "New password must be at least 8 characters").regex(/[A-Z]/, "Must contain uppercase").regex(/[0-9]/, "Must contain number"),
    confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function SecuritySettings() {
    const queryClient = useQueryClient();
    
    // Fetch active sessions
  const { data: sessions, isLoading: sessionsLoading } = useQuery({
        queryKey: ["sessions"],
        queryFn: () => authAPI.getSessions(),
    });

    const [showTwoFactorDialog, setShowTwoFactorDialog] = useState(false);
    const [twoFactorData, setTwoFactorData] = useState<{ secret: string; qrCode: string } | null>(null);
    const [verificationCode, setVerificationCode] = useState("");
    const [isDisablingMfa, setIsDisablingMfa] = useState(false);

    const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<PasswordFormValues>({
        resolver: zodResolver(passwordSchema)
    });

    const newPassword = watch("newPassword") || "";
    const strength = newPassword.length === 0 ? 0 : (newPassword.length > 10 ? 100 : newPassword.length * 10);

    // Mutation for updating password
  const passwordMutation = useMutation({
        mutationFn: (data: PasswordFormValues) => authAPI.changePassword({
            oldPassword: data.oldPassword,
            newPassword: data.newPassword
        }),
        onSuccess: () => {
            reset();
            toast.success("Authentication credentials updated!", {
                description: "Your account now uses higher-order cryptographic protocols.",
                icon: <ShieldCheck className="w-4 h-4 text-primary" />
            });
        },
        onError: (err: any) => {
            toast.error("Credential Injection Failed", {
                description: err.response?.data?.message || "Invalid current terminal token."
            });
        }
    });

    // 2FA Setup Mutation
  const setup2FAMutation = useMutation({
        mutationFn: () => authAPI.setup2FA(),
        onSuccess: (data) => {
            setTwoFactorData(data);
            setShowTwoFactorDialog(true);
        }
    });

    // 2FA Verify Mutation
  const verify2FAMutation = useMutation({
        mutationFn: (code: string) => authAPI.verify2FA(code),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["profile"] });
            setShowTwoFactorDialog(false);
            setVerificationCode("");
            toast.success("MFA Matrix Synchronized", {
                description: "Your biometric-emulated hardware vault is now active.",
                icon: <ShieldCheck className="w-4 h-4 text-green-500" />
            });
        },
        onError: (err: any) => {
            toast.error("MFA Synchronization Failed", {
                description: err.response?.data?.message || "Invalid TOTP frequency."
            });
        }
    });

    // 2FA Disable Mutation
  const disable2FAMutation = useMutation({
        mutationFn: (code: string) => authAPI.disable2FA(code),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["profile"] });
            setShowTwoFactorDialog(false);
            setIsDisablingMfa(false);
            setVerificationCode("");
            toast.success("Security Protocols Relaxed", {
                description: "MFA protection has been decommissioned."
            });
        },
        onError: (err: any) => {
            toast.error("Decommissioning Failed", {
                description: err.response?.data?.message || "Invalid verification code."
            });
        }
    });

    // Fetch user profile for 2FA status
  const { data: user, isLoading: profileLoading } = useQuery({
        queryKey: ["profile"],
        queryFn: () => authAPI.getProfile(),
    });

    const isTwoFactorEnabled = user?.isTwoFactorEnabled || false;

    // Mutation for revoking session
  const revokeMutation = useMutation({
        mutationFn: (id: string) => authAPI.revokeSession(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["sessions"] });
            toast.success("Neural Node Disconnected", {
                description: "The remote terminal has been successfully purged from the matrix."
            });
        }
    });

    const onPasswordSubmit = (data: PasswordFormValues) => {
        passwordMutation.mutate(data);
    };

    return (
        <div className="space-y-12 max-w-4xl mx-auto pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/50 pb-10">
                <div>
                    <h2 className="text-3xl md:text-3xl font-semibold bg-gradient-to-r from-foreground via-foreground to-foreground/40 bg-clip-text text-transparent">
                        Encryption & Oversight
                    </h2>
                    <p className="text-muted-foreground font-medium mt-2">Configure multi-layered authentication and monitor session integrity.</p>
                </div>
                <div className="flex items-center gap-3 text-green-500 bg-green-500/5 px-5 py-2.5 rounded-full border border-green-500/20 shadow-inner">
                    <ShieldCheck className="w-5 h-5 animate-pulse" />
                    <span className="text-sm font-semibold uppercase">Hardened Matrix Active</span>
                </div>
            </div>

            {/* 2FA Command Center */}
            <Card className="relative overflow-hidden p-[1px] rounded-[48px] bg-gradient-to-br from-primary/20 via-border/10 to-transparent border-none shadow-2xl group">
                <div className="absolute inset-[1px] rounded-[47px] bg-[#0A0A0A] z-0" />
                <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-primary/10 blur-[100px] rounded-full pointer-events-none group-hover:bg-primary/20 transition-colors duration-1000" />
                
                <CardContent className="p-10 md:p-14 relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
                        <div className="relative">
                            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full opacity-50" />
                            <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-primary/5 rounded-[32px] border border-primary/20 flex items-center justify-center text-primary shrink-0 shadow-2xl relative z-10 group-hover:scale-110 group-hover:rotate-3 transition-all duration-700">
                                <Fingerprint className="w-12 h-auto" />
                            </div>
                        </div>
                        <div className="space-y-4 text-center md:text-left">
                            <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
                                <h3 className="font-semibold text-3xl bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">Multi-Factor Hardware Sync</h3>
                                <Badge className={cn("font-semibold text-sm uppercase h-6 px-4 rounded-full border-none shadow-lg", isTwoFactorEnabled ? "bg-green-500 text-white shadow-green-500/20" : "bg-orange-600 text-white shadow-orange-600/20")}>
                                    {isTwoFactorEnabled ? "Secure Node" : "Vulnerable Path"}
                                </Badge>
                            </div>
                            <p className="text-[15px] text-muted-foreground/80 font-medium max-w-xl leading-relaxed">
                                Universal protection using cryptographically signed TOTP tokens. Required for administrative actions and planetary-scale resource deployments.
                            </p>
                            <div className="pt-2">
                                <Button variant="link" className="text-sm font-semibold text-primary uppercase h-auto p-0 hover:text-primary/80 transition-colors gap-2">
                                    <Smartphone className="w-4 h-4" /> {isTwoFactorEnabled ? "Re-sync Hardware Vault" : "Initialize Hardware Link"}
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-4 bg-white/[0.03] p-8 rounded-[40px] border border-white/5 shadow-[inset_0_2px_20px_rgba(0,0,0,0.4)]">
                        <p className="text-sm font-semibold uppercase text-muted-foreground/40 mb-2">Perimeter Control</p>
                        <Switch checked={isTwoFactorEnabled}
                            onCheckedChange={(checked) => {
                                if (checked) {
                                    setup2FAMutation.mutate();
                                } else {
                                    setIsDisablingMfa(true);
                                    setShowTwoFactorDialog(true);
                                }
                            }}
                            className="scale-150 data-[state=checked]:bg-primary"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Credential Re-Verification */}
            <form onSubmit={handleSubmit(onPasswordSubmit)} className="space-y-12">
                <div className="flex items-center gap-4 ml-2">
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-lg">
                         <Key className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-semibold uppercase text-muted-foreground/60">Credential Hierarchy</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-4">
                        <Label className="text-sm font-semibold uppercase text-muted-foreground/50 ml-4">Legacy Token (Old Password)</Label>
                        <div className="relative group">
                            <Input type="password" {...register("oldPassword")} placeholder="••••••••••••" className="h-16 px-8 rounded-3xl border border-white/5 bg-white/[0.02] focus-visible:ring-primary/40 font-mono text-xl transition-all group-hover:bg-white/[0.04] shadow-inner" />
                            <Lock className="absolute right-8 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground opacity-20 group-hover:opacity-40 transition-opacity" />
                        </div>
                        {errors.oldPassword && <p className="text-sm text-red-500 font-bold px-4">{errors.oldPassword.message}</p>}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-4">
                        <Label className="text-sm font-semibold uppercase text-muted-foreground/50 ml-4">Target Cryptographic String</Label>
                        <Input type="password" {...register("newPassword")} placeholder="••••••••••••" className="h-16 px-8 rounded-3xl border border-white/5 bg-white/[0.02] focus-visible:ring-primary/40 font-mono text-xl group-hover:bg-white/[0.04] shadow-inner" />
                        <div className="px-2 space-y-3 pt-1">
                             <div className="h-1.5 bg-white/5 rounded-full overflow-hidden shadow-inner">
                                <AnimatedDiv 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${strength}%` }}
                                    className={cn("h-full transition-all duration-700", strength > 70 ? "bg-primary shadow-[0_0_15px_rgba(37,99,235,0.6)]" : "bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.6)]")} 
                                />
                            </div>
                            <p className={cn("text-xs font-semibold uppercase text-right", strength > 70 ? "text-primary" : "text-orange-500")}>
                                Entropy Level: {strength > 70 ? "Maximum Integrity" : "Standard Threshold"}
                            </p>
                        </div>
                        {errors.newPassword && <p className="text-sm text-red-500 font-bold  px-4">{errors.newPassword.message}</p>}
                    </div>
                    <div className="space-y-4">
                        <Label className="text-sm font-semibold uppercase text-muted-foreground/50 ml-4">Re-Verify Target String</Label>
                        <Input type="password" {...register("confirmPassword")} placeholder="••••••••••••" className="h-16 px-8 rounded-3xl border border-white/5 bg-white/[0.02] focus-visible:ring-primary/40 font-mono text-xl group-hover:bg-white/[0.04] shadow-inner" />
                        {errors.confirmPassword && <p className="text-sm text-red-500 font-bold  px-4">{errors.confirmPassword.message}</p>}
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <Button 
                        type="submit"
                        disabled={passwordMutation.isPending}
                        className="h-16 px-14 bg-white/5 hover:bg-primary text-white rounded-[24px] border border-white/10 hover:border-primary font-semibold text-sm uppercase shadow-2xl hover:shadow-primary/40 transition-all hover:scale-[1.05] active:scale-[0.98]"
                    >
                        {passwordMutation.isPending ? (
                            <div className="flex items-center gap-4">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Re-Encrypting Matrix...</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Shield className="w-5 h-5" />
                                <span>Update Credentials</span>
                            </div>
                        )}
                    </Button>
                </div>
            </form>

            {/* Infrastructure Oversight */}
            <div className="pt-16 border-t border-border/50 space-y-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                             <Shield className="w-4 h-4" />
                        </div>
                        <h3 className="text-xs font-semibold uppercase text-muted-foreground/60 underline decoration-primary/30 underline-offset-8">Temporal Session Audit</h3>
                    </div>
                    <Badge variant="outline" className="text-xs font-semibold uppercase px-3 h-7 rounded-full border-primary/20 text-primary">
                        {sessions?.length || 0} Active Nodes
                    </Badge>
                </div>

                <div className="grid gap-8">
                    {sessionsLoading ? (
                        <div className="p-32 flex flex-col items-center justify-center gap-6 bg-white/[0.02] rounded-[48px] border border-white/5 shadow-inner">
                            <Loader2 className="w-12 h-auto animate-spin text-primary/30" />
                            <p className="text-sm font-semibold uppercase text-muted-foreground/30">Syncing Node Matrix...</p>
                        </div>
                    ) : (
                        sessions?.map((session: Session) => (
                            <div key={session.id} className="flex items-center justify-between p-10 bg-white/[0.02] border border-white/5 rounded-[40px] hover:border-primary/40 hover:bg-white/[0.04] transition-all group relative overflow-hidden shadow-sm">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                                
                                <div className="flex items-center gap-8 relative z-10">
                                    <div className="relative">
                                        <div className={cn(
                                            "absolute inset-0 blur-lg rounded-full transition-all duration-1000", 
                                            !session.isRevoked ? "bg-green-500/40" : "bg-transparent"
                                        )} />
                                        <div className={cn(
                                            "w-5 h-5 rounded-full relative z-10 border-2 border-[#0A0A0A] shadow-2xl", 
                                            !session.isRevoked ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)] animate-pulse" : "bg-white/10"
                                        )} />
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 rounded-[24px] bg-[#0A0A0A] border border-white/5 flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:scale-110 group-hover:border-primary/20 transition-all duration-500 shadow-2xl">
                                            {session.userAgent?.includes("Windows") ? <Monitor className="w-8 h-8" /> : session.userAgent?.includes("iPhone") || session.userAgent?.includes("Android") ? <Smartphone className="w-8 h-8" /> : <Server className="w-8 h-8" />}
                                        </div>
                                        <div className="space-y-1.5">
                                            <p className="font-semibold text-lg group-hover:text-white transition-colors">
                                                {session.userAgent || "Unknown Terminal"}
                                            </p>
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-semibold uppercase text-muted-foreground/60">{session.ipAddress}</span>
                                                <div className="w-1 h-1 rounded-full bg-white/10" />
                                                <span className="text-sm font-semibold uppercase text-primary/80">Active since {new Date(session.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 relative z-10">
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        onClick={() => revokeMutation.mutate(session.id)}
                                        disabled={revokeMutation.isPending}
                                        className="h-14 w-14 rounded-2xl text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20 active:scale-90"
                                    >
                                        {revokeMutation.isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : <LogOut className="w-6 h-16" />}
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-10 rounded-[48px] bg-orange-600/[0.03] border border-orange-600/10 flex items-start gap-8 relative overflow-hidden group hover:bg-orange-600/[0.05] transition-colors">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-orange-600/5 blur-[60px] rounded-full" />
                    <div className="w-16 h-16 bg-orange-600/10 text-orange-500 rounded-[28px] border border-orange-600/20 flex items-center justify-center shrink-0 shadow-lg group-hover:rotate-12 transition-transform duration-700">
                        <AlertTriangle className="w-8 h-8 animate-pulse" />
                    </div>
                    <div className="relative z-10 space-y-2 pt-1">
                        <p className="font-semibold text-sm text-orange-500 uppercase">Anomaly Warning Protocol</p>
                        <p className="text-[13px] text-muted-foreground/80 font-medium leading-relaxed max-w-2xl">
                            Detecting login attempts from unrecognized geographic regions will trigger an immediate account lockout. Ensure your recovery satellite phone is synchronized via the Global Signal Matrix.
                        </p>
                    </div>
                </div>
            </div>

            {/* 2FA Setup Dialog */}
            <Dialog open={showTwoFactorDialog} onOpenChange={(open) => {
                if (!open) {
                    setIsDisablingMfa(false);
                    setVerificationCode("");
                }
                setShowTwoFactorDialog(open);
            }}>
                <DialogContent className="max-w-md p-0 overflow-hidden border border-white/5 bg-[#050505]/95 backdrop-blur-3xl rounded-[48px] shadow-[0_0_100px_rgba(37,99,235,0.1)]">
                    <div className="relative overflow-hidden pt-12 pb-8 px-10 flex flex-col items-center text-center space-y-6">
                        {/* Background Decorative Elements */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 blur-[80px] rounded-full" />
                        
                        <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-primary/5 rounded-[32px] border border-primary/20 flex items-center justify-center text-primary shadow-[0_20px_40px_rgba(0,0,0,0.4)] relative group transition-all duration-700 hover:scale-105">
                            <div className="absolute inset-0 bg-primary/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                            <ShieldCheck className="w-12 h-auto relative z-10" />
                        </div>
                        
                        <div className="space-y-3 relative z-10">
                            <DialogTitle className="text-3xl font-semibold bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
                                {isDisablingMfa ? "Neural Lock Removal" : "Secure Node Sync"}
                            </DialogTitle>
                            <DialogDescription className="font-bold text-muted-foreground/80 leading-relaxed px-4">
                                {isDisablingMfa 
                                    ? "Entering the decommissioning sequence will relax your account's cryptographic perimeter."
                                    : "Scan the biometric signature with your mobile node authenticator app to establish an encrypted bridge."
                                }
                            </DialogDescription>
                        </div>
                    </div>

                    <div className="px-10 pb-12 space-y-10 relative z-10">
                        {!isDisablingMfa && twoFactorData?.qrCode && (
                            <div className="flex flex-col items-center space-y-8">
                                <AnimatedDiv 
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="p-6 bg-white/5 rounded-[40px] shadow-2xl border border-white/10 relative group"
                                >
                                    <div className="absolute inset-0 bg-primary/5 blur-3xl opacity-50 group-hover:opacity-100 transition-opacity" />
                                    <div className="p-4 bg-white rounded-[24px] relative z-10 group-hover:scale-105 transition-transform duration-500 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                                        <img src={twoFactorData.qrCode} alt="2FA QR Code" className="w-48 h-48 mix-blend-multiply" />
                                    </div>
                                </AnimatedDiv>
                                
                                <div className="text-center space-y-2 w-full max-w-[280px]">
                                    <p className="text-sm font-semibold uppercase text-muted-foreground/40">Manual Override Secret</p>
                                    <div className="bg-muted/30 p-4 rounded-2xl border border-border/40 group hover:border-primary/40 transition-colors">
                                        <code className="text-xs font-mono font-semibold text-primary block truncate select-all">
                                            {twoFactorData.secret}
                                        </code>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            <Label className="text-sm font-semibold uppercase text-muted-foreground/60 ml-2">
                                {isDisablingMfa ? "Verification String Required" : "TOTP Frequency Sync Code"}
                            </Label>
                            <div className="relative">
                                <Input 
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value)}
                                    placeholder="000 000" 
                                    className="h-20 text-center text-3xl font-mono rounded-[24px] border-none bg-muted/20 focus-visible:ring-2 focus-visible:ring-primary/40 transition-all font-semibold"
                                    maxLength={6}
                                />
                                <div className="absolute inset-0 rounded-[24px] pointer-events-none shadow-[inset_0_2px_10px_rgba(0,0,0,0.2)]" />
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <Button 
                                variant="ghost" 
                                onClick={() => {
                                    setShowTwoFactorDialog(false);
                                    setIsDisablingMfa(false);
                                    setVerificationCode("");
                                }} 
                                className="flex-1 h-14 rounded-2xl font-semibold text-muted-foreground hover:bg-white/5 hover:text-white transition-all uppercase text-sm"
                            >
                                Abort
                            </Button>
                            <Button 
                                disabled={verificationCode.length !== 6 || verify2FAMutation.isPending || disable2FAMutation.isPending}
                                onClick={() => {
                                    if (isDisablingMfa) {
                                        disable2FAMutation.mutate(verificationCode);
                                    } else {
                                        verify2FAMutation.mutate(verificationCode);
                                    }
                                }}
                                className="flex-[2] h-14 px-8 rounded-2xl font-semibold shadow-2xl shadow-primary/20 bg-primary text-white hover:scale-[1.03] active:scale-[0.97] transition-all uppercase text-sm"
                            >
                                {(verify2FAMutation.isPending || disable2FAMutation.isPending) ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    isDisablingMfa ? "Decommission" : "Sync Node"
                                )}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

        </div>
    );
}

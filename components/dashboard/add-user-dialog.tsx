"use client";

import { useState } from "react";
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogDescription, 
    DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select";
import { UserPlus, Loader2 } from "lucide-react";
import { adminUserAPI } from "@/lib/api";
import { toast } from "sonner";

interface AddUserDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function AddUserDialog({ open, onOpenChange, onSuccess }: AddUserDialogProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "Viewer",
        phone: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await adminUserAPI.createUser(formData);
            toast.success("User created successfully");
            onSuccess();
            onOpenChange(false);
            setFormData({
                name: "",
                email: "",
                password: "",
                role: "Viewer",
                phone: ""
            });
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to create user");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] border-border/40 bg-card/60 backdrop-blur-xl shadow-2xl p-0 overflow-hidden">
                <DialogHeader className="p-8 pb-4">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                        <UserPlus className="w-7 h-7 text-primary" />
                    </div>
                    <DialogTitle className="text-3xl font-black italic tracking-tighter uppercase">Inject New Entity</DialogTitle>
                    <DialogDescription className="text-micro font-black uppercase tracking-widest opacity-60 mt-1">Initialize direct ledger record for a new network participant.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="p-8 pt-0 space-y-6">
                    <div className="grid gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-micro font-black uppercase tracking-widest ml-1 opacity-70">Identity Name</Label>
                            <Input 
                                id="name" 
                                placeholder="ALEX_REED_01" 
                                className="rounded-[1.2rem] h-12 bg-background/50 border-border/50 font-black tracking-tight"
                                required value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-micro font-black uppercase tracking-widest ml-1 opacity-70">Signal Address (Email)</Label>
                            <Input 
                                id="email" 
                                type="email" 
                                placeholder="signal@oftisoft.network" 
                                className="rounded-[1.2rem] h-12 bg-background/50 border-border/50 font-black tracking-tight"
                                required value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-micro font-black uppercase tracking-widest ml-1 opacity-70">Access Credential</Label>
                            <Input 
                                id="password" 
                                type="password" 
                                placeholder="••••••••••••" 
                                className="rounded-[1.2rem] h-12 bg-background/50 border-border/50 font-black tracking-tight"
                                required minLength={8}
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="role" className="text-micro font-black uppercase tracking-widest ml-1 opacity-70">Privilege level</Label>
                                <Select 
                                    value={formData.role} 
                                    onValueChange={(value) => setFormData({ ...formData, role: value })}
                                >
                                    <SelectTrigger className="rounded-[1.2rem] h-12 bg-background/50 border-border/50 font-black text-micro tracking-widest uppercase italic">
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl p-1">
                                        <SelectItem value="Viewer" className="rounded-xl font-black text-micro uppercase tracking-widest py-3 italic">Viewer_Node</SelectItem>
                                        <SelectItem value="Support" className="rounded-xl font-black text-micro uppercase tracking-widest py-3 italic">Support_Agent</SelectItem>
                                        <SelectItem value="Editor" className="rounded-xl font-black text-micro uppercase tracking-widest py-3 italic">Manager_Editor</SelectItem>
                                        <SelectItem value="Admin" className="rounded-xl font-black text-micro uppercase tracking-widest py-3 italic">Admin_Protocol</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone" className="text-micro font-black uppercase tracking-widest ml-1 opacity-70">Comm_Link (Optional)</Label>
                                <Input 
                                    id="phone" 
                                    placeholder="+1 800..." 
                                    className="rounded-[1.2rem] h-12 bg-background/50 border-border/50 font-black tracking-tight"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="pt-4 flex gap-3">
                        <Button 
                            type="button" 
                            variant="ghost" 
                            className="rounded-[1.2rem] h-12 px-6 font-black text-micro tracking-widest uppercase italic opacity-60 hover:opacity-100"
                            onClick={() => onOpenChange(false)}
                        >
                            ABORT_INJECTION
                        </Button>
                        <Button 
                            type="submit" 
                            className="rounded-[1.2rem] h-12 px-10 font-black text-micro tracking-widest uppercase italic shadow-xl shadow-primary/20 bg-primary hover:scale-[1.02] transition-transform"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    INITIALIZING...
                                </>
                            ) : (
                                "EXECUTE_INJECTION"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

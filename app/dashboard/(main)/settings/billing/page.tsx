"use client"
import { AnimatedDiv, AnimatePresence } from "@/lib/animated";

import { useState } from "react";
import { 
    CreditCard, 
    Plus, 
    Shield, 
    Lock, 
    Check, 
    MoreHorizontal, 
    Trash2, 
    History,
    ShieldCheck,
    Smartphone,
    ArrowUpCircle,
    FileText,
    BadgeCheck,
    CheckCircle2,
    Clock,
    Zap,
    Crown,
    Loader2,
    AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
    Dialog, 
    DialogContent, 
    DialogDescription, 
    DialogHeader, 
    DialogTitle, 
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { billingAPI, PaymentMethod, Transaction } from "@/lib/api";

export default function BillingSettings() {
    const queryClient = useQueryClient();
    const [isAddCardOpen, setIsAddCardOpen] = useState(false);
    const [cardToDelete, setCardToDelete] = useState<string | null>(null);
    const [newCard, setNewCard] = useState({
        brand: 'Visa',
        last4: '',
        expiry: '',
        cvc: '',
        type: 'Digital Gold'
    });

    // Fetch Payment Methods
  const { data: cards, isLoading: cardsLoading, error: cardsError } = useQuery({
        queryKey: ["payment-methods"],
        queryFn: () => billingAPI.getPaymentMethods(),
    });

    // Fetch Transactions
  const { data: transactions, isLoading: txLoading } = useQuery({
        queryKey: ["transactions"],
        queryFn: () => billingAPI.getTransactions(),
    });

    // Mutation: Set Default
  const setDefaultMutation = useMutation({
        mutationFn: (id: string) => billingAPI.setDefaultPaymentMethod(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["payment-methods"] });
            toast.success("Primary settlement vector updated!", {
                description: "Future transactions will prioritize this instrument.",
                icon: <Crown className="w-4 h-4 text-amber-500" />
            });
        }
    });

    // Mutation: Delete
  const deleteMutation = useMutation({
        mutationFn: (id: string) => billingAPI.deletePaymentMethod(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["payment-methods"] });
            toast.success("Payment method removed", {
                description: "The payment instrument has been removed from your account."
            });
        }
    });

    // Mutation: Add
  const addMutation = useMutation({
        mutationFn: (data: Partial<PaymentMethod>) => billingAPI.addPaymentMethod(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["payment-methods"] });
            setIsAddCardOpen(false);
            setNewCard({ brand: 'Visa', last4: '', expiry: '', cvc: '', type: 'Digital Gold' });
            toast.success("New vector synchronized!", {
                description: "Encrypted credentials appended to vault."
            });
        }
    });

    const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 16) value = value.slice(0, 16);
        
        // Auto-detect Brand
  let brand = 'Visa';
        if (value.startsWith('5')) brand = 'Mastercard';
        else if (value.startsWith('3')) brand = 'Amex';
        else if (value.startsWith('6')) brand = 'Discover';
        
        // Format with spaces #### #### #### ####
        const formatted = value.replace(/(\d{4})(?=\d)/g, '$1 ');
        
        setNewCard(prev => ({ ...prev, last4: formatted, brand }));
    };

    const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 4) value = value.slice(0, 4);
        
        let formatted = value;
        if (value.length > 2) {
            formatted = value.slice(0, 2) + '/' + value.slice(2);
        }
        
        setNewCard(prev => ({ ...prev, expiry: formatted }));
    };

    const handleSetDefault = (id: string) => {
        setDefaultMutation.mutate(id);
    };

    const confirmDelete = (id: string) => {
        setCardToDelete(id);
    };

    const executeDelete = () => {
        if (cardToDelete) {
            deleteMutation.mutate(cardToDelete);
            setCardToDelete(null);
        }
    };

    const handleAddCard = () => {
        if (!newCard.last4 || !newCard.expiry) {
            toast.error("Validation error", { description: "Please provide valid instrument attributes." });
            return;
        }
        addMutation.mutate({
            brand: newCard.brand,
            last4: newCard.last4.replace(/\s/g, '').slice(-4),
            expiry: newCard.expiry,
            type: newCard.type
        });
    };

    if (cardsLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <Loader2 className="w-12 h-auto animate-spin text-primary opacity-20" />
                <p className="text-muted-foreground font-semibold animate-pulse">Accessing Encrypted Vault...</p>
            </div>
        );
    }

    return (
        <div className="space-y-12 max-w-4xl mx-auto pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/50 pb-10">
                <div>
                    <h2 className="text-3xl md:text-3xl font-semibold bg-gradient-to-r from-foreground via-foreground to-foreground/40 bg-clip-text text-transparent">
                        Financial Settlement
                    </h2>
                    <p className="text-muted-foreground font-medium mt-2">Manage institutional payment vectors and global billing infrastructure.</p>
                </div>
                <div className="flex items-center gap-3 text-indigo-500 bg-indigo-500/5 px-5 py-2.5 rounded-full border border-indigo-500/20 shadow-inner">
                    <BadgeCheck className="w-5 h-5" />
                    <span className="text-sm font-semibold uppercase">Premium Ledger Active</span>
                </div>
            </div>

            {/* Payment Instruments */}
            <div className="space-y-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                             <CreditCard className="w-4 h-4" />
                        </div>
                        <h3 className="text-xs font-semibold uppercase text-muted-foreground/60 underline decoration-primary/30 underline-offset-8">Payment Vault</h3>
                    </div>
                    
                    <Dialog open={isAddCardOpen} onOpenChange={setIsAddCardOpen}>
                        <DialogTrigger asChild>
                            <Button className="h-11 rounded-xl gap-3 font-semibold px-6 shadow-xl shadow-primary/20 transition-all hover:scale-[1.05]">
                                <Plus className="w-5 h-5" /> Secure Addition
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md rounded-[32px] p-0 overflow-hidden border-none shadow-2xl">
                            <DialogHeader className="p-8 md:p-10 border-b bg-muted/20">
                                <DialogTitle className="text-2xl font-semibold">Add Payment Vector</DialogTitle>
                                <DialogDescription className="font-medium mt-2 text-muted-foreground">
                                    Your data is encrypted using L1 institutional grade protocols.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="p-8 md:p-10 space-y-6 bg-card">
                                <div className="space-y-4">
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center px-1">
                                            <Label className="text-sm font-semibold uppercase text-muted-foreground">Instrument Details</Label>
                                            <Badge variant="outline" className="text-xs font-semibold uppercase h-5 px-3 rounded-full border-primary/30 text-primary bg-primary/5">
                                                {newCard.brand} Node
                                            </Badge>
                                        </div>
                                        <div className="relative">
                                            <Input 
                                                placeholder="0000 0000 0000 0000" 
                                                value={newCard.last4}
                                                onChange={handleCardNumberChange}
                                                className="h-14 px-6 rounded-2xl bg-muted/30 border-none font-bold" 
                                            />
                                            <CreditCard className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-primary opacity-30" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-3">
                                            <Label className="text-sm font-semibold uppercase text-muted-foreground pl-1">Expiry</Label>
                                            <Input 
                                                placeholder="MM/YY" 
                                                value={newCard.expiry}
                                                onChange={handleExpiryChange}
                                                className="h-14 px-6 rounded-2xl bg-muted/30 border-none font-bold" 
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-sm font-semibold uppercase text-muted-foreground pl-1">Secure CVC</Label>
                                            <Input 
                                                placeholder="•••" 
                                                maxLength={3}
                                                value={newCard.cvc}
                                                onChange={(e) => setNewCard({...newCard, cvc: e.target.value.replace(/\D/g, '').slice(0, 3)})}
                                                className="h-14 px-6 rounded-2xl bg-muted/30 border-none font-bold" 
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/20">
                                    <Shield className="w-5 h-5 text-primary" />
                                    <p className="text-sm font-bold text-muted-foreground leading-snug">PCI-DSS Compliant Encryption Hub. Credentials never reside on this device.</p>
                                </div>
                                <DialogFooter className="pt-4">
                                    <Button 
                                        className="w-full h-14 rounded-2xl font-semibold text-lg shadow-xl shadow-primary/20" 
                                        disabled={addMutation.isPending}
                                        onClick={handleAddCard}
                                    >
                                        {addMutation.isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : "Sync with Vault"}
                                    </Button>
                                </DialogFooter>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <AnimatePresence mode="popLayout">
                        {cards?.map((card) => (
                            <AnimatedDiv layout key={card.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className={cn(
                                    "group p-1 rounded-[44px] transition-all relative overflow-hidden",
                                    card.isDefault ? "bg-gradient-to-br from-primary/40 to-primary/10 p-[2px]" : ""
                                )}
                            >
                                <div className={cn(
                                    "bg-card h-72 rounded-[42px] p-10 flex flex-col justify-between relative overflow-hidden transition-all",
                                    card.isDefault ? "shadow-2xl shadow-primary/20" : "border border-border/50"
                                )}>
                                    {card.isDefault && (
                                        <div className="absolute -right-20 -bottom-20 w-48 h-48 bg-primary/10 blur-[80px] rounded-full pointer-events-none" />
                                    )}
                                    
                                    <div className="flex justify-between items-start relative z-10">
                                        <div className="w-16 h-auto bg-muted rounded-2xl border border-border/50 flex items-center justify-center shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-all duration-700">
                                            <CreditCard className={cn("w-7 h-7", card.isDefault ? "text-primary" : "text-muted-foreground")} />
                                        </div>
                                        <div className="flex gap-3">
                                            {card.isDefault && <Badge className="bg-primary text-white font-semibold text-xs uppercase px-4 h-7 rounded-full">Primary Node</Badge>}
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-2xl hover:bg-muted transition-all">
                                                        <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="rounded-2xl border-none shadow-2xl p-2 bg-card/90 backdrop-blur-xl">
                                                    {!card.isDefault && (
                                                        <DropdownMenuItem 
                                                            onClick={() => handleSetDefault(card.id)}
                                                            className="rounded-xl font-bold cursor-pointer transition-all hover:bg-primary/10 hover:text-primary gap-2"
                                                        >
                                                            <Crown className="w-4 h-4" /> Set Primary
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuItem 
                                                        onClick={() => confirmDelete(card.id)}
                                                        className="rounded-xl font-bold cursor-pointer text-red-500 hover:bg-red-500/10 focus:bg-red-500/10 focus:text-red-500 transition-all gap-2"
                                                    >
                                                        <Trash2 className="w-4 h-4" /> De-Authorize
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>

                                    <div className="space-y-6 relative z-10">
                                        <div className="space-y-1">
                                            <p className="text-sm font-semibold text-muted-foreground uppercase opacity-50">Cipher Stream ID</p>
                                            <h4 className="text-3xl font-semibold font-mono">•••• {card.last4}</h4>
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <p className="text-sm font-semibold text-muted-foreground uppercase opacity-50 mb-1">Vector Type</p>
                                                <p className="text-sm font-semibold">{card.type}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-semibold text-muted-foreground uppercase opacity-50 mb-1">Temporal Code</p>
                                                <p className="text-sm font-semibold">{card.expiry}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </AnimatedDiv>
                        ))}
                    </AnimatePresence>

                    <Button 
                        variant="ghost" 
                        className="h-72 rounded-[42px] border-2 border-dashed border-border/50 bg-muted/10 flex flex-col items-center justify-center text-center space-y-6 group cursor-pointer hover:bg-primary/[0.02] hover:border-primary/30 transition-all"
                        onClick={() => setIsAddCardOpen(true)}
                    >
                        <div className="w-20 h-20 rounded-[28px] bg-background border border-border/50 flex items-center justify-center text-muted-foreground group-hover:scale-110 group-hover:rotate-12 group-hover:text-primary transition-all shadow-xl shadow-black/5">
                            <Plus size={40} className="stroke-[1]" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-lg">New Settlement Vector</h4>
                            <p className="text-sm text-muted-foreground font-bold uppercase max-w-[200px] mx-auto mt-2 opacity-60">Encrypt & Append credentials</p>
                        </div>
                    </Button>
                </div>
            </div>

            {/* Quick Actions & Policy */}
            <div className="pt-16 border-t border-border/50 grid md:grid-cols-2 gap-10">
                <Card className="rounded-[48px] bg-indigo-500/[0.04] border-none p-10 space-y-8 group relative overflow-hidden backdrop-blur-sm self-start">
                    <div className="absolute -right-20 -bottom-20 w-72 h-72 bg-indigo-500/10 blur-[100px] rounded-full" />
                    <div className="w-16 h-16 bg-background rounded-3xl flex items-center justify-center text-indigo-500 shadow-2xl group-hover:scale-110 group-hover:-rotate-6 transition-all duration-700 border border-indigo-500/20">
                        <Smartphone className="w-9 h-9" />
                    </div>
                    <div className="space-y-3 relative z-10">
                        <h4 className="font-semibold text-2xl">Biometric Node Sync</h4>
                        <p className="text-sm text-muted-foreground font-medium leading-relaxed opacity-80">
                            Synchronize your mobile biometric wallet for frictionless holographic checkout and instant settlement across the Oftisoft network.
                        </p>
                    </div>
                    <Button variant="link" className="text-indigo-500 p-0 h-auto font-semibold text-sm uppercase underline underline-offset-8 relative z-10 hover:text-indigo-600" onClick={() => toast.info("Biometric sync: connect your mobile wallet in the app.")}>Initialize Ecosystem Sync</Button>
                </Card>

                <Card className="rounded-[48px] bg-primary/[0.04] border-none p-10 space-y-8 group relative overflow-hidden backdrop-blur-sm self-start">
                    <div className="absolute -right-20 -bottom-20 w-72 h-72 bg-primary/10 blur-[100px] rounded-full" />
                    <div className="w-16 h-16 bg-background rounded-3xl flex items-center justify-center text-primary shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 border border-primary/20">
                        <ShieldCheck className="w-9 h-9" />
                    </div>
                    <div className="space-y-3 relative z-10">
                        <h4 className="font-semibold text-2xl">PCI-DSS L1 Governance</h4>
                        <p className="text-sm text-muted-foreground font-medium leading-relaxed opacity-80">
                            All transactional vectors are tokenized and stored in a hardened hardware security module (HSM). Oftisoft never retains raw metadata.
                        </p>
                    </div>
                    <div className="flex items-center gap-3 pt-2 relative z-10">
                        <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                             <Lock className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-sm font-semibold uppercase text-muted-foreground">End-to-End Cryptography Active</span>
                    </div>
                </Card>
            </div>

            {/* Recent Billing Ledger (Shortcut) */}
            <div className="pt-12 border-t border-border/50">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                             <History className="w-4 h-4" />
                        </div>
                        <h3 className="text-xs font-semibold uppercase text-muted-foreground/60 underline decoration-primary/30 underline-offset-8">Ledger Snapshot</h3>
                    </div>
                    <Button variant="ghost" className="text-sm font-semibold uppercase text-primary h-auto p-0 hover:bg-transparent transition-all hover:scale-110" onClick={() => toast.info("Full transaction history is shown above.")}>View Full History</Button>
                </div>
                
                <div className="grid gap-4">
                    {txLoading ? (
                         <div className="p-12 text-center text-muted-foreground font-semibold animate-pulse">Scanning Global Ledgers...</div>
                    ) : transactions?.map((entry, i) => (
                        <div key={i} className="flex items-center justify-between p-7 bg-muted/20 border border-border/40 rounded-[32px] hover:border-primary/30 hover:bg-muted/30 transition-all cursor-pointer group relative overflow-hidden">
                            <div className="flex items-center gap-6 relative z-10">
                                <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:scale-110 transition-all shadow-sm">
                                    {entry.type.includes("Service") ? <Crown size={24} className="stroke-[1.5]" /> : <Zap size={24} className="stroke-[1.5]" />}
                                </div>
                                <div>
                                    <p className="text-base font-semibold">{entry.invoiceId} <span className="mx-2 opacity-20">|</span> {entry.type}</p>
                                    <p className="text-sm font-bold text-muted-foreground uppercase mt-1 opacity-60">
                                        {new Date(entry.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-8 relative z-10">
                                <span className="font-semibold text-xl">{entry.amount}</span>
                                <Button variant="ghost" size="icon" className="h-auto w-12 rounded-2xl hover:bg-primary/10 transition-all">
                                    <FileText className="w-5 h-5 text-primary opacity-40 group-hover:opacity-100 transition-all group-hover:rotate-12" />
                                </Button>
                            </div>
                        </div>
                    ))}
                    {transactions?.length === 0 && !txLoading && (
                         <div className="p-12 text-center text-muted-foreground font-medium opacity-60">No transaction vectors detected in this dimension.</div>
                    )}
                </div>
            </div>

            {/* Deletion Confirmation */}
            <AlertDialog open={!!cardToDelete} onOpenChange={(open: boolean) => !open && setCardToDelete(null)}>
                <AlertDialogContent className="rounded-[32px] border-none shadow-2xl p-10 bg-card">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-2xl font-semibold">De-Authorize Instrument?</AlertDialogTitle>
                        <AlertDialogDescription className="font-medium text-muted-foreground mt-4">
                            You are about to dismantle the link to this payment vector. 
                            This action is irreversible and will remove the encrypted credentials from the vault.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-8 gap-4">
                        <AlertDialogCancel className="h-12 px-8 rounded-xl font-semibold border-none bg-muted/30 hover:bg-muted/50 transition-all">Abort Deletion</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={executeDelete}
                            className="h-12 px-8 rounded-xl font-semibold bg-red-500 text-white hover:bg-red-600 shadow-xl shadow-red-500/20 transition-all"
                        >
                            Confirm De-Auth
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

        </div>
    );
}

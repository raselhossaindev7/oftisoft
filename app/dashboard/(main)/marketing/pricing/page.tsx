"use client";

import { useState } from "react";
import { 
    Tag, 
    Percent, 
    Plus, 
    Calendar, 
    Trash2, 
    Edit, 
    Copy, 
    Package, 
    TrendingUp, 
    Zap, 
    Search,
    Filter,
    Sparkles,
    ArrowUpRight,
    CheckIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from "@/components/ui/table";
import { toast } from "sonner";

import { useMarketing } from "@/hooks/useMarketing";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";

interface Coupon {
    id: string;
    code: string;
    description: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    expiryDate: string;
    usageLimit?: number;
    usageCount: number;
    status: 'active' | 'expired' | 'disabled';
}

interface Bundle {
    id: string;
    name: string;
    description: string;
    price: number;
    originalPrice?: number;
    image?: string;
    products?: { id: string; name: string }[];
}

export default function PricingMarketingPage() {
    const { 
        coupons, 
        bundles, 
        products, 
        subscriptionPlans, 
        isLoading, 
        refresh,
        createCoupon, 
        updateCoupon, 
        deleteCoupon, 
        toggleCouponStatus, 
        createBundle, 
        updateBundle, 
        deleteBundle,
        createSubscriptionPlan,
        updateSubscriptionPlan,
        deleteSubscriptionPlan
    } = useMarketing();
    
    const [couponSearch, setCouponSearch] = useState("");
    
    // Coupon Form State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [code, setCode] = useState("");
    const [description, setDescription] = useState("");
    const [discountType, setDiscountType] = useState("percentage");
    const [discountValue, setDiscountValue] = useState("");
    const [expiryDate, setExpiryDate] = useState("");
    const [usageLimit, setUsageLimit] = useState("");

    // Bundle Form State
  const [isCreateBundleOpen, setIsCreateBundleOpen] = useState(false);
    const [editingBundleId, setEditingBundleId] = useState<string | null>(null);
    const [bundleName, setBundleName] = useState("");
    const [bundleDescription, setBundleDescription] = useState("");
    const [bundlePrice, setBundlePrice] = useState("");
    const [bundleOriginalPrice, setBundleOriginalPrice] = useState("");
    const [bundleImage, setBundleImage] = useState("");
    const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

    const handleCopyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        toast.success(`Coupon code ${code} copied!`);
    };

    const [editingId, setEditingId] = useState<string | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<{ type: 'coupon' | 'bundle' | 'subscription'; id: string; name: string } | null>(null);

    const resetCouponForm = () => {
        setEditingId(null);
        setCode("");
        setDescription("");
        setDiscountValue("");
        setExpiryDate("");
        setUsageLimit("");
        setDiscountType("percentage");
    };

    const handleCreateCoupon = async () => {
        if (!code || !description || !discountValue || !expiryDate) {
            toast.error("Please fill in all required fields");
            return;
        }

        const data = {
            code,
            description,
            discountType,
            discountValue: Number(discountValue),
            expiryDate: new Date(expiryDate),
            usageLimit: usageLimit ? Number(usageLimit) : null,
        };

        let success;
        if (editingId) {
            success = await updateCoupon(editingId, data);
            if (success) toast.success("Coupon updated successfully");
        } else {
            success = await createCoupon(data);
        }

        if (success) {
            setIsCreateOpen(false);
            resetCouponForm();
        }
    };

    const handleEditCoupon = (coupon: Coupon) => {
        setEditingId(coupon.id);
        setCode(coupon.code);
        setDescription(coupon.description);
        setDiscountType(coupon.discountType);
        setDiscountValue(String(coupon.discountValue));
        try {
            const date = new Date(coupon.expiryDate);
            setExpiryDate(date.toISOString().split('T')[0]); 
        } catch (e) {
             setExpiryDate("");
        }
        setUsageLimit(coupon.usageLimit ? String(coupon.usageLimit) : "");
        setIsCreateOpen(true);
    };

    const handleDeployCampaign = async () => {
        const success = await createCoupon({
            code: "WEEKEND15",
            description: "Weekend Flash Sale - 15% OFF UI Kits",
            discountType: "percentage",
            discountValue: 15,
            expiryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now, usageLimit: 100
        });
        
        if (success) {
            toast.success("Campaign deployed successfully! 'WEEKEND15' coupon created.");
        }
    };
    
    const toggleProductSelection = (id: string) => {
        setSelectedProductIds(prev => 
            prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
        );
    };

    const resetBundleForm = () => {
        setEditingBundleId(null);
        setBundleName("");
        setBundleDescription("");
        setBundlePrice("");
        setBundleOriginalPrice("");
        setBundleImage("");
        setSelectedProductIds([]);
    };

    const handleCreateBundle = async () => {
        if (!bundleName || !bundleDescription || !bundlePrice || selectedProductIds.length === 0) {
            toast.error("Please fill in all required fields and select at least one product");
            return;
        }

        const data = {
            name: bundleName,
            description: bundleDescription,
            price: Number(bundlePrice),
            originalPrice: bundleOriginalPrice ? Number(bundleOriginalPrice) : null,
            image: bundleImage,
            productIds: selectedProductIds,
        };

        let success;
        if (editingBundleId) {
            success = await updateBundle(editingBundleId, data);
            if (success) toast.success("Bundle updated successfully");
        } else {
            success = await createBundle(data);
        }

        if (success) {
            setIsCreateBundleOpen(false);
            resetBundleForm();
        }
    };

    const handleEditBundle = (bundle: Bundle) => {
        setEditingBundleId(bundle.id);
        setBundleName(bundle.name);
        setBundleDescription(bundle.description);
        setBundlePrice(String(bundle.price));
        setBundleOriginalPrice(bundle.originalPrice ? String(bundle.originalPrice) : "");
        setBundleImage(bundle.image || "");
        setSelectedProductIds(bundle.products ? bundle.products.map((p: any) => p.id) : []);
        setIsCreateBundleOpen(true);
    };


    // Subscription Form State
  const [isCreateSubscriptionOpen, setIsCreateSubscriptionOpen] = useState(false);
    const [editingSubscriptionId, setEditingSubscriptionId] = useState<string | null>(null);
    const [subName, setSubName] = useState("");
    const [subPrice, setSubPrice] = useState("");
    const [subInterval, setSubInterval] = useState("month");
    const [subIcon, setSubIcon] = useState("Zap");
    const [subDescription, setSubDescription] = useState("");
    const [subFeatures, setSubFeatures] = useState("");
    const [subButtonText, setSubButtonText] = useState("Get started");

    const resetSubscriptionForm = () => {
        setEditingSubscriptionId(null);
        setSubName("");
        setSubPrice("");
        setSubInterval("month");
        setSubIcon("Zap");
        setSubDescription("");
        setSubFeatures("");
        setSubButtonText("Get started");
    };

    const handleCreateSubscription = async () => {
        if (!subName || !subPrice) {
            toast.error("Please fill in all required fields");
            return;
        }

        const featuresArray = subFeatures
            ? subFeatures.split(/[\n,]+/).map(s => s.trim()).filter(Boolean)
            : undefined;

        const data: any = {
            name: subName,
            price: Number(subPrice),
            interval: subInterval,
            iconName: subIcon
        };
        if (subDescription) data.description = subDescription;
        if (featuresArray?.length) data.features = featuresArray;
        if (subButtonText) data.buttonText = subButtonText;

        let success;
        if (editingSubscriptionId) {
            success = await updateSubscriptionPlan(editingSubscriptionId, data);
            if (success) toast.success("Plan updated successfully");
        } else {
            success = await createSubscriptionPlan(data);
        }

        if (success) {
            setIsCreateSubscriptionOpen(false);
            resetSubscriptionForm();
        }
    };

    const handleEditSubscription = (plan: any) => {
        setEditingSubscriptionId(plan.id);
        setSubName(plan.name);
        setSubPrice(String(plan.price));
        setSubInterval(plan.interval || "month");
        setSubIcon(plan.iconName || "Zap");
        setSubDescription(plan.description ?? "");
        const parsedFeatures = typeof plan.features === 'string' ? (() => { try { return JSON.parse(plan.features); } catch { return plan.features.split('\n').filter(Boolean); } })() : plan.features;
        setSubFeatures(Array.isArray(parsedFeatures) ? parsedFeatures.join("\n") : "");
        setSubButtonText(plan.buttonText ?? "Get started");
        setIsCreateSubscriptionOpen(true);
    };

    const handleConfirmDelete = () => {
        if (!deleteTarget) return;
        if (deleteTarget.type === "coupon") deleteCoupon(deleteTarget.id);
        if (deleteTarget.type === "bundle") deleteBundle(deleteTarget.id);
        if (deleteTarget.type === "subscription") deleteSubscriptionPlan(deleteTarget.id);
        setDeleteTarget(null);
    };

    return (
        <div className="space-y-8 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-semibold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Pricing & Marketing</h1>
                    <p className="text-muted-foreground font-medium mt-1">Boost sales with smart coupons, product bundles, and seasonal campaigns.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="gap-2 rounded-xl h-11 border-border/50 bg-card/50 backdrop-blur-sm font-bold" onClick={() => toast.info("Campaign analytics will show performance by coupon and bundle.")}>
                        <TrendingUp className="w-4 h-4" />
                        Campaign Analytics
                    </Button>
                    <Button variant="outline" className="gap-2 rounded-xl h-11 border-border/50 bg-card/50 backdrop-blur-sm font-bold" onClick={refresh} disabled={isLoading}>
                        Refresh
                    </Button>
                    <Dialog open={isCreateOpen} onOpenChange={(open) => {
                        setIsCreateOpen(open);
                        if (!open) resetCouponForm();
                    }}>
                        <DialogTrigger asChild>
                            <Button className="gap-2 rounded-xl shadow-lg shadow-primary/20 bg-primary h-11 font-bold text-white">
                                <Plus className="w-4 h-4" />
                                Create New Coupon
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px] rounded-[32px] p-8 border-border/50 bg-card/95 backdrop-blur-xl">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-semibold text-center">{editingId ? "Edit Coupon" : "Create New Coupon"}</DialogTitle>
                                <DialogDescription className="text-center font-medium">Define the parameters for your promotional campaign.</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-6 mt-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold  text-muted-foreground">Coupon Code</Label>
                                    <Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="SUMMER2026" className="h-auto rounded-xl font-bold " />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold  text-muted-foreground">Description</Label>
                                    <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Summer Sale Discount" className="h-auto rounded-xl font-medium" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold  text-muted-foreground">Type</Label>
                                        <Select value={discountType} onValueChange={setDiscountType}>
                                            <SelectTrigger className="h-auto rounded-xl font-medium">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="percentage">Percentage (%)</SelectItem>
                                                <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold  text-muted-foreground">Value</Label>
                                        <div className="relative">
                                            <Input type="number" value={discountValue} onChange={(e) => setDiscountValue(e.target.value)} placeholder={discountType === "percentage" ? "20" : "10"} className="h-auto rounded-xl font-medium pl-8" />
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-xs">{discountType === "percentage" ? "%" : "$"}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold  text-muted-foreground">Expiry Date</Label>
                                        <Input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} className="h-auto rounded-xl font-medium" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold  text-muted-foreground">Limit (Optional)</Label>
                                        <Input type="number" value={usageLimit} onChange={(e) => setUsageLimit(e.target.value)} placeholder="100" className="h-auto rounded-xl font-medium" />
                                    </div>
                                </div>
                            </div>
                            <DialogFooter className="mt-8">
                                <Button variant="outline" onClick={() => setIsCreateOpen(false)} className="rounded-xl h-auto font-bold px-8">Cancel</Button>
                                <Button onClick={handleCreateCoupon} className="rounded-xl h-auto font-bold px-8 bg-primary text-white shadow-lg shadow-primary/20">{editingId ? "Save changes" : "Create Coupon"}</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Quick deploy suggestion */}
            <div className="bg-primary/5 border border-primary/20 rounded-[32px] p-8 flex flex-col lg:flex-row items-center justify-between gap-8 overflow-hidden relative group hover:border-primary/40 transition-all">
                <div className="absolute -right-20 -top-20 w-80 h-80 bg-primary/10 rounded-full blur-[80px] group-hover:bg-primary/20 transition-colors" />
                <div className="flex items-center gap-6 relative z-10 w-full md:w-auto">
                    <div className="w-16 h-16 bg-primary rounded-[24px] flex items-center justify-center text-white shadow-xl shadow-primary/30 shrink-0">
                        <Sparkles className="w-8 h-8 animate-pulse" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-xl">Quick deploy: Weekend-style campaign</h3>
                        <p className="text-sm font-medium text-muted-foreground mt-1 max-w-xl leading-relaxed">Create a 15% weekend coupon (WEEKEND15) valid for 2 days with 100 uses. Edit details in the form after creation.</p>
                    </div>
                </div>
                <Button onClick={handleDeployCampaign} disabled={isLoading} className="w-full md:w-auto rounded-2xl h-14 px-8 relative font-semibold  bg-foreground text-background hover:bg-foreground/90 shadow-xl shrink-0">
                    Deploy suggested campaign <ArrowUpRight className="ml-2 w-4 h-4" />
                </Button>
            </div>

            <Tabs defaultValue="coupons" className="space-y-8">
                <TabsList className="bg-muted/50 p-1 rounded-2xl h-14 w-fit border border-border/50">
                    <TabsTrigger value="coupons" className="rounded-xl h-auto gap-2 data-[state=active]:bg-background data-[state=active]:shadow-md font-bold px-8 text-sm">
                        <Tag className="w-4 h-4" /> Coupons
                    </TabsTrigger>
                    <TabsTrigger value="bundles" className="rounded-xl h-auto gap-2 data-[state=active]:bg-background data-[state=active]:shadow-md font-bold px-8 text-sm">
                        <Package className="w-4 h-4" /> Bundles
                    </TabsTrigger>
                    <TabsTrigger value="subscriptions" className="rounded-xl h-auto gap-2 data-[state=active]:bg-background data-[state=active]:shadow-md font-bold px-8 text-sm">
                        <Zap className="w-4 h-4" /> Subscriptions
                    </TabsTrigger>
                </TabsList>

                {/* Coupons Tab */}
                <TabsContent value="coupons" className="space-y-6">
                    <Card className="border-border/50 overflow-hidden bg-card/50 backdrop-blur-sm rounded-[32px] shadow-sm">
                        <CardHeader className="p-6 border-b border-border/50 bg-muted/5">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="relative flex-1 max-w-md">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input placeholder="Search coupons by code or description..." value={couponSearch} onChange={(e) => setCouponSearch(e.target.value)} className="pl-11 h-auto rounded-2xl bg-background border-border/50 focus:ring-primary/20" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm" className="h-10 px-4 gap-2 rounded-xl font-bold border-border/50" onClick={() => setCouponSearch("")} disabled={!couponSearch}><Filter className="w-4 h-4" /> Clear</Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/5 hover:bg-muted/5 border-border/50">
                                        <TableHead className="w-[200px] h-auto font-semibold text-xs  pl-6">Code</TableHead>
                                        <TableHead className="h-auto font-semibold text-xs ">Description</TableHead>
                                        <TableHead className="h-auto font-semibold text-xs ">Discount</TableHead>
                                        <TableHead className="h-auto font-semibold text-xs ">Usage</TableHead>
                                        <TableHead className="h-auto font-semibold text-xs ">Status</TableHead>
                                        <TableHead className="h-auto font-semibold text-xs  text-right pr-6">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {(() => {
                                        const displayCoupons = couponSearch
                                            ? coupons.filter(c => c.code?.toLowerCase().includes(couponSearch.toLowerCase()) || c.description?.toLowerCase().includes(couponSearch.toLowerCase()))
                                            : coupons;
                                        if (displayCoupons.length === 0) {
                                            return (
                                                <TableRow>
                                                    <TableCell colSpan={6} className="h-64 text-center">
                                                        <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground">
                                                            {couponSearch ? (
                                                                <>
                                                                    <p className="font-medium">No coupons match your search.</p>
                                                                    <Button variant="outline" size="sm" onClick={() => setCouponSearch("")}>Clear search</Button>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center">
                                                                        <Tag className="w-8 h-8 opacity-20" />
                                                                    </div>
                                                                    <p className="font-medium">No coupons active. Create one to get started.</p>
                                                                </>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        }
                                        return displayCoupons.map((coupon) => (
                                        <TableRow key={coupon.id} className="group hover:bg-primary/[0.02] transition-colors border-border/50">
                                            <TableCell className="pl-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <code className="font-mono font-semibold text-sm px-3 py-1.5 bg-primary/10 text-primary rounded-lg border border-primary/20 select-all">
                                                        {coupon.code}
                                                    </code>
                                                    <button onClick={() => handleCopyCode(coupon.code)} className="opacity-0 group-hover:opacity-100 p-2 hover:bg-background rounded-lg transition-all border border-transparent hover:border-border/50 shadow-sm">
                                                        <Copy size={14} className="text-muted-foreground" />
                                                    </button>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-foreground/90">{coupon.description}</span>
                                                    <span className="text-sm  font-bold text-muted-foreground flex items-center gap-1.5 mt-1">
                                                        <Calendar className="w-3 h-3" /> Expires {format(new Date(coupon.expiryDate), 'MMM dd, yyyy')}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <div className="flex items-center gap-2 font-semibold text-lg  text-foreground/80">
                                                    <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 shrink-0">
                                                        <Percent className="w-4 h-4" />
                                                    </div>
                                                    {coupon.discountValue}{coupon.discountType === "percentage" ? "%" : "$"} OFF
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <div className="flex flex-col gap-2 w-32">
                                                    <div className="flex justify-between text-sm font-semibold ">
                                                        <span>{coupon.usageCount} Used</span>
                                                        <span className="text-muted-foreground opacity-50">{coupon.usageLimit ? `/ ${coupon.usageLimit}` : '∞'}</span>
                                                    </div>
                                                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                                        <div 
                                                            className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full transition-all duration-1000" 
                                                            style={{ width: `${coupon.usageLimit ? (coupon.usageCount / coupon.usageLimit) * 100 : 5}%` }} 
                                                        />
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <Badge 
                                                    onClick={() => toggleCouponStatus(coupon.id, coupon.status || 'active')}
                                                    className={`cursor-pointer transition-all hover:scale-105 ${
                                                    coupon.status === "active" ? "bg-green-500 text-white shadow-lg shadow-green-500/20 hover:bg-green-600 border-none font-bold  text-sm px-3 py-1" : 
                                                    "bg-muted text-muted-foreground font-bold  text-sm px-3 py-1 hover:bg-muted/80"
                                                }`}>
                                                    {coupon.status || 'Active'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right pr-6 py-4">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                                    <Button variant="ghost" size="icon" onClick={() => handleEditCoupon(coupon)} className="h-9 w-9 rounded-xl hover:bg-background hover:shadow-sm border border-transparent hover:border-border/50"><Edit size={14} /></Button>
                                                    <Button variant="ghost" size="icon" onClick={() => setDeleteTarget({ type: 'coupon', id: coupon.id, name: coupon.code })} className="h-9 w-9 rounded-xl hover:bg-destructive/10 hover:text-destructive border border-transparent hover:border-destructive/20"><Trash2 size={14} /></Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ));
                                    })()}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Bundles Tab */}
                <TabsContent value="bundles">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {bundles.length === 0 && (
                            <div className="col-span-full flex flex-col items-center justify-center py-20 rounded-[32px] border-2 border-dashed border-border/50 bg-muted/5">
                                <Package className="w-12 h-12 text-muted-foreground/50 mb-4" />
                                <p className="font-bold text-muted-foreground">No bundles yet.</p>
                                <p className="text-sm text-muted-foreground mt-1">Create a bundle to combine products and offer discounts.</p>
                                <Button onClick={() => { resetBundleForm(); setIsCreateBundleOpen(true); }} className="mt-6 rounded-xl gap-2 bg-primary text-white font-bold">
                                    <Plus className="w-4 h-4" /> Create first bundle
                                </Button>
                            </div>
                        )}
                        {bundles.map(bundle => (
                            <Card key={bundle.id} className="border-border/50 hover:border-primary/50 transition-all group overflow-hidden rounded-[32px] bg-card/50 backdrop-blur-sm shadow-sm hover:shadow-lg hover:shadow-primary/5">
                                <div className="h-40 bg-muted relative overflow-hidden">
                                     {bundle.image && <img src={bundle.image} alt={bundle.name} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" />}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                                    <Badge className="absolute top-4 right-4 bg-primary text-white shadow-lg shadow-primary/20 font-bold  text-sm border-none">Active Bundle</Badge>
                                    <div className="absolute bottom-4 left-6 right-6">
                                        <CardTitle className="text-xl font-semibold  text-white">{bundle.name}</CardTitle>
                                        <CardDescription className="text-xs mt-1 text-white/70 line-clamp-1 font-medium">{bundle.description}</CardDescription>
                                    </div>
                                </div>
                                <CardContent className="space-y-6 p-6">
                                    <div className="flex flex-wrap gap-2">
                                        {bundle.products && bundle.products.map((p: any) => (
                                            <Badge key={p.id} variant="secondary" className="text-sm h-6 px-3 bg-muted font-bold text-muted-foreground border border-border/50">{p.name}</Badge>
                                        ))}
                                    </div>
                                    <div className="pt-6 border-t border-border/50 flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground  font-semibold mb-1">Bundle Price</p>
                                            <div className="flex items-baseline gap-2">
                                                <p className="font-semibold text-2xl">${bundle.price}</p>
                                                {bundle.originalPrice && <span className="text-sm text-muted-foreground line-through decoration-destructive/50  font-bold">${bundle.originalPrice}</span>}
                                            </div>
                                        </div>
                                        {bundle.originalPrice && (
                                            <Badge className="bg-green-500/10 text-green-500 border-green-500/20 font-semibold  text-sm px-3 h-7 animate-pulse">
                                                Save ${Number(bundle.originalPrice) - Number(bundle.price)}
                                            </Badge>
                                        )}
                                    </div>
                                </CardContent>
                                <CardFooter className="p-6 pt-0 flex gap-3">
                                    <Button variant="outline" onClick={() => handleEditBundle(bundle)} className="flex-1 text-xs font-bold rounded-xl h-10 border-border/50 shadow-sm">Edit Bundle</Button>
                                    <Button variant="ghost" onClick={() => setDeleteTarget({ type: 'bundle', id: bundle.id, name: bundle.name })} className="w-10 h-10 p-0 rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive"><Trash2 size={16} /></Button>
                                </CardFooter>
                            </Card>
                        ))}
                        
                        {/* New Bundle Dialog Trigger */}
                        <Dialog open={isCreateBundleOpen} onOpenChange={(open) => {
                            setIsCreateBundleOpen(open);
                            if (!open) resetBundleForm();
                        }}>
                            <DialogTrigger asChild>
                                <div className="border-2 border-dashed border-primary/20 rounded-[32px] flex flex-col items-center justify-center p-8 text-center bg-primary/[0.02] hover:bg-primary/[0.05] transition-all group cursor-pointer h-full min-h-[300px]">
                                    <div className="w-16 h-16 rounded-[24px] bg-background border border-primary/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:border-primary/50 transition-all shadow-lg shadow-primary/5">
                                        <Plus className="w-8 h-8 text-primary opacity-50 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    <h4 className="font-semibold text-lg text-foreground/80 group-hover:text-primary transition-colors">Create New Bundle</h4>
                                    <p className="text-xs font-medium text-muted-foreground max-w-[200px] mt-2 leading-relaxed">Combine multiple assets into a high-value package to increase average order value.</p>
                                </div>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[600px] rounded-[32px] p-8 border-border/50 bg-card/95 backdrop-blur-xl">
                                <DialogHeader>
                                    <DialogTitle className="text-2xl font-semibold text-center">{editingBundleId ? "Edit Bundle" : "Create Bundle"}</DialogTitle>
                                    <DialogDescription className="text-center font-medium">Combine products into a single offering.</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-6 mt-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold  text-muted-foreground">Bundle Name</Label>
                                        <Input value={bundleName} onChange={(e) => setBundleName(e.target.value)} placeholder="Ultimate Creator Pack" className="h-auto rounded-xl font-bold" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold  text-muted-foreground">Description</Label>
                                        <Input value={bundleDescription} onChange={(e) => setBundleDescription(e.target.value)} placeholder="Includes all major kits + lifetime updates" className="h-auto rounded-xl font-medium" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                         <div className="space-y-2">
                                            <Label className="text-xs font-semibold  text-muted-foreground">Price ($)</Label>
                                            <Input type="number" value={bundlePrice} onChange={(e) => setBundlePrice(e.target.value)} placeholder="199" className="h-auto rounded-xl font-medium" />
                                        </div>
                                         <div className="space-y-2">
                                            <Label className="text-xs font-semibold  text-muted-foreground">Original Price ($)</Label>
                                            <Input type="number" value={bundleOriginalPrice} onChange={(e) => setBundleOriginalPrice(e.target.value)} placeholder="299" className="h-auto rounded-xl font-medium" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold  text-muted-foreground">Select Products</Label>
                                        <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border border-border/50 rounded-xl bg-background/50">
                                            {products.map(product => (
                                                <div 
                                                    key={product.id} 
                                                    onClick={() => toggleProductSelection(product.id)}
                                                    className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${selectedProductIds.includes(product.id) ? 'bg-primary/10 border-primary/50' : 'bg-background border-border/50 hover:bg-muted/50'}`}
                                                >
                                                    <span className="text-xs font-bold truncate pr-2">{product.name}</span>
                                                    {selectedProductIds.includes(product.id) && <Badge className="h-4 w-4 p-0 rounded-full flex items-center justify-center bg-primary text-white ml-auto"><CheckIcon size={10} /></Badge>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold  text-muted-foreground">Preview Image URL</Label>
                                        <Input value={bundleImage} onChange={(e) => setBundleImage(e.target.value)} placeholder="https://..." className="h-auto rounded-xl font-medium text-xs" />
                                    </div>
                                </div>
                                <DialogFooter className="mt-8">
                                    <Button variant="outline" onClick={() => setIsCreateBundleOpen(false)} className="rounded-xl h-auto font-bold px-8">Cancel</Button>
                                    <Button onClick={handleCreateBundle} className="rounded-xl h-auto font-bold px-8 bg-primary text-white shadow-lg shadow-primary/20">{editingBundleId ? "Save changes" : "Create Bundle"}</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </TabsContent>


                {/* Subscriptions Tab */}
                <TabsContent value="subscriptions">
                    <div className="flex justify-end mb-4">
                        <Button onClick={() => {
                            resetSubscriptionForm();
                            setIsCreateSubscriptionOpen(true);
                        }} className="gap-2 rounded-xl shadow-lg shadow-primary/20 bg-primary h-11 font-bold text-white">
                            <Plus className="w-4 h-4" />
                            Create New Plan
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {subscriptionPlans.map((plan: any) => {
                            const Icon = plan.iconName === 'Zap' ? Zap : plan.iconName === 'TrendingUp' ? TrendingUp : Sparkles;
                            return (
                                <Card key={plan.id} className="border-border/50 group hover:border-primary/50 transition-all rounded-[32px] bg-card/50 backdrop-blur-sm shadow-sm hover:shadow-lg overflow-hidden">
                                    <div className={`h-2 w-full ${plan.bg?.replace('/10', '/50') || 'bg-blue-500/50'}`} />
                                    <CardHeader className="p-8 pb-4">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className={`p-3 rounded-2xl ${plan.bgColor || 'bg-blue-500/10'} ${plan.color || 'text-blue-500'}`}>
                                                <Icon size={24} />
                                            </div>
                                            <Badge className="ml-auto bg-green-500/10 text-green-500 border-none text-xs font-semibold  px-2 py-1">Growth Status</Badge>
                                        </div>
                                        <CardTitle className="text-xl font-semibold">{plan.name}</CardTitle>
                                        <CardDescription className="text-xs font-medium mt-1">Managed recurring service plan.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-8 pt-4">
                                        <div className="flex items-baseline gap-1 mb-8">
                                            <span className="text-3xl font-semibold">${plan.price}</span>
                                            <span className="text-sm font-bold text-muted-foreground">/{plan.interval}</span>
                                        </div>
                                        <div className="space-y-4 p-4 rounded-2xl bg-muted/50 border border-border/50">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="font-bold text-muted-foreground ">Active Subs</span>
                                                <span className="font-semibold text-foreground">{plan.activeSubscribers || 0}</span>
                                            </div>
                                            <div className="h-px bg-border/50" />
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="font-bold text-muted-foreground ">MRR Impact</span>
                                                <span className="font-semibold text-primary">${((plan.price || 0) * (plan.activeSubscribers || 0)).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="p-8 pt-0 flex gap-3">
                                        <Button variant="outline" onClick={() => handleEditSubscription(plan)} className="flex-1 rounded-2xl h-auto text-xs font-bold gap-2 group border border-border/50 hover:bg-primary hover:text-white transition-all shadow-sm">
                                            Manage Plan <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                        </Button>
                                        <Button variant="ghost" onClick={() => setDeleteTarget({ type: 'subscription', id: plan.id, name: plan.name })} className="w-12 h-auto p-0 rounded-2xl text-destructive hover:bg-destructive/10 hover:text-destructive"><Trash2 size={16} /></Button>
                                    </CardFooter>
                                </Card>
                            );
                        })}
                    </div>

                    <Dialog open={isCreateSubscriptionOpen} onOpenChange={(open) => {
                        setIsCreateSubscriptionOpen(open);
                        if (!open) resetSubscriptionForm();
                    }}>
                        <DialogContent className="sm:max-w-[500px] rounded-[32px] p-8 border-border/50 bg-card/95 backdrop-blur-xl">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-semibold text-center">{editingSubscriptionId ? "Edit Plan" : "Create Plan"}</DialogTitle>
                                <DialogDescription className="text-center font-medium">Configure subscription details.</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-6 mt-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold  text-muted-foreground">Plan Name</Label>
                                    <Input value={subName} onChange={(e) => setSubName(e.target.value)} placeholder="Enterprise" className="h-auto rounded-xl font-bold" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold  text-muted-foreground">Price ($)</Label>
                                        <Input type="number" value={subPrice} onChange={(e) => setSubPrice(e.target.value)} placeholder="99" className="h-auto rounded-xl font-medium" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-semibold  text-muted-foreground">Interval</Label>
                                        <Select value={subInterval} onValueChange={setSubInterval}>
                                            <SelectTrigger className="h-auto rounded-xl font-medium">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="month">Monthly</SelectItem>
                                                <SelectItem value="year">Yearly</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold  text-muted-foreground">Description (optional)</Label>
                                    <Textarea value={subDescription} onChange={(e) => setSubDescription(e.target.value)} placeholder="Short description for the plan" className="min-h-[80px] rounded-xl font-medium" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold  text-muted-foreground">Features (one per line or comma-separated)</Label>
                                    <Textarea value={subFeatures} onChange={(e) => setSubFeatures(e.target.value)} placeholder="Feature one&#10;Feature two&#10;Feature three" className="min-h-[100px] rounded-xl font-medium text-sm" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold  text-muted-foreground">Button text (optional)</Label>
                                    <Input value={subButtonText} onChange={(e) => setSubButtonText(e.target.value)} placeholder="Get started" className="h-auto rounded-xl font-medium" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold  text-muted-foreground">Icon Style</Label>
                                    <div className="flex gap-4">
                                        {['Zap', 'Sparkles', 'TrendingUp'].map((icon) => (
                                            <div 
                                                key={icon} 
                                                onClick={() => setSubIcon(icon)}
                                                className={`p-4 rounded-xl cursor-pointer border transition-all ${subIcon === icon ? 'bg-primary/10 border-primary' : 'bg-muted/30 border-transparent hover:bg-muted/50'}`}
                                            >
                                                {icon === 'Zap' && <Zap size={20} />}
                                                {icon === 'Sparkles' && <Sparkles size={20} />}
                                                {icon === 'TrendingUp' && <TrendingUp size={20} />}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <DialogFooter className="mt-8">
                                <Button variant="outline" onClick={() => setIsCreateSubscriptionOpen(false)} className="rounded-xl h-auto font-bold px-8">Cancel</Button>
                                <Button onClick={handleCreateSubscription} className="rounded-xl h-auto font-bold px-8 bg-primary text-white shadow-lg shadow-primary/20">{editingSubscriptionId ? "Save changes" : "Create Plan"}</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </TabsContent>
            </Tabs>

            <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <AlertDialogContent className="rounded-2xl border-border/50 max-w-md">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete {deleteTarget?.type === "coupon" ? "coupon" : deleteTarget?.type === "bundle" ? "bundle" : "plan"}?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently remove <span className="font-semibold text-foreground">{deleteTarget?.name}</span>. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2 sm:gap-0">
                        <AlertDialogCancel className="rounded-xl font-bold">Cancel</AlertDialogCancel>
                        <AlertDialogAction variant="destructive" className="rounded-xl font-bold bg-destructive text-destructive-foreground" onClick={handleConfirmDelete}>
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

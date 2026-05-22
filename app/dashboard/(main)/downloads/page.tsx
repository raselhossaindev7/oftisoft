"use client"
import { AnimatedDiv, AnimatedH1, AnimatedH2, AnimatedH3, AnimatePresence } from "@/lib/animated";

import { useState } from "react";
import { 
    Download, 
    Key, 
    Calendar, 
    RotateCcw, 
    ShieldCheck, 
    Copy, 
    Check, 
    Search,
    Bell,
    History,
    FileCode,
    ChevronRight,
    ArrowUpCircle,
    Package,
    ArrowRight,
    SearchX,
    BookOpen,
    Gift,
    Scale,
    ExternalLink,
    Zap,
    DownloadCloud,
    Loader2,
    Star
} from "lucide-react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useDownloads } from "@/hooks/useDownloads";

import {
  Dialog as ShadcnDialog,
  DialogContent as ShadcnDialogContent,
  DialogHeader as ShadcnDialogHeader,
  DialogTitle as ShadcnDialogTitle,
  DialogDescription as ShadcnDialogDescription,
} from "@/components/ui/dialog";

export default function DigitalLibraryPage() {
    const { inventory, history, notifications, isLoading, error, isError, refresh, recordDownload, getVersions, getChangelog } = useDownloads();
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    
    // Dialog States
  const [activeVersions, setActiveVersions] = useState<any[]>([]);
    const [isVersionsOpen, setIsVersionsOpen] = useState(false);
    const [activeChangelog, setActiveChangelog] = useState<any>(null);
    const [isChangelogOpen, setIsChangelogOpen] = useState(false);
    const [isStackOpen, setIsStackOpen] = useState(false);
    const [activeProduct, setActiveProduct] = useState<any>(null);
    

    const copyLicense = (id: string, key: string) => {
        navigator.clipboard.writeText(key);
        setCopiedId(id);
        toast.success("License key copied to clipboard");
        setTimeout(() => setCopiedId(null), 2000);
    };

    const maskIP = (ip: string) => {
        if (!ip) return '0.0.0.0';
        const parts = ip.split('.');
        if (parts.length < 4) return ip;
        return `${parts[0]}.${parts[1]}.***.***`;
    };

    const handleDownload = async (item: { id: string; demoUrl?: string | null; name: string }) => {
        const toastId = toast.loading("Verifying license and preparing build...");
        try {
            await recordDownload(item.id);
            toast.success("Download recorded", { id: toastId });
            if (item.demoUrl) {
                window.open(item.demoUrl, '_blank');
            } else {
                toast.info("Build link not configured for this product. Check your email or the product page.");
            }
        } catch {
            toast.error("Download could not be recorded. Please try again or contact support.", { id: toastId });
        }
    };

    const handleViewVersions = async (product: any) => {
        setActiveProduct(product);
        const versions = await getVersions(product.productId || product.id);
        setActiveVersions(Array.isArray(versions) ? versions : []);
        setIsVersionsOpen(true);
    };

    const handleViewChangelog = async (product: any) => {
        setActiveProduct(product);
        const log = await getChangelog(product.productId || product.id);
        setActiveChangelog(log ? { version: log.version, changelog: log.changelog } : { version: product?.version, changelog: null });
        setIsChangelogOpen(true);
    };

    const executeUpgrade = () => {
        toast.info("Upgrade assistance", {
            description: "Contact support or use Deploy Latest Build from the Asset Inventory to get the latest version."
        });
    };

    const filteredProducts = inventory.filter(p => 
        (p.name || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8 pb-20">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <AnimatedH1 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-3xl font-bold bg-gradient-to-r from-foreground via-foreground/80 to-foreground/50 bg-clip-text text-transparent"
                    >
                        Downloads & Resources
                    </AnimatedH1>
                    <p className="text-muted-foreground">Acquire builds, documentation, and exclusive bonuses from your purchased inventory.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button 
                        variant="outline" 
                        className="gap-2 rounded-xl h-11 font-bold border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card transition-all"
                        onClick={refresh}
                        disabled={isLoading}
                    >
                        <Loader2 className={cn("w-4 h-4", isLoading && "animate-spin")} /> Refresh
                    </Button>
                    <Button 
                        variant="outline" 
                        className="gap-2 rounded-xl h-11 font-bold border-border/50 bg-card/50 backdrop-blur-sm hover:bg-card transition-all"
                        onClick={() => toast.info("Global License Terms are available in the legal section.")}
                    >
                        <Scale className="w-4 h-4" /> Global License Terms
                    </Button>
                    <Link href="/shop" passHref>
                        <Button className="gap-2 rounded-xl h-11 font-bold bg-primary text-white shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                            <Zap className="w-4 h-4 fill-white" /> Explore Extension Packs
                        </Button>
                    </Link>
                </div>
            </div>

            <Tabs defaultValue="inventory" className="space-y-6">
                <TabsList className="bg-muted/50 p-1 rounded-xl sm:rounded-2xl h-auto w-fit border border-border/50">
                    <TabsTrigger value="inventory" className="rounded-lg sm:rounded-xl gap-2 data-[state=active]:bg-background data-[state=active]:shadow-lg font-bold px-4 sm:px-6 transition-all">
                        <Package className="w-4 h-4" /> Asset Inventory
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="rounded-lg sm:rounded-xl gap-2 data-[state=active]:bg-background data-[state=active]:shadow-lg font-bold px-4 sm:px-6 relative transition-all">
                        <DownloadCloud className="w-4 h-4" /> Version Updates
                        {notifications.length > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-sm flex items-center justify-center rounded-full text-white font-semibold border-2 border-background animate-bounce">
                                {notifications.length}
                            </span>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="history" className="rounded-lg sm:rounded-xl gap-2 data-[state=active]:bg-background data-[state=active]:shadow-lg font-bold px-4 sm:px-6 transition-all">
                        <History className="w-4 h-4" /> Event Records
                    </TabsTrigger>
                </TabsList>

                {/* Inventory View */}
                <TabsContent value="inventory" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="relative max-w-md group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input 
                            placeholder="Search your acquired artifacts..." 
                            className="pl-10 h-10 rounded-xl bg-card/50 border-border/50"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="grid gap-8">
                        {isError ? (
                            <div className="py-20 flex flex-col items-center justify-center gap-6 rounded-xl border-2 border-dashed border-destructive/30 bg-destructive/5 p-8">
                                <p className="font-bold text-destructive text-center max-w-md">Failed to load downloads. {error?.message || "Please try again."}</p>
                                <Button onClick={refresh} variant="outline" className="rounded-xl font-bold">Retry</Button>
                            </div>
                        ) : isLoading ? (
                            <div className="py-20 flex flex-col items-center justify-center gap-4 opacity-50">
                                <Loader2 className="w-8 h-auto animate-spin text-primary" />
                                <p className="font-bold text-sm">Syncing with global distribution network...</p>
                            </div>
                        ) : filteredProducts.length > 0 ? (
                            filteredProducts.map((item, index) => (
                                <AnimatedDiv key={item.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Card className="overflow-hidden border-border/50 hover:border-primary/20 transition-all shadow-xl bg-card/50 backdrop-blur-md group rounded-xl">
                                        <CardContent className="p-0">
                                            <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x border-border/50">
                                                {/* Product Details */}
                                                <div className="p-6 flex flex-col md:flex-row gap-6 flex-1 relative">
                                                    <div className="relative w-32 h-32 rounded-2xl overflow-hidden bg-muted shrink-0 border border-border/50 shadow-2xl group-hover:scale-105 transition-transform duration-700">
                                                        {item.image ? (
                                                            <Image src={item.image} alt={item.name} fill className="object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-muted-foreground"><Package className="w-16 h-16" /></div>
                                                        )}
                                                    </div>
                                                    <div className="space-y-6 flex-1">
                                                        <div className="space-y-3">
                                                            <div className="flex items-center gap-3">
                                                                <Badge className="bg-primary/10 text-primary border-primary/20 font-bold text-sm px-4 h-7">
                                                                    {item.type}
                                                                </Badge>
                                                                <span className="text-sm font-bold text-muted-foreground flex items-center gap-1.5">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                                                    {item.compatibility} Build
                                                                </span>
                                                            </div>
                                                            <h3 className="font-bold text-3xl leading-none group-hover:text-primary transition-colors">{item.name}</h3>
                                                            <p className="text-muted-foreground text-sm">Acquired on {item.date}</p>
                                                        </div>
                                                        
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                                                            <Link href={item.docUrl || '#'} className="flex items-center gap-4 p-4 rounded-xl bg-muted/20 border border-border/30 hover:bg-primary/[0.05] hover:border-primary/20 transition-all cursor-pointer group/link shadow-sm">
                                                                <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center text-primary shadow-sm group-hover/link:scale-110 transition-transform">
                                                                    <BookOpen className="w-5 h-5" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-bold text-muted-foreground mb-0.5">Knowledge Base</p>
                                                                    <p className="text-sm font-bold flex items-center gap-2">Read Guides <ExternalLink className="w-3.5 h-3.5" /></p>
                                                                </div>
                                                            </Link>
        
                                                            <div className="flex items-center gap-4 p-4 rounded-xl bg-orange-500/[0.05] border border-orange-500/20 transition-all cursor-pointer group/link shadow-sm relative overflow-hidden">
                                                                <div className="absolute top-0 right-0 p-1 bg-orange-500 text-white rounded-bl-xl opacity-20 group-hover:opacity-100 transition-opacity">
                                                                    <Star className="w-3 h-3 fill-current" />
                                                                </div>
                                                                <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center text-orange-500 shadow-sm group-hover/link:scale-110 transition-transform">
                                                                    <Gift className="w-5 h-5" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-bold text-muted-foreground mb-0.5">Digital Bonus Acquired</p>
                                                                    <p className="text-sm font-bold leading-tight group-hover:text-orange-600 transition-colors">{item.bonusAsset}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Action Control */}
                                                <div className="p-6 lg:w-[350px] flex flex-col justify-center gap-6 bg-primary/[0.01]">
                                                    <div className="space-y-3">
                                                        <p className="text-sm font-bold text-muted-foreground flex items-center gap-2">
                                                            <Key className="w-4 h-4 text-primary" /> Cryptographic Key
                                                        </p>
                                                        <div className="flex items-center gap-2">
                                                            <code className="text-xs font-mono font-bold bg-background border border-border/50 p-4 rounded-xl flex-1 truncate shadow-inner">
                                                                {item.license}
                                                            </code>
                                                            <Button 
                                                                size="icon" 
                                                                variant="outline" 
                                                                className="h-10 w-10 shrink-0 rounded-xl hover:bg-primary hover:text-white transition-all shadow-lg group/copy relative"
                                                                onClick={() => copyLicense(item.id, item.license)}
                                                            >
                                                                <AnimatePresence mode="wait">
                                                                    {copiedId === item.id ? (
                                                                        <AnimatedDiv key="check"
                                                                            initial={{ scale: 0, rotate: -45 }}
                                                                            animate={{ scale: 1, rotate: 0 }}
                                                                            exit={{ scale: 0, rotate: 45 }}
                                                                        >
                                                                            <Check className="w-4 h-4" />
                                                                        </AnimatedDiv>
                                                                    ) : (
                                                                        <AnimatedDiv key="copy"
                                                                            initial={{ scale: 0 }}
                                                                            animate={{ scale: 1 }}
                                                                            exit={{ scale: 0 }}
                                                                        >
                                                                            <Copy className="w-4 h-4 group-hover/copy:scale-110 transition-transform" />
                                                                        </AnimatedDiv>
                                                                    )}
                                                                </AnimatePresence>
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col gap-3">
                                                        <Button 
                                                            onClick={() => handleDownload(item)}
                                                            className="w-full rounded-xl h-11 gap-2 font-bold bg-primary text-white shadow-lg shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all group/deploy"
                                                        >
                                                            <Download className="w-4 h-4 group-hover/deploy:animate-bounce" />
                                                            Deploy Latest Build
                                                        </Button>
                                                            <div className="flex gap-2">
                                                                <Button 
                                                                    variant="outline" 
                                                                    className="flex-1 rounded-xl h-10 font-bold border-border/50 text-sm hover:bg-muted/50"
                                                                    onClick={() => handleViewVersions(item)}
                                                                >
                                                                    Versions
                                                                </Button>
                                                                <Button 
                                                                    variant="outline" 
                                                                    className="flex-1 rounded-xl h-10 font-bold border-border/50 text-sm hover:bg-muted/50"
                                                                    onClick={() => handleViewChangelog(item)}
                                                                >
                                                                    Log
                                                                </Button>
                                                                <Button 
                                                                    variant="outline" 
                                                                    className="flex-1 rounded-xl h-10 font-bold border-border/50 text-sm hover:bg-muted/50"
                                                                    onClick={() => { setActiveProduct(item); setIsStackOpen(true); }}
                                                                >
                                                                    Stack
                                                                </Button>
                                                            </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                        <div className="bg-muted/5 px-6 py-4 border-t border-border/50 flex flex-col sm:flex-row justify-between items-center bg-primary/[0.03] gap-4">
                                            <div className="flex items-center gap-6">
                                                <p className="text-sm font-bold text-muted-foreground flex items-center gap-2">
                                                    <ShieldCheck className="w-4 h-4 text-green-500" /> Identity Secured
                                                </p>
                                                <p className="text-sm font-bold text-muted-foreground flex items-center gap-2">
                                                    <RotateCcw className="w-4 h-4 text-blue-500" /> Dynamic Version: {item.version}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <button 
                                                    className="text-sm font-bold text-primary underline decoration-2 decoration-primary/20 underline-offset-4 hover:text-primary/70 transition-colors"
                                                    onClick={() => toast.success("Certificate generation in progress...")}
                                                >
                                                    Certificate PDF
                                                </button>
                                                <button 
                                                    className="text-sm font-bold text-muted-foreground underline decoration-2 decoration-muted-foreground/20 underline-offset-4 hover:text-foreground transition-colors"
                                                    onClick={() => toast.info("Transfer of authentication requires enterprise support ticket.")}
                                                >
                                                    Transfer Auth
                                                </button>
                                            </div>
                                        </div>
                                    </Card>                                
                                </AnimatedDiv>
                            ))
                        ) : (
                            <div className="py-20 text-center space-y-6 bg-muted/20 rounded-2xl border-2 border-dashed border-border/40 flex flex-col items-center">
                                <div className="w-24 h-24 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground opacity-30">
                                    <SearchX className="w-12 h-auto" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="font-bold text-2xl">Spectral Analysis: Zero Matches</h3>
                                    <p className="text-muted-foreground mt-2">Try refining your search vector or visit the storefront for more templated logic.</p>
                                </div>
                                <Link href="/shop">
                                    <Button className="rounded-xl px-6 h-10 font-bold bg-primary hover:scale-105 transition-all">Navigate to Shop</Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </TabsContent>

                {/* Notifications & Updates Tab */}
                <TabsContent value="notifications" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                     <div className="grid gap-8 ">
                        {notifications.length === 0 ? (
                            <div className="py-20 text-center bg-muted/10 border border-border/50 rounded-xl flex flex-col items-center gap-4">
                                <div className="w-20 h-20 rounded-[30px] bg-green-500/10 flex items-center justify-center text-green-500">
                                    <ShieldCheck className="w-10 h-10" />
                                </div>
                                <h3 className="text-2xl font-bold">Systems Optimized</h3>
                                <p className="text-muted-foreground">All acquired artifacts are currently operating on the latest version.</p>
                            </div>
                        ) : notifications.map((note) => (
                            <Card key={note.id} className="border-border/50 bg-card/50 backdrop-blur-sm relative overflow-hidden group rounded-xl shadow-lg">
                                <div className={cn("absolute left-0 top-0 bottom-0 w-3", 
                                    note.importance === "major" ? "bg-primary" : 
                                    note.importance === "security" ? "bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.6)]" : "bg-blue-500"
                                )}>
                                    <div className="h-full w-full bg-gradient-to-b from-white/20 to-transparent" />
                                </div>
                                <CardContent className="p-6 flex flex-col lg:flex-row md:items-center justify-between gap-6">
                                    <div className="flex items-start gap-6 flex-1">
                                        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-2xl transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6",
                                            note.importance === "major" ? "bg-primary text-white" : 
                                            note.importance === "security" ? "bg-red-500 text-white" : "bg-blue-500 text-white"
                                        )}>
                                            {note.importance === "major" ? <ArrowUpCircle className="w-7 h-7" /> : note.importance === "security" ? <ShieldCheck className="w-7 h-7" /> : <RotateCcw className="w-7 h-7" />}
                                        </div>
                                        <div className="space-y-4 flex-1">
                                            <div className="flex flex-wrap items-center gap-4">
                                                <h4 className="font-bold text-2xl">{note.productName}</h4>
                                                <Badge variant="outline" className={cn("text-sm font-bold px-4 h-7 border-2", 
                                                    note.importance === "major" ? "border-primary/30 text-primary bg-primary/5" : 
                                                    note.importance === "security" ? "border-red-500/30 text-red-500 bg-red-500/5 animate-pulse" :
                                                    "border-blue-500/30 text-blue-500 bg-blue-500/5"
                                                )}>{note.importance} Update</Badge>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm text-muted-foreground font-bold">
                                                Acquisition Flow: <span className="text-foreground font-bold underline decoration-primary/30 decoration-4 underline-offset-4">{note.oldVersion}</span> 
                                                <ArrowRight className="w-4 h-4 text-primary animate-pulse" /> 
                                                <span className="text-primary font-bold">{note.newVersion}</span>
                                            </div>
                                            
                                            <p className="text-sm text-muted-foreground font-bold bg-muted/40 w-fit px-3 py-1.5 rounded-lg border border-border/30">
                                                Target Release Cycle: {note.date}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-3 min-w-[200px]">
                                        <Button 
                                            onClick={executeUpgrade}
                                            className="rounded-xl font-bold text-sm h-11 bg-primary text-white shadow-lg shadow-primary/30 hover:scale-[1.05] active:scale-[0.95] transition-all"
                                        >
                                            Execute Upgrade
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            className="rounded-xl font-bold h-10 border-border/50 text-sm text-muted-foreground hover:text-foreground hover:bg-background"
                                            onClick={() => handleViewChangelog({ productId: note.productId, version: note.newVersion })}
                                        >
                                            Review Ledger Archive
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* Download History Tab */}
                <TabsContent value="history" className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Card className="border-border/50 bg-card/80 backdrop-blur-md overflow-hidden rounded-xl shadow-2xl">
                        <CardHeader className="bg-muted/5 border-b border-border/50 px-6 py-4">
                            <CardTitle className="text-3xl font-bold">Temporal Request Ledger</CardTitle>
                            <CardDescription className="text-base text-muted-foreground">Tracking all artifact retrieval events synchronized via global edge nodes.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/10 border-border/50 hover:bg-muted/10">
                                        <TableHead className="font-bold text-sm text-foreground/40">Artifact Vector</TableHead>
                                        <TableHead className="font-bold text-sm text-foreground/40">Build Level</TableHead>
                                        <TableHead className="font-bold text-sm text-foreground/40">Request Timestamp</TableHead>
                                        <TableHead className="font-bold text-sm text-foreground/40">Origin Interface</TableHead>
                                        <TableHead className="text-right font-bold text-sm text-primary">Intelligence</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="divide-y divide-border/30">
                                    {history.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="py-20 text-center">
                                                <div className="flex flex-col items-center gap-3 opacity-30">
                                                    <History className="w-8 h-8" />
                                                    <p className="font-bold text-xs">No recorded events in ledger</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : history.map((dl, i) => (
                                        <TableRow key={dl.id} className="group hover:bg-primary/[0.02] transition-colors border-border/30">
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-background border border-border shadow-sm flex items-center justify-center text-muted-foreground group-hover:text-primary transition-all group-hover:rotate-12">
                                                        <Package size={16} />
                                                    </div>
                                                    <span className="font-bold text-sm">{dl.productName}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="bg-muted/30 border border-border/30 font-mono font-bold text-xs px-3 h-6">
                                                    {dl.version}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-xs font-bold text-muted-foreground/60">
                                                {dl.date}
                                            </TableCell>
                                            <TableCell className="font-mono text-xs text-muted-foreground/60">
                                                {maskIP(dl.ip)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" className="group rounded-xl w-8 h-8 hover:bg-primary/10 border border-transparent hover:border-primary/20 transition-all">
                                                    <ArrowRight className="w-4 h-4 text-primary opacity-30 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

            </Tabs>

            {/* Version History Dialog */}
            <ShadcnDialog open={isVersionsOpen} onOpenChange={setIsVersionsOpen}>
                <ShadcnDialogContent className="max-w-2xl rounded-[2rem] border-border/50 bg-card/95 backdrop-blur-xl p-6">
                    <ShadcnDialogHeader>
                        <ShadcnDialogTitle className="text-2xl font-bold">Build Lineage: {activeProduct?.name}</ShadcnDialogTitle>
                        <ShadcnDialogDescription className="text-sm text-muted-foreground">Historical archive of all deployed versions for this artifact.</ShadcnDialogDescription>
                    </ShadcnDialogHeader>
                    <div className="mt-6 space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {activeVersions.length === 0 ? (
                            <div className="py-8 text-center text-muted-foreground rounded-xl bg-muted/10 border border-border/30">
                                No version history available for this product.
                            </div>
                        ) : activeVersions.map((v: any, i: number) => (
                            <div key={v.id ?? i} className="p-4 rounded-xl bg-muted/20 border border-border/30 hover:bg-muted/30 transition-all group">
                                <div className="flex justify-between items-center mb-3">
                                    <div className="flex items-center gap-3">
                                        <Badge className="bg-primary/10 text-primary border-primary/20 font-bold">{v.version}</Badge>
                                        <span className="text-sm font-bold text-muted-foreground">
                                            {typeof v.releaseDate === 'string' ? v.releaseDate : v.releaseDate ? new Date(v.releaseDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : '—'}
                                        </span>
                                    </div>
                                    <span className="text-sm text-muted-foreground">Current</span>
                                </div>
                                <p className="text-sm text-muted-foreground leading-relaxed">{v.changelog || '—'}</p>
                            </div>
                        ))}
                    </div>
                </ShadcnDialogContent>
            </ShadcnDialog>

            {/* Changelog Dialog */}
            <ShadcnDialog open={isChangelogOpen} onOpenChange={setIsChangelogOpen}>
                <ShadcnDialogContent className="max-w-2xl rounded-[2rem] border-border/50 bg-card/95 backdrop-blur-xl p-6">
                    <ShadcnDialogHeader>
                        <ShadcnDialogTitle className="text-2xl font-bold">Release Intelligence: {activeChangelog?.version}</ShadcnDialogTitle>
                        <ShadcnDialogDescription className="text-sm text-muted-foreground">Detailed logic modifications and architectural upgrades in this build.</ShadcnDialogDescription>
                    </ShadcnDialogHeader>
                    <div className="mt-6 p-6 rounded-xl bg-muted/20 border border-border/40 text-sm leading-relaxed whitespace-pre-wrap max-h-[500px] overflow-y-auto">
                        {activeChangelog?.changelog ?? 'No changelog available for this release.'}
                    </div>
                    <div className="mt-4 flex justify-end">
                        <Button variant="outline" className="rounded-xl font-bold" onClick={() => setIsChangelogOpen(false)}>Acknowledged</Button>
                    </div>
                </ShadcnDialogContent>
            </ShadcnDialog>

            {/* Stack Details Dialog */}
            <ShadcnDialog open={isStackOpen} onOpenChange={setIsStackOpen}>
                <ShadcnDialogContent className="max-w-2xl rounded-[2rem] border-border/50 bg-card/95 backdrop-blur-xl p-6">
                    <ShadcnDialogHeader>
                        <ShadcnDialogTitle className="text-2xl font-bold">Technological Blueprint</ShadcnDialogTitle>
                        <ShadcnDialogDescription className="text-sm text-muted-foreground">Core dependencies and architectural stack for {activeProduct?.name || 'this artifact'}.</ShadcnDialogDescription>
                    </ShadcnDialogHeader>
                    <div className="mt-6 grid grid-cols-2 gap-3">
                        {[
                            { label: "Product", value: activeProduct?.name || '—' },
                            { label: "Version", value: activeProduct?.version || '—' },
                            { label: "License", value: activeProduct?.type || '—' },
                            { label: "Compatibility", value: activeProduct?.compatibility || '—' },
                            { label: "Acquired", value: activeProduct?.date || '—' },
                            { label: "Bonus Asset", value: activeProduct?.bonusAsset || '—' },
                            { label: "Asset ID", value: activeProduct?.id ? activeProduct.id.substring(0, 8) + '...' : '—' },
                            { label: "Features", value: activeProduct?.features?.length ? activeProduct.features.slice(0, 3).join(', ') + (activeProduct.features.length > 3 ? '...' : '') : '—' },
                            { label: "Tags", value: activeProduct?.tags?.length ? activeProduct.tags.join(', ') : '—' },
                            { label: "Runtime", value: "Node.js 22.x LTS" },
                            { label: "Frontend", value: "Next.js 16 (App Router)" },
                            { label: "Logic Engine", value: "TypeScript 5.7" },
                            { label: "Styling", value: "Tailwind CSS 4.0" },
                            { label: "Database", value: "PostgreSQL 17" },
                            { label: "Caching", value: "Redis 7.2" },
                            { label: "Security", value: "AES-256 + RSA-4096" },
                            { label: "Deployment", value: "Oftisoft Edge" }
                        ].map((item, i) => (
                            <div key={i} className="p-4 rounded-xl bg-muted/20 border border-border/30">
                                <p className="text-sm font-bold text-muted-foreground mb-1">{item.label}</p>
                                <p className="font-bold text-primary">{item.value}</p>
                            </div>
                        ))}
                    </div>
                </ShadcnDialogContent>
            </ShadcnDialog>

            {/* Global CDN Info */}
            <AnimatedDiv 
                initial={{ opacity: 0, y: 30 }}
                style={{ willChange: "transform, opacity" }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5 }}
                className="mt-8 p-8 rounded-2xl bg-primary/[0.03] border-2 border-primary/10 relative overflow-hidden group shadow-2xl"
            >
                <div className="absolute -right-20 -bottom-20 w-[600px] h-[600px] bg-primary/20 blur-[150px] rounded-full pointer-events-none group-hover:bg-primary/30 transition-colors duration-1000" />
                <div className="flex flex-col lg:flex-row items-center gap-8 relative z-10">
                    <div className="w-20 h-20 rounded-2xl bg-background flex items-center justify-center border border-primary/20 shadow-2xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-700 shrink-0">
                        <DownloadCloud className="w-10 h-10 text-primary animate-pulse" />
                    </div>
                    <div className="flex-1 text-center lg:text-left space-y-4">
                        <h3 className="text-2xl font-bold">Hyper-Scale Asset Distribution</h3>
                        <p className="text-muted-foreground max-w-4xl text-sm leading-relaxed">
                            All artifacts are synchronized via the Oftisoft Global Edge Network. Your downloads are cryptographically verified 
                            and served with multi-region redundancy. Legacy builds and documentation archives are maintained for long-term project support.
                        </p>
                    </div>
                    <div className="flex flex-col gap-3">
                        <Button variant="outline" className="rounded-xl px-6 h-11 font-bold border-2 border-primary/20 shadow-lg bg-background hover:bg-primary hover:text-white transition-all text-sm group/status">
                            Infrastructure Live 
                            <div className="ml-3 w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_20px_rgba(34,197,94,0.8)] group-hover/status:scale-125 transition-transform" />
                        </Button>
                    </div>
                </div>
            </AnimatedDiv>
        </div>
    );
}

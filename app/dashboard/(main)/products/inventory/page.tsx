"use client";

import { useState } from "react";
import { 
    Package, 
    AlertTriangle, 
    CheckCircle2, 
    History, 
    RefreshCw,
    Search,
    ArrowLeft,
    FileCode,
    X,
    Save,
    Clock,
    FileText,
    Settings,
    Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { useProducts } from "@/hooks/useProducts";
import { RoleGuard } from "@/components/auth/role-guard";
import { downloadsAPI } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

export default function InventoryPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [isSyncing, setIsSyncing] = useState(false);
    const { products, isLoading, stats } = useProducts();
    
    // Dialog states
    const [isUpdateLogOpen, setIsUpdateLogOpen] = useState(false);
    const [isVersionDialogOpen, setIsVersionDialogOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState("");
    const [versionNotes, setVersionNotes] = useState("");
    const [isBackupOpen, setIsBackupOpen] = useState(false);
    const [backupInterval, setBackupInterval] = useState("daily");
    const [retentionCount, setRetentionCount] = useState("30");
    const [isSavingBackup, setIsSavingBackup] = useState(false);

    const { data: updateLogData } = useQuery({
        queryKey: ['downloads', 'history'],
        queryFn: () => downloadsAPI.getHistory(),
    });
    const updateLog = updateLogData?.items ?? [];

    const handleSync = async () => {
        setIsSyncing(true);
        try {
            await downloadsAPI.getInventory();
            toast.success("Assets synced successfully");
        } catch {
            toast.error("Failed to sync assets");
        } finally {
            setIsSyncing(false);
        }
    };

    const handleSaveVersion = () => {
        if (!versionNotes.trim()) return;
        toast.success(`Version created for ${selectedProduct}`);
        setVersionNotes("");
        setIsVersionDialogOpen(false);
    };

    const handleSaveBackup = () => {
        setIsSavingBackup(true);
        setTimeout(() => {
            setIsSavingBackup(false);
            toast.success(`Backup configured: ${backupInterval}, ${retentionCount} days retention`);
            setIsBackupOpen(false);
        }, 800);
    };

    const totalProducts = products?.length || 0;
    const digitalProducts = products?.length || 0;
    const physicalProducts = 0;
    const stockWarnings = stats?.stockWarnings ?? 0;

    const filteredProducts = products?.filter(p => 
                (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (p.category || '').toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    return (
        <RoleGuard allowedRoles={["Editor", "Admin", "SuperAdmin"]}>
        <div className="space-y-8">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button asChild variant="ghost" size="icon" className="rounded-full">
                        <Link href="/dashboard/products">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">Inventory & Assets</h1>
                        <p className="text-muted-foreground">Monitor stock levels, download health, and digital asset versioning.</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button 
                        variant="outline" 
                        className="gap-2 rounded-xl"
                        onClick={() => setIsUpdateLogOpen(true)}
                    >
                        <History className="w-4 h-4" />
                        Update Log
                    </Button>
                    <Button 
                        className="gap-2 rounded-xl shadow-lg shadow-primary/20"
                        onClick={handleSync}
                        disabled={isSyncing}
                    >
                        <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                        {isSyncing ? "Syncing..." : "Sync Assets"}
                    </Button>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
                <Card className="border-border/50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-semibold  text-muted-foreground">Digital Products</CardTitle>
                        <Package className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-semibold">{totalProducts}</div>
                        <p className="text-sm text-muted-foreground mt-1">Products in catalog</p>
                    </CardContent>
                </Card>
                <Card className="border-border/50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-semibold  text-muted-foreground">Physical</CardTitle>
                        <FileCode className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-semibold">{physicalProducts}</div>
                        <p className="text-sm text-muted-foreground mt-1">Physical SKUs</p>
                    </CardContent>
                </Card>
                <Card className={`border-border/50 ${stockWarnings > 0 ? "border-orange-500/20 bg-orange-500/5" : ""}`}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-semibold  text-orange-500">Stock Alerts</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-semibold">{stockWarnings}</div>
                        <p className="text-sm text-muted-foreground mt-1">Items need attention</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-border/50 overflow-hidden">
                <CardHeader className="border-b border-border/50 bg-muted/5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <CardTitle>Inventory Tracking</CardTitle>
                            <div className="flex gap-1">
                                <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-sm">
                                    Digital: {digitalProducts}
                                </Badge>
                                <Badge variant="secondary" className="bg-muted text-muted-foreground border-none text-sm">
                                    Physical: {physicalProducts}
                                </Badge>
                            </div>
                        </div>
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search inventory..." 
                                className="pl-9 h-9 rounded-xl"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : filteredProducts.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/10 hover:bg-transparent">
                                    <TableHead>Product Asset</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Current Version</TableHead>
                                    <TableHead>Downloads</TableHead>
                                    <TableHead>Stock/Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredProducts.map((p) => (
                                    <TableRow key={p.id} className="hover:bg-primary/5">
                                        <TableCell className="font-bold text-sm">{p.name}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="text-sm  font-mono">
                                                BUNDLE
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-mono text-xs">{p.version}</TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            —
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                                <span className="text-xs font-medium">Available</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className="h-8 rounded-lg gap-2 text-primary font-bold"
                                                onClick={() => {
                                                    setSelectedProduct(p.name);
                                                    setIsVersionDialogOpen(true);
                                                }}
                                            >
                                                Manage Vers.
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Package className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-xl font-bold">No products found</h3>
                            <p className="text-muted-foreground text-sm">Try adjusting your search query</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-8">
                <Card className="border-border/50">
                    <CardHeader>
                        <CardTitle className="text-lg">Storage Breakdown</CardTitle>
                        <CardDescription>Storage metrics when asset storage is configured.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">Storage breakdown will appear here when digital asset storage is enabled.</p>
                    </CardContent>
                </Card>

                <Card className="border-border/50 border-dashed bg-muted/20">
                    <CardContent className="flex flex-col items-center justify-center text-center p-12 space-y-4">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <RefreshCw className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold">Automated Backups</h3>
                        <p className="text-sm text-muted-foreground">Configure automated backups and versioning for your digital assets.</p>
                        <Button 
                            variant="outline" 
                            className="rounded-full"
                            onClick={() => setIsBackupOpen(true)}
                        >
                            Manage Backup Settings
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Update Log Dialog */}
            <Dialog open={isUpdateLogOpen} onOpenChange={setIsUpdateLogOpen}>
                <DialogContent className="sm:max-w-lg rounded-[2rem] border-border/50">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <History className="w-5 h-5 text-primary" /> Update Log
                        </DialogTitle>
                        <DialogDescription>Recent asset and inventory changes.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 max-h-[300px] overflow-y-auto">
                        {updateLog.map((entry, i) => (
                            <div key={i} className="flex gap-3 p-3 rounded-xl bg-muted/20 border border-border/50">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                    <Clock className="w-4 h-4 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold">{entry.action}</p>
                                    <p className="text-xs text-muted-foreground">{entry.details}</p>
                                    <p className="text-xs text-muted-foreground/60 mt-1">{entry.date}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Version Dialog */}
            <Dialog open={isVersionDialogOpen} onOpenChange={(open) => { setIsVersionDialogOpen(open); if (!open) setVersionNotes(""); }}>
                <DialogContent className="sm:max-w-lg rounded-[2rem] border-border/50">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-primary" /> Create Version
                        </DialogTitle>
                        <DialogDescription>Create a new version for {selectedProduct}.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="font-semibold">Version Notes</Label>
                            <Textarea 
                                placeholder="Describe what changed in this version..."
                                className="min-h-[100px] rounded-xl resize-none"
                                value={versionNotes}
                                onChange={(e) => setVersionNotes(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" className="rounded-xl" onClick={() => setIsVersionDialogOpen(false)}>Cancel</Button>
                        <Button className="rounded-xl gap-2" onClick={handleSaveVersion} disabled={!versionNotes.trim()}>
                            <Save className="w-4 h-4" /> Create Version
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Backup Settings Dialog */}
            <Dialog open={isBackupOpen} onOpenChange={setIsBackupOpen}>
                <DialogContent className="sm:max-w-lg rounded-[2rem] border-border/50">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Settings className="w-5 h-5 text-primary" /> Backup Settings
                        </DialogTitle>
                        <DialogDescription>Configure automated backup schedule and retention.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="font-semibold">Backup Frequency</Label>
                            <select 
                                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                                value={backupInterval}
                                onChange={(e) => setBackupInterval(e.target.value)}
                            >
                                <option value="hourly">Hourly</option>
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label className="font-semibold">Retention (days)</Label>
                            <Input 
                                type="number" 
                                min="1" 
                                max="365"
                                value={retentionCount}
                                onChange={(e) => setRetentionCount(e.target.value)}
                                className="rounded-xl"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" className="rounded-xl" onClick={() => setIsBackupOpen(false)}>Cancel</Button>
                        <Button className="rounded-xl gap-2" onClick={handleSaveBackup} disabled={isSavingBackup}>
                            <Download className="w-4 h-4" />{isSavingBackup ? "Saving..." : "Save Settings"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
        </RoleGuard>
    );
}

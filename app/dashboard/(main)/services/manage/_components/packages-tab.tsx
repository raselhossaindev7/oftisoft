"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useServicesContentStore, type ServicePackage } from "@/lib/store/services-content";
import { toast } from "sonner";

const gradientOptions = [
  { label: "Blue/Cyan", value: "from-blue-500/20 to-cyan-500/20" },
  { label: "Purple/Pink", value: "from-purple-500/20 to-pink-500/20" },
  { label: "Orange/Red", value: "from-orange-500/20 to-red-500/20" },
  { label: "Green/Teal", value: "from-green-500/20 to-teal-500/20" },
  { label: "Indigo/Purple", value: "from-indigo-500/20 to-purple-500/20" },
  { label: "Pink/Rose", value: "from-pink-500/20 to-rose-500/20" },
];

const iconOptions = ["Rocket", "Globe", "Smartphone", "Server", "Cloud", "Database", "Shield", "Zap", "Cpu", "Layout"];

export default function PackagesTab() {
  const { content, addPackage, updatePackage, deletePackage } = useServicesContentStore();
  const packages = content?.packages ?? [];

  const [editPkg, setEditPkg] = useState<ServicePackage | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold">Service Packages</h3>
          <p className="text-sm text-muted-foreground">Bundled packages like Web App Starter, Mobile App Starter, etc.</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="gap-2 rounded-xl">
          <Plus className="w-4 h-4" /> Add Package
        </Button>
      </div>

      <Card className="border-border/50">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/5">
                <TableHead>Name</TableHead>
                <TableHead>One-time</TableHead>
                <TableHead>Monthly</TableHead>
                <TableHead>Features</TableHead>
                <TableHead>Popular</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {packages.map((pkg) => (
                <TableRow key={pkg.id} className="group hover:bg-primary/5 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                        {pkg.iconName?.charAt(0) || "P"}
                      </div>
                      <span className="font-bold">{pkg.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono font-bold text-primary">
                    {typeof pkg.price === "number" ? `$${pkg.price.toLocaleString()}` : pkg.price || "—"}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {typeof pkg.monthlyPrice === "number" ? `$${pkg.monthlyPrice.toLocaleString()}/mo` : (pkg.monthlyPrice || "—")}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {pkg.features.slice(0, 2).map((f, i) => (
                        <Badge key={i} variant="outline" className="text-xs">{f}</Badge>
                      ))}
                      {pkg.features.length > 2 && (
                        <Badge variant="outline" className="text-xs">+{pkg.features.length - 2}</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {pkg.highlight ? <Badge className="bg-primary/10 text-primary border-primary/20">Popular</Badge> : <span className="text-muted-foreground text-sm">—</span>}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setEditPkg(pkg)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:bg-red-500/10"
                        onClick={() => setDeleteId(pkg.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {packages.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="text-muted-foreground">No packages yet</div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <PackageDialog
        key={editPkg?.id || 'new'}
        open={showAdd || !!editPkg}
        onOpenChange={(o) => { if (!o) { setShowAdd(false); setEditPkg(null); } }}
        initial={editPkg ?? { id: "", name: "", price: 0, monthlyPrice: 0, description: "", features: [], highlight: false, iconName: "Rocket", gradient: gradientOptions[0].value }}
        onSave={(data) => {
          if (editPkg) {
            updatePackage(editPkg.id, data);
            toast.success("Package updated");
          } else {
            addPackage({ ...data, id: `pkg-${Date.now()}` } as ServicePackage);
            toast.success("Package added");
          }
          setShowAdd(false);
          setEditPkg(null);
        }}
        onCancel={() => { setShowAdd(false); setEditPkg(null); }}
      />

      <Dialog open={!!deleteId} onOpenChange={(o) => { if (!o) setDeleteId(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Package</DialogTitle>
            <DialogDescription>Are you sure? This cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => { if (deleteId) { deletePackage(deleteId); toast.success("Package deleted"); setDeleteId(null); } }}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PackageDialog({ open, onOpenChange, initial, onSave, onCancel }: {
  open: boolean; onOpenChange: (o: boolean) => void;
  initial: any; onSave: (d: any) => void; onCancel: () => void;
}) {
  const [form, setForm] = useState(initial);
  const update = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));
  const [featuresText, setFeaturesText] = useState((initial.features || []).join("\n"));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0">
        <Tabs defaultValue="details" className="flex flex-col h-full">
          <div className="px-6 pt-6 pb-0">
            <DialogHeader className="pb-2">
              <DialogTitle className="text-xl">{initial.id ? "Edit Package" : "New Package"}</DialogTitle>
            </DialogHeader>
            <TabsList className="bg-muted/50 p-1 rounded-2xl h-auto w-fit border border-border">
              <TabsTrigger value="details" className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-md font-bold px-4 py-1.5 text-xs">Details</TabsTrigger>
              <TabsTrigger value="preview" className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-md font-bold px-4 py-1.5 text-xs">Preview</TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="flex-1 px-6 py-4 max-h-[60vh]">
            <TabsContent value="details" className="space-y-4 mt-0">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-bold">Name</Label>
                  <Input className="mt-1" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Web App Starter" />
                </div>
                <div>
                  <Label className="text-sm font-bold">Icon</Label>
                  <Select value={form.iconName} onValueChange={(v) => update("iconName", v)}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {iconOptions.map((ic) => <SelectItem key={ic} value={ic}>{ic}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className="text-sm font-bold">Description</Label>
                <Input className="mt-1" value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Complete web development package..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-bold">One-time Price ($)</Label>
                  <Input className="mt-1" type="number" min={0} value={form.price}
                    onChange={(e) => update("price", parseInt(e.target.value) || 0)} />
                </div>
                <div>
                  <Label className="text-sm font-bold">Monthly Price ($)</Label>
                  <Input className="mt-1" type="number" min={0} value={form.monthlyPrice}
                    onChange={(e) => update("monthlyPrice", parseInt(e.target.value) || 0)} />
                </div>
              </div>
              <div>
                <Label className="text-sm font-bold">Gradient</Label>
                <Select value={form.gradient} onValueChange={(v) => update("gradient", v)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {gradientOptions.map((g) => (
                      <SelectItem key={g.value} value={g.value}>
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded bg-gradient-to-br ${g.value}`} />
                          {g.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-bold">Features (one per line)</Label>
                <textarea
                  className="w-full min-h-[100px] rounded-xl border border-border bg-background px-3 py-2 text-sm mt-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={featuresText}
                  onChange={(e) => {
                    setFeaturesText(e.target.value);
                    update("features", e.target.value.split("\n").map((s: string) => s.trim()).filter(Boolean));
                  }}
                  placeholder="Responsive Design&#10;SEO Optimization&#10;5 Pages Included&#10;Contact Form"
                />
                {form.features?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {form.features.map((f: string, i: number) => <Badge key={i} variant="secondary" className="text-xs">{f}</Badge>)}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 p-3 rounded-xl border border-border/50 bg-muted/20">
                <Switch checked={form.highlight} onCheckedChange={(v) => update("highlight", v)} />
                <div>
                  <Label className="text-sm font-medium">Mark as Popular</Label>
                  <p className="text-xs text-muted-foreground">Highlights this package with a "Popular" badge</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="mt-0">
              <PackagePreview pkg={form} />
            </TabsContent>
          </ScrollArea>

          <div className="px-6 py-4 border-t border-border/50 flex justify-end gap-2">
            <Button variant="outline" onClick={onCancel} className="rounded-xl">Cancel</Button>
            <Button onClick={() => onSave(form)} className="rounded-xl gap-2">
              {initial.id ? "Update Package" : "Create Package"}
            </Button>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function PackagePreview({ pkg }: { pkg: any }) {
  return (
    <Card className={`border-border/50 overflow-hidden ${pkg.highlight ? "ring-2 ring-primary/30" : ""}`}>
      {pkg.highlight && (
        <div className="bg-primary/10 text-primary text-center text-xs font-bold py-1.5">POPULAR CHOICE</div>
      )}
      <CardContent className="p-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-3">
          <span className="text-xl font-bold text-primary">{pkg.iconName?.charAt(0) || "P"}</span>
        </div>
        <h3 className="text-lg font-bold">{pkg.name || "Untitled Package"}</h3>
        <p className="text-sm text-muted-foreground mt-1 mb-3">{pkg.description || "No description"}</p>
        {typeof pkg.price === "number" && pkg.price > 0 && (
          <div className="text-3xl font-bold text-primary mb-1">${pkg.price.toLocaleString()}</div>
        )}
        {typeof pkg.monthlyPrice === "number" && pkg.monthlyPrice > 0 && (
          <div className="text-sm text-muted-foreground mb-4">
            or <span className="font-bold">${pkg.monthlyPrice.toLocaleString()}/mo</span>
          </div>
        )}
        <Separator className="my-3" />
        {pkg.features?.length > 0 ? (
          <ul className="space-y-2 text-sm text-left">
            {pkg.features.map((f: string, i: number) => (
              <li key={i} className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-green-500/20 text-green-600 flex items-center justify-center text-[10px] font-bold shrink-0">✓</span>
                {f}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No features listed</p>
        )}
      </CardContent>
    </Card>
  );
}

"use client";

import { useState } from "react";
import {
  Plus, Trash2, Edit, Check, X, Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useServicesContentStore } from "@/lib/store/services-content";
import { toast } from "sonner";

const iconOptions = ["Zap", "Crown", "Sparkles", "Rocket", "Star", "Award", "Gem", "Diamond", "Flame", "Lightbulb"];

export default function ComparisonTab() {
  const { content, addComparisonTier, updateComparisonTier, deleteComparisonTier, addComparisonFeature, updateComparisonFeature, deleteComparisonFeature } = useServicesContentStore();
  const comparison = content?.comparison;
  const tiers = comparison?.tiers ?? [];
  const features = comparison?.features ?? [];

  const [editTier, setEditTier] = useState<any>(null);
  const [editFeature, setEditFeature] = useState<{ index: number; data: any } | null>(null);
  const [deleteTierId, setDeleteTierId] = useState<string | null>(null);
  const [deleteFeatureIdx, setDeleteFeatureIdx] = useState<number | null>(null);
  const [newTier, setNewTier] = useState(false);
  const [newFeature, setNewFeature] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const defaultFeature = { name: "", tooltip: "" };
  const defaultTier = () => ({
    id: "", name: "", price: "", description: "", iconName: "Zap", color: "purple",
    highlight: false, features: features.map(() => false),
  });

  return (
    <div className="space-y-6">
      <Tabs defaultValue="tiers">
        <div className="flex items-center justify-between mb-4">
          <TabsList className="bg-muted/50 p-1 rounded-2xl h-auto w-fit border border-border">
            <TabsTrigger value="tiers" className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-md font-bold px-5 py-2">Pricing Tiers</TabsTrigger>
            <TabsTrigger value="features" className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-md font-bold px-5 py-2">Features</TabsTrigger>
          </TabsList>
          <Button variant="outline" size="sm" onClick={() => setShowPreview(!showPreview)} className="gap-2 rounded-xl">
            <Eye className="w-4 h-4" /> {showPreview ? "Hide Preview" : "Preview Table"}
          </Button>
        </div>

        {showPreview && tiers.length > 0 && (
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent mb-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Eye className="w-4 h-4 text-primary" /> Live Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left p-2 text-muted-foreground font-medium">Features</th>
                    {tiers.map((tier) => (
                      <th key={tier.id} className={`p-2 text-center ${tier.highlight ? "bg-primary/5 rounded-t-xl" : ""}`}>
                        <div className="font-bold">{tier.name}</div>
                        <div className="text-primary font-bold text-lg">{tier.price}</div>
                        <div className="text-xs text-muted-foreground">{tier.description}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {features.map((f, i) => (
                    <tr key={i} className="border-t border-border/50">
                      <td className="p-2 text-muted-foreground">{f.name}</td>
                      {tiers.map((tier) => (
                        <td key={tier.id} className="p-2 text-center">
                          {tier.features[i] === true ? (
                            <span className="text-green-500 font-bold">✓</span>
                          ) : typeof tier.features[i] === "string" ? (
                            <span className="text-xs">{tier.features[i]}</span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}

        <TabsContent value="tiers" className="space-y-4 mt-0">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold">Compare Plans — Tiers</h3>
              <p className="text-sm text-muted-foreground">Starter, Growth, Enterprise pricing tiers</p>
            </div>
            <Button onClick={() => setNewTier(true)} className="gap-2 rounded-xl">
              <Plus className="w-4 h-4" /> Add Tier
            </Button>
          </div>

          <div className="grid gap-3">
            {tiers.map((tier) => (
              <Card key={tier.id} className={`border-border/50 group hover:border-primary/30 transition-colors ${tier.highlight ? "ring-1 ring-primary/20 bg-primary/[0.02]" : ""}`}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-1 h-10 rounded-full shrink-0" style={{ backgroundColor: tier.color === "purple" ? "#a855f7" : tier.color === "blue" ? "#3b82f6" : tier.color === "orange" ? "#f97316" : tier.color === "green" ? "#22c55e" : tier.color === "red" ? "#ef4444" : "#a855f7" }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{tier.name}</span>
                      {tier.highlight && <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">Popular</Badge>}
                    </div>
                    <div className="text-xs text-muted-foreground">{tier.price} — {tier.description}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{tier.features.filter(Boolean).length}/{tier.features.length} features enabled</div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setEditTier(tier)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:bg-red-500/10"
                      onClick={() => setDeleteTierId(tier.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {tiers.length === 0 && (
              <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-border rounded-xl">
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-3">
                  <Plus className="w-6 h-6 text-muted-foreground" />
                </div>
                <h4 className="font-bold mb-1">No Tiers</h4>
                <p className="text-sm text-muted-foreground mb-3">Add pricing tiers for your comparison table</p>
                <Button onClick={() => setNewTier(true)} variant="outline" size="sm" className="gap-1 rounded-xl">
                  <Plus className="w-3 h-3" /> Add First Tier
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="features" className="space-y-4 mt-0">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold">Compare Plans — Features</h3>
              <p className="text-sm text-muted-foreground">Features shown as rows in the comparison table</p>
            </div>
            <Button onClick={() => setNewFeature(true)} className="gap-2 rounded-xl">
              <Plus className="w-4 h-4" /> Add Feature
            </Button>
          </div>

          <Card className="border-border/50">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/5">
                    <TableHead className="w-[40px]">#</TableHead>
                    <TableHead>Feature Name</TableHead>
                    <TableHead>Tooltip</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {features.map((f, i) => (
                    <TableRow key={i} className="group hover:bg-primary/5 transition-colors">
                      <TableCell className="text-muted-foreground text-sm">{i + 1}</TableCell>
                      <TableCell className="font-medium">{f.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-md truncate">{f.tooltip || "—"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0"
                            onClick={() => setEditFeature({ index: i, data: f })}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:bg-red-500/10"
                            onClick={() => setDeleteFeatureIdx(i)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {features.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        <div className="text-muted-foreground">No features yet</div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {features.length > 0 && tiers.length > 0 && (
            <Card className="border-border/50 bg-muted/20">
              <CardContent className="p-4">
                <h4 className="text-sm font-bold mb-3">Quick Toggle — Per-Tier Feature Flags</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr>
                        <th className="text-left p-1.5 text-muted-foreground font-medium">Feature</th>
                        {tiers.map((tier) => (
                          <th key={tier.id} className="p-1.5 text-center font-bold">{tier.name}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {features.map((f, fi) => (
                        <tr key={fi} className="border-t border-border/30">
                          <td className="p-1.5 text-muted-foreground">{f.name}</td>
                          {tiers.map((tier, ti) => {
                            const val = tier.features[fi];
                            return (
                              <td key={ti} className="p-1.5 text-center">
                                <button
                                  onClick={() => {
                                    const newFeatures = [...tier.features];
                                    newFeatures[fi] = val === true ? false : true;
                                    updateComparisonTier(tier.id, { features: newFeatures });
                                  }}
                                  className={`w-6 h-6 rounded-md transition-all ${
                                    val === true
                                      ? "bg-green-500/20 text-green-600 border border-green-500/30"
                                      : val && typeof val === "string"
                                      ? "bg-blue-500/20 text-blue-600 border border-blue-500/30 text-[10px] font-bold"
                                      : "bg-muted/50 text-muted-foreground border border-border/50"
                                  }`}
                                >
                                  {val === true ? "✓" : typeof val === "string" ? val.substring(0, 2) : "—"}
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={newTier || !!editTier} onOpenChange={(o) => { if (!o) { setNewTier(false); setEditTier(null); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editTier ? "Edit Tier" : "New Tier"}</DialogTitle>
          </DialogHeader>
          <TierForm
            key={editTier?.id || 'new-tier'}
            initial={editTier ?? defaultTier()}
            onSave={(data) => {
              if (editTier) {
                updateComparisonTier(editTier.id, data);
                toast.success("Tier updated");
                setEditTier(null);
              } else {
                addComparisonTier({ ...data, id: `tier-${Date.now()}`, features: features.map(() => false) });
                toast.success("Tier added");
                setNewTier(false);
              }
            }}
            onCancel={() => { setNewTier(false); setEditTier(null); }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={newFeature || !!editFeature} onOpenChange={(o) => { if (!o) { setNewFeature(false); setEditFeature(null); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editFeature ? "Edit Feature" : "New Feature"}</DialogTitle>
          </DialogHeader>
          <FeatureForm
            key={editFeature?.index ?? 'new-feature'}
            initial={editFeature?.data ?? defaultFeature}
            onSave={(data) => {
              if (editFeature) {
                updateComparisonFeature(editFeature.index, data);
                toast.success("Feature updated");
                setEditFeature(null);
              } else {
                addComparisonFeature(data);
                toast.success("Feature added");
                setNewFeature(false);
              }
            }}
            onCancel={() => { setNewFeature(false); setEditFeature(null); }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTierId} onOpenChange={(o) => { if (!o) setDeleteTierId(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Tier</DialogTitle>
            <DialogDescription>Are you sure? This cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTierId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => { if (deleteTierId) { deleteComparisonTier(deleteTierId); toast.success("Tier deleted"); setDeleteTierId(null); } }}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteFeatureIdx !== null} onOpenChange={(o) => { if (!o) setDeleteFeatureIdx(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Feature</DialogTitle>
            <DialogDescription>This will also remove this feature column from all tiers. Are you sure?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteFeatureIdx(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => { if (deleteFeatureIdx !== null) { deleteComparisonFeature(deleteFeatureIdx); toast.success("Feature deleted"); setDeleteFeatureIdx(null); } }}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TierForm({ initial, onSave, onCancel }: { initial: any; onSave: (d: any) => void; onCancel: () => void }) {
  const [form, setForm] = useState(initial);
  const update = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  return (
    <div className="space-y-4 py-2">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-bold">Name</Label>
          <Input className="mt-1" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Starter" />
        </div>
        <div>
          <Label className="text-sm font-bold">Price (display)</Label>
          <Input className="mt-1" value={form.price} onChange={(e) => update("price", e.target.value)} placeholder="$2,999" />
        </div>
      </div>
      <div>
        <Label className="text-sm font-bold">Description</Label>
        <Input className="mt-1" value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Best for growing businesses" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-bold">Icon</Label>
          <Select value={form.iconName} onValueChange={(v) => update("iconName", v)}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              {iconOptions.map((ic) => <SelectItem key={ic} value={ic}>{ic}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-sm font-bold">Color</Label>
          <Select value={form.color} onValueChange={(v) => update("color", v)}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="blue">Blue</SelectItem>
              <SelectItem value="purple">Purple</SelectItem>
              <SelectItem value="orange">Orange</SelectItem>
              <SelectItem value="green">Green</SelectItem>
              <SelectItem value="red">Red</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex items-center gap-2 p-3 rounded-xl border border-border/50 bg-muted/20">
        <Switch checked={form.highlight} onCheckedChange={(v) => update("highlight", v)} />
        <div>
          <Label className="text-sm font-medium">Highlight as Popular</Label>
          <p className="text-xs text-muted-foreground">Shows a "Popular" badge on this tier</p>
        </div>
      </div>
      <Separator />
      <div className="flex justify-end gap-2 pt-1">
        <Button variant="outline" onClick={onCancel} className="rounded-xl">Cancel</Button>
        <Button onClick={() => onSave(form)} className="rounded-xl">Save Tier</Button>
      </div>
    </div>
  );
}

function FeatureForm({ initial, onSave, onCancel }: { initial: any; onSave: (d: any) => void; onCancel: () => void }) {
  const [form, setForm] = useState(initial);
  const update = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  return (
    <div className="space-y-4 py-2">
      <div>
        <Label className="text-sm font-bold">Feature Name</Label>
        <Input className="mt-1 mb-1" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Dedicated Engineer" />
        <p className="text-xs text-muted-foreground">This will appear as a row in the comparison table</p>
      </div>
      <div>
        <Label className="text-sm font-bold">Tooltip</Label>
        <Input className="mt-1" value={form.tooltip} onChange={(e) => update("tooltip", e.target.value)} placeholder="A senior developer assigned exclusively..." />
      </div>
      <Separator />
      <div className="flex justify-end gap-2 pt-1">
        <Button variant="outline" onClick={onCancel} className="rounded-xl">Cancel</Button>
        <Button onClick={() => onSave(form)} className="rounded-xl">Save Feature</Button>
      </div>
    </div>
  );
}

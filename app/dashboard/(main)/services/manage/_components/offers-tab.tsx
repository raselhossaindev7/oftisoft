"use client";

import { useState } from "react";
import {
  Search, Plus, Edit, Trash2, Star, TrendingUp,
  GripVertical, Eye, X, ChevronDown, ChevronUp,
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
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useServicesContentStore, type ServiceOffer, type ServiceTier } from "@/lib/store/services-content";
import { toast } from "sonner";

const CATEGORIES = [
  "WordPress", "Web Development", "Backend Development", "Mobile Development",
  "AI & Machine Learning", "DevOps & Cloud", "Data Engineering", "Desktop Applications",
];

const emptyTier = (): ServiceTier => ({
  name: "Basic", price: 0, deliveryTime: "3 days", description: "", features: [], revisions: 1,
});

const defaultColors = ["bg-red-500/10 text-red-500", "bg-blue-500/10 text-blue-500", "bg-green-500/10 text-green-500", "bg-purple-500/10 text-purple-500", "bg-orange-500/10 text-orange-500"];

function generateId() {
  return `svc-${Date.now().toString(36)}`;
}

export default function OffersTab() {
  const { content, addOffer, updateOffer, deleteOffer } = useServicesContentStore();
  const offers = content?.offers ?? [];

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [editOffer, setEditOffer] = useState<ServiceOffer | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const filtered = offers.filter((o) => {
    if (categoryFilter !== "all" && o.category !== categoryFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return o.title.toLowerCase().includes(q) || o.description.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <Card className="border-border/50">
        <CardHeader className="p-4 border-b border-border/50 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="flex flex-1 flex-col sm:flex-row gap-2">
            <div className="relative flex-1 min-w-0 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search offers..."
                className="pl-10 h-10 rounded-xl"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="h-10 rounded-xl w-[160px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => setShowAdd(true)} className="gap-2 rounded-xl h-10">
            <Plus className="w-4 h-4" /> New Offer
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {filtered.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/5">
                  <TableHead className="w-[300px]">Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Pricing</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((offer, idx) => (
                  <TableRow key={offer.id} className="group hover:bg-primary/5 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${defaultColors[idx % defaultColors.length]}`}>
                          {offer.title.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-sm truncate max-w-[250px]">{offer.title}</div>
                          {offer.subcategory && <div className="text-xs text-muted-foreground">{offer.subcategory}</div>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">{offer.category}</Badge>
                    </TableCell>
                    <TableCell className="font-bold font-mono text-sm">
                      {offer.tiers?.length > 0
                        ? `$${Math.min(...offer.tiers.map(t => t.price)).toLocaleString()} — $${Math.max(...offer.tiers.map(t => t.price)).toLocaleString()}`
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                        <span className="font-bold text-sm">{offer.rating}</span>
                        <span className="text-xs text-muted-foreground">({offer.reviewCount})</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {offer.featured && <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20 text-xs gap-1"><Star className="w-3 h-3" />Featured</Badge>}
                        {offer.trending && <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20 text-xs gap-1"><TrendingUp className="w-3 h-3" />Trending</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setEditOffer(offer)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                          onClick={() => setDeleteId(offer.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                <Plus className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-bold text-lg mb-1">No Service Offers</h3>
              <p className="text-muted-foreground text-sm mb-4 max-w-sm">
                {offers.length === 0
                  ? "Create your first service offer to showcase what you provide."
                  : "No offers match your filters."}
              </p>
              {offers.length === 0 && (
                <Button onClick={() => setShowAdd(true)} className="gap-2 rounded-xl">
                  <Plus className="w-4 h-4" /> Create First Offer
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <OfferDialog
        key={editOffer?.id || 'new'}
        open={showAdd || !!editOffer}
        onOpenChange={(open) => { if (!open) { setShowAdd(false); setEditOffer(null); } }}
        offer={editOffer}
        onSave={(data) => {
          if (editOffer) {
            updateOffer(editOffer.id, data);
            toast.success("Offer updated");
          } else {
            addOffer({ ...data, id: generateId(), createdAt: new Date().toISOString() } as ServiceOffer);
            toast.success("Offer created");
          }
          setShowAdd(false);
          setEditOffer(null);
        }}
      />

      <Dialog open={!!deleteId} onOpenChange={(o) => { if (!o) setDeleteId(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Offer</DialogTitle>
            <DialogDescription>Are you sure? This cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => { if (deleteId) { deleteOffer(deleteId); toast.success("Offer deleted"); setDeleteId(null); } }}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function OfferDialog({
  open, onOpenChange, offer, onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  offer: ServiceOffer | null;
  onSave: (data: Partial<ServiceOffer>) => void;
}) {
  const [form, setForm] = useState<Partial<ServiceOffer>>(
    offer ?? {
      id: "", title: "", description: "", category: "Web Development", subcategory: "",
      rating: 5, reviewCount: 0, orderCount: 0, image: "",
      techs: [], featured: false, trending: false, createdAt: new Date().toISOString(),
      tiers: [emptyTier(), { ...emptyTier(), name: "Standard", price: 0, deliveryTime: "7 days" }, { ...emptyTier(), name: "Premium", price: 0, deliveryTime: "14 days" }],
      faqs: [],
    }
  );

  const update = (key: string, value: any) => setForm((f) => ({ ...f, [key]: value }));
  const updateTier = (i: number, key: string, value: any) => {
    const tiers = [...(form.tiers || [])];
    tiers[i] = { ...tiers[i], [key]: value };
    update("tiers", tiers);
  };
  const removeTier = (i: number) => {
    const tiers = (form.tiers || []).filter((_, idx) => idx !== i);
    update("tiers", tiers);
  };
  const addTier = () => {
    const names = ["Basic", "Standard", "Premium", "Enterprise", "Pro", "Ultimate"];
    const used = (form.tiers || []).map(t => t.name);
    const next = names.find(n => !used.includes(n)) || `Tier ${(form.tiers?.length || 0) + 1}`;
    update("tiers", [...(form.tiers || []), { ...emptyTier(), name: next }]);
  };

  const previewTiers = form.tiers || [];
  const lowestPrice = previewTiers.length > 0 ? Math.min(...previewTiers.map(t => t.price)) : 0;
  const highestPrice = previewTiers.length > 0 ? Math.max(...previewTiers.map(t => t.price)) : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <Tabs defaultValue="basic" className="flex flex-col h-full">
          <div className="px-6 pt-6 pb-0">
            <DialogHeader className="pb-2">
              <DialogTitle className="text-xl">{offer ? "Edit Service Offer" : "New Service Offer"}</DialogTitle>
            </DialogHeader>
            <TabsList className="bg-muted/50 p-1 rounded-2xl h-auto w-fit border border-border">
              <TabsTrigger value="basic" className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-md font-bold px-4 py-1.5 text-xs">Basic Info</TabsTrigger>
              <TabsTrigger value="pricing" className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-md font-bold px-4 py-1.5 text-xs">Pricing Tiers</TabsTrigger>
              <TabsTrigger value="preview" className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-md font-bold px-4 py-1.5 text-xs">Preview</TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="flex-1 px-6 py-4 max-h-[55vh]">
            <TabsContent value="basic" className="space-y-5 mt-0">
              <div>
                <Label className="text-sm font-bold">Title</Label>
                <Input value={form.title || ""} onChange={(e) => update("title", e.target.value)} placeholder="I will build a professional website..." className="mt-1" />
              </div>
              <div>
                <Label className="text-sm font-bold">Description</Label>
                <Textarea value={form.description || ""} onChange={(e) => update("description", e.target.value)} rows={3} className="mt-1" placeholder="Describe what this service includes..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-bold">Category</Label>
                  <Select value={form.category || "Web Development"} onValueChange={(v) => update("category", v)}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-bold">Subcategory</Label>
                  <Input value={form.subcategory || ""} onChange={(e) => update("subcategory", e.target.value)} placeholder="e.g. Full-Stack, Frontend" className="mt-1" />
                </div>
              </div>
              <div>
                <Label className="text-sm font-bold">Technologies</Label>
                <Input value={(form.techs || []).join(", ")} onChange={(e) => update("techs", e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean))} placeholder="React, Node.js, TypeScript" className="mt-1" />
                {form.techs && form.techs.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {form.techs.map((t, i) => <Badge key={i} variant="secondary" className="text-xs">{t}</Badge>)}
                  </div>
                )}
              </div>
              <div>
                <Label className="text-sm font-bold">Image URL</Label>
                <Input value={form.image || ""} onChange={(e) => update("image", e.target.value)} placeholder="https://example.com/image.jpg" className="mt-1" />
                {form.image && (
                  <div className="mt-2 relative w-full h-32 rounded-lg overflow-hidden bg-muted">
                    <img src={form.image} alt="Preview" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  </div>
                )}
              </div>
              <Separator />
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-bold">Rating (0-5)</Label>
                  <Input type="number" min={0} max={5} step={0.1} value={form.rating ?? 5} onChange={(e) => update("rating", parseFloat(e.target.value))} className="mt-1" />
                </div>
                <div>
                  <Label className="text-sm font-bold">Reviews</Label>
                  <Input type="number" min={0} value={form.reviewCount ?? 0} onChange={(e) => update("reviewCount", parseInt(e.target.value))} className="mt-1" />
                </div>
                <div>
                  <Label className="text-sm font-bold">Order Count</Label>
                  <Input type="number" min={0} value={form.orderCount ?? 0} onChange={(e) => update("orderCount", parseInt(e.target.value))} className="mt-1" />
                </div>
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Switch checked={!!form.featured} onCheckedChange={(v) => update("featured", v)} />
                  <span className="text-sm font-medium">Featured</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Switch checked={!!form.trending} onCheckedChange={(v) => update("trending", v)} />
                  <span className="text-sm font-medium">Trending</span>
                </label>
              </div>
            </TabsContent>

            <TabsContent value="pricing" className="space-y-4 mt-0">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm">Pricing Tiers ({previewTiers.length})</h4>
                  <p className="text-xs text-muted-foreground">Define pricing and feature tiers for this service</p>
                </div>
                <Button variant="outline" size="sm" onClick={addTier} className="gap-1 rounded-xl text-xs h-8">
                  <Plus className="w-3 h-3" /> Add Tier
                </Button>
              </div>

              {previewTiers.map((tier, i) => (
                <Card key={i} className="border-border/50 relative">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                          {i + 1}
                        </div>
                        <span className="font-bold text-sm">{tier.name}</span>
                      </div>
                      {previewTiers.length > 1 && (
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500 hover:bg-red-500/10"
                          onClick={() => removeTier(i)}
                        >
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <Label className="text-xs">Name</Label>
                        <Input className="h-8 text-sm mt-0.5" value={tier.name} onChange={(e) => updateTier(i, "name", e.target.value)} />
                      </div>
                      <div>
                        <Label className="text-xs">Price ($)</Label>
                        <Input className="h-8 text-sm mt-0.5" type="number" min={0} value={tier.price} onChange={(e) => updateTier(i, "price", parseInt(e.target.value) || 0)} />
                      </div>
                      <div>
                        <Label className="text-xs">Delivery</Label>
                        <Input className="h-8 text-sm mt-0.5" value={tier.deliveryTime} onChange={(e) => updateTier(i, "deliveryTime", e.target.value)} placeholder="7 days" />
                      </div>
                      <div>
                        <Label className="text-xs">Revisions</Label>
                        <Input className="h-8 text-sm mt-0.5" type="number" min={0} value={typeof tier.revisions === "number" ? tier.revisions : 0}
                          onChange={(e) => updateTier(i, "revisions", parseInt(e.target.value) || 0)} />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">Description</Label>
                      <Input className="h-8 text-sm mt-0.5" value={tier.description} onChange={(e) => updateTier(i, "description", e.target.value)} placeholder="What's included in this tier..." />
                    </div>
                    <div>
                      <Label className="text-xs">Features (comma separated)</Label>
                      <Input className="h-8 text-sm mt-0.5" value={(tier.features || []).join(", ")}
                        onChange={(e) => updateTier(i, "features", e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean))} />
                      {(tier.features || []).length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {tier.features.map((f, fi) => <Badge key={fi} variant="outline" className="text-xs">{f}</Badge>)}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {previewTiers.length === 0 && (
                <div className="p-8 text-center border border-dashed border-border rounded-xl">
                  <p className="text-sm text-muted-foreground mb-2">No pricing tiers defined</p>
                  <Button variant="outline" size="sm" onClick={addTier} className="gap-1 rounded-xl">
                    <Plus className="w-3 h-3" /> Add Your First Tier
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="preview" className="space-y-4 mt-0">
              <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
                      {form.title?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold">{form.title || "Untitled Service"}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{form.description || "No description provided"}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {form.category && <Badge>{form.category}</Badge>}
                    {form.subcategory && <Badge variant="outline">{form.subcategory}</Badge>}
                    {form.featured && <Badge className="bg-purple-500/10 text-purple-500">Featured</Badge>}
                    {form.trending && <Badge className="bg-orange-500/10 text-orange-500">Trending</Badge>}
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                      <span className="font-bold">{form.rating || 0}</span>
                      <span className="text-muted-foreground">({form.reviewCount || 0} reviews)</span>
                    </div>
                    <span className="text-muted-foreground">{form.orderCount || 0} orders</span>
                  </div>
                </CardContent>
              </Card>

              <h4 className="font-bold text-sm">Pricing</h4>
              {previewTiers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {previewTiers.map((tier, i) => (
                    <Card key={i} className="border-border/50">
                      <CardContent className="p-4 text-center">
                        <div className="text-xs text-muted-foreground mb-1">{tier.name}</div>
                        <div className="text-2xl font-bold text-primary">${tier.price.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground mt-1">{tier.deliveryTime}</div>
                        <div className="text-xs text-muted-foreground">{tier.revisions === 1 ? "1 revision" : `${tier.revisions} revisions`}</div>
                        <Separator className="my-2" />
                        <div className="text-xs text-muted-foreground">{tier.description}</div>
                        {tier.features.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {tier.features.slice(0, 3).map((f, fi) => (
                              <div key={fi} className="text-xs text-left flex items-center gap-1">
                                <span className="text-green-500">✓</span> {f}
                              </div>
                            ))}
                            {tier.features.length > 3 && (
                              <div className="text-xs text-muted-foreground">+{tier.features.length - 3} more</div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No tiers configured</p>
              )}

              {form.techs && form.techs.length > 0 && (
                <>
                  <h4 className="font-bold text-sm pt-2">Technologies</h4>
                  <div className="flex flex-wrap gap-1">
                    {form.techs.map((t, i) => <Badge key={i} variant="secondary" className="text-xs">{t}</Badge>)}
                  </div>
                </>
              )}
            </TabsContent>
          </ScrollArea>

          <div className="px-6 py-4 border-t border-border/50 flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              {previewTiers.length > 0 && (
                <>Price range: <span className="font-bold text-primary">${lowestPrice.toLocaleString()} — ${highestPrice.toLocaleString()}</span></>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">Cancel</Button>
              <Button onClick={() => onSave(form)} className="rounded-xl gap-2">
                {offer ? "Update Offer" : "Create Offer"}
              </Button>
            </div>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState } from "react";
import {
  Plus, Edit, Trash2, HelpCircle, Settings2, Cpu, LayoutDashboard,
  Star, MessageSquare,
} from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useServicesContentStore, type FAQItem, type ProcessStep, type TechCategory, type ServiceItem } from "@/lib/store/services-content";
import { toast } from "sonner";

export default function SettingsTab() {
  return (
    <Tabs defaultValue="faqs">
      <TabsList className="bg-muted/50 p-1 rounded-2xl h-auto w-fit border border-border flex-wrap">
        <TabsTrigger value="faqs" className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-md font-bold px-5 py-2 gap-2">
          <HelpCircle className="w-4 h-4" /> FAQs
        </TabsTrigger>
        <TabsTrigger value="process" className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-md font-bold px-5 py-2 gap-2">
          <Settings2 className="w-4 h-4" /> Process Steps
        </TabsTrigger>
        <TabsTrigger value="techstack" className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-md font-bold px-5 py-2 gap-2">
          <Cpu className="w-4 h-4" /> Tech Stack
        </TabsTrigger>
        <TabsTrigger value="overview" className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-md font-bold px-5 py-2 gap-2">
          <LayoutDashboard className="w-4 h-4" /> Overview Items
        </TabsTrigger>
      </TabsList>

      <TabsContent value="faqs" className="mt-6"><FAQsManager /></TabsContent>
      <TabsContent value="process" className="mt-6"><ProcessManager /></TabsContent>
      <TabsContent value="techstack" className="mt-6"><TechStackManager /></TabsContent>
      <TabsContent value="overview" className="mt-6"><OverviewManager /></TabsContent>
    </Tabs>
  );
}

/* ───────── SHARED ───────── */
const emptyState = (title: string, desc: string, btnLabel: string, onAction: () => void) => (
  <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-border rounded-xl">
    <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-3">
      <Plus className="w-6 h-6 text-muted-foreground" />
    </div>
    <h4 className="font-bold mb-1">{title}</h4>
    <p className="text-sm text-muted-foreground mb-4 max-w-sm">{desc}</p>
    <Button onClick={onAction} variant="outline" size="sm" className="gap-1 rounded-xl">
      <Plus className="w-3 h-3" /> {btnLabel}
    </Button>
  </div>
);

/* ───────── FAQ MANAGER ───────── */
function FAQsManager() {
  const { content, addFAQ, updateFAQ, deleteFAQ } = useServicesContentStore();
  const faqs = content?.faqs ?? [];
  const [editItem, setEditItem] = useState<FAQItem | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">FAQs ({faqs.length})</h3>
        <Button onClick={() => setShowAdd(true)} className="gap-2 rounded-xl"><Plus className="w-4 h-4" /> Add FAQ</Button>
      </div>

      {faqs.length > 0 ? (
        <div className="grid gap-2">
          {faqs.map((faq) => (
            <Card key={faq.id} className="border-border/50 group hover:border-primary/30 transition-colors">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-xs text-primary shrink-0">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{faq.question}</div>
                  <Badge variant="outline" className="text-xs mt-0.5">{faq.category}</Badge>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setEditItem(faq)}><Edit className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:bg-red-500/10" onClick={() => setDeleteId(faq.id)}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : emptyState("No FAQs", "Add frequently asked questions for your services page.", "Add FAQ", () => setShowAdd(true))}

      <FAQDialog
        key={'faq-' + (editItem?.id || 'new')}
        open={showAdd || !!editItem}
        onOpenChange={(o) => { if (!o) { setShowAdd(false); setEditItem(null); } }}
        initial={editItem ?? { id: "", category: "General", question: "", answer: "" }}
        onSave={(data) => {
          if (editItem) { updateFAQ(editItem.id, data); toast.success("FAQ updated"); }
          else { addFAQ({ ...data, id: `faq-${Date.now()}` } as FAQItem); toast.success("FAQ added"); }
          setShowAdd(false); setEditItem(null);
        }}
      />

      <SimpleDeleteDialog
        open={!!deleteId}
        onOpenChange={(o) => { if (!o) setDeleteId(null); }}
        onConfirm={() => { if (deleteId) { deleteFAQ(deleteId); toast.success("FAQ deleted"); setDeleteId(null); } }}
      />
    </div>
  );
}

function FAQDialog({ open, onOpenChange, initial, onSave }: { open: boolean; onOpenChange: (o: boolean) => void; initial: any; onSave: (d: any) => void }) {
  const [form, setForm] = useState(initial);
  const update = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{initial.id ? "Edit FAQ" : "New FAQ"}</DialogTitle></DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label className="text-sm font-bold">Question</Label>
            <Input className="mt-1" value={form.question} onChange={(e) => update("question", e.target.value)} placeholder="How long does a typical project take?" />
          </div>
          <div>
            <Label className="text-sm font-bold">Answer</Label>
            <Textarea className="mt-1" value={form.answer} onChange={(e) => update("answer", e.target.value)} rows={4} placeholder="Most projects are completed within 2-4 weeks depending on scope..." />
          </div>
          <div>
            <Label className="text-sm font-bold">Category</Label>
            <Select value={form.category} onValueChange={(v) => update("category", v)}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["General", "Technical", "Billing", "Support"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">Cancel</Button>
          <Button onClick={() => onSave(form)} className="rounded-xl">{initial.id ? "Update FAQ" : "Add FAQ"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ───────── PROCESS STEPS MANAGER ───────── */
function ProcessManager() {
  const { content, addProcessStep, updateProcessStep, deleteProcessStep } = useServicesContentStore();
  const steps = content?.process ?? [];
  const [editItem, setEditItem] = useState<ProcessStep | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">Process Steps ({steps.length})</h3>
        <Button onClick={() => setShowAdd(true)} className="gap-2 rounded-xl"><Plus className="w-4 h-4" /> Add Step</Button>
      </div>

      {steps.length > 0 ? (
        <div className="grid gap-2">
          {steps.map((step) => (
            <Card key={step.id} className="border-border/50 group hover:border-primary/30 transition-colors">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                  {step.id < 10 ? `0${step.id}` : step.id}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{step.title}</div>
                  <div className="text-xs text-muted-foreground truncate">{step.desc}</div>
                </div>
                <div className="text-xs font-mono text-muted-foreground hidden sm:block">{step.iconName}</div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setEditItem(step)}><Edit className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:bg-red-500/10" onClick={() => setDeleteId(step.id)}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : emptyState("No Process Steps", "Add the steps clients go through when working with you.", "Add Step", () => setShowAdd(true))}

      <ProcessStepDialog
        key={'step-' + (editItem?.id || 'new')}
        open={showAdd || !!editItem}
        onOpenChange={(o) => { if (!o) { setShowAdd(false); setEditItem(null); } }}
        initial={editItem ?? { id: steps.length + 1, title: "", desc: "", iconName: "Zap", color: "text-blue-500" }}
        onSave={(data) => {
          if (editItem) { updateProcessStep(editItem.id, data); toast.success("Step updated"); }
          else { addProcessStep({ ...data, id: steps.length + 1 } as ProcessStep); toast.success("Step added"); }
          setShowAdd(false); setEditItem(null);
        }}
      />

      <SimpleDeleteDialog
        open={deleteId !== null}
        onOpenChange={(o) => { if (!o) setDeleteId(null); }}
        onConfirm={() => { if (deleteId !== null) { deleteProcessStep(deleteId); toast.success("Step deleted"); setDeleteId(null); } }}
      />
    </div>
  );
}

function ProcessStepDialog({ open, onOpenChange, initial, onSave }: { open: boolean; onOpenChange: (o: boolean) => void; initial: any; onSave: (d: any) => void }) {
  const [form, setForm] = useState(initial);
  const update = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{initial.id ? "Edit Step" : "New Process Step"}</DialogTitle></DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-bold">Title</Label>
              <Input className="mt-1" value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="Discovery" />
            </div>
            <div>
              <Label className="text-sm font-bold">Icon Name</Label>
              <Input className="mt-1" value={form.iconName} onChange={(e) => update("iconName", e.target.value)} placeholder="Search, Code, Rocket" />
            </div>
          </div>
          <div>
            <Label className="text-sm font-bold">Description</Label>
            <Textarea className="mt-1" value={form.desc} onChange={(e) => update("desc", e.target.value)} rows={3} placeholder="We analyze your requirements..." />
          </div>
          <div>
            <Label className="text-sm font-bold">Color</Label>
            <Select value={form.color} onValueChange={(v) => update("color", v)}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["text-blue-500", "text-purple-500", "text-yellow-500", "text-red-500", "text-green-500", "text-cyan-500", "text-orange-500", "text-pink-500"].map((c) => (
                  <SelectItem key={c} value={c}>{c.replace("text-", "").replace("-500", "")}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">Cancel</Button>
          <Button onClick={() => onSave(form)} className="rounded-xl">{initial.id ? "Update Step" : "Add Step"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ───────── TECH STACK MANAGER ───────── */
function TechStackManager() {
  const { content, addTechCategory, updateTechCategory, deleteTechCategory } = useServicesContentStore();
  const categories = content?.techStack ?? [];
  const [editItem, setEditItem] = useState<TechCategory | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">Tech Stack Categories ({categories.length})</h3>
        <Button onClick={() => setShowAdd(true)} className="gap-2 rounded-xl"><Plus className="w-4 h-4" /> Add Category</Button>
      </div>

      {categories.length > 0 ? (
        <div className="grid gap-2">
          {categories.map((cat) => (
            <Card key={cat.id} className="border-border/50 group hover:border-primary/30 transition-colors">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-xs text-primary shrink-0">
                  <Cpu className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{cat.label}</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {cat.techs.slice(0, 4).map((t, i) => <Badge key={i} variant="outline" className="text-[10px]">{t}</Badge>)}
                    {cat.techs.length > 4 && <Badge variant="outline" className="text-[10px]">+{cat.techs.length - 4}</Badge>}
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setEditItem(cat)}><Edit className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:bg-red-500/10" onClick={() => setDeleteId(cat.id)}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : emptyState("No Tech Categories", "Showcase the technologies and tools you use.", "Add Category", () => setShowAdd(true))}

      <TechStackDialog
        key={'tech-' + (editItem?.id || 'new')}
        open={showAdd || !!editItem}
        onOpenChange={(o) => { if (!o) { setShowAdd(false); setEditItem(null); } }}
        initial={editItem ?? { id: "", label: "", iconName: "Cpu", description: "", techs: [] }}
        onSave={(data) => {
          if (editItem) { updateTechCategory(editItem.id, data); toast.success("Category updated"); }
          else { addTechCategory({ ...data, id: `tech-${Date.now()}` } as TechCategory); toast.success("Category added"); }
          setShowAdd(false); setEditItem(null);
        }}
      />

      <SimpleDeleteDialog
        open={!!deleteId}
        onOpenChange={(o) => { if (!o) setDeleteId(null); }}
        onConfirm={() => { if (deleteId) { deleteTechCategory(deleteId); toast.success("Category deleted"); setDeleteId(null); } }}
      />
    </div>
  );
}

function TechStackDialog({ open, onOpenChange, initial, onSave }: { open: boolean; onOpenChange: (o: boolean) => void; initial: any; onSave: (d: any) => void }) {
  const [form, setForm] = useState(initial);
  const update = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{initial.id ? "Edit Category" : "New Tech Category"}</DialogTitle></DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-bold">Label</Label>
              <Input className="mt-1" value={form.label} onChange={(e) => update("label", e.target.value)} placeholder="Frontend" />
            </div>
            <div>
              <Label className="text-sm font-bold">Icon Name</Label>
              <Input className="mt-1" value={form.iconName} onChange={(e) => update("iconName", e.target.value)} placeholder="Layout, Server, Database" />
            </div>
          </div>
          <div>
            <Label className="text-sm font-bold">Description</Label>
            <Input className="mt-1" value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Technologies we use for frontend development" />
          </div>
          <div>
            <Label className="text-sm font-bold">Technologies (comma separated)</Label>
            <Input className="mt-1" value={(form.techs || []).join(", ")} onChange={(e) => update("techs", e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean))} placeholder="React, Next.js, TypeScript" />
            {form.techs?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {form.techs.map((t: string, i: number) => <Badge key={i} variant="secondary" className="text-xs">{t}</Badge>)}
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">Cancel</Button>
          <Button onClick={() => onSave(form)} className="rounded-xl">{initial.id ? "Update Category" : "Add Category"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ───────── OVERVIEW ITEMS MANAGER ───────── */
function OverviewManager() {
  const { content, addServiceItem, updateServiceItem, deleteServiceItem } = useServicesContentStore();
  const items = content?.overview ?? [];
  const [editItem, setEditItem] = useState<ServiceItem | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">Service Overview Items ({items.length})</h3>
        <Button onClick={() => setShowAdd(true)} className="gap-2 rounded-xl"><Plus className="w-4 h-4" /> Add Item</Button>
      </div>

      {items.length > 0 ? (
        <div className="grid gap-2">
          {items.map((item) => (
            <Card key={item.id} className="border-border/50 group hover:border-primary/30 transition-colors">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-xs text-primary shrink-0">
                  <Star className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{item.title}</div>
                  <div className="text-xs text-muted-foreground truncate">{item.description}</div>
                </div>
                <Badge variant="outline" className="text-xs shrink-0">{item.features.length} features</Badge>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setEditItem(item)}><Edit className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:bg-red-500/10" onClick={() => setDeleteId(item.id)}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : emptyState("No Overview Items", "Add service category overviews that appear on the services page.", "Add Item", () => setShowAdd(true))}

      <OverviewItemDialog
        key={'ov-' + (editItem?.id || 'new')}
        open={showAdd || !!editItem}
        onOpenChange={(o) => { if (!o) { setShowAdd(false); setEditItem(null); } }}
        initial={editItem ?? { id: "", label: "", iconName: "Zap", title: "", description: "", features: [], techs: [] }}
        onSave={(data) => {
          if (editItem) { updateServiceItem(editItem.id, data); toast.success("Item updated"); }
          else { addServiceItem({ ...data, id: `ov-${Date.now()}` } as ServiceItem); toast.success("Item added"); }
          setShowAdd(false); setEditItem(null);
        }}
      />

      <SimpleDeleteDialog
        open={!!deleteId}
        onOpenChange={(o) => { if (!o) setDeleteId(null); }}
        onConfirm={() => { if (deleteId) { deleteServiceItem(deleteId); toast.success("Item deleted"); setDeleteId(null); } }}
      />
    </div>
  );
}

function OverviewItemDialog({ open, onOpenChange, initial, onSave }: { open: boolean; onOpenChange: (o: boolean) => void; initial: any; onSave: (d: any) => void }) {
  const [form, setForm] = useState(initial);
  const update = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{initial.id ? "Edit Overview Item" : "New Overview Item"}</DialogTitle></DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-bold">Title</Label>
              <Input className="mt-1" value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="Web Development" />
            </div>
            <div>
              <Label className="text-sm font-bold">Label (short)</Label>
              <Input className="mt-1" value={form.label} onChange={(e) => update("label", e.target.value)} placeholder="Web" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-bold">Icon Name</Label>
              <Input className="mt-1" value={form.iconName} onChange={(e) => update("iconName", e.target.value)} placeholder="Globe, Code, Palette" />
            </div>
            <div>
              <Label className="text-sm font-bold">Gradient</Label>
              <Input className="mt-1" value={form.gradient || ""} onChange={(e) => update("gradient", e.target.value)} placeholder="from-blue-500 to-cyan-500" />
            </div>
          </div>
          <div>
            <Label className="text-sm font-bold">Description</Label>
            <Textarea className="mt-1" value={form.description} onChange={(e) => update("description", e.target.value)} rows={2} placeholder="We build modern web applications..." />
          </div>
          <div>
            <Label className="text-sm font-bold">Features (comma separated)</Label>
            <Input className="mt-1" value={(form.features || []).join(", ")} onChange={(e) => {
              const items = e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean);
              update("features", items);
            }} placeholder="Responsive Design, SEO, API Integration" />
          </div>
          <div>
            <Label className="text-sm font-bold">Techs (comma separated)</Label>
            <Input className="mt-1" value={(form.techs || []).join(", ")} onChange={(e) => update("techs", e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean))} placeholder="React, Node.js, PostgreSQL" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">Cancel</Button>
          <Button onClick={() => onSave(form)} className="rounded-xl">{initial.id ? "Update" : "Create"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ───────── SHARED DELETE DIALOG ───────── */
function SimpleDeleteDialog({ open, onOpenChange, onConfirm }: { open: boolean; onOpenChange: (o: boolean) => void; onConfirm: () => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete</DialogTitle>
          <DialogDescription>Are you sure? This cannot be undone.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">Cancel</Button>
          <Button variant="destructive" onClick={onConfirm} className="rounded-xl">Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

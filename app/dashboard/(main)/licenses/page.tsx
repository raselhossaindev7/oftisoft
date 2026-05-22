"use client"

import { useState } from "react"
import { Search, Key, Plus, Trash2, User, Package, Copy, Check, SearchX, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { adminAPI } from "@/lib/api"
import { toast } from "sonner"
import { RoleGuard } from "@/components/auth/role-guard"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { format } from "date-fns"

export default function LicensesPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState("")
  const [grantOpen, setGrantOpen] = useState(false)
  const [revokeTarget, setRevokeTarget] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [form, setForm] = useState({ userId: "", productId: "", licenseType: "Regular", bonusAsset: "" })

  const { data: licenses = [], isLoading } = useQuery({
    queryKey: ["admin-licenses", search],
    queryFn: () => adminAPI.getLicenses(search || undefined),
  })

  const grantMutation = useMutation({
    mutationFn: adminAPI.grantLicense,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-licenses"] })
      toast.success(`License granted: ${data.licenseKey}`)
      setGrantOpen(false)
      setForm({ userId: "", productId: "", licenseType: "Regular", bonusAsset: "" })
    },
    onError: () => toast.error("Failed to grant license"),
  })

  const revokeMutation = useMutation({
    mutationFn: adminAPI.revokeLicense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-licenses"] })
      toast.success("License revoked")
      setRevokeTarget(null)
    },
    onError: () => toast.error("Failed to revoke license"),
  })

  const copyKey = (id: string, key: string) => {
    navigator.clipboard.writeText(key)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <RoleGuard allowedRoles={["Admin", "SuperAdmin"]}>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">License Management</h1>
            <p className="text-muted-foreground">View, grant, and revoke product licenses across all users.</p>
          </div>
          <Button className="gap-2 rounded-xl font-bold" onClick={() => setGrantOpen(true)}>
            <Plus className="w-4 h-4" /> Grant License
          </Button>
        </div>

        <Card className="border-border/50 overflow-hidden">
          <CardHeader className="bg-muted/20 border-b border-border/50">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by product, user, or key..."
                className="pl-10 h-10 rounded-xl"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : licenses.length === 0 ? (
              <div className="py-20 text-center text-muted-foreground">
                <Key className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p className="font-bold">No licenses found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/10 hover:bg-transparent">
                    <TableHead className="font-bold">License Key</TableHead>
                    <TableHead className="font-bold">Product</TableHead>
                    <TableHead className="font-bold">User</TableHead>
                    <TableHead className="font-bold">Type</TableHead>
                    <TableHead className="font-bold">Granted</TableHead>
                    <TableHead className="text-right font-bold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {licenses.map((lic: any) => (
                    <TableRow key={lic.id} className="group hover:bg-primary/5 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="text-xs font-mono font-bold bg-muted/30 px-2 py-1 rounded-lg truncate max-w-[200px]">{lic.licenseKey}</code>
                          <Button variant="ghost" size="icon" className="h-6 w-6 rounded-lg" onClick={() => copyKey(lic.id, lic.licenseKey)}>
                            {copiedId === lic.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-muted-foreground" />
                          <span className="font-bold text-sm">{lic.product?.name || "—"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-bold">{lic.user?.name || "—"}</p>
                            <p className="text-xs text-muted-foreground">{lic.user?.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-bold text-xs">{lic.licenseType}</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {format(new Date(lic.purchaseDate), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl text-destructive hover:bg-destructive/10"
                          onClick={() => setRevokeTarget(lic.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Dialog open={grantOpen} onOpenChange={setGrantOpen}>
          <DialogContent className="rounded-[2rem] border-border/50 max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Grant License</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Manually issue a license to a user for a specific product.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold mb-1 block">User ID</label>
                <Input
                  placeholder="Enter user UUID..."
                  className="h-10 rounded-xl"
                  value={form.userId}
                  onChange={(e) => setForm({ ...form, userId: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-bold mb-1 block">Product ID</label>
                <Input
                  placeholder="Enter product UUID..."
                  className="h-10 rounded-xl"
                  value={form.productId}
                  onChange={(e) => setForm({ ...form, productId: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-bold mb-1 block">License Type</label>
                <select
                  className="w-full h-10 rounded-xl border border-border/50 bg-background px-3 text-sm font-bold"
                  value={form.licenseType}
                  onChange={(e) => setForm({ ...form, licenseType: e.target.value })}
                >
                  <option value="Regular">Regular</option>
                  <option value="Extended">Extended</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-bold mb-1 block">Bonus Asset (optional)</label>
                <Input
                  placeholder="e.g. Documentation Pack"
                  className="h-10 rounded-xl"
                  value={form.bonusAsset}
                  onChange={(e) => setForm({ ...form, bonusAsset: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" className="rounded-xl font-bold" onClick={() => setGrantOpen(false)}>Cancel</Button>
              <Button className="rounded-xl font-bold" onClick={() => grantMutation.mutate(form)}
                disabled={!form.userId || !form.productId || grantMutation.isPending}>
                {grantMutation.isPending ? "Granting..." : "Grant License"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={!!revokeTarget} onOpenChange={(o) => !o && setRevokeTarget(null)}>
          <AlertDialogContent className="rounded-2xl border-border/50 max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                <Trash2 className="w-5 h-5" /> Revoke License
              </AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently remove the user&apos;s access to this product. They will no longer see it in their downloads.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-2 sm:gap-0">
              <AlertDialogCancel className="rounded-xl font-bold">Cancel</AlertDialogCancel>
              <AlertDialogAction className="rounded-xl font-bold bg-destructive text-destructive-foreground"
                onClick={() => revokeTarget && revokeMutation.mutate(revokeTarget)}
                disabled={revokeMutation.isPending}>
                {revokeMutation.isPending ? "Revoking..." : "Revoke"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </RoleGuard>
  )
}

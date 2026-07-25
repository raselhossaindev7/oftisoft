"use client";

import { useState, useEffect } from "react";
import {
  Settings,
  Mail,
  ShieldCheck,
  Database,
  Key,
  Users,
  Globe,
  Plus,
  Save,
  RefreshCcw,
  MoreVertical,
  RefreshCw,
  CheckCircle2,
  Clock,
  AlertCircle,
  Layout,
  ArrowUpRight,
  Server,
  Shield,
  Trash2,
  Edit,
  Monitor,
  ChevronRight,
  Search,
  UserPlus,
  Lock,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  systemAPI,
  authAPI,
  User as UserType,
  SystemConfig as SystemConfigType,
} from "@/lib/api";
import { RoleGuard } from "@/components/auth/role-guard";

/**
 * System Settings - Admin Restricted
 */
export default function SystemSettingsPage() {
  return (
    <RoleGuard
      allowedRoles={["Admin", "SuperAdmin"]}
      redirectTo="/dashboard/settings/profile"
    >
      <SystemSettingsContent />
    </RoleGuard>
  );
}

function SystemSettingsContent() {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch Global Config
  const { data: config, isLoading: configLoading } = useQuery({
    queryKey: ["system-config"],
    queryFn: () => systemAPI.getConfig(),
  });

  // Fetch Staff
  const { data: staff, isLoading: staffLoading } = useQuery({
    queryKey: ["staff"],
    queryFn: () => systemAPI.getAllStaff(),
  });

  // Fetch API Keys
  const { data: apiKeys, isLoading: apiKeysLoading } = useQuery({
    queryKey: ["api-keys"],
    queryFn: () => systemAPI.getApiKeys(),
  });

  // Fetch Email Templates
  const { data: emailTemplates, isLoading: templatesLoading } = useQuery({
    queryKey: ["email-templates"],
    queryFn: () => systemAPI.getEmailTemplates(),
  });

  // Local form state for config
  const [formState, setFormState] = useState<Partial<SystemConfigType>>({});

  // Staff actions
  const inviteStaffMutation = useMutation({
    mutationFn: (data: { email: string; name: string }) =>
      authAPI.register({
        ...data,
        password: "TemporaryPassword123!",
        phone: "0000000000",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      toast.success("Staff invited.");
    },
  });

  const removeStaffMutation = useMutation({
    mutationFn: (id: string) => systemAPI.removeStaff(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      toast.success("Staff member removed.");
    },
  });

  const updateStaffRoleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) =>
      systemAPI.updateStaffRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      toast.success("Staff role updated.");
    },
  });

  // API Key actions
  const createKeyMutation = useMutation({
    mutationFn: (name: string) => systemAPI.createApiKey(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
      toast.success("API key created.");
    },
  });

  const revokeKeyMutation = useMutation({
    mutationFn: (id: string) => systemAPI.revokeApiKey(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
      toast.success("API key revoked.");
    },
  });

  // Sync form state when data loads
  useEffect(() => {
    if (config) {
      setFormState({
        shopName: config.shopName,
        supportEmail: config.supportEmail,
        description: config.description,
        currency: config.currency,
        timezone: config.timezone,
        dateFormat: config.dateFormat,
        maintenanceMode: config.maintenanceMode,
        passwordPolicy: config.passwordPolicy,
        allowedIps: config.allowedIps,
      });
    }
  }, [config]);

  // Update Config Mutation
  const updateMutation = useMutation({
    mutationFn: (data: Partial<SystemConfigType>) =>
      systemAPI.updateConfig(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["system-config"] });
      toast.success("Settings saved");
    },
    onError: (err: any) => {
      toast.error("Failed to save", {
        description:
          err.response?.data?.message ||
          "An error occurred while saving settings.",
      });
    },
  });

  const handleSync = () => {
    updateMutation.mutate(formState);
  };

  if (configLoading || staffLoading || apiKeysLoading || templatesLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-12 h-auto animate-spin text-primary opacity-20" />
        <p className="text-muted-foreground animate-pulse">
          Loading settings...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20 mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-semibold">
            System Settings
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage platform configuration, staff, and security settings.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="h-9 rounded-lg gap-2"
            onClick={() =>
              toast.info("Reset using your deployment pipeline.")
            }
          >
            <RefreshCcw className="w-4 h-4" /> Reset
          </Button>
          <Button
            onClick={handleSync}
            disabled={updateMutation.isPending}
            className="h-9 rounded-lg gap-2"
          >
            {updateMutation.isPending ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-muted/30 p-1 rounded-lg h-10 w-fit border border-border/50">
          {[
            { value: "general", label: "General", icon: Globe },
            { value: "staff", label: "Staff", icon: Users },
            { value: "email", label: "Email", icon: Mail },
            { value: "api", label: "API Keys", icon: Key },
            { value: "security", label: "Security", icon: ShieldCheck },
          ].map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="rounded-md h-8 gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm font-medium text-xs px-4 transition-all"
            >
              <tab.icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* General Shop Config */}
        <TabsContent
          value="general"
          className="space-y-6"
        >
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="rounded-xl bg-card border border-border/50 overflow-hidden shadow-sm">
                <CardHeader className="p-5 border-b border-border/50 bg-muted/5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <Globe className="w-4 h-4" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-semibold">
                        General
                      </CardTitle>
                      <CardDescription className="text-sm text-muted-foreground">
                        Public-facing information for your marketplace.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-5 space-y-5">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium">
                        Shop Name
                      </Label>
                      <Input
                        value={formState.shopName || config?.shopName || ""}
                        onChange={(e) =>
                          setFormState({
                            ...formState,
                            shopName: e.target.value,
                          })
                        }
                        className="h-9 rounded-lg"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium">
                        Support Email
                      </Label>
                      <Input
                        value={
                          formState.supportEmail || config?.supportEmail || ""
                        }
                        onChange={(e) =>
                          setFormState({
                            ...formState,
                            supportEmail: e.target.value,
                          })
                        }
                        className="h-9 rounded-lg"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">
                      Description
                    </Label>
                    <Textarea
                      rows={3}
                      value={formState.description || config?.description || ""}
                      onChange={(e) =>
                        setFormState({
                          ...formState,
                          description: e.target.value,
                        })
                      }
                      className="rounded-lg text-sm resize-none"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-xl bg-card border border-border/50 overflow-hidden shadow-sm">
                <CardHeader className="p-5 border-b border-border/50 bg-muted/5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <Layout className="w-4 h-4" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-semibold">
                        Localization
                      </CardTitle>
                      <CardDescription className="text-sm text-muted-foreground">
                        Currency, timezone, and date format settings.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-5 grid md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Currency</Label>
                    <Input
                      value={formState.currency || config?.currency || ""}
                      onChange={(e) =>
                        setFormState({ ...formState, currency: e.target.value })
                      }
                      className="h-9 rounded-lg"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Timezone</Label>
                    <Input
                      value={formState.timezone || config?.timezone || ""}
                      onChange={(e) =>
                        setFormState({ ...formState, timezone: e.target.value })
                      }
                      className="h-9 rounded-lg"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Date Format</Label>
                    <Input
                      value={formState.dateFormat || config?.dateFormat || ""}
                      onChange={(e) =>
                        setFormState({
                          ...formState,
                          dateFormat: e.target.value,
                        })
                      }
                      className="h-9 rounded-lg"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="rounded-xl bg-primary/[0.03] border-2 border-primary/20 overflow-hidden shadow-sm">
                <CardHeader className="p-5">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Database className="w-5 h-5 text-primary" /> Deployment
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 pt-0 space-y-4">
                  <p className="text-xs text-muted-foreground">
                    Configuration changes propagate globally after a deployment cycle. Use your CI/CD pipeline to deploy.
                  </p>
                  <Button
                    type="button"
                    className="w-full h-9 rounded-lg text-sm"
                    onClick={() =>
                      toast.info(
                        "Use your deployment pipeline to push config.",
                      )
                    }
                  >
                    Deploy Config
                  </Button>
                </CardContent>
              </Card>

              <Card className="rounded-xl bg-muted/5 border border-border/50 p-5 flex flex-col items-center text-center space-y-4">
                <div className="w-12 h-12 rounded-xl bg-background border border-border/50 flex items-center justify-center text-muted-foreground shadow-sm">
                  <Lock size={20} />
                </div>
                <div className="space-y-1">
                  <h4 className="font-medium text-sm">Admin Mode Active</h4>
                  <p className="text-xs text-muted-foreground">
                    High-level administrative access is enabled.
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Staff & Roles */}
        <TabsContent
          value="staff"
          className="space-y-6"
        >
          <Card className="rounded-xl bg-card border border-border/50 overflow-hidden shadow-sm">
            <CardHeader className="p-5 border-b border-border/50 bg-muted/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base font-semibold">
                  Staff
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground mt-0.5">
                  Manage staff members and their roles.
                </CardDescription>
              </div>
              <Button
                onClick={() => {
                  const email = prompt("Email:");
                  const name = prompt("Name:");
                  if (email && name)
                    inviteStaffMutation.mutate({ email, name });
                }}
                className="h-9 rounded-lg gap-2"
              >
                <UserPlus className="w-4 h-4" /> Invite Staff
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/5 border-border/50">
                    <TableHead className="px-5 text-xs font-medium uppercase text-muted-foreground h-10">
                      User
                    </TableHead>
                    <TableHead className="text-xs font-medium uppercase text-muted-foreground h-10">
                      Role
                    </TableHead>
                    <TableHead className="text-xs font-medium uppercase text-muted-foreground h-10">
                      Status
                    </TableHead>
                    <TableHead className="text-xs font-medium uppercase text-muted-foreground h-10">
                      Last Active
                    </TableHead>
                    <TableHead className="text-right px-5"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staff?.map((staff) => (
                    <TableRow
                      key={staff.id}
                      className="group hover:bg-primary/[0.02] transition-all border-border/50"
                    >
                      <TableCell className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-muted border border-border/50 flex items-center justify-center font-medium text-sm group-hover:bg-primary group-hover:text-white transition-all">
                            {(staff.name || '?').charAt(0)}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-medium text-sm group-hover:text-primary transition-colors">
                              {staff.name || '—'}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {staff.email}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="text-xs font-medium border-primary/30 text-primary bg-primary/5 px-3 h-7 rounded-md"
                        >
                          {staff.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-md w-fit border border-border/30">
                          <div
                            className={cn(
                              "w-2 h-2 rounded-full",
                              staff.isActive
                                ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"
                                : "bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]",
                            )}
                          />
                          <span className="text-xs font-medium">
                            {staff.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(staff.updatedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right px-5">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-primary/10 hover:text-primary"
                            >
                              <MoreVertical size={16} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="rounded-xl bg-card/90 backdrop-blur-xl border border-border/40 shadow-lg p-1 min-w-[140px]"
                          >
                            <DropdownMenuItem
                              onClick={() =>
                                updateStaffRoleMutation.mutate({
                                  id: staff.id,
                                  role: "Admin",
                                })
                              }
                              className="rounded-lg font-medium gap-2 p-2.5 text-xs cursor-pointer hover:bg-primary/10 transition-all"
                            >
                              <Shield size={14} /> Make Admin
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                updateStaffRoleMutation.mutate({
                                  id: staff.id,
                                  role: "Editor",
                                })
                              }
                              className="rounded-lg font-medium gap-2 p-2.5 text-xs cursor-pointer hover:bg-primary/10 transition-all"
                            >
                              <Edit size={14} /> Make Editor
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                removeStaffMutation.mutate(staff.id)
                              }
                              className="rounded-lg font-medium gap-2 p-2.5 text-xs cursor-pointer text-red-500 hover:bg-red-500/10 transition-all"
                            >
                              <Trash2 size={14} /> Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="p-5 border-t border-border/50 bg-muted/5 flex justify-center">
              <Button
                variant="ghost"
                className="text-xs font-medium text-muted-foreground/60 hover:text-primary hover:bg-transparent transition-all"
                onClick={() =>
                  toast.info(
                    "Export not yet available.",
                  )
                }
              >
                Export
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Email Templates Content */}
        <TabsContent
          value="email"
          className="space-y-6"
        >
          <Card className="rounded-xl bg-card border border-border/50 overflow-hidden shadow-sm">
            <CardHeader className="p-5 border-b border-border/50 bg-muted/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base font-semibold">
                  Email Templates
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground mt-0.5">
                  Manage email notification templates.
                </CardDescription>
              </div>
              <Button
                className="h-9 rounded-lg gap-2"
                onClick={() =>
                  toast.info(
                    "Template editor not yet implemented.",
                  )
                }
              >
                <Plus className="w-4 h-4" /> New Template
              </Button>
            </CardHeader>
            <CardContent className="p-5">
              {emailTemplates?.length === 0 ? (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  No email templates yet.
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-3">
                  {emailTemplates?.map((t) => (
                    <Card
                      key={t.id}
                      className="rounded-lg border-border/30 bg-background/50 p-4 flex items-center justify-between group"
                    >
                      <div>
                        <h4 className="font-medium text-sm">{t.name}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {t.subject}
                        </p>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="rounded-lg h-8 w-8"
                        >
                          <Edit size={14} />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="rounded-lg h-8 w-8 text-red-500"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Keys Content */}
        <TabsContent
          value="api"
          className="space-y-6"
        >
          <Card className="rounded-xl bg-card border border-border/50 overflow-hidden shadow-sm">
            <CardHeader className="p-5 border-b border-border/50 bg-muted/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base font-semibold">
                  API Keys
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground mt-0.5">
                  Manage API keys for integrations.
                </CardDescription>
              </div>
              <Button
                onClick={() => {
                  const name = prompt("Key name:");
                  if (name) createKeyMutation.mutate(name);
                }}
                className="h-9 rounded-lg gap-2"
              >
                <Plus className="w-4 h-4" /> Add Key
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/5 border-border/50">
                    <TableHead className="px-5 text-xs font-medium uppercase text-muted-foreground h-10">
                      Name
                    </TableHead>
                    <TableHead className="text-xs font-medium uppercase text-muted-foreground h-10">
                      Key
                    </TableHead>
                    <TableHead className="text-xs font-medium uppercase text-muted-foreground h-10">
                      Status
                    </TableHead>
                    <TableHead className="text-right px-5"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiKeys?.map((key) => (
                    <TableRow key={key.id} className="border-border/50">
                      <TableCell className="px-5 py-4 font-medium text-sm">
                        {key.name}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {(key.key || '—').slice(0, 10)}*****************
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            key.status === "active" ? "default" : "outline"
                          }
                          className="text-xs font-medium"
                        >
                          {key.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right px-5">
                        {key.status === "active" && (
                          <Button
                            variant="ghost"
                            className="text-red-500 font-medium text-xs"
                            onClick={() => revokeKeyMutation.mutate(key.id)}
                          >
                            Revoke
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Core Hardening (Security) Content */}
        <TabsContent
          value="security"
          className="space-y-6"
        >
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="rounded-xl bg-card border border-border/50 p-5 space-y-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h3 className="text-base font-semibold">Access Control</h3>
                  <p className="text-sm text-muted-foreground">
                    Manage access and security settings.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-background/50 border border-border/30 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Maintenance Mode</p>
                    <p className="text-xs text-muted-foreground">
                      Suspend public access temporarily.
                    </p>
                  </div>
                  <Button
                    variant={formState.maintenanceMode ? "default" : "outline"}
                    onClick={() =>
                      setFormState({
                        ...formState,
                        maintenanceMode: !formState.maintenanceMode,
                      })
                    }
                    className="rounded-lg text-xs font-medium h-8"
                  >
                    {formState.maintenanceMode ? "Disable" : "Enable"}
                  </Button>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">
                    Allowed IPs
                  </Label>
                  <Textarea
                    value={formState.allowedIps}
                    onChange={(e) =>
                      setFormState({ ...formState, allowedIps: e.target.value })
                    }
                    className="rounded-lg text-sm"
                    placeholder="127.0.0.1, 192.168.1.1..."
                  />
                </div>
              </div>
            </Card>

            <Card className="rounded-xl bg-card border border-border/50 p-5 space-y-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Lock size={18} />
                </div>
                <div>
                  <h3 className="text-base font-semibold">Password Policy</h3>
                  <p className="text-sm text-muted-foreground">
                    Set password complexity requirements.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {["low", "medium", "high"].map((level) => (
                  <div
                    key={level}
                    onClick={() =>
                      setFormState({
                        ...formState,
                        passwordPolicy: level as any,
                      })
                    }
                    className={cn(
                      "p-4 rounded-lg border cursor-pointer transition-all",
                      formState.passwordPolicy === level
                        ? "bg-primary/10 border-primary"
                        : "bg-background/50 border-border/30 opacity-60",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm capitalize">
                        {level}
                      </span>
                      {formState.passwordPolicy === level && (
                        <CheckCircle2 className="text-primary w-4 h-4" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {level === "low" &&
                        "Minimum 6 characters, no complexity requirements."}
                      {level === "medium" &&
                        "Minimum 8 characters + numeric."}
                      {level === "high" &&
                        "12+ characters + numeric + symbols."}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

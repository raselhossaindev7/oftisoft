"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  MessageSquare,
  ShieldAlert,
  Wallet,
  Calendar,
  MapPin,
  Globe,
  ExternalLink,
  Clock,
  ShoppingBag,
  Star,
  History,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { toast } from "sonner";
import { useUsers } from "@/hooks/useUsers";
import { useAuthStore } from "@/store/useAuthStore";
import { cn } from "@/lib/utils";
import { withRoleProtection } from "@/components/auth/role-guard";

function UserDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const {
    user,
    stats,
    activities,
    isLoading,
    fetchUser,
    updateUser,
    toggleUserStatus,
    deleteUser,
  } = useUsers();
  const currentUserId = useAuthStore((s) => s.user?.id);

  // Dialog States
  const [isEmailOpen, setIsEmailOpen] = useState(false);
  const [isMessageOpen, setIsMessageOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isResettingPwd, setIsResettingPwd] = useState(false);
  const [isChangingRole, setIsChangingRole] = useState(false);
  const [isResetPwdOpen, setIsResetPwdOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [messageContent, setMessageContent] = useState("");

  useEffect(() => {
    if (id) fetchUser(id);
  }, [id, fetchUser]);

  if (isLoading)
    return (
      <div className="p-40 text-center flex flex-col items-center justify-center gap-6">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
          <div className="h-16 w-16 rounded-full border-4 border-primary border-t-transparent animate-spin relative z-10" />
        </div>
        <p className="font-semibold text-primary uppercase animate-pulse">
          Reconstructing Identity...
        </p>
      </div>
    );

  if (!user)
    return (
      <div className="p-40 text-center">
        <h2 className="text-3xl font-semibold opacity-20">User Not Found</h2>
        <Button asChild className="mt-8 rounded-xl font-semibold px-10 h-12 ">
          <Link href="/dashboard/users">Return to Grid</Link>
        </Button>
      </div>
    );

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteUser(user.id);
      router.push("/dashboard/users");
    } catch (error) {
      // Error already handled
    } finally {
      setIsDeleting(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setIsResettingPwd(true);
    try {
      await updateUser(user.id, { password: newPassword });
      setIsResetPwdOpen(false);
      setNewPassword("");
    } catch (error) {
      // Error handled
    } finally {
      setIsResettingPwd(false);
    }
  };

  return (
    <div className="space-y-8  mx-auto pb-20">
      {/* Header / Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-lg bg-muted/20 hover:bg-primary/10 hover:text-primary transition-all"
          >
            <Link href="/dashboard/users">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">User Profile</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'} · ID: {(user.id || '—').slice(0, 8)}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            className="gap-2 rounded-lg h-9 px-4 text-sm border-border/50 hover:bg-muted"
            onClick={() => setIsMessageOpen(true)}
          >
            <MessageSquare className="w-4 h-4" />
            Send Message
          </Button>
          <Button
            className="gap-2 rounded-lg h-9 px-5 text-sm shadow-sm bg-primary hover:bg-primary/90"
            onClick={() => setIsEmailOpen(true)}
          >
            <Mail className="w-4 h-4" />
            Email
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="space-y-6">
          <Card className="border-border/40 overflow-hidden bg-card/40 backdrop-blur-md shadow-sm">
            <div className="h-24 bg-gradient-to-br from-primary/30 to-purple-600/30 relative">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
            </div>
            <CardContent className="relative pt-0 px-6 pb-6">
              <div className="flex flex-col items-center -mt-12 text-center">
                <div className="relative">
                  <Avatar className="h-24 w-24 border-[4px] border-background shadow-xl">
                    <AvatarImage src={user.avatarUrl} />
                    <AvatarFallback className="text-2xl font-semibold bg-primary/10 text-primary">
                      {(user.name || "U")
                        .split(" ")
                        .filter(Boolean)
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  {user.isActive && (
                    <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-green-500 border-[3px] border-background shadow-lg" />
                  )}
                </div>
                <div className="mt-5">
                  <h3 className="text-lg font-semibold leading-tight">
                    {user.name || "—"}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {user.email || "—"}
                  </p>
                  <div className="flex items-center justify-center gap-2 mt-3">
                    <Badge className="bg-primary/10 text-primary border-primary/20 gap-1.5 h-6 px-2.5 font-medium text-xs rounded-md">
                      <Star className="w-3 h-3 fill-primary" /> {user.role}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={cn(
                        "h-6 px-2.5 font-medium text-xs rounded-md border-2 transition-all",
                        user.isActive
                          ? "border-green-500/20 text-green-500 bg-green-500/5 shadow-[0_0_15px_rgba(34,197,94,0.1)]"
                          : "border-muted text-muted opacity-50",
                      )}
                    >
                      {user.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </div>

              <Separator className="my-6 opacity-20" />

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm group">
                  <div className="w-7 h-7 rounded-lg bg-muted/30 flex items-center justify-center transition-colors group-hover:bg-primary/10">
                    <MapPin className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary" />
                  </div>
                  <span className="text-muted-foreground">
                    {user.city || user.state
                      ? `${user.city || ""}${user.city && user.state ? ", " : ""}${user.state || ""}`
                      : "—"}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm group">
                  <div className="w-7 h-7 rounded-lg bg-muted/30 flex items-center justify-center transition-colors group-hover:bg-primary/10">
                    <Globe className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary" />
                  </div>
                  <span className="text-muted-foreground">Account Status</span>
                </div>
                <div className="flex items-center gap-3 text-sm group">
                  <div className="w-7 h-7 rounded-lg bg-muted/30 flex items-center justify-center transition-colors group-hover:bg-primary/10">
                    <Calendar className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary" />
                  </div>
                  <span className="text-muted-foreground">
                    Member Since {new Date(user.createdAt).getFullYear()}
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/10 p-3 flex gap-2">
              <Button
                variant="ghost"
                className="flex-1 text-xs h-9 rounded-lg gap-2 hover:bg-primary/10 hover:text-primary transition-all"
                onClick={() => toggleUserStatus(user.id)}
              >
                <ShieldAlert className="w-3.5 h-3.5" />{" "}
                {user.isActive ? "Deactivate" : "Activate"}
              </Button>
              <Button
                variant="ghost"
                className="flex-1 text-xs h-9 rounded-lg gap-2 text-destructive hover:bg-destructive/10 transition-all"
                onClick={() => setIsDeleteOpen(true)}
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </Button>
            </CardFooter>
          </Card>

          <Card className="border-border/40 bg-card/40 backdrop-blur-md shadow-sm overflow-hidden">
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Account Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-2">
              <div className="flex items-center justify-between p-4 rounded-lg bg-primary/[0.03] border border-primary/10 group hover:bg-primary/[0.06] transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Wallet className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">
                    Lifetime Value
                  </span>
                </div>
                <span className="text-lg font-semibold text-primary leading-none">
                  ${stats?.ltv || "0.00"}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/10 border border-border group hover:bg-muted/20 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-muted/20 flex items-center justify-center">
                    <ShoppingBag className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">
                    Total Orders
                  </span>
                </div>
                <span className="text-lg font-semibold leading-none">
                  {stats?.orderCount || 0}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/10 border border-border group hover:bg-muted/20 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-muted/20 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">
                    Requests
                  </span>
                </div>
                <span className="text-lg font-semibold leading-none">
                  {stats?.ticketCount || 0}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <div className="lg:col-span-2 space-y-8">
          <Tabs defaultValue="activity" className="w-full">
            <TabsList className="bg-muted/30 p-1 rounded-lg h-10 w-fit border border-border/50 backdrop-blur-md mb-6">
              <TabsTrigger
                value="activity"
                className="rounded-md h-full gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm font-medium text-xs uppercase px-5 transition-all"
              >
                <History className="w-3.5 h-3.5" /> Activity
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="rounded-md h-full gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm font-medium text-xs uppercase px-5 transition-all"
              >
                <ShieldAlert className="w-3.5 h-3.5" /> Security
              </TabsTrigger>
            </TabsList>

            <TabsContent value="activity">
              {activities.length > 0 ? (
                <div className="space-y-3">
                  {activities.map((activity, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-lg border border-border/40 bg-card/40 backdrop-blur-md flex items-center justify-between group hover:border-primary/20 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-9 h-9 rounded-lg bg-muted/30 flex items-center justify-center group-hover:bg-primary/5 transition-colors">
                          <Globe className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <div className="text-sm font-medium">
                            Visited: {activity.page}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />{" "}
                            {new Date(activity.timestamp).toLocaleString()} UTC
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-medium text-primary">
                          Active
                        </div>
                        <div className="text-xs font-mono text-muted-foreground/60 mt-0.5">
                          {activity.ip}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-24 text-center rounded-xl border-2 border-dashed border-border/40 bg-muted/5 flex flex-col items-center justify-center gap-5">
                  <div className="w-14 h-14 rounded-xl bg-muted/20 flex items-center justify-center">
                    <History className="w-7 h-7 text-muted-foreground/30" />
                  </div>
                  <div>
                    <h4 className="font-medium text-lg">No results</h4>
                    <p className="text-sm text-muted-foreground max-w-[280px] mx-auto mt-1">
                      No recorded activity for this user yet.
                    </p>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="settings">
              <Card className="border-border/40 overflow-hidden bg-card/40 backdrop-blur-md shadow-sm">
                <CardHeader className="p-6 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg font-semibold">
                        Security & Role
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        Manage user permissions and security settings.
                      </p>
                    </div>
                    <div className="h-9 w-9 rounded-lg bg-amber-500/10 flex items-center justify-center">
                      <ShieldAlert className="w-4 h-4 text-amber-500" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-5 rounded-xl bg-muted/20 border border-border/50 space-y-3">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-3">
                          Role
                        </p>
                        <Select
                          value={user.role}
                          onValueChange={async (value) => {
                            setIsChangingRole(true);
                            try {
                              const updated = await updateUser(user.id, {
                                role: value,
                              });
                              if (user.id === currentUserId && updated?.role) {
                                useAuthStore
                                  .getState()
                                  .setUser({
                                    ...useAuthStore.getState().user!,
                                    role: updated.role,
                                  });
                              }
                            } catch {
                            } finally {
                              setIsChangingRole(false);
                            }
                          }}
                          disabled={isChangingRole}
                        >
                          <SelectTrigger className="rounded-lg h-9 font-medium text-xs border-border/50 bg-background/50">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl p-1">
                            <SelectItem
                              value="Admin"
                              className="rounded-lg font-medium text-sm py-2"
                            >
                              Administrator
                            </SelectItem>
                            <SelectItem
                              value="Editor"
                              className="rounded-lg font-medium text-sm py-2"
                            >
                              Content Editor
                            </SelectItem>
                            <SelectItem
                              value="Support"
                              className="rounded-lg font-medium text-sm py-2"
                            >
                              Support Agent
                            </SelectItem>
                            <SelectItem
                              value="Viewer"
                              className="rounded-lg font-medium text-sm py-2"
                            >
                              Regular Viewer
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="p-5 rounded-xl bg-muted/20 border border-border/50 flex flex-col justify-center gap-3">
                      <p className="text-xs font-medium text-muted-foreground">
                        Multi-Factor Auth
                      </p>
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            "w-2.5 h-2.5 rounded-full shadow-[0_0_8px]",
                            user.isTwoFactorEnabled
                              ? "bg-green-500 shadow-green-500/50"
                              : "bg-muted shadow-muted-foreground/20",
                          )}
                        />
                        <Badge
                          variant={
                            user.isTwoFactorEnabled ? "default" : "secondary"
                          }
                          className="rounded-md h-7 px-3 font-medium text-xs"
                        >
                          {user.isTwoFactorEnabled
                            ? "Enabled"
                            : "Disabled"}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 p-5 rounded-xl bg-muted/20 border border-border/50 flex flex-col justify-center gap-3">
                      <p className="text-xs font-medium text-muted-foreground">
                        Email Verification
                      </p>
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            "w-2.5 h-2.5 rounded-full shadow-[0_0_8px]",
                            user.isEmailVerified
                              ? "bg-primary shadow-primary/50"
                              : "bg-muted shadow-muted-foreground/20",
                          )}
                        />
                        <Badge
                          variant={
                            user.isEmailVerified ? "default" : "secondary"
                          }
                          className="rounded-md h-7 px-3 font-medium text-xs"
                        >
                          {user.isEmailVerified
                            ? "Verified"
                            : "Pending"}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex-1 p-5 rounded-xl bg-primary/5 border border-primary/20 flex flex-col justify-center gap-3">
                      <p className="text-xs font-medium text-primary">
                        Password
                      </p>
                      <Button
                        variant="outline"
                        className="h-9 rounded-lg text-xs font-medium border-primary/20 text-primary hover:bg-primary hover:text-white transition-all"
                        onClick={() => setIsResetPwdOpen(true)}
                      >
                        Reset Password
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* DIALOGS */}

      {/* Email Dialog */}
      <Dialog
        open={isEmailOpen}
        onOpenChange={(open) => {
          setIsEmailOpen(open);
          if (!open) {
            setEmailSubject("");
            setEmailBody("");
          }
        }}
      >
        <DialogContent className="sm:max-w-lg rounded-xl border-border/40 bg-card shadow-lg p-0 flex flex-col max-h-[85vh]">
          <DialogHeader className="p-6 pb-4 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
              <Mail className="w-5 h-5 text-primary" />
            </div>
            <DialogTitle className="text-lg font-semibold">
              Send Email
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Send a message to <span className="font-medium text-foreground">{user.email}</span>
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              toast.success(`Email sent to ${user.email}`);
              setIsEmailOpen(false);
              setEmailSubject("");
              setEmailBody("");
            }}
            className="flex-1 overflow-y-auto px-6 space-y-4 pb-4"
            data-lenis-prevent
          >
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Subject</Label>
              <Input
                placeholder="Re: Account Update"
                className="rounded-lg h-9"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Message</Label>
              <Textarea
                placeholder="Type your message here..."
                className="rounded-lg min-h-[120px] resize-none"
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
              />
            </div>
            <DialogFooter className="gap-2">
              <Button
                variant="ghost"
                className="rounded-lg h-9 px-5"
                type="button"
                onClick={() => setIsEmailOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="rounded-lg h-9 px-6 shadow-sm"
                type="submit"
                disabled={!emailBody.trim()}
              >
                Send
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Message Dialog */}
      <Dialog
        open={isMessageOpen}
        onOpenChange={(open) => {
          setIsMessageOpen(open);
          if (!open) setMessageContent("");
        }}
      >
        <DialogContent className="sm:max-w-lg rounded-xl border-border/40 bg-card shadow-lg p-0 flex flex-col max-h-[85vh]">
          <DialogHeader className="p-6 pb-4 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center mb-3">
              <MessageSquare className="w-5 h-5 text-purple-500" />
            </div>
            <DialogTitle className="text-lg font-semibold">
              Send Message
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Send a notification to {user.name || "this user"}.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              toast.success(`Notification sent to ${user.name}`);
              setIsMessageOpen(false);
              setMessageContent("");
            }}
            className="flex-1 overflow-y-auto px-6 space-y-4 pb-4"
            data-lenis-prevent
          >
            <Textarea
              placeholder="What's on your mind?"
              className="rounded-lg min-h-[80px] resize-none"
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
            />
            <DialogFooter>
              <Button
                className="w-full rounded-lg h-9 shadow-sm bg-purple-600 hover:bg-purple-700"
                type="submit"
                disabled={!messageContent.trim()}
              >
                Send
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={isResetPwdOpen} onOpenChange={setIsResetPwdOpen}>
        <DialogContent className="sm:max-w-lg rounded-xl border-border/40 bg-card shadow-lg p-0 flex flex-col max-h-[85vh]">
          <DialogHeader className="p-6 pb-4 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center mb-3">
              <ShieldAlert className="w-5 h-5 text-amber-500" />
            </div>
            <DialogTitle className="text-lg font-semibold">
              Reset Password
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Set a new password for this user. The user will need to use the new password on next login.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleResetPassword();
            }}
            className="flex-1 overflow-y-auto px-6 space-y-4 pb-4"
            data-lenis-prevent
          >
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">New Password</Label>
              <Input
                type="password"
                placeholder="••••••••"
                className="rounded-lg h-9"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <DialogFooter className="gap-2">
              <Button
                variant="ghost"
                className="rounded-lg h-9"
                type="button"
                onClick={() => setIsResetPwdOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="rounded-lg h-9 bg-amber-600 hover:bg-amber-700 shadow-sm"
                type="submit"
                disabled={isResettingPwd}
              >
                {isResettingPwd ? "Updating..." : "Update Password"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-md rounded-xl border-border/40 bg-card shadow-lg p-0 flex flex-col max-h-[85vh]">
          <DialogHeader className="p-6 pb-4 shrink-0">
            <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center mb-3">
              <Trash2 className="w-6 h-6 text-destructive" />
            </div>
            <DialogTitle className="text-lg font-semibold">
              Delete User
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Are you sure? This will permanently delete all data for{" "}
              <span className="font-medium text-foreground">
                {user.name || "this user"}
              </span>
              . This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 pb-4" data-lenis-prevent>
            <DialogFooter className="flex gap-2 sm:gap-2">
              <Button
                variant="outline"
                className="flex-1 rounded-lg h-9"
                onClick={() => setIsDeleteOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 rounded-lg h-9 bg-destructive hover:bg-destructive/90 shadow-sm"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default withRoleProtection(UserDetailsPage, ["Admin", "SuperAdmin"]);

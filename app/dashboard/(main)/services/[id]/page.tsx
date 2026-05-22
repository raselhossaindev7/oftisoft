"use client";
import { AnimatedDiv, AnimatePresence } from "@/lib/animated";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle2,
  Users,
  Briefcase,
  Plus,
  MoreHorizontal,
  MessageSquare,
  ExternalLink,
  UserPlus,
  Target,
  Zap,
  History,
  Edit3,
  Trash2,
  X,
  AlertCircle,
  Send,
  Upload,
  Download,
  Flag,
  ChevronRight,
  GripVertical,
  Loader2,
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PaymentModal } from "@/components/projects/payment-modal";
import { useProjects } from "@/hooks/useProjects";
import { projectsAPI, milestonesAPI, uploadFile } from "@/lib/api";
import { disputesAPI } from "@/lib/api/domains/disputes";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Edit Project Dialog
const EditProjectDialog = ({ isOpen, onClose, project }: any) => {
  const { updateProject, isUpdating } = useProjects();
  const [formData, setFormData] = useState({
    title: project?.title || "",
    client: project?.client || "",
    description: project?.description || "",
    status: project?.status || "",
    progress: project?.progress || 0,
    budget: project?.budget || 0,
    members: project?.members || 1,
    dueDate: project?.dueDate
      ? new Date(project.dueDate).toISOString().split("T")[0]
      : "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    updateProject(
      project.id,
      {
        ...formData,
        budget: parseFloat(formData.budget.toString()),
        progress: parseInt(formData.progress.toString()),
        members: parseInt(formData.members.toString()),
      },
      {
        onSuccess: () => {
          onClose();
        },
      },
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <AnimatedDiv
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-card w-full max-w-2xl rounded-3xl border border-border shadow-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
          <div>
            <h3 className="text-xl font-bold">Edit Service Project</h3>
            <p className="text-sm text-muted-foreground">
              Update project details
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-6 max-h-[70vh] overflow-y-auto"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Project Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="h-12 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client">Client</Label>
              <Input
                id="client"
                value={formData.client}
                onChange={(e) =>
                  setFormData({ ...formData, client: e.target.value })
                }
                className="h-12 rounded-xl"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="min-h-[100px] rounded-xl"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger className="h-12 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Planning">Planning</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="On Hold">On Hold</SelectItem>
                  <SelectItem value="Review">Review</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Delayed">Delayed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="progress">Progress (%)</Label>
              <Input
                id="progress"
                type="number"
                min="0"
                max="100"
                value={formData.progress}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    progress: parseInt(e.target.value) || 0,
                  })
                }
                className="h-12 rounded-xl"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="budget">Budget</Label>
              <Input
                id="budget"
                type="number"
                value={formData.budget}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    budget: parseFloat(e.target.value) || 0,
                  })
                }
                className="h-12 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="members">Team Size</Label>
              <Input
                id="members"
                type="number"
                min="1"
                value={formData.members}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    members: parseInt(e.target.value) || 1,
                  })
                }
                className="h-12 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Deadline</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData({ ...formData, dueDate: e.target.value })
                }
                className="h-12 rounded-xl"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-border rounded-xl font-bold hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="flex-1 px-4 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isUpdating ? "Updating..." : "Save Changes"}
            </button>
          </div>
        </form>
      </AnimatedDiv>
    </div>
  );
};

// Delete Confirmation Dialog
const DeleteDialog = ({ isOpen, onClose, onConfirm, projectTitle }: any) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <AnimatedDiv
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-card w-full max-w-md rounded-3xl border border-border shadow-2xl overflow-hidden"
      >
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Delete Project</h3>
              <p className="text-sm text-muted-foreground">
                This action cannot be undone
              </p>
            </div>
          </div>
          <p className="text-sm">
            Are you sure you want to delete{" "}
            <span className="font-bold">"{projectTitle}"</span>? All project
            data will be permanently removed.
          </p>
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-border rounded-xl font-bold hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors"
            >
              Delete Project
            </button>
          </div>
        </div>
      </AnimatedDiv>
    </div>
  );
};

export default function ServiceOrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const queryClient = useQueryClient();
  const { project, isLoading, deleteProject, isDeleting, updateProject, updatePaymentStatus } =
    useProjects(id);
  const { user } = useAuth();

  const { data: milestones = [], refetch: refetchMilestones } = useQuery({
    queryKey: ['milestones', id],
    queryFn: () => milestonesAPI.getByProject(id),
    enabled: !!id,
  });

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [isPostUpdateOpen, setIsPostUpdateOpen] = useState(false);
  const [updateMessage, setUpdateMessage] = useState("");
  const [isPostingUpdate, setIsPostingUpdate] = useState(false);
  const [isRevisionDialogOpen, setIsRevisionDialogOpen] = useState(false);
  const [revisionDescription, setRevisionDescription] = useState("");
  const [isMilestoneDialogOpen, setIsMilestoneDialogOpen] = useState(false);
  const [milestoneForm, setMilestoneForm] = useState({ title: "", description: "", dueDate: "" });
  const [deliverFiles, setDeliverFiles] = useState("");
  const [isDeliverDialogOpen, setIsDeliverDialogOpen] = useState(false);
  const [isDisputeDialogOpen, setIsDisputeDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isRequirementsDialogOpen, setIsRequirementsDialogOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");
  const [disputeDescription, setDisputeDescription] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [requirementsText, setRequirementsText] = useState(
    project?.requirements ? JSON.stringify(project.requirements, null, 2) : ""
  );
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingFile(true);
    try {
      const result = await uploadFile(file);
      setDeliverFiles(prev => prev ? prev + "\n" + result.url : result.url);
      toast.success("File uploaded");
    } catch {
      toast.error("Upload failed");
    } finally {
      setIsUploadingFile(false);
    }
  };

  const handlePaymentComplete = (projectId: string) => {
    updatePaymentStatus(projectId, "Paid");
    setSelectedProject(null);
  };

  const invalidateProject = () => {
    queryClient.invalidateQueries({ queryKey: ['projects', id] });
    queryClient.invalidateQueries({ queryKey: ['projects'] });
  };

  const deliverMutation = useMutation({
    mutationFn: (files: string[]) => projectsAPI.deliverProject(id, files),
    onSuccess: () => {
      invalidateProject();
      toast.success("Project delivered to client!");
      setIsDeliverDialogOpen(false);
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || "Failed to deliver"),
  });

  const acceptDeliveryMutation = useMutation({
    mutationFn: () => projectsAPI.acceptDelivery(id),
    onSuccess: () => {
      invalidateProject();
      toast.success("Delivery accepted! Project completed.");
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || "Failed to accept"),
  });

  const revisionMutation = useMutation({
    mutationFn: (reason: string) => projectsAPI.requestRevision(id, reason),
    onSuccess: () => {
      invalidateProject();
      toast.success("Revision request submitted.");
      setIsRevisionDialogOpen(false);
      setRevisionDescription("");
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || "Failed to request revision"),
  });

  const disputeMutation = useMutation({
    mutationFn: (data: { reason: string; description?: string; projectId: string }) =>
      disputesAPI.create(data),
    onSuccess: () => {
      toast.success("Dispute raised. Admin will review it.");
      setIsDisputeDialogOpen(false);
      setDisputeReason("");
      setDisputeDescription("");
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || "Failed to raise dispute"),
  });

  const cancelMutation = useMutation({
    mutationFn: (reason: string) => projectsAPI.cancelProject(id, reason),
    onSuccess: () => {
      invalidateProject();
      toast.success("Project cancelled");
      setIsCancelDialogOpen(false);
      setCancelReason("");
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || "Failed to cancel"),
  });

  const requirementsMutation = useMutation({
    mutationFn: (requirements: any) => projectsAPI.setRequirements(id, requirements),
    onSuccess: () => {
      invalidateProject();
      toast.success("Requirements saved");
      setIsRequirementsDialogOpen(false);
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || "Failed to save requirements"),
  });

  const createMilestoneMutation = useMutation({
    mutationFn: (data: { title: string; description?: string; dueDate?: string }) =>
      milestonesAPI.create({ ...data, projectId: id }),
    onSuccess: () => {
      refetchMilestones();
      setIsMilestoneDialogOpen(false);
      setMilestoneForm({ title: "", description: "", dueDate: "" });
      toast.success("Milestone added");
    },
    onError: () => toast.error("Failed to add milestone"),
  });

  const updateMilestoneMutation = useMutation({
    mutationFn: ({ milestoneId, data }: { milestoneId: string; data: any }) =>
      milestonesAPI.update(milestoneId, data),
    onSuccess: () => {
      refetchMilestones();
      toast.success("Milestone updated");
    },
    onError: () => toast.error("Failed to update milestone"),
  });

  const deleteMilestoneMutation = useMutation({
    mutationFn: (milestoneId: string) => milestonesAPI.delete(milestoneId),
    onSuccess: () => {
      refetchMilestones();
      toast.success("Milestone removed");
    },
    onError: () => toast.error("Failed to remove milestone"),
  });

  const handleDeliver = () => {
    const files = deliverFiles.split("\n").map(s => s.trim()).filter(Boolean);
    if (files.length === 0) { toast.error("Add at least one file URL or path"); return; }
    deliverMutation.mutate(files);
  };

  const isStaff = ["SuperAdmin", "Admin", "Editor"].includes(user?.role || "");
  const isOwner = project?.userId === user?.id;
  const canEdit = isStaff || isOwner;

  const handlePostUpdate = async () => {
    if (!updateMessage.trim() || !project) return;
    setIsPostingUpdate(true);
    updateProject(
      id,
      {
        description: `${project.description}\n\n---\n**Update:** ${updateMessage}`,
      },
      {
        onSuccess: () => {
          toast.success("Status update posted");
          setUpdateMessage("");
          setIsPostUpdateOpen(false);
        },
        onError: () => {
          toast.error("Failed to post update");
        },
        onSettled: () => {
          setIsPostingUpdate(false);
        },
      },
    );
  };

  const handleDelete = () => {
    deleteProject(id, {
      onSuccess: () => {
        router.push("/dashboard/services");
      },
    });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not set";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Progress":
        return "bg-blue-500/10 text-blue-500";
      case "Completed":
        return "bg-green-500/10 text-green-500";
      case "Planning":
        return "bg-orange-500/10 text-orange-500";
      case "On Hold":
        return "bg-purple-500/10 text-purple-500";
      case "Review":
        return "bg-amber-500/10 text-amber-500";
      case "Delayed":
        return "bg-red-500/10 text-red-500";
      case "Cancelled":
        return "bg-red-500/10 text-red-500 line-through";
      default:
        return "bg-muted/10 text-muted-foreground";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <AlertCircle className="w-16 h-16 text-muted-foreground opacity-20" />
        <h2 className="text-2xl font-bold">Service Project Not Found</h2>
        <p className="text-muted-foreground">
          The project you're looking for doesn't exist or has been removed.
        </p>
        <Button asChild>
          <Link href="/dashboard/services/my-requests">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Projects
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8  mx-auto pb-20">
      {/* Header / Primary Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon" className="rounded-full">
            <Link href="/dashboard/services/my-requests">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-semibold">{project.title}</h1>
              <Badge
                className={`${getStatusColor(project.status)} border-none uppercase text-sm`}
              >
                {project.status}
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm flex items-center gap-2">
              <Briefcase className="w-3 h-3" /> Client: {project.client} • ID:{" "}
              {(project.id || '—').substring(0, 8)}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            className="gap-2 rounded-xl h-11"
            onClick={() => setIsEditOpen(true)}
          >
            <Edit3 className="w-4 h-4" />
            Edit Project
          </Button>
          <Button
            variant="outline"
            className="gap-2 rounded-xl h-11 text-red-500 border-red-500/20 hover:bg-red-500/10"
            onClick={() => setIsDeleteOpen(true)}
            disabled={isDeleting}
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Tracking Area */}
        <div className="lg:col-span-2 space-y-8">
          {/* Progress Overview */}
          <Card className="border-border/50 bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader>
              <div className="flex justify-between items-end mb-2">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Target className="w-5 h-5 text-primary" /> Delivery Progress
                </CardTitle>
                <span className="text-2xl font-semibold text-primary">
                  {project.progress}%
                </span>
              </div>
              <Progress value={project.progress} className="h-3" />
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {[
                {
                  label: "Deadline",
                  value: formatDate(project.dueDate),
                  icon: Calendar,
                },
                {
                  label: "Budget",
                  value: project.budget
                    ? `$${project.budget.toLocaleString()}`
                    : "Not set",
                  icon: Briefcase,
                },
                { label: "Type", value: "Custom Service", icon: Zap },
                {
                  label: "Team",
                  value: `${project.members} ${project.members === 1 ? "Member" : "Members"}`,
                  icon: Users,
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="p-4 rounded-2xl bg-background/50 border border-border/50"
                >
                  <p className="text-sm text-muted-foreground uppercase font-semibold mb-1">
                    {stat.label}
                  </p>
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <stat.icon className="w-3 h-3 text-primary" />
                    {stat.value}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Project Description */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Project Description</CardTitle>
              <CardDescription>
                Service requirements and objectives
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {project.description ||
                  "No description provided for this project."}
              </p>
            </CardContent>
          </Card>

          {/* Requirements */}
          {project?.requirements && (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" /> Requirements
                  </CardTitle>
                  <CardDescription>Project specifications from the client</CardDescription>
                </div>
                {isStaff && (
                  <Button size="sm" variant="outline" className="rounded-xl" onClick={() => { setRequirementsText(JSON.stringify(project.requirements, null, 2)); setIsRequirementsDialogOpen(true); }}>
                    <Edit3 className="w-3 h-3 mr-1" /> Edit
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-sans leading-relaxed">
                  {typeof project.requirements === 'string'
                    ? project.requirements
                    : JSON.stringify(project.requirements, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}

          {/* Project Timeline */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <History className="w-5 h-5 text-primary" />
                Project Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-4 rounded-xl bg-muted/20 border border-border/50">
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase">
                    Created
                  </p>
                  <p className="font-bold">{formatDate(project.createdAt)}</p>
                </div>
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              </div>
              <div className="flex justify-between items-center p-4 rounded-xl bg-muted/20 border border-border/50">
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase">
                    Last Updated
                  </p>
                  <p className="font-bold">{formatDate(project.updatedAt)}</p>
                </div>
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div className="flex justify-between items-center p-4 rounded-xl bg-primary/5 border border-primary/20">
                <div>
                  <p className="text-xs font-bold text-primary uppercase">
                    Deadline
                  </p>
                  <p className="font-bold">{formatDate(project.dueDate)}</p>
                </div>
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              {project.completedAt && (
                <div className="flex justify-between items-center p-4 rounded-xl bg-green-500/5 border border-green-500/20">
                  <div>
                    <p className="text-xs font-bold text-green-500 uppercase">Completed</p>
                    <p className="font-bold">{formatDate(project.completedAt)}</p>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                </div>
              )}
              {project.cancelledAt && (
                <div className="flex justify-between items-center p-4 rounded-xl bg-red-500/5 border border-red-500/20">
                  <div>
                    <p className="text-xs font-bold text-red-500 uppercase">Cancelled</p>
                    <p className="font-bold">{formatDate(project.cancelledAt)}</p>
                  </div>
                  <X className="w-5 h-5 text-red-500" />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Milestones */}
          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Flag className="w-5 h-5 text-primary" />
                Milestones
              </CardTitle>
              {isStaff && (
                <Button size="sm" variant="outline" className="rounded-xl gap-1" onClick={() => setIsMilestoneDialogOpen(true)}>
                  <Plus className="w-4 h-4" /> Add Milestone
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              {milestones.length > 0 ? milestones.map((m: any, i: number) => (
                <div key={m.id} className="flex items-start gap-3 p-4 rounded-xl bg-muted/20 border border-border/50 group">
                  <div className="flex flex-col items-center gap-1 pt-0.5">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      m.status === 'completed' ? 'bg-green-500 border-green-500' :
                      m.status === 'in_progress' ? 'border-blue-500' :
                      m.status === 'review' ? 'border-amber-500' :
                      'border-muted-foreground/30'
                    }`}>
                      {m.status === 'completed' && <CheckCircle2 className="w-3 h-3 text-white" />}
                    </div>
                    {i < milestones.length - 1 && <div className="w-0.5 h-8 bg-border" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className={`font-semibold text-sm ${m.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                        {m.title}
                      </h4>
                      <div className="flex items-center gap-1 shrink-0">
                        <Badge variant="outline" className={`text-[10px] h-5 px-1.5 ${
                          m.status === 'pending' ? 'text-muted-foreground' :
                          m.status === 'in_progress' ? 'text-blue-500 border-blue-500/20' :
                          m.status === 'review' ? 'text-amber-500 border-amber-500/20' :
                          'text-green-500 border-green-500/20'
                        }`}>
                          {m.status === 'in_progress' ? 'In Progress' : m.status}
                        </Badge>
                        {isStaff && (
                          <div className="flex gap-0.5">
                            {m.status !== 'completed' && (
                              <button className="p-1 hover:bg-muted rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => updateMilestoneMutation.mutate({
                                  milestoneId: m.id,
                                  data: { status: m.status === 'pending' ? 'in_progress' : m.status === 'in_progress' ? 'review' : 'completed' }
                                })}>
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            )}
                            <button className="p-1 hover:bg-destructive/10 rounded opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                              onClick={() => deleteMilestoneMutation.mutate(m.id)}>
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    {m.description && <p className="text-xs text-muted-foreground mt-0.5">{m.description}</p>}
                    {m.dueDate && <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(m.dueDate).toLocaleDateString()}</p>}
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  {isStaff ? "Add milestones to track project progress." : "No milestones defined yet."}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Delivery Files */}
          {project?.deliveryFiles && project.deliveryFiles.length > 0 && (
            <Card className="border-green-500/20 bg-green-500/5">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Download className="w-5 h-5 text-green-500" />
                  Delivered Files
                </CardTitle>
                <CardDescription>Files delivered by the development team</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {(Array.isArray(project.deliveryFiles) ? project.deliveryFiles : []).map((file: string, i: number) => (
                  <a key={i} href={file} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl bg-background/50 border border-border/50 hover:border-green-500/30 transition-colors group">
                    <Download className="w-4 h-4 text-green-500" />
                    <span className="flex-1 text-sm font-medium truncate">{file.split("/").pop() || file}</span>
                    <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Delivery Status Actions */}
          {project?.status === "Review" && (isOwner || isStaff) && (
            <Card className="border-amber-500/20 bg-amber-500/5">
              <CardContent className="p-6 text-center space-y-4">
                <CheckCircle2 className="w-10 h-10 text-amber-500 mx-auto" />
                <div>
                  <h3 className="font-bold text-lg">Project Delivered for Review</h3>
                  <p className="text-sm text-muted-foreground">Please review the delivered files and accept or request changes.</p>
                </div>
                <div className="flex justify-center gap-3">
                  {isOwner && (
                    <Button onClick={() => acceptDeliveryMutation.mutate()} disabled={acceptDeliveryMutation.isPending}
                      className="rounded-xl gap-2 bg-green-500 hover:bg-green-600">
                      <CheckCircle2 className="w-4 h-4" /> Accept & Complete
                    </Button>
                  )}
                  {isOwner && (project.revisionCount ?? 0) < (project.maxRevisions ?? 0) && (
                    <Button variant="outline" className="rounded-xl gap-2 border-amber-500/30 text-amber-500"
                      onClick={() => setIsRevisionDialogOpen(true)}>
                      <History className="w-4 h-4" /> Request Revision ({project.revisionCount}/{project.maxRevisions})
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Milestone Dialog */}
          <Dialog open={isMilestoneDialogOpen} onOpenChange={setIsMilestoneDialogOpen}>
            <DialogContent className="sm:max-w-md rounded-[2rem]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><Plus className="w-5 h-5 text-primary" /> Add Milestone</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={milestoneForm.title} onChange={e => setMilestoneForm({ ...milestoneForm, title: e.target.value })} placeholder="e.g., Design Approval" className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>Description (optional)</Label>
                  <Textarea value={milestoneForm.description} onChange={e => setMilestoneForm({ ...milestoneForm, description: e.target.value })} className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>Due Date (optional)</Label>
                  <Input type="date" value={milestoneForm.dueDate} onChange={e => setMilestoneForm({ ...milestoneForm, dueDate: e.target.value })} className="rounded-xl" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setIsMilestoneDialogOpen(false)}>Cancel</Button>
                <Button onClick={() => createMilestoneMutation.mutate(milestoneForm)} disabled={!milestoneForm.title || createMilestoneMutation.isPending}>
                  {createMilestoneMutation.isPending ? "Adding..." : "Add Milestone"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Sidebar Context */}
        <div className="space-y-8">
          {/* Quick Actions */}
          <Card className="border-border/50 shadow-xl shadow-primary/5">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full rounded-xl gap-2 font-bold h-11"
                onClick={() => router.push("/dashboard/messages")}
              >
                <MessageSquare className="w-4 h-4" />
                Team Chat
              </Button>
              {isStaff && (
                <Button
                  variant="outline"
                  className="w-full rounded-xl gap-2 font-bold h-11 text-green-500 border-green-500/20 hover:bg-green-500/10"
                  onClick={() => setIsDeliverDialogOpen(true)}
                >
                  <Upload className="w-4 h-4" />
                  Deliver Files
                </Button>
              )}
              <Button
                variant="outline"
                className="w-full rounded-xl gap-2 font-bold h-11"
                onClick={() => setIsEditOpen(true)}
              >
                <Edit3 className="w-4 h-4" />
                Edit Details
              </Button>
              <Button
                variant="outline"
                className="w-full rounded-xl gap-2 font-bold h-11"
                onClick={() => setIsPostUpdateOpen(true)}
              >
                <History className="w-4 h-4" />
                Post Update
              </Button>
              {(isOwner) && project?.status !== "Completed" && project?.status !== "Cancelled" && (
                <Button
                  variant="outline"
                  className="w-full rounded-xl gap-2 font-bold h-11 text-amber-500 border-amber-500/20 hover:bg-amber-500/10"
                  onClick={() => setIsRevisionDialogOpen(true)}
                  disabled={(project?.revisionCount ?? 0) >= (project?.maxRevisions ?? 0)}
                >
                  <History className="w-4 h-4" />
                  Request Revision {project?.revisionCount != null && project?.revisionCount > 0 && `(${(project.revisionCount ?? 0)}/${(project.maxRevisions ?? 0)})`}
                </Button>
              )}
              {isOwner && project?.status !== "Completed" && project?.status !== "Cancelled" && (
                <Button
                  variant="outline"
                  className="w-full rounded-xl gap-2 font-bold h-11 text-red-500 border-red-500/20 hover:bg-red-500/10"
                  onClick={() => setIsDisputeDialogOpen(true)}
                >
                  <Flag className="w-4 h-4" />
                  Raise Dispute
                </Button>
              )}
              {isStaff && project?.status !== "Completed" && project?.status !== "Cancelled" && (
                <Button
                  variant="outline"
                  className="w-full rounded-xl gap-2 font-bold h-11 text-destructive border-destructive/20 hover:bg-destructive/10"
                  onClick={() => setIsCancelDialogOpen(true)}
                >
                  <X className="w-4 h-4" />
                  Cancel Project
                </Button>
              )}
              {isOwner && (
                <Button
                  variant="outline"
                  className="w-full rounded-xl gap-2 font-bold h-11"
                  onClick={() => { setRequirementsText(project?.requirements ? JSON.stringify(project.requirements, null, 2) : ""); setIsRequirementsDialogOpen(true); }}
                >
                  <Edit3 className="w-4 h-4" />
                  {project?.requirements ? "Edit Requirements" : "Add Requirements"}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Customer Profile Quick View */}
          <Card className="border-border/50 overflow-hidden">
            <CardHeader className="bg-muted/30">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                Client Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border border-border">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {project.client?.[0] || "C"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-bold">{project.client}</p>
                  <p className="text-sm text-primary font-mono font-bold">
                    CLIENT ACCOUNT
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Budget</span>
                  <span className="font-bold">
                    {project.budget
                      ? `$${project.budget.toLocaleString()}`
                      : "Not set"}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Payment Status</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`h-5 text-xs ${(project.paymentStatus === "Unpaid" || project.paymentStatus === "pending") ? "text-red-500 border-red-500/20" : ""}`}>
                      {project.paymentStatus || "Pending"}
                    </Badge>
                    {(project.paymentStatus === "Unpaid" || project.paymentStatus === "pending") && (
                      <Button size="sm" className="h-6 text-[10px] rounded-lg px-2" onClick={() => setSelectedProject(project)}>
                        Pay Now
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Project Stats */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                Project Stats
                <Badge
                  variant="secondary"
                  className="h-5 text-xs font-semibold"
                >
                  LIVE
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center p-3 rounded-xl bg-muted/20 border border-border/50">
                <span className="text-xs font-bold">Progress</span>
                <span className="text-xs font-semibold text-primary">
                  {project.progress}%
                </span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-muted/20 border border-border/50">
                <span className="text-xs font-bold">Team Size</span>
                <span className="text-xs font-semibold text-primary">
                  {project.members}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-muted/20 border border-border/50">
                <span className="text-xs font-bold">Status</span>
                <span className="text-xs font-semibold text-primary capitalize">
                  {project.status}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Dialog */}
      <AnimatePresence>
        {isEditOpen && (
          <EditProjectDialog
            isOpen={isEditOpen}
            onClose={() => setIsEditOpen(false)}
            project={project}
          />
        )}
      </AnimatePresence>

      {/* Post Update Dialog */}
      <Dialog
        open={isPostUpdateOpen}
        onOpenChange={(open) => {
          setIsPostUpdateOpen(open);
          if (!open) setUpdateMessage("");
        }}
      >
        <DialogContent className="sm:max-w-lg rounded-[2rem] border-border/50">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="w-5 h-5 text-primary" /> Post Status Update
            </DialogTitle>
            <DialogDescription>
              Share a progress update with the project team.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="What's the latest update on this project?"
              className="min-h-[120px] rounded-xl resize-none"
              value={updateMessage}
              onChange={(e) => setUpdateMessage(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              className="rounded-xl"
              onClick={() => setIsPostUpdateOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="rounded-xl gap-2"
              onClick={handlePostUpdate}
              disabled={!updateMessage.trim() || isPostingUpdate}
            >
              <Send className="w-4 h-4" />
              {isPostingUpdate ? "Posting..." : "Post Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deliver Files Dialog */}
      <Dialog open={isDeliverDialogOpen} onOpenChange={setIsDeliverDialogOpen}>
        <DialogContent className="sm:max-w-lg rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Upload className="w-5 h-5 text-green-500" /> Deliver Files</DialogTitle>
            <DialogDescription>Upload files or add URLs to deliver to the client.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl gap-2"
                disabled={isUploadingFile}
                onClick={() => document.getElementById("file-upload-input")?.click()}
              >
                {isUploadingFile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                Upload File
              </Button>
              <input
                id="file-upload-input"
                type="file"
                className="hidden"
                onChange={handleFileUpload}
              />
              <span className="text-xs text-muted-foreground">Or paste URLs below</span>
            </div>
            <Textarea
              placeholder={`https://example.com/files/project-v1.zip\nhttps://example.com/docs/specs.pdf`}
              className="min-h-[120px] rounded-xl font-mono text-sm"
              value={deliverFiles}
              onChange={e => setDeliverFiles(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Project will be marked as "Review" and client will be notified.</p>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDeliverDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleDeliver} disabled={!deliverFiles.trim() || deliverMutation.isPending} className="bg-green-500 hover:bg-green-600 gap-2">
              {deliverMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              Deliver to Client
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revision Request Dialog */}
      <Dialog
        open={isRevisionDialogOpen}
        onOpenChange={(open) => {
          setIsRevisionDialogOpen(open);
          if (!open) setRevisionDescription("");
        }}
      >
        <DialogContent className="sm:max-w-lg rounded-[2rem] border-border/50">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="w-5 h-5 text-amber-500" /> Request Revision
            </DialogTitle>
            <DialogDescription>
              Describe what changes or fixes you need for the current
              deliverable.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Describe the revision needed. Be specific about what should be changed or improved..."
              className="min-h-[150px] rounded-xl resize-none"
              value={revisionDescription}
              onChange={(e) => setRevisionDescription(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Your project status will be updated to &quot;Review&quot; once
              submitted.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              className="rounded-xl"
              onClick={() => setIsRevisionDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="rounded-xl gap-2 bg-amber-500 hover:bg-amber-600"
              onClick={() => revisionMutation.mutate(revisionDescription)}
              disabled={!revisionDescription.trim() || revisionMutation.isPending}
            >
              {revisionMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <History className="w-4 h-4" />}
              Submit Revision Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dispute Dialog */}
      <Dialog open={isDisputeDialogOpen} onOpenChange={(open) => { setIsDisputeDialogOpen(open); if (!open) { setDisputeReason(""); setDisputeDescription(""); } }}>
        <DialogContent className="sm:max-w-lg rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-500"><Flag className="w-5 h-5" /> Raise a Dispute</DialogTitle>
            <DialogDescription>Describe the issue with this project. Admin will review and respond.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Reason</Label>
              <Input value={disputeReason} onChange={e => setDisputeReason(e.target.value)} placeholder="e.g., Deliverables not as agreed" className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Textarea value={disputeDescription} onChange={e => setDisputeDescription(e.target.value)} placeholder="Provide details about your dispute..." className="min-h-[100px] rounded-xl" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDisputeDialogOpen(false)}>Cancel</Button>
            <Button
              className="bg-red-500 hover:bg-red-600 gap-2"
              disabled={!disputeReason.trim() || disputeMutation.isPending}
              onClick={() => disputeMutation.mutate({ reason: disputeReason, description: disputeDescription, projectId: id })}
            >
              {disputeMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Flag className="w-4 h-4" />}
              Submit Dispute
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={isCancelDialogOpen} onOpenChange={(open) => { setIsCancelDialogOpen(open); if (!open) setCancelReason(""); }}>
        <DialogContent className="sm:max-w-lg rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive"><X className="w-5 h-5" /> Cancel Project</DialogTitle>
            <DialogDescription>This will cancel the project and notify the client. Project status will be set to Cancelled.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Reason for cancellation</Label>
              <Textarea value={cancelReason} onChange={e => setCancelReason(e.target.value)} placeholder="Explain why this project is being cancelled..." className="min-h-[100px] rounded-xl" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsCancelDialogOpen(false)}>Go Back</Button>
            <Button
              className="bg-destructive hover:bg-destructive/90 gap-2"
              disabled={!cancelReason.trim() || cancelMutation.isPending}
              onClick={() => cancelMutation.mutate(cancelReason)}
            >
              {cancelMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
              Confirm Cancellation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Requirements Dialog */}
      <Dialog open={isRequirementsDialogOpen} onOpenChange={(open) => { setIsRequirementsDialogOpen(open); if (!open) setRequirementsText(""); }}>
        <DialogContent className="sm:max-w-lg rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Target className="w-5 h-5 text-primary" /> Project Requirements</DialogTitle>
            <DialogDescription>Describe the project requirements and specifications.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={requirementsText}
              onChange={e => setRequirementsText(e.target.value)}
              placeholder={`- Design a responsive landing page\n- Implement contact form\n- SEO optimization`}
              className="min-h-[200px] rounded-xl font-mono text-sm"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsRequirementsDialogOpen(false)}>Cancel</Button>
            <Button
              className="gap-2"
              disabled={!requirementsText.trim() || requirementsMutation.isPending}
              onClick={() => requirementsMutation.mutate(requirementsText)}
            >
              {requirementsMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Save Requirements
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AnimatePresence>
        {isDeleteOpen && (
          <DeleteDialog
            isOpen={isDeleteOpen}
            onClose={() => setIsDeleteOpen(false)}
            onConfirm={handleDelete}
            projectTitle={project.title}
          />
        )}
      </AnimatePresence>

      {selectedProject && (
        <PaymentModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onPaymentComplete={handlePaymentComplete}
        />
      )}
    </div>
  );
}

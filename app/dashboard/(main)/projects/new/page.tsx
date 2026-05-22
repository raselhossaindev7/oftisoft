"use client"
import { AnimatedDiv, AnimatePresence } from "@/lib/animated";

import { useState } from "react";
import {
    Layout, CheckSquare, Users, Calendar, Rocket,
    ArrowRight, ArrowLeft, Wand2, Plus, X, DollarSign
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useProjects } from "@/hooks/useProjects";
import { RoleGuard } from "@/components/auth/role-guard";
import { toast } from "sonner";

const PROJECT_TYPES = [
    { id: "web", title: "Web Development", desc: "Responsive websites & web apps", icon: Layout, color: "bg-blue-500" },
    { id: "mobile", title: "Mobile App", desc: "iOS & Android applications", icon: Layout, color: "bg-green-500" },
    { id: "ai", title: "AI Solution", desc: "Machine learning & automation", icon: Wand2, color: "bg-purple-500" },
];

import { STATUS_OPTIONS } from "@/lib/projects";

export default function CreateProjectPage() {
    const router = useRouter();
    const { createProject, isCreating } = useProjects();
    const [step, setStep] = useState(1);

    // Form State
  const [title, setTitle] = useState("");
    const [client, setClient] = useState("");
    const [description, setDescription] = useState("");
    const [projectType, setProjectType] = useState("");
    const [status, setStatus] = useState("Planning");
    const [budget, setBudget] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [members, setMembers] = useState(1);
    const [requirements, setRequirements] = useState<string[]>([]);
    const [reqInput, setReqInput] = useState("");
    const [notes, setNotes] = useState("");

    const nextStep = () => setStep(prev => prev + 1);
    const prevStep = () => setStep(prev => prev - 1);

    const handleLaunch = () => {
        // Validate required fields
  if (!title || !client) {
            toast.error("Please fill in all required fields");
            return;
        }

        const projectData = {
            title,
            client,
            description,
            status,
            progress: 0,
            dueDate: dueDate || undefined,
            members,
            budget: budget ? parseFloat(budget) : undefined,
            paymentStatus: "Unpaid",
            notes: notes || undefined,
            tags: [projectType, ...requirements].filter(Boolean),
        };

        createProject(projectData);
        
        setTimeout(() => {
            router.push("/dashboard/projects");
        }, 1000);
    };

    const addRequirement = (e: React.FormEvent) => {
        e.preventDefault();
        if (reqInput.trim()) {
            setRequirements([...requirements, reqInput]);
            setReqInput("");
        }
    };

    return (
        <RoleGuard allowedRoles={["Editor", "Admin", "SuperAdmin"]}>
        <div className=" mx-auto py-8">
            {/* Step Indicator */}
            <div className="mb-12">
                <div className="flex items-center justify-between relative">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-muted -z-10" />
                    <div className={`absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary -z-10 transition-all duration-500`} style={{ width: `${((step - 1) / 3) * 100}%` }} />

                    {["Basics", "Details", "Timeline", "Launch"].map((label, i) => {
                        const stepNum = i + 1;
                        const active = step >= stepNum;
                        const current = step === stepNum;
                        return (
                            <div key={i} className="flex flex-col items-center bg-background px-2">
                                <div className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 transition-all duration-300",
                                    active ? "bg-primary border-primary text-white" : "bg-card border-border text-muted-foreground",
                                    current && "ring-4 ring-primary/20 scale-110"
                                )}>
                                    {stepNum}
                                </div>
                                <span className={cn("text-xs mt-2 font-medium transition-colors", active ? "text-primary" : "text-muted-foreground")}>
                                    {label}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Main Content */}
            <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-xl min-h-[500px] flex flex-col">
                <div className="flex-1 p-8 md:p-12">
                    <AnimatePresence mode="wait">

                        {/* Step 1: Basics */}
                        {step === 1 && (
                            <AnimatedDiv key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <div className="text-center mb-10">
                                    <h2 className="text-3xl font-bold mb-2">Let's build something amazing.</h2>
                                    <p className="text-muted-foreground">Tell us about your project</p>
                                </div>

                                <div className="space-y-6 max-w-2xl mx-auto">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold">Project Title *</label>
                                        <input value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder="e.g. E-commerce Redesign"
                                            className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold">Client Name *</label>
                                        <input value={client}
                                            onChange={(e) => setClient(e.target.value)}
                                            placeholder="e.g. Acme Corporation"
                                            className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold">Description</label>
                                        <textarea value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="Brief description of the project..."
                                            rows={4}
                                            className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold">Project Type</label>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {PROJECT_TYPES.map((type) => (
                                                <button key={type.id}
                                                    onClick={() => setProjectType(type.id)}
                                                    className={cn(
                                                        "relative p-4 rounded-2xl border text-left transition-all hover:shadow-lg group",
                                                        projectType === type.id ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-border bg-card hover:border-primary/50"
                                                    )}
                                                >
                                                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3 text-white shadow-md", type.color)}>
                                                        <type.icon size={20} />
                                                    </div>
                                                    <h3 className="font-bold text-sm mb-1">{type.title}</h3>
                                                    <p className="text-xs text-muted-foreground">{type.desc}</p>
                                                    {projectType === type.id && (
                                                        <div className="absolute top-3 right-3 w-5 h-5 bg-primary rounded-full flex items-center justify-center text-white">
                                                            <CheckSquare size={12} />
                                                        </div>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </AnimatedDiv>
                        )}

                        {/* Step 2: Details */}
                        {step === 2 && (
                            <AnimatedDiv key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <div className="text-center mb-6">
                                    <h2 className="text-3xl font-bold mb-2">Project Details</h2>
                                    <p className="text-muted-foreground">Budget, team size, and requirements</p>
                                </div>

                                <div className="space-y-6 max-w-2xl mx-auto">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold flex items-center gap-2">
                                                <DollarSign className="w-4 h-4" /> Budget
                                            </label>
                                            <input type="number"
                                                value={budget}
                                                onChange={(e) => setBudget(e.target.value)}
                                                placeholder="e.g. 50000"
                                                className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-bold flex items-center gap-2">
                                                <Users className="w-4 h-4" /> Team Members
                                            </label>
                                            <input type="number"
                                                min="1"
                                                value={members}
                                                onChange={(e) => setMembers(parseInt(e.target.value) || 1)}
                                                className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold">Status</label>
                                        <select value={status}
                                            onChange={(e) => setStatus(e.target.value)}
                                            className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none"
                                        >
                                            {STATUS_OPTIONS.map(s => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="bg-muted/30 border border-border rounded-3xl p-6">
                                        <h3 className="font-bold mb-4">Requirements & Features</h3>
                                        <form onSubmit={addRequirement} className="flex gap-2 mb-4">
                                            <input 
                                                value={reqInput}
                                                onChange={(e) => setReqInput(e.target.value)}
                                                placeholder="Add a feature (e.g. 'Stripe Integration')..."
                                                className="flex-1 bg-card border border-border rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary/20 outline-none"
                                            />
                                            <button type="submit" className="px-4 py-2 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors">
                                                Add
                                            </button>
                                        </form>
                                        <div className="flex flex-wrap gap-2">
                                            {requirements.length === 0 && <span className="text-sm text-muted-foreground ">No requirements added yet.</span>}
                                            {requirements.map((req, i) => (
                                                <span key={i} className="bg-card border border-border pl-3 pr-2 py-1.5 rounded-full text-sm font-medium flex items-center gap-2">
                                                    {req}
                                                    <button onClick={() => setRequirements(requirements.filter((_, idx) => idx !== i))} className="hover:bg-muted rounded-full p-0.5">
                                                        <X size={14} />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </AnimatedDiv>
                        )}

                        {/* Step 3: Timeline */}
                        {step === 3 && (
                            <AnimatedDiv key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <div className="text-center mb-10">
                                    <h2 className="text-3xl font-bold mb-2">Timeline & Notes</h2>
                                    <p className="text-muted-foreground">Set deadlines and add additional information</p>
                                </div>

                                <div className="space-y-6 max-w-2xl mx-auto">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold flex items-center gap-2">
                                            <Calendar className="w-4 h-4" /> Due Date
                                        </label>
                                        <input type="date"
                                            value={dueDate}
                                            onChange={(e) => setDueDate(e.target.value)}
                                            className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold">Additional Notes</label>
                                        <textarea value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            placeholder="Any additional information about the project..."
                                            rows={6}
                                            className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                                        />
                                    </div>
                                </div>
                            </AnimatedDiv>
                        )}

                        {/* Step 4: Launch */}
                        {step === 4 && (
                            <AnimatedDiv key="step4"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-10"
                            >
                                {isCreating ? (
                                    <div className="flex flex-col items-center">
                                        <Rocket className="w-20 h-20 text-primary animate-bounce mb-8" />
                                        <h2 className="text-3xl font-bold mb-2">Creating Project...</h2>
                                        <p className="text-muted-foreground">Setting up your project workspace.</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center">
                                        <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-8">
                                            <Rocket className="w-10 h-10 text-green-500" />
                                        </div>
                                        <h2 className="text-3xl font-bold mb-4">Ready to Launch?</h2>
                                        <div className="max-w-md mx-auto mb-8 space-y-3">
                                            <div className="bg-muted/30 rounded-xl p-4 text-left">
                                                <div className="grid grid-cols-2 gap-3 text-sm">
                                                    <div>
                                                        <span className="text-muted-foreground">Project:</span>
                                                        <p className="font-bold">{title}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-muted-foreground">Client:</span>
                                                        <p className="font-bold">{client}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-muted-foreground">Team:</span>
                                                        <p className="font-bold">{members} members</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-muted-foreground">Budget:</span>
                                                        <p className="font-bold">{budget ? `$${parseFloat(budget).toLocaleString()}` : 'N/A'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <button onClick={handleLaunch}
                                            className="px-8 py-4 bg-primary text-white text-lg font-bold rounded-xl shadow-lg shadow-primary/30 hover:scale-105 transition-transform flex items-center gap-3 mx-auto"
                                        >
                                            <Rocket className="w-5 h-5" /> Create Project
                                        </button>
                                    </div>
                                )}
                            </AnimatedDiv>
                        )}

                    </AnimatePresence>
                </div>

                {/* Footer Actions */}
                {!isCreating && step < 4 && (
                    <div className="bg-muted/30 p-6 border-t border-border flex justify-between items-center">
                        <button onClick={prevStep}
                            disabled={step === 1}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-muted-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" /> Back
                        </button>

                        <button onClick={nextStep}
                            disabled={(step === 1 && (!title || !client))}
                            className="flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {step === 3 ? "Review & Launch" : "Next Step"} <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        </div>
        </RoleGuard>
    );
}

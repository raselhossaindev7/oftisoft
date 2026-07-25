"use client";

import { useState } from "react";
import { 
    Image as ImageIcon, 
    Video as VideoIcon, 
    Trash2, 
    RefreshCcw, 
    Loader2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useMediaUpload } from "@/hooks/useMedia";
import { cn } from "@/lib/utils";

interface MediaUploadProps {
    value?: string;
    onChange: (url: string) => void;
    type?: 'image' | 'video';
    label: string;
    className?: string;
    aspectRatio?: 'video' | 'square' | 'portrait' | 'auto';
}

/**
 * Shared Media Upload Component with Progress Tracking
 */
export function MediaUpload({
    value,
    onChange,
    type = 'image',
    label,
    className,
    aspectRatio = 'video'
}: MediaUploadProps) {
    const uploadMutation = useMediaUpload();
    const [progress, setProgress] = useState(0);
    const [showProgress, setShowProgress] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setShowProgress(true);
        try {
            const res = await uploadMutation.mutateAsync(file);
            onChange(res.url);
        } catch (error) {
            console.error('Upload failed', error);
        } finally {
            setTimeout(() => {
                setShowProgress(false);
                setProgress(0);
            }, 500);
        }
    };

    const isUploading = uploadMutation.isPending;

    const aspectClass = {
        video: 'aspect-video',
        square: 'aspect-square',
        portrait: 'aspect-[3/4]',
        auto: 'aspect-auto min-h-[200px]'
    }[aspectRatio];

    return (
        <div className={cn("space-y-3", className)}>
            <div className="flex items-center justify-between">
                <Label className="text-micro uppercase font-bold text-muted-foreground tracking-widest">{label}</Label>
                {value && (
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => onChange('')}
                        className="h-6 px-2 text-micro text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full"
                    >
                        <Trash2 className="w-3 h-3 mr-1" /> Remove
                    </Button>
                )}
            </div>
            
            <div className="grid gap-4">
                {value ? (
                    <div className={cn("relative group rounded-3xl overflow-hidden border border-border/50 bg-muted/20", aspectClass)}>
                        {type === 'image' ? (
                            <img src={value} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                            <video src={value} className="w-full h-full object-cover" controls />
                        )}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-2 backdrop-blur-sm">
                            <Button size="sm" variant="secondary" onClick={() => document.getElementById(`file-upload-${label}`)?.click()} className="rounded-2xl font-bold bg-white text-black hover:bg-white/90">
                                <RefreshCcw className="w-4 h-4 mr-2" /> Replace
                            </Button>
                        </div>
                    </div>
                ) : (
                    <Button 
                        variant="outline" 
                        className={cn("border-dashed border-2 rounded-[32px] flex flex-col gap-3 hover:bg-primary/5 hover:border-primary/50 transition-all duration-500 bg-muted/10 group h-auto py-12", aspectClass)}
                        onClick={() => document.getElementById(`file-upload-${label}`)?.click()}
                        disabled={isUploading}
                    >
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                            {type === 'image' ? <ImageIcon className="w-6 h-6 text-primary" /> : <VideoIcon className="w-6 h-6 text-primary" />}
                        </div>
                        <div className="text-center">
                            <span className="text-xs font-bold block">Upload {type === 'image' ? 'Image' : 'Video'}</span>
                            <span className="text-micro text-muted-foreground">Click to browse or drag & drop</span>
                        </div>
                    </Button>
                )}
            </div>

            <input 
                id={`file-upload-${label}`}
                type="file" 
                className="hidden" 
                accept={type === 'image' ? "image/*" : "video/*"}
                onChange={handleFileChange}
            />

            <Dialog open={showProgress} onOpenChange={setShowProgress}>
                <DialogContent className="sm:max-w-md rounded-[32px] border-none bg-background/80 backdrop-blur-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black italic">Uploading {type}...</DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                            Processing your premium content. Almost there.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-8 space-y-6">
                        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground">
                            <span className="flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                {progress < 100 ? 'Transferring Data' : 'Finalizing'}
                            </span>
                            <span className="text-primary">{Math.round(progress)}%</span>
                        </div>
                        <div className="relative">
                            <Progress value={progress} className="h-3 rounded-full bg-primary/10" />
                            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full -z-10 animate-pulse" />
                        </div>
                        
                        {value && (
                             <div className="rounded-2xl overflow-hidden border border-border/50 aspect-video opacity-50">
                                {type === 'image' ? <img src={value} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-muted flex items-center justify-center"><VideoIcon className="w-8 h-8" /></div>}
                             </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

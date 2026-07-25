"use client"
import { useRef } from "react"
import { Upload, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { authAPI } from "@/lib/api"
import { toast } from "sonner"

interface ScreenshotsUploadProps {
    screenshots: string[]
    onChange: (urls: string[]) => void
}

export default function ScreenshotsUpload({ screenshots, onChange }: ScreenshotsUploadProps) {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const uploadingRef = useRef(false)

    const handleUpload = async (file: File) => {
        if (!file.type.startsWith("image/")) { toast.error("Please select an image file"); return }
        uploadingRef.current = true
        try {
            const data = await authAPI.uploadAvatar(file)
            const url = data.avatarUrl || data.avatar || ""
            if (url) {
                onChange([...screenshots, url])
                toast.success("Screenshot uploaded")
            }
        } catch {
            toast.error("Upload failed")
        } finally {
            uploadingRef.current = false
        }
    }

    const remove = (i: number) => {
        onChange(screenshots.filter((_, idx) => idx !== i))
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <Label className="text-xs font-medium">Screenshots</Label>
                <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="h-7 gap-1 text-xs rounded-lg">
                    <Upload className="w-3 h-3" /> Add Screenshot
                </Button>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); e.target.value = "" }} />
            {screenshots.length === 0 && (
                <p className="text-xs text-muted-foreground py-2">No screenshots uploaded yet.</p>
            )}
            <div className="grid grid-cols-3 gap-2">
                {screenshots.map((url, i) => (
                    <div key={i} className="relative aspect-video rounded-lg overflow-hidden border border-border/50 group">
                        <img src={url} alt={`Screenshot ${i + 1}`} className="w-full h-full object-cover" />
                        <button type="button" onClick={() => remove(i)}
                            className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <X className="w-3 h-3 text-white" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}

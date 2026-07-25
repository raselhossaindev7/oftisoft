"use client"
import { Plus, Trash2, GripVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface StatEntry {
    label: string
    value: string
}

interface StatsEditorProps {
    value: StatEntry[]
    onChange: (stats: StatEntry[]) => void
}

export default function StatsEditor({ value, onChange }: StatsEditorProps) {
    const stats = Array.isArray(value) ? value : []

    const add = () => {
        onChange([...stats, { label: "", value: "" }])
    }

    const remove = (i: number) => {
        onChange(stats.filter((_, idx) => idx !== i))
    }

    const update = (i: number, field: keyof StatEntry, val: string) => {
        const next = stats.map((s, idx) => (idx === i ? { ...s, [field]: val } : s))
        onChange(next)
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <Label className="text-xs font-medium">Impact Stats</Label>
                <Button type="button" variant="outline" size="sm" onClick={add} className="h-7 gap-1 text-xs rounded-lg">
                    <Plus className="w-3 h-3" /> Add Stat
                </Button>
            </div>
            {stats.length === 0 && (
                <p className="text-xs text-muted-foreground py-2">No stats added yet. Click "Add Stat" to add impact metrics.</p>
            )}
            {stats.map((s, i) => (
                <div key={i} className="flex items-start gap-2 p-3 rounded-xl bg-background/50 border border-border/50">
                    <GripVertical className="w-4 h-4 text-muted-foreground/40 mt-2.5 shrink-0" />
                    <div className="flex-1 grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                            <Label className="text-[10px] text-muted-foreground">Label</Label>
                            <Input placeholder="e.g. Conversion" className="h-8 text-xs rounded-lg" value={s.label}
                                onChange={(e) => update(i, "label", e.target.value)} />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-[10px] text-muted-foreground">Value</Label>
                            <Input placeholder="e.g. +40%" className="h-8 text-xs rounded-lg" value={s.value}
                                onChange={(e) => update(i, "value", e.target.value)} />
                        </div>
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(i)} className="h-8 w-8 shrink-0 text-destructive hover:text-destructive mt-1">
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            ))}
        </div>
    )
}

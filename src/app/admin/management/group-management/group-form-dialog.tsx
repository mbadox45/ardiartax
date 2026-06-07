// src/app/admin/management/group-management/group-form-dialog.tsx
"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Loader2 } from "lucide-react"
import { FlatGroupData, GroupFormPayload, GroupNodeData } from "./GroupClient"

interface GroupFormDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    mode: "create" | "update"
    selectedGroup: GroupNodeData | null // 🛠️ FIX: Gunakan GroupNodeData agar sinkron dengan GroupClient
    allGroups: FlatGroupData[] // 🛠️ FIX: Gunakan FlatGroupData agar sinkron dengan GroupClient
    onSubmit: (data: GroupFormPayload) => Promise<void>
}

export function GroupFormDialog({ open, onOpenChange, mode, selectedGroup, allGroups, onSubmit }: GroupFormDialogProps) {
    // 🛠️ FIX: Set state string murni yang bersih tanpa default teks "null"
    const [name, setName] = useState<string>("")
    const [parentId, setParentId] = useState<string>("0")
    const [isActive, setIsActive] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        if (mode === "update" && selectedGroup) {
            setName(selectedGroup.name || "")
            setParentId(selectedGroup.parent_id?.toString() || "0")
            setIsActive(selectedGroup.is_active)
        } else {
            setName("")
            setParentId("0")
            setIsActive(true)
        }
    }, [mode, selectedGroup, open])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        // Konversi string parentId dari select component menjadi angka atau null secara aman
        const parsedParentId = Number(parentId) === 0 ? null : Number(parentId)

        try {
            // 🛠️ FIX: Menjamin payload mematuhi kontrak tipe GroupFormPayload secara ketat
            const payload: GroupFormPayload = mode === "create" 
                ? { 
                    name, 
                    parent_id: parsedParentId 
                  }
                : { 
                    id: selectedGroup?.id,
                    name, 
                    is_active: isActive, 
                    parent_id: parsedParentId 
                  }
            
            await onSubmit(payload)
            onOpenChange(false)
        } catch (error) {
            console.error(error)
        } finally {
            // 🛠️ FIX: Mengubah block {} biasa menjadi finally {} agar state loading mati saat error terjadi
            setIsSubmitting(false)
        }
    }

    // Filter out grup saat ini dari daftar parent opsional agar tidak memicu circular parent-child loop
    const parentOptions = allGroups.filter(g => mode === "create" || g.id !== selectedGroup?.id)

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <DialogHeader>
                        <DialogTitle>{mode === "create" ? "Tambah Grup Baru" : "Ubah Data Grup"}</DialogTitle>
                        <DialogDescription>Masukkan nama grup dan hubungkan dengan induk grup jika ada.</DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-2">
                        <div className="grid gap-2">
                            <Label htmlFor="group-name">Nama Grup</Label>
                            <Input 
                                id="group-name" 
                                value={name} 
                                onChange={(e) => setName(e.target.value)} 
                                placeholder="Contoh: Divisi Pajak" 
                                required 
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="parent-group">Grup Induk (Parent)</Label>
                            <Select value={parentId} onValueChange={setParentId}>
                                <SelectTrigger id="parent-group">
                                    <SelectValue placeholder="Pilih Induk Grup" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="0">— Tidak Ada (Root Grup) —</SelectItem>
                                    {parentOptions.map((g) => (
                                        <SelectItem key={g.id} value={g.id.toString()}>{g.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {mode === "update" && (
                            <div className="flex items-center justify-between bg-muted/40 p-3 rounded-lg border">
                                <div className="space-y-0.5">
                                    <Label htmlFor="status-switch">Status Aktivasi</Label>
                                    <div className="text-xs text-muted-foreground">Aktifkan atau nonaktifkan akses grup ini.</div>
                                </div>
                                <Switch id="status-switch" checked={isActive} onCheckedChange={setIsActive} />
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Batal</Button>
                        <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white">
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Simpan"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
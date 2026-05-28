// src/app/admin/management/my-document/share-document-dialog.tsx
"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Users, FolderTree, Globe } from "lucide-react"

interface GroupItem {
  id: number
  name: string
  parent_id?: number | null
  level?: number
}

// Struktur data grup terpilih yang menyertakan level aksesnya
interface SelectedGroupAccess {
  id: number
  access_level: "viewer" | "editor"
}

interface ShareDocumentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedDocumentIds: number[]
  groups: GroupItem[] // Data list grup dari halaman induk
  onSave: (
    shareScope: "all" | "specific", 
    selectedGroups: SelectedGroupAccess[] // Mengirimkan array objek {id, access_level}
  ) => Promise<void>
  isSubmitting: boolean
}

export function ShareDocumentDialog({
  open,
  onOpenChange,
  selectedDocumentIds,
  groups,
  onSave,
  isSubmitting,
}: ShareDocumentDialogProps) {
  const [shareScope, setShareScope] = useState<"all" | "specific">("all")
  const [selectedGroups, setSelectedGroups] = useState<SelectedGroupAccess[]>([])

  // Reset form pilihan setiap kali modal dialog dibuka baru
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        setShareScope("all")
        setSelectedGroups([])
      }, 0)

      return () => clearTimeout(timer)
    }
  }, [open])

  // Fungsi rekursif untuk mencari semua ID anak/sub-grup di bawah grup tertentu
  const getAllChildIds = (parentId: number): number[] => {
    const childs = groups.filter((g) => g.parent_id === parentId)
    let childIds = childs.map((g) => g.id)
    
    childs.forEach((c) => {
      childIds = [...childIds, ...getAllChildIds(c.id)]
    })
    
    return childIds
  }

  // Handler Checkbox Grup beserta Sub-Grup otomatis mewarisi status centang
  const handleGroupCheckboxChange = (groupId: number, checked: boolean) => {
    const childGroupIds = getAllChildIds(groupId)
    const allTargetIds = [groupId, ...childGroupIds]

    if (checked) {
      setSelectedGroups((prev) => {
        const existingIds = prev.map((g) => g.id)
        // Set default access_level ke "viewer" saat baru dicentang
        const newGroupsToAdd = allTargetIds
          .filter((id) => !existingIds.includes(id))
          .map((id) => ({ id, access_level: "viewer" as const }))
        
        return [...prev, ...newGroupsToAdd]
      })
    } else {
      setSelectedGroups((prev) => prev.filter((g) => !allTargetIds.includes(g.id)))
    }
  }

  // Handler untuk mengubah level akses pada grup tertentu
  const handleAccessLevelChange = (groupId: number, level: "viewer" | "editor") => {
    setSelectedGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, access_level: level } : g))
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSave(shareScope, shareScope === "all" ? [] : selectedGroups)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px] max-h-[85vh] flex flex-col p-0 overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
          
          <DialogHeader className="px-6 pt-6 pb-2 shrink-0">
            <DialogTitle className="flex items-center gap-2 text-gray-900">
              <Users className="w-5 h-5 text-blue-600" />
              Pengaturan Akses Berbagi Berkas
            </DialogTitle>
            <DialogDescription>
              Tentukan grup divisi dan tingkat otoritas akses untuk melihat atau mengedit {selectedDocumentIds.length} dokumen terpilih.
            </DialogDescription>
          </DialogHeader>

          {/* Konten Utama Terbungkus ScrollArea */}
          <div className="flex-1 overflow-y-auto px-6 py-2 space-y-4">
            
            {/* Bagian Pilihan Cakupan / Scope */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700">Cakupan Akses (Sharing Scope)</Label>
              
              <RadioGroup 
                value={shareScope} 
                onValueChange={(value: "all" | "specific") => setShareScope(value)}
                className="grid gap-3"
              >
                {/* Pilihan 1: Share ke Semua (All) */}
                <div className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${shareScope === "all" ? "bg-blue-50/50 border-blue-200" : "bg-white hover:bg-gray-50"}`}>
                  <RadioGroupItem value="all" id="scope-all" className="mt-1 text-blue-600 border-gray-300" />
                  <Label htmlFor="scope-all" className="grid gap-0.5 cursor-pointer flex-1">
                    <span className="font-medium text-gray-900 flex items-center gap-1.5">
                      <Globe className="w-4 h-4 text-emerald-600" /> Bagikan Ke Semua Grup (All)
                    </span>
                    <span className="text-xs text-muted-foreground">Seluruh pengguna dari divisi manapun dapat melihat dokumen ini di page Document Sharing.</span>
                  </Label>
                </div>

                {/* Pilihan 2: Share ke Grup Tertentu */}
                <div className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${shareScope === "specific" ? "bg-blue-50/50 border-blue-200" : "bg-white hover:bg-gray-50"}`}>
                  <RadioGroupItem value="specific" id="scope-specific" className="mt-1 text-blue-600 border-gray-300" />
                  <Label htmlFor="scope-specific" className="grid gap-0.5 cursor-pointer flex-1">
                    <span className="font-medium text-gray-900 flex items-center gap-1.5">
                      <FolderTree className="w-4 h-4 text-blue-600" /> Pilih Grup Divisi Spesifik
                    </span>
                    <span className="text-xs text-muted-foreground">Batasi dokumen hanya untuk beberapa grup divisi tertentu beserta hak aksesnya.</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* List Checkbox Grup + Dropdown Akses */}
            {shareScope === "specific" && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Daftar Grup Divisi & Hak Akses</Label>
                <div className="border rounded-xl bg-gray-50/50 p-2">
                  <ScrollArea className="h-[200px] pr-1">
                    {groups.length === 0 ? (
                      <div className="text-center text-xs text-muted-foreground py-8">Belum ada grup divisi yang tersedia.</div>
                    ) : (
                      <div className="space-y-2 p-1">
                        {groups.map((group) => {
                          const matchedGroup = selectedGroups.find((g) => g.id === group.id)
                          const isChecked = !!matchedGroup
                          const currentAccess = matchedGroup?.access_level || "viewer"
                          const isSubGroup = group.parent_id || (group.level && group.level > 1)
                          
                          return (
                            <div 
                              key={group.id} 
                              className={`flex items-center justify-between p-1.5 rounded-md hover:bg-white transition-all ${isSubGroup ? "ml-6 border-l pl-3 border-gray-200" : ""}`}
                            >
                              <div className="flex items-center space-x-3 mr-2 truncate flex-1">
                                <Checkbox 
                                  id={`group-${group.id}`} 
                                  checked={isChecked}
                                  onCheckedChange={(checked) => handleGroupCheckboxChange(group.id, !!checked)}
                                  className="border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 shadow-sm"
                                />
                                <label 
                                  htmlFor={`group-${group.id}`}
                                  className="text-xs font-medium text-gray-700 cursor-pointer select-none flex-1 truncate"
                                >
                                  {group.name}
                                  {isSubGroup && <span className="text-[9px] ml-1.5 px-1 py-0.2 bg-gray-100 border rounded text-muted-foreground">Sub</span>}
                                </label>
                              </div>

                              {/* Dropdown level akses muncul di sisi kanan jika grup dicentang */}
                              {isChecked && (
                                <Select
                                  value={currentAccess}
                                  onValueChange={(val: "viewer" | "editor") => handleAccessLevelChange(group.id, val)}
                                >
                                  <SelectTrigger className="w-[85px] h-7 text-[11px] bg-white shadow-sm shrink-0">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="viewer" className="text-xs">Viewer</SelectItem>
                                    <SelectItem value="editor" className="text-xs text-blue-600 font-medium">Editor</SelectItem>
                                  </SelectContent>
                                </Select>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </ScrollArea>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="px-6 py-7 bg-gray-50 border-t shrink-0">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={isSubmitting} className="h-9 text-xs">Batal</Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || (shareScope === "specific" && selectedGroups.length === 0)} 
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold h-9 text-xs"
            >
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Simpan & Bagikan"}
            </Button>
          </DialogFooter>

        </form>
      </DialogContent>
    </Dialog>
  )
}
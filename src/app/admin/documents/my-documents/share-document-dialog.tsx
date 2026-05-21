// src/app/admin/management/my-document/share-document-dialog.tsx
"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, Users, FolderTree, Globe } from "lucide-react"

// Definisikan struktur data Group yang dikembalikan oleh groupService Anda
interface GroupItem {
  id: number
  name: string
  parent_id?: number | null
  level?: number
}

interface ShareDocumentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedDocumentIds: number[]
  groups: GroupItem[] // Data list grup dari halaman induk
  onSave: (shareScope: "all" | "specific", selectedGroupIds: number[]) => Promise<void> // Mengirim data ke handleBulkShare induk
  isSubmitting: boolean // Status loading dari halaman induk
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
  const [selectedGroupIds, setSelectedGroupIds] = useState<number[]>([])

  // Reset form pilihan setiap kali modal dialog dibuka baru
  useEffect(() => {
    if (open) {
      // Memindahkan eksekusi ke antrean macro-task (asinkronus)
      const timer = setTimeout(() => {
        setShareScope("all")
        setSelectedGroupIds([])
      }, 0)

      return () => clearTimeout(timer)
    }
  }, [open])

  const handleGroupCheckboxChange = (groupId: number, checked: boolean) => {
    if (checked) {
      setSelectedGroupIds((prev) => [...prev, groupId])
    } else {
      setSelectedGroupIds((prev) => prev.filter((id) => id !== groupId))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Teruskan data scope dan list id grup ke fungsi handleBulkShare di halaman utama
    await onSave(shareScope, shareScope === "all" ? [] : selectedGroupIds)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px]" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-gray-900">
              <Users className="w-5 h-5 text-blue-600" />
              Pengaturan Akses Berbagi Berkas
            </DialogTitle>
            <DialogDescription>
              Tentukan siapa saja grup divisi yang diizinkan mengakses {selectedDocumentIds.length} dokumen terpilih ini.
            </DialogDescription>
          </DialogHeader>

          {/* Bagian Pilihan Cakupan / Scope */}
          <div className="space-y-3 py-1">
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
                    <Globe className="w-4 h-4 text-emerald-600" /> Share Ke Semua Grup (All)
                  </span>
                  <span className="text-xs text-muted-foreground">Seluruh pengguna dari divisi manapun dapat melihat dokumen ini di page Document Sharing.</span>
                </Label>
              </div>

              {/* Pilihan 2: Share ke Grup Tertentu */}
              <div className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${shareScope === "specific" ? "bg-blue-50/50 border-blue-200" : "bg-white hover:bg-gray-50"}`}>
                <RadioGroupItem value="specific" id="scope-specific" className="mt-1 text-blue-600 border-gray-300" />
                <Label htmlFor="scope-specific" className="grid gap-0.5 cursor-pointer flex-1">
                  <span className="font-medium text-gray-900 flex items-center gap-1.5">
                    <FolderTree className="w-4 h-4 text-blue-600" /> Pilih Grup / Sub-Grup Spesifik
                  </span>
                  <span className="text-xs text-muted-foreground">Hanya anggota dari grup divisi atau sub-grup yang dicentang yang bisa mendownload berkas.</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* List Checkbox Grup (Hanya muncul jika scope bernilai 'specific') */}
          {shareScope === "specific" && (
            <div className="space-y-2 animate-in fade-in-50 duration-200">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Daftar Grup Divisi Terdaftar</Label>
              <div className="border rounded-xl bg-gray-50/50 p-2">
                <ScrollArea className="h-[180px] pr-2">
                  {groups.length === 0 ? (
                    <div className="text-center text-xs text-muted-foreground py-8">Belum ada grup divisi yang tersedia.</div>
                  ) : (
                    <div className="space-y-2 p-1">
                      {groups.map((group) => {
                        const isChecked = selectedGroupIds.includes(group.id)
                        const isSubGroup = group.parent_id || (group.level && group.level > 1)
                        
                        return (
                          <div 
                            key={group.id} 
                            className={`flex items-center space-x-3 p-1.5 rounded-md hover:bg-white transition-colors ${isSubGroup ? "ml-6 border-l pl-3 border-gray-200" : ""}`}
                          >
                            <Checkbox 
                              id={`group-${group.id}`} 
                              checked={isChecked}
                              onCheckedChange={(checked) => handleGroupCheckboxChange(group.id, !!checked)}
                              className="border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                            />
                            <label 
                              htmlFor={`group-${group.id}`}
                              className="text-sm font-medium text-gray-700 cursor-pointer select-none flex-1"
                            >
                              {group.name}
                              {isSubGroup && <span className="text-[10px] ml-1.5 px-1.5 py-0.5 bg-gray-100 border rounded text-muted-foreground">Sub-Grup</span>}
                            </label>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Batal</Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || (shareScope === "specific" && selectedGroupIds.length === 0)} 
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Simpan & Bagikan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
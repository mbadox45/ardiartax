// src/app/admin/documents/my-documents/new-folder-dialog.tsx
"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface NewFolderDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (name: string) => Promise<void>
}

export function NewFolderDialog({ 
  isOpen, 
  onOpenChange, 
  onSubmit 
}: NewFolderDialogProps) {
  const [folderName, setFolderName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!folderName.trim()) return

    setIsSubmitting(true)
    try {
      await onSubmit(folderName)
      setFolderName("") // Reset input setelah sukses
      onOpenChange(false) // Tutup dialog
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Folder Baru</DialogTitle>
            <DialogDescription>
              Masukkan nama untuk folder baru Anda.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="folder-name">Nama Folder</Label>
              <Input
                id="folder-name"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder="Untitled Folder"
                autoFocus
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => onOpenChange(false)} 
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !folderName.trim()} 
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                "Simpan"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
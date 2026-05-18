// src/app/admin/management/user-management/user-form-dialog.tsx
"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"

export interface UserItem {
  id: string
  name: string
  username: string
  role: "super_admin" | "admin" | "user"
}

interface UserFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "create" | "update"
  selectedUser: UserItem | null
  onSubmit: (data: Omit<UserItem, "id"> & { id?: string }) => Promise<void>
}

export function UserFormDialog({ open, onOpenChange, mode, selectedUser, onSubmit }: UserFormDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    role: "user" as UserItem["role"],
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Sinkronisasi data ketika sedang mode Edit/Update
  useEffect(() => {
    if (mode === "update" && selectedUser) {
      setFormData({
        name: selectedUser.name,
        username: selectedUser.username,
        role: selectedUser.role,
      })
    } else {
      setFormData({ name: "", username: "", role: "user", status: "active" })
    }
  }, [mode, selectedUser, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await onSubmit(mode === "update" ? { ...formData, id: selectedUser?.id } : formData)
      onOpenChange(false)
    } catch (error) {
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>{mode === "create" ? "Tambah User Baru" : "Ubah Data User"}</DialogTitle>
            <DialogDescription>
              {mode === "create" ? "Isi data di bawah untuk menambahkan pengguna baru." : "Perbarui data informasi akses pengguna."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2 w-full">
            <div className="grid gap-2">
              <Label htmlFor="name">Nama Lengkap</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="johndoe@example.com"
                required
                disabled={mode === "update"} // Email biasanya unik dan tidak diubah
              />
            </div>
            <div className="grid gap-2 w-full">
              <Label htmlFor="role">Role Akses</Label>
              <Select
                value={formData.role}
                onValueChange={(value: UserItem["role"]) => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Pilih Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white">
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
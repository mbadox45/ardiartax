// src/app/admin/management/user-management/user-form-dialog.tsx
"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Loader2, AlertTriangle, Eye, EyeOff } from "lucide-react"
import { UserData } from "./columns"

// =========================================================
// 1. KOMPONEN UTAMA: Form Dialog (Create & Update)
// =========================================================
interface UserFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "create" | "update"
  selectedUser: UserData | null
  groups: any[] // Data dari groupService.getAll()
  onSubmit: (data: any) => Promise<void>
}

export function UserFormDialog({ open, onOpenChange, mode, selectedUser, groups, onSubmit }: UserFormDialogProps) {
  const [name, setName] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("user")
  const [groupId, setGroupId] = useState("")
  const [isActive, setIsActive] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (mode === "update" && selectedUser) {
      setName(selectedUser.name || "")
      setUsername(selectedUser.username || "")
      setRole(selectedUser.role || "user")
      setGroupId(selectedUser.group_id?.toString() || "")
      setIsActive(selectedUser.is_active ?? true)
      setPassword("") // Reset input password pada mode update (karena memakai fitur reset password terpisah)
    } else {
      setName("")
      setUsername("")
      setPassword("")
      setRole("user")
      setGroupId("")
      setIsActive(true)
    }
    setShowPassword(false)
  }, [mode, selectedUser, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!groupId) {
      alert("Silakan pilih grup terlebih dahulu")
      return
    }

    setIsSubmitting(true)
    try {
      const payload: any = {
        name,
        username,
        role,
        group_id: Number(groupId),
      }

      if (mode === "create") {
        payload.password = password
      } else if (mode === "update" && selectedUser) {
        payload.id = selectedUser.id
        payload.is_active = isActive
      }

      await onSubmit(payload)
      onOpenChange(false)
    } catch (error) {
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>{mode === "create" ? "Tambah Pengguna Baru" : "Ubah Data Pengguna"}</DialogTitle>
            <DialogDescription>
              {mode === "create" 
                ? "Isi formulir pendaftaran akun karyawan di bawah ini secara lengkap." 
                : "Perbarui hak akses atau informasi nama profil pengguna."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            {/* Input Nama */}
            <div className="grid gap-2">
              <Label htmlFor="user-name">Nama Lengkap</Label>
              <Input id="user-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Contoh: Budi Santoso" required />
            </div>

            {/* Input Username */}
            <div className="grid gap-2">
              <Label htmlFor="user-username">Username</Label>
              <Input id="user-username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="budi.pajak" required />
            </div>

            {/* Input Password (Hanya muncul jika Create) */}
            {mode === "create" && (
              <div className="grid gap-2">
                <Label htmlFor="user-password">Kata Sandi (Password)</Label>
                <div className="relative">
                  <Input 
                    id="user-password" 
                    type={showPassword ? "text" : "password"} 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    placeholder="••••••••" 
                    required 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Dropdown Role */}
            <div className="grid gap-2">
              <Label htmlFor="user-role">Role Hak Akses</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger id="user-role">
                  <SelectValue placeholder="Pilih Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="user_tax">User Tax</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Dropdown Grup Riil (Diambil dari API groups) */}
            <div className="grid gap-2">
              <Label htmlFor="user-group">Grup / Divisi</Label>
              <Select value={groupId} onValueChange={setGroupId}>
                <SelectTrigger id="user-group">
                  <SelectValue placeholder="Pilih Divisi Grup" />
                </SelectTrigger>
                <SelectContent>
                  {groups.length === 0 ? (
                    <SelectItem value="none" disabled>Belum ada grup tersedia</SelectItem>
                  ) : (
                    groups.map((g) => (
                      <SelectItem key={g.id} value={g.id.toString()}>{g.name}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Switch Status Aktivasi (Hanya muncul jika Update) */}
            {mode === "update" && (
              <div className="flex items-center justify-between bg-muted/40 p-3 rounded-lg border">
                <div className="space-y-0.5">
                  <Label htmlFor="status-user-switch">Status Akun</Label>
                  <div className="text-xs text-muted-foreground">Aktifkan atau bekukan akses masuk user ini.</div>
                </div>
                <Switch id="status-user-switch" checked={isActive} onCheckedChange={setIsActive} />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Batal</Button>
            <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white">
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Simpan Pengguna"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}


// =========================================================
// 2. KOMPONEN KEDUA: Modal Konfirmasi Reset Password
// =========================================================
interface ResetPasswordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedUser: UserData | null
  onConfirm: (userId: string | number) => Promise<void>
}

export function ResetPasswordDialog({ open, onOpenChange, selectedUser, onConfirm }: ResetPasswordDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleConfirm = async () => {
    if (!selectedUser) return
    setIsSubmitting(true)
    try {
      await onConfirm(selectedUser.id)
      onOpenChange(false)
    } catch (error) {
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 mb-2">
            <AlertTriangle className="h-6 w-6 text-amber-600" />
          </div>
          <DialogTitle className="text-center">Konfirmasi Reset Kata Sandi</DialogTitle>
          <DialogDescription className="text-center pt-1">
            Apakah Anda yakin ingin mereset password pengguna bernama{" "}
            <strong className="text-gray-900">"{selectedUser?.name}"</strong>?
          </DialogDescription>
        </DialogHeader>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 space-y-1">
          <p className="font-semibold">Informasi penting:</p>
          <p>Password akan di-reset otomatis oleh backend sistem ke pengaturan default bawaan atau dikosongkan sesuai kebijakan keamanan API.</p>
        </div>

        <DialogFooter className="sm:justify-center gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={isSubmitting} className="w-full sm:w-auto">
            Batal
          </Button>
          <Button type="button" onClick={handleConfirm} disabled={isSubmitting} className="bg-amber-600 hover:bg-amber-700 text-white w-full sm:w-auto">
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Ya, Reset Password"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
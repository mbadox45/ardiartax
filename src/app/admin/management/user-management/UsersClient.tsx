// src/app/admin/management/user-management/users-client.tsx
"use client"

import { useState, useEffect, useCallback } from "react"
import { Plus, Search, Loader2 } from "lucide-react"
import { toast } from "sonner"

// Components
import HeaderPage from "@/components/layout/header-page"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { UniversalDataTable } from "@/components/layout/universal-data-table"
import { columns, UserData } from "./columns"
import { UserFormDialog, ResetPasswordDialog } from "./user-form-dialog"

// Services
import { userService } from "@/lib/api/user.service"
import { groupService } from "@/lib/api/group.service"

export default function UserClient() {
  const [users, setUsers] = useState<UserData[]>([])
  const [groups, setGroups] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  
  // State Dialog Control (Form Create/Update)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<"create" | "update">("create")
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)

  // State Dialog Control (Reset Password)
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false)

  // ==========================================
  // FETCH DATA: Users & Groups
  // ==========================================
  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      // Ambil data users dan groups secara paralel
      const [usersData, groupsData] = await Promise.all([
        userService.getAll(),
        groupService.getAll()
      ])

      // Mapping nama grup ke dalam data user berdasarkan group_id untuk kebutuhan kolom tabel
      const flatGroups = Array.isArray(groupsData) ? groupsData : []
      const flatUsers = Array.isArray(usersData) ? usersData : []
      
      const mappedUsers = flatUsers.map((user: any) => {
        const foundGroup = flatGroups.find((g: any) => g.id === user.group_id)
        return {
          ...user,
          group_name: foundGroup ? foundGroup.name : `Grup ID #${user.group_id}`
        }
      })

      setUsers(mappedUsers)
      setGroups(flatGroups)
    } catch (error) {
      toast.error("Gagal sinkronisasi data dari server")
      setUsers([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])


  // ==========================================
  // BINDING EVENT LISTENERS FROM COLUMNS
  // ==========================================
  useEffect(() => {
    const handleEditEvent = (e: Event) => {
      const user = (e as CustomEvent).detail
      setDialogMode("update")
      setSelectedUser(user)
      setIsDialogOpen(true)
    }

    const handleDeleteEvent = (e: Event) => {
      const user = (e as CustomEvent).detail
      handleDeleteUser(user)
    }

    const handleResetPasswordEvent = (e: Event) => {
      const user = (e as CustomEvent).detail
      setSelectedUser(user)
      setIsResetDialogOpen(true) // Membuka modal konfirmasi reset password
    }

    window.addEventListener("user-action-edit", handleEditEvent)
    window.addEventListener("user-action-delete", handleDeleteEvent)
    window.addEventListener("user-action-reset-password", handleResetPasswordEvent)

    return () => {
      window.removeEventListener("user-action-edit", handleEditEvent)
      window.removeEventListener("user-action-delete", handleDeleteEvent)
      window.removeEventListener("user-action-reset-password", handleResetPasswordEvent)
    }
  }, [])


  // ==========================================
  // MUTATION HANDLERS (CRUD & ACTIONS)
  // ==========================================
  const handleCreateTrigger = () => {
    setDialogMode("create")
    setSelectedUser(null)
    setIsDialogOpen(true)
  }

  const handleFormSubmit = async (payload: any) => {
    try {
      if (dialogMode === "create") {
        await userService.create({
          name: payload.name,
          username: payload.username,
          password: payload.password,
          role: payload.role,
          group_id: payload.group_id
        })
        toast.success("Pengguna baru berhasil terdaftar")
      } else {
        await userService.update(payload.id, {
          name: payload.name,
          username: payload.username,
          role: payload.role,
          group_id: payload.group_id,
          is_active: payload.is_active
        })
        toast.success("Data profil pengguna diperbarui")
      }
      fetchData() // Refresh tabel agar tersinkronisasi kembali
    } catch (error: any) {
      toast.error(error.message || "Gagal menyimpan data pengguna")
      throw error
    }
  }

  const handleDeleteUser = async (user: UserData) => {
    if (confirm(`Apakah Anda yakin ingin menghapus akun "${user.name}"?`)) {
      try {
        await userService.delete(user.id)
        toast.success("Pengguna berhasil dihapus")
        fetchData()
      } catch (error: any) {
        toast.error(error.message || "Gagal menghapus pengguna")
      }
    }
  }

  const handleConfirmResetPassword = async (userId: string | number) => {
    try {
      await userService.resetPassword(userId)
      toast.success("Kata sandi berhasil di-reset ke pengaturan sistem")
      fetchData()
    } catch (error: any) {
      toast.error(error.message || "Gagal mereset kata sandi")
      throw error
    }
  }

  // Filter Data Berdasarkan Pencarian di Client-side
  const filteredUsers = Array.isArray(users)
    ? users.filter(user => 
        user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user?.username?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : []

  return (
    <div className="pb-6 pt-3 px-6 space-y-6">
      {/* Header */}
      <HeaderPage title="User Management" description="Kelola hak akses pendaftaran karyawan dan penempatan divisi" />

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 bg-white p-3 rounded-lg border shadow-sm">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Cari nama atau username..." 
            className="pl-9 bg-muted/40 border-none focus-visible:ring-1"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Button onClick={handleCreateTrigger} className="bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-sm">
          <Plus className="w-4 h-4 stroke-[3px]" />
          <span className="font-semibold text-sm">Tambah User</span>
        </Button>
      </div>

      {/* Main Data Table */}
      <div className="bg-white border rounded-xl overflow-hidden shadow-sm relative min-h-[200px]">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <UniversalDataTable 
            columns={columns} 
            data={filteredUsers}
          />
        )}
      </div>

      {/* Form Dialog: Create & Update */}
      <UserFormDialog 
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        mode={dialogMode}
        selectedUser={selectedUser}
        groups={groups} // Melempar data grup riil ke dropdown
        onSubmit={handleFormSubmit}
      />

      {/* Confirmation Dialog: Reset Password */}
      <ResetPasswordDialog 
        open={isResetDialogOpen}
        onOpenChange={setIsResetDialogOpen}
        selectedUser={selectedUser}
        onConfirm={handleConfirmResetPassword}
      />
    </div>
  )
}
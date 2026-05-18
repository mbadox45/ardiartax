// src/app/admin/management/user-management/users-client.tsx
"use client"

// 1. Pastikan useCallback di-import
import { useState, useEffect, useCallback } from "react"
import { v4 as uuidv4 } from "uuid"
import { Plus, Search } from "lucide-react"
import { toast } from "sonner"

// Components
import HeaderPage from "@/components/layout/header-page"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { UniversalDataTable } from "@/components/layout/universal-data-table"
import { columns, UserData } from "./columns"
import { UserFormDialog } from "./user-form-dialog"
import { userService } from "@/lib/api/user.service"

export default function UsersClient() {
  const [users, setUsers] = useState<UserData[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  
  // State Dialog Control
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<"create" | "update">("create")
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)

  // Fetch Data dari API Service
  const fetchUsers = useCallback(async () => {
    try {
      const data = await userService.getAll()
      setUsers(data)
    } catch (error) {
      toast.error("Gagal memuat data pengguna")
    }
  }, [])

  // Jalankan fetch saat mount
  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // 2. PERBAIKAN UTAMA: Pasang kembali Event Listener dari columns.tsx
  useEffect(() => {
    const handleEditEvent = (e: Event) => {
      const user = (e as CustomEvent).detail
      handleUpdateTrigger(user)
    }

    const handleDeleteEvent = (e: Event) => {
      const user = (e as CustomEvent).detail
      handleDeleteUser(user.id, user.name)
    }

    window.addEventListener("user-action-edit", handleEditEvent)
    window.addEventListener("user-action-delete", handleDeleteEvent)

    return () => {
      window.removeEventListener("user-action-edit", handleEditEvent)
      window.removeEventListener("user-action-delete", handleDeleteEvent)
    }
  }, [])

  // Filter User berdasarkan pencarian Nama / Email
  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Triggers
  const handleCreateTrigger = () => {
    setDialogMode("create")
    setSelectedUser(null)
    setIsDialogOpen(true)
  }

  const handleUpdateTrigger = (user: UserData) => {
    setDialogMode("update")
    setSelectedUser(user)
    setIsDialogOpen(true)
  }

  // Actions
  const handleFormSubmit = async (data: Omit<UserData, "id"> & { id?: string }) => {
    // TODO: Ganti dengan service riil jika endpoint POST/PUT sudah siap
    await new Promise((resolve) => setTimeout(resolve, 800))

    if (dialogMode === "create") {
      const newUser: UserData = {
        id: uuidv4(),
        name: data.name,
        username: data.username,
        role: data.role,
        status: data.status
      }
      setUsers([newUser, ...users])
      toast.success("User berhasil ditambahkan")
    } else {
      setUsers(users.map(u => u.id === data.id ? { ...u, ...data } as UserData : u))
      toast.success("Data user berhasil diperbarui")
    }
  }

  const handleDeleteUser = (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus user ${name}?`)) {
      // TODO: Ganti dengan userService.delete(id) jika sudah siap
      setUsers(users.filter(u => u.id !== id))
      toast.success("User berhasil dihapus")
    }
  }

  return (
    <div className="pb-6 pt-3 px-6 space-y-6">
      {/* Header */}
      <HeaderPage title="User Management" description="Kelola pengguna dan akses mereka" />

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 bg-white p-3 rounded-lg border shadow-sm">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Cari nama atau email..." 
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

      {/* Users Table */}
      <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
        {/* PERBAIKAN: Gunakan filteredUsers, bukan users asli */}
        <UniversalDataTable 
          columns={columns} 
          data={filteredUsers}
        />
      </div>

      {/* Form Dialog */}
      <UserFormDialog 
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        mode={dialogMode}
        selectedUser={selectedUser}
        onSubmit={handleFormSubmit}
      />
    </div>
  )
}
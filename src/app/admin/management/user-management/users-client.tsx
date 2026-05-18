// src/app/admin/management/user-management/users-client.tsx
"use client"

import { useState, useEffect } from "react"
import { v4 as uuidv4 } from "uuid"
import { Plus, Search, Edit2, Trash2, UserCheck, UserX } from "lucide-react"
import { toast } from "sonner"

// Components
import HeaderPage from "@/components/layout/header-page"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { UniversalDataTable } from "@/components/layout/universal-data-table"
import { columns, UserData } from "./columns"
import { UserFormDialog, UserItem } from "./user-form-dialog"

import { userService } from "@/lib/api/user.service"


// Data Dummy Awal
const INITIAL_USERS: UserData[] = [
  { id: "1", name: "Ardi Artax", email: "admin@ardiartax.com", role: "super_admin", status: "active" },
  { id: "2", name: "Jane Smith", email: "janesmith@mail.com", role: "admin", status: "active" },
  { id: "3", name: "Rian Ferdinand", email: "rian@mail.com", role: "user", status: "inactive" },
]

export default function UserClient() {
  const [users, setUsers] = useState<UserData[]>(INITIAL_USERS)
  const [searchQuery, setSearchQuery] = useState("")
  
  // State Dialog Control
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<"create" | "update">("create")
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)

  const fetchUsers = useCallback(async () => {
  try {
    const data = await userService.getAll()
    setUsers(data)
  } catch (error) {
    toast.error("Gagal memuat data pengguna")
  }
}, []) // Array kosong jika tidak ada dependensi state eksternal

// 2. Panggil di dalam useEffect dengan mendaftarkannya sebagai dependensi
useEffect(() => {
  fetchUsers()
}, [fetchUsers])

  // Filter User berdasarkan pencarian Nama / Email
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

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

  const handleDeleteTrigger = (user: UserData) => {
    setSelectedUser(user)
    
  }

  const handleFormSubmit = async (data: Omit<UserData, "id"> & { id?: string }) => {
    // Simulasi delay hit API
    await new Promise((resolve) => setTimeout(resolve, 800))

    if (dialogMode === "create") {
      const newUser: UserItem = {
        id: uuidv4(),
        name: data.name,
        email: data.email,
        role: data.role,
        status: data.status
      }
      setUsers([newUser, ...users])
      toast.success("User berhasil ditambahkan")
    } else {
      setUsers(users.map(u => u.id === data.id ? { ...u, ...data } as UserItem : u))
      toast.success("Data user berhasil diperbarui")
    }
  }

  const handleDeleteUser = (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus user ${name}?`)) {
      setUsers(users.filter(u => u.id !== id))
      toast.success("User berhasil dihapus")
    }
  }

  const getRoleBadge = (role: UserItem["role"]) => {
    switch (role) {
      case "super_admin": return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 shadow-none border-none">Super Admin</Badge>
      case "admin": return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 shadow-none border-none">Admin</Badge>
      default: return <Badge variant="secondary" className="shadow-none border-none">User</Badge>
    }
  }

  return (
    <div className="pb-6 pt-3 px-6 space-y-6">
      {/* Header */}
      <HeaderPage title="User Management" description="Kelola pengguna dan akses mereka" />

      {/* Toolbar (Search & Add Button) */}
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
        <UniversalDataTable 
          columns={columns} 
          data={users}
          // Jika UniversalDataTable membutuhkan filter/search default bawaan,
          // Anda biasanya dapat melemparkan props config search-nya di sini.
        />
      </div>

      {/* Form Dialog (Dinamis Create/Update) */}
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
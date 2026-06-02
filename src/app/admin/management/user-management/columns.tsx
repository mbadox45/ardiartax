// src/app/admin/management/user-management/columns.tsx
"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { ColumnDef, Row } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit2, Trash2, KeyRound, CheckCircle2, XCircle } from "lucide-react"

export type UserData = {
  id: number | string
  name: string
  username: string
  role: "super_admin" | "admin" | "user"
  group_id: number
  group_name?: string // Opsional, jika API menyertakan nama grupnya langsung
  is_active?: boolean // Menyesuaikan Swagger, status keaktifan menggunakan boolean
}

// Komponen Khusus untuk Kolom Aksi
const ActionsCell = ({ row }: { row: Row<UserData> }) => {
  const user = row.original

  const handleEdit = () => {
    window.dispatchEvent(new CustomEvent("user-action-edit", { detail: user }))
  }

  const handleDelete = () => {
    window.dispatchEvent(new CustomEvent("user-action-delete", { detail: user }))
  }

  const handleResetPassword = () => {
    window.dispatchEvent(new CustomEvent("user-action-reset-password", { detail: user }))
  }

  return (
    <div className="flex items-center justify-end gap-1">
      {/* Tombol Reset Password */}
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8 text-gray-600 hover:text-amber-600 hover:bg-amber-50"
        title="Reset Password"
        onClick={handleResetPassword}
      >
        <KeyRound className="w-3.5 h-3.5" />
      </Button>

      {/* Tombol Edit */}
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8 text-gray-600 hover:text-blue-600 hover:bg-blue-50"
        title="Ubah User"
        onClick={handleEdit}
      >
        <Edit2 className="w-3.5 h-3.5" />
      </Button>

      {/* Tombol Delete */}
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8 text-gray-600 hover:text-red-600 hover:bg-red-50"
        title="Hapus User"
        onClick={handleDelete}
      >
        <Trash2 className="w-3.5 h-3.5" />
      </Button>
    </div>
  )
}

export const columns: ColumnDef<UserData>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "Nama Lengkap",
    cell: ({ row }) => <div className="font-medium text-gray-900">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "username",
    header: "Username",
    cell: ({ row }) => <div className="text-muted-foreground font-mono text-xs">{row.getValue("username")}</div>,
  },
  {
    accessorKey: "group_name",
    header: "Grup / Divisi",
    cell: ({ row }) => {
      const groupName = row.getValue("group_name") as string
      const groupId = row.original.group_id
      return (
        <div className="text-sm text-gray-700">
          {groupName || `Grup ID #${groupId}`}
        </div>
      )
    },
  },
  {
    accessorKey: "role",
    header: "Role Akses",
    cell: ({ row }) => {
      const role = row.getValue("role") as UserData["role"]
      
      if (role === "super_admin") {
        return <Badge className="bg-red-700 text-white shadow-none border-none text-xs font-medium">Super Admin</Badge>
      } else if (role === "admin") {
        return <Badge className="bg-blue-700 text-white shadow-none border-none text-xs font-medium">Admin</Badge>
      } else if (role === "user_tax") {
        return <Badge className="bg-amber-500 text-white shadow-none border-none text-xs font-medium">User Tax</Badge>
      } else {
        return <Badge variant="secondary" className="shadow-none border-none text-xs font-medium">User</Badge>
      }
    },
  },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.getValue("is_active") ?? true // Fallback true jika nilainya kosong
      
      return (
        <Badge 
          variant={isActive ? "default" : "secondary"}
          className={`gap-1 text-white text-xs shadow-none border-none ${
            isActive ? "bg-green-700" : "bg-gray-500"
          }`}
        >
          {isActive ? (
            <>
              <CheckCircle2 className="size-3" /> Aktif
            </>
          ) : (
            <>
              <XCircle className="size-3" /> Nonaktif
            </>
          )}
        </Badge>
      )
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right pr-4">Aksi</div>,
    cell: ({ row }) => <ActionsCell row={row} />,
  },
]
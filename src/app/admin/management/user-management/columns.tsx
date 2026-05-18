// src/app/admin/management/user-management/columns.tsx
"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { ColumnDef, Row } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit2, Trash2, CheckCircle2, XCircle } from "lucide-react"

export type UserData = {
  id: string
  name: string
  email: string
  role: "super_admin" | "admin" | "user"
  status: "active" | "inactive"
}

// Komponen Khusus untuk Kolom Aksi (Edit & Delete)
const ActionsCell = ({ row }: { row: Row<UserData> }) => {
  const user = row.original

  const handleEdit = () => {
    // Memicu custom event yang nantinya akan didengar di users-client.tsx
    const event = new CustomEvent("user-action-edit", { detail: user })
    window.dispatchEvent(event)
  }

  const handleDelete = () => {
    // Memicu custom event untuk delete
    const event = new CustomEvent("user-action-delete", { detail: user })
    window.dispatchEvent(event)
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8 text-gray-600 hover:text-blue-600 hover:bg-blue-50"
        onClick={handleEdit}
      >
        <Edit2 className="w-3.5 h-3.5" />
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8 text-gray-600 hover:text-red-600 hover:bg-red-50"
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
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => <div className="text-muted-foreground font-mono text-xs">{row.getValue("email")}</div>,
  },
  {
    accessorKey: "role",
    header: "Role Akses",
    cell: ({ row }) => {
      const role = row.getValue("role") as UserData["role"]
      
      if (role === "super_admin") {
        return <Badge className="bg-red-700 text-white shadow-none border-none text-xs font-medium">Super Admin</Badge>
      }
      if (role === "admin") {
        return <Badge className="bg-blue-700 text-white shadow-none border-none text-xs font-medium">Admin</Badge>
      }
      return <Badge variant="secondary" className="shadow-none border-none text-xs font-medium">User</Badge>
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as UserData["status"]
      
      return (
        <Badge 
          variant={status === "active" ? "default" : "secondary"}
          className={`gap-1 text-white text-xs shadow-none border-none ${
            status === "active" ? "bg-green-700" : "bg-gray-500"
          }`}
        >
          {status === "active" ? (
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
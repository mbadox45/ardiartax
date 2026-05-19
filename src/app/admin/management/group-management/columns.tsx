// src/app/admin/management/group-management/columns.tsx
"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { ColumnDef, Row } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit2, Trash2, CheckCircle2, XCircle } from "lucide-react"

export type GroupData = {
    id: number
    name: string
    parent_id: number | null
    parent_name?: string // Optional jika API menyertakan nama parent-nya langsung
    is_active: boolean
}

const ActionsCell = ({ row }: { row: Row<GroupData> }) => {
    const group = row.original

    const handleEdit = () => {
        window.dispatchEvent(new CustomEvent("group-action-edit", { detail: group }))
    }

    const handleDelete = () => {
        window.dispatchEvent(new CustomEvent("group-action-delete", { detail: group }))
    }

    return (
        <div className="flex items-center justify-end gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-600 hover:text-blue-600 hover:bg-blue-50" onClick={handleEdit}>
                <Edit2 className="w-3.5 h-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-600 hover:text-red-600 hover:bg-red-50" onClick={handleDelete}>
                <Trash2 className="w-3.5 h-3.5" />
            </Button>
        </div>
    )
}

export const columns: ColumnDef<GroupData>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label="Select row" />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "name",
        header: "Nama Grup",
        cell: ({ row }) => <div className="font-medium text-gray-900">{row.getValue("name")}</div>,
    },
    {
        accessorKey: "parent_id",
        header: "ID Induk (Parent)",
        cell: ({ row }) => {
            const pid = row.getValue("parent_id")
            return <div className="text-muted-foreground font-mono text-xs">{pid ? `#${pid}` : "— (Root)"}</div>
        },
    },
    {
        accessorKey: "is_active",
        header: "Status",
        cell: ({ row }) => {
            const isActive = row.getValue("is_active") as boolean
            return (
                <Badge 
                variant={isActive ? "default" : "secondary"}
                className={`gap-1 text-white text-xs shadow-none border-none ${isActive ? "bg-green-700" : "bg-gray-500"}`}
                >
                {isActive ? <CheckCircle2 className="size-3" /> : <XCircle className="size-3" />}
                {isActive ? "Aktif" : "Nonaktif"}
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
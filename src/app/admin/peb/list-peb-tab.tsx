// src/app/admin/peb/list-peb-tab.tsx
"use client"
import { useEffect, useState } from "react"
import { UniversalDataTable } from "@/components/layout/universal-data-table"
import { columns, PebData } from "./columns"
import { pebService } from "@/lib/api/peb.service" // Import service
import { Loader2, AlertCircle } from "lucide-react"
import { toast } from "sonner"

interface ListPebTabProps {
    data: PebData[]
    isLoading: boolean
    selectedIds: (string | number)[]
    setSelectedIds: (ids: (string | number)[]) => void
}

export default function ListPebTab({ data, isLoading, selectedIds, setSelectedIds }: ListPebTabProps) {
    const [rowSelection, setRowSelection] = useState({})
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const selectedRows = Object.keys(rowSelection)
        const selectedRealIds = selectedRows.map((index) => {
            const rowIndex = parseInt(index)
            return data[rowIndex]?.id // Ambil ID dari data asli berdasarkan index
        }).filter(Boolean) // Pastikan ID tidak undefined

        setSelectedIds(selectedRealIds)
    }, [rowSelection, data, setSelectedIds])

    // Reset seleksi jika data di-refresh atau dihapus
    useEffect(() => {
        if (selectedIds.length === 0) {
            setRowSelection({}) // Reset seleksi
        }
    }, [selectedIds.length])
    
    if (isLoading) {
        return (
            <div className="flex h-[300px] flex-col items-center justify-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Menghubungkan ke server...</p>
            </div>
        )
    }

    return (
        <div className="py-4">
            <UniversalDataTable columns={columns}  data={data}  />
        </div>
    )
}
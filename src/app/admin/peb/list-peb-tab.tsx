"use client"
import { useEffect, useState, useRef, useImperativeHandle, forwardRef } from "react"
import { UniversalDataTable } from "@/components/layout/universal-data-table"
import { columns, PebData } from "./columns"
import { Loader2 } from "lucide-react"

interface ListPebTabProps {
    data: PebData[]
    isLoading: boolean
    selectedIds: (string | number)[]
    setSelectedIds: (ids: (string | number)[]) => void
}

// Gunakan forwardRef agar parent (PebClient) bisa memanggil fungsi di sini
export const ListPebTab = forwardRef<{ resetSelection: () => void }, ListPebTabProps>(
    ({ data, isLoading, selectedIds, setSelectedIds }, ref) => {
        const [rowSelection, setRowSelection] = useState({})
        const lastSentIdsRef = useRef<string>("")

        // Mengekspos fungsi ke parent melalui ref
        useImperativeHandle(ref, () => ({
            resetSelection: () => {
                setRowSelection({})
                lastSentIdsRef.current = JSON.stringify([])
            }
        }))

        // Sinkronisasi SEARAH: UI (rowSelection) -> Parent (selectedIds)
        useEffect(() => {
            const selectedIndices = Object.keys(rowSelection)
            const currentIds = selectedIndices
                .map((index) => data[parseInt(index)]?.id)
                .filter(Boolean) as (string | number)[]

            const idsString = JSON.stringify(currentIds)

            // Hanya update jika data benar-benar berubah untuk performa
            if (idsString !== lastSentIdsRef.current) {
                lastSentIdsRef.current = idsString
                setSelectedIds(currentIds)
            }
        }, [rowSelection, data, setSelectedIds])

        if (isLoading) {
            return (
                <div className="flex h-[300px] flex-col items-center justify-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Memuat data PEB...</p>
                </div>
            )
        }

        return (
            <div className="py-4">
                <UniversalDataTable 
                    columns={columns} 
                    data={data} 
                    rowSelection={rowSelection} 
                    onRowSelectionChange={setRowSelection} 
                />
            </div>
        )
    }
)

ListPebTab.displayName = "ListPebTab"
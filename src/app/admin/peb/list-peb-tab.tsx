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
}

export default function ListPebTab({ data, isLoading }: ListPebTabProps) {

    const [error, setError] = useState<string | null>(null)
    
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
            <UniversalDataTable columns={columns}  data={data} />
        </div>
    )
}
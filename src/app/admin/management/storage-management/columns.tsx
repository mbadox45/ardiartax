// src/app/admin/management/storage-management/columns.tsx
"use client"

import { ColumnDef, Row } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { HardDrive } from "lucide-react"

export type StorageData = {
  user_id: number
  name: string
  username: string
  max_storage_bytes: number
  used_storage_bytes: number
}

// =========================================================
// HELPER: Fungsi Konversi Satuan Bytes ke Unit Tertinggi (B - TB)
// =========================================================
function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 B"

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ["B", "KB", "MB", "GB", "TB"]

  // Menentukan indeks unit (0 = B, 1 = KB, 2 = MB, dst)
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  // Menjaga jika nilai i melampaui indeks array sizes yang tersedia
  const unitIndex = Math.min(i, sizes.length - 1)

  // Hitung hasil konversi nilainya
  const value = parseFloat((bytes / Math.pow(k, unitIndex)).toFixed(dm))
  
  return `${value} ${sizes[unitIndex]}`
}

const ActionsCell = ({ row }: { row: Row<StorageData> }) => {
  const item = row.original

  const handleAddQuota = () => {
    window.dispatchEvent(new CustomEvent("storage-action-quota", { detail: item }))
  }

  return (
    <div className="flex items-center justify-end">
      <Button 
        variant="outline" 
        size="sm" 
        className="h-8 border-blue-200 text-blue-600 hover:bg-blue-50 gap-1.5"
        onClick={handleAddQuota}
      >
        <HardDrive className="w-3.5 h-3.5" />
        Tambah Kuota
      </Button>
    </div>
  )
}

export const columns: ColumnDef<StorageData>[] = [
  {
    accessorKey: "name",
    header: "Nama Pengguna",
    cell: ({ row }) => (
      <div>
        <div className="font-medium text-gray-900">{row.getValue("name")}</div>
        <div className="text-xs text-muted-foreground font-mono">{row.original.username}</div>
      </div>
    ),
  },
  {
    accessorKey: "usage",
    header: "Kapasitas & Penggunaan",
    cell: ({ row }) => {
      const used = row.original.used_storage_bytes
      const total = row.original.max_storage_bytes
      
      // Hitung persentase penggunaan secara aman
      const percentage = total > 0 ? Math.min(Math.round((used / total) * 100), 100) : 0
      
      // Tentukan warna bar berdasarkan kapasitas yang terpakai
      const barColor = percentage > 85 ? "bg-red-600" : percentage > 60 ? "bg-amber-500" : "bg-blue-600"

      return (
        <div className="w-full max-w-xs space-y-1.5">
          <div className="flex justify-between text-xs font-medium">
            {/* Format tampilan menggunakan helper formatBytes */}
            <span className="text-gray-700">
              {formatBytes(used)} / {formatBytes(total)}
            </span>
            <span className="text-muted-foreground">{percentage}%</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden border">
            <div className={`h-full ${barColor} transition-all duration-500`} style={{ width: `${percentage}%` }} />
          </div>
        </div>
      )
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right pr-4">Aksi</div>,
    cell: ({ row }) => <ActionsCell row={row} />,
  },
]
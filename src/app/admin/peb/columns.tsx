// src/app/admin/peb/columns.tsx
"use client"

import { useState } from "react"
import Cookies from "js-cookie"
import Link from "next/link" // Pastikan import ini ada
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Clock, FileText, Loader2 } from "lucide-react"
import { Row } from "@tanstack/react-table" // Import tipe Row


export type PebData = {
  id: string
  document_number: string
  buyer_name: string
  document_date: string
  status: "Draft" | "Terkirim" | "Disetujui"
  nilai_fob: number
  nilai_tukar: number
}

// 1. Buat komponen khusus untuk kolom ini
const DocumentNumberCell = ({ row }: { row: Row<PebData> }) => {
  const [isOpening, setIsOpening] = useState(false)
  const docNumber = row.getValue("document_number") as string

  const handleViewFile = async () => {
    setIsOpening(true)
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
    const peb_id = row.original.id
    const token = Cookies.get("access_token")

    try {
      const response = await fetch(`${API_BASE_URL}/peb/${peb_id}/view`, {
        headers: { "Authorization": `Bearer ${token}` },
      })

      if (!response.ok) throw new Error("Gagal mengambil file")

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      window.open(url, "_blank")
      setTimeout(() => window.URL.revokeObjectURL(url), 100)
    } catch (error) {
      alert("Gagal membuka file.")
    } finally {
      setIsOpening(false)
    }
  }

  return (
    <div 
      onClick={handleViewFile}
      className={`flex items-center gap-2 font-medium text-blue-600 hover:underline cursor-pointer ${
        isOpening ? "opacity-50 pointer-events-none" : ""
      }`}
    >
      {isOpening ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <FileText className="size-4 text-muted-foreground" />
      )}
      {docNumber}
    </div>
  )
}

export const columns: ColumnDef<PebData>[] = [
  {
    accessorKey: "document_number",
    header: "Nomor Dokumen",
    cell: ({ row }) => <DocumentNumberCell row={row} />,
  },
  {
    accessorKey: "buyer_name",
    header: "Buyer",
  },
  {
    accessorKey: "document_date",
    header: "Tanggal",
  },
  {
    accessorKey: "nilai_fob",
    header: "Nilai Ekspor ($)",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("nilai_fob")) || 0
      const formatted = new Intl.NumberFormat("id-ID", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount)

      return <div className="font-medium text-right font-mono">{formatted}</div>
    },
  },
  {
    accessorKey: "nilai_tukar",
    header: "Nilai Tukar (Rp)",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("nilai_tukar")) || 0
      const formatted = new Intl.NumberFormat("id-ID", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount)

      return <div className="font-medium text-right font-mono">{formatted}</div>
    },
  },
  {
    id: "total_rp",
    header: "Total (Rp)",
    cell: ({ row }) => {
      const fob = parseFloat(row.getValue("nilai_fob")) || 0
      const kurs = parseFloat(row.getValue("nilai_tukar")) || 0
      const total = fob * kurs

      const formatted = new Intl.NumberFormat("id-ID", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(total)

      return (
        <div className="font-bold text-right font-mono">
          {formatted}
        </div>
      )
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <Badge 
          variant={status === "Disetujui" ? "default" : "secondary"}
          className="gap-1 bg-green-600"
        >
          {status === "Disetujui" ? <CheckCircle2 className="size-3" /> : <Clock className="size-3" />}
          {status}
        </Badge>
      )
    },
  },
]
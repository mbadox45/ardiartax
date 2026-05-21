// src/app/admin/management/storage-management/StorageClient.tsx
"use client"

import { useState, useEffect, useCallback } from "react"
import { Search, Loader2, HardDrive, ShieldAlert } from "lucide-react"
import { toast } from "sonner"

// Components
import HeaderPage from "@/components/layout/header-page"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { UniversalDataTable } from "@/components/layout/universal-data-table"
import { columns, StorageData } from "./columns"

// Services
import { storageService } from "@/lib/api/storage.service"

function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 B"
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ["B", "KB", "MB", "GB", "TB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  const unitIndex = Math.min(i, sizes.length - 1)
  return `${parseFloat((bytes / Math.pow(k, unitIndex)).toFixed(dm))} ${sizes[unitIndex]}`
}

export default function StorageClient() {
  const [storageList, setStorageList] = useState<StorageData[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  // State Dialog Control
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<StorageData | null>(null)
  const [additionalQuota, setAdditionalQuota] = useState<string>("500") // Nilai bawaan 500 MB
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Ambil data penggunaan storan semua pengguna dari endpoint baharu
  const fetchStorageData = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await storageService.getAllUsersStorage()
      setStorageList(Array.isArray(data) ? data : [])
    } catch (error) {
      toast.error("Gagal menyinkronkan data kapasiti storan")
      setStorageList([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStorageData()
  }, [fetchStorageData])

  // Memasang Event Listener untuk menangkap aksi klik butang dari columns.tsx
  useEffect(() => {
    const handleQuotaTrigger = (e: Event) => {
      const storageItem = (e as CustomEvent).detail
      setSelectedUser(storageItem)
      setAdditionalQuota("500") // Set semula nilai input kepada asal
      setIsDialogOpen(true)
    }

    window.addEventListener("storage-action-quota", handleQuotaTrigger)
    return () => window.removeEventListener("storage-action-quota", handleQuotaTrigger)
  }, [])

  // Pengendali Hantar (Submit) Penambahan Kuota
  const handleAddQuotaSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser) return

    setIsSubmitting(true)
    try {
      await storageService.addQuota({
        user_id: Number(selectedUser.user_id),
        additional_storage_gb: Number(additionalQuota)
      })

      toast.success(`Berjaya menambah kuota sebanyak ${additionalQuota} GB untuk ${selectedUser.name}`)
      setIsDialogOpen(false)
      fetchStorageData() // Memuatkan semula data untuk mengemas kini paparan kapasiti terkini
    } catch (error: any) {
      toast.error(error.message || "Gagal menambah kapasiti kuota")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Penapisan pencarian pada jadual
  const filteredStorage = storageList.filter(item => 
    item.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.username?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="pb-6 pt-3 px-6 space-y-6">
      {/* Header */}
      <HeaderPage title="Storage Management" description="Pantau kapasiti storan fail dan urus kuota pengguna" />

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 bg-white p-3 rounded-lg border shadow-sm">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Cari nama pekerja..." 
            className="pl-9 bg-muted/40 border-none focus-visible:ring-1"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Section Jadual Data */}
      <div className="bg-white border rounded-xl shadow-sm relative min-h-[200px]">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <UniversalDataTable columns={columns} data={filteredStorage} />
        )}
      </div>

      {/* Modal Dialog: Tambah Kuota */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <form onSubmit={handleAddQuotaSubmit} className="space-y-4">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-gray-900">
                <HardDrive className="w-5 h-5 text-blue-600" />
                Tambah Kuota Storage
              </DialogTitle>
              <DialogDescription>
                Berikan kapasitis tambahan untuk akaun <strong className="text-gray-900">{selectedUser?.username}</strong> ({selectedUser?.name}).
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="grid gap-2">
                {/* Label ditukar kepada GB */}
                <Label htmlFor="quota-input">Kapasitas Tambahan (dalam GB)</Label>
                <div className="relative flex items-center">
                  <Input 
                    id="quota-input" 
                    type="number" 
                    min="1"
                    step="any" // Membolehkan admin memasukkan nilai perpuluhan seperti 0.5 GB
                    value={additionalQuota} 
                    onChange={(e) => setAdditionalQuota(e.target.value)}
                    placeholder="Contoh: 2"
                    required
                  />
                  {/* Badge unit di sebelah kanan input ditukar ke GB */}
                  <span className="absolute right-3 font-semibold text-xs text-muted-foreground bg-gray-50 px-2 py-1 rounded border">GB</span>
                </div>
              </div>

              {/* Kotak Info Pengiraan Kapasiti Menggunakan formatBytes */}
              <div className="flex gap-2.5 items-start p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-800">
                <ShieldAlert className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p>Kuota semasa: <strong>{formatBytes(selectedUser?.max_storage_bytes || 0)}</strong></p>
                  <p>
                    Selepas disimpan, kuota keseluruhan akan bertambah menjadi{" "}
                    <strong>
                      {formatBytes(
                        (selectedUser?.max_storage_bytes || 0) + (Number(additionalQuota || 0) * 1024 * 1024 * 1024)
                      )}
                    </strong>.
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>Batal</Button>
              <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white">
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Tambah Kuota"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
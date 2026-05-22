// src/app/admin/documents/sharing/doc-client.tsx
"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import HeaderPage from "@/components/layout/header-page"
import { GridView, ListView } from "../my-documents/document-views"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LayoutGrid, List, Search, Loader2, FolderOpen, ChevronRight, Home } from "lucide-react"
import { sharingService } from "@/lib/api/sharing.service"
import { toast } from "sonner"
import Cookies from "js-cookie"

interface DocumentItem {
  id: string | number
  name: string
  file_size: number | string
  file_type: string
  is_folder: boolean
  is_shared: boolean
  updated_at: string
  share_with_all?: boolean
  group_names?: string[]
}

interface PathItem {
  id: string | number
  name: string
}

// --- HELPER ENCRYPT / DECRYPT UTILITY ---
// Catatan: Jika Anda sudah memiliki encryptData & decryptData global, silakan ganti fungsi ini
const encryptData = (data: PathItem[]): string => {
  try {
    return btoa(encodeURIComponent(JSON.stringify(data)))
  } catch (e) {
    return ""
  }
}

const decryptData = (str: string): PathItem[] | null => {
  try {
    const decoded = JSON.parse(decodeURIComponent(atob(str)))
    if (Array.isArray(decoded)) {
      return decoded as PathItem[]
    }
    return null
  } catch (e) {
    return null
  }
}

export default function DocClient() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [documents, setDocuments] = useState<DocumentItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(false)
  
  // State Path untuk menyimpan history pohon direktori berkas (Breadcrumbs)
  const [path, setPath] = useState<PathItem[]>([])
  const [currentFolderId, setCurrentFolderId] = useState<string | number>(0)

  // 1. Sinkronisasi Data Path & Folder ID dari URL Parameter saat pertama kali Load
  useEffect(() => {
    const p = searchParams.get("p")
    if (p) {
      const decodedPath = decryptData(p)
      if (decodedPath && Array.isArray(decodedPath) && decodedPath.length > 0) {
        setPath(decodedPath)
        setCurrentFolderId(decodedPath[decodedPath.length - 1].id)
        return
      }
    }
    // Jika tidak ada parameter 'p', kembalikan ke Root
    setPath([])
    setCurrentFolderId(0)
  }, [searchParams])

  // Fungsi sinkronisasi perubahan path state ke URL parameter p
  const syncUrl = (newPath: PathItem[]) => {
    if (newPath.length === 0) {
      router.push(`?`)
    } else {
      const encrypted = encryptData(newPath)
      router.push(`?p=${encrypted}`)
    }
  }

  // Fetch data dari API Swagger berdasarkan currentFolderId aktif
  const fetchSharedData = useCallback(async (parentId: string | number) => {
    setLoading(true)
    try {
      const response = await sharingService.getSharedDocuments(parentId === 0 ? null : parentId)
      
      if (response.status && response.data) {
        const { folders, files } = response.data

        interface APISharedItem {
          id: string | number
          name: string
          file_size?: number | string | null
          file_type?: string
          parent_id?: string | number | null
          user_id?: number
          is_shared?: boolean
          share_with_all?: boolean
          updated_at: string
          created_at?: string
          file_path?: string | null
          group_names?: string[]
        }

        const mappedFolders = (folders || []).map((f: APISharedItem) => ({ 
          ...f, 
          is_folder: true, 
          file_type: "folder" 
        }))
        
        const mappedFiles = (files || []).map((f: APISharedItem) => ({ 
          ...f, 
          is_folder: false 
        }))
        
        setDocuments([...mappedFolders, ...mappedFiles])
      }
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Gagal memuat dokumen bersama", { position: "top-center" })
    } finally {
      setLoading(false)
    }
  }, [])

  // Memicu fetch ulang komponen setiap kali koordinat id folder berubah
  useEffect(() => {
    fetchSharedData(currentFolderId)
  }, [currentFolderId, fetchSharedData])

  // Aksi masuk ke dalam folder anak
  const handleFolderClick = (folder: DocumentItem) => {
    const newPath = [...path, { id: folder.id, name: folder.name }]
    setPath(newPath)
    setCurrentFolderId(folder.id)
    syncUrl(newPath)
  }

  // Aksi melompat balik via klik Breadcrumbs sesuai index target
  const navigateToPath = (index: number) => {
    if (index === -1) {
      // Kembali ke Root / Beranda Awal Drive
      setPath([])
      setCurrentFolderId(0)
      syncUrl([])
    } else {
      const newPath = path.slice(0, index + 1)
      const target = newPath[newPath.length - 1]
      setPath(newPath)
      setCurrentFolderId(target.id)
      syncUrl(newPath)
    }
  }

  const formatSize = (bytes: number | string) => {
    if (!bytes || isNaN(Number(bytes))) return "--"
    const num = Number(bytes)
    if (num === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(num) / Math.log(k))
    return parseFloat((num / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const handleDownloadFile = async (item: DocumentItem) => {
    const toastId = toast.loading(`Mengunduh ${item.name}...`)
    try {
      const token = Cookies.get("access_token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}/documents/${item.id}/download`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` }
      })
      if (!response.ok) throw new Error("Gagal mengunduh file")
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = item.name
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
      toast.success("Unduhan selesai", { id: toastId })
    } catch (err) {
      toast.error("Gagal mengunduh file", { id: toastId })
    }
  }

  const filteredDocuments = documents.filter((doc) =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const noAction = () => {}

  return (
    <div className="min-h-screen pb-6 pt-3 px-6 space-y-4 transition-colors">
      <HeaderPage 
        title="Document Sharing" 
        description="Akses berkas bersama dan dokumen divisi yang dibagikan untuk Anda" 
      />

      {/* Toolbar Atas: Search & View Mode Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-xl border shadow-sm">
        <div className="flex items-center gap-2 flex-1 max-w-md relative">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Cari dokumen bersama..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-gray-50/50"
          />
        </div>

        <div className="flex items-center justify-end gap-2">
          <div className="flex items-center border rounded-lg p-0.5 bg-gray-50">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode("list")}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Render Struktur Komponen Breadcrumbs Persis My Documents */}
      <div className="flex items-center flex-wrap gap-1.5 text-sm py-1">
        <button
          onClick={() => navigateToPath(-1)}
          className={`flex items-center gap-1 hover:text-blue-600 font-medium transition-colors ${
            currentFolderId === 0 ? "text-blue-600" : "text-muted-foreground"
          }`}
        >
          <Home className="w-4 h-4" />
          <span>Shared Drive</span>
        </button>

        {path.map((crumb, index) => {
          const isLast = index === path.length - 1
          return (
            <div key={crumb.id} className="flex items-center gap-1.5 animate-in fade-in-50 duration-150">
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <button
                disabled={isLast}
                onClick={() => navigateToPath(index)}
                className={`max-w-[150px] truncate font-medium transition-colors ${
                  isLast ? "text-gray-900 cursor-default" : "text-muted-foreground hover:text-blue-600"
                }`}
              >
                {crumb.name}
              </button>
            </div>
          )
        })}
      </div>

      {/* Konten Area Renderer Utama */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="text-sm text-muted-foreground">Memuat folder bersama...</span>
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="py-24 border rounded-xl bg-white text-center flex flex-col items-center justify-center p-6 border-dashed">
          <FolderOpen className="w-12 h-12 text-muted-foreground/30 mb-2" />
          <p className="text-sm font-medium text-gray-600">Tidak ada dokumen atau folder ditemukan</p>
          <p className="text-xs text-muted-foreground">Folder ini kosong atau tidak ada berkas yang dicocokkan.</p>
        </div>
      ) : viewMode === "grid" ? (
        <GridView
          documents={filteredDocuments}
          onFolderClick={handleFolderClick}
          formatSize={formatSize}
          onDownload={handleDownloadFile}
          onSelect={noAction}
          selectedIds={new Set()}
          setSelectedIds={noAction}
          onDelete={noAction}
          onRename={noAction}
          onToggleShare={noAction}
        />
      ) : (
        <ListView
          documents={filteredDocuments}
          onFolderClick={handleFolderClick}
          formatSize={formatSize}
          onDownload={handleDownloadFile}
          onSelect={noAction}
          selectedIds={new Set()}
          setSelectedIds={noAction}
          onDelete={noAction}
          onRename={noAction}
          onToggleShare={noAction}
        />
      )}
    </div>
  )
}
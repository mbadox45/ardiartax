// src/app/admin/documents/sharing/doc-client.tsx
"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import HeaderPage from "@/components/layout/header-page"
import { GridView, ListView } from "./document-views"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LayoutGrid, List, Search, Loader2, FolderOpen, ChevronRight, Home, Upload } from "lucide-react"
import { sharingService } from "@/lib/api/sharing.service"
import { documentService } from "@/lib/api/documents.service" 
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
  access_level: "editor" | "viewer"
}

interface PathItem {
  id: string | number
  name: string
  access_level?: "editor" | "viewer"
}

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
  access_level?: "editor" | "viewer" // Hak akses bawaan dari API untuk folder di tingkat root
}

// --- HELPER ENCRYPT / DECRYPT UTILITY PARAMETER URL ---
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
  const [isUploading, setIsUploading] = useState(false)
  
  // State Path & Koordinat Folder Aktif
  const [path, setPath] = useState<PathItem[]>([])
  const [currentFolderId, setCurrentFolderId] = useState<string | number>(0)

  // 🔒 STATE KONTROL HAK AKSES DAN BATAS ATAS FOLDER UTAMA
  const [currentAccessLevel, setCurrentAccessLevel] = useState<"editor" | "viewer">("viewer")
  const [rootEditorFolderId, setRootEditorFolderId] = useState<string | number | null>(null)

  // 1. Sinkronisasi URL Parameter 'p' saat Navigasi Terjadi
  useEffect(() => {
    const p = searchParams.get("p")
    if (p) {
      const decodedPath = decryptData(p)
      if (decodedPath && Array.isArray(decodedPath) && decodedPath.length > 0) {
        setPath(decodedPath)
        const currentActive = decodedPath[decodedPath.length - 1]
        setCurrentFolderId(currentActive.id)
        
        // Aturan Proteksi Root: Jika id folder aktif adalah 0 (Root), paksa menjadi "viewer"
        if (currentActive.id === 0) {
          setCurrentAccessLevel("viewer")
          setRootEditorFolderId(null)
        } else {
          setCurrentAccessLevel(currentActive.access_level || "viewer")
          
          // Cari folder tingkat teratas yang membawa status "editor" di dalam rantai path
          const firstEditor = decodedPath.find(item => item.access_level === "editor" && item.id !== 0)
          setRootEditorFolderId(firstEditor ? firstEditor.id : null)
        }
        return
      }
    }
    
    // Default Fallback: Jika di halaman beranda awal (Root Shared Drive)
    setPath([])
    setCurrentFolderId(0)
    setCurrentAccessLevel("viewer") 
    setRootEditorFolderId(null)
  }, [searchParams])

  const syncUrl = (newPath: PathItem[]) => {
    if (newPath.length === 0) {
      router.push(`?`)
    } else {
      const encrypted = encryptData(newPath)
      router.push(`?p=${encrypted}`)
    }
  }

  // 2. Fetch Data Bersama Mengikuti Tingkat Kedalaman Folder
  const fetchSharedData = useCallback(async (parentId: string | number) => {
    setLoading(true)
    try {
      const response = await sharingService.getSharedDocuments(parentId === 0 ? null : parentId)
      
      if (response.status && response.data) {
        // Menentukan tipe data folders dan files hasil dekonstruksi secara eksplisit
        const folders: APISharedItem[] = response.data.folders || []
        const files: APISharedItem[] = response.data.files || []

        // 🔒 Sekarang 'f' sudah bertipe APISharedItem, autocomplete & type-check aktif
        const mappedFolders: DocumentItem[] = folders.map((f: APISharedItem) => ({ 
          id: f.id,
          name: f.name,
          file_size: f.file_size ?? "--",
          file_type: "folder",
          is_folder: true,
          is_shared: !!f.is_shared,
          updated_at: f.updated_at,
          share_with_all: f.share_with_all,
          group_names: f.group_names,
          // PROTEKSI ROOT: Menggunakan data asli API jika di root, jika sub-folder menggunakan inheritance
          access_level: parentId === 0 ? (f.access_level || "viewer") : currentAccessLevel
        }))
        
        const mappedFiles: DocumentItem[] = files.map((f: APISharedItem) => ({ 
          id: f.id,
          name: f.name,
          file_size: f.file_size ?? 0,
          file_type: f.file_type || "unknown",
          is_folder: false,
          is_shared: !!f.is_shared,
          updated_at: f.updated_at,
          share_with_all: f.share_with_all,
          group_names: f.group_names,
          access_level: parentId === 0 ? "viewer" : currentAccessLevel
        }))
        
        setDocuments([...mappedFolders, ...mappedFiles])
      }
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Gagal memuat dokumen bersama", { position: "top-center" })
    } finally {
      setLoading(false)
    }
  }, [currentAccessLevel])

  useEffect(() => {
    fetchSharedData(currentFolderId)
  }, [currentFolderId, fetchSharedData])

  // Masuk ke dalam sub-folder
  const handleFolderClick = (folder: DocumentItem) => {
    // Tentukan level akses folder ini secara akurat sebelum dimasukkan ke riwayat path
    const targetAccess = currentFolderId === 0 ? folder.access_level : currentAccessLevel
    
    const newPath = [...path, { id: folder.id, name: folder.name, access_level: targetAccess }]
    setPath(newPath)
    setCurrentFolderId(folder.id)
    syncUrl(newPath)
  }

  // Lompat balik via klik Breadcrumbs
  const navigateToPath = (index: number) => {
    if (index === -1) {
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

  // ==========================================
  // 📁 FILE MANIPULATION ACTIONS WITH PROTECTION
  // ==========================================

  // A. Aksi Unggah Berkas (Upload File)
  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    // Pastikan ada file yang dipilih
    if (!files || files.length === 0) return;
    
    // 🔒 Proteksi Root & Otoritas Akses
    if (currentFolderId === 0) {
      toast.error("Aksi Ditolak: Tidak diizinkan mengunggah berkas langsung di tingkat Root Shared Drive.");
      return;
    }

    if (currentAccessLevel !== "editor") {
      toast.error("Aksi Ditolak: Anda tidak memiliki hak akses Editor untuk mengunggah berkas di folder ini.");
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading(`Mengunggah ${files.length} berkas...`);

    try {
      // 🛠️ SESUAIKAN DENGAN SERVICE:
      // Parameter 1: FileList (e.target.files)
      // Parameter 2: currentFolderId (number | string)
      // Parameter 3: isShared (boolean) -> Kita set true karena ini di page sharing
      await documentService.uploadFiles(
        files, 
        currentFolderId, 
        true
      ); 
      
      toast.success("Berkas berhasil diunggah", { id: toastId });
      
      // Reset input file agar bisa memilih file yang sama lagi jika perlu
      e.target.value = ""; 

      // Refresh list data berkas di folder tersebut
      fetchSharedData(currentFolderId); 
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Gagal mengunggah berkas", 
        { id: toastId }
      );
    } finally {
      setIsUploading(false);
    }
  };


  // B. Aksi Hapus Item (Delete File / Folder)
  const handleDeleteItem = async (item: DocumentItem) => {
    // 🔒 Proteksi Root & Otoritas Akses
    if (currentFolderId === 0) {
      toast.error("Aksi Ditolak: Item utama di tingkat Root tidak boleh dihapus dari drive bersama.")
      return
    }

    if (item.access_level !== "editor") {
      toast.error("Aksi Ditolak: Anda hanya memiliki akses Viewer pada berkas ini.")
      return
    }

    if (confirm(`Apakah Anda yakin ingin menghapus "${item.name}"?`)) {
      const toastId = toast.loading("Menghapus item...")
      try {
        await documentService.deleteDocument(item.id)
        toast.success("Item berhasil dihapus", { id: toastId })
        fetchSharedData(currentFolderId)
      } catch (error: unknown) {
        toast.error(error instanceof Error ? error.message : "Gagal menghapus item", { id: toastId })
      }
    }
  }

  // C. Aksi Ubah Nama Item (Rename File / Folder)
  const handleRenameItem = async (item: DocumentItem) => {
    // 🔒 Proteksi tingkat Root & Otoritas Akses
    if (currentFolderId === 0) {
      toast.error("Aksi Ditolak: Folder utama di tingkat Root tidak boleh diubah namanya.");
      return;
    }

    if (item.access_level !== "editor") {
      toast.error("Aksi Ditolak: Anda tidak memiliki otoritas Editor untuk mengubah nama item ini.");
      return;
    }

    // Ambil input nama baru di level ini jika komponen tidak menyediakannya
    const newName = prompt("Masukkan nama baru:", item.name);
    if (!newName || newName.trim() === "" || newName === item.name) return;

    try {
      await documentService.renameDocument(item.id, newName.trim());
      toast.success("Nama berhasil diperbarui");
      fetchSharedData(currentFolderId);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Gagal mengubah nama");
    }
  };

  // D. Aksi Pindah Item (Move File / Folder) - Terbatas hanya dalam ruang lingkup folder editor utama
  const handleMoveItem = async (item: DocumentItem, targetFolderId: string | number) => {
    if (item.access_level !== "editor") {
      toast.error("Aksi Ditolak: Berkas ini berada di luar otoritas edit Anda.")
      return
    }

    // 🔒 ATURAN KETAT: Periksa jika folder tujuan berada di Root (0) atau melompat sejajar/ke luar dari Root Folder Editor utamanya
    if (targetFolderId === 0 || (rootEditorFolderId && targetFolderId === rootEditorFolderId)) {
       toast.error("Batasan Keamanan: Tidak dapat memindahkan item ke luar dari direktori utama Editor Anda.")
       return
    }

    const toastId = toast.loading("Memindahkan berkas...")
    try {
      await documentService.bulkMoveDocuments([item.id], targetFolderId)
      toast.success("Item berhasil dipindahkan", { id: toastId })
      fetchSharedData(currentFolderId)
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Gagal memindahkan item", { id: toastId })
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <HeaderPage 
          title="Document Sharing" 
          description="Akses berkas bersama dan dokumen divisi yang dibagikan untuk Anda" 
        />
        
        {/* BUTTON UNGGAH: Hanya di-render jika folder saat ini bukan Root (0) DAN bertipe EDITOR */}
        {currentFolderId !== 0 && currentAccessLevel === "editor" && (
          <div className="flex items-center gap-2 animate-in fade-in zoom-in-95 duration-200">
            <label className="cursor-pointer">
              <div className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 h-9 rounded-lg shadow-sm transition-all">
                {isUploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                <span>Unggah Berkas</span>
              </div>
              <input 
                type="file" 
                className="hidden" 
                onChange={handleUploadFile} 
                disabled={isUploading} 
              />
            </label>
          </div>
        )}
      </div>

      {/* Toolbar Atas: Search & Penanda Akses Info */}
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
          {/* Badge Otoritas Hak Akses */}
          <div className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
            currentFolderId === 0 
              ? "bg-gray-100 text-gray-700 border-gray-200" 
              : currentAccessLevel === "editor"
                ? "bg-blue-50 text-blue-700 border-blue-200" 
                : "bg-amber-50 text-amber-700 border-amber-200"
          }`}>
            Lokasi: {currentFolderId === 0 ? "Shared Drive (Root)" : currentAccessLevel === "editor" ? "Mode Editor (Full Akses)" : "Mode Viewer (Hanya Baca)"}
          </div>

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

      {/* Jalur Navigasi Direktori (Breadcrumbs) */}
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

      {/* Main View Grid / List Renderer */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="text-sm text-muted-foreground">Memuat folder bersama...</span>
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="py-24 border rounded-xl bg-white text-center flex flex-col items-center justify-center p-6 border-dashed">
          <FolderOpen className="w-12 h-12 text-muted-foreground/30 mb-2" />
          <p className="text-sm font-medium text-gray-600">Tidak ada dokumen atau folder ditemukan</p>
          <p className="text-xs text-muted-foreground">Folder ini kosong atau tidak ada berkas yang cocok.</p>
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
          onDelete={handleDeleteItem}
          onRename={handleRenameItem}
          onMove={handleMoveItem} // Pastikan prop ini ditangkap di GridView Anda
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
          onDelete={handleDeleteItem}
          onRename={handleRenameItem}
          onMove={handleMoveItem} // Pastikan prop ini ditangkap di ListView Anda
          onToggleShare={noAction}
        />
      )}
    </div>
  )
}
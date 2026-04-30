// src/app/admin/documents/my-documents/mydoc-client.tsx

"use client"

import { useState, DragEvent, useRef, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { 
  FolderIcon, 
  Plus, 
  Search, 
  Grid2X2, 
  List, 
  UploadCloud,
  FilePlus,
  FolderPlus,
  Loader2,
  ChevronRight,
  Trash2,
  X,
  Share2,
} from "lucide-react"

// Components
import { GridView, ListView } from "./document-views"
import { MoveDialog } from "./move-dialog" // Import modal baru
import HeaderPage from "@/components/layout/header-page"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

// Service
import { documentService } from "@/lib/api/documents.service"
import { DeleteConfirmDialog } from "./delete-confirm-dialog"
import { encryptData, decryptData } from "@/lib/crypto"

interface DocumentItem {
    id: string | number
    name: string
    file_size: number | string
    file_type: string
    is_folder: boolean
    is_shared: boolean
    updated_at: string
}

interface PathItem {
    id: string | number
    name: string
    is_shared?: boolean // Tambahkan properti ini
}

export default function MyDocClient() {
    const router = useRouter()
    const searchParams = useSearchParams()
    
    const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set())
    
    // --- STATE INITIALIZATION ---
    // Gunakan nilai default Root agar server & client render awal sama (cegah hydration error)
    const [path, setPath] = useState<PathItem[]>([{ id: 0, name: "Root" }])
    const [currentFolderId, setCurrentFolderId] = useState<string | number>(0)
    const [isMounted, setIsMounted] = useState(false)
    
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [selectedItem, setSelectedItem] = useState<DocumentItem | null>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
    const fileInputRef = useRef<HTMLInputElement>(null)
    
    const [documents, setDocuments] = useState<DocumentItem[]>([])
    const [isLoading, setIsLoading] = useState(true)
    
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [folderName, setFolderName] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false)
    const [isMoving, setIsMoving] = useState(false)

    const [isSharing, setIsSharing] = useState(false);

    const toggleSelection = useCallback((
        id: string | number, 
        isMulti: boolean, 
        isRange?: boolean // Tambahkan '?' agar menjadi opsional
        ) => {
        setSelectedIds(prev => {
            const newSet = new Set(prev);
            
            // Jika isRange dipanggil (Shift + Klik), logika di sini
            if (isRange) {
                // ... logika range
                return new Set(newSet);
            }

            if (isMulti) {
                if (newSet.has(id)) newSet.delete(id);
                else newSet.add(id);
            } else {
                newSet.clear();
                newSet.add(id);
            }
            return new Set(newSet);
        });
    }, []);

    const clearSelection = (e: React.MouseEvent) => {
        // Cek apakah yang diklik adalah background div, bukan isinya
        if (e.target === e.currentTarget) {
            setSelectedIds(new Set())
        }
    }

    // --- HYDRATION FIX: Sync URL data after mount ---
    useEffect(() => {
        setIsMounted(true)
        const p = searchParams.get("p")
        if (p) {
            const decodedPath = decryptData(p)
            if (decodedPath && Array.isArray(decodedPath)) {
                setPath(decodedPath)
                setCurrentFolderId(decodedPath[decodedPath.length - 1].id)
            }
        }
    }, [])

    const syncUrl = useCallback((newPath: PathItem[]) => {
        const lastId = newPath[newPath.length - 1].id
        if (lastId === 0) {
            router.push("/admin/documents/my-documents")
        } else {
            const encryptedPath = encryptData(newPath)
            router.push(`/admin/documents/my-documents?p=${encryptedPath}`)
        }
    }, [router])

    const fetchDocuments = useCallback(async (parentId: string | number = 0) => {
        setIsLoading(true)
        try {
            const data = await documentService.getDocuments(parentId)
            setDocuments(data)
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan koneksi"
            toast.error(errorMessage, { position: "top-center" })
        } finally {
            setIsLoading(false)
        }
    }, [])

    // Tunggu mounted sebelum fetch untuk memastikan currentFolderId sudah benar dari URL
    useEffect(() => {
        if (isMounted) {
            fetchDocuments(currentFolderId)
        }
    }, [currentFolderId, fetchDocuments, isMounted])

    const handleUpload = async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        const currentFolderStatus = path[path.length - 1]?.is_shared || false;

        // Tampilkan loading toast
        const toastId = toast.loading(`Sedang mengunggah ${files.length} file...`);
        setIsLoading(true); // Opsional: agar muncul spinner di area konten

        try {
            await documentService.uploadFiles(files, currentFolderId, currentFolderStatus);
            
            toast.success(`File berhasil diunggah (${currentFolderStatus ? 'Shared' : 'Private'})`, { id: toastId, position: "top-center" });
            // Refresh daftar dokumen
            fetchDocuments(currentFolderId);
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : "Gagal upload";
            toast.error(msg, { id: toastId, position: "top-center" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            handleUpload(files);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleUpload(e.target.files);
        // Reset input agar bisa upload file yang sama lagi jika perlu
        e.target.value = "";
    };

    const handleFolderClick = (folder: DocumentItem) => {
        if (folder.is_folder) {
            setSelectedIds(new Set()) // Clear selection saat masuk folder baru
            const newPath = [...path, { id: folder.id, name: folder.name, is_shared: folder.is_shared }]
            setPath(newPath)
            setCurrentFolderId(folder.id)
            syncUrl(newPath)
        }
    }

    const navigateToPath = (index: number) => {
        const newPath = path.slice(0, index + 1)
        const target = newPath[newPath.length - 1]
        setSelectedIds(new Set()) // Clear selection saat masuk folder baru
        setPath(newPath)
        setCurrentFolderId(target.id)
        syncUrl(newPath)
    }

    useEffect(() => {
        const handlePopState = () => {
            const params = new URLSearchParams(window.location.search)
            const pathParam = params.get("p")
            if (pathParam) {
                const decodedPath = decryptData(pathParam)
                if (decodedPath) {
                    setPath(decodedPath)
                    setCurrentFolderId(decodedPath[decodedPath.length - 1].id)
                }
            } else {
                setPath([{ id: 0, name: "Root" }])
                setCurrentFolderId(0)
            }
        }
        window.addEventListener("popstate", handlePopState)
        return () => window.removeEventListener("popstate", handlePopState)
    }, [])

    const formatSize = (size: number | string) => {
        if (typeof size === "string") return size
        if (size === 0) return "0 Bytes"
        const k = 1024
        const sizes = ["Bytes", "KB", "MB", "GB"]
        const i = Math.floor(Math.log(Number(size)) / Math.log(k))
        return parseFloat((Number(size) / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    }

    const handleCreateFolder = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!folderName.trim()) return

        const currentFolderStatus = path[path.length - 1]?.is_shared || false;
        setIsSubmitting(true)
        try {
            await documentService.createFolder({
                name: folderName,
                parent_id: currentFolderId,
                is_folder: true,
                is_shared: currentFolderStatus
            })
            toast.success(`Folder "${folderName}" berhasil dibuat`, { duration: 3000, position: "top-center" })
            setIsDialogOpen(false)
            setFolderName("")
            fetchDocuments(currentFolderId)
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "Gagal menyimpan folder"
            toast.error(errorMessage)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async () => {
        if (!selectedItem) return
        try {
            await documentService.deleteDocument(selectedItem.id)
            toast.success(`${selectedItem.name} berhasil dihapus`)
            fetchDocuments(currentFolderId)
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : "Gagal menghapus"
            toast.error(msg)
        }
    }

    const handleDeleteBulk = async () => {
        if (selectedIds.size === 0) return;

        const count = selectedIds.size;
        const confirmDelete = confirm(`Apakah Anda yakin ingin menghapus ${count} item yang dipilih?`);
        
        if (!confirmDelete) return;

        const toastId = toast.loading(`Menghapus ${count} item...`);
        setIsSubmitting(true);

        try {
            const idsArray = Array.from(selectedIds);
            await documentService.bulkDeleteDocuments(idsArray);
            
            toast.success(`${count} item berhasil dihapus`, { id: toastId, position: "top-center" });
            
            // 1. Bersihkan pilihan
            setSelectedIds(new Set());
            
            // 2. Refresh data
            fetchDocuments(currentFolderId);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan saat menghapus";
            toast.error(errorMessage, { id: toastId, position: "top-center" });
        } finally {
            setIsSubmitting(false);
        }
    }

    const openDeleteConfirm = (item: DocumentItem) => {
        setSelectedItem(item)
        setDeleteDialogOpen(true)
    }

    const handleBulkMove = async (targetId: string | number, targetSharedStatus: boolean) => {
        const idsArray = Array.from(selectedIds)
        const toastId = toast.loading(`Memindahkan ${idsArray.length} item...`)
        setIsMoving(true)

        console.log("Memindahkan item:", idsArray, "ke folder:", targetId)
        try {
            console.log(targetSharedStatus)
            await documentService.bulkMoveDocuments(idsArray, targetId)
            if (targetId !== 0) {
                // Jika pindah ke folder tertentu, ikuti status folder tersebut (Inherit)
                await documentService.bulkShareDocuments(idsArray, targetSharedStatus);
                toast.success(`Berhasil dipindahkan & status disesuaikan dengan folder tujuan`, { id: toastId });
            } else {
                // Jika pindah ke Root, biarkan status shared dokumen apa adanya (Keep original)
                toast.success(`Berhasil dipindahkan ke Root (Status akses tetap)`, { id: toastId });
            }
            
            setIsMoveDialogOpen(false)
            setSelectedIds(new Set())
            fetchDocuments(currentFolderId)
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "Gagal memindahkan item", { id: toastId, position: "top-center" })
        } finally {
            setIsMoving(false)
        }
    }

    const handleBulkShare = async (status: boolean) => {
        const idsArray = Array.from(selectedIds);
        const actionText = status ? "Membagikan" : "Membatalkan berbagi";
        const toastId = toast.loading(`${actionText} ${idsArray.length} item...`);
        setIsSharing(true);

        try {
            await documentService.bulkShareDocuments(idsArray, status);
            toast.success(`Berhasil memperbarui akses ${idsArray.length} item`, { id: toastId, position: "top-center" });
            
            // Bersihkan seleksi dan refresh data
            setSelectedIds(new Set());
            fetchDocuments(currentFolderId);
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : "Gagal memperbarui akses share", { id: toastId, position: "top-center" });
        } finally {
            setIsSharing(false);
        }
    };

    const handleToggleShareConfirm = async (item: DocumentItem) => {
        const confirmMessage = `Batalkan akses berbagi untuk "${item.name}"? Semua orang yang memiliki akses tidak akan bisa membukanya lagi.`;
        
        if (window.confirm(confirmMessage)) {
            const toastId = toast.loading("Membatalkan berbagi...");
            try {
            await documentService.bulkShareDocuments([item.id], false);
            toast.success("Akses berbagi dicabut", { id: toastId });
            fetchDocuments(currentFolderId); // Refresh data
            } catch (error) {
            toast.error("Gagal mengubah status", { id: toastId });
            }
        }
    };

    // Hindari flicker konten yang salah sebelum mount selesai
    if (!isMounted) return (
        <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        </div>
    )

    return (
        <div 
            className={`min-h-screen pb-6 pt-3 px-6 space-y-4 transition-colors ${isDragging ? "bg-blue-50/50" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={clearSelection} // Pasang di sini
        >
            {isDragging && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-blue-500/10 backdrop-blur-sm pointer-events-none">
                    <div className="bg-white p-8 rounded-xl shadow-2xl border-2 border-dashed border-blue-500 flex flex-col items-center gap-4">
                        <UploadCloud className="w-12 h-12 text-blue-500 animate-bounce" />
                        <p className="text-xl font-semibold text-blue-600">Lepaskan untuk Upload</p>
                    </div>
                </div>
            )}

            {/* Input file tersembunyi */}
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                multiple 
                onChange={handleFileChange} // Tambahkan onChange
            />

            <HeaderPage title="My Documents" description="Kelola dan simpan dokumen perusahaan secara aman" />

            {selectedIds.size > 0 ? (
                <div 
                    className="flex items-center justify-between bg-gray-500 text-white px-4 py-3 rounded-lg shadow-lg animate-in fade-in slide-in-from-top-2"
                    onClick={(e) => e.stopPropagation()} // Cegah klik di sini menghapus seleksi
                >
                    <div className="flex items-center gap-2">
                        <Button 
                            variant="ghost" 
                            className="text-white hover:bg-amber-500 h-8 hover:text-white"
                            size="icon"
                            onClick={() => setSelectedIds(new Set())}
                        >
                            <X className="w-4 h-4" />
                        </Button>
                        <span className="text-sm font-medium">{selectedIds.size} item terpilih</span>
                    </div>
                    <div className="flex items-center md:gap-2 gap-1">
                        <Button variant="ghost" className="text-white hover:bg-red-500 hover:text-white gap-2 h-9" onClick={handleDeleteBulk}>
                            <Trash2 className="w-4 h-4" />
                            <span className="sm:block hidden">Hapus</span>
                        </Button>
                        <Button variant="ghost" className="text-white hover:bg-blue-700 hover:text-white gap-2 h-9" onClick={() => setIsMoveDialogOpen(true)}>
                            <FolderPlus className="w-4 h-4" />
                            <span className="sm:block hidden">Pindah</span>
                        </Button>
                        <Button variant="ghost" className="text-white hover:bg-cyan-700 hover:text-white gap-2 h-9" onClick={() => handleBulkShare(true)} // Set is_shared: true
                            disabled={isSharing}>
                            {isSharing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
                            <span className="sm:block hidden">{isSharing ? "Sedang membagikan..." : "Bagikan"}</span>
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="flex items-center justify-between gap-4 bg-white p-2 rounded-lg border shadow-sm" onClick={(e) => e.stopPropagation()}>
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input placeholder="Cari dokumen..." className="pl-9 bg-muted/40 border-none focus-visible:ring-1" />
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <div className="flex bg-muted rounded-md p-1 mr-2">
                            <Button 
                                variant={viewMode === "grid" ? "outline" : "ghost"} 
                                size="icon" className={`h-8 w-8 ${viewMode === "grid" ? "bg-white shadow-sm" : ""}`}
                                onClick={() => setViewMode("grid")}
                            >
                                <Grid2X2 className="w-4 h-4" />
                            </Button>
                            <Button 
                                variant={viewMode === "list" ? "outline" : "ghost"}
                                size="icon" className={`h-8 w-8 ${viewMode === "list" ? "bg-white shadow-sm" : ""}`}
                                onClick={() => setViewMode("list")}
                            >
                                <List className="w-4 h-4" />
                            </Button>
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="secondary" className="gap-2 px-4 py-5 shadow-sm">
                                    <Plus className="w-5 h-5 text-blue-600 stroke-[3px]" /> 
                                    <span className="font-semibold text-sm">New</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl shadow-xl border-muted/50">
                                <DropdownMenuItem onSelect={() => setIsDialogOpen(true)} className="gap-3 py-2.5 cursor-pointer rounded-lg">
                                    <FolderPlus className="w-4 h-4 text-muted-foreground" />
                                    <span>Folder baru</span>
                                </DropdownMenuItem>
                                <div className="h-px bg-muted my-1" />
                                <DropdownMenuItem onClick={() => fileInputRef.current?.click()} className="gap-3 py-2.5 cursor-pointer rounded-lg">
                                    <FilePlus className="w-4 h-4 text-muted-foreground" />
                                    <span>Upload file</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            )}


            {/* Breadcrumbs */}
            <div className="flex items-center gap-1 text-sm text-muted-foreground px-1 overflow-x-auto no-scrollbar" onClick={(e) => e.stopPropagation()}>
                <span className="select-none whitespace-nowrap">My Drive</span>
                {path.map((item, index) => (
                    <div key={item.id} className="flex items-center gap-1">
                        <ChevronRight className="w-4 h-4 flex-shrink-0" />
                        <span 
                            className={`cursor-pointer whitespace-nowrap hover:text-blue-600 ${index === path.length - 1 ? "font-bold text-foreground" : ""}`}
                            onClick={() => navigateToPath(index)}
                        >
                            {item.name}
                        </span>
                    </div>
                ))}
            </div>

            {/* Tips: Anda bisa menambahkan informasi visual saat loading upload */}
            {isLoading && (
                <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border flex items-center gap-3 z-50">
                    <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                    <span className="text-sm font-medium">Memproses dokumen...</span>
                </div>
            )}

            <div className="w-full">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                    </div>
                ) : documents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed rounded-xl text-muted-foreground">
                        <FolderIcon className="h-12 w-12 mb-2 opacity-20" />
                        <p>Folder ini kosong</p>
                    </div>
                ) : viewMode === "grid" ? (
                    <GridView 
                        documents={documents} 
                        onFolderClick={handleFolderClick} 
                        formatSize={formatSize} 
                        onDelete={openDeleteConfirm} 
                        selectedIds={selectedIds} 
                        setSelectedIds={setSelectedIds}
                        onSelect={toggleSelection} 
                        onToggleShare={handleToggleShareConfirm}
                    />
                ) : (
                    <ListView 
                        documents={documents} 
                        onFolderClick={handleFolderClick} 
                        formatSize={formatSize} 
                        onDelete={openDeleteConfirm} 
                        selectedIds={selectedIds} 
                        setSelectedIds={setSelectedIds}
                        onSelect={toggleSelection} 
                        onToggleShare={handleToggleShareConfirm}
                    />
                )}
            </div>

            <DeleteConfirmDialog isOpen={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} onConfirm={handleDelete} itemName={selectedItem?.name || ""} />

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <form onSubmit={handleCreateFolder}>
                        <DialogHeader>
                            <DialogTitle>Folder Baru</DialogTitle>
                            <DialogDescription>Masukkan nama untuk folder baru Anda.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Nama Folder</Label>
                                <Input id="name" value={folderName} onChange={(e) => setFolderName(e.target.value)} placeholder="Untitled Folder" autoFocus required />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>Batal</Button>
                            <Button type="submit" disabled={isSubmitting || !folderName.trim()} className="bg-blue-600 hover:bg-blue-700 text-white">
                                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Simpan"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <MoveDialog 
                isOpen={isMoveDialogOpen}
                onOpenChange={setIsMoveDialogOpen}
                selectedCount={selectedIds.size}
                onConfirm={(id, shared) => handleBulkMove(id, shared)}
                isSubmitting={isMoving}
            />
        </div>
    )
}
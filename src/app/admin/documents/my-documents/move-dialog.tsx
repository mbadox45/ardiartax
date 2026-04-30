// src/app/admin/documents/my-documents/move-dialog.tsx

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { FolderIcon, Loader2, ChevronRight, ArrowLeft } from "lucide-react"
import { documentService } from "@/lib/api/documents.service"
import { toast } from "sonner"

// Definisikan tipe data item secara spesifik
interface FolderItem {
    id: string | number
    name: string
    is_folder: boolean
    is_shared: boolean
}

interface MoveDialogProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    selectedCount: number
    onConfirm: (targetId: string | number, targetSharedStatus: boolean) => void
    isSubmitting: boolean
}

export function MoveDialog({ isOpen, onOpenChange, selectedCount, onConfirm, isSubmitting }: MoveDialogProps) {
    // Ganti any[] menjadi FolderItem[]
    const [folders, setFolders] = useState<FolderItem[]>([])
    const [loading, setLoading] = useState(false)
    const [currentViewId, setCurrentViewId] = useState<string | number>(0)
    const [selectedFolderId, setSelectedFolderId] = useState<FolderItem | null>(null)

    useEffect(() => {
        if (isOpen) {
            fetchFolders(currentViewId)
        }
        // Reset selection saat ganti folder agar tidak salah pilih
        setSelectedFolderId(null)
    }, [isOpen, currentViewId])

    const fetchFolders = async (parentId: string | number) => {
        setLoading(true)
        try {
            const data = await documentService.getDocuments(parentId)
            // Pastikan data dipetakan ke FolderItem dan difilter
            const onlyFolders = data
                .filter((item: FolderItem) => item.is_folder)
                .map((item: FolderItem) => ({
                    id: item.id,
                    name: item.name,
                    is_folder: item.is_folder,
                    is_shared: item.is_shared
                }))
        
            setFolders(onlyFolders)
        } catch (error: unknown) {
            toast.error("Gagal memuat daftar folder")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                <DialogTitle>Pindahkan {selectedCount} Item</DialogTitle>
                </DialogHeader>
                
                <div className="py-4">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-sm font-medium text-muted-foreground">Pilih folder tujuan:</p>
                        {currentViewId !== 0 && (
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setCurrentViewId(0)} 
                            className="h-7 text-xs text-blue-600 hover:text-blue-700"
                        >
                            <ArrowLeft className="w-3 h-3 mr-1" /> Kembali ke Root
                        </Button>
                        )}
                    </div>
                    
                    <div 
                        onClick={() => setSelectedFolderId({id: 0, name: "Root", is_folder: true, is_shared: false})}
                        className={`flex items-center gap-3 p-3 mb-2 cursor-pointer border rounded-lg transition-colors
                        ${selectedFolderId?.id === 0 ? "bg-blue-100 border-blue-500" : "hover:bg-gray-50"}`}
                    >
                        <FolderIcon className="w-5 h-5 text-blue-500" />
                        <span className="text-sm font-semibold text-blue-600">Pindahkan ke Root (My Drive)</span>
                    </div>
                    
                    <div className="border rounded-xl max-h-[300px] overflow-y-auto bg-muted/20">
                        {loading ? (
                        <div className="p-12 flex flex-col items-center gap-2">
                            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                            <span className="text-xs text-muted-foreground">Memuat folder...</span>
                        </div>
                        ) : folders.length === 0 ? (
                        <div className="p-12 text-center flex flex-col items-center gap-2">
                            <FolderIcon className="w-8 h-8 text-muted-foreground/30" />
                            <span className="text-sm text-muted-foreground">Tidak ada folder tujuan</span>
                        </div>
                        ) : (
                        <div className="divide-y divide-border">
                            {folders.map((folder) => (
                            <div
                                key={folder.id}
                                onClick={() => setSelectedFolderId(folder)}
                                className={`flex items-center gap-3 p-3 cursor-pointer transition-colors
                                ${selectedFolderId?.id === folder.id 
                                    ? "bg-blue-100/50" 
                                    : "hover:bg-blue-50"}`}
                            >
                                <FolderIcon className={`w-5 h-5 ${selectedFolderId?.id === folder.id ? "text-blue-600 fill-blue-600/20" : "text-amber-400 fill-amber-400/20"}`} />
                                <span className={`text-sm flex-1 truncate ${selectedFolderId?.id === folder.id ? "font-semibold text-blue-700" : ""}`}>
                                {folder.name}
                                </span>
                                <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7 hover:bg-blue-200/50" 
                                onClick={(e) => { 
                                    e.stopPropagation(); 
                                    setCurrentViewId(folder.id); 
                                }}
                                >
                                <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                            ))}
                        </div>
                        )}
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                        Batal
                    </Button>
                    <Button 
                        disabled={selectedFolderId === null || isSubmitting} 
                        onClick={() => selectedFolderId && onConfirm(selectedFolderId.id, selectedFolderId.is_shared)}
                        className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]"
                    >
                        {isSubmitting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                        "Pindahkan ke Sini"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
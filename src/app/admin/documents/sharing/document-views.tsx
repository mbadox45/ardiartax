// src/app/admin/documents/my-documents/document-views.tsx
import { useState } from "react"
import { 
  FolderIcon, FileText, Trash2,
  FileImage, FileSpreadsheet, FileJson, FileCode, FileArchive, Music, Video,
  Share2, Pencil, Download, Info, Globe, Users, Calendar, HardDrive
} from "lucide-react"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer"
import "@cyntler/react-doc-viewer/dist/index.css"
import { Button } from "@/components/ui/button"
import Cookies from "js-cookie"
import { toast } from "sonner"

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

interface ViewProps {
  documents: DocumentItem[]
  onFolderClick: (folder: DocumentItem) => void
  formatSize: (size: number | string) => string
  onDelete: (item: DocumentItem) => void
  onRename: (item: DocumentItem) => void 
  onDownload: (item: DocumentItem) => void 
  selectedIds: Set<string | number>
  onSelect: (id: string | number, isMulti: boolean) => void
  setSelectedIds: React.Dispatch<React.SetStateAction<Set<string | number>>> 
  onToggleShare: (item: DocumentItem) => void
}

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1"

const getFileConfig = (item: DocumentItem) => {
  if (item.is_folder) {
    return { Icon: FolderIcon, color: "text-amber-400 fill-amber-400" }
  }
  const type = String(item.file_type).toLowerCase()
  const extension = item.name.split('.').pop()?.toLowerCase()

  if (type.includes("image") || ["jpg", "jpeg", "png", "gif", "svg", "webp"].includes(extension || "")) return { Icon: FileImage, color: "text-pink-500" }
  if (type.includes("sheet") || type.includes("excel") || type.includes("csv") || ["xlsx", "xls", "csv"].includes(extension || "")) return { Icon: FileSpreadsheet, color: "text-emerald-600" }
  if (type.includes("pdf") || extension === "pdf") return { Icon: FileText, color: "text-red-500" }
  if (type.includes("video") || ["mp4", "mov", "avi", "mkv"].includes(extension || "")) return { Icon: Video, color: "text-purple-500" }
  if (type.includes("audio") || ["mp3", "wav", "ogg"].includes(extension || "")) return { Icon: Music, color: "text-fuchsia-500" }
  if (type.includes("json") || extension === "json") return { Icon: FileJson, color: "text-yellow-600" }
  if (["html", "css", "js", "ts", "py", "php"].includes(extension || "")) return { Icon: FileCode, color: "text-blue-600" }
  if (["zip", "rar", "7z", "tar"].includes(extension || "")) return { Icon: FileArchive, color: "text-orange-400" }
  return { Icon: FileText, color: "text-blue-500" }
}

// Ubah fungsi trigger view file agar me-return Blob URL untuk kebutuhan state React
const requestFileBlobUrl = async (id: string | number): Promise<{ url: string; mimeType: string } | null> => {
  try {
    const token = Cookies.get("access_token")
    const response = await fetch(`${BASE_URL}/documents/${id}/view`, {
      method: "GET",
      headers: { "Authorization": `Bearer ${token}` },
    })
    if (!response.status) throw new Error("Gagal memuat dokumen")
    
    const mimeType = response.headers.get("content-type") || "application/octet-stream"
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    return { url, mimeType }
  } catch (error) {
    return null
  }
}

// Komponen Reusable isi menu
const MenuItems = ({ 
  item, onRename, onDownload, onDelete, onToggleShare, onInfoClick 
}: { 
  item: DocumentItem; 
  onRename: (item: DocumentItem) => void; 
  onDownload: (item: DocumentItem) => void; 
  onDelete: (item: DocumentItem) => void; 
  onToggleShare: (item: DocumentItem) => void;
  onInfoClick: (item: DocumentItem) => void;
}) => {
  console.log("Rendering menu for:", item)
  if (item.access_level === "editor") {
    return (
    <>
      <ContextMenuItem onClick={() => onInfoClick(item)} className="cursor-pointer font-medium text-blue-600 focus:text-blue-700 focus:bg-blue-50">
        <Info className="w-4 h-4 mr-2" /> Detail Info
      </ContextMenuItem>
      <ContextMenuItem onClick={() => onRename(item)} className="cursor-pointer">
        <Pencil className="w-4 h-4 mr-2" /> Rename
      </ContextMenuItem>
      <ContextMenuItem onClick={() => onToggleShare(item)} className="cursor-pointer">
        <Share2 className="w-4 h-4 mr-2" /> {item.is_shared ? "Unshare" : "Share"}
      </ContextMenuItem>
      <ContextMenuItem onClick={() => onDownload(item)} className="cursor-pointer">
        <Download className="w-4 h-4 mr-2" /> Download
      </ContextMenuItem>
      <ContextMenuItem 
        onClick={() => onDelete(item)} 
        className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
      >
        <Trash2 className="w-4 h-4 mr-2" /> Delete
      </ContextMenuItem>
    </>
    )
  } else {
    return (
      <>
        <ContextMenuItem onClick={() => onInfoClick(item)} className="cursor-pointer font-medium text-blue-600 focus:text-blue-700 focus:bg-blue-50">
          <Info className="w-4 h-4 mr-2" /> Detail Info
        </ContextMenuItem>
        <ContextMenuItem onClick={() => onDownload(item)} className="cursor-pointer">
          <Download className="w-4 h-4 mr-2" /> Download
        </ContextMenuItem>
      </>
    )
  }
}
  

// --- COMPONENT MODAL DETAIL INFO ---
function InfoDialog({ item, isOpen, onClose, formatSize }: { item: DocumentItem | null; isOpen: boolean; onClose: () => void; formatSize: (size: number | string) => string }) {
  if (!item) return null
  const { Icon, color } = getFileConfig(item)

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[420px]" onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gray-900">
            <Info className="w-5 h-5 text-blue-600" />
            Detail Informasi Berkas
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl border border-dashed">
            <Icon className={`w-14 h-14 ${color} mb-2`} />
            <span className="text-sm font-semibold text-gray-800 text-center max-w-[320px] break-all">{item.name}</span>
          </div>

          <div className="space-y-2.5 text-sm">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-muted-foreground flex items-center gap-1.5"><HardDrive className="w-4 h-4" /> Ukuran</span>
              <span className="font-medium text-gray-900">{item.is_folder ? "Folder" : formatSize(item.file_size)}</span>
            </div>
            
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-muted-foreground flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Modifikasi Terakhir</span>
              <span className="font-medium text-gray-900">{new Date(item.updated_at).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}</span>
            </div>

            <div className="flex flex-col gap-1.5 pt-1">
              <span className="text-muted-foreground flex items-center gap-1.5"><Share2 className="w-4 h-4" /> Status Akses Publik</span>
              <div className="p-3 rounded-lg bg-gray-50 border text-xs">
                {!item.is_shared ? (
                  <p className="text-gray-500 font-medium">🔒 Berkas ini bersifat privat (Hanya Anda)</p>
                ) : item.share_with_all ? (
                  <p className="text-emerald-600 font-semibold flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5" /> Dibagikan ke Semua Grup (All Members)
                  </p>
                ) : (
                  <div className="space-y-1">
                    <p className="text-blue-600 font-semibold flex items-center gap-1 mb-1">
                      <Users className="w-3.5 h-3.5" /> Dibagikan ke Grup Spesifik:
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {item.group_names && item.group_names.length > 0 ? (
                        item.group_names.map((name, i) => (
                          <span key={i} className="px-2 py-0.5 bg-blue-100 text-blue-700 border border-blue-200 rounded text-[11px] font-medium">
                            {name}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-400 italic">Daftar grup pembaca tidak termuat</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" onClick={onClose} className="w-full bg-gray-900 text-white hover:bg-gray-800">Tutup</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// --- NEW COMPONENT: MODAL PREVIEW DOCVIEWER ---
interface FileViewerDialogProps {
  viewingFile: { uri: string; fileName: string; fileType: string } | null
  onClose: () => void
}

function FileViewerDialog({ viewingFile, onClose }: FileViewerDialogProps) {
  if (!viewingFile) return null

  const docs = [{ uri: viewingFile.uri, fileName: viewingFile.fileName, fileType: viewingFile.fileType }]

  return (
    <Dialog open={!!viewingFile} onOpenChange={(open) => !open && onClose()}>
      {/* max-w-5xl memberikan area pandang prapanduan yang sangat luas dan nyaman */}
      <DialogContent className="sm:max-w-5xl h-[85vh] flex flex-col p-0 overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <DialogHeader className="px-6 pt-4 pb-2 border-b">
          <DialogTitle className="text-gray-900 flex items-center gap-2 truncate pr-6">
            <FileText className="w-5 h-5 text-blue-600 shrink-0" />
            <span className="truncate">Pratinjau Dokumen: {viewingFile.fileName}</span>
          </DialogTitle>
        </DialogHeader>

        {/* Kontainer Utama Renderer DocViewer */}
        <div className="flex-1 bg-gray-100 overflow-y-auto">
          <DocViewer 
            documents={docs} 
            pluginRenderers={DocViewerRenderers}
            config={{
              header: {
                disableHeader: true, // Matikan header bawaan agar menyatu dengan UI Dialog Shadcn
                disableFileName: true,
              }
            }}
            theme={{
              disableThemeScrollbar: true,
            }}
            className="h-full rounded-b-xl"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}

// --- GRID VIEW COMPONENT ---
export function GridView({ documents, onFolderClick, formatSize, onDelete, onRename, onDownload, selectedIds, setSelectedIds, onSelect, onToggleShare }: ViewProps) {
  const [infoItem, setInfoItem] = useState<DocumentItem | null>(null)
  const [viewingFile, setViewingFile] = useState<{ uri: string; fileName: string; fileType: string } | null>(null)

  const handleOpenViewer = async (item: DocumentItem) => {
    const toastId = toast.loading("Membuka berkas...")
    const res = await requestFileBlobUrl(item.id)
    if (res) {
      toast.dismiss(toastId)
      setSelectedIds(new Set())
      setViewingFile({
        uri: res.url,
        fileName: item.name,
        fileType: String(item.file_type || item.name.split('.').pop())
      })
    } else {
      toast.error("Gagal memuat pratinjau dokumen", { id: toastId })
    }
  }

  const handleCloseViewer = () => {
    if (viewingFile?.uri) {
      window.URL.revokeObjectURL(viewingFile.uri) // Hapus memori blob setelah ditutup
    }
    setViewingFile(null)
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4" onClick={(e) => e.stopPropagation()}>
        {documents.map((item) => {
          const { Icon, color } = getFileConfig(item)
          const isSelected = selectedIds.has(item.id)
          
          return (
            <ContextMenu key={item.id}>
              <ContextMenuTrigger>
                <div
                  key={item.id}
                  onClick={(e) => {
                    e.stopPropagation()
                    onSelect(item.id, e.ctrlKey || e.metaKey)
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation()
                    item.is_folder ? onFolderClick(item) : handleOpenViewer(item)
                  }}
                  className={`group relative select-none flex flex-col border rounded-xl p-3 transition-all cursor-pointer shadow-sm
                    ${isSelected ? "bg-blue-50 border-blue-500 ring-1 ring-blue-500" : "bg-white hover:border-blue-300"}`}
                >
                  {isSelected && (
                    <div className="absolute top-2 left-2 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center z-10">
                      <div className="w-1.5 h-1.5 bg-white rounded-full" />
                    </div>
                  )}
                  <div className="flex justify-between items-start mb-4">
                    <Icon className={`w-10 h-10 ${color}`} />
                    {item.is_shared && (
                      <div className="absolute top-2 right-2 bg-blue-100 p-1 rounded-full shadow-sm z-10" onClick={(e) => {
                        e.stopPropagation(); 
                        onToggleShare(item);
                      }}>
                        <Share2 className="w-3 h-3 text-blue-600" />
                      </div>
                    )}
                  </div>
                  <span className="text-sm font-medium truncate mb-1">{item.name}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {item.is_folder ? "Folder" : formatSize(item.file_size)}
                  </span>
                </div>
              </ContextMenuTrigger>
              <ContextMenuContent className="w-48">
                <MenuItems 
                  item={item} onRename={onRename} onDownload={onDownload} 
                  onDelete={onDelete} onToggleShare={onToggleShare}
                  onInfoClick={(doc) => setInfoItem(doc)}
                />
              </ContextMenuContent>
            </ContextMenu>
          )
        })}
      </div>
      
      <InfoDialog item={infoItem} isOpen={!!infoItem} onClose={() => setInfoItem(null)} formatSize={formatSize} />
      <FileViewerDialog viewingFile={viewingFile} onClose={handleCloseViewer} />
    </>
  )
}

// --- LIST VIEW COMPONENT ---
export function ListView({ documents, onFolderClick, formatSize, onDelete, onRename, onDownload, selectedIds, setSelectedIds, onSelect, onToggleShare }: ViewProps) {
  const [infoItem, setInfoItem] = useState<DocumentItem | null>(null)
  const [viewingFile, setViewingFile] = useState<{ uri: string; fileName: string; fileType: string } | null>(null)

  const handleOpenViewer = async (item: DocumentItem) => {
    const toastId = toast.loading("Membuka berkas...")
    const res = await requestFileBlobUrl(item.id)
    if (res) {
      console.log(res.url)
      toast.dismiss(toastId)
      setSelectedIds(new Set())
      setViewingFile({
        uri: res.url,
        fileName: item.name,
        fileType: String(item.file_type || item.name.split('.').pop())
      })
    } else {
      toast.error("Gagal memuat pratinjau dokumen", { id: toastId })
    }
  }

  const handleCloseViewer = () => {
    if (viewingFile?.uri) {
      window.URL.revokeObjectURL(viewingFile.uri)
    }
    setViewingFile(null)
  }

  return (
    <>
      <div className="bg-white border rounded-xl overflow-hidden shadow-sm" onClick={(e) => e.stopPropagation()}>
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b text-left">
            <tr>
              <th className="p-3 w-10"></th>
              <th className="p-3 font-semibold text-xs uppercase tracking-wider">Nama</th>
              <th className="p-3 font-semibold text-xs uppercase tracking-wider">Terakhir Diubah</th>
              <th className="p-3 font-semibold text-xs uppercase tracking-wider">Ukuran</th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody>
            {documents.map((item) => {
              const { Icon, color } = getFileConfig(item)
              const isSelected = selectedIds.has(item.id)

              return (
                <ContextMenu key={item.id}>
                  <ContextMenuTrigger asChild>
                    <tr
                      key={item.id}
                      onClick={(e) => onSelect(item.id, e.ctrlKey || e.metaKey)}
                      onDoubleClick={(e) => {
                        e.stopPropagation()
                        item.is_folder ? onFolderClick(item) : handleOpenViewer(item)
                      }}
                      className={`border-b last:border-0 transition-colors group cursor-pointer
                        ${isSelected ? "bg-blue-50" : "hover:bg-blue-50/30"}`}
                    >
                      <td className="p-3">
                        <input 
                          type="checkbox" 
                          checked={isSelected} 
                          readOnly 
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                        />
                      </td>
                      <td className="p-3 flex items-center gap-3 font-medium">
                        <Icon className={`w-4 h-4 ${color}`} />
                        {item.name}
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {new Date(item.updated_at).toLocaleDateString("id-ID")}
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {item.is_folder ? "--" : formatSize(item.file_size)}
                      </td>
                      <td className="p-3" onClick={(e) => e.stopPropagation()}>
                        {item.is_shared && (
                          <div className="bg-blue-100 p-1 rounded-full shadow-sm z-10 mx-auto w-fit" onClick={(e) => {
                            e.stopPropagation();
                            onToggleShare(item);
                          }}>
                            <Share2 className="w-3 h-3 text-blue-600" />
                          </div>
                        )}
                      </td>
                    </tr>
                  </ContextMenuTrigger>
                  <ContextMenuContent className="w-48">
                    <MenuItems 
                      item={item} onRename={onRename} onDownload={onDownload} 
                      onDelete={onDelete} onToggleShare={onToggleShare} 
                      onInfoClick={(doc) => setInfoItem(doc)}
                    />
                  </ContextMenuContent>
                </ContextMenu>
              )
            })}
          </tbody>
        </table>
      </div>

      <InfoDialog item={infoItem} isOpen={!!infoItem} onClose={() => setInfoItem(null)} formatSize={formatSize} />
      <FileViewerDialog viewingFile={viewingFile} onClose={handleCloseViewer} />
    </>
  )
}
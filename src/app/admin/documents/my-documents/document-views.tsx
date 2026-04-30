// src/app/admin/documents/my-documents/_components/document-views.tsx
import { 
  FolderIcon, FileText, MoreVertical, Trash2,
  FileImage, FileJson, FileCode, Music, Video, 
  FileSpreadsheet, FileArchive, 
  Share2
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
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
}

interface ViewProps {
  documents: DocumentItem[]
  onFolderClick: (folder: DocumentItem) => void
  formatSize: (size: number | string) => string
  onDelete: (item: DocumentItem) => void
  selectedIds: Set<string | number>
  setSelectedIds: React.Dispatch<React.SetStateAction<Set<string | number>>>
  onSelect: (id: string | number, isMulti: boolean) => void
  onToggleShare: (item: DocumentItem) => void // Properti baru
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"

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

const handleViewFile = async (id: string | number , setSelectedIds: React.Dispatch<React.SetStateAction<Set<string | number>>>) => {
  const toastId = toast.loading("Membuka file...")
  try {
    const token = Cookies.get("access_token")
    const response = await fetch(`${BASE_URL}/documents/${id}/view`, {
      method: "GET",
      headers: { "Authorization": `Bearer ${token}` },
    })
    if (!response.ok) throw new Error("Gagal memuat file")
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    window.open(url, "_blank")
    setTimeout(() => window.URL.revokeObjectURL(url), 1000)
    toast.dismiss(toastId)
    setSelectedIds(new Set())
  } catch (error) {
    toast.error("Tidak dapat melihat file", { id: toastId })
  }
}

// --- GRID VIEW COMPONENT ---
export function GridView({ documents, onFolderClick, formatSize, onDelete, selectedIds, onSelect, onToggleShare }: ViewProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4" onClick={(e) => e.stopPropagation()}>
      {documents.map((item) => {
        const { Icon, color } = getFileConfig(item)
        const isSelected = selectedIds.has(item.id)
        
        return (
          <div
            key={item.id}
            onClick={(e) => {
              e.stopPropagation()
              onSelect(item.id, e.ctrlKey || e.metaKey)
            }}
            onDoubleClick={(e) => {
              e.stopPropagation()
              item.is_folder ? onFolderClick(item) : handleViewFile(item.id, setSelectedIds => onSelect(item.id, false))
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
                  e.stopPropagation(); // Cegah Grid terpilih
                  onToggleShare(item);
                }}>
                  <Share2 className="w-3 h-3 text-blue-600" />
                </div>
              )}
              {/* <div onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onDelete(item)} className="text-destructive">
                      <Trash2 className="w-4 h-4 mr-2" /> Hapus
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div> */}
            </div>
            <span className="text-sm font-medium truncate mb-1">{item.name}</span>
            <span className="text-[10px] text-muted-foreground">
              {item.is_folder ? "Folder" : formatSize(item.file_size)}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// --- LIST VIEW COMPONENT ---
export function ListView({ documents, onFolderClick, formatSize, onDelete, selectedIds, onSelect, onToggleShare }: ViewProps) {
  return (
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
              <tr
                key={item.id}
                onClick={(e) => onSelect(item.id, e.ctrlKey || e.metaKey)}
                onDoubleClick={(e) => {
                  e.stopPropagation()
                  item.is_folder ? onFolderClick(item) : handleViewFile(item.id, setSelectedIds => onSelect(item.id, false))
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
                    <div className="bg-blue-100 p-1 rounded-full shadow-sm z-10" onClick={(e) => {
                      e.stopPropagation();
                      onToggleShare(item);
                    }}>
                      <Share2 className="w-3 h-3 text-blue-600" />
                    </div>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
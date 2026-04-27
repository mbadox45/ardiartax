// src/app/admin/documents/my-documents/_components/document-views.tsx
import { FolderIcon, FileText, MoreVertical, Trash2,
  FileImage, 
  FileJson, 
  FileCode, 
  Music, 
  Video, 
  FileSpreadsheet, // Untuk Excel/CSV
  FileArchive } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

interface DocumentItem {
  id: string | number
  name: string
  file_size: number | string
  file_type: string
  is_folder: boolean
  updated_at: string
}

interface ViewProps {
  documents: DocumentItem[]
  onFolderClick: (folder: DocumentItem) => void
  formatSize: (size: number | string) => string
  onDelete: (item: DocumentItem) => void // Tambahkan ini
}

const getFileConfig = (item: DocumentItem) => {
  if (item.is_folder) {
    return {
      Icon: FolderIcon,
      color: "text-amber-400 fill-amber-400",
    }
  }

  const type = String(item.file_type).toLowerCase()
  const extension = item.name.split('.').pop()?.toLowerCase()

  // Gambar
  if (type.includes("image") || ["jpg", "jpeg", "png", "gif", "svg", "webp"].includes(extension || "")) {
    return { Icon: FileImage, color: "text-pink-500" }
  }
  // Spreadsheet / Excel
  if (type.includes("sheet") || type.includes("excel") || type.includes("csv") || ["xlsx", "xls", "csv"].includes(extension || "")) {
    return { Icon: FileSpreadsheet, color: "text-emerald-600" }
  }
  // PDF
  if (type.includes("pdf") || extension === "pdf") {
    return { Icon: FileText, color: "text-red-500" }
  }
  // Video
  if (type.includes("video") || ["mp4", "mov", "avi", "mkv"].includes(extension || "")) {
    return { Icon: Video, color: "text-purple-500" }
  }
  // Audio
  if (type.includes("audio") || ["mp3", "wav", "ogg"].includes(extension || "")) {
    return { Icon: Music, color: "text-fuchsia-500" }
  }
  // Code / JSON
  if (type.includes("json") || extension === "json") return { Icon: FileJson, color: "text-yellow-600" }
  if (["html", "css", "js", "ts", "py", "php"].includes(extension || "")) return { Icon: FileCode, color: "text-blue-600" }
  // Archive
  if (["zip", "rar", "7z", "tar"].includes(extension || "")) return { Icon: FileArchive, color: "text-orange-400" }

  // Default
  return { Icon: FileText, color: "text-blue-500" }
}

// --- GRID VIEW COMPONENT ---
export function GridView({ documents, onFolderClick, formatSize, onDelete }: ViewProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {documents.map((item) => {
        const { Icon, color } = getFileConfig(item)
        return (
          <div
            key={item.id}
            onDoubleClick={() => onFolderClick(item)}
            className="group relative select-none flex flex-col bg-white border rounded-xl p-3 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer"
          >
            <div className="flex justify-between items-start mb-4">
              <Icon className={`w-10 h-10 ${color}`} />
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
export function ListView({ documents, onFolderClick, formatSize, onDelete }: ViewProps) {
  return (
    <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 border-b text-left">
          <tr>
            <th className="p-3 font-semibold text-xs uppercase tracking-wider">Nama</th>
            <th className="p-3 font-semibold text-xs uppercase tracking-wider">Terakhir Diubah</th>
            <th className="p-3 font-semibold text-xs uppercase tracking-wider">Ukuran</th>
            <th className="w-10"></th>
          </tr>
        </thead>
        <tbody>
          {documents.map((item) => {
            const { Icon, color } = getFileConfig(item)
            return (
              <tr
                key={item.id}
                onDoubleClick={() => onFolderClick(item)}
                className="border-b last:border-0 hover:bg-blue-50/30 transition-colors group cursor-pointer"
              >
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
                <td className="p-3">
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
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
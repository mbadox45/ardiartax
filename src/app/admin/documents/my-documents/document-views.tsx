// src/app/admin/documents/my-documents/_components/document-views.tsx
import { FolderIcon, FileText, MoreVertical, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

interface DocumentItem {
  id: string | number
  name: string
  size: number | string
  is_folder: boolean
  updated_at: string
}

interface ViewProps {
  documents: DocumentItem[]
  onFolderClick: (folder: DocumentItem) => void
  formatSize: (size: number | string) => string
  onDelete: (item: DocumentItem) => void // Tambahkan ini
}

// --- GRID VIEW COMPONENT ---
export function GridView({ documents, onFolderClick, formatSize, onDelete }: ViewProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {documents.map((item) => (
        <div
          key={item.id}
          onDoubleClick={() => onFolderClick(item)}
          className="group relative select-none flex flex-col bg-white border rounded-xl p-3 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer"
        >
          <div className="flex justify-between items-start mb-4">
            {item.is_folder ? (
              <FolderIcon className="w-10 h-10 text-amber-400 fill-amber-400" />
            ) : (
              <FileText className="w-10 h-10 text-blue-500" />
            )}
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
            {/* <MoreVertical className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100" /> */}
          </div>
          <span className="text-sm font-medium truncate mb-1">{item.name}</span>
          <span className="text-[10px] text-muted-foreground">
            {item.is_folder ? "Folder" : formatSize(item.size)}
          </span>
        </div>
      ))}
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
          {documents.map((item) => (
            <tr
              key={item.id}
              onDoubleClick={() => onFolderClick(item)}
              className="border-b last:border-0 hover:bg-blue-50/30 transition-colors group cursor-pointer"
            >
              <td className="p-3 flex items-center gap-3 font-medium">
                {item.is_folder ? (
                  <FolderIcon className="w-4 h-4 text-amber-400" />
                ) : (
                  <FileText className="w-4 h-4 text-blue-500" />
                )}
                {item.name}
              </td>
              <td className="p-3 text-muted-foreground">
                {new Date(item.updated_at).toLocaleDateString("id-ID")}
              </td>
              <td className="p-3 text-muted-foreground">
                {item.is_folder ? "--" : formatSize(item.size)}
              </td>
              <td className="p-3">
                {/* <MoreVertical className="w-4 h-4 opacity-0 group-hover:opacity-100" /> */}
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
          ))}
        </tbody>
      </table>
    </div>
  )
}
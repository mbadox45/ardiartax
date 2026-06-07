// src/app/admin/management/group-management/GroupClient.tsx
"use client"

import { useState, useEffect, useCallback } from "react"
import { Plus, Search, Loader2, Folder, FolderOpen, ChevronRight, ChevronDown, Edit2, Trash2 } from "lucide-react"
import { toast } from "sonner"

// Components
import HeaderPage from "@/components/layout/header-page"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GroupFormDialog } from "./group-form-dialog"
import { groupService } from "@/lib/api/group.service"

// Definisikan Tipe Data Rekursif untuk Struktur Tree
export interface GroupNodeData {
  id: number
  name: string
  is_active: boolean
  parent_id: number | null
  sub_groups: GroupNodeData[]
}

// 🛠️ DEFIND NEW INTERFACE: Tipe data flat untuk item dropdown parent
export interface FlatGroupData {
  id: number
  name: string
  parent_id: number | null
  is_active: boolean
}

// 🛠️ DEFIND NEW INTERFACE: Tipe data payload untuk submit form
export interface GroupFormPayload {
  id?: number
  name: string
  is_active?: boolean
  parent_id: number | null
}

export default function GroupClient() {
  const [treeData, setTreeData] = useState<GroupNodeData[]>([])
  // 🛠️ FIX 1: Ganti any[] dengan FlatGroupData[]
  const [flatGroups, setFlatGroups] = useState<FlatGroupData[]>([]) 
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  // State Dialog Control
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<"create" | "update">("create")
  // 🛠️ FIX 2: Ganti any dengan GroupNodeData | null
  const [selectedGroup, setSelectedGroup] = useState<GroupNodeData | null>(null)

  // Fetch data struktur Tree
  const fetchGroupTree = useCallback(async () => {
    setIsLoading(true)
    try {
      // 1. Ambil data hierarki (Tree)
      const treeRes = await groupService.getTree()
      setTreeData(Array.isArray(treeRes) ? treeRes : [])

      // 2. Ambil data flat (untuk kebutuhan isi dropdown parent pada Form Dialog)
      const flatRes = await groupService.getAll()
      setFlatGroups(Array.isArray(flatRes) ? flatRes : [])
    } catch (error) {
      toast.error("Gagal memuat struktur grup")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchGroupTree()
  }, [fetchGroupTree])

  const handleCreateTrigger = () => {
    setDialogMode("create")
    setSelectedGroup(null)
    setIsDialogOpen(true)
  }

  const handleEditTrigger = (group: GroupNodeData) => {
    setDialogMode("update")
    setSelectedGroup(group)
    setIsDialogOpen(true)
  }

  const handleDeleteGroup = async (group: GroupNodeData) => {
    if (confirm(`Apakah Anda yakin ingin menghapus grup "${group.name}" beserta sub-grup di dalamnya?`)) {
      try {
        await groupService.delete(group.id)
        toast.success("Grup berhasil dihapus")
        fetchGroupTree()
      } catch (error) {
        toast.error("Gagal menghapus grup")
      }
    }
  }

  // 🛠️ FIX 3: Ganti payload: any dengan tipe GroupFormPayload yang jelas
  const handleFormSubmit = async (payload: GroupFormPayload) => {
    try {
      if (dialogMode === "create") {
        await groupService.create({ name: payload.name, parent_id: payload.parent_id })
        toast.success("Grup baru berhasil dibuat")
      } else {
        if (!payload.id) return
        await groupService.update(payload.id, {
          name: payload.name,
          is_active: payload.is_active ?? true,
          parent_id: payload.parent_id
        })
        toast.success("Data grup berhasil diperbarui")
      }
      fetchGroupTree()
    } catch (error: unknown) {
      // 🛠️ FIX 4: Ganti catch (error: any) menggunakan type guard unknown & instanceof Error
      toast.error(error instanceof Error ? error.message : "Gagal memproses data")
      throw error
    }
  }

  return (
    <div className="pb-6 pt-3 px-6 space-y-6">
      {/* Header */}
      <HeaderPage title="Group Management" description="Kelola grup dan struktur hierarki organisasi" />

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 bg-white p-3 rounded-lg border shadow-sm">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Cari nama grup..." 
            className="pl-9 bg-muted/40 border-none focus-visible:ring-1"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Button onClick={handleCreateTrigger} className="bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-sm">
          <Plus className="w-4 h-4 stroke-[3px]" />
          <span className="font-semibold text-sm">Tambah Grup</span>
        </Button>
      </div>

      {/* Custom Tree List Section */}
      <div className="bg-white border rounded-xl p-4 shadow-sm min-h-[200px] relative">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : treeData.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">Belum ada grup yang terdaftar.</div>
        ) : (
          <div className="space-y-1">
            {treeData
              .filter(node => node.name.toLowerCase().includes(searchQuery.toLowerCase()) || node.sub_groups.some(sub => sub.name.toLowerCase().includes(searchQuery.toLowerCase())))
              .map((node) => (
                <GroupNode 
                  key={node.id} 
                  node={node} 
                  level={0} 
                  onEdit={handleEditTrigger} 
                  onDelete={handleDeleteGroup}
                />
              ))
            }
          </div>
        )}
      </div>

      {/* Form Dialog Modal */}
      <GroupFormDialog 
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        mode={dialogMode}
        selectedGroup={selectedGroup}
        allGroups={flatGroups} 
        onSubmit={handleFormSubmit}
      />
    </div>
  )
}

// =========================================================
// SUB-KOMPONEN: Rekursif Node List (`GroupNode`)
// =========================================================
interface GroupNodeProps {
  node: GroupNodeData
  level: number
  onEdit: (node: GroupNodeData) => void
  onDelete: (node: GroupNodeData) => void
}

function GroupNode({ node, level, onEdit, onDelete }: GroupNodeProps) {
  const [isOpen, setIsOpen] = useState(true) 
  const hasSubGroups = node.sub_groups && node.sub_groups.length > 0

  return (
    <div className="space-y-1">
      <div 
        className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 group"
        style={{ paddingLeft: `${level * 24 + 8}px` }} 
      >
        <div className="flex items-center gap-2">
          <button 
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`p-0.5 rounded hover:bg-gray-200 text-gray-500 transition-opacity ${hasSubGroups ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          >
            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>

          <span className="text-blue-500">
            {hasSubGroups && isOpen ? <FolderOpen className="w-4 h-4 fill-blue-50" /> : <Folder className="w-4 h-4 fill-blue-50" />}
          </span>

          <span className="font-medium text-sm text-gray-900">{node.name}</span>

          {!node.is_active && (
            <Badge variant="secondary" className="bg-rose-50 text-rose-600 text-[10px] px-1.5 py-0 border-none shadow-none">
              Nonaktif
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 text-gray-500 hover:text-blue-600 hover:bg-blue-50"
            onClick={() => onEdit(node)}
          >
            <Edit2 className="w-3 h-3" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 text-gray-500 hover:text-red-600 hover:bg-red-50"
            onClick={() => onDelete(node)}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {hasSubGroups && isOpen && (
        <div className="relative before:absolute before:left-[19px] before:top-0 before:bottom-3 before:w-[1px] before:bg-gray-200" style={{ marginLeft: `${level * 24}px` }}>
          <div className="space-y-1">
            {node.sub_groups.map((subNode) => (
              <GroupNode 
                key={subNode.id} 
                node={subNode} 
                level={level + 1} 
                onEdit={onEdit} 
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
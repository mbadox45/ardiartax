// src/app/admin/management/group-management/GroupClient.tsx
"use client"

import { useState, useEffect, useCallback } from "react"
import { Plus, Search, Loader2 } from "lucide-react"
import { toast } from "sonner"

// Components
import HeaderPage from "@/components/layout/header-page"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { UniversalDataTable } from "@/components/layout/universal-data-table"
import { columns, GroupData } from "./columns"
import { GroupFormDialog } from "./group-form-dialog"
import { groupService } from "@/lib/api/group.service"

export default function GroupClient() {
  const [groups, setGroups] = useState<GroupData[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  
  // State Dialog Control
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<"create" | "update">("create")
  const [selectedGroup, setSelectedGroup] = useState<GroupData | null>(null)

  // Fetch data dari API menggunakan endpoint flat list (/api/v1/groups/)
  const fetchGroups = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await groupService.getTree()
      setGroups(Array.isArray(data) ? data : [])
    } catch (error) {
      toast.error("Gagal memuat data grup")
      setGroups([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchGroups()
  }, [fetchGroups])

  // Pasang Event Listener untuk aksi Edit & Delete dari columns.tsx
  useEffect(() => {
    const handleEditEvent = (e: Event) => {
      const group = (e as CustomEvent).detail
      setDialogMode("update")
      setSelectedGroup(group)
      setIsDialogOpen(true)
    }

    const handleDeleteEvent = (e: Event) => {
      const group = (e as CustomEvent).detail
      handleDeleteGroup(group)
    }

    window.addEventListener("group-action-edit", handleEditEvent)
    window.addEventListener("group-action-delete", handleDeleteEvent)

    return () => {
      window.removeEventListener("group-action-edit", handleEditEvent)
      window.removeEventListener("group-action-delete", handleDeleteEvent)
    }
  }, [])

  // Defensif filter data array grup
  const filteredGroups = Array.isArray(groups)
    ? groups.filter(group => group?.name?.toLowerCase().includes(searchQuery.toLowerCase()))
    : []

  const handleCreateTrigger = () => {
    setDialogMode("create")
    setSelectedGroup(null)
    setIsDialogOpen(true)
  }

  const handleFormSubmit = async (payload: any) => {
    try {
      if (dialogMode === "create") {
        if (payload.parent_id === 0) payload.parent_id = null // Normalisasi parent_id untuk root grup
        await groupService.create({ name: payload.name, parent_id: payload.parent_id })
        toast.success("Grup baru berhasil dibuat")
      } else {
        await groupService.update(payload.id, {
          name: payload.name,
          is_active: payload.is_active,
          parent_id: payload.parent_id
        })
        toast.success("Data grup berhasil diperbarui")
      }
      fetchGroups() // Refresh table otomatis
    } catch (error: any) {
      toast.error(error.message || "Gagal memproses pengiriman data")
      throw error
    }
  }

  const handleDeleteGroup = async (group: GroupData) => {
    if (confirm(`Apakah Anda yakin ingin menghapus grup "${group.name}"?`)) {
      try {
        await groupService.delete(group.id)
        toast.success("Grup berhasil dihapus")
        fetchGroups()
      } catch (error) {
        toast.error("Gagal menghapus grup")
      }
    }
  }

  return (
    <div className="pb-6 pt-3 px-6 space-y-6">
      {/* Header */}
      <HeaderPage title="Group Management" description="Kelola grup dan akses mereka" />

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

      {/* Table Section */}
      <div className="bg-white border rounded-xl shadow-sm relative min-h-[200px]">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <UniversalDataTable columns={columns} data={filteredGroups} />
        )}
      </div>

      {/* Dynamic Modal Dialog */}
      <GroupFormDialog 
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        mode={dialogMode}
        selectedGroup={selectedGroup}
        allGroups={groups}
        onSubmit={handleFormSubmit}
      />
    </div>
  )
}
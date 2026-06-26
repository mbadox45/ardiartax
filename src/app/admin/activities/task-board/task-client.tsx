"use client"

import { useState } from "react"
import { v4 as uuidv4 } from "uuid"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

// Components
import HeaderPage from "@/components/layout/header-page"
import FormTask from "./form-task"
import ChartPerformance from "./chart-performance"
import { TableTask } from "./table-task"
import datatask from "./datatask.json"

interface Task {
    id: string
    title: string
    description?: string
    status: "todo" | "in_progress" | "done"
    created_at: Date
    started_at?: Date
    completed_at?: Date
}

export default function TaskClient() {
    const [tasks, setTasks] = useState<Task[]>([])
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [dialogMode, setDialogMode] = useState<"create" | "rename">("create");

    // =============================
    // Create Task
    // =============================
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setIsSubmitting(true);
        try {
            setIsDialogOpen(false);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan";
            toast.error(errorMessage, { position: "top-center" });
        } finally {
            setIsSubmitting(false);
        }
    };

    // =============================
    // Update Status
    // =============================
    const updateStatus = (id: string, status: Task["status"]) => {
        setTasks((prev) =>
            prev.map((task) => {
                if (task.id !== id) return task

                if (status === "in_progress") {
                    return { ...task, status, started_at: new Date() }
                }

                if (status === "done") {
                    return { ...task, status, completed_at: new Date() }
                }

                return { ...task, status }
            })
        )
    }

    // =============================
    // Performance Calculator
    // =============================
    const getPerformance = (task: Task) => {
        if (!task.started_at || !task.completed_at) return "-"

        const diff =
        (new Date(task.completed_at).getTime() -
            new Date(task.started_at).getTime()) /
        1000 /
        60 // menit

        if (diff < 60) return "🚀 Fast"
        if (diff < 240) return "⚡ Normal"
        return "🐢 Slow"
    }

    return (
        <div className="pb-6 pt-3 px-6 space-y-6">
            {/* Header */}
            <HeaderPage title="Activity Task" description="Kelola pekerjaan dan performa kamu" />

            {/* Task List */}
            <TableTask data={datatask} />

            {/* Form Task */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <form onSubmit={handleSubmit}>
                        <DialogHeader>
                            <DialogTitle>
                                {dialogMode === "create" ? "Tambah Task" : "Ubah Task"}
                            </DialogTitle>
                            <DialogDescription>
                                {dialogMode === "create" 
                                    ? "Tambahkan task baru untuk mengelola pekerjaan kamu." 
                                    : "Ubah task yang sudah ada untuk memperbarui informasi pekerjaan kamu."}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Judul Task</Label>
                                <Input 
                                    id="name"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder={dialogMode === "create" ? "Masukkan judul task" : "Masukkan judul baru"}
                                    autoFocus 
                                    required 
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="description">Deskripsi Task</Label>
                                <Input 
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder={dialogMode === "create" ? "Masukkan deskripsi task" : "Masukkan deskripsi baru"}
                                    autoFocus 
                                    required 
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>Batal</Button>
                            <Button 
                                type="submit" 
                                disabled={isSubmitting || !title.trim() || !description.trim() || (dialogMode === "rename")} 
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                {isSubmitting ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    dialogMode === "create" ? "Simpan" : "Perbarui"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
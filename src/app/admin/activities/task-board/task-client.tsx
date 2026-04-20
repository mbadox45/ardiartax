"use client"

import { useState } from "react"
import { v4 as uuidv4 } from "uuid"

// Components
import HeaderPage from "@/components/layout/header-page"
import FormTask from "./form-task"
import ChartPerformance from "./chart-performance"
import { TableTask } from "./table-task"
import datatask from "./datatask.json"

type Task = {
    id: string
    title: string
    status: "todo" | "in_progress" | "done"
    created_at: Date
    started_at?: Date
    completed_at?: Date
}

export default function TaskClient() {
    const [tasks, setTasks] = useState<Task[]>([])
    const [title, setTitle] = useState("")

    // =============================
    // Create Task
    // =============================
    const addTask = () => {
        if (!title) return

            const newTask: Task = {
            id: uuidv4(),
            title,
            status: "todo",
            created_at: new Date(),
        }

        setTasks((prev) => [newTask, ...prev])
        setTitle("")
    }

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

            {/* Form Task */}
            <div className="flex gap-4 items-start">
                <FormTask />
                <ChartPerformance />
            </div>

            {/* Task List */}
            <TableTask data={datatask} />
        </div>
    )
}
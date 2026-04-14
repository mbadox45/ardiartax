"use client"

import { useState, DragEvent } from "react"
import { v4 as uuidv4 } from "uuid"

// Components
import HeaderPage from "@/components/layout/header-page"

export default function MyDocClient() {
    const [files, setFiles] = useState<File[]>([])
    const [isDragging, setIsDragging] = useState(false)

    const data = [
        { id: 1, name: "Document 1", size: "2 MB" },
        { id: 2, name: "Document 2", size: "5 MB" },
        { id: 3, name: "Document 3", size: "1 MB" },
    ]

    const isDuplicate = (file: File, existing: File[]) => {
        return existing.some(
        (f) => f.name === file.name && f.size === file.size
        )
    }
    const addFiles = (newFiles: File[]) => {
        setFiles((prev) => {
            const filtered = newFiles.filter((file) => !isDuplicate(file, prev))

            if (filtered.length !== newFiles.length) {
                alert("Beberapa file duplikat tidak ditambahkan")
            }

            return [...prev, ...filtered]
        })
    }
    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        setIsDragging(false)
    
        const droppedFiles = Array.from(e.dataTransfer.files)
        addFiles(droppedFiles)
    }
    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        setIsDragging(true)
    }
    const handleDragLeave = () => {
        setIsDragging(false)
    }
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return

        const selectedFiles = Array.from(e.target.files)
        addFiles(selectedFiles)
    }

    return (
        <div className="pb-6 pt-3 px-6 space-y-6">
            {/* Header */}
            <HeaderPage title="My Documents" description="Kelola dokumen kamu" />

            {/* Document List */}

            <div className="flex gap-6">
                <div
                className={`w-full flex flex-col rounded-md border p-4 min-h-[32rem]`}
                >
                    <h3 className="text-lg font-medium">Documents</h3>
                    {data.length === 0 ? (
                        <p className="text-muted-foreground text-sm mt-2">
                        Belum ada dokumen. Tambahkan dengan drag & drop atau klik
                        upload.
                        </p>
                    ) : (
                        <ul className="mt-4 space-y-2">
                        {data.map((doc) => (
                            <li
                            key={uuidv4()}
                            className="flex items-center justify-between rounded-md border p-2"
                            >
                            <span>{doc.name}</span>
                            <span className="text-xs text-muted-foreground">
                                {doc.size}
                            </span>
                            </li>
                        ))}
                        </ul>
                    )}
                </div>
                <div
                className={`max-w-1/3 rounded-md border p-4 transition min-h-[30rem] ${
                    isDragging ? "border-blue-500 bg-blue-50" : ""
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                >
                    <h3 className="text-lg font-medium">Upload File</h3>
                    <p className="text-muted-foreground text-xs mb-4">
                        Drag & drop file di sini atau klik untuk upload.
                    </p>

                    <label className="cursor-pointer">
                        <div className="flex h-[15rem] items-center justify-center rounded-md border border-dashed">
                        <span className="text-sm text-muted-foreground">
                            Drop file di sini atau klik
                        </span>
                        </div>

                        <input
                        type="file"
                        multiple
                        className="hidden"
                        onChange={handleFileChange}
                        />
                    </label>
                </div>
            </div>
        </div>
    )

}
// src/app/admin/peb/peb-tab.tsx
"use client"

import { useState, DragEvent } from "react"

export default function PebTab() {
  const [files, setFiles] = useState<File[]>([])
  const [isDragging, setIsDragging] = useState(false)

  // =============================
  // Helpers
  // =============================
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

  // =============================
  // Handlers
  // =============================
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

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const clearFiles = () => {
    if (confirm("Hapus semua file?")) {
      setFiles([])
    }
  }

  // =============================
  // NEW: Screening handler
  // =============================
  const handleScreening = () => {
    if (files.length === 0) {
      alert("Tidak ada file untuk di-screening")
      return
    }

    // 🔥 nanti di sini bisa kirim ke backend / parsing
    console.log("Screening files:", files)

    alert(`Screening ${files.length} file dimulai`)
  }

  return (
    <>
      {/* Content */}
      <div className="flex gap-4">
        {/* ================= LEFT: Upload ================= */}
        <div
          className={`w-full rounded-md border p-4 transition ${
            isDragging ? "border-blue-500 bg-blue-50" : ""
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <h3 className="text-lg font-medium">Upload PEB File</h3>
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

        {/* ================= RIGHT: File List ================= */}
        <div className="w-3/4 rounded-md border p-4 flex flex-col h-[400px]">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-medium">List of PEB Files</h3>
              <p className="text-muted-foreground text-xs">
                Total file: {files.length}
              </p>
            </div>

            {/* 🔥 ACTION BUTTONS */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleScreening}
                disabled={files.length === 0}
                className={`text-xs px-3 py-1 rounded-md border ${
                  files.length === 0
                    ? "text-gray-400 border-gray-300 cursor-not-allowed"
                    : "text-blue-600 border-blue-500 hover:bg-blue-50"
                }`}
              >
                Screening File
              </button>

              {files.length > 0 && (
                <button
                  onClick={clearFiles}
                  className="text-xs text-red-500 hover:underline"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>

          {/* Scrollable List */}
          <div className="flex-1 overflow-y-auto pr-2">
            {files.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Belum ada file
              </p>
            ) : (
              <ul className="space-y-2">
                {files.map((file, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between rounded-md border p-2"
                  >
                    <div className="truncate">
                      <p className="text-sm font-medium truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                    </div>

                    <button
                      onClick={() => removeFile(index)}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
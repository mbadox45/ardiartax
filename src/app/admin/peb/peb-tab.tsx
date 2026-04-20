// src/app/admin/peb/peb-tab.tsx
"use client"

import { useState, DragEvent } from "react"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

import { pebService } from "@/lib/api/peb.service" // Import service
import { pebTerbitService } from "@/lib/api/peb-terbit.service";

interface PebTabProps {
  files: File[];
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
  onUploadSuccess: () => Promise<void>;
}

interface UploadedPebItem {
  id: number | string;
  document_number: string;
}

interface UploadPebResponse {
  status: string;
  message: string;
  data: UploadedPebItem[];
}

export default function PebTab({ files, setFiles, onUploadSuccess }: PebTabProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [masaTerbit, setMasaTerbit] = useState("") // Tambahkan state ini

  const today = new Date();
  const currentMonth = today.toISOString().slice(0, 7);
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

  const formatMasaTerbit = (value: string) => {
    if (!value) return ""
    const [year, month] = value.split("-")
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    return `${monthNames[parseInt(month) - 1]} ${year}`
  }

  // =============================
  // NEW: Screening handler
  // =============================

  const handleScreening = async () => {
    if (masaTerbit === "") {
      toast.error("Silakan pilih masa terbit", {position: "top-center"})
      return
    }
    if (files.length === 0) return

    setIsUploading(true)
    const toastId = toast.loading(`Sedang memproses ${files.length} file...`)

    try {
      await pebService.upload(files, formatMasaTerbit(masaTerbit));

      toast.success("Data berhasil diproses dan disimpan", { id: toastId });
      setFiles([]);
      setMasaTerbit("");
      await onUploadSuccess()

    } catch (error: unknown) {
      let errorMessage = "Terjadi kesalahan sistem"

      // Periksa apakah ini adalah instance Error standar
      if (error instanceof Error) {
        errorMessage = error.message
      } 
      // Jika Anda ingin menangani string error mentah (jarang, tapi mungkin)
      else if (typeof error === "string") {
        errorMessage = error
      }

      toast.error(errorMessage, { id: toastId })
    } finally {
      setIsUploading(false)
    }
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
          <div className="flex flex-col items-start gap-3 justify-between mb-4">
            <div>
              <h3 className="text-lg font-medium">List of PEB Files</h3>
              <p className="text-muted-foreground text-xs">
                Total file: {files.length}
              </p>
            </div>

            {/* 🔥 ACTION BUTTONS */}
            <div className="flex items-center gap-2 w-full justify-end">
              <Field>
                <ButtonGroup>
                  <Input id="masa_terbit" name="masa_terbit" value={masaTerbit}
                    max={currentMonth} onChange={(e) => setMasaTerbit(e.target.value)} disabled={files.length === 0 || isUploading} type="month" placeholder="Masa Upload PEB..." required />
                  <Button variant="outline" 
                  onClick={handleScreening}
                  disabled={files.length === 0 || isUploading}
                  className={`flex items-center gap-2 text-xs px-3 py-1 rounded-md border transition ${
                    files.length === 0 || isUploading
                      ? "text-gray-400 border-gray-300 cursor-not-allowed"
                      : "text-blue-600 border-blue-500 hover:bg-blue-50"
                  }`}>
                    {isUploading && <Loader2 className="h-3 w-3 animate-spin" />}
                    {isUploading ? "Processing..." : "Screening File"}
                  </Button>
                  {files.length > 0 && (
                    <Button variant="outline" className="text-red-500 border-red-500 hover:bg-red-100" onClick={clearFiles}>
                      Clear All
                    </Button>
                  )}
                </ButtonGroup>
              </Field>
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
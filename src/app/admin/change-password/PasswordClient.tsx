// src/app/admin/change-password/PasswordClient.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import HeaderPage from "@/components/layout/header-page"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, KeyRound, Loader2, ShieldCheck } from "lucide-react"
import { toast } from "sonner"
import Cookies from "js-cookie"

export default function PasswordClient() {
  const router = useRouter()
  
  // State Input Form
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  
  // State UI (Loading & Show/Hide Password)
  const [loading, setLoading] = useState(false)
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // 1. Validasi Client-side dasar
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("Semua kolom password wajib diisi", { position: "top-center" })
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error("Konfirmasi password baru tidak cocok", { position: "top-center" })
      return
    }

    if (newPassword.length < 6) {
      toast.error("Password baru minimal harus berisi 6 karakter", { position: "top-center" })
      return
    }

    setLoading(true)
    const toastId = toast.loading("Sedang memperbarui password Anda...")

    try {
      const token = Cookies.get("access_token")
      const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1"

      // 2. Eksekusi ke endpoint POST sesuai dokumentasi Swagger
      const response = await fetch(`${BASE_URL}/users/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          old_password: oldPassword,
          new_password: newPassword
        })
      })

      const result = await response.json()

      if (!response.ok) {
        // Handle error validation (422) atau password lama salah
        throw new Error(result.detail || "Gagal mengubah password. Silakan periksa kembali password lama Anda.")
      }

      // 3. Sukses
      toast.success("Password berhasil diperbarui!", { id: toastId, position: "top-center" })
      
      // Reset form fields
      setOldPassword("")
      setNewPassword("")
      setConfirmPassword("")
      
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan sistem", { id: toastId, position: "top-center" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen pb-6 pt-3 px-6 space-y-6 transition-colors">
      <HeaderPage 
        title="Change Password" 
        description="Amankan akun Anda dengan memperbarui kata sandi secara berkala" 
      />

      <div className="w-full pt-4">
        <Card className="border shadow-sm bg-white rounded-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl font-bold text-gray-900">Update Password</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Pastikan Anda menggunakan password yang kuat dan sulit ditebak.
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {/* Password Lama */}
              <div className="space-y-2">
                <Label htmlFor="old-password">Password Saat Ini</Label>
                <div className="relative">
                  <Input
                    id="old-password"
                    type={showOldPassword ? "text" : "password"}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={loading}
                    className="pr-10 bg-gray-50/50 focus-visible:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <hr className="my-2 border-gray-100" />

              {/* Password Baru */}
              <div className="space-y-2">
                <Label htmlFor="new-password">Password Baru</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={loading}
                    className="pr-10 bg-gray-50/50 focus-visible:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Konfirmasi Password Baru */}
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Konfirmasi Password Baru</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={loading}
                    className="pr-10 bg-gray-50/50 focus-visible:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </CardContent>

            <CardFooter className="pt-2">
              <Button 
                type="submit" 
                disabled={loading} 
                className="w-full bg-blue-600 text-white hover:bg-blue-700 font-medium h-10 shadow-sm transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Menyimpan Perubahan...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 mr-2" />
                    Perbarui Password
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
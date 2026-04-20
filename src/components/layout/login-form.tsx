// src/components/layout/login-form.tsx
"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { AuthService } from "@/lib/api/api-auth"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react" // Import icon loading
import { toast } from "sonner" // Pastikan library sonner sudah terinstall
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Toaster } from "@/components/ui/sonner" // Import Toaster untuk menampilkan toast notifications

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false) // State khusus untuk transisi page

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      const response = await AuthService.login(email, password)
      const load = response.data
      
      // Destructuring data
      const { access_token: accessToken } = load
      const { name, role, username } = load.user

      const ONE_DAY_IN_SECONDS = 24 * 60 * 60
      const cookieConfig = `; path=/; max-age=${ONE_DAY_IN_SECONDS}; SameSite=Lax`

      // Simpan Cookies
      document.cookie = `access_token=${accessToken}${cookieConfig}; Secure`
      document.cookie = `name=${name}${cookieConfig}`
      document.cookie = `role=${role}${cookieConfig}`
      document.cookie = `username=${username}${cookieConfig}`

      // 1. Munculkan Toast Sukses
      toast.success("Login Berhasil!", {
        description: `Selamat datang kembali, ${name}.`,
        position: "top-center" 
      })

      // 2. Aktifkan Loading Page sebelum redirect
      setIsRedirecting(true)
      
      // 3. Redirect ke Admin
      router.push("/admin")
      
    } catch (err: unknown) {
      let errorMessage = "Terjadi kesalahan yang tidak terduga."
      
      if (err instanceof Error) {
        errorMessage = err.message
      } else if (typeof err === "string") {
        errorMessage = err
      }

      // 4. Munculkan Toast Gagal
      toast.error("Login Gagal", {
        description: errorMessage,
        position: "top-center" 
      })
      
      setIsLoading(false)
    }
  }

  // Jika sedang redirecting, tampilkan full screen loader
  if (isRedirecting) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="mt-4 text-sm font-medium animate-pulse">Menyiapkan dashboard Anda...</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={cn("flex flex-col gap-6", className)} {...props}>
      <Toaster className="bg-black text-white" /> {/* Pastikan Toaster ada di dalam komponen agar bisa menampilkan toast notifications */}
      <FieldGroup>
        <div className="flex flex-col items-center gap-2 mb-6 text-center">
          <h1 className="text-2xl font-bold">Masuk ke Akun Anda</h1>
          <div className="space-y-1">
            <p className="text-sm font-medium text-primary">
              <span className="font-bold">ArdiarTax</span> - Solusi Manajemen Pajak Modern
            </p>
            <p className="text-xs text-balance text-muted-foreground">
              Silakan masukkan email dan kata sandi Anda untuk mengakses management ArdiarTax.
            </p>
          </div>
        </div>

        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" name="email" type="email" placeholder="xxx@gmail.com" disabled={isLoading} required />
        </Field>

        <Field>
          <div className="flex items-center justify-between">
            <FieldLabel htmlFor="password">Kata Sandi</FieldLabel>
            <a href="#" className="text-xs underline underline-offset-4 text-muted-foreground">
              Lupa kata sandi?
            </a>
          </div>
          <Input id="password" name="password" type="password" disabled={isLoading} required />
        </Field>

        <Field>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Memverifikasi...
              </>
            ) : (
              "Masuk Sekarang"
            )}
          </Button>
        </Field>

        <Field>
          <FieldDescription className="text-center">
            Belum memiliki akun?{" "}
            <a href="#" className="underline underline-offset-4 font-medium text-primary">
              Daftar di sini
            </a>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
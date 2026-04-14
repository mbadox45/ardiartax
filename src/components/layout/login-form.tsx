// src/components/layout/login-form.tsx
"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { AuthService } from "@/lib/api/api-auth" // Import class yang baru dibuat
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"


export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError("")

    const formData = new FormData(event.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      const data = await AuthService.login(email, password)
      
      // Simpan token ke cookie
      console.log("Login berhasil, token:", data)
      const load = data.data;
      const accessToken = load.access_token;
      const name = load.user.name;
      const role = load.user.role;
      const username = load.user.username;

      const ONE_DAY_IN_SECONDS = 24 * 60 * 60; // 86400 detik

      // Konfigurasi Cookie (Path / agar bisa diakses di semua halaman)
      const cookieConfig = `; path=/; max-age=${ONE_DAY_IN_SECONDS}; SameSite=Lax`;

      document.cookie = `access_token=${accessToken}${cookieConfig}; Secure`
      document.cookie = `name=${name}${cookieConfig}`
      document.cookie = `role=${role}${cookieConfig}`
      document.cookie = `username=${username}${cookieConfig}`
      // document.cookie = `access_token=${data.access_token}; path=/; max-age=3600; SameSite=Lax`
      
      router.push("/admin")
    } catch (err: unknown) { // 1. Ubah 'any' menjadi 'unknown'
      // 2. Lakukan Type Guarding
      if (err instanceof Error) {
        setError(err.message)
      } else if (typeof err === "string") {
        setError(err)
      } else {
        setError("Terjadi kesalahan yang tidak terduga.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={cn("flex flex-col gap-6", className)} {...props}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-2 mb-6 text-center">
          {/* Judul dalam Bahasa Indonesia */}
          <h1 className="text-2xl font-bold">Masuk ke Akun Anda</h1>
          
          {/* Keterangan Identitas Aplikasi */}
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
          <Input id="email" name="email" type="email" placeholder="xxx@gmail.com" required />
        </Field>

        <Field>
          <div className="flex items-center justify-between">
            <FieldLabel htmlFor="password">Kata Sandi</FieldLabel>
            <a href="#" className="text-xs underline underline-offset-4 text-muted-foreground">
              Lupa kata sandi?
            </a>
          </div>
          <Input id="password" name="password" type="password" required />
        </Field>

        <Field>
          <Button type="submit" className="w-full">Masuk Sekarang</Button>
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
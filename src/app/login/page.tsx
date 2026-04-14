// src/app/login/page.tsx
import type { Metadata } from "next"
import { GalleryVerticalEnd } from "lucide-react"

export const metadata: Metadata = {
  title: "Login - ArdiarTax",
}

import { LoginForm } from "@/components/layout/login-form"

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2 bg-white dark:bg-black">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="flex size-9 items-center justify-center rounded-full bg-white shadow-sm border overflow-hidden">
              <img 
                src="/icon.png" 
                alt="Logo" 
                className="size-full object-contain p-1" 
              />
            </div>
            ArdiarTax
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <img
          src="/bg2.jpg"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  )
}

// app/admin/layout.tsx
import type { Metadata } from "next"
import { cookies } from "next/headers"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { SiteHeader } from "@/components/layout/site-header"
import { Toaster } from "@/components/ui/sonner"

import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

export const metadata: Metadata = {
  title: "Dashboard",
}


export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {

  const cookieStore = await cookies()
  
  // Ambil data di sisi server
  const userData = {
    name: cookieStore.get("name")?.value || "Guest",
    email: cookieStore.get("username")?.value || "guest@ardiartax.com",
    avatar: "/avatars/default.jpg",
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar user={userData} />

      <SidebarInset>
        <SiteHeader />

        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">

              {/* ⬇️ ini isi dinamis dari page */}
              {children}
            </div>
          </div>
        </div>
        <Toaster />
      </SidebarInset>
    </SidebarProvider>
  )
}
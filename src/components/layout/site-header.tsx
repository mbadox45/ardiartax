// src/components/layout/site-header.tsx
"use client"

import { usePathname } from "next/navigation" // Import hook untuk ambil path
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

export function SiteHeader() {
  const pathname = usePathname()

  const getPageTitle = () => {
    if (!pathname || pathname === "/") return "Dashboard"

    // Ambil bagian terakhir dari path
    const segments = pathname.split("/").filter(Boolean)
    const lastSegment = segments[segments.length - 1]

    // Ubah kebab-case/snake_case menjadi Capital Case
    // Contoh: "peb-upload" -> "Peb Upload"
    return lastSegment
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase())
  }

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-8"
        />
        <h1 className="text-base font-medium uppercase">{getPageTitle()}</h1>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" asChild size="sm" className="hidden sm:flex">
            <a
              href="https://rtardiarta.netlify.app/"
              rel="noopener noreferrer"
              target="_blank"
              className="dark:text-foreground"
            >
              Copyright &copy; 2024 ArdiarTax.
            </a>
          </Button>
        </div>
      </div>
    </header>
  )
}

// src/app/admin/documents/sharing/doc-client.tsx

"use client"

import HeaderPage from "@/components/layout/header-page"

export default function DocClient() {
    return(
        <div 
            className={`min-h-screen pb-6 pt-3 px-6 space-y-4 transition-colors `}
        >
            <HeaderPage title="Documents Sharing" description="Kelola dan simpan dokumen perusahaan secara aman" />
        </div>
    )
}
"use client"

import React, { useState } from 'react'
import dynamic from 'next/dynamic'
import Cookies from 'js-cookie'

const DashUser = dynamic(() => import('./dashboard/dash-user'), { ssr: false })
const DashSuperadmin = dynamic(() => import('./dashboard/dash-superadmin'), { ssr: false })

interface DashboardLayoutProps {
  initialRole: "user" | "superadmin"
}

export default function DashboardLayout({ initialRole }: DashboardLayoutProps) {
  // Inisialisasi state langsung dari props server, tanpa useEffect!
  const [userRole, setUserRole] = useState<"user" | "superadmin">(initialRole)

  return (
    <div className="relative min-h-screen bg-slate-50">

      {/* CONDITIONAL RENDERING DASHBOARD */}
      {userRole === "superadmin" ? <DashSuperadmin /> : <DashUser />}
    </div>
  )
}
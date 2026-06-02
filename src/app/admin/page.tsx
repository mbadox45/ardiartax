// src/app/admin/page.tsx
import { cookies } from "next/headers"
import DashboardLayout from "./DashboardLayout"

export default async function Page() {
  // Membaca cookie langsung di server
  const cookieStore = await cookies()
  const roleCookie = cookieStore.get("role")?.value || "user"
  
  // Standarisasi nilai role sebelum dikirim ke Client Component
  const initialRole = (roleCookie === "super_admin" || roleCookie === "superadmin") 
    ? "superadmin" 
    : "user"

  return <DashboardLayout initialRole={initialRole} />
}
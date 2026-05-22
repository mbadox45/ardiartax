// src/lib/api/sharing.service.ts
import Cookies from "js-cookie"

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1"

export const sharingService = {
  getSharedDocuments: async (parentId: string | number | null) => {
    const token = Cookies.get("access_token")
    
    // Menyusun query parameter jika di dalam sub-folder
    const url = new URL(`${BASE_URL}/document-sharing/shared`)
    if (parentId && parentId !== 0) {
      url.searchParams.append("parent_id", String(parentId))
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    })

    if (!response.ok) throw new Error("Gagal memuat dokumen bersama")
    return response.json()
  }
}
// src/lib/api/dashboard.service.ts
import Cookies from "js-cookie"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

class DashboardService {
  private baseUrl: string

  constructor() {
    this.baseUrl = `${API_BASE_URL}/dashboard`
  }

  private getHeaders() {
    const token = Cookies.get("access_token")
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    }
  }

  // GET /api/v1/dashboard/storage-stats
  async getStorageStats() {
    const response = await fetch(`${this.baseUrl}/storage-stats`, {
      method: 'GET',
      headers: this.getHeaders(),
      cache: 'no-store'
    })
    const res = await response.json()
    return res.data || res
  }
}

export const dashboardService = new DashboardService()
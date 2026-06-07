// src/lib/api/group.service.ts
import Cookies from "js-cookie"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

class GroupService {
  private baseUrl: string

  constructor() {
    this.baseUrl = `${API_BASE_URL}/groups`
  }

  private getHeaders() {
    const token = Cookies.get("access_token")
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    }
  }

  // GET /api/v1/groups/tree
  async getTree() {
    const response = await fetch(`${this.baseUrl}/tree`, {
      method: 'GET',
      headers: this.getHeaders(),
      cache: 'no-store'
    })
    const res = await response.json()
    return res.data || res
  }

  // GET /api/v1/groups/
  async getAll() {
    const response = await fetch(`${this.baseUrl}/`, {
      method: 'GET',
      headers: this.getHeaders(),
      cache: 'no-store'
    })
    const res = await response.json()
    return res.data || res
  }

  // POST /api/v1/groups/
  async create(data: { name: string; parent_id: number | null }) {
    data.parent_id = data.parent_id === 0 ? null : data.parent_id
    const response = await fetch(`${this.baseUrl}/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    })
    if (!response.status) throw new Error("Gagal membuat grup")
    return response.json()
  }

  // PUT /api/v1/groups/{group_id}
  async update(id: string | number, data: { name: string; is_active: boolean; parent_id: number | null }) {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    })
    if (!response.status) throw new Error("Gagal memperbarui grup")
    return response.json()
  }

  // DELETE /api/v1/groups/{group_id}
  async delete(id: string | number) {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    })
    if (!response.status) throw new Error("Gagal menghapus grup")
    return response.json()
  }
}

export const groupService = new GroupService()
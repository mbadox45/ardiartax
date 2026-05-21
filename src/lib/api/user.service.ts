// src/lib/api/user.service.ts
import Cookies from "js-cookie"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

class UserService {
    private baseUrl: string

    constructor() {
        this.baseUrl = `${API_BASE_URL}/users`
    }

    // Helper privat untuk mendapatkan header secara dinamis & konsisten
    private getHeaders() {
        const token = Cookies.get("access_token")
        return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        }
    }

    // GET /api/v1/users/ (Mendapatkan list semua user)
    async getAll() {
        try {
            const response = await fetch(`${this.baseUrl}/`, {
                method: 'GET',
                headers: this.getHeaders(),
                cache: 'no-store' 
            })
            
            const resJson = await response.json()
            
            if (resJson && Array.isArray(resJson.data)) {
                return resJson.data
            }
            if (Array.isArray(resJson)) {
                return resJson
            }
            
            return []
        } catch (error) {
            console.error("Error fetching users:", error)
            throw error
        }
    }

    // POST /api/v1/users/register (Create User)
    async create(data: { name: string; username: string; password?: string; role: string; group_id: number }) {
        try {
            const response = await fetch(`${this.baseUrl}/register`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(data)
            })

            if (!response.ok) {
                const errJson = await response.json().catch(() => ({}))
                throw new Error(errJson.message || "Gagal mendaftarkan pengguna baru")
            }

            return await response.json()
        } catch (error) {
            console.error("Error creating user:", error)
            throw error
        }
    }

    // PUT /api/v1/users/{user_id} (Update User)
    async update(id: string | number, data: { name: string; username: string; role: string; group_id: number; is_active?: boolean }) {
        try {
            const response = await fetch(`${this.baseUrl}/${id}`, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify(data)
            })

            if (!response.ok) {
                const errJson = await response.json().catch(() => ({}))
                throw new Error(errJson.message || "Gagal memperbarui data pengguna")
            }

            return await response.json()
        } catch (error) {
            console.error("Error updating user:", error)
            throw error
        }
    }

    // DELETE /api/v1/users/{user_id} (Delete User)
    async delete(id: string | number) {
        try {
            const response = await fetch(`${this.baseUrl}/${id}`, {
                method: 'DELETE',
                headers: this.getHeaders()
            })

            if (!response.ok) {
                const errJson = await response.json().catch(() => ({}))
                throw new Error(errJson.message || "Gagal menghapus pengguna")
            }

            return await response.json()
        } catch (error) {
            console.error("Error deleting user:", error)
            throw error
        }
    }

    // POST /api/v1/users/{user_id}/reset-password (Admin Reset Password)
    async resetPassword(id: string | number, newPassword?: string) {
        try {
            // Sesuai dokumentasi gambar: POST /api/v1/users/{user_id}/reset-password
            const response = await fetch(`${this.baseUrl}/${id}/reset-password`, {
                method: 'POST',
                headers: this.getHeaders(),
                // Jika API membutuhkan payload password baru silakan kirim body, jika generate otomatis dari backend biarkan objek kosong {}
                body: JSON.stringify(newPassword ? { password: newPassword } : {})
            })

            if (!response.ok) {
                const errJson = await response.json().catch(() => ({}))
                throw new Error(errJson.message || "Gagal mereset password pengguna")
            }

            return await response.json()
        } catch (error) {
            console.error("Error resetting user password:", error)
            throw error
        }
    }

    // POST /api/v1/users/change-password (User Ganti Password Sendiri)
    async changePassword(data: { old_password: string; new_password: string }) {
        try {
            const response = await fetch(`${this.baseUrl}/change-password`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(data),
            })

            if (!response.ok) {
                const errJson = await response.json().catch(() => ({}))
                throw new Error(errJson.message || "Gagal mengubah password. Pastikan password lama sesuai.")
            }

            return await response.json()
        } catch (error) {
            console.error("Error changing password:", error)
            throw error
        }
    }
}

export const userService = new UserService()
// src/lib/api/storage.service.ts
import Cookies from "js-cookie";

class StorageService {
  private get baseUrl() {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }

  private get headers() {
    const token = Cookies.get("access_token");
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    };
  }

  // GET /api/v1/storage/users (Melihat semua data storage pengguna - Khusus Admin)
  async getAllUsersStorage() {
    try {
      const response = await fetch(`${this.baseUrl}/storage/users`, {
        method: "GET",
        headers: this.headers,
        cache: 'no-store'
      });
      const resJson = await response.json();
      
      // Mengembalikan data tatasusunan (array) secara selamat bersesuaian dengan struktur payload lazim
      if (resJson && Array.isArray(resJson.data)) {
        return resJson.data;
      }
      if (Array.isArray(resJson)) {
        return resJson;
      }
      return [];
    } catch (error) {
      console.error("Error fetching all users storage:", error);
      throw error;
    }
  }

  // GET /api/v1/storage/me (Melihat info storage milik sendiri)
  async getStorageInfo() {
    try {
      const response = await fetch(`${this.baseUrl}/storage/me`, {
        method: "GET",
        headers: this.headers,
        cache: 'no-store' 
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching storage info:", error);
      throw error;
    }
  }

  // POST /api/v1/storage/add-quota (Menambahkan kuota user lain - Khusus Admin)
  async addQuota(data: { user_id: number; additional_storage_mb: number }) {
    try {
      const response = await fetch(`${this.baseUrl}/storage/add-quota`, {
        method: "POST",
        headers: this.headers,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.message || "Gagal menambahkan kuota storage");
      }

      return await response.json();
    } catch (error) {
      console.error("Error adding storage quota:", error);
      throw error;
    }
  }
}

export const storageService = new StorageService();
// src/lib/api/user.service.ts
import Cookies from "js-cookie"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

class UserService {
  private baseUrl: string

  constructor() {
    this.baseUrl = `${API_BASE_URL}/users`
  }
    
  async getAll() {
    try {
        const token = Cookies.get("access_token");

        const response = await fetch(this.baseUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            cache: 'no-store' 
        });
        
        const resJson = await response.json();
        
        // AMAN: Cek struktur payload dari API backend Anda
        if (resJson && Array.isArray(resJson.data)) {
            return resJson.data; // Jika dibungkus { data: [...] }
        }
        if (Array.isArray(resJson)) {
            return resJson; // Jika langsung [...]
        }
        
        return []; // Fallback jika format backend tidak dikenal
    } catch (error) {
        console.error("Error fetching users:", error);
        throw error;
    }
  }
}

export const userService = new UserService()
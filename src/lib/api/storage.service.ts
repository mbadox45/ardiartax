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
}

export const storageService = new StorageService();
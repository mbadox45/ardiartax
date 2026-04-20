// src/lib/api/peb-terbit.service.ts
import Cookies from "js-cookie";

export interface PebTerbitPayload {
  peb_id: string | number;
  masa_terbit: string;
}

export interface PebTerbitBulkPayload {
  peb_ids: (string | number)[];
  masa_terbit: string;
}

class PebTerbitService {
  private baseUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/peb_terbit`;

  private getHeaders() {
    const token = Cookies.get("access_token");
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    };
  }

  // POST: http://localhost:8000/api/v1/peb_terbit
  async create(payload: PebTerbitPayload) {
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Gagal menyimpan Masa Terbit");
    }

    return response.json();
  }

  // POST: http://localhost:8000/api/v1/peb_terbit/bulk
  async createBulk(payload: PebTerbitBulkPayload) {
    const response = await fetch(`${this.baseUrl}/bulk`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Gagal menyimpan Masa Terbit secara Bulk");
    }

    return response.json();
  }
}

export const pebTerbitService = new PebTerbitService();
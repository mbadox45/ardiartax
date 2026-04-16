// src/lib/api/peb.service.ts
import { PebData } from "@/app/admin/peb/columns";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
import Cookies from "js-cookie"; // Pastikan sudah install: npm install js-cookie @types/js-cookie

const token = Cookies.get("access_token");

export interface UploadPebResponse {
  success: boolean;
  message: string;
  data?: {
    uploaded_files: Array<{
      id: number;
      filename: string;
      path: string;
      status: string;
    }>;
    summary: {
      total_processed: number;
      total_failed: number;
    };
  };
}

class PebService {
    private baseUrl: string;

    constructor() {
        this.baseUrl = `${API_BASE_URL}/peb`;
    }

    /**
     * Mengambil semua data PEB
     */
    async getAll(): Promise<PebData[]> {
        try {
            const response = await fetch(this.baseUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                // Tambahkan cache: 'no-store' jika ingin data selalu fresh (SSR)
                cache: 'no-store' 
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            // Menangani berbagai kemungkinan struktur return API
            return result.data;
        } catch (error) {
            console.error("PebService.getAll Error:", error);
            throw error;
        }
    }

    async upload(files: File[]): Promise<UploadPebResponse> {
        const formData = new FormData();
        
        // Append semua file ke dalam formData
        // Pastikan key 'files[]' sesuai dengan yang diharapkan backend Laravel/Express Anda
        files.forEach((file) => {
            // Ubah dari "files[]" menjadi "files" sesuai error log backend
            formData.append("files", file); 
        });

        const response = await fetch(`${this.baseUrl}/upload`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Gagal mengunggah file");
        }
        const result = await response.json();

        return result.data; // Sesuaikan dengan struktur response API Anda
    }

  /**
   * Anda bisa menambahkan method lain di sini nanti, contoh:
   * async delete(id: string) { ... }
   * async create(data: FormData) { ... }
   */
}

// Export sebagai singleton
export const pebService = new PebService();
// src/lib/api/peb.service.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
import Cookies from "js-cookie"; // Pastikan sudah install: npm install js-cookie @types/js-cookie

const token = Cookies.get("access_token");

export interface PebData {
  id: string
  document_number: string
  buyer_name: string
  document_date: string
  status: "Draft" | "Terkirim" | "Disetujui"
  nilai_fob: number
  nilai_tukar: number
}

export interface UploadedPebItem {
  id: number;
  filename: string;
  path: string;
  status: string;
}

export interface UploadPebResponse {
  success: boolean;
  message: string;
  data?: UploadedPebItem[];
}

class PebService {
    private baseUrl: string;

    constructor() {
        this.baseUrl = `${API_BASE_URL}/peb`;
    }

    /**
     * Mengambil semua data PEB
     */
    async getAll(masaTerbit?: string): Promise<PebData[]> {
        try {
            // 1. Konstruksi URL dengan Query Params jika ada
            let url = this.baseUrl;
            if (masaTerbit) {
                const params = new URLSearchParams({ masa_terbit: masaTerbit });
                url = `${this.baseUrl}?${params.toString()}`;
            }

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`, // Pastikan token diambil secara dinamis di dalam method ini
                },
                cache: 'no-store' 
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return result.data;
        } catch (error) {
            console.error("PebService.getAll Error:", error);
            throw error;
        }
    }

    async getAllByMasaTerbit(masaTerbit: string): Promise<PebData[]> {
        try {
            const response = await fetch(`${this.baseUrl}?masa_terbit=${masaTerbit}`, {
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

    async upload(files: File[], masaTerbit: string): Promise<UploadPebResponse> {
        const formData = new FormData();
        
        // Append semua file ke dalam formData
        // Pastikan key 'files[]' sesuai dengan yang diharapkan backend Laravel/Express Anda
        files.forEach((file) => {
            // Ubah dari "files[]" menjadi "files" sesuai error log backend
            formData.append("files", file); 
        });

        // Tambahkan masaTerbit ke formData
        formData.append("masa_terbit", masaTerbit);

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

        return result; // Sesuaikan dengan struktur response API Anda
    }

    async deleteBulk(ids: (number | string)[]): Promise<{ success: boolean; message: string }> {
        const response = await fetch(`${this.baseUrl}/bulk-delete`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({ ids }),
        });

        if (!response.ok) throw new Error("Gagal menghapus data");
        return response.json();
    }

}

// Export sebagai singleton
export const pebService = new PebService();
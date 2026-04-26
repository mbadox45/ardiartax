// src/lib/api/documents.service.ts
import Cookies from "js-cookie";

export interface CreateFolderPayload {
  name: string;
  is_shared?: boolean;
  parent_id: string | number;
  is_folder: boolean;
}

class DocumentService {
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

  /**
   * Mengambil daftar dokumen berdasarkan parent_id
   */
  async getDocuments(parentId: string | number = 0) {
    try {
      const response = await fetch(`${this.baseUrl}/documents?parent_id=${parentId}`, {
        method: "GET",
        headers: this.headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Gagal mengambil data dokumen");
      }

      const result = await response.json();
      return result.data || result;
    } catch (error) {
      console.error("DocumentService.getDocuments Error:", error);
      throw error;
    }
  }

  /**
   * Membuat folder baru
   */
  async createFolder(payload: CreateFolderPayload) {
    try {
      const response = await fetch(`${this.baseUrl}/documents/folder`, {
        method: "POST",
        headers: this.headers,
        body: JSON.stringify({
          is_shared: false,
          ...payload
        }),
      });

      // Jika berhasil, jangan langsung .json() jika body mungkin kosong
      if (response.ok) {
        // Cek apakah ada konten sebelum parsing
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          return await response.json();
        }
        return { success: true }; // Fallback jika body kosong
      }

      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Gagal membuat folder");
    } catch (error) {
      // LOGIKA DEBUGGING:
      // Jika data berhasil masuk tapi tetap error, kemungkinan besar ini
      console.error("Fetch error details:", error);
      
      // Jika error adalah 'Failed to fetch' tapi Anda tahu server memprosesnya,
      // ini seringkali masalah network/CORS di sisi backend.
      throw error;
    }
  }
  // async createFolder(payload: CreateFolderPayload) {
  //   try {
  //     const response = await fetch(`${this.baseUrl}/documents/folder`, {
  //       method: "POST",
  //       headers: this.headers,
  //       body: JSON.stringify({
  //         is_shared: false, // default value
  //         ...payload
  //       }),
  //     });

  //     if (!response.ok) {
  //       const errorData = await response.json().catch(() => ({}));
  //       throw new Error(errorData.message || "Gagal membuat folder");
  //     }

  //     return await response.json();
  //   } catch (error) {
  //     console.error("DocumentService.createFolder Error:", error);
  //     throw error;
  //   }
  // }

  // Tambahkan ini di dalam class DocumentService
  async deleteDocument(documentId: string | number) {
    try {
        const response = await fetch(`${this.baseUrl}/documents/${documentId}`, {
            method: "DELETE",
            headers: this.headers,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || "Gagal menghapus dokumen");
        }

        return await response.json();
    } catch (error) {
        console.error("DocumentService.deleteDocument Error:", error);
        throw error;
    }
  }
}

// Export sebagai singleton instance
export const documentService = new DocumentService();
// src/lib/api/api-auth.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export class AuthService {
  static async login(email: string, password: string) {
    if (!API_BASE_URL) {
      throw new Error("Konfigurasi API_BASE_URL belum disetel.");
    }

    try {
      const response = await fetch(`${API_BASE_URL}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username:email, password:password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Jika backend mengirimkan pesan error spesifik
        throw new Error(data.message || "Gagal masuk. Periksa email dan sandi.");
      }

      return data;
    } catch (error: unknown) {
      // Mengganti 'any' dengan 'unknown' untuk keamanan
      
      // 1. Cek apakah ini error bawaan JavaScript (seperti network error)
      if (error instanceof Error) {
        // Menangani kasus spesifik "Failed to fetch" (Server mati)
        if (error.message === "Failed to fetch") {
          throw new Error("Tidak dapat terhubung ke server backend.");
        }
        throw error;
      }

      // 2. Jika error berupa string (jarang terjadi tapi mungkin di JS)
      if (typeof error === "string") {
        throw new Error(error);
      }

      // 3. Fallback terakhir jika tipe error benar-benar tidak dikenal
      throw new Error("Terjadi kesalahan sistem yang tidak terduga.");
    }
  }
}
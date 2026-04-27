// src/lib/crypto.ts

/**
 * Enkripsi sederhana untuk folder ID di URL
 */
export const encryptId = (id: string | number): string => {
    const stringId = String(id);
    // Tambahkan prefix acak dan encode ke base64
    return btoa(`folder_${stringId}`).replace(/=/g, "");
};

/**
 * Decrypt sederhana untuk folder ID dari URL
 */
export const decryptId = (cipher: string): string | number => {
    try {
        const decoded = atob(cipher);
        const id = decoded.replace("folder_", "");
        return isNaN(Number(id)) ? id : Number(id);
    } catch (e) {
        return 0; // Balik ke root jika gagal decrypt
    }
};

export interface PathItem {
    id: string | number;
    name: string;
}

/**
 * Enkripsi data (PathItem array) ke string Base64
 */
export const encryptData = (data: PathItem[]): string => {
    try {
        const jsonString = JSON.stringify(data);
        // btoa hanya mendukung karakter Latin1. 
        // Menggunakan encodeURIComponent agar aman untuk karakter unik/emoji di nama folder.
        return btoa(encodeURIComponent(jsonString)).replace(/=/g, "");
    } catch (e) {
        console.error("Encryption error:", e);
        return "";
    }
};

/**
 * Decrypt string Base64 kembali ke PathItem array
 */
export const decryptData = (cipher: string): PathItem[] | null => {
    if (!cipher) return null;

    try {
        // 1. Tambahkan kembali padding '=' yang mungkin hilang karena .replace(/=/g, "")
        let base64 = cipher;
        while (base64.length % 4 !== 0) {
            base64 += '=';
        }

        // 2. Decode Base64
        const decodedString = atob(base64);
        
        // 3. Decode URI Component (menangani karakter spesial)
        const jsonString = decodeURIComponent(decodedString);
        
        // 4. Validasi string kosong sebelum parse
        if (!jsonString || jsonString.trim() === "") return null;

        const parsed = JSON.parse(jsonString);
        
        if (Array.isArray(parsed)) {
            return parsed as PathItem[];
        }
        return null;
    } catch (e) {
        console.error("Gagal mendeskripsi data URL:", e);
        return null;
    }
};

export const getInitialData = () => {
    // SSR Safety
    if (typeof window === "undefined") {
        return { path: [{ id: 0, name: "Root" }], id: 0 };
    }
    
    const params = new URLSearchParams(window.location.search);
    const p = params.get("p");

    // Jika parameter 'p' tidak ada atau kosong, jangan coba decrypt
    if (!p) {
        return { path: [{ id: 0, name: "Root" }], id: 0 };
    }
    
    const decodedPath = decryptData(p);
    
    // Pastikan decodedPath valid, jika tidak balik ke root
    const finalPath = (decodedPath && decodedPath.length > 0) 
        ? decodedPath 
        : [{ id: 0, name: "Root" }];
    
    return {
        path: finalPath,
        id: finalPath[finalPath.length - 1].id
    };
};
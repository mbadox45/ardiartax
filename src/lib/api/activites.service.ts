// src/lib/api/activites.service.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
import Cookies from "js-cookie"; // Pastikan sudah install: npm install js-cookie @types/js-cookie
const token = Cookies.get("access_token");

export class ActivitiesService {
    private baseUrl: string;

    constructor() {
        this.baseUrl = `${API_BASE_URL}/activities`;
    }
    
    async getAll() {
        try {
            const response = await fetch(this.baseUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                cache: 'no-store' 
            });
            const data = await response.json();
            return data.data;
        } catch (error) {
            console.error("Error fetching activities:", error);
            throw error;
        }
    }

}
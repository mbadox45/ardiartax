// src/app/admin/activities/task-board/develop.tsx
import Image from "next/image" // Import komponen Image

export default function DevelopTaskBoard() {
    return (
        <div className="flex flex-col gap-2 px-4 lg:px-6">
            <h2 className="text-2xl font-bold tracking-tight">Task Board - Development</h2>
            <p className="text-muted-foreground">
                This page is currently under development. Please check back later for updates.
            </p>
            
            {/* Menambahkan gambar dengan Next.js Image */}
            <div className="mt-6 w-full flex justify-center">
                <Image 
                    src="/bahlil.png" 
                    alt="Sorry to Say" 
                    width={500} 
                    height={300} 
                    className="rounded-lg object-cover"
                />
            </div>
        </div>
    )
}
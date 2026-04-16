// src/app/admin/peb/PebClient.tsx

"use client"
import { useState, useCallback, useEffect } from "react"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import { ListCheck, Upload } from "lucide-react"

// Components
import HeaderPage from "@/components/layout/header-page"
import PebTab from "./peb-tab"
import ListPebTab from "./list-peb-tab"
import { PebData } from "./columns"

// API
import { pebService } from "@/lib/api/peb.service"

export default function PebClient() {
    const [pebFiles, setPebFiles] = useState<File[]>([])
    const [dataPeb, setDataPeb] = useState<PebData[]>([])
    const [isLoading, setIsLoading] = useState(true)
    
    // Gunakan useCallback agar fungsi tidak dibuat ulang setiap render
    const fetchPebList = useCallback(async () => {
      try {
        // Jangan set isLoading true di sini jika ingin silent update (tanpa spinner)
        const result = await pebService.getAll()
        // let duaKata = kalimat.split(' ').slice(0, 2).join(' ');
        const hasil = result.map((item) => ({
          ...item,
          buyer_name: item.buyer_name.split(' ').slice(0, 2).join(' ') +'...', // Ambil dua kata pertama
        }))

        setDataPeb(hasil)
      } catch (error) {
        console.error("Gagal memperbarui list:", error)
      } finally {
        setIsLoading(false)
      }
    }, [])

    useEffect(() => {
      fetchPebList()
    }, [fetchPebList])
    
    return (
        <>
            {/* Header */}
            <div className="px-6 pt-3">
                <HeaderPage
                    title="Pemberitahuan Ekspor Barang"
                    description="Upload dan kelola file PEB Anda."
                />
            </div>
            <Tabs defaultValue="overview" className="w-full px-6">
                <TabsList>
                    <TabsTrigger value="overview"><Upload /> PEB Upload</TabsTrigger>
                    <TabsTrigger value="analytics"><ListCheck /> List PEB</TabsTrigger>
                </TabsList>
                <TabsContent value="overview">
                    <Card>
                        <CardHeader>
                            <CardTitle>PEB Upload File</CardTitle>
                            <CardDescription>
                                Seret dan lepas file PEB Anda di area ini, atau klik untuk memilih file dari komputer Anda. Pastikan file yang diunggah sesuai dengan format yang diterima.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground">
                            <PebTab files={pebFiles} setFiles={setPebFiles} onUploadSuccess={fetchPebList} />
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="analytics">
                    <Card>
                        <CardHeader>
                            <CardTitle>List PEB</CardTitle>
                            <CardDescription>
                              Daftar dokumen Pemberitahuan Ekspor Barang yang telah diproses.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ListPebTab data={dataPeb} isLoading={isLoading} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </>
    )
}
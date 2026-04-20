// src/app/admin/peb/PebClient.tsx

"use client"
import { useState, useCallback, useEffect, useMemo } from "react"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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
import { ListCheck, Upload, FileCode, FileSpreadsheet, Trash, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"

// Components
import HeaderPage from "@/components/layout/header-page"
import PebTab from "./peb-tab"
import ListPebTab from "./list-peb-tab"
import { PebData } from "./columns"
import { handleExportExcel } from "@/lib/controllers/peb.controller"

// API
import { pebService } from "@/lib/api/peb.service"
import { Input } from "@/components/ui/input"

const formatToMasaPajak = (dateString: string) => {
    if (!dateString) return "";
    const [year, month] = dateString.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleString("en-US", { month: "short", year: "numeric" }); // "Mar 2026"
};

export default function PebClient() {
    const [pebFiles, setPebFiles] = useState<File[]>([])
    const [dataPeb, setDataPeb] = useState<PebData[]>([])
    const [dataPebOri, setDataPebOri] = useState<PebData[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isSelectFilter, setIsSelectFilter] = useState("")
    const [isFilter, setIsFilter] = useState("")
    const [isMasaTerbit, setIsMasaTerbit] = useState(() => {
        const d = new Date();
        d.setMonth(d.getMonth() - 1);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    });

    const today = new Date();
    const currentMonth = today.toISOString().slice(0, 7);
    
    // Gunakan useCallback agar fungsi tidak dibuat ulang setiap render
    const fetchPebList = useCallback(async () => {
        setIsLoading(true);
        try {
            console.log(isMasaTerbit)
            const masaPajakParam = formatToMasaPajak(isMasaTerbit);
            console.log(masaPajakParam)
            const result = await pebService.getAll(masaPajakParam) 

            const hasil = result.map((item) => ({
                ...item,
                buyer_name: item.buyer_name.split(' ').slice(0, 2).join(' ') + '...',
            }));
            setDataPeb(hasil);
            setDataPebOri(result);
        } catch (error) {
            setDataPeb([]);
        } finally {
            setIsLoading(false);
        }
    }, [isMasaTerbit]); // Dependency utama

    useEffect(() => {
        fetchPebList();
    }, [fetchPebList]);

    const filteredData = useMemo(() => {
        const term = isFilter.toLowerCase().trim();
        if (!term) return dataPeb;

        return dataPeb.filter((item) => {
            if (isSelectFilter === "buyer") {
                return item.buyer_name?.toLowerCase().includes(term);
            }
            return item.document_number?.toLowerCase().includes(term);
        });
    }, [dataPeb, isFilter, isSelectFilter]);
    
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
                            <div className="flex w-full justify-between items-center gap-2 mb-2">
                                <div className="flex w-full p-2 border rounded-2xl gap-3 items-center bg-black/5">
                                    <Select defaultValue="no_doc" onValueChange={(value) => setIsSelectFilter(value)}>
                                        <SelectTrigger className="w-full bg-white">
                                            <SelectValue placeholder="Select by Content" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                            <SelectLabel>Contents</SelectLabel>
                                            <SelectItem value="no_doc">Nomor Dokumen</SelectItem>
                                            <SelectItem value="buyer">Buyer</SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                    {isSelectFilter == "no_doc" || isSelectFilter == "" ? <Input value={isFilter} onChange={(e) => setIsFilter(e.target.value)} placeholder="Cari Nomor Dokumen..." className="w-full bg-white" /> : 
                                    <Input value={isFilter} onChange={(e) => setIsFilter(e.target.value)} placeholder="Cari Buyer..." className="w-full bg-white" /> }
                                </div>
                                <div className="flex p-2 border rounded-2xl gap-3 items-center bg-black/5">
                                    <Input placeholder="Masa Terbit..." type="month" max={currentMonth} value={isMasaTerbit} onChange={(e) => setIsMasaTerbit(e.target.value)} className="w-full bg-white" /> 
                                </div>
                                <div className="p-2 border rounded-2xl bg-black/5">
                                    <ButtonGroup>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button variant="outline" size="lg" className="bg-gray-600 text-white hover:text-gray-600 cursor-pointer"><FileCode /></Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Export by XML Data</p>
                                            </TooltipContent>
                                        </Tooltip>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button variant="outline" size="lg" className="bg-green-700 text-white hover:text-green-600 cursor-pointer" onClick={() => handleExportExcel(dataPebOri)}>
                                                    <FileSpreadsheet />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Export by Excel</p>
                                            </TooltipContent>
                                        </Tooltip>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button variant="outline" size="lg" className="bg-pink-700 text-white hover:text-pink-600 cursor-pointer"><Trash /></Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Delete Data</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </ButtonGroup>
                                </div>
                            </div>
                            <ListPebTab data={filteredData} isLoading={isLoading} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </>
    )
}
import * as XLSX from "xlsx"
import { PebData } from "../api/peb.service";
import { toast } from "sonner"
import { pebService } from "@/lib/api/peb.service"


export const handleExportExcel = (data: PebData[]) => {
    if (data.length === 0) return alert("Tidak ada data untuk diekspor");

    // 1. Siapkan data (Anda bisa memetakan ulang key-nya agar lebih rapi di Excel)
    const exportData = data.map(item => ({
        ...item,
        // Tambahkan field lain sesuai kebutuhan dari interface PebData
    }));

    // 2. Buat Worksheet & Workbook
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data PEB");

    // 3. Generate file dan download
    XLSX.writeFile(workbook, `Export_PEB_${new Date().toISOString().slice(0, 10)}.xlsx`);
};

export const handleDeleteBulk = async (selectedIds: (number | string)[]) => {
    if (selectedIds.length === 0) {
        toast.error("Pilih data yang ingin dihapus terlebih dahulu");
        return;
    }

    if (!confirm(`Apakah Anda yakin ingin menghapus ${selectedIds.length} data?`)) return;

    try {
        await pebService.deleteBulk(selectedIds);
        toast.success("Data berhasil dihapus");
    } catch (error: unknown) {
        toast.error((error as Error).message || "Gagal menghapus data");
    } finally {
    }
};
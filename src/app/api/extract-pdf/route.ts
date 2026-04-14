// app/api/extract-pdf/route.ts
import { NextRequest, NextResponse } from "next/server";
import pdf from "pdf-parse";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const data = await pdf(buffer);

    // LOGIKA PARSING SEDERHANA (Sesuaikan dengan layout PDF PEB Anda)
    // Di sini kita mencari kata kunci tertentu dalam teks PDF
    const text = data.text;
    
    const extractedData = {
      fileName: file.name,
      noAju: text.match(/No\. Aju\s*:\s*(\d+)/i)?.[1] || "Tidak ditemukan",
      eksportir: text.match(/Eksportir\s*:\s*([^\n]+)/i)?.[1]?.trim() || "Tidak ditemukan",
      tglEkspor: text.match(/Tanggal\s*:\s*([\d-]+)/i)?.[1] || "-",
    };

    return NextResponse.json(extractedData);
  } catch (error) {
    return NextResponse.json({ error: "Failed to parse PDF" }, { status: 500 });
  }
}
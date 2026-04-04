// app/admin/page.tsx

import { ChartAreaInteractive } from "@/components/layout/chart-area-interactive"
import { DataTable } from "@/components/layout/data-table"
import { SectionCards } from "@/components/layout/section-cards"

import data from "../../data.json"

export default function RecapInvoices() {
  return (
    <>
      <SectionCards />

      <DataTable data={data} />
    </>
  )
}
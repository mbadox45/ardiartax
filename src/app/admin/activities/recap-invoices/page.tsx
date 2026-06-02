import type { Metadata } from "next"
// import RecapInvoices from "./recap"
import DevelopRecapInvoices from "./develop"

export const metadata: Metadata = {
  title: "Recap Invoices",
}

export default function Page() {
  return <DevelopRecapInvoices />
}
import type { Metadata } from "next"
import DocClient from "./doc-client"

export const metadata: Metadata = {
  title: "Documents Sharing",
}

export default function Page() {
  return <DocClient />
}
import type { Metadata } from "next"
import StorageClient from "./StorageClient"

export const metadata: Metadata = {
  title: "Storage Management",
}

export default function Page() {
  return <StorageClient />
}
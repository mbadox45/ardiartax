import type { Metadata } from "next"
import MyDocClient from "./mydoc-client"

export const metadata: Metadata = {
  title: "My Documents",
}

export default function Page() {
  return <MyDocClient />
}
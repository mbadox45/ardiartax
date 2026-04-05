import type { Metadata } from "next"
import PebClient from "./PebClient"

export const metadata: Metadata = {
  title: "Goods Export Notification",
}

export default function Page() {
  return <PebClient />
}
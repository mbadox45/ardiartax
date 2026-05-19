import type { Metadata } from "next"
import GroupClient from "./GroupClient"

export const metadata: Metadata = {
  title: "Group Management",
}

export default function Page() {
  return <GroupClient />
}
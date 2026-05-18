import type { Metadata } from "next"
import UserClient from "./users-client"

export const metadata: Metadata = {
  title: "User Management",
}

export default function Page() {
  return <UserClient />
}
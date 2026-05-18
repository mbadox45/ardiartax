import type { Metadata } from "next"
import UsersClient from "./UsersClient"

export const metadata: Metadata = {
  title: "User Management",
}

export default function Page() {
  return <UsersClient />
}
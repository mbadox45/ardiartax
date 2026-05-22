import type { Metadata } from "next"
import PasswordClient from "./PasswordClient"

export const metadata: Metadata = {
  title: "Change Password",
}

export default function Page() {
  return <PasswordClient />
}
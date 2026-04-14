import type { Metadata } from "next"
import TaskClient from "./task-client"

export const metadata: Metadata = {
  title: "Activities Task Board",
}

export default function Page() {
  return <TaskClient />
}
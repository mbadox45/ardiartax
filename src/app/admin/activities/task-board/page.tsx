import type { Metadata } from "next"
import TaskClient from "./task-client"
// import DevelopTaskBoard from "./develop"

export const metadata: Metadata = {
  title: "Activities Task Board",
}

export default function Page() {
  // return <DevelopTaskBoard />
  return <TaskClient />
}
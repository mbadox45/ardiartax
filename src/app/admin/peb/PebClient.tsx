// src/app/admin/peb/PebClient.tsx

"use client"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import HeaderPage from "@/components/layout/header-page"
import PebTab from "./peb-tab"
import { ListCheck, Upload } from "lucide-react"


export default function PebClient() {

  return (
    <>
      {/* Header */}
      <div className="px-6 pt-3">
        <HeaderPage
          title="Pemberitahuan Ekspor Barang"
          description="Upload dan kelola file PEB Anda."
        />
      </div>
      <Tabs defaultValue="overview" className="w-full px-6">
        <TabsList>
          <TabsTrigger value="overview"><Upload /> PEB Upload</TabsTrigger>
          <TabsTrigger value="analytics"><ListCheck /> List PEB</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>PEB Upload File</CardTitle>
              <CardDescription>
                <PebTab />
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              You have 12 active projects and 3 pending tasks.
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>List PEB</CardTitle>
              <CardDescription>
                Track performance and user engagement metrics. Monitor trends and
                identify growth opportunities.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Page views are up 25% compared to last month.
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  )
}
"use client"

import { TrendingUp, TrendingDown } from "lucide-react";

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function SectionCards() {
  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      <Card className="@container/card bg-sky-700/60">
        <CardHeader>
          <CardDescription>Total Activity</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            1.250,00
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-muted-foreground">
            Total activity April 2024
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card bg-amber-500/60">
        <CardHeader>
          <CardDescription>Export</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            $ 1,234
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-muted-foreground">
            Total export March 2024
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card bg-lime-600/60">
        <CardHeader>
          <CardDescription>My Performance</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            85.6%
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-muted-foreground">Index Performance</div>
        </CardFooter>
      </Card>
      <Card className="@container/card bg-pink-600/60">
        <CardHeader>
          <CardDescription>Team Performance</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            70.5%
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="text-muted-foreground">Index Performance</div>
        </CardFooter>
      </Card>
    </div>
  )
}

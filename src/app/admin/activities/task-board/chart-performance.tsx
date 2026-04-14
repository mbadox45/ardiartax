"use client"

import { useState } from "react"

import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

const chartData = [{ month: "january", mobile: 570, desktop: 1260 }]

const chartConfig = {
    desktop: {
        label: "Desktop",
        color: "#088F8F",
    },
    mobile: {
        label: "Mobile",
        color: "#9FE2BF",
    },
} satisfies ChartConfig


export default function ChartPerformance() {
    const totalVisitors = chartData[0].desktop + chartData[0].mobile

    // Logic to fetch and calculate performance data
    
    return (
        <Card size="sm" className="w-1/3 bg-pink-50">
            <CardHeader>
                <CardTitle>Performance Chart</CardTitle>
                <CardDescription className="text-xs">Visualisasikan performa tugasmu dengan grafik yang mudah dipahami.</CardDescription>
            </CardHeader>
            <Separator  />
            <CardContent className="">
                <ChartContainer
                config={chartConfig}
                className="mx-auto aspect-square rounded-full p-4"
                >
                    <RadialBarChart
                        data={chartData}
                        endAngle={180}
                        innerRadius={80}
                        outerRadius={110}
                    >
                        <RadialBar
                        dataKey="mobile"
                        fill="var(--color-mobile)"
                        stackId="a"
                        cornerRadius={5}
                        className="stroke-transparent stroke-2"
                        />
                        <RadialBar
                        dataKey="desktop"
                        stackId="a"
                        cornerRadius={5}
                        fill="var(--color-desktop)"
                        className="stroke-transparent stroke-2"
                        />
                        <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel />}
                        />
                        <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                        <Label
                            content={({ viewBox }) => {
                            if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                return (
                                <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                                    <tspan
                                    x={viewBox.cx}
                                    y={(viewBox.cy || 0) - 16}
                                    className="fill-foreground text-2xl font-bold"
                                    >
                                    {totalVisitors.toLocaleString()}
                                    </tspan>
                                    <tspan
                                    x={viewBox.cx}
                                    y={(viewBox.cy || 0) + 4}
                                    className="fill-muted-foreground"
                                    >
                                    Visitors
                                    </tspan>
                                </text>
                                )
                            }
                            }}
                        />
                        </PolarRadiusAxis>
                    </RadialBarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
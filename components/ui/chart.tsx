"use client"

import type { ReactNode } from "react"
import {
  LineChart as RechartsLineChart,
  Line as RechartsLine,
  XAxis as RechartsXAxis,
  YAxis as RechartsYAxis,
  CartesianGrid as RechartsCartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer as RechartsResponsiveContainer,
  ReferenceLine as RechartsReferenceLine,
  TooltipProps
} from "recharts"

export const LineChart = RechartsLineChart
export const Line = RechartsLine
export const XAxis = RechartsXAxis
export const YAxis = RechartsYAxis
export const CartesianGrid = RechartsCartesianGrid
export const Tooltip = RechartsTooltip
export const ResponsiveContainer = RechartsResponsiveContainer
export const ReferenceLine = RechartsReferenceLine

export const ChartContainer = ({ children }: { children: ReactNode }) => {
  return <div className="w-full h-full">{children}</div>
}

export const ChartTooltipContent = ({ children }: { children: ReactNode }) => {
  return <div className="bg-card p-2 rounded-md shadow-md">{children}</div>
}

// Define a proper type for ChartTooltip
export const ChartTooltip = ({ content, ...props }: TooltipProps<number, string>) => {
  return <RechartsTooltip content={content} {...props} />
}

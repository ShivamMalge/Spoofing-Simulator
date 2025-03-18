"use client"

import type React from "react"
import {
  LineChart as RechartsLineChart,
  Line as RechartsLine,
  XAxis as RechartsXAxis,
  YAxis as RechartsYAxis,
  CartesianGrid as RechartsCartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer as RechartsResponsiveContainer,
  ReferenceLine as RechartsReferenceLine,
} from "recharts"

export const LineChart = RechartsLineChart
export const Line = RechartsLine
export const XAxis = RechartsXAxis
export const YAxis = RechartsYAxis
export const CartesianGrid = RechartsCartesianGrid
export const Tooltip = RechartsTooltip
export const ResponsiveContainer = RechartsResponsiveContainer
export const ReferenceLine = RechartsReferenceLine

export const ChartContainer = ({ children }: { children: React.ReactNode }) => {
  return <div className="w-full h-full">{children}</div>
}

export const ChartTooltipContent = ({ children }: { children: React.ReactNode }) => {
  return <div className="bg-card p-2 rounded-md shadow-md">{children}</div>
}

export const ChartTooltip = ({ content, ...props }: any) => {
  return <RechartsTooltip content={content} {...props} />
}


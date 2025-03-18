"use client"

import { useEffect, useState } from "react"
import type { PricePoint } from "@/lib/types"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine, Tooltip } from "recharts"

interface PriceChartProps {
  priceHistory: PricePoint[]
  currentPrice: number
}

export default function PriceChart({ priceHistory, currentPrice }: PriceChartProps) {
  const [chartData, setChartData] = useState<PricePoint[]>([])

  useEffect(() => {
    setChartData(priceHistory)
  }, [priceHistory])

  // Calculate min and max for Y axis
  const prices = priceHistory.map((point) => point.price)
  const minPrice = Math.min(...prices) * 0.995
  const maxPrice = Math.max(...prices) * 1.005

  // Format time for X axis
  const formatTime = (time: string) => {
    const date = new Date(time)
    return `${date.getHours()}:${date.getMinutes().toString().padStart(2, "0")}`
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" tickFormatter={formatTime} tick={{ fontSize: 12 }} tickCount={5} />
          <YAxis
            domain={[minPrice, maxPrice]}
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `$${value.toFixed(2)}`}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload as PricePoint
                return (
                  <div className="bg-card p-2 rounded-md shadow-md">
                    <div className="text-sm font-medium">{formatTime(data.time)}</div>
                    <div className="text-sm font-bold">${data.price.toFixed(2)}</div>
                  </div>
                )
              }
              return null
            }}
          />
          <ReferenceLine y={currentPrice} stroke="#888" strokeDasharray="3 3" />
          <Line
            type="monotone"
            dataKey="price"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}


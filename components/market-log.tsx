"use client"

import { useEffect, useRef } from "react"
import type { LogEntry } from "@/lib/types"
import { AlertCircleIcon, AlertTriangleIcon, InfoIcon } from "lucide-react"

interface MarketLogProps {
  logs: LogEntry[]
}

export default function MarketLog({ logs }: MarketLogProps) {
  const logContainerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new logs are added
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = 0
    }
  }, [logs])

  // Format timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return `${date.getHours()}:${date.getMinutes().toString().padStart(2, "0")}:${date.getSeconds().toString().padStart(2, "0")}`
  }

  return (
    <div ref={logContainerRef} className="h-[300px] overflow-y-auto space-y-2 text-sm">
      {logs.length === 0 ? (
        <div className="flex items-center justify-center h-full text-muted-foreground">No market activity yet</div>
      ) : (
        logs.map((log, index) => (
          <div
            key={index}
            className={`p-2 rounded-md flex items-start gap-2 ${
              log.type === "warning"
                ? "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300"
                : log.type === "error"
                  ? "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300"
                  : log.type === "success"
                    ? "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300"
                    : "bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300"
            }`}
          >
            {log.type === "warning" ? (
              <AlertTriangleIcon className="h-4 w-4 shrink-0 mt-0.5" />
            ) : log.type === "error" ? (
              <AlertCircleIcon className="h-4 w-4 shrink-0 mt-0.5" />
            ) : (
              <InfoIcon className="h-4 w-4 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <div className="text-xs opacity-70">{formatTime(log.timestamp)}</div>
              <div>{log.message}</div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}


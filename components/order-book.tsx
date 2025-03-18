"use client"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { type Order, OrderIntent } from "@/lib/types"
import { AlertTriangleIcon, XIcon } from "lucide-react"

interface OrderBookProps {
  buyOrders: Order[]
  sellOrders: Order[]
  currentPrice: number
  onCancelOrder: (orderId: string) => void
}

export default function OrderBook({ buyOrders, sellOrders, currentPrice, onCancelOrder }: OrderBookProps) {
  // Sort orders by price (descending for sell, ascending for buy)
  const sortedSellOrders = [...sellOrders].sort((a, b) => a.price - b.price)
  const sortedBuyOrders = [...buyOrders].sort((a, b) => b.price - a.price)

  // Calculate max quantity for depth visualization
  const maxQuantity = Math.max(
    ...buyOrders.map((order) => order.quantity),
    ...sellOrders.map((order) => order.quantity),
    1000, // Minimum to prevent division by zero
  )

  return (
    <div className="grid grid-cols-1 gap-4">
      <div className="flex justify-between items-center px-4 py-2 bg-muted rounded-md">
        <span className="text-sm font-medium">Current Price:</span>
        <span className="text-lg font-bold">${currentPrice.toFixed(2)}</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="mb-2 text-sm font-medium text-red-500">Sell Orders</h3>
          <div className="space-y-1 max-h-[300px] overflow-y-auto">
            {sortedSellOrders.map((order) => (
              <OrderRow key={order.id} order={order} maxQuantity={maxQuantity} onCancel={onCancelOrder} side="sell" />
            ))}
            {sortedSellOrders.length === 0 && (
              <div className="text-center py-4 text-sm text-muted-foreground">No sell orders</div>
            )}
          </div>
        </div>

        <div>
          <h3 className="mb-2 text-sm font-medium text-green-500">Buy Orders</h3>
          <div className="space-y-1 max-h-[300px] overflow-y-auto">
            {sortedBuyOrders.map((order) => (
              <OrderRow key={order.id} order={order} maxQuantity={maxQuantity} onCancel={onCancelOrder} side="buy" />
            ))}
            {sortedBuyOrders.length === 0 && (
              <div className="text-center py-4 text-sm text-muted-foreground">No buy orders</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

interface OrderRowProps {
  order: Order
  maxQuantity: number
  onCancel: (orderId: string) => void
  side: "buy" | "sell"
}

function OrderRow({ order, maxQuantity, onCancel, side }: OrderRowProps) {
  const depthPercentage = (order.quantity / maxQuantity) * 100
  const isSpoof = order.intent === OrderIntent.SPOOF

  // Determine background color based on side and whether it's a spoof order
  const bgColor = isSpoof
    ? "bg-gray-300 dark:bg-gray-700 animate-pulse"
    : side === "buy"
      ? "bg-green-100 dark:bg-green-900/30"
      : "bg-red-100 dark:bg-red-900/30"

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative flex items-center justify-between p-2 rounded-md border">
            {/* Depth visualization */}
            <div
              className={`absolute top-0 bottom-0 ${side === "buy" ? "left-0" : "right-0"} ${bgColor} z-0`}
              style={{ width: `${Math.min(depthPercentage, 100)}%` }}
            />

            {/* Order details */}
            <div className="flex items-center z-10">
              <span className="font-mono">{order.quantity}</span>
              {isSpoof && <AlertTriangleIcon className="ml-1 h-4 w-4 text-yellow-500" />}
            </div>

            <div className="flex items-center gap-2 z-10">
              <span className="font-mono font-medium">${order.price.toFixed(2)}</span>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onCancel(order.id)}>
                <XIcon className="h-3 w-3" />
              </Button>
            </div>

            {/* If it's a spoof order, show a blinking indicator */}
            {isSpoof && <div className="absolute -left-1 -top-1 h-2 w-2 rounded-full bg-yellow-500 animate-ping" />}
          </div>
        </TooltipTrigger>
        <TooltipContent side="right">
          {isSpoof ? (
            <p className="text-yellow-500 font-medium">This is a simulated spoof order for educational purposes.</p>
          ) : (
            <div>
              <p>Order ID: {order.id.substring(0, 8)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Click X to cancel (in manual mode, cancelling limit orders simulates spoofing)
              </p>
            </div>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}


"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Switch } from "@/components/ui/switch"
import { type Order, OrderType, OrderSide, OrderIntent } from "@/lib/types"
import { v4 as uuidv4 } from "@/lib/uuid"
import { InfoIcon, AlertCircleIcon, TrendingDownIcon, TrendingUpIcon } from "lucide-react"

interface OrderPanelProps {
  onAddOrder: (order: Order) => void
  currentPrice: number
  buyOrders: Order[]
  sellOrders: Order[]
  onCancelOrder: (orderId: string) => void
}

export default function OrderPanel({
  onAddOrder,
  currentPrice,
  buyOrders,
  sellOrders,
  onCancelOrder,
}: OrderPanelProps) {
  const [orderType, setOrderType] = useState<OrderType>(OrderType.LIMIT)
  const [orderSide, setOrderSide] = useState<OrderSide>(OrderSide.BUY)
  const [quantity, setQuantity] = useState<number>(100)
  const [price, setPrice] = useState<number>(currentPrice)
  const [orderIntent, setOrderIntent] = useState<OrderIntent>(OrderIntent.GENUINE)
  const [isAutomatic, setIsAutomatic] = useState<boolean>(true)
  const [myOrders, setMyOrders] = useState<Order[]>([])

  // Update price when current price changes
  useEffect(() => {
    setPrice(currentPrice)
  }, [currentPrice])

  // Track orders placed in manual mode
  useEffect(() => {
    if (!isAutomatic) {
      const allOrders = [...buyOrders, ...sellOrders]
      // Only show limit orders in manual mode
      const limitOrders = allOrders.filter(
        (order) => order.type === OrderType.LIMIT && order.intent === OrderIntent.GENUINE,
      )
      setMyOrders(limitOrders)
    }
  }, [buyOrders, sellOrders, isAutomatic])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newOrder: Order = {
      id: uuidv4(),
      type: orderType,
      side: orderSide,
      price: orderType === OrderType.MARKET ? 0 : price,
      quantity,
      timestamp: new Date().toISOString(),
      // In manual mode, all orders are genuine
      intent: isAutomatic ? orderIntent : OrderIntent.GENUINE,
    }

    onAddOrder(newOrder)

    // Reset form for next order
    setQuantity(100)
    setPrice(currentPrice)
    setOrderIntent(OrderIntent.GENUINE)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="mode-toggle" className="text-sm font-medium">
          Mode
        </Label>
        <div className="flex items-center space-x-2">
          <Label htmlFor="mode-toggle" className={`text-sm ${isAutomatic ? "text-muted-foreground" : "font-medium"}`}>
            Manual
          </Label>
          <Switch id="mode-toggle" checked={isAutomatic} onCheckedChange={setIsAutomatic} />
          <Label htmlFor="mode-toggle" className={`text-sm ${isAutomatic ? "font-medium" : "text-muted-foreground"}`}>
            Automatic
          </Label>
        </div>
      </div>

      {isAutomatic ? (
        <div className="rounded-md border p-3 bg-muted/30">
          <p className="text-sm text-muted-foreground mb-2">
            In automatic mode, you can specify the intent of your orders, including spoofed orders that will be visually
            marked.
          </p>
        </div>
      ) : (
        <div className="rounded-md border p-3 bg-yellow-100 dark:bg-yellow-900/20">
          <div className="text-sm text-yellow-800 dark:text-yellow-300">
            <p className="mb-2">
              <strong>Manual Spoofing Simulation:</strong> In manual mode, you can place genuine orders and then
              manually cancel limit orders to simulate spoofing behavior.
            </p>
            <div className="flex items-center gap-1 mb-1">
              <AlertCircleIcon className="h-4 w-4" />
              <span className="font-medium">To cancel an order, use the X button in the order book or below.</span>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label>Order Type</Label>
        <Tabs defaultValue="limit" onValueChange={(value) => setOrderType(value as OrderType)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value={OrderType.LIMIT}>Limit</TabsTrigger>
            <TabsTrigger value={OrderType.MARKET}>Market</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="space-y-2">
        <Label>Side</Label>
        <Tabs defaultValue="buy" onValueChange={(value) => setOrderSide(value as OrderSide)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger
              value={OrderSide.BUY}
              className="data-[state=active]:bg-green-500 data-[state=active]:text-white"
            >
              Buy
            </TabsTrigger>
            <TabsTrigger
              value={OrderSide.SELL}
              className="data-[state=active]:bg-red-500 data-[state=active]:text-white"
            >
              Sell
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="space-y-2">
        <Label htmlFor="quantity">Quantity</Label>
        <Input
          id="quantity"
          type="number"
          min="1"
          step="1"
          value={quantity}
          onChange={(e) => setQuantity(Number.parseInt(e.target.value) || 0)}
          required
        />
      </div>

      {orderType === OrderType.LIMIT && (
        <div className="space-y-2">
          <Label htmlFor="price">Price</Label>
          <Input
            id="price"
            type="number"
            min="0.01"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(Number.parseFloat(e.target.value) || 0)}
            required
          />
        </div>
      )}

      {!isAutomatic && orderType === OrderType.LIMIT && (
        <div className="flex items-center justify-between rounded-md border p-3 bg-muted/30">
          <div className="flex items-center gap-2">
            <TrendingDownIcon className="h-5 w-5 text-red-500" />
            <span className="text-sm font-medium">Sell orders cause price to fall</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUpIcon className="h-5 w-5 text-green-500" />
            <span className="text-sm font-medium">Buy orders cause price to rise</span>
          </div>
        </div>
      )}

      {isAutomatic && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Order Intent (Educational)</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <InfoIcon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    This is for educational purposes only. In real markets, spoofing is illegal.
                    <br />
                    <br />
                    <strong>Genuine:</strong> Normal trading order
                    <br />
                    <strong>Aggressive:</strong> Order intended to move the market
                    <br />
                    <strong>Spoof:</strong> Order placed with intent to cancel (illegal in real markets)
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <RadioGroup
            defaultValue={OrderIntent.GENUINE}
            onValueChange={(value) => setOrderIntent(value as OrderIntent)}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value={OrderIntent.GENUINE} id="intent-genuine" />
              <Label htmlFor="intent-genuine" className="font-normal">
                Genuine
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value={OrderIntent.AGGRESSIVE} id="intent-aggressive" />
              <Label htmlFor="intent-aggressive" className="font-normal">
                Aggressive
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value={OrderIntent.SPOOF} id="intent-spoof" />
              <Label htmlFor="intent-spoof" className="font-normal text-yellow-500">
                Spoof (Educational)
              </Label>
            </div>
          </RadioGroup>
        </div>
      )}

      <Button type="submit" className="w-full">
        Place Order
      </Button>

      {!isAutomatic && (
        <>
          {myOrders.length > 0 ? (
            <div className="rounded-md border p-3 bg-muted/30 mt-2">
              <div className="text-sm">
                <p className="font-medium mb-2">Your Active Limit Orders:</p>
                <div className="space-y-2 max-h-[150px] overflow-y-auto">
                  {myOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-2 rounded-md border bg-card">
                      <div>
                        <span className={order.side === OrderSide.BUY ? "text-green-500" : "text-red-500"}>
                          {order.side === OrderSide.BUY ? "BUY" : "SELL"}
                        </span>
                        <span className="ml-2">
                          {order.quantity} @ ${order.price.toFixed(2)}
                        </span>
                      </div>
                      <Button variant="destructive" size="sm" onClick={() => onCancelOrder(order.id)} className="h-7">
                        Cancel (Spoof)
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            orderType === OrderType.LIMIT && (
              <div className="rounded-md border p-3 bg-muted/30 mt-2">
                <div className="text-sm text-muted-foreground">
                  <p className="mb-2">
                    <strong>Educational Note:</strong> To simulate spoofing in manual mode:
                  </p>
                  <ol className="list-decimal pl-5 mt-1 space-y-1">
                    <li>
                      <strong>Place a large limit order</strong> (300+ quantity) away from the current price
                    </li>
                    <li>Wait for the market to react to your order (price will move)</li>
                    <li>Place a genuine order in the opposite direction</li>
                    <li>Cancel your original limit order before it executes</li>
                  </ol>
                  <p className="mt-2">Remember: This simulation is for educational purposes only.</p>
                </div>
              </div>
            )
          )}
        </>
      )}
    </form>
  )
}


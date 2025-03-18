"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/hooks/use-toast"
import { InfoIcon, PlayIcon, PauseIcon, StepForwardIcon, RefreshCwIcon } from "lucide-react"
import OrderBook from "@/components/order-book"
import OrderPanel from "@/components/order-panel"
import PriceChart from "@/components/price-chart"
import MarketLog from "@/components/market-log"
import EducationalModal from "@/components/educational-modal"
import { type Order, OrderType, OrderSide, OrderIntent, type LogEntry, type PricePoint } from "@/lib/types"
import { generateInitialOrders, processTrade, calculatePrice } from "@/lib/market-simulation"

export default function SpoofingSimulator() {
  const { toast } = useToast()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalContent, setModalContent] = useState<string>("spoofing")
  const [buyOrders, setBuyOrders] = useState<Order[]>([])
  const [sellOrders, setSellOrders] = useState<Order[]>([])
  const [marketLogs, setMarketLogs] = useState<LogEntry[]>([])
  const [priceHistory, setPriceHistory] = useState<PricePoint[]>([])
  const [currentPrice, setCurrentPrice] = useState(100)
  const [isSimulationRunning, setIsSimulationRunning] = useState(false)
  const [simulationStep, setSimulationStep] = useState(0)
  const simulationSpeed = 1000 // ms between steps
  const simulationInterval = useRef<NodeJS.Timeout | null>(null)
  const [simulationComplete, setSimulationComplete] = useState(false)

  // Initialize market
  useEffect(() => {
    const initialOrders = generateInitialOrders()
    setBuyOrders(initialOrders.buyOrders)
    setSellOrders(initialOrders.sellOrders)

    // Initialize price history with some historical data
    const initialPrice = 100
    const initialHistory: PricePoint[] = Array.from({ length: 30 }, (_, i) => ({
      time: new Date(Date.now() - (30 - i) * 60000).toISOString(),
      price: initialPrice + (Math.random() * 2 - 1),
    }))
    setPriceHistory(initialHistory)
    setCurrentPrice(initialPrice)

    addLog({
      type: "info",
      message: "Market simulation initialized. Current price: $" + initialPrice.toFixed(2),
    })

    return () => {
      if (simulationInterval.current) {
        clearInterval(simulationInterval.current)
      }
    }
  }, [])

  // Show toast when simulation completes
  useEffect(() => {
    if (simulationComplete) {
      toast({
        title: "Simulation Complete",
        description: "The Sarao spoofing strategy simulation has completed. You can replay it or try manual trading.",
      })
      setSimulationComplete(false)
    }
  }, [simulationComplete, toast, simulationStep])

  // Update price based on order book
  useEffect(() => {
    const newPrice = calculatePrice(buyOrders, sellOrders)
    if (newPrice !== currentPrice) {
      setCurrentPrice(newPrice)
      setPriceHistory((prev) => [
        ...prev,
        {
          time: new Date().toISOString(),
          price: newPrice,
        },
      ])

      // Trim history if it gets too long
      if (priceHistory.length > 100) {
        setPriceHistory((prev) => prev.slice(-100))
      }
    }
  }, [buyOrders, sellOrders, currentPrice, priceHistory.length])

  const addLog = (log: LogEntry) => {
    setMarketLogs((prev) => [
      {
        ...log,
        timestamp: new Date().toISOString(),
      },
      ...prev,
    ])
  }

  const handleAddOrder = (order: Order) => {
    // First add the order to the appropriate side
    if (order.side === OrderSide.BUY) {
      setBuyOrders((prev) => [...prev, order])
      addLog({
        type: order.intent === OrderIntent.SPOOF ? "warning" : "success",
        message: `New ${order.intent === OrderIntent.SPOOF ? "spoofed " : ""}buy order: ${order.quantity} @ $${order.price.toFixed(2)}`,
      })
    } else {
      setSellOrders((prev) => [...prev, order])
      addLog({
        type: order.intent === OrderIntent.SPOOF ? "warning" : "success",
        message: `New ${order.intent === OrderIntent.SPOOF ? "spoofed " : ""}sell order: ${order.quantity} @ $${order.price.toFixed(2)}`,
      })
    }

    // If it's a large order, simulate market reaction
    if (order.quantity >= 300 && order.type === OrderType.LIMIT) {
      // Slight delay to make the reaction feel more natural
      setTimeout(() => {
        // SELL orders should cause price to fall (bearish)
        if (order.side === OrderSide.SELL) {
          // Remove some buy orders to simulate market participants pulling back
          setBuyOrders((prev) => {
            // Remove approximately 30% of buy orders randomly
            return prev.filter((o) => o.id === order.id || Math.random() > 0.3)
          })

          // Lower the price of remaining buy orders
          setBuyOrders((prev) => {
            return prev.map((o) => {
              if (o.id !== order.id && Math.random() > 0.5) {
                // Lower price by 0.5-1.5%
                const adjustmentFactor = 1 - (0.005 + Math.random() * 0.01)
                return {
                  ...o,
                  price: o.price * adjustmentFactor,
                }
              }
              return o
            })
          })

          addLog({
            type: "info",
            message: `Market reacts to large sell order: buy orders retreating, price falling`,
          })
        }
        // BUY orders should cause price to rise (bullish)
        else {
          // Remove some sell orders to simulate market participants pulling back
          setSellOrders((prev) => {
            // Remove approximately 30% of sell orders randomly
            return prev.filter((o) => o.id === order.id || Math.random() > 0.3)
          })

          // Raise the price of remaining sell orders
          setSellOrders((prev) => {
            return prev.map((o) => {
              if (o.id !== order.id && Math.random() > 0.5) {
                // Raise price by 0.5-1.5%
                const adjustmentFactor = 1 + (0.005 + Math.random() * 0.01)
                return {
                  ...o,
                  price: o.price * adjustmentFactor,
                }
              }
              return o
            })
          })

          addLog({
            type: "info",
            message: `Market reacts to large buy order: sell orders retreating, price rising`,
          })
        }
      }, 1000)
    }

    // If it's a market order, process it immediately
    if (order.type === OrderType.MARKET) {
      const result = processTrade(order, buyOrders, sellOrders)
      setBuyOrders(result.updatedBuyOrders)
      setSellOrders(result.updatedSellOrders)

      addLog({
        type: "info",
        message: `Market order executed: ${order.quantity} @ $${result.executionPrice?.toFixed(2) || currentPrice.toFixed(2)}`,
      })
    }
  }

  const handleCancelOrder = (orderId: string) => {
    // Check if this is a buy or sell order before removing it
    const isBuyOrder = buyOrders.some((order) => order.id === orderId)
    const isSellOrder = sellOrders.some((order) => order.id === orderId)

    // Get the order details before removing it
    const order = isBuyOrder
      ? buyOrders.find((order) => order.id === orderId)
      : isSellOrder
        ? sellOrders.find((order) => order.id === orderId)
        : null

    // Remove the order
    setBuyOrders((prev) => prev.filter((order) => order.id !== orderId))
    setSellOrders((prev) => prev.filter((order) => order.id !== orderId))

    // If it was a large order that's being canceled (simulating spoofing)
    if (order && order.intent !== OrderIntent.SPOOF && order.quantity >= 300) {
      addLog({
        type: "warning",
        message: `Order ${orderId.substring(0, 8)} cancelled manually - this simulates spoofing behavior`,
      })

      // Simulate market reaction to the cancellation (price moves in opposite direction)
      setTimeout(() => {
        // If a large SELL order is canceled, price should rise (bullish reaction)
        if (order.side === OrderSide.SELL) {
          // Add some buy orders to simulate market participants returning
          const newBuyOrders = Array.from({ length: 3 }, (_, i) => ({
            id: `reaction-buy-${Date.now()}-${i}`,
            type: OrderType.LIMIT,
            side: OrderSide.BUY,
            price: currentPrice * (0.99 + Math.random() * 0.02), // Around current price
            quantity: 50 + Math.floor(Math.random() * 200),
            timestamp: new Date().toISOString(),
            intent: OrderIntent.GENUINE,
          }))

          setBuyOrders((prev) => [...prev, ...newBuyOrders])

          // Raise some existing buy order prices
          setBuyOrders((prev) => {
            return prev.map((o) => {
              if (Math.random() > 0.6) {
                // Raise price by 0.5-1.5%
                const adjustmentFactor = 1 + (0.005 + Math.random() * 0.01)
                return {
                  ...o,
                  price: o.price * adjustmentFactor,
                }
              }
              return o
            })
          })

          addLog({
            type: "info",
            message: `Market reacts to canceled sell order: price rebounds as selling pressure is removed`,
          })
        }
        // If a large BUY order is canceled, price should fall (bearish reaction)
        else {
          // Add some sell orders to simulate market participants returning
          const newSellOrders = Array.from({ length: 3 }, (_, i) => ({
            id: `reaction-sell-${Date.now()}-${i}`,
            type: OrderType.LIMIT,
            side: OrderSide.SELL,
            price: currentPrice * (1.01 - Math.random() * 0.02), // Around current price
            quantity: 50 + Math.floor(Math.random() * 200),
            timestamp: new Date().toISOString(),
            intent: OrderIntent.GENUINE,
          }))

          setSellOrders((prev) => [...prev, ...newSellOrders])

          // Lower some existing sell order prices
          setSellOrders((prev) => {
            return prev.map((o) => {
              if (Math.random() > 0.6) {
                // Lower price by 0.5-1.5%
                const adjustmentFactor = 1 - (0.005 + Math.random() * 0.01)
                return {
                  ...o,
                  price: o.price * adjustmentFactor,
                }
              }
              return o
            })
          })

          addLog({
            type: "info",
            message: `Market reacts to canceled buy order: price drops as buying pressure is removed`,
          })
        }
      }, 800)
    } else {
      addLog({
        type: "info",
        message: `Order ${orderId.substring(0, 8)} cancelled`,
      })
    }
  }

  const startSaraoSimulation = () => {
    setIsSimulationRunning(true)
    setSimulationStep(0)

    // Reset the market state
    const initialOrders = generateInitialOrders()
    setBuyOrders(initialOrders.buyOrders)
    setSellOrders(initialOrders.sellOrders)

    addLog({
      type: "info",
      message: "Starting Sarao spoofing strategy simulation...",
    })

    simulationInterval.current = setInterval(() => {
      setSimulationStep((step) => {
        const newStep = step + 1
        const timestamp = Date.now()

        // Run the simulation steps
        switch (newStep) {
          case 1:
            // Step 1: Place large spoof sell orders above market price
            const spoofSellOrders: Order[] = Array.from({ length: 5 }, (_, i) => ({
              id: `spoof-sell-${timestamp}-${i}`, // Add timestamp to make keys unique
              type: OrderType.LIMIT,
              side: OrderSide.SELL,
              price: currentPrice + 0.5 + i * 0.1,
              quantity: 500 + Math.floor(Math.random() * 500),
              timestamp: new Date().toISOString(),
              intent: OrderIntent.SPOOF,
            }))

            setSellOrders((prev) => [...prev, ...spoofSellOrders])

            addLog({
              type: "warning",
              message: "Large spoof sell orders placed above market price",
            })
            break

          case 2:
            // Step 2: Market reacts, buy orders retreat
            setBuyOrders((prev) => {
              const newOrders = [...prev]
              // Remove some buy orders to simulate market participants pulling back
              return newOrders.filter((_, i) => i % 3 !== 0)
            })

            addLog({
              type: "info",
              message: "Market reacts: Buy orders retreating due to sell pressure",
            })
            break

          case 3:
            // Step 3: Price drops, Sarao buys the dip
            const saraoOrder: Order = {
              id: `sarao-buy-${timestamp}`,
              type: OrderType.MARKET,
              side: OrderSide.BUY,
              price: 0, // Market order, price determined by market
              quantity: 1000,
              timestamp: new Date().toISOString(),
              intent: OrderIntent.GENUINE,
            }

            const result = processTrade(saraoOrder, buyOrders, sellOrders)
            setBuyOrders(result.updatedBuyOrders)
            setSellOrders(result.updatedSellOrders)

            addLog({
              type: "success",
              message: "Price dropped! Sarao buys the dip with large market buy order",
            })
            break

          case 4:
            // Step 4: Cancel spoof orders
            setSellOrders((prev) => prev.filter((order) => order.intent !== OrderIntent.SPOOF))

            addLog({
              type: "warning",
              message: "Spoof sell orders cancelled before they could be executed",
            })
            break

          case 5:
            // Step 5: Price rebounds, Sarao sells for profit
            const saraoSellOrder: Order = {
              id: `sarao-sell-${timestamp}`,
              type: OrderType.MARKET,
              side: OrderSide.SELL,
              price: 0, // Market order, price determined by market
              quantity: 1000,
              timestamp: new Date().toISOString(),
              intent: OrderIntent.GENUINE,
            }

            const sellResult = processTrade(saraoSellOrder, buyOrders, sellOrders)
            setBuyOrders(sellResult.updatedBuyOrders)
            setSellOrders(sellResult.updatedSellOrders)

            addLog({
              type: "success",
              message: "Price rebounds! Sarao sells for profit",
            })

            // End simulation
            setIsSimulationRunning(false)
            if (simulationInterval.current) {
              clearInterval(simulationInterval.current)
              simulationInterval.current = null
            }

            // Set flag to show toast in useEffect
            setSimulationComplete(true)
            break

          default:
            // End simulation if we've gone beyond our steps
            setIsSimulationRunning(false)
            if (simulationInterval.current) {
              clearInterval(simulationInterval.current)
              simulationInterval.current = null
            }
        }

        return newStep
      })
    }, simulationSpeed)
  }

  const stopSimulation = () => {
    setIsSimulationRunning(false)
    if (simulationInterval.current) {
      clearInterval(simulationInterval.current)
      simulationInterval.current = null
    }

    addLog({
      type: "info",
      message: "Simulation paused",
    })
  }

  const resetSimulation = () => {
    setIsSimulationRunning(false)
    if (simulationInterval.current) {
      clearInterval(simulationInterval.current)
      simulationInterval.current = null
    }

    // Reset the market state
    const initialOrders = generateInitialOrders()
    setBuyOrders(initialOrders.buyOrders)
    setSellOrders(initialOrders.sellOrders)

    addLog({
      type: "info",
      message: "Simulation reset",
    })
  }

  const stepSimulation = () => {
    if (!isSimulationRunning) {
      // Manually trigger the next step
      setSimulationStep((step) => {
        const newStep = step + 1
        const timestamp = Date.now()

        // Run the simulation steps (same logic as in interval)
        // This is a simplified version - in a real implementation, you'd refactor
        // the step logic into a separate function to avoid duplication
        switch (newStep) {
          case 1:
            // Step 1: Place large spoof sell orders above market price
            const spoofSellOrders: Order[] = Array.from({ length: 5 }, (_, i) => ({
              id: `spoof-sell-${timestamp}-${i}`, // Add timestamp to make keys unique
              type: OrderType.LIMIT,
              side: OrderSide.SELL,
              price: currentPrice + 0.5 + i * 0.1,
              quantity: 500 + Math.floor(Math.random() * 500),
              timestamp: new Date().toISOString(),
              intent: OrderIntent.SPOOF,
            }))

            setSellOrders((prev) => [...prev, ...spoofSellOrders])

            addLog({
              type: "warning",
              message: "Large spoof sell orders placed above market price",
            })
            break

          // ... other cases would be identical to the interval logic

          default:
            // Do nothing if we've gone beyond our steps
            break
        }

        return newStep
      })
    }
  }

  const openEducationalModal = (content: string) => {
    setModalContent(content)
    setIsModalOpen(true)
  }

  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle>Live Price Chart</CardTitle>
              <CardDescription>Real-time price movement based on order book</CardDescription>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={() => openEducationalModal("price-chart")}>
                    <InfoIcon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Learn how price is affected by order book pressure</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardHeader>
          <CardContent>
            <PriceChart priceHistory={priceHistory} currentPrice={currentPrice} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle>Market Reactions</CardTitle>
              <CardDescription>Real-time market events and reactions</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <MarketLog logs={marketLogs} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle>Order Book</CardTitle>
              <CardDescription>Active buy and sell orders with depth visualization</CardDescription>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={() => openEducationalModal("order-book")}>
                    <InfoIcon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Learn how the order book works</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardHeader>
          <CardContent>
            <OrderBook
              buyOrders={buyOrders}
              sellOrders={sellOrders}
              currentPrice={currentPrice}
              onCancelOrder={handleCancelOrder}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle>Place Orders</CardTitle>
              <CardDescription>Create market or limit orders</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <OrderPanel
              onAddOrder={handleAddOrder}
              currentPrice={currentPrice}
              buyOrders={buyOrders}
              sellOrders={sellOrders}
              onCancelOrder={handleCancelOrder}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>Simulation Controls</CardTitle>
            <CardDescription>Run pre-configured market manipulation scenarios</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button onClick={startSaraoSimulation} disabled={isSimulationRunning} className="bg-primary">
              <PlayIcon className="mr-2 h-4 w-4" />
              Replay Sarao Strategy
            </Button>

            <Button onClick={stopSimulation} disabled={!isSimulationRunning} variant="outline">
              <PauseIcon className="mr-2 h-4 w-4" />
              Pause
            </Button>

            <Button onClick={stepSimulation} disabled={isSimulationRunning} variant="outline">
              <StepForwardIcon className="mr-2 h-4 w-4" />
              Step Forward
            </Button>

            <Button onClick={resetSimulation} variant="outline">
              <RefreshCwIcon className="mr-2 h-4 w-4" />
              Reset
            </Button>

            <Button onClick={() => openEducationalModal("spoofing")} variant="outline">
              Learn About Spoofing
            </Button>

            <Button onClick={() => openEducationalModal("flash-crash")} variant="outline">
              2010 Flash Crash
            </Button>
          </div>
        </CardContent>
      </Card>

      <EducationalModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} content={modalContent} />
    </div>
  )
}



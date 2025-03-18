import { type Order, OrderType, OrderSide, OrderIntent } from "@/lib/types"

// Generate initial orders for the market
export function generateInitialOrders() {
  const basePrice = 100
  const buyOrders: Order[] = []
  const sellOrders: Order[] = []

  // Generate some buy orders below current price
  for (let i = 1; i <= 10; i++) {
    const price = basePrice - i * 0.1 - Math.random() * 0.05
    const quantity = 50 + Math.floor(Math.random() * 200)

    buyOrders.push({
      id: `init-buy-${i}`,
      type: OrderType.LIMIT,
      side: OrderSide.BUY,
      price,
      quantity,
      timestamp: new Date().toISOString(),
      intent: OrderIntent.GENUINE,
    })
  }

  // Generate some sell orders above current price
  for (let i = 1; i <= 10; i++) {
    const price = basePrice + i * 0.1 + Math.random() * 0.05
    const quantity = 50 + Math.floor(Math.random() * 200)

    sellOrders.push({
      id: `init-sell-${i}`,
      type: OrderType.LIMIT,
      side: OrderSide.SELL,
      price,
      quantity,
      timestamp: new Date().toISOString(),
      intent: OrderIntent.GENUINE,
    })
  }

  return { buyOrders, sellOrders }
}

// Process a trade (market order or matching limit orders)
export function processTrade(order: Order, buyOrders: Order[], sellOrders: Order[]) {
  let updatedBuyOrders = [...buyOrders]
  let updatedSellOrders = [...sellOrders]
  let executionPrice: number | null = null

  if (order.type === OrderType.MARKET) {
    let remainingQuantity = order.quantity

    if (order.side === OrderSide.BUY) {
      // Sort sell orders by price (ascending)
      const sortedSellOrders = [...sellOrders].sort((a, b) => a.price - b.price)

      // Execute against available sell orders
      for (const sellOrder of sortedSellOrders) {
        if (remainingQuantity <= 0) break

        const executedQuantity = Math.min(remainingQuantity, sellOrder.quantity)
        remainingQuantity -= executedQuantity

        // Set execution price to the first matched order's price
        if (executionPrice === null) {
          executionPrice = sellOrder.price
        }

        // Update or remove the matched sell order
        if (executedQuantity === sellOrder.quantity) {
          updatedSellOrders = updatedSellOrders.filter((o) => o.id !== sellOrder.id)
        } else {
          updatedSellOrders = updatedSellOrders.map((o) =>
            o.id === sellOrder.id ? { ...o, quantity: o.quantity - executedQuantity } : o,
          )
        }
      }
    } else {
      // Sort buy orders by price (descending)
      const sortedBuyOrders = [...buyOrders].sort((a, b) => b.price - a.price)

      // Execute against available buy orders
      for (const buyOrder of sortedBuyOrders) {
        if (remainingQuantity <= 0) break

        const executedQuantity = Math.min(remainingQuantity, buyOrder.quantity)
        remainingQuantity -= executedQuantity

        // Set execution price to the first matched order's price
        if (executionPrice === null) {
          executionPrice = buyOrder.price
        }

        // Update or remove the matched buy order
        if (executedQuantity === buyOrder.quantity) {
          updatedBuyOrders = updatedBuyOrders.filter((o) => o.id !== buyOrder.id)
        } else {
          updatedBuyOrders = updatedBuyOrders.map((o) =>
            o.id === buyOrder.id ? { ...o, quantity: o.quantity - executedQuantity } : o,
          )
        }
      }
    }
  }

  return {
    updatedBuyOrders,
    updatedSellOrders,
    executionPrice,
  }
}

// Calculate current price based on order book
export function calculatePrice(buyOrders: Order[], sellOrders: Order[]): number {
  if (buyOrders.length === 0 && sellOrders.length === 0) {
    return 100 // Default price if no orders
  }

  // Find highest buy price
  const highestBuy = buyOrders.length > 0 ? Math.max(...buyOrders.map((order) => order.price)) : 0

  // Find lowest sell price
  const lowestSell = sellOrders.length > 0 ? Math.min(...sellOrders.map((order) => order.price)) : Number.MAX_VALUE

  // Calculate mid price
  if (highestBuy > 0 && lowestSell < Number.MAX_VALUE) {
    return (highestBuy + lowestSell) / 2
  } else if (highestBuy > 0) {
    return highestBuy
  } else if (lowestSell < Number.MAX_VALUE) {
    return lowestSell
  } else {
    return 100 // Default fallback
  }
}

// Simulate market reaction to large orders
export function simulateMarketReaction(
  buyOrders: Order[],
  sellOrders: Order[],
  newOrder: Order,
): { updatedBuyOrders: Order[]; updatedSellOrders: Order[] } {
  // Clone the orders arrays
  let updatedBuyOrders = [...buyOrders]
  let updatedSellOrders = [...sellOrders]

  // Only react to large orders (threshold could be adjusted)
  const isLargeOrder = newOrder.quantity >= 300

  if (!isLargeOrder) {
    return { updatedBuyOrders, updatedSellOrders }
  }

  // Determine reaction based on order side and size
  const reactionStrength = Math.min(0.7, newOrder.quantity / 2000) // Cap at 70% reaction

  if (newOrder.side === OrderSide.SELL) {
    // Large sell order causes some buy orders to retreat
    updatedBuyOrders = updatedBuyOrders.filter(() => {
      // Higher reaction strength means more orders are removed
      return Math.random() > reactionStrength * 0.5
    })

    // Also adjust some remaining buy order prices downward
    updatedBuyOrders = updatedBuyOrders.map((order) => {
      if (Math.random() < reactionStrength * 0.7) {
        return {
          ...order,
          price: order.price * (1 - Math.random() * 0.01 * reactionStrength * 10),
        }
      }
      return order
    })
  } else {
    // Large buy order causes some sell orders to retreat
    updatedSellOrders = updatedSellOrders.filter(() => {
      return Math.random() > reactionStrength * 0.5
    })

    // Also adjust some remaining sell order prices upward
    updatedSellOrders = updatedSellOrders.map((order) => {
      if (Math.random() < reactionStrength * 0.7) {
        return {
          ...order,
          price: order.price * (1 + Math.random() * 0.01 * reactionStrength * 10),
        }
      }
      return order
    })
  }

  return { updatedBuyOrders, updatedSellOrders }
}



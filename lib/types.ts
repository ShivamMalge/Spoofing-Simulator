export enum OrderType {
  MARKET = "market",
  LIMIT = "limit",
}

// Order Sides
export enum OrderSide {
  BUY = "buy",
  SELL = "sell",
}

// Order Intent (for educational purposes)
export enum OrderIntent {
  GENUINE = "genuine",
  AGGRESSIVE = "aggressive",
  SPOOF = "spoof",
}

// Order Interface
export interface Order {
  id: string
  type: OrderType
  side: OrderSide
  price: number // For market orders, this is 0 or ignored
  quantity: number
  timestamp: string
  intent: OrderIntent
}

// Market State
export interface MarketState {
  buyOrders: Order[]
  sellOrders: Order[]
  currentPrice: number
  priceHistory: PricePoint[]
}

// Log Entry
export interface LogEntry {
  type: "info" | "warning" | "error" | "success"
  message: string
  timestamp?: string
}

// Price Point for Chart
export interface PricePoint {
  time: string
  price: number
}


import SpoofingSimulator from "@/components/spoofing-simulator"
import { Toaster } from "@/components/ui/toaster"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between py-4">
          <h1 className="text-2xl font-bold">Market Spoofing Simulator</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">ONLY FOR EDUCATIONAL PURPOSE</span>
          </div>
        </div>
      </header>
      <main className="container py-6">
        <div className="mb-6">
          <h2 className="text-3xl font-bold tracking-tight">Sarao Spoofing Simulation</h2>
          <p className="text-muted-foreground">
            Learn how market manipulation through spoofing affects price movements and market liquidity.
          </p>
        </div>
        <SpoofingSimulator />
      </main>
      <footer className="border-t bg-muted/50">
        <div className="container py-6">
          <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
            <p className="text-center font-semibold text-red-500">
              This simulation is strictly for educational and research purposes.
              <br />
              Spoofing is a criminal offense in real financial markets.
            </p>
          </div>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Shivam Malge. All rights reserved.
          </p>
        </div>
      </footer>
      <Toaster />
    </div>
  )
}


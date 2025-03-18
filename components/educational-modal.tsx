"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface EducationalModalProps {
  isOpen: boolean
  onClose: () => void
  content: string
}

export default function EducationalModal({ isOpen, onClose, content }: EducationalModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        {content === "spoofing" && (
          <>
            <DialogHeader>
              <DialogTitle>What is Spoofing?</DialogTitle>
              <DialogDescription>Understanding market manipulation through spoofing</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <h3 className="text-lg font-semibold">Definition</h3>
              <p>
                Spoofing is a form of market manipulation where a trader places a large order with no intention of
                executing it, only to cancel it shortly after. The purpose is to create a false impression of market
                activity, influencing other market participants to act in a way that benefits the spoofer.
              </p>

              <h3 className="text-lg font-semibold">How Spoofing Works</h3>
              <ol className="list-decimal pl-5 space-y-2">
                <li>
                  <strong>Place Deceptive Orders:</strong> A trader places large orders to buy or sell at prices that
                  are unlikely to be executed immediately.
                </li>
                <li>
                  <strong>Create False Market Impression:</strong> These orders create an illusion of strong buying or
                  selling interest.
                </li>
                <li>
                  <strong>Market Reaction:</strong> Other traders and algorithms react to this apparent pressure by
                  adjusting their orders.
                </li>
                <li>
                  <strong>Profit from Reaction:</strong> The spoofer executes trades in the opposite direction at
                  favorable prices.
                </li>
                <li>
                  <strong>Cancel Spoof Orders:</strong> The original large orders are quickly canceled before they can
                  be executed.
                </li>
              </ol>

              <h3 className="text-lg font-semibold">Manual vs. Automatic Simulation</h3>
              <p>In this simulator, you can experience spoofing in two ways:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Automatic Mode:</strong> Orders can be flagged as &quot;spoof&quot; orders automatically, making them
                  visually distinct.
                </li>
                <li>
                  <strong>Manual Mode:</strong> You can manually simulate the spoofing process by placing limit orders
                  and then canceling them after they&apos;ve influenced the market, giving you hands-on experience with how
                  this manipulation technique works.
                </li>
              </ul>

              <h3 className="text-lg font-semibold">Legal Status</h3>
              <p>
                Spoofing is illegal in most financial markets worldwide. In the United States, the Dodd-Frank Act of
                2010 explicitly prohibits spoofing, defining it as &quot;bidding or offering with the intent to cancel the
                bid or offer before execution.&quot;
              </p>

              <h3 className="text-lg font-semibold">Detection</h3>
              <p>
                Market regulators use sophisticated surveillance systems to detect patterns consistent with spoofing,
                such as high order-to-trade ratios, rapid order cancellations, and price movements that benefit the
                suspected spoofer.
              </p>
            </div>
          </>
        )}

        {content === "flash-crash" && (
          <>
            <DialogHeader>
              <DialogTitle>The 2010 Flash Crash</DialogTitle>
              <DialogDescription>How spoofing contributed to a major market disruption</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <h3 className="text-lg font-semibold">What Happened</h3>
              <p>
                On May 6, 2010, the U.S. stock markets experienced a sudden, severe drop and recovery within minutes.
                The Dow Jones Industrial Average plunged about 1,000 points (9%) in just 36 minutes, only to recover
                most of those losses within the next 20 minutes. This event became known as the &quot;Flash Crash.&quot;
              </p>

              <h3 className="text-lg font-semibold">Navinder Sarao&apos;s Role</h3>
              <p>
                Navinder Sarao, a trader operating from his parents&apos; home in London, was later charged with contributing
                to the Flash Crash through spoofing activities. He used modified trading software to place and quickly
                cancel large orders in the E-mini S&amp;P 500 futures market.
              </p>

              <h3 className="text-lg font-semibold">Sarao&apos;s Strategy</h3>
              <ol className="list-decimal pl-5 space-y-2">
                <li>
                  <strong>Modified Trading Software:</strong> Sarao used custom software that allowed him to place
                  orders and cancel them automatically if they risked being filled.
                </li>
                <li>
                  <strong>Layering:</strong> He placed multiple large sell orders at different price levels above the
                  market price, creating the illusion of significant selling pressure.
                </li>
                <li>
                  <strong>Market Impact:</strong> This spoofing activity contributed to market instability and
                  potentially triggered algorithmic trading responses that exacerbated the crash.
                </li>
                <li>
                  <strong>Profit:</strong> During the market turmoil, Sarao was able to buy at artificially depressed
                  prices and sell when prices recovered.
                </li>
              </ol>

              <h3 className="text-lg font-semibold">Consequences</h3>
              <p>
                In 2016, Sarao pleaded guilty to spoofing and wire fraud. He was sentenced to one year of home
                incarceration and agreed to forfeit $12.8 million in illegal profits. The Flash Crash led to significant
                regulatory changes, including the implementation of circuit breakers and enhanced market surveillance
                systems.
              </p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}


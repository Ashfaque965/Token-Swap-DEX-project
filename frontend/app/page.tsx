import { SwapInterface } from '@/components/SwapInterface'
import { LiquidityInterface } from '@/components/LiquidityInterface'
import { PoolStats } from '@/components/PoolStats'

export default function Home() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-white mb-4">
          Token Swap DEX
        </h1>
        <p className="text-xl text-gray-300">
          Trade tokens instantly with low fees
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <SwapInterface />
        <LiquidityInterface />
      </div>

      <PoolStats />
    </div>
  )
}

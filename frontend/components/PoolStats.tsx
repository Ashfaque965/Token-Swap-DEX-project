'use client'

import { useReadContract } from 'wagmi'
import { formatUnits } from 'viem'
import { DEX_CONTRACT_ADDRESS, DEX_ABI } from '@/lib/contracts'

export function PoolStats() {
  const { data: poolCount } = useReadContract({
    address: DEX_CONTRACT_ADDRESS,
    abi: DEX_ABI,
    functionName: 'getPoolCount',
  })

  return (
    <div className="card p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Pool Statistics</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-xl p-6 border border-purple-500/30">
          <p className="text-sm text-gray-400 mb-2">Total Pools</p>
          <p className="text-3xl font-bold text-white">
            {poolCount ? poolCount.toString() : '0'}
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 rounded-xl p-6 border border-green-500/30">
          <p className="text-sm text-gray-400 mb-2">Total Value Locked</p>
          <p className="text-3xl font-bold text-white">$0.00</p>
          <p className="text-sm text-gray-400 mt-1">Coming Soon</p>
        </div>

        <div className="bg-gradient-to-br from-orange-600/20 to-red-600/20 rounded-xl p-6 border border-orange-500/30">
          <p className="text-sm text-gray-400 mb-2">24h Volume</p>
          <p className="text-3xl font-bold text-white">$0.00</p>
          <p className="text-sm text-gray-400 mt-1">Coming Soon</p>
        </div>
      </div>

      <div className="mt-6 bg-gray-900/50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Top Pools</h3>
        <div className="space-y-3">
          {poolCount && Number(poolCount) > 0 ? (
            <p className="text-gray-400 text-center py-4">
              Pool details coming soon...
            </p>
          ) : (
            <p className="text-gray-400 text-center py-4">
              No pools created yet. Create the first pool!
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

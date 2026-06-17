'use client'

import { useState } from 'react'
import { useAccount, useWriteContract, useReadContract } from 'wagmi'
import { parseUnits, formatUnits } from 'viem'
import toast from 'react-hot-toast'
import { FaExchangeAlt } from 'react-icons/fa'
import { TokenSelect } from './TokenSelect'
import { DEX_CONTRACT_ADDRESS, DEX_ABI, ERC20_ABI } from '@/lib/contracts'

export function SwapInterface() {
  const { address } = useAccount()
  const [tokenIn, setTokenIn] = useState('')
  const [tokenOut, setTokenOut] = useState('')
  const [amountIn, setAmountIn] = useState('')
  const [amountOut, setAmountOut] = useState('')
  const [slippage, setSlippage] = useState('0.5')

  const { writeContract } = useWriteContract()

  // Get estimated output amount
  const { data: estimatedOut } = useReadContract({
    address: DEX_CONTRACT_ADDRESS,
    abi: DEX_ABI,
    functionName: 'getAmountOut',
    args: tokenIn && tokenOut && amountIn 
      ? [tokenIn, tokenOut, parseUnits(amountIn, 18)]
      : undefined,
  })

  const handleSwap = async () => {
    if (!address || !tokenIn || !tokenOut || !amountIn) {
      toast.error('Please fill all fields')
      return
    }

    try {
      const amount = parseUnits(amountIn, 18)
      const minOut = estimatedOut 
        ? (estimatedOut * BigInt(Math.floor((100 - parseFloat(slippage)) * 100))) / BigInt(10000)
        : BigInt(0)

      // First approve token
      const approveHash = await writeContract({
        address: tokenIn as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [DEX_CONTRACT_ADDRESS, amount],
      })

      toast.success('Approval confirmed! Now swapping...')

      // Then swap
      const swapHash = await writeContract({
        address: DEX_CONTRACT_ADDRESS,
        abi: DEX_ABI,
        functionName: 'swap',
        args: [tokenIn, tokenOut, amount, minOut],
      })

      toast.success('Swap successful!')
      setAmountIn('')
      setAmountOut('')
    } catch (error: any) {
      toast.error(error.message || 'Swap failed')
      console.error(error)
    }
  }

  const switchTokens = () => {
    setTokenIn(tokenOut)
    setTokenOut(tokenIn)
    setAmountIn(amountOut)
    setAmountOut(amountIn)
  }

  return (
    <div className="card p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Swap Tokens</h2>

      <div className="space-y-4">
        {/* From */}
        <div className="space-y-2">
          <label className="text-sm text-gray-400">From</label>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="0.0"
              value={amountIn}
              onChange={(e) => setAmountIn(e.target.value)}
              className="input-field flex-1"
            />
            <TokenSelect
              value={tokenIn}
              onChange={setTokenIn}
              exclude={tokenOut}
            />
          </div>
        </div>

        {/* Switch Button */}
        <div className="flex justify-center">
          <button
            onClick={switchTokens}
            className="bg-gray-700 hover:bg-gray-600 p-3 rounded-full transition-colors"
          >
            <FaExchangeAlt className="text-white text-xl" />
          </button>
        </div>

        {/* To */}
        <div className="space-y-2">
          <label className="text-sm text-gray-400">To (estimated)</label>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="0.0"
              value={estimatedOut ? formatUnits(estimatedOut, 18) : ''}
              readOnly
              className="input-field flex-1 bg-gray-900/30"
            />
            <TokenSelect
              value={tokenOut}
              onChange={setTokenOut}
              exclude={tokenIn}
            />
          </div>
        </div>

        {/* Slippage */}
        <div className="space-y-2">
          <label className="text-sm text-gray-400">Slippage Tolerance (%)</label>
          <div className="flex gap-2">
            {['0.1', '0.5', '1.0'].map((value) => (
              <button
                key={value}
                onClick={() => setSlippage(value)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  slippage === value
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {value}%
              </button>
            ))}
            <input
              type="number"
              value={slippage}
              onChange={(e) => setSlippage(e.target.value)}
              className="input-field w-24"
              step="0.1"
              min="0"
              max="50"
            />
          </div>
        </div>

        {/* Swap Button */}
        <button
          onClick={handleSwap}
          disabled={!address || !tokenIn || !tokenOut || !amountIn}
          className="btn-primary w-full"
        >
          {address ? 'Swap Tokens' : 'Connect Wallet'}
        </button>

        {/* Info */}
        {estimatedOut && (
          <div className="bg-gray-900/50 rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between text-gray-400">
              <span>Expected Output:</span>
              <span className="text-white font-medium">
                {formatUnits(estimatedOut, 18)} tokens
              </span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Minimum Received:</span>
              <span className="text-white font-medium">
                {formatUnits(
                  (estimatedOut * BigInt(Math.floor((100 - parseFloat(slippage)) * 100))) / BigInt(10000),
                  18
                )} tokens
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

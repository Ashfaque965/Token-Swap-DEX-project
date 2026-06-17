'use client'

import { useState } from 'react'
import { useAccount, useWriteContract, useReadContract } from 'wagmi'
import { parseUnits, formatUnits } from 'viem'
import toast from 'react-hot-toast'
import { FaPlus, FaMinus } from 'react-icons/fa'
import { TokenSelect } from './TokenSelect'
import { DEX_CONTRACT_ADDRESS, DEX_ABI, ERC20_ABI } from '@/lib/contracts'

export function LiquidityInterface() {
  const { address } = useAccount()
  const [isAdding, setIsAdding] = useState(true)
  const [tokenA, setTokenA] = useState('')
  const [tokenB, setTokenB] = useState('')
  const [amountA, setAmountA] = useState('')
  const [amountB, setAmountB] = useState('')
  const [liquidityAmount, setLiquidityAmount] = useState('')

  const { writeContract } = useWriteContract()

  // Get user's liquidity balance
  const { data: userLiquidity } = useReadContract({
    address: DEX_CONTRACT_ADDRESS,
    abi: DEX_ABI,
    functionName: 'getUserLiquidity',
    args: tokenA && tokenB && address ? [tokenA, tokenB, address] : undefined,
  })

  // Get reserves
  const { data: reserves } = useReadContract({
    address: DEX_CONTRACT_ADDRESS,
    abi: DEX_ABI,
    functionName: 'getReserves',
    args: tokenA && tokenB ? [tokenA, tokenB] : undefined,
  })

  const handleAddLiquidity = async () => {
    if (!address || !tokenA || !tokenB || !amountA || !amountB) {
      toast.error('Please fill all fields')
      return
    }

    try {
      const amtA = parseUnits(amountA, 18)
      const amtB = parseUnits(amountB, 18)

      // Approve both tokens
      await writeContract({
        address: tokenA as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [DEX_CONTRACT_ADDRESS, amtA],
      })

      await writeContract({
        address: tokenB as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [DEX_CONTRACT_ADDRESS, amtB],
      })

      toast.success('Tokens approved! Adding liquidity...')

      // Add liquidity
      await writeContract({
        address: DEX_CONTRACT_ADDRESS,
        abi: DEX_ABI,
        functionName: 'addLiquidity',
        args: [
          tokenA,
          tokenB,
          amtA,
          amtB,
          (amtA * BigInt(95)) / BigInt(100), // 5% slippage
          (amtB * BigInt(95)) / BigInt(100),
        ],
      })

      toast.success('Liquidity added successfully!')
      setAmountA('')
      setAmountB('')
    } catch (error: any) {
      toast.error(error.message || 'Failed to add liquidity')
      console.error(error)
    }
  }

  const handleRemoveLiquidity = async () => {
    if (!address || !tokenA || !tokenB || !liquidityAmount) {
      toast.error('Please fill all fields')
      return
    }

    try {
      const liquidity = parseUnits(liquidityAmount, 18)

      await writeContract({
        address: DEX_CONTRACT_ADDRESS,
        abi: DEX_ABI,
        functionName: 'removeLiquidity',
        args: [tokenA, tokenB, liquidity, BigInt(0), BigInt(0)],
      })

      toast.success('Liquidity removed successfully!')
      setLiquidityAmount('')
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove liquidity')
      console.error(error)
    }
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Liquidity</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setIsAdding(true)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              isAdding
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <FaPlus className="inline mr-2" />
            Add
          </button>
          <button
            onClick={() => setIsAdding(false)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              !isAdding
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <FaMinus className="inline mr-2" />
            Remove
          </button>
        </div>
      </div>

      {isAdding ? (
        <div className="space-y-4">
          {/* Token A */}
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Token A</label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="0.0"
                value={amountA}
                onChange={(e) => setAmountA(e.target.value)}
                className="input-field flex-1"
              />
              <TokenSelect
                value={tokenA}
                onChange={setTokenA}
                exclude={tokenB}
              />
            </div>
          </div>

          {/* Token B */}
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Token B</label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="0.0"
                value={amountB}
                onChange={(e) => setAmountB(e.target.value)}
                className="input-field flex-1"
              />
              <TokenSelect
                value={tokenB}
                onChange={setTokenB}
                exclude={tokenA}
              />
            </div>
          </div>

          {/* Pool Info */}
          {reserves && (
            <div className="bg-gray-900/50 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-400">
                <span>Reserve A:</span>
                <span className="text-white font-medium">
                  {formatUnits(reserves[0], 18)}
                </span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Reserve B:</span>
                <span className="text-white font-medium">
                  {formatUnits(reserves[1], 18)}
                </span>
              </div>
            </div>
          )}

          <button
            onClick={handleAddLiquidity}
            disabled={!address || !tokenA || !tokenB || !amountA || !amountB}
            className="btn-primary w-full"
          >
            {address ? 'Add Liquidity' : 'Connect Wallet'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Token Pair */}
          <div className="flex gap-2">
            <TokenSelect
              value={tokenA}
              onChange={setTokenA}
              exclude={tokenB}
            />
            <TokenSelect
              value={tokenB}
              onChange={setTokenB}
              exclude={tokenA}
            />
          </div>

          {/* Your Liquidity */}
          {userLiquidity && (
            <div className="bg-gray-900/50 rounded-xl p-4">
              <p className="text-sm text-gray-400 mb-2">Your Liquidity</p>
              <p className="text-2xl font-bold text-white">
                {formatUnits(userLiquidity, 18)}
              </p>
            </div>
          )}

          {/* Amount to Remove */}
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Amount to Remove</label>
            <input
              type="number"
              placeholder="0.0"
              value={liquidityAmount}
              onChange={(e) => setLiquidityAmount(e.target.value)}
              className="input-field"
            />
            {userLiquidity && (
              <button
                onClick={() => setLiquidityAmount(formatUnits(userLiquidity, 18))}
                className="text-sm text-purple-400 hover:text-purple-300"
              >
                Max
              </button>
            )}
          </div>

          <button
            onClick={handleRemoveLiquidity}
            disabled={!address || !tokenA || !tokenB || !liquidityAmount}
            className="btn-primary w-full"
          >
            {address ? 'Remove Liquidity' : 'Connect Wallet'}
          </button>
        </div>
      )}
    </div>
  )
}

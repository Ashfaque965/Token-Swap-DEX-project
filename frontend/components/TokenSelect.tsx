'use client'

import { useState } from 'react'

interface Token {
  address: string
  symbol: string
  name: string
}

// Sample tokens - replace with your actual token addresses
const TOKENS: Token[] = [
  { address: '0x...', symbol: 'USDT', name: 'Tether USD' },
  { address: '0x...', symbol: 'USDC', name: 'USD Coin' },
  { address: '0x...', symbol: 'DAI', name: 'Dai Stablecoin' },
  { address: '0x...', symbol: 'WETH', name: 'Wrapped Ether' },
  { address: '0x...', symbol: 'WBTC', name: 'Wrapped Bitcoin' },
]

interface TokenSelectProps {
  value: string
  onChange: (address: string) => void
  exclude?: string
}

export function TokenSelect({ value, onChange, exclude }: TokenSelectProps) {
  const [isOpen, setIsOpen] = useState(false)

  const filteredTokens = TOKENS.filter((token) => token.address !== exclude)
  const selectedToken = TOKENS.find((token) => token.address === value)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-4 py-3 rounded-xl transition-colors min-w-[140px]"
      >
        {selectedToken ? (
          <>
            <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full" />
            <span className="font-medium text-white">{selectedToken.symbol}</span>
          </>
        ) : (
          <span className="text-gray-400">Select Token</span>
        )}
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-64 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl z-20 max-h-80 overflow-y-auto">
            <div className="p-2">
              {filteredTokens.map((token) => (
                <button
                  key={token.address}
                  onClick={() => {
                    onChange(token.address)
                    setIsOpen(false)
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full" />
                  <div className="text-left">
                    <div className="font-medium text-white">{token.symbol}</div>
                    <div className="text-xs text-gray-400">{token.name}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

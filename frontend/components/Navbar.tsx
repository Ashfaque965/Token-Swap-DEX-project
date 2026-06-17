'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import Link from 'next/link'

export function Navbar() {
  return (
    <nav className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg" />
            <span className="text-xl font-bold text-white">Token Swap DEX</span>
          </Link>

          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Swap
            </Link>
            <Link
              href="/pools"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Pools
            </Link>
            <Link
              href="/analytics"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Analytics
            </Link>
            <ConnectButton />
          </div>
        </div>
      </div>
    </nav>
  )
}

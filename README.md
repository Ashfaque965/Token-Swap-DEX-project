# Token Swap DEX 🚀

A full-stack decentralized exchange (DEX) for token swaps built with Solidity smart contracts and Next.js frontend.

## 🌟 Features

- **Token Swaps**: Instant token exchanges using Automated Market Maker (AMM) algorithm
- **Liquidity Pools**: Add/remove liquidity and earn trading fees
- **Multi-hop Swaps**: Route through multiple pools for better rates
- **Low Fees**: Configurable trading fees (default 0.3%)
- **Modern UI**: Beautiful, responsive interface built with Next.js and TailwindCSS
- **Wallet Integration**: Connect with MetaMask, WalletConnect, and more via RainbowKit
- **Real-time Updates**: Live pool statistics and transaction tracking

## 📁 Project Structure

```
Token Swap (DEX) project/
├── contracts/              # Smart contracts
│   ├── TokenSwapDEX.sol   # Main DEX contract with AMM logic
│   ├── DEXRouter.sol      # Router for multi-hop swaps
│   └── TestToken.sol      # ERC20 test token
├── scripts/               # Deployment scripts
│   └── deploy.js         # Deploy all contracts
├── test/                 # Contract tests
│   └── TokenSwapDEX.test.js
├── frontend/             # Next.js frontend
│   ├── app/             # Next.js app directory
│   ├── components/      # React components
│   └── lib/            # Contract ABIs and utilities
├── hardhat.config.js    # Hardhat configuration
└── package.json        # Project dependencies
```

## 🛠️ Technology Stack

### Smart Contracts
- **Solidity 0.8.20**: Smart contract language
- **OpenZeppelin**: Secure contract libraries
- **Hardhat**: Development environment
- **Ethers.js v6**: Ethereum library

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe JavaScript
- **TailwindCSS**: Utility-first CSS
- **RainbowKit**: Wallet connection
- **Wagmi**: React hooks for Ethereum
- **Viem**: TypeScript Ethereum library

## 🚀 Getting Started

### Prerequisites

- Node.js v18+ and npm
- MetaMask or another Web3 wallet

### Installation

1. **Clone and install dependencies:**

```bash
cd "Token Swap (DEX) project"
npm install
```

2. **Install frontend dependencies:**

```bash
cd frontend
npm install
cd ..
```

3. **Configure environment:**

```bash
cp .env.example .env
```

Edit `.env` and add your private key and RPC URLs (for testnet/mainnet deployment).

### 🧪 Local Development

#### 1. Start Hardhat Node

```bash
npm run node
```

This starts a local Ethereum network at `http://127.0.0.1:8545`

#### 2. Deploy Contracts (in a new terminal)

```bash
npm run deploy
```

This will:
- Deploy TokenSwapDEX contract
- Deploy DEXRouter contract
- Deploy 3 test tokens (TKA, TKB, TKC)
- Create initial liquidity pools
- Save addresses to `deployment-info.json`
- Auto-update frontend contract addresses

#### 3. Start Frontend (in a new terminal)

```bash
cd frontend
npm run dev
```

Visit `http://localhost:3000` to see the app.

#### 4. Connect Wallet

1. Open MetaMask
2. Add Hardhat network:
   - Network Name: Hardhat Local
   - RPC URL: http://127.0.0.1:8545
   - Chain ID: 31337
   - Currency: ETH
3. Import one of the Hardhat test accounts using the private key
4. Click "Connect Wallet" in the app

## 📝 Smart Contract Overview

### TokenSwapDEX.sol

Main DEX contract implementing AMM (Automated Market Maker):

**Key Functions:**
- `createPool(tokenA, tokenB, feePercent)`: Create new liquidity pool
- `addLiquidity(...)`: Add tokens to pool and receive liquidity tokens
- `removeLiquidity(...)`: Burn liquidity tokens and receive underlying assets
- `swap(tokenIn, tokenOut, amountIn, amountOutMin)`: Exchange tokens
- `getAmountOut(tokenIn, tokenOut, amountIn)`: Calculate swap output
- `getReserves(tokenA, tokenB)`: Get pool reserves

**Formula:** Uses constant product formula (x * y = k) for pricing

### DEXRouter.sol

Router for advanced features:

- `swapExactTokensForTokens(...)`: Multi-hop swaps through multiple pools
- `getAmountsOut(amountIn, path)`: Calculate multi-hop output
- `addLiquidityWithPermit(...)`: Add liquidity with permit signature

### TestToken.sol

ERC20 token for testing with mint/burn capabilities.

## 🧪 Testing

Run comprehensive test suite:

```bash
npm test
```

Tests cover:
- Pool creation and validation
- Liquidity addition/removal
- Token swaps and pricing
- Slippage protection
- Edge cases and security

## 📦 Deployment

### Testnet Deployment (Sepolia)

1. Get testnet ETH from [Sepolia faucet](https://sepoliafaucet.com/)
2. Configure `.env` with your private key and Sepolia RPC
3. Deploy:

```bash
npm run deploy:sepolia
```

4. Verify contracts:

```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

### Mainnet Deployment

⚠️ **Warning**: Audit your contracts before mainnet deployment!

```bash
npm run deploy:mainnet
```

## 🎨 Frontend Features

### Swap Interface
- Token selection with dropdown
- Real-time price estimation
- Slippage tolerance settings
- Transaction confirmation

### Liquidity Interface
- Add/remove liquidity
- View pool reserves
- Track your liquidity positions
- Calculate share of pool

### Pool Statistics
- Total pools count
- Total Value Locked (TVL)
- 24h trading volume
- Top performing pools

## 🔧 Configuration

### Adjust Trading Fee

Edit in [deploy.js](scripts/deploy.js):

```javascript
const feePercent = 30; // 30 = 0.3%
```

### Add More Tokens

Update [TokenSelect.tsx](frontend/components/TokenSelect.tsx):

```typescript
const TOKENS: Token[] = [
  { address: '0x...', symbol: 'TOKEN', name: 'Token Name' },
  // Add more...
]
```

## 🔒 Security Considerations

- ✅ ReentrancyGuard on all state-changing functions
- ✅ SafeERC20 for token transfers
- ✅ Slippage protection on swaps
- ✅ Ownership controls on pool creation
- ✅ Input validation and error handling
- ⚠️ **Audit recommended before production use**

## 📚 Additional Resources

- [Hardhat Documentation](https://hardhat.org/docs)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts)
- [Next.js Documentation](https://nextjs.org/docs)
- [Wagmi Documentation](https://wagmi.sh)
- [RainbowKit Documentation](https://www.rainbowkit.com/docs)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🐛 Troubleshooting

### Common Issues

**"Insufficient liquidity" error:**
- Pool needs initial liquidity before swaps
- Add liquidity first using Liquidity Interface

**Transaction fails:**
- Check token approvals
- Increase slippage tolerance
- Ensure sufficient gas

**Frontend not connecting:**
- Verify Hardhat node is running
- Check MetaMask network matches (Chain ID: 31337)
- Clear browser cache and reload

**Deployment fails:**
- Ensure sufficient ETH balance
- Check RPC URL in `.env`
- Verify private key format (no 0x prefix)

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Check existing issues for solutions

## 🎉 Acknowledgments

Built with:
- Uniswap V2 AMM design inspiration
- OpenZeppelin secure contract libraries
- Hardhat development framework
- Next.js and Vercel ecosystem

---

**Happy Trading! 🚀📈**

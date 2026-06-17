# Development Guide

## Architecture Overview

### Smart Contract Architecture

```
┌─────────────────────────────────────┐
│         User Interface              │
│      (Next.js Frontend)             │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│        DEXRouter.sol                │
│   (Multi-hop swaps, helpers)        │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│      TokenSwapDEX.sol               │
│   (Core AMM logic, pools)           │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│       ERC20 Tokens                  │
│   (TestToken.sol or any ERC20)      │
└─────────────────────────────────────┘
```

### AMM Algorithm

The DEX uses the **Constant Product Formula**:

```
x * y = k

Where:
- x = Reserve of Token A
- y = Reserve of Token B
- k = Constant product (must remain constant)
```

#### Price Calculation

```javascript
amountOut = (amountIn * (10000 - fee) * reserveOut) / 
            ((reserveIn * 10000) + (amountIn * (10000 - fee)))
```

#### Example:
```
Pool: 1000 TKA / 2000 TKB (k = 2,000,000)
Fee: 0.3% (30 basis points)

Swap 10 TKA for TKB:
- amountIn = 10
- reserveIn = 1000
- reserveOut = 2000
- fee = 30 (0.3%)

amountOut = (10 * 9970 * 2000) / ((1000 * 10000) + (10 * 9970))
         ≈ 19.88 TKB
```

## Development Workflow

### 1. Contract Development

```bash
# Compile contracts
npm run compile

# Run tests
npm test

# Generate coverage report
npx hardhat coverage

# Gas reporting
REPORT_GAS=true npm test
```

### 2. Local Testing

```bash
# Terminal 1: Start local node
npm run node

# Terminal 2: Deploy contracts
npm run deploy

# Terminal 3: Run frontend
cd frontend && npm run dev
```

### 3. Frontend Development

```bash
cd frontend

# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Key Components

### Smart Contracts

#### Pool Structure
```solidity
struct Pool {
    address tokenA;
    address tokenB;
    uint256 reserveA;
    uint256 reserveB;
    uint256 totalLiquidity;
    mapping(address => uint256) liquidityBalance;
    uint256 feePercent;
    bool exists;
}
```

#### Adding Liquidity

When adding liquidity:
1. Calculate optimal amounts based on current ratio
2. Transfer tokens from user
3. Mint liquidity tokens proportional to contribution
4. Update reserves

```solidity
if (pool.totalLiquidity == 0) {
    // First liquidity provider
    liquidity = sqrt(amountA * amountB);
} else {
    // Subsequent providers
    liquidity = min(
        (amountA * totalLiquidity) / reserveA,
        (amountB * totalLiquidity) / reserveB
    );
}
```

#### Token Swap

Process:
1. Validate pool exists and amounts
2. Calculate output with fee
3. Check slippage tolerance
4. Transfer input tokens
5. Update reserves
6. Transfer output tokens

### Frontend Components

#### SwapInterface.tsx
- Token input/output fields
- Token selection dropdowns
- Slippage settings
- Real-time price estimation
- Transaction execution

#### LiquidityInterface.tsx
- Add/remove liquidity tabs
- Pool reserves display
- User position tracking
- Proportional calculations

#### TokenSelect.tsx
- Token dropdown component
- Token search/filter
- Custom token support

## Testing Guide

### Unit Tests

```javascript
describe("TokenSwapDEX", function () {
  // Pool creation tests
  it("Should create a new pool")
  it("Should not allow duplicate pools")
  
  // Liquidity tests
  it("Should add initial liquidity")
  it("Should add proportional liquidity")
  it("Should remove liquidity")
  
  // Swap tests
  it("Should swap tokens")
  it("Should calculate correct output")
  it("Should respect slippage protection")
});
```

### Integration Tests

Test complete workflows:
1. Deploy contracts
2. Create pool
3. Add liquidity
4. Perform swaps
5. Remove liquidity
6. Verify balances

## Deployment Checklist

### Pre-Deployment

- [ ] All tests passing
- [ ] Security audit completed
- [ ] Gas optimization reviewed
- [ ] Contract documentation complete
- [ ] Frontend tested on testnet

### Deployment Steps

1. **Prepare Environment**
   ```bash
   cp .env.example .env
   # Fill in PRIVATE_KEY, RPC_URL, etc.
   ```

2. **Deploy to Testnet**
   ```bash
   npm run deploy:sepolia
   ```

3. **Verify Contracts**
   ```bash
   npx hardhat verify --network sepolia <ADDRESS>
   ```

4. **Test on Testnet**
   - Perform test swaps
   - Add/remove liquidity
   - Check all features

5. **Deploy Frontend**
   ```bash
   cd frontend
   npm run build
   # Deploy to Vercel, Netlify, etc.
   ```

### Post-Deployment

- [ ] Verify contract on Etherscan
- [ ] Update frontend contract addresses
- [ ] Create initial pools
- [ ] Add initial liquidity
- [ ] Monitor transactions
- [ ] Set up analytics

## Security Best Practices

### Smart Contract Security

1. **Reentrancy Protection**
   - Use `nonReentrant` modifier
   - Follow checks-effects-interactions pattern

2. **Access Control**
   - Restrict sensitive functions
   - Use `onlyOwner` when appropriate

3. **Input Validation**
   - Check for zero addresses
   - Validate amounts and parameters
   - Verify pool existence

4. **Safe Math**
   - Solidity 0.8+ has built-in overflow checks
   - Use SafeERC20 for token transfers

5. **Testing**
   - 100% code coverage
   - Fuzz testing
   - Integration tests

### Frontend Security

1. **Transaction Safety**
   - Always verify contract addresses
   - Display transaction details before signing
   - Implement slippage protection

2. **User Input**
   - Sanitize all inputs
   - Validate addresses
   - Check amounts

3. **Error Handling**
   - Catch and display errors properly
   - Don't expose sensitive information
   - Provide helpful messages

## Gas Optimization

### Contract Optimizations

1. **Storage**
   - Use `uint256` instead of smaller types
   - Pack variables efficiently
   - Use memory for temporary data

2. **Loops**
   - Avoid unbounded loops
   - Cache array lengths
   - Use `unchecked` for safe operations

3. **Function Visibility**
   - Use `external` instead of `public` when possible
   - Mark view/pure functions appropriately

### Transaction Optimization

- Batch operations when possible
- Approve tokens once for maximum amount
- Use multicall for multiple operations

## Monitoring & Analytics

### On-Chain Monitoring

Track:
- Total Value Locked (TVL)
- Trading volume
- Number of swaps
- Pool reserves
- Fee collection

### Events to Monitor

```solidity
event PoolCreated(bytes32 indexed poolId, ...);
event LiquidityAdded(bytes32 indexed poolId, ...);
event LiquidityRemoved(bytes32 indexed poolId, ...);
event TokensSwapped(bytes32 indexed poolId, ...);
```

### Tools

- Etherscan for transaction history
- The Graph for indexing events
- Dune Analytics for dashboards
- Tenderly for debugging

## Future Enhancements

### Planned Features

1. **Concentrated Liquidity**
   - Uniswap V3 style ranges
   - Better capital efficiency

2. **Governance Token**
   - DAO for protocol decisions
   - Fee distribution
   - Voting mechanism

3. **Farming Rewards**
   - Liquidity mining
   - Staking rewards
   - Incentive programs

4. **Advanced Orders**
   - Limit orders
   - Stop-loss orders
   - TWAP execution

5. **Multi-Chain Support**
   - Bridge integration
   - Cross-chain swaps
   - Multiple networks

## FAQ

**Q: Why use constant product formula?**
A: It's simple, gas-efficient, and always provides liquidity at any price.

**Q: How are fees distributed?**
A: Fees are added to pool reserves, benefiting all liquidity providers proportionally.

**Q: Can pools be destroyed?**
A: No, pools are permanent once created. Only liquidity can be removed.

**Q: What happens to fees?**
A: Fees remain in the pool, increasing the value of liquidity positions.

## Resources

- [Uniswap V2 Whitepaper](https://uniswap.org/whitepaper.pdf)
- [AMM Basics](https://www.paradigm.xyz/2021/04/understanding-automated-market-makers-part-1-price-impact)
- [Solidity Best Practices](https://consensys.github.io/smart-contract-best-practices/)
- [DeFi Security](https://github.com/OffcierCia/DeFi-Developer-Road-Map)

## Support

For development questions:
1. Check this documentation
2. Review test files for examples
3. Open an issue on GitHub
4. Join community discussions

---

Happy Building! 🛠️

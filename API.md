# API Documentation

## Smart Contract API

### TokenSwapDEX Contract

#### Read Functions

##### getPoolId
```solidity
function getPoolId(address tokenA, address tokenB) public pure returns (bytes32)
```
Get unique identifier for a token pair pool.

**Parameters:**
- `tokenA`: Address of first token
- `tokenB`: Address of second token

**Returns:**
- `bytes32`: Unique pool identifier

**Example:**
```javascript
const poolId = await dex.getPoolId(tokenA, tokenB);
```

---

##### getReserves
```solidity
function getReserves(address tokenA, address tokenB) 
    external view returns (uint256 reserveA, uint256 reserveB)
```
Get current reserves for a token pair.

**Parameters:**
- `tokenA`: Address of first token
- `tokenB`: Address of second token

**Returns:**
- `reserveA`: Reserve amount of tokenA
- `reserveB`: Reserve amount of tokenB

**Example:**
```javascript
const [reserveA, reserveB] = await dex.getReserves(tokenA, tokenB);
console.log(`Pool: ${formatEther(reserveA)} / ${formatEther(reserveB)}`);
```

---

##### getAmountOut
```solidity
function getAmountOut(
    address tokenIn,
    address tokenOut,
    uint256 amountIn
) public view returns (uint256)
```
Calculate output amount for a swap.

**Parameters:**
- `tokenIn`: Address of input token
- `tokenOut`: Address of output token
- `amountIn`: Amount of input tokens

**Returns:**
- `uint256`: Expected output amount (after fees)

**Formula:**
```
amountOut = (amountIn * (10000 - fee) * reserveOut) / 
            ((reserveIn * 10000) + (amountIn * (10000 - fee)))
```

**Example:**
```javascript
const amountIn = parseEther("10");
const amountOut = await dex.getAmountOut(tokenA, tokenB, amountIn);
console.log(`Output: ${formatEther(amountOut)}`);
```

---

##### getUserLiquidity
```solidity
function getUserLiquidity(
    address tokenA,
    address tokenB,
    address user
) external view returns (uint256)
```
Get user's liquidity balance for a pool.

**Parameters:**
- `tokenA`: Address of first token
- `tokenB`: Address of second token
- `user`: Address of user

**Returns:**
- `uint256`: User's liquidity tokens

**Example:**
```javascript
const liquidity = await dex.getUserLiquidity(tokenA, tokenB, userAddress);
console.log(`Your liquidity: ${formatEther(liquidity)}`);
```

---

##### getPoolCount
```solidity
function getPoolCount() external view returns (uint256)
```
Get total number of pools.

**Returns:**
- `uint256`: Number of pools created

**Example:**
```javascript
const count = await dex.getPoolCount();
console.log(`Total pools: ${count}`);
```

---

#### Write Functions

##### createPool
```solidity
function createPool(
    address tokenA,
    address tokenB,
    uint256 feePercent
) external onlyOwner returns (bytes32)
```
Create a new liquidity pool (owner only).

**Parameters:**
- `tokenA`: Address of first token
- `tokenB`: Address of second token
- `feePercent`: Trading fee in basis points (30 = 0.3%)

**Returns:**
- `bytes32`: Pool identifier

**Requirements:**
- Only contract owner can call
- Tokens must be different
- No zero addresses
- Fee <= 1000 (10%)
- Pool must not exist

**Events:**
- `PoolCreated(poolId, tokenA, tokenB, feePercent)`

**Example:**
```javascript
const tx = await dex.createPool(tokenA, tokenB, 30); // 0.3% fee
await tx.wait();
console.log("Pool created!");
```

---

##### addLiquidity
```solidity
function addLiquidity(
    address tokenA,
    address tokenB,
    uint256 amountADesired,
    uint256 amountBDesired,
    uint256 amountAMin,
    uint256 amountBMin
) external nonReentrant returns (
    uint256 amountA,
    uint256 amountB,
    uint256 liquidity
)
```
Add liquidity to a pool.

**Parameters:**
- `tokenA`: Address of first token
- `tokenB`: Address of second token
- `amountADesired`: Desired amount of tokenA
- `amountBDesired`: Desired amount of tokenB
- `amountAMin`: Minimum amount of tokenA (slippage protection)
- `amountBMin`: Minimum amount of tokenB (slippage protection)

**Returns:**
- `amountA`: Actual amount of tokenA added
- `amountB`: Actual amount of tokenB added
- `liquidity`: Liquidity tokens minted

**Requirements:**
- Pool must exist
- Must approve tokens first
- Amounts must meet minimums

**Events:**
- `LiquidityAdded(poolId, provider, amountA, amountB, liquidity)`

**Example:**
```javascript
// 1. Approve tokens
await tokenA.approve(dexAddress, amountA);
await tokenB.approve(dexAddress, amountB);

// 2. Add liquidity
const tx = await dex.addLiquidity(
    tokenA,
    tokenB,
    parseEther("100"),  // amountADesired
    parseEther("200"),  // amountBDesired
    parseEther("95"),   // amountAMin (5% slippage)
    parseEther("190")   // amountBMin (5% slippage)
);
const receipt = await tx.wait();
console.log("Liquidity added!");
```

---

##### removeLiquidity
```solidity
function removeLiquidity(
    address tokenA,
    address tokenB,
    uint256 liquidity,
    uint256 amountAMin,
    uint256 amountBMin
) external nonReentrant returns (
    uint256 amountA,
    uint256 amountB
)
```
Remove liquidity from a pool.

**Parameters:**
- `tokenA`: Address of first token
- `tokenB`: Address of second token
- `liquidity`: Amount of liquidity tokens to burn
- `amountAMin`: Minimum tokenA to receive
- `amountBMin`: Minimum tokenB to receive

**Returns:**
- `amountA`: Amount of tokenA received
- `amountB`: Amount of tokenB received

**Requirements:**
- User must have sufficient liquidity
- Amounts must meet minimums

**Events:**
- `LiquidityRemoved(poolId, provider, amountA, amountB, liquidity)`

**Example:**
```javascript
const userLiquidity = await dex.getUserLiquidity(tokenA, tokenB, address);

const tx = await dex.removeLiquidity(
    tokenA,
    tokenB,
    userLiquidity / 2n,  // Remove 50%
    0,                   // No minimum (not recommended)
    0
);
const receipt = await tx.wait();
console.log("Liquidity removed!");
```

---

##### swap
```solidity
function swap(
    address tokenIn,
    address tokenOut,
    uint256 amountIn,
    uint256 amountOutMin
) external nonReentrant returns (uint256 amountOut)
```
Swap tokens.

**Parameters:**
- `tokenIn`: Address of input token
- `tokenOut`: Address of output token
- `amountIn`: Amount of input tokens
- `amountOutMin`: Minimum output (slippage protection)

**Returns:**
- `amountOut`: Actual output amount

**Requirements:**
- Pool must exist
- Must approve input token first
- Output must meet minimum

**Events:**
- `TokensSwapped(poolId, trader, tokenIn, tokenOut, amountIn, amountOut)`

**Example:**
```javascript
// 1. Get expected output
const expectedOut = await dex.getAmountOut(tokenA, tokenB, amountIn);

// 2. Calculate minimum with slippage
const slippage = 0.5; // 0.5%
const minOut = expectedOut * BigInt(Math.floor((100 - slippage) * 100)) / 10000n;

// 3. Approve and swap
await tokenA.approve(dexAddress, amountIn);
const tx = await dex.swap(tokenA, tokenB, amountIn, minOut);
await tx.wait();
console.log("Swap successful!");
```

---

### Events

#### PoolCreated
```solidity
event PoolCreated(
    bytes32 indexed poolId,
    address indexed tokenA,
    address indexed tokenB,
    uint256 feePercent
)
```

#### LiquidityAdded
```solidity
event LiquidityAdded(
    bytes32 indexed poolId,
    address indexed provider,
    uint256 amountA,
    uint256 amountB,
    uint256 liquidity
)
```

#### LiquidityRemoved
```solidity
event LiquidityRemoved(
    bytes32 indexed poolId,
    address indexed provider,
    uint256 amountA,
    uint256 amountB,
    uint256 liquidity
)
```

#### TokensSwapped
```solidity
event TokensSwapped(
    bytes32 indexed poolId,
    address indexed trader,
    address tokenIn,
    address tokenOut,
    uint256 amountIn,
    uint256 amountOut
)
```

---

## Frontend API

### React Hooks

#### useSwap
```typescript
const { swap, isLoading, error } = useSwap();

await swap({
  tokenIn: '0x...',
  tokenOut: '0x...',
  amountIn: parseEther('10'),
  slippage: 0.5
});
```

#### useLiquidity
```typescript
const { 
  addLiquidity, 
  removeLiquidity, 
  userLiquidity 
} = useLiquidity(tokenA, tokenB);

await addLiquidity({
  amountA: parseEther('100'),
  amountB: parseEther('200'),
  slippage: 5
});
```

#### usePoolStats
```typescript
const { 
  reserves, 
  totalLiquidity, 
  isLoading 
} = usePoolStats(tokenA, tokenB);
```

---

## Error Codes

| Error | Description | Solution |
|-------|-------------|----------|
| `Identical tokens` | TokenA == TokenB | Use different tokens |
| `Zero address` | Token address is 0x0 | Provide valid address |
| `Pool exists` | Pool already created | Use existing pool |
| `Pool doesn't exist` | Pool not found | Create pool first |
| `Insufficient liquidity` | Not enough liquidity | Add liquidity or reduce amount |
| `Insufficient output` | Output below minimum | Increase slippage or retry |
| `Fee too high` | Fee > 10% | Use lower fee |

---

## Rate Limits

No rate limits on smart contract calls, but gas costs apply:

| Operation | Estimated Gas |
|-----------|---------------|
| createPool | ~150,000 |
| addLiquidity | ~200,000 |
| removeLiquidity | ~150,000 |
| swap | ~100,000 |
| getAmountOut | 0 (view) |

---

## Code Examples

### Complete Swap Example

```javascript
import { ethers } from 'ethers';

async function performSwap() {
  // Setup
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const dex = new ethers.Contract(DEX_ADDRESS, DEX_ABI, signer);
  const tokenA = new ethers.Contract(TOKEN_A, ERC20_ABI, signer);
  
  // Parameters
  const amountIn = ethers.utils.parseEther("10");
  
  // Get expected output
  const amountOut = await dex.getAmountOut(TOKEN_A, TOKEN_B, amountIn);
  console.log(`Expected output: ${ethers.utils.formatEther(amountOut)}`);
  
  // Calculate minimum with 0.5% slippage
  const slippage = 0.5;
  const minOut = amountOut.mul(10000 - slippage * 100).div(10000);
  
  // Approve
  const approveTx = await tokenA.approve(DEX_ADDRESS, amountIn);
  await approveTx.wait();
  console.log("Token approved");
  
  // Swap
  const swapTx = await dex.swap(TOKEN_A, TOKEN_B, amountIn, minOut);
  const receipt = await swapTx.wait();
  console.log("Swap completed!", receipt.transactionHash);
}
```

### Complete Liquidity Example

```javascript
async function addLiquidityToPool() {
  const dex = new ethers.Contract(DEX_ADDRESS, DEX_ABI, signer);
  const tokenA = new ethers.Contract(TOKEN_A, ERC20_ABI, signer);
  const tokenB = new ethers.Contract(TOKEN_B, ERC20_ABI, signer);
  
  const amountA = ethers.utils.parseEther("100");
  const amountB = ethers.utils.parseEther("200");
  
  // Get current reserves for ratio
  const [reserveA, reserveB] = await dex.getReserves(TOKEN_A, TOKEN_B);
  console.log(`Current ratio: ${reserveA}:${reserveB}`);
  
  // Approve both tokens
  await tokenA.approve(DEX_ADDRESS, amountA);
  await tokenB.approve(DEX_ADDRESS, amountB);
  
  // Add liquidity with 5% slippage tolerance
  const tx = await dex.addLiquidity(
    TOKEN_A,
    TOKEN_B,
    amountA,
    amountB,
    amountA.mul(95).div(100),  // 5% slippage
    amountB.mul(95).div(100)
  );
  
  const receipt = await tx.wait();
  console.log("Liquidity added!", receipt.transactionHash);
}
```

---

For more examples, see the test files and frontend components.

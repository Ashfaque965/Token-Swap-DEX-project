const hre = require("hardhat");

async function main() {
  console.log("Deploying Token Swap DEX contracts...");

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());

  // Deploy DEX
  console.log("\n1. Deploying TokenSwapDEX...");
  const TokenSwapDEX = await hre.ethers.getContractFactory("TokenSwapDEX");
  const dex = await TokenSwapDEX.deploy();
  await dex.waitForDeployment();
  const dexAddress = await dex.getAddress();
  console.log("✅ TokenSwapDEX deployed to:", dexAddress);

  // Deploy Router
  console.log("\n2. Deploying DEXRouter...");
  const DEXRouter = await hre.ethers.getContractFactory("DEXRouter");
  const router = await DEXRouter.deploy(dexAddress);
  await router.waitForDeployment();
  const routerAddress = await router.getAddress();
  console.log("✅ DEXRouter deployed to:", routerAddress);

  // Deploy test tokens
  console.log("\n3. Deploying test tokens...");
  const TestToken = await hre.ethers.getContractFactory("TestToken");

  const tokenA = await TestToken.deploy("Token A", "TKA", 18, 1000000);
  await tokenA.waitForDeployment();
  const tokenAAddress = await tokenA.getAddress();
  console.log("✅ Token A (TKA) deployed to:", tokenAAddress);

  const tokenB = await TestToken.deploy("Token B", "TKB", 18, 1000000);
  await tokenB.waitForDeployment();
  const tokenBAddress = await tokenB.getAddress();
  console.log("✅ Token B (TKB) deployed to:", tokenBAddress);

  const tokenC = await TestToken.deploy("Token C", "TKC", 18, 1000000);
  await tokenC.waitForDeployment();
  const tokenCAddress = await tokenC.getAddress();
  console.log("✅ Token C (TKC) deployed to:", tokenCAddress);

  // Create initial pools
  console.log("\n4. Creating initial liquidity pools...");
  
  const feePercent = 30; // 0.3% fee
  
  // Create TKA/TKB pool
  const tx1 = await dex.createPool(tokenAAddress, tokenBAddress, feePercent);
  await tx1.wait();
  console.log("✅ TKA/TKB pool created");

  // Create TKB/TKC pool
  const tx2 = await dex.createPool(tokenBAddress, tokenCAddress, feePercent);
  await tx2.wait();
  console.log("✅ TKB/TKC pool created");

  // Create TKA/TKC pool
  const tx3 = await dex.createPool(tokenAAddress, tokenCAddress, feePercent);
  await tx3.wait();
  console.log("✅ TKA/TKC pool created");

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("DEPLOYMENT SUMMARY");
  console.log("=".repeat(60));
  console.log("\nContracts:");
  console.log("  DEX Address:    ", dexAddress);
  console.log("  Router Address: ", routerAddress);
  console.log("\nTest Tokens:");
  console.log("  Token A (TKA):  ", tokenAAddress);
  console.log("  Token B (TKB):  ", tokenBAddress);
  console.log("  Token C (TKC):  ", tokenCAddress);
  console.log("\n" + "=".repeat(60));

  // Save deployment info
  const fs = require("fs");
  const deploymentInfo = {
    network: hre.network.name,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      TokenSwapDEX: dexAddress,
      DEXRouter: routerAddress,
      TestTokenA: tokenAAddress,
      TestTokenB: tokenBAddress,
      TestTokenC: tokenCAddress,
    },
  };

  fs.writeFileSync(
    "deployment-info.json",
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("\n✅ Deployment info saved to deployment-info.json");

  // Update frontend contract address
  const contractsContent = `// Contract addresses - Auto-generated, do not edit manually
export const DEX_CONTRACT_ADDRESS = '${dexAddress}' as \`0x\${string}\`
export const ROUTER_CONTRACT_ADDRESS = '${routerAddress}' as \`0x\${string}\`

// Test token addresses
export const TEST_TOKENS = {
  TKA: '${tokenAAddress}' as \`0x\${string}\`,
  TKB: '${tokenBAddress}' as \`0x\${string}\`,
  TKC: '${tokenCAddress}' as \`0x\${string}\`,
}

// DEX Contract ABI
export const DEX_ABI = [
  {
    inputs: [
      { name: 'tokenA', type: 'address' },
      { name: 'tokenB', type: 'address' },
      { name: 'feePercent', type: 'uint256' },
    ],
    name: 'createPool',
    outputs: [{ name: '', type: 'bytes32' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'tokenA', type: 'address' },
      { name: 'tokenB', type: 'address' },
      { name: 'amountADesired', type: 'uint256' },
      { name: 'amountBDesired', type: 'uint256' },
      { name: 'amountAMin', type: 'uint256' },
      { name: 'amountBMin', type: 'uint256' },
    ],
    name: 'addLiquidity',
    outputs: [
      { name: 'amountA', type: 'uint256' },
      { name: 'amountB', type: 'uint256' },
      { name: 'liquidity', type: 'uint256' },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'tokenA', type: 'address' },
      { name: 'tokenB', type: 'address' },
      { name: 'liquidity', type: 'uint256' },
      { name: 'amountAMin', type: 'uint256' },
      { name: 'amountBMin', type: 'uint256' },
    ],
    name: 'removeLiquidity',
    outputs: [
      { name: 'amountA', type: 'uint256' },
      { name: 'amountB', type: 'uint256' },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'tokenIn', type: 'address' },
      { name: 'tokenOut', type: 'address' },
      { name: 'amountIn', type: 'uint256' },
      { name: 'amountOutMin', type: 'uint256' },
    ],
    name: 'swap',
    outputs: [{ name: 'amountOut', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'tokenIn', type: 'address' },
      { name: 'tokenOut', type: 'address' },
      { name: 'amountIn', type: 'uint256' },
    ],
    name: 'getAmountOut',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'tokenA', type: 'address' },
      { name: 'tokenB', type: 'address' },
    ],
    name: 'getReserves',
    outputs: [
      { name: 'reserveA', type: 'uint256' },
      { name: 'reserveB', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'tokenA', type: 'address' },
      { name: 'tokenB', type: 'address' },
      { name: 'user', type: 'address' },
    ],
    name: 'getUserLiquidity',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getPoolCount',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

// ERC20 ABI
export const ERC20_ABI = [
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const
`;

  try {
    fs.writeFileSync("frontend/lib/contracts.ts", contractsContent);
    console.log("✅ Frontend contracts file updated");
  } catch (error) {
    console.log("⚠️  Could not update frontend contracts file");
  }

  console.log("\n🎉 Deployment complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

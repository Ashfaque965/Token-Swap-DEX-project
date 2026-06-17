# Quick Start Guide

Get your Token Swap DEX running in 5 minutes! 🚀

## Prerequisites

- **Node.js** v18+ ([Download](https://nodejs.org/))
- **MetaMask** browser extension ([Install](https://metamask.io/))
- **Terminal/Command Prompt**

## Step 1: Install Dependencies (2 minutes)

Open terminal in project folder:

```bash
# Install contract dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

## Step 2: Start Local Blockchain (1 minute)

Open a new terminal window and run:

```bash
npm run node
```

Keep this terminal running. You should see:

```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/

Accounts
========
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
...
```

## Step 3: Deploy Contracts (1 minute)

Open another terminal and run:

```bash
npm run deploy
```

You should see:

```
✅ TokenSwapDEX deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
✅ DEXRouter deployed to: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
✅ Token A (TKA) deployed to: 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
...
```

## Step 4: Configure MetaMask (1 minute)

### Add Hardhat Network:

1. Open MetaMask
2. Click network dropdown → **Add Network** → **Add a network manually**
3. Enter:
   - **Network Name:** Hardhat Local
   - **RPC URL:** http://127.0.0.1:8545
   - **Chain ID:** 31337
   - **Currency Symbol:** ETH
4. Click **Save**

### Import Test Account:

1. Click account icon → **Import Account**
2. Paste private key from Step 2 (without 0x):
   ```
   ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
   ```
3. Click **Import**

You now have 10,000 ETH for testing! 💰

## Step 5: Start Frontend (30 seconds)

Open another terminal:

```bash
cd frontend
npm run dev
```

Open browser to: **http://localhost:3000**

## Step 6: Test the DEX! 🎉

### Connect Wallet

1. Click **Connect Wallet** button
2. Select **MetaMask**
3. Approve connection

### Make Your First Swap

1. Click **Swap** tab
2. Select Token A (TKA) in "From"
3. Select Token B (TKB) in "To"
4. Enter amount: **10**
5. Click **Swap Tokens**
6. Approve in MetaMask (2 transactions: approve + swap)
7. Success! 🎊

### Add Liquidity

1. Click **Liquidity** tab
2. Click **Add** button
3. Select TKA and TKB
4. Enter amounts: **100** and **200**
5. Click **Add Liquidity**
6. Approve in MetaMask
7. You're now a liquidity provider! 💧

## Troubleshooting

### "Pool doesn't exist" error
**Solution:** Add liquidity to the pool first

### Transaction fails
**Solution:** 
- Check MetaMask is on Hardhat network
- Ensure sufficient ETH for gas
- Try increasing gas limit

### Cannot connect wallet
**Solution:**
- Refresh page
- Check MetaMask is unlocked
- Verify network is Hardhat Local (Chain ID: 31337)

### "Nonce too high" error
**Solution:**
1. MetaMask → Settings → Advanced
2. Click **Clear activity tab data**
3. Refresh page

## What's Next?

### Explore Features
- Try different token pairs
- Experiment with slippage settings
- Add and remove liquidity
- Monitor pool statistics

### Learn More
- Read [README.md](README.md) for full documentation
- Check [DEVELOPMENT.md](DEVELOPMENT.md) for architecture details
- Review [API.md](API.md) for contract reference

### Customize
- Add more tokens in [TokenSelect.tsx](frontend/components/TokenSelect.tsx)
- Adjust fees in [deploy.js](scripts/deploy.js)
- Modify UI styling in [globals.css](frontend/app/globals.css)

## Need Help?

- **Documentation:** See README.md
- **Tests:** Run `npm test` to verify setup
- **Issues:** Check GitHub issues

## Summary of Commands

```bash
# Terminal 1: Blockchain
npm run node

# Terminal 2: Deploy
npm run deploy

# Terminal 3: Frontend
cd frontend
npm run dev
```

**That's it!** You now have a fully functional DEX running locally! 🚀

---

**Pro Tips:**
- Keep all 3 terminals open while developing
- Save test account private key for future use
- Check console for transaction details
- Use MetaMask activity tab to track transactions

Happy trading! 📈✨

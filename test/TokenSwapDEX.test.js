const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TokenSwapDEX", function () {
  let dex, tokenA, tokenB, owner, addr1, addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy test tokens
    const TestToken = await ethers.getContractFactory("TestToken");
    tokenA = await TestToken.deploy("Token A", "TKA", 18, 1000000);
    tokenB = await TestToken.deploy("Token B", "TKB", 18, 1000000);

    // Deploy DEX
    const TokenSwapDEX = await ethers.getContractFactory("TokenSwapDEX");
    dex = await TokenSwapDEX.deploy();

    // Transfer tokens to test accounts
    await tokenA.transfer(addr1.address, ethers.parseEther("10000"));
    await tokenB.transfer(addr1.address, ethers.parseEther("10000"));
  });

  describe("Pool Creation", function () {
    it("Should create a new pool", async function () {
      await dex.createPool(tokenA.target, tokenB.target, 30);
      const poolCount = await dex.getPoolCount();
      expect(poolCount).to.equal(1);
    });

    it("Should not allow duplicate pools", async function () {
      await dex.createPool(tokenA.target, tokenB.target, 30);
      await expect(
        dex.createPool(tokenA.target, tokenB.target, 30)
      ).to.be.revertedWith("Pool exists");
    });

    it("Should not allow identical tokens", async function () {
      await expect(
        dex.createPool(tokenA.target, tokenA.target, 30)
      ).to.be.revertedWith("Identical tokens");
    });

    it("Should not allow fee above 10%", async function () {
      await expect(
        dex.createPool(tokenA.target, tokenB.target, 1001)
      ).to.be.revertedWith("Fee too high");
    });
  });

  describe("Add Liquidity", function () {
    beforeEach(async function () {
      await dex.createPool(tokenA.target, tokenB.target, 30);
    });

    it("Should add initial liquidity", async function () {
      const amountA = ethers.parseEther("100");
      const amountB = ethers.parseEther("200");

      await tokenA.connect(addr1).approve(dex.target, amountA);
      await tokenB.connect(addr1).approve(dex.target, amountB);

      await dex.connect(addr1).addLiquidity(
        tokenA.target,
        tokenB.target,
        amountA,
        amountB,
        0,
        0
      );

      const reserves = await dex.getReserves(tokenA.target, tokenB.target);
      expect(reserves[0]).to.equal(amountA);
      expect(reserves[1]).to.equal(amountB);
    });

    it("Should add proportional liquidity", async function () {
      // Add initial liquidity
      await tokenA.connect(addr1).approve(dex.target, ethers.parseEther("1000"));
      await tokenB.connect(addr1).approve(dex.target, ethers.parseEther("1000"));
      
      await dex.connect(addr1).addLiquidity(
        tokenA.target,
        tokenB.target,
        ethers.parseEther("100"),
        ethers.parseEther("200"),
        0,
        0
      );

      // Add more liquidity
      await dex.connect(addr1).addLiquidity(
        tokenA.target,
        tokenB.target,
        ethers.parseEther("50"),
        ethers.parseEther("100"),
        0,
        0
      );

      const reserves = await dex.getReserves(tokenA.target, tokenB.target);
      expect(reserves[0]).to.equal(ethers.parseEther("150"));
      expect(reserves[1]).to.equal(ethers.parseEther("300"));
    });
  });

  describe("Token Swap", function () {
    beforeEach(async function () {
      await dex.createPool(tokenA.target, tokenB.target, 30);

      // Add initial liquidity
      const amountA = ethers.parseEther("1000");
      const amountB = ethers.parseEther("2000");

      await tokenA.connect(addr1).approve(dex.target, amountA);
      await tokenB.connect(addr1).approve(dex.target, amountB);

      await dex.connect(addr1).addLiquidity(
        tokenA.target,
        tokenB.target,
        amountA,
        amountB,
        0,
        0
      );
    });

    it("Should swap tokens", async function () {
      const swapAmount = ethers.parseEther("10");
      
      await tokenA.connect(addr1).approve(dex.target, swapAmount);

      const expectedOut = await dex.getAmountOut(
        tokenA.target,
        tokenB.target,
        swapAmount
      );

      await dex.connect(addr1).swap(
        tokenA.target,
        tokenB.target,
        swapAmount,
        0
      );

      // Check reserves changed
      const reserves = await dex.getReserves(tokenA.target, tokenB.target);
      expect(reserves[0]).to.equal(ethers.parseEther("1010"));
      expect(reserves[1]).to.be.lessThan(ethers.parseEther("2000"));
    });

    it("Should calculate correct output amount", async function () {
      const amountIn = ethers.parseEther("10");
      const amountOut = await dex.getAmountOut(
        tokenA.target,
        tokenB.target,
        amountIn
      );

      // With 1000/2000 reserves and 0.3% fee
      // Expected: ~19.88 tokens (slightly less due to fee)
      expect(amountOut).to.be.greaterThan(ethers.parseEther("19.8"));
      expect(amountOut).to.be.lessThan(ethers.parseEther("20"));
    });

    it("Should respect slippage protection", async function () {
      const swapAmount = ethers.parseEther("10");
      const minOut = ethers.parseEther("100"); // Unrealistically high

      await tokenA.connect(addr1).approve(dex.target, swapAmount);

      await expect(
        dex.connect(addr1).swap(
          tokenA.target,
          tokenB.target,
          swapAmount,
          minOut
        )
      ).to.be.revertedWith("Insufficient output");
    });
  });

  describe("Remove Liquidity", function () {
    beforeEach(async function () {
      await dex.createPool(tokenA.target, tokenB.target, 30);

      const amountA = ethers.parseEther("1000");
      const amountB = ethers.parseEther("2000");

      await tokenA.connect(addr1).approve(dex.target, amountA);
      await tokenB.connect(addr1).approve(dex.target, amountB);

      await dex.connect(addr1).addLiquidity(
        tokenA.target,
        tokenB.target,
        amountA,
        amountB,
        0,
        0
      );
    });

    it("Should remove liquidity", async function () {
      const userLiquidity = await dex.getUserLiquidity(
        tokenA.target,
        tokenB.target,
        addr1.address
      );

      const balanceABefore = await tokenA.balanceOf(addr1.address);
      const balanceBBefore = await tokenB.balanceOf(addr1.address);

      await dex.connect(addr1).removeLiquidity(
        tokenA.target,
        tokenB.target,
        userLiquidity / 2n,
        0,
        0
      );

      const balanceAAfter = await tokenA.balanceOf(addr1.address);
      const balanceBAfter = await tokenB.balanceOf(addr1.address);

      expect(balanceAAfter).to.be.greaterThan(balanceABefore);
      expect(balanceBAfter).to.be.greaterThan(balanceBBefore);
    });

    it("Should not allow removing more than owned", async function () {
      const userLiquidity = await dex.getUserLiquidity(
        tokenA.target,
        tokenB.target,
        addr1.address
      );

      await expect(
        dex.connect(addr1).removeLiquidity(
          tokenA.target,
          tokenB.target,
          userLiquidity + 1n,
          0,
          0
        )
      ).to.be.revertedWith("Insufficient liquidity");
    });
  });
});

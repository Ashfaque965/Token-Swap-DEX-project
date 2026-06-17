// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title TokenSwapDEX
 * @dev Automated Market Maker (AMM) based DEX for token swaps with liquidity pools
 */
contract TokenSwapDEX is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // Pool structure
    struct Pool {
        address tokenA;
        address tokenB;
        uint256 reserveA;
        uint256 reserveB;
        uint256 totalLiquidity;
        mapping(address => uint256) liquidityBalance;
        uint256 feePercent; // Fee in basis points (e.g., 30 = 0.3%)
        bool exists;
    }

    // Mapping of pool ID to Pool
    mapping(bytes32 => Pool) public pools;
    bytes32[] public poolIds;

    // Events
    event PoolCreated(
        bytes32 indexed poolId,
        address indexed tokenA,
        address indexed tokenB,
        uint256 feePercent
    );

    event LiquidityAdded(
        bytes32 indexed poolId,
        address indexed provider,
        uint256 amountA,
        uint256 amountB,
        uint256 liquidity
    );

    event LiquidityRemoved(
        bytes32 indexed poolId,
        address indexed provider,
        uint256 amountA,
        uint256 amountB,
        uint256 liquidity
    );

    event TokensSwapped(
        bytes32 indexed poolId,
        address indexed trader,
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 amountOut
    );

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Get pool ID from token pair
     */
    function getPoolId(address tokenA, address tokenB) public pure returns (bytes32) {
        (address token0, address token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        return keccak256(abi.encodePacked(token0, token1));
    }

    /**
     * @dev Create a new liquidity pool
     */
    function createPool(
        address tokenA,
        address tokenB,
        uint256 feePercent
    ) external onlyOwner returns (bytes32) {
        require(tokenA != tokenB, "Identical tokens");
        require(tokenA != address(0) && tokenB != address(0), "Zero address");
        require(feePercent <= 1000, "Fee too high"); // Max 10%

        bytes32 poolId = getPoolId(tokenA, tokenB);
        require(!pools[poolId].exists, "Pool exists");

        Pool storage pool = pools[poolId];
        pool.tokenA = tokenA < tokenB ? tokenA : tokenB;
        pool.tokenB = tokenA < tokenB ? tokenB : tokenA;
        pool.feePercent = feePercent;
        pool.exists = true;

        poolIds.push(poolId);

        emit PoolCreated(poolId, pool.tokenA, pool.tokenB, feePercent);
        return poolId;
    }

    /**
     * @dev Add liquidity to a pool
     */
    function addLiquidity(
        address tokenA,
        address tokenB,
        uint256 amountADesired,
        uint256 amountBDesired,
        uint256 amountAMin,
        uint256 amountBMin
    ) external nonReentrant returns (uint256 amountA, uint256 amountB, uint256 liquidity) {
        bytes32 poolId = getPoolId(tokenA, tokenB);
        Pool storage pool = pools[poolId];
        require(pool.exists, "Pool doesn't exist");

        (amountA, amountB) = _calculateLiquidityAmounts(
            pool,
            amountADesired,
            amountBDesired,
            amountAMin,
            amountBMin
        );

        // Transfer tokens
        IERC20(pool.tokenA).safeTransferFrom(msg.sender, address(this), amountA);
        IERC20(pool.tokenB).safeTransferFrom(msg.sender, address(this), amountB);

        // Calculate liquidity tokens
        if (pool.totalLiquidity == 0) {
            liquidity = sqrt(amountA * amountB);
        } else {
            liquidity = min(
                (amountA * pool.totalLiquidity) / pool.reserveA,
                (amountB * pool.totalLiquidity) / pool.reserveB
            );
        }

        require(liquidity > 0, "Insufficient liquidity");

        // Update pool state
        pool.reserveA += amountA;
        pool.reserveB += amountB;
        pool.totalLiquidity += liquidity;
        pool.liquidityBalance[msg.sender] += liquidity;

        emit LiquidityAdded(poolId, msg.sender, amountA, amountB, liquidity);
    }

    /**
     * @dev Remove liquidity from a pool
     */
    function removeLiquidity(
        address tokenA,
        address tokenB,
        uint256 liquidity,
        uint256 amountAMin,
        uint256 amountBMin
    ) external nonReentrant returns (uint256 amountA, uint256 amountB) {
        bytes32 poolId = getPoolId(tokenA, tokenB);
        Pool storage pool = pools[poolId];
        require(pool.exists, "Pool doesn't exist");
        require(pool.liquidityBalance[msg.sender] >= liquidity, "Insufficient liquidity");

        // Calculate token amounts
        amountA = (liquidity * pool.reserveA) / pool.totalLiquidity;
        amountB = (liquidity * pool.reserveB) / pool.totalLiquidity;

        require(amountA >= amountAMin, "Insufficient tokenA");
        require(amountB >= amountBMin, "Insufficient tokenB");

        // Update pool state
        pool.liquidityBalance[msg.sender] -= liquidity;
        pool.totalLiquidity -= liquidity;
        pool.reserveA -= amountA;
        pool.reserveB -= amountB;

        // Transfer tokens
        IERC20(pool.tokenA).safeTransfer(msg.sender, amountA);
        IERC20(pool.tokenB).safeTransfer(msg.sender, amountB);

        emit LiquidityRemoved(poolId, msg.sender, amountA, amountB, liquidity);
    }

    /**
     * @dev Swap tokens
     */
    function swap(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 amountOutMin
    ) external nonReentrant returns (uint256 amountOut) {
        bytes32 poolId = getPoolId(tokenIn, tokenOut);
        Pool storage pool = pools[poolId];
        require(pool.exists, "Pool doesn't exist");
        require(amountIn > 0, "Invalid amount");

        // Calculate output amount with fee
        amountOut = getAmountOut(tokenIn, tokenOut, amountIn);
        require(amountOut >= amountOutMin, "Insufficient output");

        // Transfer input tokens
        IERC20(tokenIn).safeTransferFrom(msg.sender, address(this), amountIn);

        // Update reserves
        if (tokenIn == pool.tokenA) {
            pool.reserveA += amountIn;
            pool.reserveB -= amountOut;
        } else {
            pool.reserveB += amountIn;
            pool.reserveA -= amountOut;
        }

        // Transfer output tokens
        IERC20(tokenOut).safeTransfer(msg.sender, amountOut);

        emit TokensSwapped(poolId, msg.sender, tokenIn, tokenOut, amountIn, amountOut);
    }

    /**
     * @dev Calculate output amount for a swap
     */
    function getAmountOut(
        address tokenIn,
        address tokenOut,
        uint256 amountIn
    ) public view returns (uint256) {
        bytes32 poolId = getPoolId(tokenIn, tokenOut);
        Pool storage pool = pools[poolId];
        require(pool.exists, "Pool doesn't exist");

        uint256 reserveIn;
        uint256 reserveOut;

        if (tokenIn == pool.tokenA) {
            reserveIn = pool.reserveA;
            reserveOut = pool.reserveB;
        } else {
            reserveIn = pool.reserveB;
            reserveOut = pool.reserveA;
        }

        require(amountIn > 0 && reserveIn > 0 && reserveOut > 0, "Invalid reserves");

        // Apply fee
        uint256 amountInWithFee = amountIn * (10000 - pool.feePercent);
        uint256 numerator = amountInWithFee * reserveOut;
        uint256 denominator = (reserveIn * 10000) + amountInWithFee;

        return numerator / denominator;
    }

    /**
     * @dev Get pool reserves
     */
    function getReserves(address tokenA, address tokenB)
        external
        view
        returns (uint256 reserveA, uint256 reserveB)
    {
        bytes32 poolId = getPoolId(tokenA, tokenB);
        Pool storage pool = pools[poolId];
        require(pool.exists, "Pool doesn't exist");

        return (pool.reserveA, pool.reserveB);
    }

    /**
     * @dev Get user liquidity balance
     */
    function getUserLiquidity(
        address tokenA,
        address tokenB,
        address user
    ) external view returns (uint256) {
        bytes32 poolId = getPoolId(tokenA, tokenB);
        return pools[poolId].liquidityBalance[user];
    }

    /**
     * @dev Get number of pools
     */
    function getPoolCount() external view returns (uint256) {
        return poolIds.length;
    }

    /**
     * @dev Calculate liquidity amounts
     */
    function _calculateLiquidityAmounts(
        Pool storage pool,
        uint256 amountADesired,
        uint256 amountBDesired,
        uint256 amountAMin,
        uint256 amountBMin
    ) private view returns (uint256 amountA, uint256 amountB) {
        if (pool.reserveA == 0 && pool.reserveB == 0) {
            return (amountADesired, amountBDesired);
        }

        uint256 amountBOptimal = (amountADesired * pool.reserveB) / pool.reserveA;
        if (amountBOptimal <= amountBDesired) {
            require(amountBOptimal >= amountBMin, "Insufficient tokenB");
            return (amountADesired, amountBOptimal);
        }

        uint256 amountAOptimal = (amountBDesired * pool.reserveA) / pool.reserveB;
        require(amountAOptimal <= amountADesired, "Invalid calculation");
        require(amountAOptimal >= amountAMin, "Insufficient tokenA");
        return (amountAOptimal, amountBDesired);
    }

    // Utility functions
    function sqrt(uint256 y) private pure returns (uint256 z) {
        if (y > 3) {
            z = y;
            uint256 x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }

    function min(uint256 x, uint256 y) private pure returns (uint256) {
        return x < y ? x : y;
    }
}

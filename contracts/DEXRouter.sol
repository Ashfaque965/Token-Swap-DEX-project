// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./TokenSwapDEX.sol";

/**
 * @title DEXRouter
 * @dev Router contract for multi-hop swaps and advanced features
 */
contract DEXRouter {
    using SafeERC20 for IERC20;

    TokenSwapDEX public immutable dex;

    event MultiHopSwap(
        address indexed trader,
        address[] path,
        uint256 amountIn,
        uint256 amountOut
    );

    constructor(address _dex) {
        require(_dex != address(0), "Invalid DEX address");
        dex = TokenSwapDEX(_dex);
    }

    /**
     * @dev Swap exact tokens for tokens through multiple pools
     */
    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external returns (uint256[] memory amounts) {
        require(deadline >= block.timestamp, "Expired");
        require(path.length >= 2, "Invalid path");

        amounts = new uint256[](path.length);
        amounts[0] = amountIn;

        // Transfer initial tokens
        IERC20(path[0]).safeTransferFrom(msg.sender, address(this), amountIn);
        IERC20(path[0]).approve(address(dex), amountIn);

        // Perform swaps
        for (uint256 i = 0; i < path.length - 1; i++) {
            amounts[i + 1] = dex.swap(
                path[i],
                path[i + 1],
                amounts[i],
                0 // Will check final amount
            );
        }

        require(amounts[amounts.length - 1] >= amountOutMin, "Insufficient output");

        // Transfer final tokens to recipient
        IERC20(path[path.length - 1]).safeTransfer(to, amounts[amounts.length - 1]);

        emit MultiHopSwap(msg.sender, path, amountIn, amounts[amounts.length - 1]);
    }

    /**
     * @dev Get amounts out for multi-hop swap
     */
    function getAmountsOut(uint256 amountIn, address[] calldata path)
        external
        view
        returns (uint256[] memory amounts)
    {
        require(path.length >= 2, "Invalid path");
        amounts = new uint256[](path.length);
        amounts[0] = amountIn;

        for (uint256 i = 0; i < path.length - 1; i++) {
            amounts[i + 1] = dex.getAmountOut(path[i], path[i + 1], amounts[i]);
        }
    }

    /**
     * @dev Add liquidity with token approval
     */
    function addLiquidityWithPermit(
        address tokenA,
        address tokenB,
        uint256 amountADesired,
        uint256 amountBDesired,
        uint256 amountAMin,
        uint256 amountBMin,
        address to,
        uint256 deadline
    ) external returns (uint256 amountA, uint256 amountB, uint256 liquidity) {
        require(deadline >= block.timestamp, "Expired");

        // Transfer tokens to this contract
        IERC20(tokenA).safeTransferFrom(msg.sender, address(this), amountADesired);
        IERC20(tokenB).safeTransferFrom(msg.sender, address(this), amountBDesired);

        // Approve DEX
        IERC20(tokenA).approve(address(dex), amountADesired);
        IERC20(tokenB).approve(address(dex), amountBDesired);

        // Add liquidity
        (amountA, amountB, liquidity) = dex.addLiquidity(
            tokenA,
            tokenB,
            amountADesired,
            amountBDesired,
            amountAMin,
            amountBMin
        );

        // Refund excess tokens to user
        if (amountADesired > amountA) {
            IERC20(tokenA).safeTransfer(to, amountADesired - amountA);
        }
        if (amountBDesired > amountB) {
            IERC20(tokenB).safeTransfer(to, amountBDesired - amountB);
        }
    }

    /**
     * @dev Quote liquidity amounts
     */
    function quoteLiquidity(
        address tokenA,
        address tokenB,
        uint256 amountADesired,
        uint256 amountBDesired
    ) external view returns (uint256 amountA, uint256 amountB) {
        (uint256 reserveA, uint256 reserveB) = dex.getReserves(tokenA, tokenB);

        if (reserveA == 0 && reserveB == 0) {
            return (amountADesired, amountBDesired);
        }

        uint256 amountBOptimal = (amountADesired * reserveB) / reserveA;
        if (amountBOptimal <= amountBDesired) {
            return (amountADesired, amountBOptimal);
        }

        uint256 amountAOptimal = (amountBDesired * reserveA) / reserveB;
        return (amountAOptimal, amountBDesired);
    }
}

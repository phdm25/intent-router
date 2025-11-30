// -------------------------------------------------------------
// Uniswap Configuration (Mainnet + Testnet)
// Loaded through AppConfig.network (Zod validated)
// -------------------------------------------------------------

import { AppConfig } from "./index.js";

// ABI fragments
export const UNISWAP_QUOTER_V2_ABI = [
  {
    name: "quoteExactInputSingle",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "tokenIn", type: "address" },
      { name: "tokenOut", type: "address" },
      { name: "fee", type: "uint24" },
      { name: "amountIn", type: "uint256" },
      { name: "sqrtPriceLimitX96", type: "uint160" },
    ],
    outputs: [{ name: "amountOut", type: "uint256" }],
  },
] as const;

export const UNISWAP_SWAP_ROUTER_02_ABI = [
  {
    name: "exactInputSingle",
    type: "function",
    stateMutability: "payable",
    inputs: [
      {
        name: "params",
        type: "tuple",
        components: [
          { name: "tokenIn", type: "address" },
          { name: "tokenOut", type: "address" },
          { name: "fee", type: "uint24" },
          { name: "recipient", type: "address" },
          { name: "deadline", type: "uint256" },
          { name: "amountIn", type: "uint256" },
          { name: "amountOutMinimum", type: "uint256" },
          { name: "sqrtPriceLimitX96", type: "uint160" },
        ],
      },
    ],
    outputs: [{ name: "amountOut", type: "uint256" }],
  },
] as const;

// Fee tiers we will test
export const UNISWAP_FEE_TIERS = [500, 3000, 10000] as const;

// Network-specific addresses from AppConfig.network
export const UNISWAP_ADDRESSES = {
  QUOTER_V2: AppConfig.network.uniswap.quoterV2,
  ROUTER_02: AppConfig.network.uniswap.swapRouter02,
} as const;

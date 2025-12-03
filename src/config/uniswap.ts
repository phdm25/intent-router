// -------------------------------------------------------------
// Uniswap Configuration (Mainnet + Testnet)
// Loaded through AppConfig.network (Zod validated)
// -------------------------------------------------------------

import type { ChainRef } from "../domain/chainref.schema.js";
import { Networks, type ChainConfig } from "./network";

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

/**
 * Find ChainConfig by ChainRef (type + id).
 */
export function getChainConfigByRef(chain: ChainRef): ChainConfig {
  const config = Object.values(Networks).find(
    (c) => c.chainRef.type === chain.type && c.chainRef.id === chain.id
  );

  if (!config) {
    throw new Error(
      `[UniswapConfig] No chain config found for ${chain.type}:${chain.id}`
    );
  }

  return config;
}

/**
 * Returns Uniswap addresses (QuoterV2 + SwapRouter02) for a specific chain.
 */
export function getUniswapAddresses(chain: ChainRef) {
  const cfg = getChainConfigByRef(chain);

  if (!cfg.uniswap) {
    throw new Error(
      `[UniswapConfig] Uniswap is not configured for chain ${cfg.name} (${cfg.chainRef.id})`
    );
  }

  return {
    quoterV2: cfg.uniswap.quoterV2,
    swapRouter02: cfg.uniswap.swapRouter02,
  } as const;
}

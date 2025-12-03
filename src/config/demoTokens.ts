import type { Token } from "../domain/types.js";

export const DEMO_USDC: Token = {
  symbol: "USDC",
  decimals: 6,
  address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  chain: { type: "evm", id: 1 },
};

export const DEMO_WETH: Token = {
  symbol: "WETH",
  decimals: 18,
  address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  chain: { type: "evm", id: 1 },
};

export const DEMO_USDC_ETH = DEMO_USDC;

export const DEMO_WETH_ARB: Token = {
  symbol: "WETH",
  decimals: 18,
  address: "0x82af49447d8a07e3bd95bd0d56f35241523fbab1", // Arbitrum WETH
  chain: { type: "evm", id: 42161 },
};

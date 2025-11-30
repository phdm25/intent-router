import type { Token } from "../domain/types";
import { AppConfig } from "./index.js";

const chain = AppConfig.network.chainRef;

// Mainnet USDC
export const DEMO_USDC: Token = {
  chain,
  address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  symbol: "USDC",
  decimals: 6,
};

// Mainnet WETH
export const DEMO_WETH: Token = {
  chain,
  address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  symbol: "WETH",
  decimals: 18,
};

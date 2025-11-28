// ---------------------------------------------
// Domain / Core Types
// These types define the core business model of the intent routing system.
// They are chain-agnostic and contain no blockchain-specific logic.
// ---------------------------------------------

export type ChainType = "evm" | "near" | "solana";

export type ChainId = number | string;

// Represents a specific blockchain network.
// Example:
//   { type: 'evm', id: 1 }       → Ethereum Mainnet
//   { type: 'near', id: 'mainnet' }
export interface ChainRef {
  type: ChainType;
  id: ChainId;
}

// Token descriptor used across all chains.
// IMPORTANT: This is pure metadata, no on-chain logic.
export interface Token {
  chain: ChainRef;
  address: string; // EVM: 0x..., NEAR: account.near
  symbol: string;
  decimals: number;
}

// User-defined intent describing the requested swap operation.
// This is the core input of the routing engine.
export interface Intent {
  id: string; // Unique identifier for this intent
  fromToken: Token; // Token the user wants to sell
  toToken: Token; // Token the user wants to receive
  amountIn: bigint; // Amount in token units (not human-readable)
  maxSlippageBps: number; // Allowed slippage in basis points (e.g. 50 = 0.5%)
  deadline: number; // Unix timestamp (seconds)
  executorFeeBps: number; // Fee taken by the executor (bps)
  payer?: "user" | "executor"; // Who pays gas (optional)
  signature?: string; // Signed intent payload (EIP-712 or NEAR chain signatures)
}

// Quote returned by a liquidity provider (Uniswap, 1inch, etc).
// A Quote is NOT a transaction — it's a price estimation.
export interface Quote {
  providerId: string; // Example: "uniswap-v3", "1inch"
  chain: ChainRef; // Chain where the quote is valid
  fromToken: Token;
  toToken: Token;
  amountIn: bigint;
  amountOut: bigint; // Estimated output amount without execution fee
  raw: unknown; // Provider-specific payload
}

// Detailed breakdown of cost components.
// Only used during route evaluation.
export interface CostBreakdown {
  gasFeeUsd: number;
  priceImpactBps: number;
  protocolFeeUsd: number;
  executorFeeUsd: number;
}

// Selected route that will be passed to ExecutionBuilder.
// Contains normalized info that the executor will use.
export interface Route {
  providerId: string;
  chain: ChainRef;
  amountIn: bigint;
  amountOut: bigint;
  totalCostScore: number; // Lower = better
  executionPlan: unknown; // Provider-specific data required to build the final transaction
}

// ---------------------------------------------
// Domain Errors
// These errors represent violations of business rules
// (NOT low-level blockchain or RPC errors).
// ---------------------------------------------

export class IntentValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "IntentValidationError";
  }
}

export class UnsupportedChainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnsupportedChainError";
  }
}

export class InvalidQuoteError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidQuoteError";
  }
}

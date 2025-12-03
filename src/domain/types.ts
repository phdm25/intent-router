// ---------------------------------------------
// Domain / Core Types
// These types define the core business model of the intent routing system.
// They are chain-agnostic and contain no blockchain-specific logic.
// ---------------------------------------------
export { Intent } from "./intent.schema";
import { Token as TokenType } from "./token.schema";
import { ChainRef as ChainRefType } from "./chainref.schema";
import { ExecutionPlan } from "./executionPlan";

export type ChainType = "evm" | "near" | "solana";

export type ChainId = number | string;

// Represents a specific blockchain network.
// Example:
//   { type: 'evm', id: 1 }       → Ethereum Mainnet
//   { type: 'near', id: 'mainnet' }

// Quote returned by a liquidity provider (Uniswap, 1inch, etc).
// A Quote is NOT a transaction — it's a price estimation.
export interface Quote {
  providerId: string; // Example: "uniswap-v3", "1inch"
  chain: ChainRefType; // Chain where the quote is valid
  fromToken: TokenType;
  toToken: TokenType;
  amountIn: bigint;
  amountOut: bigint; // Estimated output amount without execution fee
  raw: unknown; // Provider-specific payload
}

export type Token = TokenType;
export type ChainRef = ChainRefType;

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
  amountIn: bigint;
  amountOut: bigint;
  totalCostScore: number; // lower = better
  executionPlans: ExecutionPlan[];
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

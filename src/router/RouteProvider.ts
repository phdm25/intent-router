// -------------------------------------------------------------
// RouteProvider Interface
//
// A RouteProvider represents a single liquidity source:
// - Uniswap V3
// - 1inch API
// - SushiSwap
// - Bridges
// - Future NEAR/Aurora providers
//
// Responsibilities:
// 1. Declare whether it supports a given Intent.
// 2. Produce a Quote (price estimation).
// 3. Convert the Quote into a Route (execution plan).
//
// Note:
// RouteProvider does NOT execute transactions.
// Execution is handled later by ExecutionBuilder and ExecutorService.
// -------------------------------------------------------------

import type { Intent, Quote, Route } from "../domain/types";

export interface RouteProvider {
  // Unique identifier of the provider ("uniswap-v3", "1inch", etc.)
  id: string;

  // Returns true if this provider can handle the intent.
  // Useful for limiting chains, tokens, and other constraints.
  supports(intent: Intent): boolean;

  // Fetches a price quote from the provider.
  // Returns null if the provider cannot price this intent.
  getQuote(intent: Intent): Promise<Quote | null>;

  // Converts a Quote into a complete Route object,
  // including an executionPlan that ExecutionBuilder will later use.
  buildRoute(intent: Intent, quote: Quote, score: number): Promise<Route>;
}

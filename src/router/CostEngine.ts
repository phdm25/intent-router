// -------------------------------------------------------------
// Cost Engine
// Responsible for converting a Quote into a comparable score.
//
// Purpose:
// - Normalize different quotes into a single score metric.
// - Lower score = better route.
// - Embed gas, slippage, fee, and other cost factors (future).
//
// Note:
// For the MVP, the cost engine uses a very simple model:
// it prefers the highest amountOut.
// -------------------------------------------------------------

import type { Intent, Quote, CostBreakdown } from "../domain/types";

// Result of evaluating a single quote.
export interface EvaluatedQuote {
  quote: Quote;
  score: number; // Lower score is better
  breakdown: CostBreakdown; // Detailed cost components (optional for MVP)
}

// Interface for pluggable cost engines.
// In the future this may include machine learning models,
// predictive gas estimation, cross-chain risk assessment, etc.
export interface CostEngine {
  evaluate(intent: Intent, quote: Quote): Promise<EvaluatedQuote>;
  calculateScore(intent: Intent, quote: Quote): Promise<number>;
}

// MVP implementation of the cost engine.
// Strategy:
// - Ignore gas, slippage, price impact, etc.
// - Score = -amountOut, so higher output is better.
// This delivers correct route ranking for the simplest case.
export class SimpleCostEngine implements CostEngine {
  async evaluate(intent: Intent, quote: Quote): Promise<EvaluatedQuote> {
    const score = Number(-quote.amountOut);

    const breakdown: CostBreakdown = {
      gasFeeUsd: 0,
      priceImpactBps: 0,
      protocolFeeUsd: 0,
      executorFeeUsd: 0,
    };

    return { quote, score, breakdown };
  }
  async calculateScore(intent: Intent, quote: Quote): Promise<number> {
    // Чем больше amountOut — тем лучше
    return Number(quote.amountOut);
  }
}

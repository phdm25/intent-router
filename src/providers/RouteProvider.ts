// -------------------------------------------------------------
// RouteProvider — base interface for all providers
//
// Every provider must:
// - support(intent) → boolean
// - getQuote(intent) → Quote | null
// - buildRoute(intent, quote) → Route
// -------------------------------------------------------------

import type { Intent, Quote, Route } from "../domain/types";

export interface RouteProvider {
  /** Unique provider id (e.g. "uniswap-v3", "1inch") */
  id: string;

  /** Whether the provider supports this intent */
  supports(intent: Intent): boolean;

  /** Returns a quote, or null if provider can't handle this route */
  getQuote(intent: Intent): Promise<Quote | null>;

  /** Converts a Quote into Route object with executionPlan */
  buildRoute(intent: Intent, quote: Quote): Promise<Route>;
}

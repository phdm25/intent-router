// -------------------------------------------------------------
// RouterService
//
// Central orchestration component of the routing layer.
//
// Responsibilities:
// 1. Filter providers that support the given intent.
// 2. Fetch quotes from all applicable providers.
// 3. Evaluate quotes using CostEngine.
// 4. Select the best quote (lowest score).
// 5. Ask the winning provider to build the final Route.
//
// This service does NOT:
// - Execute transactions.
// - Perform blockchain calls.
// - Apply fees (handled later in ExecutionBuilder).
// - Validate signatures (SignatureProvider handles this).
//
// RouterService is chain-agnostic.
// Providers and ChainAdapters contain all chain-specific logic.
// -------------------------------------------------------------

import type { Intent, Route } from "../domain/types";
import type { RouteProvider } from "./RouteProvider";
import type { CostEngine, EvaluatedQuote } from "./CostEngine";

export class RouterService {
  constructor(
    private readonly providers: RouteProvider[],
    private readonly costEngine: CostEngine
  ) {}

  // Finds and builds the best possible route for the given intent.
  async findBestRoute(intent: Intent): Promise<Route | null> {
    // Step 1: Filter providers that can process this intent.
    const applicableProviders = this.providers.filter((p) =>
      p.supports(intent)
    );

    if (applicableProviders.length === 0) {
      return null;
    }

    // Step 2: Collect quotes from all applicable providers.
    const quotes = await Promise.all(
      applicableProviders.map((p) =>
        p.getQuote(intent).catch((err) => {
          console.warn(
            `[RouterService] Provider "${p.id}" getQuote() failed:`,
            err
          );
          return null;
        })
      )
    );

    const validQuotes = quotes.filter((q): q is NonNullable<typeof q> => !!q);

    if (validQuotes.length === 0) {
      return null;
    }

    // Step 3: Evaluate each quote using the cost engine.
    const evaluatedQuotes: EvaluatedQuote[] = await Promise.all(
      validQuotes.map((quote) => this.costEngine.evaluate(intent, quote))
    );

    // Step 4: Select the best evaluated quote (minimum score).
    const best = evaluatedQuotes.reduce<EvaluatedQuote | null>(
      (bestSoFar, current) => {
        if (!bestSoFar) return current;
        return current.score < bestSoFar.score ? current : bestSoFar;
      },
      null
    );

    if (!best) return null;

    // Step 5: Build the final Route using the winning provider.
    const provider = applicableProviders.find(
      (p) => p.id === best.quote.providerId
    );

    if (!provider) {
      console.error(
        `[RouterService] No provider found for providerId="${best.quote.providerId}".`
      );
      return null;
    }

    return provider.buildRoute(intent, best.quote);
  }
}

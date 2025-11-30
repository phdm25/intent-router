// -------------------------------------------------------------
// RouterService — finds the best route among providers.
//
// STRICT version:
// - validates Intent (Zod)
// - works only with RouteProvider[]
// - enforces Quote/Route type safety
// - handles provider errors gracefully
// -------------------------------------------------------------

import { IntentSchema } from "../domain/intent.schema";
import type { Intent, Quote, Route } from "../domain/types";
import type { RouteProvider } from "./RouteProvider";
import type { CostEngine } from "./CostEngine";

export class RouterService {
  constructor(
    private readonly providers: RouteProvider[],
    private readonly costEngine: CostEngine
  ) {}

  async findBestRoute(intent: Intent): Promise<Route | null> {
    // Validate input
    const parsed = IntentSchema.safeParse(intent);
    if (!parsed.success) {
      throw new Error("Invalid Intent input");
    }

    const validatedIntent = parsed.data;

    const quotes: Quote[] = [];

    for (const provider of this.providers) {
      try {
        if (!provider.supports(validatedIntent)) continue;

        const quote = await provider.getQuote(validatedIntent);

        if (quote) quotes.push(quote);
      } catch (err) {
        console.warn(`[${provider.id}] quote error:`, err);
      }
    }

    if (quotes.length === 0) return null;

    // Score quotes:
    const scored: { quote: Quote; score: number }[] = [];

    for (const q of quotes) {
      scored.push({
        quote: q,
        score: await this.costEngine.calculateScore(validatedIntent, q),
      });
    }

    scored.sort((a, b) => b.score - a.score);

    const best = scored[0].quote;

    // Build route
    const bestProvider = this.providers.find((p) => p.id === best.providerId);
    if (!bestProvider) throw new Error("Provider disappeared?");

    return await bestProvider.buildRoute(validatedIntent, best);
  }
}

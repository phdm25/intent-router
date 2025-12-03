import { IntentSchema, type Intent } from "../domain/intent.schema";
import type { Route } from "../domain/types";
import { ExecutionPlanSchema } from "../domain/executionPlan";
import type { RouteProvider } from "./RouteProvider";

export class RouterService {
  constructor(
    private readonly providers: RouteProvider[],
    private readonly costEngine: any // TODO: type it later
  ) {}

  /**
   * 1) Validate intent (incl. fromChain/toChain)
   * 2) Decide if this is single-chain or cross-chain intent
   * 3) Fetch quotes only from compatible providers
   * 4) Pick best provider (via costEngine)
   * 5) Build route (executionPlans[])
   * 6) Validate executionPlans via zod
   */
  async findBestRoute(intent: Intent): Promise<Route> {
    // -------------------------
    // 1. Validate intent
    // -------------------------
    const validated = IntentSchema.parse(intent);

    // Basic consistency checks between tokens and chains
    if (
      validated.fromToken.chain.type !== validated.fromChain.type ||
      validated.fromToken.chain.id !== validated.fromChain.id
    ) {
      throw new Error(
        "[Router] fromToken.chain does not match fromChain in Intent"
      );
    }

    if (
      validated.toToken.chain.type !== validated.toChain.type ||
      validated.toToken.chain.id !== validated.toChain.id
    ) {
      throw new Error(
        "[Router] toToken.chain does not match toChain in Intent"
      );
    }

    // -------------------------
    // 2. Single-chain vs cross-chain
    // -------------------------
    const isCrossChain =
      validated.fromChain.type !== validated.toChain.type ||
      validated.fromChain.id !== validated.toChain.id;

    // Пока у нас только single-chain провайдеры (Uniswap/1inch).
    // Cross-chain (bridge + swap) добавим отдельными BridgeProviders.
    if (isCrossChain && !validated.requiresCrossChain) {
      // Intent явно описывает разные сети,
      // даже если requiresCrossChain не выставлен.
      // Лучше сразу упасть с понятной ошибкой.
      throw new Error(
        "[Router] Cross-chain intent detected (fromChain != toChain), " +
          "but requiresCrossChain=false. Please set requiresCrossChain=true " +
          "or keep fromChain/toChain equal for single-chain swaps."
      );
    }

    // -------------------------
    // 3. Collect all quotes from compatible providers
    // -------------------------
    const quotes = [];

    for (const p of this.providers) {
      // Provider-level filtering (chain / token support)
      if (!p.supports(validated)) {
        continue;
      }

      // В будущем здесь можно будет разделить:
      // - single-chain providers (Uniswap/1inch)
      // - cross-chain providers (CCTP/Stargate)
      // Например:
      // if (isCrossChain && !p.supportsCrossChain?.(validated)) continue;

      try {
        const q = await p.getQuote(validated);
        if (q) quotes.push(q);
      } catch (err) {
        console.warn(`[Router] Provider ${p.id} failed getQuote`, err);
      }
    }

    if (quotes.length === 0) {
      if (isCrossChain) {
        throw new Error(
          "[Router] No quotes for cross-chain intent. " +
            "Cross-chain providers are not configured yet."
        );
      }

      throw new Error("[Router] No available quotes from providers");
    }

    // -------------------------
    // 4. Score quotes via costEngine
    // -------------------------
    const scored: { quote: any; score: number }[] = [];

    for (const q of quotes) {
      const score = await this.costEngine.calculateScore(validated, q);
      scored.push({ quote: q, score });
    }

    // lower score = better OR higher? зависит от твоего CostEngine.
    // Ниже оставим "lower is better" как более типичный кейс.
    scored.sort((a, b) => Number(a.score - b.score));

    const { quote: bestQuote, score: bestScore } = scored[0];

    // -------------------------
    // 5. Build route via provider
    // -------------------------
    const provider = this.providers.find((p) => p.id === bestQuote.providerId);
    if (!provider) {
      throw new Error(
        `[Router] Selected provider ${bestQuote.providerId} not found`
      );
    }

    const route = await provider.buildRoute(validated, bestQuote, bestScore);

    // -------------------------
    // 6. Validate executionPlans[]
    // -------------------------
    if (
      !Array.isArray(route.executionPlans) ||
      route.executionPlans.length === 0
    ) {
      throw new Error(
        "[Router] Provider returned invalid or empty executionPlans[]"
      );
    }

    for (const plan of route.executionPlans) {
      ExecutionPlanSchema.parse(plan);
    }

    return route;
  }
}

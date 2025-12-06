import type { Intent, Quote, Route } from "../domain/types";
import { BaseProvider } from "./BaseProvider.js";

export abstract class BaseBridgeProvider extends BaseProvider {
  /**
   * Cross-chain provider supports intent only if:
   *   - fromChain != toChain
   *   - requiresCrossChain == true
   */
  supports(intent: Intent): boolean {
    const isCrossChain =
      intent.fromChain.type !== intent.toChain.type ||
      intent.fromChain.id !== intent.toChain.id;

    return isCrossChain && intent.requiresCrossChain === true;
  }

  abstract getQuote(intent: Intent): Promise<Quote | null>;

  abstract buildRoute(
    intent: Intent,
    quote: Quote,
    score: number
  ): Promise<Route>;
}

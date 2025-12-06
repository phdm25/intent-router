import type { Intent, Quote, Route } from "../domain/types";
import { IntentSchema } from "../domain/intent.schema";
import type { RouteProvider } from "../router/RouteProvider";

export abstract class BaseProvider implements RouteProvider {
  abstract id: string;

  abstract supports(intent: Intent): boolean;

  abstract getQuote(intent: Intent): Promise<Quote | null>;

  abstract buildRoute(
    intent: Intent,
    quote: Quote,
    score: number
  ): Promise<Route>;

  /**
   * Common intent validation for all providers.
   */
  protected validateIntent(intent: Intent) {
    const parsed = IntentSchema.safeParse(intent);
    if (!parsed.success) {
      throw new Error(
        `[${this.id}] Invalid Intent: ${JSON.stringify(
          parsed.error.format(),
          null,
          2
        )}`
      );
    }
  }
}

// -------------------------------------------------------------
// BaseProvider — common foundation for all providers.
//
// - id must be unique
// - supports(), getQuote(), buildRoute() must be implemented
// - includes common helper: validate intent structure
// -------------------------------------------------------------

import type { Intent, Quote, Route } from "../domain/types";
import type { RouteProvider } from "../router/RouteProvider";
import { IntentSchema } from "../domain/intent.schema";

export abstract class BaseProvider implements RouteProvider {
  abstract id: string;

  abstract supports(intent: Intent): boolean;

  abstract getQuote(intent: Intent): Promise<Quote | null>;

  abstract buildRoute(intent: Intent, quote: Quote): Promise<Route>;

  /** Common validation for all providers */
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

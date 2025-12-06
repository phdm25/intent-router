import { BaseProvider } from "./BaseProvider";
import type { Intent, Quote, Route } from "../domain/types";

import { ONEINCH_API_BASE, ONEINCH_HEADERS } from "../config/oneinch";
import { AppConfig } from "../config/index";

/**
 * OneInchProvider works only on EVM single-chain swaps.
 */
export class OneInchProvider extends BaseProvider {
  id = "1inch" as const;

  supports(intent: Intent): boolean {
    const isSameChain =
      intent.fromChain.type === intent.toChain.type &&
      intent.fromChain.id === intent.toChain.id;

    const isEvm = intent.fromChain.type === "evm";

    return isEvm && isSameChain;
  }

  async getQuote(intent: Intent): Promise<Quote | null> {
    this.validateIntent(intent);

    const chainId = intent.fromChain.id;

    const url =
      `${ONEINCH_API_BASE}/${chainId}/quote` +
      `?src=${intent.fromToken.address}` +
      `&dst=${intent.toToken.address}` +
      `&amount=${intent.amountIn.toString()}`;

    const res = await fetch(url, { headers: ONEINCH_HEADERS });
    if (!res.ok) return null;

    const data = await res.json();

    return {
      providerId: this.id,
      chain: intent.fromChain,
      fromToken: intent.fromToken,
      toToken: intent.toToken,
      amountIn: intent.amountIn,
      amountOut: BigInt(data.dstAmount),
      raw: data,
    };
  }

  async buildRoute(
    intent: Intent,
    quote: Quote,
    score: number
  ): Promise<Route> {
    this.validateIntent(intent);

    const chainId = quote.chain.id;
    const slippagePercent = intent.maxSlippageBps / 100;

    const url =
      `${ONEINCH_API_BASE}/${chainId}/swap` +
      `?src=${quote.fromToken.address}` +
      `&dst=${quote.toToken.address}` +
      `&amount=${quote.amountIn.toString()}` +
      `&from=${AppConfig.env.EXECUTOR_ADDRESS}` +
      `&slippage=${slippagePercent}`;

    const res = await fetch(url, { headers: ONEINCH_HEADERS });
    if (!res.ok) throw new Error("[1inch] swap request failed");

    const data = await res.json();

    const plan = {
      providerId: this.id,
      type: "evm_swap" as const,
      chain: quote.chain,
      to: data.tx.to,
      data: data.tx.data,
      value: BigInt(data.tx.value ?? "0"),
    };

    return {
      providerId: this.id,
      amountIn: quote.amountIn,
      amountOut: quote.amountOut,
      totalCostScore: score,
      executionPlans: [plan],
    };
  }
}

import { BaseProvider } from "./BaseProvider.js";
import type { Intent, Quote, Route } from "../domain/types";

import { ONEINCH_API_BASE, ONEINCH_HEADERS } from "../config/oneinch.js";

import { AppConfig } from "../config/index.js";

export class OneInchProvider extends BaseProvider {
  id = "1inch" as const;

  supports(intent: Intent): boolean {
    return intent.fromToken.chain.type === "evm";
  }

  async getQuote(intent: Intent): Promise<Quote | null> {
    this.validateIntent(intent);

    const chainId = intent.fromToken.chain.id;

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
      chain: intent.fromToken.chain,
      fromToken: intent.fromToken,
      toToken: intent.toToken,
      amountIn: intent.amountIn,
      amountOut: BigInt(data.dstAmount),
      raw: data,
    };
  }

  async buildRoute(intent: Intent, quote: Quote): Promise<Route> {
    this.validateIntent(intent);

    const chainId = intent.fromToken.chain.id;
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

    return {
      providerId: this.id,
      chain: quote.chain,
      amountIn: quote.amountIn,
      amountOut: quote.amountOut,
      totalCostScore: Number(quote.amountOut),
      executionPlan: {
        type: "evm_swap",
        to: data.tx.to,
        data: data.tx.data,
        value: BigInt(data.tx.value ?? "0"),
      },
    };
  }
}

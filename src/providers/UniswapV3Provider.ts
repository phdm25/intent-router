import { BaseProvider } from "./BaseProvider.js";
import type { Intent, Quote, Route } from "../domain/types";

import {
  UNISWAP_ADDRESSES,
  UNISWAP_FEE_TIERS,
  UNISWAP_QUOTER_V2_ABI,
  UNISWAP_SWAP_ROUTER_02_ABI,
} from "../config/uniswap.js";

import { AppConfig } from "../config/index.js";

import {
  createPublicClient,
  encodeFunctionData,
  http,
  Hex,
  Address,
} from "viem";

// Internal helper type
interface BestQuote {
  fee: number;
  amountOut: bigint;
}

export class UniswapV3Provider extends BaseProvider {
  id = "uniswap-v3" as const;

  private readonly client = createPublicClient({
    chain: AppConfig.network.viemChain,
    transport: http(AppConfig.network.rpcUrl),
  });

  private readonly quoter = UNISWAP_ADDRESSES.QUOTER_V2;
  private readonly router = UNISWAP_ADDRESSES.ROUTER_02;

  supports(intent: Intent): boolean {
    return intent.fromToken.chain.type === "evm";
  }

  async getQuote(intent: Intent): Promise<Quote | null> {
    this.validateIntent(intent);

    let best: BestQuote | null = null;

    for (const fee of UNISWAP_FEE_TIERS) {
      try {
        const data = encodeFunctionData({
          abi: UNISWAP_QUOTER_V2_ABI,
          functionName: "quoteExactInputSingle",
          args: [
            intent.fromToken.address as Address,
            intent.toToken.address as Address,
            fee,
            intent.amountIn,
            0n,
          ],
        });

        const result = await this.client.call({
          to: this.quoter,
          data,
        });

        const amountOut = BigInt(result.data as Hex);

        if (!best || amountOut > best.amountOut) {
          best = { fee, amountOut };
        }
      } catch {
        continue;
      }
    }

    if (!best) return null;

    return {
      providerId: this.id,
      chain: intent.fromToken.chain,
      fromToken: intent.fromToken,
      toToken: intent.toToken,
      amountIn: intent.amountIn,
      amountOut: best.amountOut,
      raw: best,
    };
  }

  async buildRoute(intent: Intent, quote: Quote): Promise<Route> {
    this.validateIntent(intent);

    const raw = quote.raw as BestQuote;
    const slippage = BigInt(intent.maxSlippageBps);

    const minOut = (quote.amountOut * (10_000n - slippage)) / 10_000n;

    const calldata = encodeFunctionData({
      abi: UNISWAP_SWAP_ROUTER_02_ABI,
      functionName: "exactInputSingle",
      args: [
        {
          tokenIn: quote.fromToken.address as Address,
          tokenOut: quote.toToken.address as Address,
          fee: raw.fee,
          recipient: AppConfig.env.EXECUTOR_ADDRESS,
          deadline: BigInt(intent.deadline),
          amountIn: quote.amountIn,
          amountOutMinimum: minOut,
          sqrtPriceLimitX96: 0n,
        },
      ],
    });

    return {
      providerId: this.id,
      chain: quote.chain,
      amountIn: quote.amountIn,
      amountOut: quote.amountOut,
      totalCostScore: Number(quote.amountOut),
      executionPlan: {
        type: "evm_swap",
        to: this.router,
        data: calldata,
        value: 0n,
      },
    };
  }
}

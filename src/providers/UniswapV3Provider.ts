import { BaseProvider } from "./BaseProvider";
import type { Intent, Quote, Route } from "../domain/types";

import {
  UNISWAP_FEE_TIERS,
  UNISWAP_QUOTER_V2_ABI,
  UNISWAP_SWAP_ROUTER_02_ABI,
  getUniswapAddresses,
} from "../config/uniswap";

import { AppConfig } from "../config/index";

import {
  createPublicClient,
  encodeFunctionData,
  http,
  Hex,
  Address,
} from "viem";
import { getChainConfigByRef } from "../config/network";

// Internal helper type
interface BestQuote {
  fee: number;
  amountOut: bigint;
}

/**
 * UniswapV3Provider works only on EVM single-chain swaps.
 */
export class UniswapV3Provider extends BaseProvider {
  id = "uniswap-v3" as const;

  supports(intent: Intent): boolean {
    const isSameChain =
      intent.fromChain.type === intent.toChain.type &&
      intent.fromChain.id === intent.toChain.id;

    const isEvm = intent.fromChain.type === "evm";

    return isEvm && isSameChain;
  }

  async getQuote(intent: Intent): Promise<Quote | null> {
    this.validateIntent(intent);

    const chainRef = intent.fromChain;
    const cfg = getChainConfigByRef(chainRef);
    const { quoterV2 } = getUniswapAddresses(chainRef);

    const client = createPublicClient({
      chain: cfg.viemChain,
      transport: http(cfg.rpcUrl),
    });

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

        const result = await client.call({
          to: quoterV2 as Address,
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
      chain: chainRef,
      fromToken: intent.fromToken,
      toToken: intent.toToken,
      amountIn: intent.amountIn,
      amountOut: best.amountOut,
      raw: best,
    };
  }

  async buildRoute(
    intent: Intent,
    quote: Quote,
    score: number
  ): Promise<Route> {
    this.validateIntent(intent);

    const raw = quote.raw as BestQuote;

    const slippageBps = BigInt(intent.maxSlippageBps);
    const minOut = (quote.amountOut * (10_000n - slippageBps)) / 10_000n;

    const { swapRouter02 } = getUniswapAddresses(quote.chain);

    const calldata = encodeFunctionData({
      abi: UNISWAP_SWAP_ROUTER_02_ABI,
      functionName: "exactInputSingle",
      args: [
        {
          tokenIn: quote.fromToken.address as Address,
          tokenOut: quote.toToken.address as Address,
          fee: raw.fee,
          recipient: AppConfig.env.EXECUTOR_ADDRESS as Address,
          deadline: BigInt(intent.deadline),
          amountIn: quote.amountIn,
          amountOutMinimum: minOut,
          sqrtPriceLimitX96: 0n,
        },
      ],
    });

    const plan = {
      providerId: this.id,
      type: "evm_swap" as const,
      chain: quote.chain,
      to: swapRouter02,
      data: calldata,
      value: 0n,
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

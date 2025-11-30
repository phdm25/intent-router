import { Intent, Token } from "./domain/types";
import { SimpleCostEngine } from "./router/CostEngine";
import { RouterService } from "./router/RouterService";
import type { RouteProvider } from "./router/RouteProvider";

import { EvmChainAdapter } from "./chains/evm/EvmChainAdapter";
import { SimpleExecutionBuilder } from "./execution/ExecutionBuilder";
import { ExecutorService } from "./execution/ExecutorService";

// -------------------------------------------------------------
// Mock Providers (Uniswap & 1inch)
// -------------------------------------------------------------

class MockUniswapProvider implements RouteProvider {
  id = "uniswap-v3";

  supports() {
    return true;
  }

  async getQuote(intent: Intent) {
    return {
      providerId: this.id,
      chain: intent.fromToken.chain,
      fromToken: intent.fromToken,
      toToken: intent.toToken,
      amountIn: intent.amountIn,
      amountOut: (intent.amountIn * 559n) / 1000n, // fake price: 0.559 ETH per 1000 USDC
      raw: { foo: "bar" },
    };
  }

  async buildRoute(intent: Intent, quote: any) {
    return {
      providerId: this.id,
      chain: quote.chain,
      amountIn: quote.amountIn,
      amountOut: quote.amountOut,
      totalCostScore: Number(-quote.amountOut),
      executionPlan: {
        to: "0xUniswapRouterMock",
        data: "0xabcdef",
        value: 0n,
      },
    };
  }
}

class MockOneInchProvider implements RouteProvider {
  id = "1inch";

  supports() {
    return true;
  }

  async getQuote(intent: Intent) {
    return {
      providerId: this.id,
      chain: intent.fromToken.chain,
      fromToken: intent.fromToken,
      toToken: intent.toToken,
      amountIn: intent.amountIn,
      amountOut: (intent.amountIn * 563n) / 1000n, // fake better price: 0.563 ETH
      raw: { tx: "data" },
    };
  }

  async buildRoute(intent: Intent, quote: any) {
    return {
      providerId: this.id,
      chain: quote.chain,
      amountIn: quote.amountIn,
      amountOut: quote.amountOut,
      totalCostScore: Number(-quote.amountOut),
      executionPlan: {
        to: "0xOneInchRouterMock",
        data: "0xdeadbeef",
        value: 0n,
      },
    };
  }
}

// -------------------------------------------------------------
// Setup
// -------------------------------------------------------------

async function main() {
  const chain = { type: "evm", id: 1 } as const;

  const usdc: Token = {
    chain,
    address: "0xUSDC",
    symbol: "USDC",
    decimals: 6,
  };

  const eth: Token = {
    chain,
    address: "0xETH",
    symbol: "ETH",
    decimals: 18,
  };

  const intent: Intent = {
    id: "intent-001",
    fromToken: usdc,
    toToken: eth,
    amountIn: 1000_000000n, // 1000 USDC
    maxSlippageBps: 50,
    executorFeeBps: 20,
    deadline: Math.floor(Date.now() / 1000) + 3600,
  };

  const providers: RouteProvider[] = [
    new MockUniswapProvider(),
    new MockOneInchProvider(),
  ];

  const router = new RouterService(providers, new SimpleCostEngine());
  const executionBuilder = new SimpleExecutionBuilder();

  const adapter = new EvmChainAdapter(chain);
  const executor = new ExecutorService(
    new Map([[`${chain.type}:${chain.id}`, adapter]])
  );

  console.log("\n🔍 Finding best route...");
  const route = await router.findBestRoute(intent);

  console.log("📌 Selected route:", route);

  if (!route) {
    console.log("❌ No route found");
    return;
  }

  console.log("\n🧱 Building transaction...");
  const builtTx = await executionBuilder.build(intent, route);
  console.log("📦 Built Tx:", builtTx);

  console.log("\n🚀 Executing transaction (mock)...");
  const receipt = await executor.execute(builtTx);
  console.log("📄 Tx Receipt:", receipt);
}

main().catch(console.error);

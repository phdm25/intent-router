import { AppConfig } from "./config/index.js";
import { DEMO_INTENT } from "./config/demoIntents.js";

import { RouterService } from "./router/RouterService.js";
import { SimpleCostEngine } from "./router/CostEngine.js";

import { UniswapV3Provider } from "./providers/UniswapV3Provider.js";
import { OneInchProvider } from "./providers/OneInchProvider.js";

import { SimpleExecutionBuilder } from "./execution/ExecutionBuilder.js";
import { ExecutorService } from "./execution/ExecutorService.js";
import { EvmChainAdapter } from "./chains/evm/EvmChainAdapter.js";

async function main() {
  console.log(`🔥 Network: ${AppConfig.network.name}`);
  console.log(`🔗 RPC: ${AppConfig.network.rpcUrl}`);

  // Providers
  const providers = [new UniswapV3Provider(), new OneInchProvider()];

  const router = new RouterService(providers, new SimpleCostEngine());
  const builder = new SimpleExecutionBuilder();

  const chainKey = `${AppConfig.network.chainRef.type}:${AppConfig.network.chainRef.id}`;
  const executor = new ExecutorService(
    new Map([[chainKey, new EvmChainAdapter(AppConfig.network.chainRef)]])
  );

  console.log("\n🔍 Searching route for:", DEMO_INTENT.id);
  const route = await router.findBestRoute(DEMO_INTENT);
  console.log("📌 Best route:", route);

  if (!route) return;

  console.log("\n🧱 Building tx...");
  const built = await builder.build(DEMO_INTENT, route);
  console.log("📦 Built tx:", built);

  console.log("\n🚀 Executing...");
  const result = await executor.execute(built);
  console.log("📄 Execution result:", result);
}

main().catch(console.error);

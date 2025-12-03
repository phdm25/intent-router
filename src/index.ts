import { DEMO_INTENT } from "./config/demoIntents.js";

import { RouterService } from "./router/RouterService.js";
import { SimpleCostEngine } from "./router/CostEngine.js";

import { UniswapV3Provider } from "./providers/UniswapV3Provider.js";
import { OneInchProvider } from "./providers/OneInchProvider.js";

import { MultiStepExecutionBuilder } from "./execution/ExecutionBuilder.js";
import { ExecutorService } from "./execution/ExecutorService.js";

import { privateKeyToAccount } from "viem/accounts";
import { AppConfig } from "./config/index.js";

import { createEvmAdapters } from "./chains/createEvmAdapters.js";

async function main() {
  console.log(`🔥 Active PROFILE: ${AppConfig.env.NETWORK}`);
  console.log(`🌐 Loaded networks:`, Object.keys(AppConfig.networks));

  // 1. Providers
  const providers = [new UniswapV3Provider(), new OneInchProvider()];

  const router = new RouterService(providers, new SimpleCostEngine());
  const builder = new MultiStepExecutionBuilder();

  // 2. Executor — automatic multi-network adapters
  const executorAccount = privateKeyToAccount(
    AppConfig.env.EXECUTOR_PRIVATE_KEY as `0x${string}`
  );

  const adapters = createEvmAdapters(AppConfig.networks, executorAccount);
  const executor = new ExecutorService(adapters);

  console.log("🔗 Registered adapters:", [...adapters.keys()]);

  // 3. Routing
  console.log("\n🔍 Searching route for:", DEMO_INTENT.id);
  const route = await router.findBestRoute(DEMO_INTENT);
  console.log("📌 Best route:", route);

  if (!route) return;

  // 4. Building TX
  const built = await builder.build(DEMO_INTENT, route);
  console.log("\n📦 Built transactions:", built);

  // 5. Execution
  const result = await executor.execute(built);
  console.log("\n🚀 Execution result:", result);
}

main().catch(console.error);

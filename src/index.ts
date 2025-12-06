import { DEMO_INTENT } from "./config/demoIntents.js";

import { RouterService } from "./router/RouterService.js";
import { SimpleCostEngine } from "./router/CostEngine.js";

import { UniswapV3Provider } from "./providers/UniswapV3Provider.js";
import { OneInchProvider } from "./providers/OneInchProvider.js";
import { CctpUsdcBridgeProvider } from "./providers/CctpUsdcBridgeProvider.js";

import { MultiChainExecutionBuilder } from "./execution/ExecutionBuilder.js";
import { ExecutorService } from "./execution/ExecutorService.js";

import { AppConfig } from "./config/index.js";
import { createEvmAdapters } from "./chains/createEvmAdapters.js";

async function main() {
  console.log(`🔥 Active PROFILE: ${AppConfig.env.NETWORK}`);
  console.log(
    `🌐 Loaded networks: ${Object.keys(AppConfig.networks).join(", ")}`
  );

  // ---------------------------------------------------------
  // 1. Initialize Providers (Uniswap, 1inch, CCTP bridge)
  // ---------------------------------------------------------
  const providers = [
    new UniswapV3Provider(),
    new OneInchProvider(),
    new CctpUsdcBridgeProvider(),
  ];

  const router = new RouterService(providers, new SimpleCostEngine());

  // ---------------------------------------------------------
  // 2. Multi-chain adapters
  //    Now only EVM adapters, but extendable to NEAR/SOL/COSMOS
  // ---------------------------------------------------------
  const adapters = createEvmAdapters(
    AppConfig.networks,
    AppConfig.env.EXECUTOR_PRIVATE_KEY as `0x${string}`
  );

  console.log("🔗 Registered chain adapters:", [...adapters.keys()]);

  const builder = new MultiChainExecutionBuilder(adapters);
  const executor = new ExecutorService(adapters);

  // ---------------------------------------------------------
  // 3. Route discovery
  // ---------------------------------------------------------
  console.log(`\n🔍 Searching route for intent: ${DEMO_INTENT.id}`);
  const route = await router.findBestRoute(DEMO_INTENT);

  console.log("📌 Best route discovered:");
  console.dir(route, { depth: 6 });

  if (!route) return;

  // ---------------------------------------------------------
  // 4. Build execution steps (rawTx per chain)
  // ---------------------------------------------------------
  console.log("\n🧱 Building execution steps...");
  const builtSteps = await builder.build(route);

  console.log("📦 Built raw transactions:");
  console.dir(builtSteps, { depth: 6 });

  // ---------------------------------------------------------
  // 5. Execute steps sequentially
  // ---------------------------------------------------------
  console.log("\n🚀 Executing...");
  const receipts = await executor.execute(builtSteps);

  console.log("\n📄 Execution receipts:");
  console.dir(receipts, { depth: 6 });

  console.log("\n🎉 Finished.");
}

main().catch((err) => {
  console.error("❌ Fatal error in main():", err);
});

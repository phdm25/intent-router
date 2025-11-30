// -------------------------------------------------------------
// Demo intent for quick testing
// -------------------------------------------------------------

import type { Intent } from "../domain/types";
import { DEMO_USDC, DEMO_WETH } from "./demoTokens.js";

export const DEMO_INTENT: Intent = {
  id: "intent-demo",
  fromToken: DEMO_USDC,
  toToken: DEMO_WETH,
  amountIn: 1_000_000_000n, // 1000 USDC
  maxSlippageBps: 50,
  executorFeeBps: 20,
  deadline: Math.floor(Date.now() / 1000) + 3600,
};

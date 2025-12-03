import type { Intent } from "../domain/types";
import {
  DEMO_USDC,
  DEMO_USDC_ETH,
  DEMO_WETH,
  DEMO_WETH_ARB,
} from "./demoTokens";

export const DEMO_INTENT: Intent = {
  id: "intent-demo",

  fromToken: DEMO_USDC,
  toToken: DEMO_WETH,

  fromChain: DEMO_USDC.chain,
  toChain: DEMO_WETH.chain,

  amountIn: 1_000_000_000n, // 1000 USDC
  maxSlippageBps: 50,
  executorFeeBps: 20,

  // 1 hour from now
  deadline: Math.floor(Date.now() / 1000) + 3600,

  requiresCrossChain: false,
  payer: "user",
};

export const DEMO_INTENT_CROSSCHAIN: Intent = {
  id: "intent-demo-crosschain",
  fromToken: DEMO_USDC_ETH,
  toToken: DEMO_WETH_ARB,

  fromChain: DEMO_USDC_ETH.chain,
  toChain: DEMO_WETH_ARB.chain,

  amountIn: 500_000_000n, // 500 USDC
  maxSlippageBps: 30,
  executorFeeBps: 20,

  deadline: Math.floor(Date.now() / 1000) + 3600,
  requiresCrossChain: true,
  payer: "user",
};

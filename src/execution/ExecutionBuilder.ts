// -------------------------------------------------------------
// ExecutionBuilder
//
// Converts a Route (logical plan) into a TxRequest (chain-specific
// transaction ready to be submitted).
//
// ExecutionBuilder knows how to interpret route.executionPlan,
// which is provider-specific.
//
// Example:
// - For UniswapV3: build swap calldata via router
// - For 1inch: executionPlan already includes raw tx
//
// In MVP we will implement a simple builder with placeholder logic.
// -------------------------------------------------------------

import type { Intent, Route } from "../domain/types";
import type { TxRequest } from "../chains/ChainAdapter";

export interface BuiltTransaction {
  chain: Route["chain"];
  tx: TxRequest;
}

export interface ExecutionBuilder {
  build(intent: Intent, route: Route): Promise<BuiltTransaction>;
}

// MVP implementation — converts route.executionPlan into a TxRequest.
export class SimpleExecutionBuilder implements ExecutionBuilder {
  async build(intent: Intent, route: Route): Promise<BuiltTransaction> {
    // For MVP we assume executionPlan already contains:
    // { to, data, value }
    const plan = route.executionPlan as {
      to: string;
      data: string;
      value: bigint;
    };

    return {
      chain: route.chain,
      tx: {
        to: plan.to,
        data: plan.data ?? "0x",
        value: plan.value ?? 0n,
      },
    };
  }
}

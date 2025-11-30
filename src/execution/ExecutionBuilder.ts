// -------------------------------------------------------------
// ExecutionBuilder
//
// Converts a high-level Route (output of the router) into
// a TxRequest that can be executed by ChainAdapter.
//
// We assume executionPlan has the following structure for EVM:
// {
//   type: "evm_swap",
//   to: string,
//   data: string,
//   value: bigint
// }
//
// More executionPlan types (bridges, cross-chain, near, solana)
// can be added later.
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

export class SimpleExecutionBuilder implements ExecutionBuilder {
  async build(intent: Intent, route: Route): Promise<BuiltTransaction> {
    const plan = route.executionPlan as {
      type: string;
      to: string;
      data: string;
      value: bigint;
    };

    if (!plan) {
      throw new Error("Execution plan is missing");
    }

    if (plan.type !== "evm_swap") {
      throw new Error(`Unsupported executionPlan type: ${plan.type}`);
    }

    const tx: TxRequest = {
      to: plan.to,
      data: plan.data,
      value: plan.value ?? 0n,
    };

    return {
      chain: route.chain,
      tx,
    };
  }
}

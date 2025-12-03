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
import { ChainRef } from "../domain/chainref.schema";

export interface BuiltTransaction {
  chain: ChainRef;
  tx: TxRequest;
}

export interface ExecutionBuilder {
  build(intent: Intent, route: Route): Promise<BuiltTransaction[]>;
}

export class MultiStepExecutionBuilder implements ExecutionBuilder {
  async build(intent: Intent, route: Route): Promise<BuiltTransaction[]> {
    return route.executionPlans.map((step) => ({
      chain: step.chain,
      tx: {
        to: step.to,
        data: step.data,
        value: step.value,
      },
    }));
  }
}

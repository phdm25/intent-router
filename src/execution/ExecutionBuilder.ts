import type { Route } from "../domain/types";
import type { ExecutionPlan } from "../domain/executionPlan";
import type { ChainAdapter, RawTx } from "../chains/ChainAdapter";
import type { ChainRef } from "../domain/chainref.schema";

export interface BuiltStep {
  plan: ExecutionPlan;
  rawTx: RawTx;
}

/**
 * MultiChainExecutionBuilder walks through all execution plans inside Route
 * and builds chain-specific raw transactions using registered adapters.
 */
export class MultiChainExecutionBuilder {
  constructor(private readonly adapters: Map<string, ChainAdapter>) {}

  private getAdapter(chain: ChainRef): ChainAdapter {
    const key = `${chain.type}:${chain.id}`;
    const adapter = this.adapters.get(key);

    if (!adapter) {
      throw new Error(
        `[ExecutionBuilder] No adapter registered for chain ${key}`
      );
    }

    return adapter;
  }

  async build(route: Route): Promise<BuiltStep[]> {
    const steps: BuiltStep[] = [];

    for (const plan of route.executionPlans) {
      const adapter = this.getAdapter(plan.chain);

      if (!adapter.supports(plan)) {
        throw new Error(
          `[ExecutionBuilder] Adapter for chain ${plan.chain.type}:${plan.chain.id} does not support plan type ${plan.type}`
        );
      }

      const rawTx = await adapter.buildRawTx(plan);
      steps.push({ plan, rawTx });
    }

    return steps;
  }
}

import type { BuiltStep } from "./ExecutionBuilder";
import type { ChainAdapter, TxReceipt } from "../chains/ChainAdapter";
import type { ChainRef } from "../domain/chainref.schema";

/**
 * ExecutorService takes built raw transactions and actually broadcasts them.
 */
export class ExecutorService {
  constructor(private readonly adapters: Map<string, ChainAdapter>) {}

  private getAdapter(chain: ChainRef): ChainAdapter {
    const key = `${chain.type}:${chain.id}`;
    const adapter = this.adapters.get(key);

    if (!adapter) {
      throw new Error(`[Executor] No adapter registered for chain ${key}`);
    }

    return adapter;
  }

  async execute(steps: BuiltStep[]): Promise<TxReceipt[]> {
    const receipts: TxReceipt[] = [];

    for (const step of steps) {
      const adapter = this.getAdapter(step.plan.chain);
      const receipt = await adapter.sendRawTx(step.rawTx);
      receipts.push(receipt);
    }

    return receipts;
  }
}

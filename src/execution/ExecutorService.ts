// -------------------------------------------------------------
// ExecutorService
//
// Executes a BuiltTransaction using the appropriate ChainAdapter.
// Later can support:
// - Multiple chains
// - Execution strategies (private mempool, batching, retry)
// - Solver network / off-chain competition
// -------------------------------------------------------------

import type { BuiltTransaction } from "./ExecutionBuilder";
import type { ChainAdapter, TxReceipt } from "../chains/ChainAdapter";

export class ExecutorService {
  constructor(private readonly adapters: Map<string, ChainAdapter>) {}

  // Identifies the correct ChainAdapter by chainRef
  private getAdapter(
    chainType: string,
    chainId: string | number
  ): ChainAdapter {
    const key = `${chainType}:${chainId}`;
    const adapter = this.adapters.get(key);
    if (!adapter) {
      throw new Error(`No ChainAdapter registered for ${key}`);
    }
    return adapter;
  }

  async execute(txs: BuiltTransaction[]) {
    for (const step of txs) {
      const adapterKey = `${step.chain.type}:${step.chain.id}`;
      const adapter = this.adapters.get(adapterKey);
      if (!adapter) throw new Error(`No adapter for ${adapterKey}`);

      await adapter.sendTransaction(step.tx);
    }
  }
}

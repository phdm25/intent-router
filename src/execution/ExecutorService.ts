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

  async execute(tx: BuiltTransaction): Promise<TxReceipt> {
    const adapter = this.getAdapter(tx.chain.type, tx.chain.id);
    return adapter.sendTransaction(tx.tx);
  }
}

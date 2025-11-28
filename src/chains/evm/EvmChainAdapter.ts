// -------------------------------------------------------------
// EvmChainAdapter
//
// MVP EVM implementation of ChainAdapter.
// For now, this is a lightweight skeleton using simple
// placeholder logic.
//
// Later you can:
// - Inject viem PublicClient + WalletClient
// - Add support for EIP-1559 gas
// - Add batching, retries, private mempool, etc.
// -------------------------------------------------------------

import type { ChainAdapter, TxRequest, TxReceipt } from "../ChainAdapter";
import type { ChainRef } from "../../domain/types";

export class EvmChainAdapter implements ChainAdapter {
  constructor(
    public readonly chain: ChainRef,
    // TODO: inject real viem clients here
    private readonly dummySender: string = "0x0000000000000000000000000000000000000000"
  ) {}

  async estimateGas(tx: TxRequest): Promise<bigint> {
    // Placeholder logic — replace with viem.estimateGas()
    console.log(`[EvmChainAdapter] estimateGas() called for ${tx.to}`);
    return 200000n;
  }

  async getGasPrice(): Promise<bigint> {
    // Placeholder — replace with viem.getGasPrice()
    return 30_000_000_000n;
  }

  async sendTransaction(tx: TxRequest): Promise<TxReceipt> {
    // Placeholder — replace with wallet.sendTransaction()
    console.log(`[EvmChainAdapter] sendTransaction() → dummy execution`);
    const mockHash = "0x" + Math.random().toString(16).slice(2).padEnd(64, "0");
    return {
      txHash: mockHash,
      success: true,
      blockNumber: 123456,
    };
  }
}

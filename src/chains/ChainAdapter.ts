// -------------------------------------------------------------
// ChainAdapter Interface
//
// Abstracts blockchain-specific operations such as:
// - Sending a transaction
// - Estimating gas
// - Fetching gas price
//
// Multiple implementations:
// - EvmChainAdapter (MVP)
// - NearChainAdapter (future)
// - SolanaChainAdapter (future)
//
// The rest of the system interacts with ChainAdapter without
// knowing anything about the underlying chain.
// -------------------------------------------------------------

import type { ChainRef } from "../domain/types";

export interface TxRequest {
  to: string;
  data: string;
  value: bigint;
}

export interface TxReceipt {
  hash: `0x${string}`;
  blockNumber: bigint;
  status: "success" | "reverted";
  gasUsed: bigint;
}

export interface ChainAdapter {
  readonly chain: ChainRef;

  estimateGas(tx: TxRequest): Promise<bigint>;
  getGasPrice(): Promise<bigint>;

  // Sends a raw transaction and returns its receipt.
  sendTransaction(tx: TxRequest): Promise<TxReceipt>;
}

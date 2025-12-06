import type { ChainRef } from "../domain/chainref.schema";
import type { ExecutionPlan } from "../domain/executionPlan";

export interface TxReceipt {
  hash: string;
  status: "success" | "reverted";
  blockNumber?: bigint;
  gasUsed?: bigint;
}

// RawTx is intentionally abstract. Each adapter defines its own shape.
export type RawTx = unknown;

/**
 * ChainAdapter is responsible for turning an ExecutionPlan into a real
 * blockchain transaction (build + send) for a specific chain family.
 */
export interface ChainAdapter {
  readonly chain: ChainRef;

  /**
   * Whether this adapter can handle the given execution plan.
   * For example EVM adapter will check plan.chain.type === "evm"
   * and plan.type is one of the EVM-specific types.
   */
  supports(plan: ExecutionPlan): boolean;

  /**
   * Build a chain-specific raw transaction from execution plan.
   */
  buildRawTx(plan: ExecutionPlan): Promise<RawTx>;

  /**
   * Broadcast raw transaction to the network and return receipt.
   */
  sendRawTx(raw: RawTx): Promise<TxReceipt>;
}

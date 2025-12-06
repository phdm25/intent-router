import type { ChainAdapter, RawTx, TxReceipt } from "../ChainAdapter";
import type { ChainRef } from "../../domain/chainref.schema";
import type { ExecutionPlan, EvmCallPlan } from "../../domain/executionPlan";

import { createPublicClient, createWalletClient, http, type Chain } from "viem";
import { privateKeyToAccount, type Account } from "viem/accounts";
import { getChainConfigByRef } from "../../config/network";

export interface EvmRawTx {
  to: `0x${string}`;
  data: `0x${string}`;
  value: bigint;
}

/**
 * EvmChainAdapter knows how to execute EVM-specific execution plans.
 */
export class EvmChainAdapter implements ChainAdapter {
  public readonly chain: ChainRef;

  private readonly publicClient;
  private readonly walletClient;
  private readonly account: Account;

  constructor(chainRef: ChainRef, privateKey: `0x${string}`) {
    this.chain = chainRef;

    const cfg = getChainConfigByRef(chainRef);
    const viemChain = cfg.viemChain as Chain;

    this.account = privateKeyToAccount(privateKey);

    this.publicClient = createPublicClient({
      chain: viemChain,
      transport: http(cfg.rpcUrl),
    });

    this.walletClient = createWalletClient({
      chain: viemChain,
      transport: http(cfg.rpcUrl),
      account: this.account,
    });
  }

  supports(plan: ExecutionPlan): boolean {
    return (
      plan.chain.type === "evm" &&
      ["evm_swap", "evm_bridge", "evm_approve", "evm_unwrap"].includes(
        plan.type
      )
    );
  }

  async buildRawTx(plan: ExecutionPlan): Promise<RawTx> {
    if (!this.supports(plan)) {
      throw new Error(
        `[EvmChainAdapter] Plan not supported for chain ${this.chain.type}:${this.chain.id}`
      );
    }

    const evmPlan = plan as EvmCallPlan;

    const raw: EvmRawTx = {
      to: evmPlan.to as `0x${string}`,
      data: evmPlan.data as `0x${string}`,
      value: evmPlan.value,
    };

    return raw;
  }

  async sendRawTx(raw: RawTx): Promise<TxReceipt> {
    const tx = raw as EvmRawTx;

    const hash = await this.walletClient.sendTransaction({
      to: tx.to,
      data: tx.data,
      value: tx.value,
    });

    const receipt = await this.publicClient.waitForTransactionReceipt({ hash });

    return {
      hash,
      blockNumber: receipt.blockNumber,
      status: receipt.status === "success" ? "success" : "reverted",
      gasUsed: receipt.gasUsed,
    };
  }
}

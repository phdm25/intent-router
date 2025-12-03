import type { TxRequest, TxReceipt, ChainAdapter } from "../ChainAdapter";
import type { ChainRef } from "../../domain/types.js";
import type { Chain, Account } from "viem";

import { createWalletClient, createPublicClient, http } from "viem";

export class EvmChainAdapter implements ChainAdapter {
  private readonly publicClient;
  private readonly walletClient;

  /**
   * @param chain - internal chain reference in your own DSL  (e.g. { type: "evm", id: 42161 })
   * @param viemChain - VIEM Chain object (e.g. arbitrum, mainnet, optimism)
   * @param rpcUrl - network RPC url
   * @param account - executor EVM account
   */
  constructor(
    public readonly chain: ChainRef,
    private readonly viemChain: Chain,
    private readonly rpcUrl: string,
    private readonly account: Account
  ) {
    // Public client for reads + gas estimation
    this.publicClient = createPublicClient({
      chain: viemChain,
      transport: http(rpcUrl),
    });

    // Wallet client for sending transactions
    this.walletClient = createWalletClient({
      chain: viemChain,
      transport: http(rpcUrl),
      account,
    });
  }

  // ----------------------------------------------------------------------
  // 1) Estimate gas
  // ----------------------------------------------------------------------
  async estimateGas(tx: TxRequest): Promise<bigint> {
    return await this.publicClient.estimateGas({
      account: this.account.address,
      to: tx.to,
      data: tx.data,
      value: tx.value,
    });
  }

  // ----------------------------------------------------------------------
  // 2) Gas price (EIP-1559 or legacy)
  // ----------------------------------------------------------------------
  async getGasPrice(): Promise<bigint> {
    return await this.publicClient.getGasPrice();
  }

  // ----------------------------------------------------------------------
  // 3) Send transaction (correct multi-chain support)
  // ----------------------------------------------------------------------
  async sendTransaction(tx: TxRequest): Promise<TxReceipt> {
    // 👉 IMPORTANT: chain MUST be viemChain from constructor
    const hash = await this.walletClient.sendTransaction({
      chain: this.viemChain,
      account: this.account,
      to: tx.to as `0x${string}`,
      data: tx.data as `0x${string}`,
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

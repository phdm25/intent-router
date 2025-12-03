import { ChainConfig } from "../config/network";
import { EvmChainAdapter } from "./evm/EvmChainAdapter";
import type { Account } from "viem";

export function createEvmAdapters(
  networks: Record<string, ChainConfig>,
  account: Account
) {
  const adapters = new Map();

  for (const key of Object.keys(networks)) {
    const cfg = networks[key];

    // only add EVM chains (future-proof)
    if (cfg.chainRef.type !== "evm") continue;

    adapters.set(
      `${cfg.chainRef.type}:${cfg.chainRef.id}`,
      new EvmChainAdapter(cfg.chainRef, cfg.viemChain, cfg.rpcUrl, account)
    );
  }

  return adapters;
}

import { ChainConfig } from "../config/network";
import { ChainAdapter } from "./ChainAdapter";
import { EvmChainAdapter } from "./evm/EvmChainAdapter";

/**
 * Creates a map of EVM chain adapters.
 *
 * Key format: "evm:<chainId>"
 * Example: "evm:1", "evm:42161"
 */
export function createEvmAdapters(
  networks: Record<string, ChainConfig>,
  privateKey: `0x${string}`
): Map<string, ChainAdapter> {
  const adapters = new Map<string, ChainAdapter>();

  for (const key of Object.keys(networks)) {
    const cfg = networks[key];

    // Only include EVM networks
    if (cfg.chainRef.type !== "evm") continue;

    const mapKey = `${cfg.chainRef.type}:${cfg.chainRef.id}`;

    adapters.set(mapKey, new EvmChainAdapter(cfg.chainRef, privateKey));
  }

  return adapters;
}

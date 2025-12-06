import { z } from "zod";
import { Env } from "./env";
import { mainnet, sepolia, arbitrum, arbitrumSepolia } from "viem/chains";
import { ChainRefSchema } from "../domain/chainref.schema";

// Zod schema for chain config
const ChainConfigSchema = z.object({
  name: z.string(),
  chainRef: ChainRefSchema,
  rpcUrl: z.string().url(),
  viemChain: z.any(),

  uniswap: z.object({
    quoterV2: z.string(),
    swapRouter02: z.string(),
  }),
});

// ----------------------
// MAINNET
// ----------------------
const mainnetConfig = ChainConfigSchema.parse({
  name: "mainnet",
  chainRef: { type: "evm", id: 1 },
  rpcUrl: Env.RPC_URL_MAINNET,
  viemChain: mainnet,
  uniswap: {
    quoterV2: "0x61fFE014bA17961cD3B04a57b78B5471eE14F423",
    swapRouter02: "0x68B3465833fb72A70ecDF485E0e4C7bD8665Fc45",
  },
});

// ----------------------
// TESTNET (Sepolia)
// ----------------------
const testnetConfig = ChainConfigSchema.parse({
  name: "testnet",
  chainRef: { type: "evm", id: 11155111 },
  rpcUrl: Env.RPC_URL_TESTNET ?? "",
  viemChain: sepolia,
  uniswap: {
    quoterV2: "0x0000000000000000000000000000000000000000",
    swapRouter02: "0x0000000000000000000000000000000000000000",
  },
});

// ----------------------
// ARBITRUM MAINNET
// ----------------------
const arbitrumConfig = ChainConfigSchema.parse({
  name: "arbitrum",
  chainRef: { type: "evm", id: 42161 },
  rpcUrl: Env.RPC_URL_ARBITRUM,
  viemChain: arbitrum,
  uniswap: {
    quoterV2: "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6",
    swapRouter02: "0x68B3465833fb72A70ecDF485E0e4C7bD8665Fc45",
  },
});

// ----------------------
// ARBITRUM TESTNET (Sepolia)
// ----------------------
const arbitrumTestnetConfig = ChainConfigSchema.parse({
  name: "arbitrum-testnet",
  chainRef: { type: "evm", id: 421614 },
  rpcUrl: Env.RPC_URL_ARBITRUM_TESTNET,
  viemChain: arbitrumSepolia,
  uniswap: {
    quoterV2: "0x0000000000000000000000000000000000000000",
    swapRouter02: "0x0000000000000000000000000000000000000000",
  },
});

// All networks
export const Networks = {
  mainnet: mainnetConfig,
  testnet: testnetConfig,
  arbitrum: arbitrumConfig,
  "arbitrum-testnet": arbitrumTestnetConfig,
};

export type ChainConfig = z.infer<typeof ChainConfigSchema>;

// -----------------------------------------------------
// 🔥 getChainConfigByRef — the function you need
// -----------------------------------------------------
export function getChainConfigByRef(
  chainRef: z.infer<typeof ChainRefSchema>
): ChainConfig {
  const cfg = Object.values(Networks).find(
    (n) => n.chainRef.type === chainRef.type && n.chainRef.id === chainRef.id
  );

  if (!cfg) {
    throw new Error(
      `[Networks] No ChainConfig found for chain ${chainRef.type}:${chainRef.id}`
    );
  }

  return cfg;
}

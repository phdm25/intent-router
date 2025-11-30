import { z } from "zod";
import { Env } from "./env";
import { mainnet, sepolia } from "viem/chains";
import { ChainRefSchema } from "../domain/chainref.schema";

// Zod schema for a single chain config
const ChainConfigSchema = z.object({
  name: z.string(),
  chainRef: ChainRefSchema,
  rpcUrl: z.string().url(),

  // viem chain object (we treat it as `any`, but validate existence)
  viemChain: z.any(),

  // Dex contracts
  uniswap: z.object({
    quoterV2: z.string(),
    swapRouter02: z.string(),
  }),
});

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

const testnetConfig = ChainConfigSchema.parse({
  name: "testnet",
  chainRef: { type: "evm", id: 11155111 }, // Sepolia
  rpcUrl: Env.RPC_URL_TESTNET ?? "",
  viemChain: sepolia,
  uniswap: {
    quoterV2: "0x0000000000000000000000000000000000000000", // placeholder
    swapRouter02: "0x0000000000000000000000000000000000000000",
  },
});

export const Networks = {
  mainnet: mainnetConfig,
  testnet: testnetConfig,
};

export const SelectedNetwork = Networks[Env.NETWORK];

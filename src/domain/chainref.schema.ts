import { z } from "zod";

export const ChainRefSchema = z.object({
  type: z.enum(["evm", "near", "solana", "cosmos"]),
  // For EVM: numeric chainId, for others we can use string IDs
  id: z.union([z.number().int(), z.string()]),
});

export type ChainRef = z.infer<typeof ChainRefSchema>;

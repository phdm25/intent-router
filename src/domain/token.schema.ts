import { ChainRefSchema } from "./chainref.schema";
import { z } from "zod";

export const TokenSchema = z.object({
  chain: ChainRefSchema,
  address: z.string().min(1),
  symbol: z.string().min(1),
  decimals: z.number().int().positive(),
});

export type Token = z.output<typeof TokenSchema>;

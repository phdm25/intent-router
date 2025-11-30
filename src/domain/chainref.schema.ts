import { z } from "zod";

export const ChainRefSchema = z.object({
  type: z.literal("evm"),
  id: z.number(),
});

export type ChainRef = z.output<typeof ChainRefSchema>;

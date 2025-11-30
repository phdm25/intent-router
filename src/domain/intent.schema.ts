import { z } from "zod";
import { TokenSchema } from "./token.schema";

export const IntentSchema = z.object({
  id: z.string(),
  fromToken: TokenSchema,
  toToken: TokenSchema,
  amountIn: z.bigint().positive(),
  maxSlippageBps: z.number().int().min(0),
  deadline: z.number().int().positive(),
  executorFeeBps: z.number().int().min(0),
  payer: z.enum(["user", "executor"]).optional(),
  signature: z.string().optional(),
});

export type IntentInput = z.input<typeof IntentSchema>;
export type Intent = z.output<typeof IntentSchema>;

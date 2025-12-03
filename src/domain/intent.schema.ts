import { z } from "zod";
import { TokenSchema } from "./token.schema";
import { ChainRefSchema } from "./chainref.schema";

export const IntentSchema = z.object({
  id: z.string(),

  fromToken: TokenSchema,
  toToken: TokenSchema,

  /** Amount to swap/bridge */
  amountIn: z.bigint().positive(),

  /** Slippage per swap */
  maxSlippageBps: z.number().int().min(0),

  /** Overall execution deadline for all steps */
  deadline: z.number().int().positive(),

  /** Executor compensation */
  executorFeeBps: z.number().int().min(0),

  /** This is KEY for cross-chain */
  fromChain: ChainRefSchema,
  toChain: ChainRefSchema,

  /** Optional hint: router can decide alone */
  requiresCrossChain: z.boolean().default(false),

  /** gas payer */
  payer: z.enum(["user", "executor"]).optional(),

  /** signature of intent */
  signature: z.string().optional(),
});

export type IntentInput = z.input<typeof IntentSchema>;
export type Intent = z.output<typeof IntentSchema>;

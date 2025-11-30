import { z } from "zod";

export const EvmSwapPlanSchema = z.object({
  type: z.literal("evm_swap"),
  to: z.string(),
  data: z.string(),
  value: z.bigint(),
});

export type EvmSwapPlan = z.output<typeof EvmSwapPlanSchema>;

export type ExecutionPlan = EvmSwapPlan;

export const ExecutionPlanSchema = EvmSwapPlanSchema;

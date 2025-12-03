import { z } from "zod";
import { ChainRefSchema } from "./chainref.schema";

export const EvmSwapPlanSchema = z.object({
  type: z.literal("evm_swap"),
  chain: ChainRefSchema,
  to: z.string(),
  data: z.string(),
  value: z.bigint(),
});

export const EvmBridgePlanSchema = z.object({
  type: z.literal("evm_bridge"),
  chain: ChainRefSchema,
  to: z.string(),
  data: z.string(),
  value: z.bigint(),
});

export const EvmApprovePlanSchema = z.object({
  type: z.literal("evm_approve"),
  chain: ChainRefSchema,
  to: z.string(),
  data: z.string(),
  value: z.bigint(),
});

export const EvmUnwrapPlanSchema = z.object({
  type: z.literal("evm_unwrap"),
  chain: ChainRefSchema,
  to: z.string(),
  data: z.string(),
  value: z.bigint(),
});

export const ExecutionPlanSchema = z.union([
  EvmSwapPlanSchema,
  EvmBridgePlanSchema,
  EvmApprovePlanSchema,
  EvmUnwrapPlanSchema,
]);

export type ExecutionPlan = z.output<typeof ExecutionPlanSchema>;

import { z } from "zod";
import { ChainRefSchema } from "./chainref.schema";

export const ExecutionPlanBaseSchema = z.object({
  chain: ChainRefSchema,
  type: z.string(),
  providerId: z.string(),
});

// ------------------------
// EVM actions
// ------------------------
export const EvmCallPlanSchema = ExecutionPlanBaseSchema.extend({
  type: z.enum(["evm_swap", "evm_bridge", "evm_approve", "evm_unwrap"]),
  to: z.string(),
  data: z.string(),
  value: z.bigint(),
});

// ------------------------
// NEAR actions (future)
// ------------------------
export const NearFunctionCallPlanSchema = ExecutionPlanBaseSchema.extend({
  type: z.literal("near_function_call"),
  contractId: z.string(),
  methodName: z.string(),
  args: z.record(z.unknown()),
  gas: z.string(), // yocto gas
  deposit: z.string(), // yocto deposit
});

// ------------------------
// Solana actions (future)
// ------------------------
export const SolanaInstructionPlanSchema = ExecutionPlanBaseSchema.extend({
  type: z.literal("solana_instruction"),
  programId: z.string(),
  // Simplified representation; real adapter can map this to proper Solana types
  accounts: z.array(z.record(z.unknown())),
  data: z.string(), // base64 or hex
});

// ------------------------
// Cosmos actions (future)
// ------------------------
export const CosmosMsgPlanSchema = ExecutionPlanBaseSchema.extend({
  type: z.literal("cosmos_msg"),
  msg: z.record(z.unknown()),
});

// Union of all plans
export const ExecutionPlanSchema = z.union([
  EvmCallPlanSchema,
  NearFunctionCallPlanSchema,
  SolanaInstructionPlanSchema,
  CosmosMsgPlanSchema,
]);

export type ExecutionPlan = z.infer<typeof ExecutionPlanSchema>;
export type EvmCallPlan = z.infer<typeof EvmCallPlanSchema>;

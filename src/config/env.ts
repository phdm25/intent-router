import { z } from "zod";
import { loadEnv } from "./envLoader";

// Load env from .env
loadEnv();

// Global env validation schema
const EnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  // API keys
  ONEINCH_API_KEY: z.string().min(1, "ONEINCH_API_KEY is required"),

  // Network selection
  NETWORK: z.enum(["mainnet", "testnet"]).default("mainnet"),

  // RPC URLs
  RPC_URL_MAINNET: z.string().url("RPC_URL_MAINNET must be a valid URL"),
  RPC_URL_TESTNET: z
    .string()
    .url("RPC_URL_TESTNET must be a valid URL")
    .optional(),

  // Executor wallet
  EXECUTOR_ADDRESS: z.string().min(1, "EXECUTOR_ADDRESS is required"),

  // App port (if running HTTP API)
  PORT: z.string().default("3000").transform(Number),
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  const errorTree = z.treeifyError(parsed.error);
  console.error("❌ Invalid environment variables:\n", errorTree);
  process.exit(1);
}

export const Env = parsed.data;

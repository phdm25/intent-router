import { z } from "zod";
import { loadEnv } from "./envLoader";

// Load env from .env
loadEnv();

const EnvSchema = z
  .object({
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),

    ONEINCH_API_KEY: z.string().min(1, "ONEINCH_API_KEY is required"),

    NETWORK: z.enum(["mainnet", "testnet"]).default("mainnet"),

    RPC_URL_MAINNET: z.url({ message: "RPC_URL_MAINNET must be a valid URL" }),

    // testnet can be optional until validated conditionally
    RPC_URL_TESTNET: z.string().optional(),
    RPC_URL_ARBITRUM_TESTNET: z.string().optional(),

    RPC_URL_ARBITRUM: z.url({
      message: "RPC_URL_ARBITRUM must be a valid URL",
    }),

    PORT: z.string().default("3000").transform(Number),

    EXECUTOR_PRIVATE_KEY: z
      .string()
      .startsWith("0x")
      .length(66, "Private key must be 32 bytes + 0x"),

    EXECUTOR_ADDRESS: z
      .string()
      .startsWith("0x")
      .length(42, "Invalid EVM address"),
  })
  .superRefine((env, ctx) => {
    const isDev = env.NODE_ENV === "development" || env.NODE_ENV === "test";

    if (isDev) {
      // validate testnet URLs
      if (!env.RPC_URL_TESTNET) {
        ctx.addIssue({
          code: "custom",
          message: "RPC_URL_TESTNET is required in development/test",
          path: ["RPC_URL_TESTNET"],
        });
      } else {
        // validate as URL
        const urlCheck = z.url().safeParse(env.RPC_URL_TESTNET);
        if (!urlCheck.success) {
          ctx.addIssue({
            code: "custom",
            message: "RPC_URL_TESTNET must be a valid URL",
            path: ["RPC_URL_TESTNET"],
          });
        }
      }

      if (!env.RPC_URL_ARBITRUM_TESTNET) {
        ctx.addIssue({
          code: "custom",
          message: "RPC_URL_ARBITRUM_TESTNET is required in development/test",
          path: ["RPC_URL_ARBITRUM_TESTNET"],
        });
      } else {
        const urlCheck = z.url().safeParse(env.RPC_URL_ARBITRUM_TESTNET);
        if (!urlCheck.success) {
          ctx.addIssue({
            code: "custom",
            message: "RPC_URL_ARBITRUM_TESTNET must be a valid URL",
            path: ["RPC_URL_ARBITRUM_TESTNET"],
          });
        }
      }
    }
  });

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  const errorTree = z.treeifyError(parsed.error);
  console.error("❌ Invalid environment variables:\n", errorTree);
  process.exit(1);
}

export const Env = parsed.data;

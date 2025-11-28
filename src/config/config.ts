import { z } from "zod";
import { loadEnv } from "./env.js";

loadEnv();

const EnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  //   ONEINCH_API_KEY: z.string().min(1, "ONEINCH_API_KEY is required"),
  PORT: z.string().transform(Number).default("3000"),
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const config = parsed.data;

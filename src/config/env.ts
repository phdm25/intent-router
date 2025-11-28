import fs from "fs";
import path from "path";
import dotenv from "dotenv";

function loadEnvFile(file: string) {
  const full = path.resolve(process.cwd(), file);
  if (fs.existsSync(full)) {
    dotenv.config({ path: full });
  }
}

export function loadEnv() {
  const env = process.env.NODE_ENV || "development";

  if (env === "development") {
    // Primary source
    loadEnvFile(".env.local");

    // Fallback template
    loadEnvFile(".env");
    return;
  }

  if (env === "production") {
    loadEnvFile(".env.prod");
    loadEnvFile(".env");
    return;
  }

  if (env === "test") {
    loadEnvFile(".env.test");
    loadEnvFile(".env");
    return;
  }
}

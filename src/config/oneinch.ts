// -------------------------------------------------------------
// 1inch API Configuration
// Centralized for flexibility
// -------------------------------------------------------------

import { AppConfig } from "./index.js";

export const ONEINCH_API_BASE = "https://api.1inch.dev/swap/v5.2";

export const ONEINCH_API_KEY = AppConfig.env.ONEINCH_API_KEY;

export const ONEINCH_HEADERS = {
  Authorization: `Bearer ${ONEINCH_API_KEY}`,
};

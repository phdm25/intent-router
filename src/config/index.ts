import { Env } from "./env.js";
import { Networks } from "./network";

export const AppConfig = {
  env: Env,
  networks: Networks,
  activeNetwork: Networks[Env.NETWORK],
};

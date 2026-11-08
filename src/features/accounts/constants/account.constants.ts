import type { Account } from "../types/account.types";

export const DEFAULT_ACCOUNT = {
  name: "Bolsillo",
  default: true,
} as const satisfies Omit<Account, "user_id">;

export const DEFAULT_ACCOUNT_ID_PREFIX = "default-";

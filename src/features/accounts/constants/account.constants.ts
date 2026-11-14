import type { Account } from "../types/account.types";

export const ACCOUNTS_COLLECTION = "accounts";

export const ACCOUNT_NAME_MAX_LENGTH = 40;

export const DEFAULT_ACCOUNT = {
  name: "Bolsillo",
  default: true,
} as const satisfies Omit<Account, "user_id">;

export const DEFAULT_ACCOUNT_ID_PREFIX = "default-";

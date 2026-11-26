import type { Account, ComparisonPeriod } from "../types/account.types";

export const ACCOUNTS_COLLECTION = "accounts";

export const ACCOUNT_NAME_MAX_LENGTH = 40;

export const DEFAULT_ACCOUNT = {
  name: "Bolsillo",
  default: true,
} as const satisfies Omit<Account, "user_id">;

export const DEFAULT_ACCOUNT_ID_PREFIX = "default-";

export const ACCOUNTS_PATH = "/cuentas";

export const getAccountDetailPath = (accountId: string): string =>
  `${ACCOUNTS_PATH}/${encodeURIComponent(accountId)}`;

export const MIN_MOVEMENTS_FOR_EVOLUTION = 2;

export const CURRENT_BALANCE_SHORT_LABEL = "Hoy";

export const BALANCE_COMPARISON_PERIODS: readonly ComparisonPeriod[] = [
  { key: "yesterday", label: "Ayer", shortLabel: "Ayer", offset: { days: 1 } },
  { key: "week", label: "Hace una semana", shortLabel: "Semana", offset: { days: 7 } },
  { key: "month", label: "Hace un mes", shortLabel: "Mes", offset: { months: 1 } },
  { key: "year", label: "Hace un año", shortLabel: "Año", offset: { years: 1 } },
];

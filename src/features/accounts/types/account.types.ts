import type { TransactionType } from "@/domain";

export type Account = {
  id?: string;
  user_id: string;
  name: string;
  default: boolean;
};

export type AccountDoc = Account & { id: string };

export type CreateAccountInput = Pick<Account, "name">;

// Movimiento (gasto o ingreso) ya resuelto para los cálculos de saldo.
export type AccountMovement = {
  id: string;
  name: string;
  type: TransactionType;
  amount: number;
  date: Date;
};

export type BalancePoint = {
  /** Día local en formato YYYY-MM-DD. */
  dayKey: string;
  date: Date;
  /** Saldo acumulado al final del día. */
  balance: number;
};

export type PeriodOffset = {
  days?: number;
  months?: number;
  years?: number;
};

export type ComparisonPeriodKey = "yesterday" | "week" | "month" | "year";

export type ComparisonPeriod = {
  key: ComparisonPeriodKey;
  label: string;
  shortLabel: string;
  offset: PeriodOffset;
};

export type BalanceComparison = {
  key: ComparisonPeriodKey;
  label: string;
  shortLabel: string;
  date: Date;
  balance: number;
  /** Variación porcentual frente al saldo actual; null si el saldo anterior es 0. */
  variation: number | null;
};

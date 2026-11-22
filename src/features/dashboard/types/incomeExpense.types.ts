import type { DateRange } from "@/domain";

/** Valores de los inputs de fecha ("YYYY-MM-DD"), ambos inclusivos. */
export interface DateRangeInput {
  from: string;
  to: string;
}

export type DateRangeValidation =
  | { ok: true; range: DateRange }
  | { ok: false; error: string };

export type LoadErrorKind = "offline" | "session" | "server";

export interface IncomeExpenseTotals {
  expense: number;
  income: number;
  /** Gastos ÷ ingresos × 100. null si no hay ingresos. */
  expenseShare: number | null;
}

export interface MonthlyIncomeExpense extends IncomeExpenseTotals {
  /** Mes local en formato YYYY-MM. */
  monthKey: string;
  monthStart: Date;
}

export interface IncomeExpenseSummary {
  months: MonthlyIncomeExpense[];
  total: IncomeExpenseTotals;
  movementCount: number;
}

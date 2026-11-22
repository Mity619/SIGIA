// Gastos frente a ingresos por mes y en total (HU-20). Funciones puras: sin React ni Firebase.
// Fórmula: % de gastos sobre ingresos = gastos del periodo ÷ ingresos del periodo × 100.
import {
  excludeArchived,
  fromCents,
  isInRange,
  percentage,
  resolveEntryType,
  toCents,
  type DateRange,
  type DomainEntry,
  type TransactionType,
} from "@/domain";
import type {
  IncomeExpenseSummary,
  IncomeExpenseTotals,
  MonthlyIncomeExpense,
} from "../types/incomeExpense.types";

type CentsByType = Record<TransactionType, number>;

/** Mes local en formato YYYY-MM. */
export const toMonthKey = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

/** Primer día de cada mes que toca el rango [from, to), en orden. */
export const listMonthStarts = (range: DateRange): Date[] => {
  const lastDay = new Date(range.to.getTime() - 1);
  const months: Date[] = [];
  let cursor = new Date(range.from.getFullYear(), range.from.getMonth(), 1);

  while (cursor.getTime() <= lastDay.getTime()) {
    months.push(cursor);
    cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
  }
  return months;
};

const toTotals = ({ expense, income }: CentsByType): IncomeExpenseTotals => ({
  expense: fromCents(expense),
  income: fromCents(income),
  expenseShare: percentage(fromCents(expense), fromCents(income)),
});

/**
 * Agrupa los movimientos del rango por mes. Todos los meses del rango aparecen,
 * aunque no tengan movimientos (en 0). Los conceptos archivados no cuentan (HU-06)
 * y los movimientos cuyo tipo no se puede resolver se ignoran.
 */
export const buildIncomeExpenseSummary = (
  entries: readonly DomainEntry[],
  itemTypeById: ReadonlyMap<string, TransactionType>,
  archivedItemIds: ReadonlySet<string>,
  range: DateRange,
): IncomeExpenseSummary => {
  const monthStarts = listMonthStarts(range);
  const centsByMonth = new Map<string, CentsByType>(
    monthStarts.map((month) => [toMonthKey(month), { expense: 0, income: 0 }]),
  );
  const totalCents: CentsByType = { expense: 0, income: 0 };
  let movementCount = 0;

  for (const entry of excludeArchived([...entries], archivedItemIds)) {
    if (!isInRange(entry.date, range)) continue;
    const type = resolveEntryType(entry, itemTypeById);
    const month = centsByMonth.get(toMonthKey(entry.date));
    if (!type || !month) continue;

    const cents = toCents(entry.amount);
    month[type] += cents;
    totalCents[type] += cents;
    movementCount += 1;
  }

  const months: MonthlyIncomeExpense[] = monthStarts.map((monthStart) => {
    const monthKey = toMonthKey(monthStart);
    return { monthKey, monthStart, ...toTotals(centsByMonth.get(monthKey)!) };
  });

  return { months, total: toTotals(totalCents), movementCount };
};

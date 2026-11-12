// Fórmulas de negocio (documento organizacional §5.1). Ver docs/epica-3-consulta.md.
import { sumAmounts, percentage, toCents, fromCents } from "./money";
import { isInRange, monthRange, yearRange, type DateRange } from "./period";
import type { DomainEntry, DomainItem, Frequency, TransactionType } from "./types";

/** Factor anual por frecuencia. `eventual` no tiene factor: se usa la suma real del año. */
export const ANNUAL_FACTOR: Record<Exclude<Frequency, "eventual">, number> = {
  daily: 365,
  weekly: 52,
  monthly: 12,
  annual: 1,
};

/** Tipo del movimiento; si no lo tiene (datos antiguos) se toma del concepto. */
export const resolveEntryType = (
  entry: DomainEntry,
  itemTypeById: ReadonlyMap<string, TransactionType>,
): TransactionType | undefined => entry.type ?? itemTypeById.get(entry.itemId);

/**
 * Quita los movimientos de conceptos eliminados (archivados, HU-06).
 * Decisión de producto: el historial se conserva en la base de datos, pero ya no
 * cuenta en totales, porcentajes ni gráficas.
 */
export const excludeArchived = (
  entries: DomainEntry[],
  archivedItemIds: ReadonlySet<string>,
): DomainEntry[] =>
  archivedItemIds.size === 0 ? entries : entries.filter((e) => !archivedItemIds.has(e.itemId));

/** Suma de montos de los movimientos dentro del rango. */
export const sumInRange = (entries: DomainEntry[], range: DateRange): number =>
  sumAmounts(entries.filter((e) => isInRange(e.date, range)).map((e) => e.amount));

/** Total de gastos e ingresos del rango. */
export const totalsByType = (
  entries: DomainEntry[],
  itemTypeById: ReadonlyMap<string, TransactionType>,
  range: DateRange,
): Record<TransactionType, number> => {
  const inRange = entries.filter((e) => isInRange(e.date, range));
  const of = (type: TransactionType) =>
    sumAmounts(inRange.filter((e) => resolveEntryType(e, itemTypeById) === type).map((e) => e.amount));
  return { expense: of("expense"), income: of("income") };
};

/**
 * Gasto anual proyectado (§5.1):
 *  - frecuencia periódica: último monto × factor (diario 365, semanal 52, mensual 12, anual 1)
 *  - eventual: suma real de sus movimientos en el año de `referenceDate`
 */
export const annualProjection = (
  item: Pick<DomainItem, "frequency" | "lastAmount">,
  itemEntries: DomainEntry[],
  referenceDate: Date,
): number => {
  if (item.frequency === "eventual") {
    return sumInRange(itemEntries, yearRange(referenceDate));
  }
  return fromCents(toCents(item.lastAmount) * ANNUAL_FACTOR[item.frequency]);
};

/**
 * Ahorro por no repetirlo (supuesto documentado: §5.1 no lo define).
 * Es lo que se dejaría de gastar en un año si el gasto se elimina = gasto anual proyectado.
 * Para ingresos no aplica y devuelve null.
 */
export const savingsIfStopped = (
  item: Pick<DomainItem, "type" | "frequency" | "lastAmount">,
  itemEntries: DomainEntry[],
  referenceDate: Date,
): number | null =>
  item.type === "expense" ? annualProjection(item, itemEntries, referenceDate) : null;

export interface ItemMonthStats {
  /** Total del concepto en el mes de referencia. */
  itemTotal: number;
  /** Total de gastos del usuario en el mes. */
  expenseTotal: number;
  /** Total de ingresos del usuario en el mes. */
  incomeTotal: number;
  /** itemTotal / incomeTotal × 100. null si no hay ingresos en el mes. */
  percentOfIncome: number | null;
  /** itemTotal / total del mismo tipo × 100. null si ese total es 0. */
  percentOfSameType: number | null;
}

/**
 * Indicadores del detalle (HU-12) y datos de la gráfica (HU-13).
 * Periodo de referencia: mes calendario (supuesto documentado).
 */
export const itemMonthStats = (
  item: Pick<DomainItem, "id" | "type">,
  allEntries: DomainEntry[],
  itemTypeById: ReadonlyMap<string, TransactionType>,
  referenceDate: Date,
): ItemMonthStats => {
  const range = monthRange(referenceDate);
  const itemTotal = sumInRange(
    allEntries.filter((e) => e.itemId === item.id),
    range,
  );
  const { expense, income } = totalsByType(allEntries, itemTypeById, range);
  return {
    itemTotal,
    expenseTotal: expense,
    incomeTotal: income,
    percentOfIncome: percentage(itemTotal, income),
    percentOfSameType: percentage(itemTotal, item.type === "expense" ? expense : income),
  };
};

export interface ComparisonSlice {
  name: string;
  value: number;
}

export interface Comparison {
  title: string;
  /** % que representa el concepto; null si no hay base. */
  percent: number | null;
  slices: ComparisonSlice[];
  /** true cuando el concepto supera la base (p. ej. gasto mayor que los ingresos). */
  exceeds: boolean;
}

/** Arma una comparación "concepto vs resto de la base" para la gráfica (HU-13). */
export const buildComparison = (
  title: string,
  itemLabel: string,
  restLabel: string,
  itemTotal: number,
  base: number,
): Comparison => {
  const restCents = toCents(base) - toCents(itemTotal);
  const percent = percentage(itemTotal, base);
  return {
    title,
    percent,
    // Solo tiene sentido "superar" una base que existe
    exceeds: percent !== null && restCents < 0,
    slices: [
      { name: itemLabel, value: itemTotal },
      { name: restLabel, value: fromCents(Math.max(restCents, 0)) },
    ],
  };
};

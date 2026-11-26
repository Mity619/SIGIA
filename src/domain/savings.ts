
import { sumAmounts } from "./money";

import {
  checklistPeriodRange,
  type ChecklistFrequency,
  type DateRange,
} from "./period";

export interface SavedExpense {
  itemId: string;
  name: string;
  amount: number;
}

export interface SavingsRecord {
  saved: SavedExpense[];
}

export interface SavingsDetail {
  itemId: string;
  name: string;
  amount: number;
  count: number;
}

export interface SavingsSummary {
  total: number;
  details: SavingsDetail[];
}

/**
 * Calcula los ahorros de las checklist recibidas.
 */
export function calculateSavings(
  records: SavingsRecord[],
): SavingsSummary {
  const detailsMap = new Map<string, SavingsDetail>();

  for (const record of records) {
    for (const expense of record.saved) {
      const existing = detailsMap.get(expense.itemId);

      if (existing) {
        existing.amount = sumAmounts([
          existing.amount,
          expense.amount,
        ]);
        existing.count += 1;
      } else {
        detailsMap.set(expense.itemId, {
          itemId: expense.itemId,
          name: expense.name,
          amount: expense.amount,
          count: 1,
        });
      }
    }
  }

  const details = [...detailsMap.values()].sort(
    (a, b) => b.amount - a.amount,
  );

  return {
    total: sumAmounts(details.map((item) => item.amount)),
    details,
  };
}

/**
 * Registro de ahorro asociado al periodo de una checklist.
 *
 * Las fechas ya deben estar convertidas a Date.
 * No depende de Firebase.
 */
export interface SavingsPeriodRecord extends SavingsRecord {
  periodStart: Date;
  periodEnd: Date;
}

/**
 * Filtra las checklist por su fecha de inicio.
 */
export function filterSavingsByRange(
  records: SavingsPeriodRecord[],
  range: DateRange,
  includeCrossingPeriods = false,
): SavingsPeriodRecord[] {
  return records.filter(
    (record) =>
      record.periodStart.getTime() >= range.from.getTime() &&
      record.periodStart.getTime() < range.to.getTime() &&
      (
        includeCrossingPeriods ||
        record.periodEnd.getTime() <= range.to.getTime()
      ),
  );
}

/**
 * Calcula los ahorros correspondientes al día,
 * semana, mes o año que contiene la fecha indicada.
 *
 * Reutiliza los rangos de period.ts y calculateSavings().
 */
export function calculateSavingsByPeriod(
  records: SavingsPeriodRecord[],
  frequency: ChecklistFrequency,
  date: Date,
): SavingsSummary {
  const range = checklistPeriodRange(frequency, date);

 const filtered = filterSavingsByRange(
  records,
  range,
  frequency === "monthly" || frequency === "annual",
);

  return calculateSavings(filtered);
}


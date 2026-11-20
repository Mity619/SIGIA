
import { sumAmounts } from "./money";

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

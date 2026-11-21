import { fromCents, sumAmounts, toCents } from "./money";
import type { SavingsPeriodRecord } from "./savings";
import type { SavingsGoal } from "./savingsGoals";

export interface AvailableSavings {
  totalSaved: number;
  totalAssigned: number;
  available: number;
  excludedPeriods: number;
}


export function calculateAvailableSavings(
  records: SavingsPeriodRecord[],
  goals: SavingsGoal[],
): AvailableSavings {
  const ordered = [...records]
    .filter((record) => {
      const start = record.periodStart.getTime();
      const end = record.periodEnd.getTime();
      return Number.isFinite(start) && Number.isFinite(end) && end > start;
    })
    .sort((a, b) => {
      const durationA = a.periodEnd.getTime() - a.periodStart.getTime();
      const durationB = b.periodEnd.getTime() - b.periodStart.getTime();
      return durationA - durationB ||
        a.periodStart.getTime() - b.periodStart.getTime();
    });

  const acceptedByItem = new Map<string, Array<{ from: number; to: number }>>();
  const acceptedAmounts: number[] = [];
  let excludedPeriods = 0;

  for (const record of ordered) {
    const from = record.periodStart.getTime();
    const to = record.periodEnd.getTime();
    let excludedSomething = false;

    for (const expense of record.saved) {
      const previous = acceptedByItem.get(expense.itemId) ?? [];
      const duplicate = previous.some(
        (period) => from < period.to && to > period.from,
      );

      if (duplicate) {
        excludedSomething = true;
        continue;
      }

      acceptedAmounts.push(expense.amount);
      previous.push({ from, to });
      acceptedByItem.set(expense.itemId, previous);
    }

    if (excludedSomething) excludedPeriods += 1;
  }

  const totalSaved = sumAmounts(acceptedAmounts);
  const totalAssigned = sumAmounts(goals.map((goal) => goal.savedAmount));
  return {
    totalSaved,
    totalAssigned,
    available: fromCents(
      Math.max(0, toCents(totalSaved) - toCents(totalAssigned)),
    ),
    excludedPeriods,
  };
}

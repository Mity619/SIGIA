
import {
  fromCents,
  sumAmounts,
  toCents,
} from "./money";

import type { SavingsPeriodRecord } from "./savings";
import type { SavingsGoal } from "./savingsGoals";

export interface AvailableSavings {
  totalSaved: number;
  totalAssigned: number;
  available: number;
  excludedPeriods: number;
}

/**
 * Calcula el ahorro disponible para asignar a metas.
 */
export function calculateAvailableSavings(
  records: SavingsPeriodRecord[],
  goals: SavingsGoal[],
): AvailableSavings {
  const ordered = [...records]
    .filter((record) => {
      const start = record.periodStart.getTime();
      const end = record.periodEnd.getTime();

      return (
        Number.isFinite(start) &&
        Number.isFinite(end) &&
        end > start
      );
    })
    .sort((a, b) => {
      const durationA =
        a.periodEnd.getTime() - a.periodStart.getTime();
      const durationB =
        b.periodEnd.getTime() - b.periodStart.getTime();

      return (
        durationA - durationB ||
        a.periodStart.getTime() - b.periodStart.getTime()
      );
    });

  const accepted: SavingsPeriodRecord[] = [];
  let excludedPeriods = 0;

  for (const record of ordered) {
    const overlaps = accepted.some(
      (selected) =>
        record.periodStart.getTime() <
          selected.periodEnd.getTime() &&
        record.periodEnd.getTime() >
          selected.periodStart.getTime(),
    );

    if (overlaps) {
      excludedPeriods += 1;
    } else {
      accepted.push(record);
    }
  }

  const totalSaved = sumAmounts(
    accepted.flatMap((record) =>
      record.saved.map((expense) => expense.amount),
    ),
  );

  const totalAssigned = sumAmounts(
    goals.map((goal) => goal.savedAmount),
  );

  const availableCents = Math.max(
    0,
    toCents(totalSaved) - toCents(totalAssigned),
  );

  return {
    totalSaved,
    totalAssigned,
    available: fromCents(availableCents),
    excludedPeriods,
  };
}

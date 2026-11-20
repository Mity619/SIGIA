import { fromCents, toCents } from "./money";
import type { SavingsGoal } from "./savingsGoals";

export interface GoalAllocationResult {
  newSavedAmount: number;
  remainingAvailable: number;
  completed: boolean;
}

/**
 * Valida un aporte a una meta y calcula el resultado.
 */
export function calculateGoalAllocation(
  goal: SavingsGoal,
  amount: number,
  available: number,
): GoalAllocationResult {
  const validMoney = (value: number) =>
    Number.isFinite(value) &&
    value >= 0 &&
    Number.isSafeInteger(Math.round(value * 100)) &&
    Math.abs(value * 100 - Math.round(value * 100)) < 1e-7;

  if (
    !validMoney(amount) ||
    !validMoney(available) ||
    !validMoney(goal.savedAmount) ||
    !validMoney(goal.targetAmount) ||
    goal.targetAmount <= 0
  ) {
    throw new Error("Los montos no son válidos.");
  }

  const amountCents = toCents(amount);
  const availableCents = toCents(available);
  const savedCents = toCents(goal.savedAmount);
  const targetCents = toCents(goal.targetAmount);

  if (amountCents <= 0) {
    throw new Error("El aporte debe ser mayor a cero.");
  }

  if (amountCents > availableCents) {
    throw new Error("No tienes suficiente ahorro disponible.");
  }

  if (savedCents >= targetCents) {
    throw new Error("La meta ya está completada.");
  }

  if (savedCents + amountCents > targetCents) {
    throw new Error(
      "El aporte supera el monto restante de la meta.",
    );
  }

  const newSavedCents = savedCents + amountCents;

  return {
    newSavedAmount: fromCents(newSavedCents),
    remainingAvailable: fromCents(
      availableCents - amountCents,
    ),
    completed: newSavedCents === targetCents,
  };
}

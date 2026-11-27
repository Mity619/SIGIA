
import { UserError } from "./errors";
import { percentage } from "./money";

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  deadline: Date;
}

export type SavingsGoalStatus =
  | "pending"
  | "completed"
  | "failed";

export interface SavingsGoalProgress {
  percentage: number;
  remaining: number;
  status: SavingsGoalStatus;
}

/**
 * Calcula el progreso de una meta de ahorro.
 *
 * No modifica datos ni realiza consultas.
 */
export function calculateGoalProgress(
  goal: SavingsGoal,
  now: Date = new Date(),
): SavingsGoalProgress {
  if (
    !Number.isFinite(goal.targetAmount) ||
    goal.targetAmount <= 0 ||
    !Number.isFinite(goal.savedAmount) ||
    goal.savedAmount < 0 ||
    Number.isNaN(goal.deadline.getTime())
  ) {
    throw new UserError("Los datos de la meta no son válidos.");
  }

  const progress =
    percentage(goal.savedAmount, goal.targetAmount) ?? 0;

  const completed = goal.savedAmount >= goal.targetAmount;

  // La fecha límite incluye todo el día seleccionado.
  const deadlineEnd = new Date(
    goal.deadline.getFullYear(),
    goal.deadline.getMonth(),
    goal.deadline.getDate() + 1,
  );

  const expired = now.getTime() >= deadlineEnd.getTime();

  const remaining = Math.max(
    0,
    Math.round(
      (goal.targetAmount - goal.savedAmount) * 100,
    ) / 100,
  );

  return {
    percentage: Math.min(100, progress),
    remaining,
    status: completed
      ? "completed"
      : expired
        ? "failed"
        : "pending",
  };
}

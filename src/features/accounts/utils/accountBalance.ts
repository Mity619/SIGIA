// Cálculos de saldo de una cuenta (HU-15). Funciones puras: sin React ni Firebase.
// Los días se cuentan en hora local del usuario y el dinero se opera en centavos.
import { fromCents, toCents } from "@/domain";
import { toInputDate } from "@/shared/utils/date";
import {
  BALANCE_COMPARISON_PERIODS,
  MIN_MOVEMENTS_FOR_EVOLUTION,
} from "../constants/account.constants";
import type {
  AccountMovement,
  BalanceComparison,
  BalancePoint,
  ComparisonPeriod,
  PeriodOffset,
} from "../types/account.types";

const signedCents = (movement: AccountMovement): number =>
  movement.type === "income" ? toCents(movement.amount) : -toCents(movement.amount);

const startOfNextDay = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

/** Día local en formato YYYY-MM-DD. */
export const toDayKey = (date: Date): string => toInputDate(date);

/** Movimientos ocurridos hasta el final (hora local) del día de `date`. */
export const movementsUntil = (
  movements: readonly AccountMovement[],
  date: Date,
): AccountMovement[] => {
  const limit = startOfNextDay(date).getTime();
  return movements.filter((movement) => movement.date.getTime() < limit);
};

/** Saldo = ingresos − gastos. */
export const calculateBalance = (movements: readonly AccountMovement[]): number =>
  fromCents(movements.reduce((total, movement) => total + signedCents(movement), 0));

/** Saldo considerando solo los movimientos hasta el final del día de `date`. */
export const calculateBalanceAt = (
  movements: readonly AccountMovement[],
  date: Date,
): number => calculateBalance(movementsUntil(movements, date));

/** Saldo acumulado al final de cada día con movimientos, en orden cronológico. */
export const buildDailyBalanceSeries = (
  movements: readonly AccountMovement[],
): BalancePoint[] => {
  const centsByDay = new Map<string, { date: Date; cents: number }>();

  for (const movement of movements) {
    const dayKey = toDayKey(movement.date);
    const day = centsByDay.get(dayKey);
    if (day) {
      day.cents += signedCents(movement);
    } else {
      const date = new Date(
        movement.date.getFullYear(),
        movement.date.getMonth(),
        movement.date.getDate(),
      );
      centsByDay.set(dayKey, { date, cents: signedCents(movement) });
    }
  }

  let runningCents = 0;
  return [...centsByDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([dayKey, { date, cents }]) => {
      runningCents += cents;
      return { dayKey, date, balance: fromCents(runningCents) };
    });
};

/**
 * Resta un periodo a una fecha. Al restar meses o años se ajusta al último día
 * del mes destino: el 31 de marzo menos un mes es el 28 (o 29) de febrero.
 */
export const subtractPeriod = (date: Date, offset: PeriodOffset): Date => {
  const { days = 0, months = 0, years = 0 } = offset;
  const targetMonth = new Date(date.getFullYear() - years, date.getMonth() - months, 1);
  const lastDayOfTargetMonth = new Date(
    targetMonth.getFullYear(),
    targetMonth.getMonth() + 1,
    0,
  ).getDate();

  return new Date(
    targetMonth.getFullYear(),
    targetMonth.getMonth(),
    Math.min(date.getDate(), lastDayOfTargetMonth) - days,
  );
};

/**
 * Variación (§5.1) = (saldo actual − saldo anterior) ÷ saldo anterior × 100, a 2 decimales.
 * Se divide entre el valor absoluto para que el signo indique si el saldo subió o bajó
 * aun cuando el saldo anterior es negativo. Devuelve null si el saldo anterior es 0.
 */
export const calculateVariation = (current: number, previous: number): number | null => {
  const previousCents = toCents(previous);
  if (previousCents === 0) return null;

  const differenceCents = toCents(current) - previousCents;
  return Math.round((differenceCents * 10000) / Math.abs(previousCents)) / 100;
};

/** Saldo de referencia y variación frente al saldo actual para cada periodo. */
export const buildBalanceComparisons = (
  movements: readonly AccountMovement[],
  today: Date,
  periods: readonly ComparisonPeriod[] = BALANCE_COMPARISON_PERIODS,
): BalanceComparison[] => {
  const currentBalance = calculateBalanceAt(movements, today);

  return periods.map(({ key, label, shortLabel, offset }) => {
    const date = subtractPeriod(today, offset);
    const balance = calculateBalanceAt(movements, date);
    return {
      key,
      label,
      shortLabel,
      date,
      balance,
      variation: calculateVariation(currentBalance, balance),
    };
  });
};

/** Orden por fecha descendente; no muta el arreglo original. */
export const sortMovementsByDateDesc = (
  movements: readonly AccountMovement[],
): AccountMovement[] =>
  [...movements].sort((a, b) => b.date.getTime() - a.date.getTime());

export const hasEnoughMovements = (movements: readonly AccountMovement[]): boolean =>
  movements.length >= MIN_MOVEMENTS_FOR_EVOLUTION;

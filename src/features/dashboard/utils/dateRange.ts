// Rango de fechas del resumen (HU-20). Funciones puras, en hora local.
import { parseInputDate, toInputDate } from "@/shared/utils/date";
import {
  DATE_RANGE_ERROR_MESSAGES,
  DEFAULT_RANGE_MONTHS,
  MAX_RANGE_MONTHS,
} from "../constants/incomeExpense.constants";
import type { DateRangeInput, DateRangeValidation } from "../types/incomeExpense.types";

/** Desde el primer día de hace (DEFAULT_RANGE_MONTHS − 1) meses hasta hoy. */
export const getDefaultDateRangeInput = (today: Date): DateRangeInput => ({
  from: toInputDate(new Date(today.getFullYear(), today.getMonth() - (DEFAULT_RANGE_MONTHS - 1), 1)),
  to: toInputDate(today),
});

/** Cantidad de meses calendario que toca el rango, contando ambos extremos. */
export const countCalendarMonths = (from: Date, to: Date): number =>
  (to.getFullYear() - from.getFullYear()) * 12 + to.getMonth() - from.getMonth() + 1;

/** Valida los inputs y los convierte en un rango [from, to) listo para consultar. */
export const validateDateRangeInput = ({ from, to }: DateRangeInput): DateRangeValidation => {
  const start = parseInputDate(from);
  const end = parseInputDate(to);

  if (!start || !end) return { ok: false, error: DATE_RANGE_ERROR_MESSAGES.missing };
  if (start.getTime() > end.getTime()) {
    return { ok: false, error: DATE_RANGE_ERROR_MESSAGES.startAfterEnd };
  }
  if (countCalendarMonths(start, end) > MAX_RANGE_MONTHS) {
    return { ok: false, error: DATE_RANGE_ERROR_MESSAGES.tooLong };
  }

  // La fecha fin es inclusiva: se consulta hasta el inicio del día siguiente
  const endExclusive = new Date(end.getFullYear(), end.getMonth(), end.getDate() + 1);
  return { ok: true, range: { from: start, to: endExclusive } };
};

import type { Frequency } from "./types";
// Rangos de tiempo en hora local. `to` es exclusivo: [from, to).

export interface DateRange {
  from: Date;
  to: Date;
}

export type ChecklistFrequency = Exclude<Frequency, "eventual">;

/** Día calendario que contiene `date`. */
export const dayRange = (date: Date): DateRange => ({
  from: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
  to: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1),
});

/** Semana de lunes a lunes que contiene `date`. */
export const weekRange = (date: Date): DateRange => {
  const day = date.getDay();
  const daysSinceMonday = (day + 6) % 7;

  const from = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() - daysSinceMonday,
  );

  const to = new Date(
    from.getFullYear(),
    from.getMonth(),
    from.getDate() + 7,
  );

  return { from, to };
};

/** Mes calendario que contiene `date`. */
export const monthRange = (date: Date): DateRange => ({
  from: new Date(date.getFullYear(), date.getMonth(), 1),
  to: new Date(date.getFullYear(), date.getMonth() + 1, 1),
});

/** Año calendario que contiene `date`. */
export const yearRange = (date: Date): DateRange => ({
  from: new Date(date.getFullYear(), 0, 1),
  to: new Date(date.getFullYear() + 1, 0, 1),
});

/** Obtiene el rango correspondiente a una frecuencia periódica. */
export const checklistPeriodRange = (
  frequency: ChecklistFrequency,
  date: Date,
): DateRange => {
  switch (frequency) {
    case "daily":
      return dayRange(date);
    case "weekly":
      return weekRange(date);
    case "monthly":
      return monthRange(date);
    case "annual":
      return yearRange(date);
  }
};

export const isInRange = (date: Date, range: DateRange): boolean =>
  date.getTime() >= range.from.getTime() && date.getTime() < range.to.getTime();

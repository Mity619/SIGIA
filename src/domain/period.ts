// Rangos de tiempo en hora local. `to` es exclusivo: [from, to).

export interface DateRange {
  from: Date;
  to: Date;
}

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

export const isInRange = (date: Date, range: DateRange): boolean =>
  date.getTime() >= range.from.getTime() && date.getTime() < range.to.getTime();

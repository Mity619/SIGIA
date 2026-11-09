// Utilidades para <input type="date">.
// El navegador interpreta "YYYY-MM-DD" como medianoche UTC (valueAsDate), lo que en
// Colombia (UTC-5) corre la fecha un día hacia atrás. Aquí se trabaja en hora local.

const pad = (n: number) => String(n).padStart(2, "0");

/** Date -> "YYYY-MM-DD" usando la fecha local del usuario. */
export const toInputDate = (date: Date | undefined | null): string => {
  if (!date || Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

/** "YYYY-MM-DD" -> Date a medianoche local. Devuelve undefined si el texto no es válido. */
export const parseInputDate = (value: string): Date | undefined => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return undefined;
  const [, y, m, d] = match.map(Number);
  const date = new Date(y, m - 1, d);
  return date.getMonth() === m - 1 ? date : undefined;
};

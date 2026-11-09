// Aritmética de dinero sin errores de coma flotante: se opera en centavos enteros.
// (0.1 + 0.2 !== 0.3 en JS; HU-13 exige margen de error 0.)

export const toCents = (amount: number): number => Math.round(amount * 100);
export const fromCents = (cents: number): number => cents / 100;

/** Suma montos sin acumular error de coma flotante. */
export const sumAmounts = (amounts: number[]): number =>
  fromCents(amounts.reduce((acc, a) => acc + toCents(a), 0));

/** part / total × 100 redondeado a 2 decimales. null si total <= 0 (no hay base). */
export const percentage = (part: number, total: number): number | null => {
  const totalCents = toCents(total);
  if (totalCents <= 0) return null;
  return Math.round((toCents(part) * 10000) / totalCents) / 100;
};

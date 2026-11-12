// Formato único de dinero, fechas y porcentajes para toda la app (es-CO).
import { percentage, toCents } from "@/domain/money";

const currency = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const longDate = new Intl.DateTimeFormat("es-CO", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const shortDate = new Intl.DateTimeFormat("es-CO", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const percent = new Intl.NumberFormat("es-CO", { maximumFractionDigits: 2 });

export const formatCurrency = (amount: number): string => currency.format(amount);

export const formatDate = (date: Date, style: "long" | "short" = "long"): string =>
  (style === "long" ? longDate : shortDate).format(date);

/** Recibe un valor ya en escala 0–100 (p. ej. 40 → "40 %"). */
export const formatPercent = (value: number): string => `${percent.format(value)} %`;

/**
 * Porcentaje de `part` sobre `total` listo para mostrar; null si no hay base.
 * El redondeo a 2 decimales no debe contradecir los datos (HU-13, margen de error 0):
 * una parte que existe no se muestra como "0 %" ni una parte distinta del total
 * como "100 %".
 */
export const formatShare = (part: number, total: number): string | null => {
  const value = percentage(part, total);
  if (value === null) return null;
  const partCents = toCents(part);
  const totalCents = toCents(total);
  if (value === 0 && partCents > 0) return `< ${formatPercent(0.01)}`;
  if (value === 100 && partCents < totalCents) return `> ${formatPercent(99.99)}`;
  if (value === 100 && partCents > totalCents) return `> ${formatPercent(100)}`;
  return formatPercent(value);
};

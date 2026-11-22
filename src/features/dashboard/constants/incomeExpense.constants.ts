import type { TransactionType } from "@/domain";
import type { LoadErrorKind } from "../types/incomeExpense.types";

/** Rango por defecto: el mes actual y los 5 anteriores. */
export const DEFAULT_RANGE_MONTHS = 6;

/** Límite para que la gráfica mensual siga siendo legible y la consulta acotada. */
export const MAX_RANGE_MONTHS = 24;

export const DATE_RANGE_ERROR_MESSAGES = {
  missing: "Selecciona una fecha de inicio y una fecha de fin.",
  startAfterEnd: "La fecha de inicio no puede ser posterior a la fecha de fin.",
  tooLong: `El rango no puede superar ${MAX_RANGE_MONTHS} meses.`,
} as const;

export const LOAD_ERROR_MESSAGES: Record<LoadErrorKind, string> = {
  offline: "No hay conexión. Revisa tu internet e inténtalo de nuevo.",
  session: "Tu sesión expiró. Inicia sesión de nuevo.",
  server: "Algo salió mal de nuestro lado. Inténtalo en unos minutos.",
};

/** Códigos de Firestore que indican una sesión inválida o vencida. */
export const SESSION_ERROR_CODES: readonly string[] = ["unauthenticated", "permission-denied"];
export const OFFLINE_ERROR_CODES: readonly string[] = ["unavailable"];

export const INCOME_EXPENSE_SERIES: Record<TransactionType, { label: string; color: string }> = {
  expense: { label: "Gastos", color: "var(--chart-1)" },
  income: { label: "Ingresos", color: "var(--chart-2)" },
};

export const NEW_EXPENSE_PATH = "/gastos/nuevo";
export const NEW_INCOME_PATH = "/ingresos/nuevo";

// Traduce errores de carga a un tipo con mensaje en español; nunca se muestra el error crudo.
import {
  OFFLINE_ERROR_CODES,
  SESSION_ERROR_CODES,
} from "../constants/incomeExpense.constants";
import type { LoadErrorKind } from "../types/incomeExpense.types";

const getErrorCode = (error: unknown): string | undefined =>
  typeof error === "object" && error !== null && "code" in error && typeof error.code === "string"
    ? error.code
    : undefined;

export const getLoadErrorKind = (error: unknown, isOnline: boolean): LoadErrorKind => {
  const code = getErrorCode(error);
  if (!isOnline || (code && OFFLINE_ERROR_CODES.includes(code))) return "offline";
  if (code && SESSION_ERROR_CODES.includes(code)) return "session";
  return "server";
};

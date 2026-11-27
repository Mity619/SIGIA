// Traduce errores de carga a un tipo con mensaje en español; nunca se muestra el error crudo.
// La clasificación es la del catálogo único (HU-22); el dashboard agrupa en tres casos.
import { classifyError } from "@/shared/errors/errorCatalog";
import type { LoadErrorKind } from "../types/incomeExpense.types";

export const getLoadErrorKind = (error: unknown, isOnline: boolean): LoadErrorKind => {
  const kind = classifyError(error, isOnline);
  if (kind === "offline") return "offline";
  if (kind === "session" || kind === "permission") return "session";
  return "server";
};

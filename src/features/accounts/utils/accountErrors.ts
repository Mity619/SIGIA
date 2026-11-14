import { getAuthErrorMessage } from "@/features/auth/utils/firebaseErrors";
import { ACCOUNT_NAME_ERROR_MESSAGES } from "./accountRules";

export const ACCOUNTS_LOAD_ERROR_MESSAGE =
  "No se pudieron cargar tus cuentas. Inténtalo de nuevo.";

export const ACCOUNT_DETAIL_LOAD_ERROR_MESSAGE =
  "No pudimos cargar la información de esta cuenta. Inténtalo de nuevo.";

const ACCOUNT_ERROR_MESSAGES: Record<string, string> = {
  ...ACCOUNT_NAME_ERROR_MESSAGES,
  ACCOUNT_HAS_ENTRIES:
    "No puedes eliminar esta cuenta porque tiene movimientos registrados. Muévelos a otra cuenta primero.",
  ACCOUNT_SESSION_MISSING: "Tu sesión no está activa. Inicia sesión nuevamente.",
};

export const getAccountErrorMessage = (error: unknown): string => {
  if (
    error instanceof Error &&
    Object.hasOwn(ACCOUNT_ERROR_MESSAGES, error.message)
  ) {
    return ACCOUNT_ERROR_MESSAGES[error.message];
  }

  return getAuthErrorMessage(error);
};

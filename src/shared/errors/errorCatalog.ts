// HU-22 · Catálogo único de errores (documento organizacional §9).
// Toda falla técnica se traduce aquí a un mensaje en español: nunca se
// muestra al usuario un error crudo (códigos, rutas internas, textos en inglés).
import { UserError } from "@/domain/errors";

export type ErrorKind =
  | "offline"
  | "session"
  | "permission"
  | "notFound"
  | "validation"
  | "server";

export const ERROR_MESSAGES: Record<ErrorKind, string> = {
  offline: "No hay conexión. Revisa tu internet e inténtalo de nuevo.",
  session: "Tu sesión expiró. Inicia sesión de nuevo.",
  permission: "No tienes permiso para ver o modificar esta información.",
  notFound: "No encontramos lo que buscas. Puede que haya sido eliminado.",
  validation: "Revisa los datos ingresados e inténtalo de nuevo.",
  server: "Algo salió mal de nuestro lado. Inténtalo en unos minutos.",
};

// Códigos de Firebase (Firestore sin prefijo, Auth con "auth/").
const CODES_BY_KIND: Record<Exclude<ErrorKind, "server">, readonly string[]> = {
  offline: ["unavailable", "deadline-exceeded", "auth/network-request-failed"],
  session: [
    "unauthenticated",
    "auth/user-token-expired",
    "auth/requires-recent-login",
    "auth/invalid-user-token",
    "auth/user-not-found",
  ],
  permission: ["permission-denied"],
  notFound: ["not-found"],
  validation: ["invalid-argument", "out-of-range", "already-exists"],
};

export const getErrorCode = (error: unknown): string | undefined =>
  typeof error === "object" &&
  error !== null &&
  "code" in error &&
  typeof (error as { code: unknown }).code === "string"
    ? (error as { code: string }).code
    : undefined;

const browserIsOnline = (): boolean =>
  typeof navigator === "undefined" ? true : navigator.onLine !== false;

/** Clasifica cualquier error en uno de los tipos del catálogo. */
export const classifyError = (
  error: unknown,
  isOnline: boolean = browserIsOnline(),
): ErrorKind => {
  if (!isOnline) return "offline";

  const code = getErrorCode(error);
  if (code) {
    for (const [kind, codes] of Object.entries(CODES_BY_KIND)) {
      if (codes.includes(code)) return kind as ErrorKind;
    }
  }

  // fetch() sin red lanza TypeError("Failed to fetch")
  if (error instanceof TypeError && /fetch|network/i.test(error.message)) {
    return "offline";
  }

  return "server";
};

/**
 * Mensaje en español para mostrar al usuario.
 * - `UserError`: su mensaje ya está pensado para el usuario y se usa tal cual.
 * - Cualquier otro error: el mensaje del tipo que le corresponde en el catálogo.
 */
export const getErrorMessage = (
  error: unknown,
  isOnline: boolean = browserIsOnline(),
): string => {
  if (error instanceof UserError && error.message.trim() !== "") {
    return error.message;
  }
  return ERROR_MESSAGES[classifyError(error, isOnline)];
};

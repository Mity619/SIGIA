import { ERROR_MESSAGES, getErrorMessage } from "@/shared/errors/errorCatalog";
import { PASSWORD_TOO_SHORT_MESSAGE } from "../constants/auth.constants";
import { FirebaseError } from "firebase/app";

export const getAuthErrorMessage = (error: unknown): string => {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case "auth/email-already-in-use":
        return "El correo ya está en uso";

      case "auth/invalid-email":
        return "El correo no es válido";

      case "auth/weak-password":
        return PASSWORD_TOO_SHORT_MESSAGE;

      case "auth/invalid-credential":
        return "Correo o contraseña incorrectos. Si te registraste con Google, usa Google para iniciar sesión.";

      case "auth/popup-closed-by-user":
        return "Se cerró la ventana de autenticación.";

      case "auth/network-request-failed":
        return ERROR_MESSAGES.offline;

      case "auth/too-many-requests":
        return "Demasiados intentos. Intenta más tarde.";

      default:
        // Errores de Firestore u otros códigos: catálogo único (HU-22)
        return getErrorMessage(error);
    }
  }

  if (error instanceof Error && error.message === "AUTH_USER_EMAIL_MISSING") {
    return "La cuenta autenticada no tiene un correo asociado.";
  }

  if (error instanceof Error) {
    switch (error.message) {
      case "AUTH_USER_PROFILE_MISSING":
        return "No se encontró el perfil del usuario para crear su cuenta.";
      case "AUTH_ROLLBACK_FAILED":
        return "No se pudo revertir el registro. Contacta al equipo de soporte.";
      case "AUTH_SESSION_CLEANUP_FAILED":
        return "No se pudo sincronizar el perfil ni cerrar la sesión. Intenta nuevamente.";
      case "ACCOUNT_DEFAULT_CANNOT_DELETE":
        return "No se puede eliminar la cuenta predeterminada.";
      case "ACCOUNT_NOT_FOUND":
        return "La cuenta que intentas eliminar no existe.";
      case "ACCOUNT_ACCESS_DENIED":
        return "No tienes permiso para modificar esta cuenta.";
      case "ACCOUNT_DEFAULT_ID_CONFLICT":
        return "No se pudo crear la cuenta predeterminada porque el identificador reservado ya está ocupado.";
      default:
        break;
    }
  }

  return getErrorMessage(error);
};

import { describe, expect, it } from "vitest";
import { FirebaseError } from "firebase/app";
import { ERROR_MESSAGES } from "@/shared/errors/errorCatalog";
import { getAuthErrorMessage } from "./firebaseErrors";

describe("getAuthErrorMessage (HU-01, HU-22)", () => {
  it("credenciales erróneas en español", () => {
    expect(getAuthErrorMessage(new FirebaseError("auth/invalid-credential", "x"))).toMatch(
      /^Correo o contraseña incorrectos/,
    );
  });

  it("contraseña débil usa la regla de 8 caracteres", () => {
    expect(getAuthErrorMessage(new FirebaseError("auth/weak-password", "x"))).toBe(
      "La contraseña debe tener al menos 8 caracteres",
    );
  });

  it("errores de red y de Firestore salen del catálogo", () => {
    expect(getAuthErrorMessage(new FirebaseError("auth/network-request-failed", "x"))).toBe(
      ERROR_MESSAGES.offline,
    );
    expect(getAuthErrorMessage(new FirebaseError("permission-denied", "x"))).toBe(
      ERROR_MESSAGES.permission,
    );
  });

  it("nunca muestra un mensaje técnico desconocido", () => {
    expect(getAuthErrorMessage(new Error("Something broke"))).not.toContain("Something");
    expect(getAuthErrorMessage(new FirebaseError("auth/internal-error", "boom"))).not.toContain("boom");
  });

  it("conserva los mensajes de códigos propios", () => {
    expect(getAuthErrorMessage(new Error("ACCOUNT_DEFAULT_CANNOT_DELETE"))).toBe(
      "No se puede eliminar la cuenta predeterminada.",
    );
  });
});

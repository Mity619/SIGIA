import { describe, expect, it } from "vitest";
import { UserError } from "@/domain/errors";
import { classifyError, ERROR_MESSAGES, getErrorCode, getErrorMessage } from "./errorCatalog";

const withCode = (code: string) => Object.assign(new Error("raw english message"), { code });

describe("catálogo de errores (HU-22)", () => {
  it("contiene los mensajes de §9 del documento organizacional", () => {
    expect(ERROR_MESSAGES.offline).toBe("No hay conexión. Revisa tu internet e inténtalo de nuevo.");
    expect(ERROR_MESSAGES.session).toBe("Tu sesión expiró. Inicia sesión de nuevo.");
    expect(ERROR_MESSAGES.notFound).toBe("No encontramos lo que buscas. Puede que haya sido eliminado.");
    expect(ERROR_MESSAGES.server).toBe("Algo salió mal de nuestro lado. Inténtalo en unos minutos.");
  });

  it.each([
    ["unavailable", "offline"],
    ["deadline-exceeded", "offline"],
    ["auth/network-request-failed", "offline"],
    ["unauthenticated", "session"],
    ["auth/user-token-expired", "session"],
    ["permission-denied", "permission"],
    ["not-found", "notFound"],
    ["invalid-argument", "validation"],
    ["internal", "server"],
    ["algo-desconocido", "server"],
  ] as const)("código %s → %s", (code, kind) => {
    expect(classifyError(withCode(code), true)).toBe(kind);
  });

  it("sin conexión siempre es offline", () => {
    expect(classifyError(withCode("internal"), false)).toBe("offline");
  });

  it("un fetch fallido es offline", () => {
    expect(classifyError(new TypeError("Failed to fetch"), true)).toBe("offline");
    expect(classifyError(new TypeError("x is undefined"), true)).toBe("server");
  });

  it("valores que no son errores van a server", () => {
    expect(classifyError(undefined, true)).toBe("server");
    expect(classifyError("texto", true)).toBe("server");
    expect(classifyError({ code: 5 }, true)).toBe("server");
  });

  it("nunca devuelve el mensaje crudo de un error técnico", () => {
    expect(getErrorMessage(withCode("permission-denied"), true)).toBe(ERROR_MESSAGES.permission);
    expect(getErrorMessage(new Error("Missing or insufficient permissions."), true)).toBe(ERROR_MESSAGES.server);
  });

  it("los UserError conservan su mensaje en español", () => {
    expect(getErrorMessage(new UserError("La meta ya está completada."), true)).toBe("La meta ya está completada.");
    expect(getErrorMessage(new UserError("   "), true)).toBe(ERROR_MESSAGES.server);
  });

  it("getErrorCode solo lee códigos de texto", () => {
    expect(getErrorCode(withCode("not-found"))).toBe("not-found");
    expect(getErrorCode(null)).toBeUndefined();
  });
});

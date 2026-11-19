import { describe, expect, it } from "vitest";
import { ACCOUNT_NAME_MAX_LENGTH } from "../features/accounts/constants/account.constants";
import {
  canDeleteAccount,
  sanitizeAccountName,
  validateAccountName,
} from "../features/accounts/utils/accountRules";

const existingNames = ["Bolsillo", "Ahorros"];

describe("accountRules", () => {
  it("quita los espacios al inicio y al final", () => {
    expect(sanitizeAccountName("  Banco  ")).toBe("Banco");
  });

  it("nombre vacío o solo espacios: obligatorio", () => {
    expect(validateAccountName("", existingNames)).toBe(
      "ACCOUNT_NAME_REQUIRED",
    );
    expect(validateAccountName("   ", existingNames)).toBe(
      "ACCOUNT_NAME_REQUIRED",
    );
  });

  it("largo máximo: se mide sin los espacios de los extremos", () => {
    const longestValidName = "a".repeat(ACCOUNT_NAME_MAX_LENGTH);

    expect(
      validateAccountName(` ${longestValidName} `, existingNames),
    ).toBeNull();
    expect(validateAccountName(`${longestValidName}a`, existingNames)).toBe(
      "ACCOUNT_NAME_TOO_LONG",
    );
  });

  it("nombre repetido sin distinguir mayúsculas ni espacios de los extremos", () => {
    expect(validateAccountName("bolsillo", existingNames)).toBe(
      "ACCOUNT_NAME_DUPLICATE",
    );
    expect(validateAccountName("  AHORROS ", existingNames)).toBe(
      "ACCOUNT_NAME_DUPLICATE",
    );
  });

  it("nombre nuevo y válido", () => {
    expect(validateAccountName("Banco", existingNames)).toBeNull();
  });

  it("solo se pueden eliminar las cuentas que no son la predeterminada", () => {
    expect(canDeleteAccount({ default: false })).toBe(true);
    expect(canDeleteAccount({ default: true })).toBe(false);
  });
});

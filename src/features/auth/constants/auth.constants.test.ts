import { describe, expect, it } from "vitest";
import { isPasswordLongEnough, PASSWORD_MIN_LENGTH, PASSWORD_TOO_SHORT_MESSAGE } from "./auth.constants";

describe("contraseña (HU-01)", () => {
  it("exige 8 o más caracteres", () => {
    expect(PASSWORD_MIN_LENGTH).toBe(8);
    expect(isPasswordLongEnough("1234567")).toBe(false);
    expect(isPasswordLongEnough("12345678")).toBe(true);
  });

  it("el mensaje está en español y menciona el mínimo", () => {
    expect(PASSWORD_TOO_SHORT_MESSAGE).toBe("La contraseña debe tener al menos 8 caracteres");
  });
});

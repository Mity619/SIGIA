import { describe, expect, it } from "vitest";
import { percentage, sumAmounts, toCents, fromCents } from "./money";

describe("money", () => {
  it("suma sin error de coma flotante", () => {
    expect(sumAmounts([0.1, 0.2])).toBe(0.3);
    expect(sumAmounts([])).toBe(0);
  });

  it("convierte a centavos y de vuelta", () => {
    expect(toCents(19.99)).toBe(1999);
    expect(fromCents(1999)).toBe(19.99);
  });

  it("porcentaje con 2 decimales", () => {
    expect(percentage(50000, 2000000)).toBe(2.5);
    expect(percentage(1, 3)).toBe(33.33);
    expect(percentage(2, 3)).toBe(66.67);
  });

  it("porcentaje null sin base", () => {
    expect(percentage(100, 0)).toBeNull();
    expect(percentage(100, -5)).toBeNull();
  });
});

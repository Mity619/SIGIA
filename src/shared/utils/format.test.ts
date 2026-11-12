import { describe, expect, it } from "vitest";
import { formatCurrency, formatDate, formatPercent, formatShare } from "./format";

// Intl usa espacios no separables; se normalizan para comparar.
const clean = (s: string) => s.replace(/\s/g, " ");

describe("format", () => {
  it("moneda en pesos colombianos", () => {
    expect(clean(formatCurrency(1200000))).toBe("$ 1.200.000");
    expect(clean(formatCurrency(5500.5))).toBe("$ 5.500,5");
  });

  it("fecha larga y corta en español", () => {
    expect(formatDate(new Date(2026, 10, 9))).toBe("9 de noviembre de 2026");
    expect(clean(formatDate(new Date(2026, 10, 9), "short"))).toMatch(/^9 (de )?nov\.? (de )?2026$/);
  });

  it("porcentaje", () => {
    expect(clean(formatPercent(89.85))).toBe("89,85 %");
    expect(clean(formatPercent(40))).toBe("40 %");
  });

  it("participación: sin base devuelve null", () => {
    expect(formatShare(24, 0)).toBeNull();
  });

  it("participación: valores normales y exactos", () => {
    expect(clean(formatShare(24, 67)!)).toBe("35,82 %");
    expect(clean(formatShare(0, 67)!)).toBe("0 %");
    expect(clean(formatShare(67, 67)!)).toBe("100 %");
    expect(clean(formatShare(2000000, 67)!)).toBe("2.985.074,63 %");
  });

  it("participación: el redondeo no muestra 0 % ni 100 % si no es exacto (HU-13)", () => {
    expect(clean(formatShare(24, 2000024)!)).toBe("< 0,01 %");
    expect(clean(formatShare(2000000, 2000024)!)).toBe("> 99,99 %");
    expect(clean(formatShare(2000024, 2000000)!)).toBe("> 100 %");
  });
});

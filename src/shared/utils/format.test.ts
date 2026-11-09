import { describe, expect, it } from "vitest";
import { formatCurrency, formatDate, formatPercent } from "./format";

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
});

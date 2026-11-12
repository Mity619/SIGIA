import { describe, expect, it } from "vitest";
import { isInRange, monthRange, yearRange } from "./period";

describe("period", () => {
  it("rango del mes es [1 del mes, 1 del siguiente)", () => {
    const r = monthRange(new Date(2026, 11, 15));
    expect(r.from).toEqual(new Date(2026, 11, 1));
    expect(r.to).toEqual(new Date(2027, 0, 1));
  });

  it("rango del año", () => {
    const r = yearRange(new Date(2026, 5, 1));
    expect(r.from).toEqual(new Date(2026, 0, 1));
    expect(r.to).toEqual(new Date(2027, 0, 1));
  });

  it("límite inferior inclusivo y superior exclusivo", () => {
    const r = monthRange(new Date(2026, 10, 9));
    expect(isInRange(new Date(2026, 10, 1), r)).toBe(true);
    expect(isInRange(new Date(2026, 10, 30, 23, 59), r)).toBe(true);
    expect(isInRange(new Date(2026, 11, 1), r)).toBe(false);
    expect(isInRange(new Date(2026, 9, 31, 23, 59), r)).toBe(false);
  });
});

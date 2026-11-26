import { describe, expect, it } from "vitest";
import { parseInputDate, toInputDate } from "./date";

describe("date utils", () => {
  it("parsea YYYY-MM-DD como fecha local (no UTC)", () => {
    const d = parseInputDate("2026-11-09")!;
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(10);
    expect(d.getDate()).toBe(9);
  });

  it("rechaza textos inválidos", () => {
    expect(parseInputDate("")).toBeUndefined();
    expect(parseInputDate("09/11/2026")).toBeUndefined();
    expect(parseInputDate("2026-02-31")).toBeUndefined();
  });

  it("formatea una fecha local a YYYY-MM-DD", () => {
    expect(toInputDate(new Date(2026, 0, 5, 23, 59))).toBe("2026-01-05");
    expect(toInputDate(undefined)).toBe("");
    expect(toInputDate(new Date("x"))).toBe("");
  });

  it("ida y vuelta conserva el día", () => {
    expect(toInputDate(parseInputDate("2026-12-31"))).toBe("2026-12-31");
  });
});

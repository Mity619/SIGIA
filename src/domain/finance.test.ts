import { describe, expect, it } from "vitest";
import {
  annualProjection,
  buildComparison,
  itemMonthStats,
  resolveEntryType,
  savingsIfStopped,
  sumInRange,
  totalsByType,
} from "./finance";
import { monthRange } from "./period";
import type { DomainEntry, TransactionType } from "./types";

const NOV = new Date(2026, 10, 15);
const d = (m: number, day: number, y = 2026) => new Date(y, m, day);
let n = 0;
const entry = (itemId: string, amount: number, date: Date, type?: TransactionType): DomainEntry => ({
  id: `e${++n}`,
  itemId,
  amount,
  date,
  type,
});

// Escenario: café diario, alquiler mensual, regalo eventual; salario como ingreso.
const types = new Map<string, TransactionType>([
  ["cafe", "expense"],
  ["alquiler", "expense"],
  ["regalo", "expense"],
  ["salario", "income"],
]);
const entries: DomainEntry[] = [
  entry("cafe", 5000, d(10, 3), "expense"),
  entry("cafe", 5000, d(10, 4), "expense"),
  entry("cafe", 5500, d(10, 9)), // sin type: se resuelve desde el item
  entry("alquiler", 1200000, d(10, 1), "expense"),
  entry("salario", 3000000, d(10, 1), "income"),
  entry("regalo", 80000, d(2, 10), "expense"),
  entry("regalo", 120000, d(10, 20), "expense"),
  entry("regalo", 99999, d(10, 20, 2025), "expense"), // otro año
  entry("cafe", 5000, d(9, 30), "expense"), // octubre
];

describe("resolveEntryType", () => {
  it("usa el tipo del movimiento o, si falta, el del concepto", () => {
    expect(resolveEntryType(entry("cafe", 1, NOV, "income"), types)).toBe("income");
    expect(resolveEntryType(entry("cafe", 1, NOV), types)).toBe("expense");
    expect(resolveEntryType(entry("x", 1, NOV), types)).toBeUndefined();
  });
});

describe("sumInRange / totalsByType", () => {
  it("suma solo los movimientos del mes", () => {
    const cafe = entries.filter((e) => e.itemId === "cafe");
    expect(sumInRange(cafe, monthRange(NOV))).toBe(15500);
  });

  it("separa gastos e ingresos del mes", () => {
    expect(totalsByType(entries, types, monthRange(NOV))).toEqual({
      expense: 15500 + 1200000 + 120000,
      income: 3000000,
    });
  });
});

describe("annualProjection (§5.1)", () => {
  it.each([
    ["daily", 5500, 2007500],
    ["weekly", 20000, 1040000],
    ["monthly", 1200000, 14400000],
    ["annual", 300000, 300000],
  ] as const)("%s: último monto × factor", (frequency, lastAmount, expected) => {
    expect(annualProjection({ frequency, lastAmount }, [], NOV)).toBe(expected);
  });

  it("eventual: suma real del año de referencia", () => {
    const regalo = entries.filter((e) => e.itemId === "regalo");
    expect(annualProjection({ frequency: "eventual", lastAmount: 120000 }, regalo, NOV)).toBe(200000);
  });

  it("sin error de coma flotante con decimales", () => {
    expect(annualProjection({ frequency: "daily", lastAmount: 0.1 }, [], NOV)).toBe(36.5);
  });
});

describe("savingsIfStopped", () => {
  it("para gastos es la proyección anual", () => {
    expect(
      savingsIfStopped({ type: "expense", frequency: "daily", lastAmount: 5000 }, [], NOV),
    ).toBe(1825000);
  });

  it("para ingresos no aplica", () => {
    expect(
      savingsIfStopped({ type: "income", frequency: "monthly", lastAmount: 3000000 }, [], NOV),
    ).toBeNull();
  });
});

describe("itemMonthStats", () => {
  it("calcula % sobre ingresos y sobre gastos del mes", () => {
    const s = itemMonthStats({ id: "alquiler", type: "expense" }, entries, types, NOV);
    expect(s).toEqual({
      itemTotal: 1200000,
      expenseTotal: 1335500,
      incomeTotal: 3000000,
      percentOfIncome: 40,
      percentOfSameType: 89.85,
    });
  });

  it("para un ingreso compara contra el total de ingresos", () => {
    const s = itemMonthStats({ id: "salario", type: "income" }, entries, types, NOV);
    expect(s.percentOfSameType).toBe(100);
  });

  it("sin ingresos en el mes el % es null (no divide entre cero)", () => {
    const s = itemMonthStats({ id: "cafe", type: "expense" }, entries, types, new Date(2026, 9, 15));
    expect(s.itemTotal).toBe(5000);
    expect(s.incomeTotal).toBe(0);
    expect(s.percentOfIncome).toBeNull();
    expect(s.percentOfSameType).toBe(100);
  });
});

describe("buildComparison (HU-13)", () => {
  it("parte el total en concepto + resto", () => {
    const c = buildComparison("vs gastos", "Café", "Resto", 15500, 1335500);
    expect(c.slices).toEqual([
      { name: "Café", value: 15500 },
      { name: "Resto", value: 1320000 },
    ]);
    expect(c.percent).toBe(1.16);
    expect(c.exceeds).toBe(false);
  });

  it("marca cuando el concepto supera la base y no dibuja un resto negativo", () => {
    const c = buildComparison("vs ingresos", "Viaje", "Resto", 500, 300);
    expect(c.exceeds).toBe(true);
    expect(c.slices[1].value).toBe(0);
    expect(c.percent).toBe(166.67);
  });

  it("sin base el porcentaje es null", () => {
    expect(buildComparison("t", "a", "b", 10, 0).percent).toBeNull();
  });
});

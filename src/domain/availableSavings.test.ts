
import { describe, expect, it } from "vitest";

import { calculateAvailableSavings } from "./availableSavings";
import type { SavingsPeriodRecord } from "./savings";
import type { SavingsGoal } from "./savingsGoals";

function createRecord(
  start: Date,
  end: Date,
  amount: number,
): SavingsPeriodRecord {
  return {
    periodStart: start,
    periodEnd: end,
    saved: [
      {
        itemId: "expense-1",
        name: "Gasto evitado",
        amount,
      },
    ],
  };
}

function createGoal(savedAmount: number): SavingsGoal {
  return {
    id: "goal-1",
    name: "Computador",
    targetAmount: 1000000,
    savedAmount,
    deadline: new Date(2027, 11, 31),
  };
}

describe("calculateAvailableSavings", () => {
  it("resta lo asignado del ahorro contabilizable", () => {
    const records = [
      createRecord(
        new Date(2026, 10, 19),
        new Date(2026, 10, 20),
        100000,
      ),
    ];

    const result = calculateAvailableSavings(
      records,
      [createGoal(60000)],
    );

    expect(result.totalSaved).toBe(100000);
    expect(result.totalAssigned).toBe(60000);
    expect(result.available).toBe(40000);
  });

  it("devuelve cero si no existen ahorros", () => {
    const result = calculateAvailableSavings([], []);

    expect(result.totalSaved).toBe(0);
    expect(result.totalAssigned).toBe(0);
    expect(result.available).toBe(0);
  });

  it("suma las asignaciones de varias metas", () => {
    const records = [
      createRecord(
        new Date(2026, 10, 19),
        new Date(2026, 10, 20),
        100000,
      ),
    ];

    const result = calculateAvailableSavings(
      records,
      [createGoal(20000), createGoal(30000)],
    );

    expect(result.totalAssigned).toBe(50000);
    expect(result.available).toBe(50000);
  });

  it("no devuelve un disponible negativo", () => {
    const records = [
      createRecord(
        new Date(2026, 10, 19),
        new Date(2026, 10, 20),
        50000,
      ),
    ];

    const result = calculateAvailableSavings(
      records,
      [createGoal(70000)],
    );

    expect(result.available).toBe(0);
  });

  it("no cuenta dos veces periodos superpuestos", () => {
    const records = [
      createRecord(
        new Date(2026, 10, 19),
        new Date(2026, 10, 20),
        8000,
      ),
      createRecord(
        new Date(2026, 10, 16),
        new Date(2026, 10, 23),
        30000,
      ),
    ];

    const result = calculateAvailableSavings(records, []);

    // La checklist diaria tiene prioridad.
    expect(result.totalSaved).toBe(8000);
    expect(result.excludedPeriods).toBe(1);
  });

  it("acepta periodos consecutivos sin superposición", () => {
    const records = [
      createRecord(
        new Date(2026, 10, 19),
        new Date(2026, 10, 20),
        8000,
      ),
      createRecord(
        new Date(2026, 10, 20),
        new Date(2026, 10, 21),
        12000,
      ),
    ];

    const result = calculateAvailableSavings(records, []);

    expect(result.totalSaved).toBe(20000);
    expect(result.excludedPeriods).toBe(0);
  });

  it("mantiene la precisión con montos decimales", () => {
    const records = [
      createRecord(
        new Date(2026, 10, 19),
        new Date(2026, 10, 20),
        0.3,
      ),
    ];

    const result = calculateAvailableSavings(
      records,
      [createGoal(0.1)],
    );

    expect(result.available).toBe(0.2);
  });
});

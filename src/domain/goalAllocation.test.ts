import { describe, expect, it, vi } from "vitest";

import { calculateGoalAllocation } from "./goalAllocation";
import type { SavingsGoal } from "./savingsGoals";

const goal: SavingsGoal = {
  id: "goal-1",
  name: "Computador",
  targetAmount: 100000,
  savedAmount: 60000,
  deadline: new Date(2027, 11, 31),
};

describe("calculateGoalAllocation", () => {
  it("calcula un aporte válido", () => {
    const result = calculateGoalAllocation(
      goal,
      25000,
      40000,
    );

    expect(result.newSavedAmount).toBe(85000);
    expect(result.remainingAvailable).toBe(15000);
    expect(result.completed).toBe(false);
  });

  it("permite utilizar exactamente el saldo disponible", () => {
    const result = calculateGoalAllocation(
      goal,
      40000,
      40000,
    );

    expect(result.newSavedAmount).toBe(100000);
    expect(result.remainingAvailable).toBe(0);
    expect(result.completed).toBe(true);
  });

  it("rechaza un aporte superior al disponible", () => {
    expect(() =>
      calculateGoalAllocation(goal, 50000, 40000),
    ).toThrow("No tienes suficiente ahorro disponible.");
  });

  it("rechaza un aporte superior a lo que falta para la meta", () => {
    expect(() =>
      calculateGoalAllocation(goal, 45000, 100000),
    ).toThrow(
      "El aporte supera el monto restante de la meta.",
    );
  });

  it("rechaza aportes de cero o negativos", () => {
    expect(() =>
      calculateGoalAllocation(goal, 0, 40000),
    ).toThrow("El aporte debe ser mayor a cero.");

    expect(() =>
      calculateGoalAllocation(goal, -100, 40000),
    ).toThrow("Los montos no son válidos.");
  });

  it("rechaza aportes a una meta completada", () => {
    expect(() =>
      calculateGoalAllocation(
        { ...goal, savedAmount: 100000 },
        1000,
        10000,
      ),
    ).toThrow("La meta ya está completada.");
  });

  it("rechaza aportes a una meta vencida", () => {
    vi.useFakeTimers();

    try {
      vi.setSystemTime(new Date(2028, 0, 1));

      expect(() =>
        calculateGoalAllocation(goal, 10000, 40000),
      ).toThrow(
        "No puedes asignar ahorros a una meta vencida.",
      );
    } finally {
      vi.useRealTimers();
    }
  });

  it("evita errores de coma flotante", () => {
    const result = calculateGoalAllocation(
      {
        ...goal,
        targetAmount: 0.3,
        savedAmount: 0.1,
      },
      0.2,
      0.2,
    );

    expect(result.newSavedAmount).toBe(0.3);
    expect(result.remainingAvailable).toBe(0);
    expect(result.completed).toBe(true);
  });

  it("rechaza importes con más de dos decimales", () => {
    expect(() =>
      calculateGoalAllocation(goal, 1.234, 40000),
    ).toThrow("Los montos no son válidos.");
  });

  it("no modifica la meta original", () => {
    calculateGoalAllocation(goal, 10000, 40000);

    expect(goal.savedAmount).toBe(60000);
  });
});

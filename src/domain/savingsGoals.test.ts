
import { describe, expect, it } from "vitest";
import {
  calculateGoalProgress,
  type SavingsGoal,
} from "./savingsGoals";

const goal: SavingsGoal = {
  id: "goal-1",
  name: "Comprar computador",
  targetAmount: 1000000,
  savedAmount: 600000,
  deadline: new Date(2026, 11, 31),
};

describe("calculateGoalProgress", () => {
  it("calcula el progreso de una meta", () => {
    const result = calculateGoalProgress(
      goal,
      new Date(2026, 10, 20),
    );

    expect(result.percentage).toBe(60);
    expect(result.remaining).toBe(400000);
    expect(result.status).toBe("pending");
  });

  it("devuelve cero para una meta sin ahorros", () => {
    const result = calculateGoalProgress(
      { ...goal, savedAmount: 0 },
      new Date(2026, 10, 20),
    );

    expect(result.percentage).toBe(0);
    expect(result.remaining).toBe(1000000);
  });

  it("marca como completada una meta al llegar al 100%", () => {
    const result = calculateGoalProgress(
      { ...goal, savedAmount: 1000000 },
      new Date(2026, 10, 20),
    );

    expect(result.percentage).toBe(100);
    expect(result.remaining).toBe(0);
    expect(result.status).toBe("completed");
  });

  it("limita el progreso visible al 100%", () => {
    const result = calculateGoalProgress(
      { ...goal, savedAmount: 1200000 },
      new Date(2026, 10, 20),
    );

    expect(result.percentage).toBe(100);
    expect(result.remaining).toBe(0);
    expect(result.status).toBe("completed");
  });

  it("considera la fecha límite como un día completo", () => {
    const result = calculateGoalProgress(
      goal,
      new Date(2026, 11, 31, 23, 59),
    );

    expect(result.status).toBe("pending");
  });

  it("marca como vencida una meta no completada", () => {
    const result = calculateGoalProgress(
      goal,
      new Date(2027, 0, 1),
    );

    expect(result.status).toBe("failed");
  });

  it("conserva el estado completado después de la fecha límite", () => {
    const result = calculateGoalProgress(
      { ...goal, savedAmount: 1000000 },
      new Date(2027, 0, 1),
    );

    expect(result.status).toBe("completed");
  });

  it("rechaza una meta con monto objetivo inválido", () => {
    expect(() =>
      calculateGoalProgress(
        { ...goal, targetAmount: 0 },
      ),
    ).toThrow("Los datos de la meta no son válidos.");
  });

  it("rechaza montos acumulados negativos", () => {
    expect(() =>
      calculateGoalProgress(
        { ...goal, savedAmount: -100 },
      ),
    ).toThrow("Los datos de la meta no son válidos.");
  });

  it("calcula correctamente valores decimales", () => {
    const result = calculateGoalProgress(
      {
        ...goal,
        targetAmount: 0.3,
        savedAmount: 0.1,
      },
      new Date(2026, 10, 20),
    );

    expect(result.percentage).toBe(33.33);
    expect(result.remaining).toBe(0.2);
  });
});

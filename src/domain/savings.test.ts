
import { describe, expect, it } from "vitest";
import {
  calculateSavings,
  type SavingsRecord,
} from "./savings";

const records: SavingsRecord[] = [
  {
    saved: [
      {
        itemId: "cafe",
        name: "Café",
        amount: 5000,
      },
      {
        itemId: "transporte",
        name: "Transporte",
        amount: 8000,
      },
    ],
  },
  {
    saved: [
      {
        itemId: "cafe",
        name: "Café",
        amount: 5000,
      },
    ],
  },
];

describe("calculateSavings", () => {
  it("calcula el total de ahorros registrados", () => {
    const result = calculateSavings(records);

    expect(result.total).toBe(18000);
  });

  it("agrupa los ahorros por gasto", () => {
    const result = calculateSavings(records);

    expect(result.details).toEqual([
      {
        itemId: "cafe",
        name: "Café",
        amount: 10000,
        count: 2,
      },
      {
        itemId: "transporte",
        name: "Transporte",
        amount: 8000,
        count: 1,
      },
    ]);
  });

  it("devuelve cero cuando no existen ahorros", () => {
    const result = calculateSavings([]);

    expect(result.total).toBe(0);
    expect(result.details).toEqual([]);
  });

  it("no contabiliza gastos realizados", () => {
    const result = calculateSavings([
      {
        saved: [],
      },
    ]);

    expect(result.total).toBe(0);
    expect(result.details).toHaveLength(0);
  });

  it("suma cantidades decimales correctamente", () => {
    const result = calculateSavings([
      {
        saved: [
          { itemId: "1", name: "Prueba", amount: 0.1 },
          { itemId: "1", name: "Prueba", amount: 0.2 },
        ],
      },
    ]);

    expect(result.total).toBe(0.3);
    expect(result.details[0].amount).toBe(0.3);
  });

  it("no mezcla gastos diferentes con el mismo nombre", () => {
    const result = calculateSavings([
      {
        saved: [
          { itemId: "1", name: "Café", amount: 5000 },
          { itemId: "2", name: "Café", amount: 7000 },
        ],
      },
    ]);

    expect(result.total).toBe(12000);
    expect(result.details).toHaveLength(2);
  });
});

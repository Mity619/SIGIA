
import { describe, expect, it } from "vitest";
import {
  calculateSavings,
  calculateSavingsByPeriod,
  filterSavingsByRange,
  type SavingsPeriodRecord,
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


describe("savings by period", () => {
  const records: SavingsPeriodRecord[] = [
    {
      periodStart: new Date(2026, 10, 19),
      periodEnd: new Date(2026, 10, 20),
      saved: [
        {
          itemId: "cafe",
          name: "Café",
          amount: 5000,
        },
      ],
    },
    {
      periodStart: new Date(2026, 10, 20),
      periodEnd: new Date(2026, 10, 21),
      saved: [
        {
          itemId: "transporte",
          name: "Transporte",
          amount: 8000,
        },
      ],
    },
    {
      // Semana completa: lunes 16 al lunes 23.
      periodStart: new Date(2026, 10, 16),
      periodEnd: new Date(2026, 10, 23),
      saved: [
        {
          itemId: "almuerzo",
          name: "Almuerzo",
          amount: 15000,
        },
      ],
    },
    {
      // Checklist de octubre, fuera de noviembre.
      periodStart: new Date(2026, 9, 1),
      periodEnd: new Date(2026, 10, 1),
      saved: [
        {
          itemId: "otro",
          name: "Otro gasto",
          amount: 20000,
        },
      ],
    },
  ];

  it("calcula únicamente el ahorro del día indicado", () => {
    const result = calculateSavingsByPeriod(
      records,
      "daily",
      new Date(2026, 10, 19),
    );

    expect(result.total).toBe(5000);
    expect(result.details).toHaveLength(1);
  });

  it("incluye los registros diarios y semanales de la semana", () => {
    const result = calculateSavingsByPeriod(
      records,
      "weekly",
      new Date(2026, 10, 19),
    );

    expect(result.total).toBe(28000);
    expect(result.details).toHaveLength(3);
  });

  it("incluye los registros contenidos en noviembre", () => {
    const result = calculateSavingsByPeriod(
      records,
      "monthly",
      new Date(2026, 10, 20),
    );

    expect(result.total).toBe(28000);
  });

  it("incluye todos los registros contenidos en el año", () => {
    const result = calculateSavingsByPeriod(
      records,
      "annual",
      new Date(2026, 10, 20),
    );

    expect(result.total).toBe(48000);
  });

  it("no asigna una checklist semanal incompleta a un mes", () => {
    const crossingRecord: SavingsPeriodRecord = {
      periodStart: new Date(2026, 9, 26),
      periodEnd: new Date(2026, 10, 2),
      saved: [
        {
          itemId: "cafe",
          name: "Café",
          amount: 10000,
        },
      ],
    };

    const result = calculateSavingsByPeriod(
      [crossingRecord],
      "monthly",
      new Date(2026, 10, 15),
    );

    expect(result.total).toBe(0);
  });

  it("respeta los límites de fecha inclusivo y exclusivo", () => {
    const filtered = filterSavingsByRange(records, {
      from: new Date(2026, 10, 19),
      to: new Date(2026, 10, 20),
    });

    expect(filtered).toHaveLength(1);
    expect(filtered[0].saved[0].itemId).toBe("cafe");
  });

  it("devuelve cero si no hay registros en el periodo", () => {
    const result = calculateSavingsByPeriod(
      records,
      "daily",
      new Date(2026, 10, 25),
    );

    expect(result.total).toBe(0);
    expect(result.details).toEqual([]);
  });
});


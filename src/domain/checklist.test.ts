
import { describe, expect, it } from "vitest";
import type { DomainItem } from "./types";
import { calculateChecklist } from "./checklist";

const items: DomainItem[] = [
  {
    id: "1",
    name: "Cafe",
    type: "expense",
    frequency: "daily",
    groupIds: [],
    lastAmount: 5000,
  },
  {
    id: "2",
    name: "Transporte",
    type: "expense",
    frequency: "daily",
    groupIds: [],
    lastAmount: 8000,
  },
  {
    id: "3",
    name: "Almuerzo",
    type: "expense",
    frequency: "daily",
    groupIds: [],
    lastAmount: 15000,
  },
];

describe("calculateChecklist", () => {
  it("separa los gastos realizados y ahorrados", () => {
    const result = calculateChecklist(items, ["1", "3"]);

    expect(result.completed).toHaveLength(2);
    expect(result.saved).toHaveLength(1);
    expect(result.totalSpent).toBe(20000);
    expect(result.totalSaved).toBe(8000);
  });

  it("cuenta todos los gastos como ahorrados si ninguno esta marcado", () => {
    const result = calculateChecklist(items, []);

    expect(result.completed).toHaveLength(0);
    expect(result.saved).toHaveLength(3);
    expect(result.totalSaved).toBe(28000);
  });

  it("no contabiliza ingresos ni gastos eventuales", () => {
    const extraItems: DomainItem[] = [
      {
        id: "4",
        name: "Salario",
        type: "income",
        frequency: "monthly",
        groupIds: [],
        lastAmount: 2000000,
      },
      {
        id: "5",
        name: "Regalo",
        type: "expense",
        frequency: "eventual",
        groupIds: [],
        lastAmount: 50000,
      },
    ];

    const result = calculateChecklist(
      [...items, ...extraItems],
      ["1"],
    );

    expect(result.completed).toHaveLength(1);
    expect(result.saved).toHaveLength(2);
    expect(result.totalSpent).toBe(5000);
    expect(result.totalSaved).toBe(23000);
  });
});

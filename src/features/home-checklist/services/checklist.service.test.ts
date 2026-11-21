
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { DomainItem } from "@/domain/types";

const mocks = vi.hoisted(() => ({
  runTransaction: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  writes: {
    set: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock("@/firebase/config", () => ({
  db: {},
  auth: { currentUser: { uid: "user-1" } },
}));

vi.mock("firebase/firestore", () => {
  let generatedId = 0;

  return {
    collection: (_db: unknown, path: string) => ({ path }),
    doc: (parent: { path?: string }, ...parts: string[]) => {
    const path = [parent.path, ...parts]
        .filter(Boolean)
        .join("/");

    return {
        path:
        parts.length === 0
            ? `${path}/generated-${++generatedId}`
            : path,
    };
    },
    Timestamp: {
      fromDate: (date: Date) => ({
        toMillis: () => date.getTime(),
      }),
    },
    serverTimestamp: () => "SERVER_TIMESTAMP",
    runTransaction: mocks.runTransaction,
    getDoc: mocks.getDoc,
    getDocs: mocks.getDocs,
    query: (ref: unknown) => ref,
    where: () => ({}),
  };
});

import {
  getChecklistPeriod,
  saveChecklist,
} from "./checklist.service";

const items: DomainItem[] = [
  {
    id: "cafe",
    name: "Café",
    type: "expense",
    frequency: "daily",
    groupIds: [],
    lastAmount: 5000,
  },
  {
    id: "transporte",
    name: "Transporte",
    type: "expense",
    frequency: "daily",
    groupIds: [],
    lastAmount: 8000,
  },
];

const input = {
  uid: "user-1",
  frequency: "daily" as const,
  date: new Date(2026, 10, 19),
  items,
  checkedIds: ["cafe"],
  accountId: "account-1",
};


function createTransaction(periodExists = false) {
  const get = vi.fn(async (ref: { path: string }) => {
    if (ref.path.includes("checklist_periods")) {
      return {
        exists: () => periodExists,
        id: "daily_2026-11-19",
        ref,
        data: () => ({}),
      };
    }

    if (ref.path === "accounts/account-1") {
      return {
        exists: () => true,
        id: "account-1",
        ref,
        data: () => ({ user_id: "user-1" }),
      };
    }

    const item = items.find((i) =>
      ref.path.endsWith(`/${i.id}`),
    );

    return {
      exists: () => Boolean(item),
      id: item?.id,
      ref,
      data: () => ({
        ...item,
        archived: false,
        lastUsedAt: null,
      }),
    };
  });

  return {
    get,
    set: mocks.writes.set,
    update: mocks.writes.update,
  };
}

describe("checklist.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getDocs.mockResolvedValue({ docs: [] });
  });

  it("impide guardar un periodo que todavía no terminó", async () => {
    vi.useFakeTimers();

    try {
      // 19 de noviembre de 2026 a las 8:00 a. m.
      vi.setSystemTime(new Date(2026, 10, 19, 8, 0));

      await expect(saveChecklist(input)).rejects.toThrow(
        "No puedes guardar la checklist hasta que termine el periodo.",
      );

      // No debe iniciar ninguna transacción.
      expect(mocks.runTransaction).not.toHaveBeenCalled();
      expect(mocks.writes.set).not.toHaveBeenCalled();
      expect(mocks.writes.update).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });

  it("guarda gastos realizados y ahorrados por separado", async () => {
    const tx = createTransaction();

    mocks.runTransaction.mockImplementation(
      async (_db, callback) => callback(tx),
    );

    const result = await saveChecklist(input);

    expect(result.status).toBe("created");

    const entries = mocks.writes.set.mock.calls.filter(
      ([ref]) => ref.path.includes("/entries/"),
    );

    expect(entries).toHaveLength(1);
    expect(entries[0][1].itemId).toBe("cafe");
    expect(entries[0][1].amount).toBe(5000);

    const period = mocks.writes.set.mock.calls.find(
      ([ref]) => ref.path.includes("checklist_periods"),
    );

    expect(period).toBeDefined();
    expect(period![1].totalSpent).toBe(5000);
    expect(period![1].totalSaved).toBe(8000);
    expect(period![1].completed).toHaveLength(1);
    expect(period![1].saved).toHaveLength(1);
  });

  it("no crea movimientos si el periodo ya existe", async () => {
    const tx = createTransaction(true);

    mocks.runTransaction.mockImplementation(
      async (_db, callback) => callback(tx),
    );

    const result = await saveChecklist(input);

    expect(result.status).toBe("already-exists");
    expect(mocks.writes.set).not.toHaveBeenCalled();
    expect(mocks.writes.update).not.toHaveBeenCalled();
    expect(tx.get).toHaveBeenCalledTimes(1);
  });

  it("devuelve null cuando la checklist no existe", async () => {
    mocks.getDoc.mockResolvedValue({
      exists: () => false,
    });

    const result = await getChecklistPeriod(
      "user-1",
      "daily",
      new Date(2026, 10, 19),
    );

    expect(result).toBeNull();
    expect(mocks.getDoc).toHaveBeenCalledTimes(1);
  });

  it("no cuenta como ahorro un gasto ya registrado", async () => {
    const tx = createTransaction();

    mocks.runTransaction.mockImplementation(
      async (_db, callback) => callback(tx),
    );

    mocks.getDocs.mockResolvedValue({
      docs: [
        {
          data: () => ({
            itemId: "transporte",
            type: "expense",
            amount: 8000,
          }),
        },
      ],
    });

    const result = await saveChecklist(input);

    expect(result.status).toBe("created");

    const period = mocks.writes.set.mock.calls.find(
      ([ref]) => ref.path.includes("checklist_periods"),
    );

    expect(period).toBeDefined();

    // Café está marcado y Transporte ya fue pagado.
    expect(period![1].totalSpent).toBe(13000);
    expect(period![1].totalSaved).toBe(0);
    expect(period![1].completed).toHaveLength(2);
    expect(period![1].saved).toHaveLength(0);

    // Solo debe crearse el movimiento nuevo de Café.
    const entries = mocks.writes.set.mock.calls.filter(
      ([ref]) => ref.path.includes("/entries/"),
    );

    expect(entries).toHaveLength(1);
    expect(entries[0][1].itemId).toBe("cafe");
  });

  it("no duplica movimientos registrados manualmente", async () => {
    const tx = createTransaction();

    mocks.runTransaction.mockImplementation(
      async (_db, callback) => callback(tx),
    );

    mocks.getDocs.mockResolvedValue({
      docs: [
        {
          data: () => ({
            itemId: "cafe",
            type: "expense",
            amount: 5000,
          }),
        },
      ],
    });

    const result = await saveChecklist(input);

    expect(result.status).toBe("created");

    const entries = mocks.writes.set.mock.calls.filter(
      ([ref]) => ref.path.includes("/entries/"),
    );

    // Café estaba marcado, pero ya tenía un movimiento.
    expect(entries).toHaveLength(0);

    const period = mocks.writes.set.mock.calls.find(
      ([ref]) => ref.path.includes("checklist_periods"),
    );

    expect(period![1].totalSpent).toBe(5000);
    expect(period![1].totalSaved).toBe(8000);
  });

});

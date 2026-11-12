import { describe, expect, it } from "vitest";
import { filterItems, hasActiveFilters, normalizeText, resolveTag, sortEntries } from "./filters";
import type { DomainEntry, DomainItem } from "./types";

const item = (id: string, name: string, extra: Partial<DomainItem> = {}): DomainItem => ({
  id,
  name,
  type: "expense",
  frequency: "daily",
  groupIds: [],
  lastAmount: 0,
  ...extra,
});
const entry = (itemId: string, amount: number, date: Date): DomainEntry => ({
  id: `${itemId}-${amount}-${date.getTime()}`,
  itemId,
  amount,
  date,
});

const items = [
  item("cafe", "Café", { groupIds: ["g-antojos"] }),
  item("alquiler", "Alquiler", { frequency: "monthly", groupIds: ["g-casa"] }),
  item("netflix", "Netflix", { frequency: "monthly", groupIds: ["g-antojos"] }),
  item("sin", "Sin movimientos", { frequency: "eventual" }),
];
const entries = [
  entry("cafe", 5000, new Date(2026, 10, 3, 8, 30)),
  entry("cafe", 6000, new Date(2026, 10, 9, 18, 0)),
  entry("alquiler", 1200000, new Date(2026, 10, 1)),
  entry("netflix", 45000, new Date(2026, 9, 15)),
];
const ids = (r: DomainItem[]) => r.map((i) => i.id);

describe("normalizeText", () => {
  it("ignora tildes y mayúsculas", () => {
    expect(normalizeText("  CAFÉ ")).toBe("cafe");
  });
});

describe("hasActiveFilters", () => {
  it("detecta filtros vacíos y activos", () => {
    expect(hasActiveFilters({})).toBe(false);
    expect(hasActiveFilters({ name: "  " })).toBe(false);
    expect(hasActiveFilters({ name: "a" })).toBe(true);
    expect(hasActiveFilters({ minAmount: 0 })).toBe(true);
    expect(hasActiveFilters({ tag: "freq:daily" })).toBe(true);
    expect(hasActiveFilters({ to: new Date() })).toBe(true);
  });
});

describe("resolveTag (HU-11, filtro fantasma)", () => {
  const groups = ["g-antojos", "g-casa"];
  it("conserva frecuencias válidas y grupos que existen", () => {
    expect(resolveTag("freq:monthly", groups)).toBe("freq:monthly");
    expect(resolveTag("group:g-casa", groups)).toBe("group:g-casa");
  });
  it("descarta grupos eliminados, frecuencias desconocidas y basura", () => {
    expect(resolveTag("group:g-borrado", groups)).toBeUndefined();
    expect(resolveTag("group:", groups)).toBeUndefined();
    expect(resolveTag("freq:quincenal", groups)).toBeUndefined();
    expect(resolveTag("daily", groups)).toBeUndefined();
    expect(resolveTag(undefined, groups)).toBeUndefined();
  });
});

describe("filterItems (HU-11)", () => {
  it("sin filtros devuelve todo", () => {
    expect(ids(filterItems(items, entries, {}))).toEqual(["cafe", "alquiler", "netflix", "sin"]);
  });

  it("nombre sin tildes", () => {
    expect(ids(filterItems(items, entries, { name: "cafe" }))).toEqual(["cafe"]);
  });

  it("etiqueta por frecuencia o por grupo", () => {
    expect(ids(filterItems(items, entries, { tag: "freq:monthly" }))).toEqual(["alquiler", "netflix"]);
    expect(ids(filterItems(items, entries, { tag: "group:g-antojos" }))).toEqual(["cafe", "netflix"]);
    expect(ids(filterItems(items, entries, { tag: "otro:x" }))).toHaveLength(4);
  });

  it("rango de fechas inclusivo por día completo", () => {
    const r = filterItems(items, entries, { from: new Date(2026, 10, 9), to: new Date(2026, 10, 9) });
    expect(ids(r)).toEqual(["cafe"]);
  });

  it("rango de valor", () => {
    expect(ids(filterItems(items, entries, { minAmount: 40000 }))).toEqual(["alquiler", "netflix"]);
    expect(ids(filterItems(items, entries, { maxAmount: 5000 }))).toEqual(["cafe"]);
  });

  it("fecha y valor deben cumplirse en el MISMO movimiento", () => {
    // café tiene 6000 el 9 nov y 5000 el 3 nov: no hay un movimiento de 6000 el 3 nov
    const r = filterItems(items, entries, {
      from: new Date(2026, 10, 3),
      to: new Date(2026, 10, 3),
      minAmount: 6000,
    });
    expect(r).toEqual([]);
  });

  it("los 4 filtros combinados", () => {
    const r = filterItems(items, entries, {
      name: "caf",
      tag: "group:g-antojos",
      from: new Date(2026, 10, 1),
      to: new Date(2026, 10, 30),
      minAmount: 5500,
      maxAmount: 7000,
    });
    expect(ids(r)).toEqual(["cafe"]);
  });

  it("filtra 1.000 conceptos y 10.000 movimientos en menos de 200 ms", () => {
    const many = Array.from({ length: 1000 }, (_, i) =>
      item(`i${i}`, `Gasto ${i}`, { groupIds: [`g${i % 10}`] }),
    );
    const manyEntries = Array.from({ length: 10000 }, (_, i) =>
      entry(`i${i % 1000}`, (i % 500) * 100, new Date(2026, i % 12, (i % 28) + 1)),
    );
    const t0 = performance.now();
    const r = filterItems(many, manyEntries, {
      name: "gasto 1",
      tag: "group:g1",
      from: new Date(2026, 0, 1),
      to: new Date(2026, 5, 30),
      minAmount: 1000,
    });
    expect(performance.now() - t0).toBeLessThan(200);
    expect(r.length).toBeGreaterThan(0);
  });
});

describe("sortEntries (HU-12)", () => {
  const list = [
    entry("a", 300, new Date(2026, 0, 2)),
    entry("a", 100, new Date(2026, 0, 3)),
    entry("a", 300, new Date(2026, 0, 1)),
  ];

  it("por fecha ascendente y descendente", () => {
    expect(sortEntries(list, "date", "asc").map((e) => e.date.getDate())).toEqual([1, 2, 3]);
    expect(sortEntries(list, "date", "desc").map((e) => e.date.getDate())).toEqual([3, 2, 1]);
  });

  it("por valor con desempate por fecha", () => {
    expect(sortEntries(list, "amount", "asc").map((e) => [e.amount, e.date.getDate()])).toEqual([
      [100, 3],
      [300, 1],
      [300, 2],
    ]);
    expect(sortEntries(list, "amount", "desc").map((e) => e.amount)).toEqual([300, 300, 100]);
  });

  it("no muta el arreglo original", () => {
    const copy = [...list];
    sortEntries(list, "amount", "asc");
    expect(list).toEqual(copy);
  });
});

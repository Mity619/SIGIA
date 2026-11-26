import { describe, expect, it } from "vitest";
import {
  checklistPeriodRange,
  dayRange,
  isInRange,
  monthRange,
  weekRange,
  yearRange,
} from "./period";

describe("period", () => {
  it("rango del mes es [1 del mes, 1 del siguiente)", () => {
    const r = monthRange(new Date(2026, 11, 15));
    expect(r.from).toEqual(new Date(2026, 11, 1));
    expect(r.to).toEqual(new Date(2027, 0, 1));
  });

  it("rango del año", () => {
    const r = yearRange(new Date(2026, 5, 1));
    expect(r.from).toEqual(new Date(2026, 0, 1));
    expect(r.to).toEqual(new Date(2027, 0, 1));
  });

  it("límite inferior inclusivo y superior exclusivo", () => {
    const r = monthRange(new Date(2026, 10, 9));
    expect(isInRange(new Date(2026, 10, 1), r)).toBe(true);
    expect(isInRange(new Date(2026, 10, 30, 23, 59), r)).toBe(true);
    expect(isInRange(new Date(2026, 11, 1), r)).toBe(false);
    expect(isInRange(new Date(2026, 9, 31, 23, 59), r)).toBe(false);
  });

  it("calcula el rango diario sin importar la hora", () => {
    const r = dayRange(new Date(2026, 10, 19, 18, 30));

    expect(r.from).toEqual(new Date(2026, 10, 19));
    expect(r.to).toEqual(new Date(2026, 10, 20));
  });

  it("calcula la semana de lunes a lunes", () => {
    const r = weekRange(new Date(2026, 10, 19));

    expect(r.from).toEqual(new Date(2026, 10, 16));
    expect(r.to).toEqual(new Date(2026, 10, 23));
  });

  it("mantiene el lunes como inicio de semana", () => {
    const r = weekRange(new Date(2026, 10, 16));

    expect(r.from).toEqual(new Date(2026, 10, 16));
    expect(r.to).toEqual(new Date(2026, 10, 23));
  });

  it("incluye el domingo en su semana", () => {
    const r = weekRange(new Date(2026, 10, 22));

    expect(r.from).toEqual(new Date(2026, 10, 16));
    expect(r.to).toEqual(new Date(2026, 10, 23));
  });

  it("calcula correctamente una semana entre dos años", () => {
    const r = weekRange(new Date(2027, 0, 1));

    expect(r.from).toEqual(new Date(2026, 11, 28));
    expect(r.to).toEqual(new Date(2027, 0, 4));
  });

  it("selecciona el rango según la frecuencia", () => {
    const date = new Date(2026, 10, 19);

    expect(checklistPeriodRange("daily", date)).toEqual(dayRange(date));
    expect(checklistPeriodRange("weekly", date)).toEqual(weekRange(date));
    expect(checklistPeriodRange("monthly", date)).toEqual(monthRange(date));
    expect(checklistPeriodRange("annual", date)).toEqual(yearRange(date));
  });
});


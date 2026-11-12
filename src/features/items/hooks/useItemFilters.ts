import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { hasActiveFilters, type ItemFilters } from "@/domain";
import { parseInputDate, toInputDate } from "@/shared/utils/date";

// Los filtros viven en la URL (?q=&desde=&hasta=&etiqueta=&min=&max=):
// sobreviven a recargar la página y se pueden compartir.
const PARAM = {
  name: "q",
  from: "desde",
  to: "hasta",
  tag: "etiqueta",
  minAmount: "min",
  maxAmount: "max",
} as const;

const toNumber = (v: string | null): number | undefined => {
  if (v === null || v.trim() === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};

export function useItemFilters() {
  const [params, setParams] = useSearchParams();

  const filters = useMemo<ItemFilters>(
    () => ({
      name: params.get(PARAM.name) ?? undefined,
      from: parseInputDate(params.get(PARAM.from) ?? ""),
      to: parseInputDate(params.get(PARAM.to) ?? ""),
      tag: params.get(PARAM.tag) || undefined,
      minAmount: toNumber(params.get(PARAM.minAmount)),
      maxAmount: toNumber(params.get(PARAM.maxAmount)),
    }),
    [params],
  );

  const setFilter = useCallback(
    <K extends keyof ItemFilters>(key: K, value: ItemFilters[K]) => {
      setParams(
        () => {
          // No usar `prev`: React Router lo toma del último render, y como aplica
          // la navegación dentro de startTransition, puede estar desactualizado
          // (escribir en "Máx." devolvía "Mín." a un valor anterior).
          // window.location sí se actualiza en el momento.
          const next = new URLSearchParams(window.location.search);
          let raw = "";
          if (value instanceof Date) raw = toInputDate(value);
          else if (value !== undefined && value !== null) raw = String(value);
          if (raw === "") next.delete(PARAM[key]);
          else next.set(PARAM[key], raw);
          return next;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  const clearFilters = useCallback(() => setParams({}, { replace: true }), [setParams]);

  return { filters, setFilter, clearFilters, isActive: hasActiveFilters(filters) };
}

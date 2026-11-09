import type { ItemFilters as Filters } from "@/domain";
import { Button } from "@/shared/components/shadcn/button";
import { Input } from "@/shared/components/shadcn/input";
import { parseInputDate, toInputDate } from "@/shared/utils/date";
import type { GroupDoc } from "@/features/tags/types/tags.types";
import { FREQUENCY_OPTIONS } from "../constants/frequencies";

interface Props {
  filters: Filters;
  groups: GroupDoc[];
  isActive: boolean;
  resultCount: number;
  onChange: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
  onClear: () => void;
}

const selectClass =
  "h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

const toAmount = (v: string) => (v.trim() === "" ? undefined : Number(v));

// HU-11: 4 filtros combinables (nombre, fecha, etiqueta, valor) + limpiar filtros.
export function ItemFilters({ filters, groups, isActive, resultCount, onChange, onClear }: Props) {
  return (
    <section
      aria-label="Filtros"
      className="mb-6 flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm"
    >
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-foreground">Nombre</span>
          <Input
            type="search"
            placeholder="Ej. café"
            value={filters.name ?? ""}
            onChange={(e) => onChange("name", e.target.value || undefined)}
          />
        </label>

        <fieldset className="flex flex-col gap-1 text-sm">
          <legend className="mb-1 font-medium text-foreground">Fecha</legend>
          <div className="flex gap-2">
            <Input
              type="date"
              aria-label="Desde"
              value={toInputDate(filters.from)}
              max={toInputDate(filters.to) || undefined}
              onChange={(e) => onChange("from", parseInputDate(e.target.value))}
            />
            <Input
              type="date"
              aria-label="Hasta"
              value={toInputDate(filters.to)}
              min={toInputDate(filters.from) || undefined}
              onChange={(e) => onChange("to", parseInputDate(e.target.value))}
            />
          </div>
        </fieldset>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-foreground">Etiqueta</span>
          <select
            className={selectClass}
            value={filters.tag ?? ""}
            onChange={(e) => onChange("tag", e.target.value || undefined)}
          >
            <option value="">Todas</option>
            <optgroup label="Frecuencia">
              {FREQUENCY_OPTIONS.map((f) => (
                <option key={f.value} value={`freq:${f.value}`}>
                  {f.label}
                </option>
              ))}
            </optgroup>
            {groups.length > 0 && (
              <optgroup label="Grupos">
                {groups.map((g) => (
                  <option key={g.id} value={`group:${g.id}`}>
                    {g.name}
                  </option>
                ))}
              </optgroup>
            )}
          </select>
        </label>

        <fieldset className="flex flex-col gap-1 text-sm">
          <legend className="mb-1 font-medium text-foreground">Valor</legend>
          <div className="flex gap-2">
            <Input
              type="number"
              inputMode="decimal"
              min={0}
              placeholder="Mín."
              aria-label="Valor mínimo"
              value={filters.minAmount ?? ""}
              onChange={(e) => onChange("minAmount", toAmount(e.target.value))}
            />
            <Input
              type="number"
              inputMode="decimal"
              min={0}
              placeholder="Máx."
              aria-label="Valor máximo"
              value={filters.maxAmount ?? ""}
              onChange={(e) => onChange("maxAmount", toAmount(e.target.value))}
            />
          </div>
        </fieldset>
      </div>

      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="text-muted-foreground" aria-live="polite">
          {isActive ? `${resultCount} resultado${resultCount === 1 ? "" : "s"}` : ""}
        </span>
        <Button type="button" variant="outline" size="sm" onClick={onClear} disabled={!isActive}>
          <i className="ri-filter-off-line" aria-hidden="true" />
          Limpiar filtros
        </Button>
      </div>
    </section>
  );
}

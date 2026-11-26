import type { ReactNode } from "react";
import type { ItemFilters as Filters } from "@/domain";
import { cn } from "@/lib/utils";
import { Button } from "@/shared/components/shadcn/button";
import { Input } from "@/shared/components/shadcn/input";
import { Skeleton } from "@/shared/components/shadcn/skeleton";
import { SkeletonText } from "@/shared/components/ui/loading/SkeletonText";
import { parseInputDate, toInputDate } from "@/shared/utils/date";
import type { GroupDoc } from "@/features/tags/types/tags.types";
import { FREQUENCY_OPTIONS } from "../constants/frequencies";
import { useDraftValue } from "../hooks/useDraftValue";

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

const sectionClass = "mb-6 flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm";
const fieldsGridClass = "grid grid-cols-1 gap-3 md:grid-cols-2";
const dateInputsClass = "grid grid-cols-1 gap-2 sm:grid-cols-2";
const amountInputsClass = "flex gap-2";
const footerClass = "flex items-center justify-between gap-2 text-sm";

const toAmount = (v: string) => (v.trim() === "" ? undefined : Number(v));

// Rótulo + control, como cada label/fieldset de los filtros (text-sm, gap-1).
const FilterFieldSkeleton = ({ children }: { children: ReactNode }) => (
  <div className="flex flex-col gap-1 text-sm">
    <SkeletonText barClassName="w-16" />
    {children}
  </div>
);

const inputSkeletonClass = "h-8 w-full rounded-lg";

export function ItemFiltersSkeleton() {
  return (
    <div className={sectionClass}>
      <div className={fieldsGridClass}>
        <FilterFieldSkeleton>
          <Skeleton className={inputSkeletonClass} />
        </FilterFieldSkeleton>
        <FilterFieldSkeleton>
          <div className={dateInputsClass}>
            <Skeleton className={inputSkeletonClass} />
            <Skeleton className={inputSkeletonClass} />
          </div>
        </FilterFieldSkeleton>
        <FilterFieldSkeleton>
          <Skeleton className="h-9 w-full rounded-md" />
        </FilterFieldSkeleton>
        <FilterFieldSkeleton>
          <div className={amountInputsClass}>
            <Skeleton className={inputSkeletonClass} />
            <Skeleton className={inputSkeletonClass} />
          </div>
        </FilterFieldSkeleton>
      </div>
      <div className={cn(footerClass, "justify-end")}>
        <Skeleton className="h-7 w-32 rounded-lg" />
      </div>
    </div>
  );
}

// HU-11: 4 filtros combinables (nombre, fecha, etiqueta, valor) + limpiar filtros.
export function ItemFilters({ filters, groups, isActive, resultCount, onChange, onClear }: Props) {
  const name = useDraftValue(filters.name ?? "");
  const min = useDraftValue(filters.minAmount?.toString() ?? "");
  const max = useDraftValue(filters.maxAmount?.toString() ?? "");

  return (
    <section
      aria-label="Filtros"
      className={sectionClass}
    >
      <div className={fieldsGridClass}>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-foreground">Nombre</span>
          <Input
            type="search"
            placeholder="Ej. café"
            value={name.value}
            onFocus={name.onFocus}
            onBlur={name.onBlur}
            onChange={(e) => {
              name.setValue(e.target.value);
              onChange("name", e.target.value || undefined);
            }}
          />
        </label>

        <fieldset className="flex min-w-0 flex-col gap-1 text-sm">
          <legend className="mb-1 font-medium text-foreground">Fecha</legend>
          <div className={dateInputsClass}>
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

        <fieldset className="flex min-w-0 flex-col gap-1 text-sm">
          <legend className="mb-1 font-medium text-foreground">Valor</legend>
          <div className={amountInputsClass}>
            <Input
              type="number"
              inputMode="decimal"
              min={0}
              placeholder="Mín."
              aria-label="Valor mínimo"
              value={min.value}
              onFocus={min.onFocus}
              onBlur={min.onBlur}
              onChange={(e) => {
                min.setValue(e.target.value);
                onChange("minAmount", toAmount(e.target.value));
              }}
            />
            <Input
              type="number"
              inputMode="decimal"
              min={0}
              placeholder="Máx."
              aria-label="Valor máximo"
              value={max.value}
              onFocus={max.onFocus}
              onBlur={max.onBlur}
              onChange={(e) => {
                max.setValue(e.target.value);
                onChange("maxAmount", toAmount(e.target.value));
              }}
            />
          </div>
        </fieldset>
      </div>

      <div className={footerClass}>
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

import type { EntrySortKey, SortDirection } from "@/domain";
import { Skeleton } from "@/shared/components/shadcn/skeleton";
import { LoadingRegion } from "@/shared/components/ui/loading/LoadingRegion";
import { SkeletonText } from "@/shared/components/ui/loading/SkeletonText";
import { formatCurrency, formatDate } from "@/shared/utils/format";
import type { EntryDoc } from "../types/items.types";

const sectionClass = "flex flex-col gap-3";
const headerClass = "flex flex-wrap items-center justify-between gap-2";
const titleTextClass = "text-lg";
const sortGroupClass = "flex items-center gap-1 text-sm";
const listClass = "flex flex-col gap-2";
const rowClass = "flex items-center justify-between rounded-xl border border-border bg-card p-4";
const SKELETON_ROWS = 3;

interface Props {
  /** Ya ordenados por la página. */
  entries: EntryDoc[];
  sortKey: EntrySortKey;
  sortDirection: SortDirection;
  onSortChange: (key: EntrySortKey) => void;
  onDeleteClick: (entryId: string) => void;
  onEditClick: (entry: EntryDoc) => void;
}

const SORT_OPTIONS: { key: EntrySortKey; label: string }[] = [
  { key: "date", label: "Fecha" },
  { key: "amount", label: "Valor" },
];

// HU-12: historial ordenable por fecha y valor.
export function EntryHistory({
  entries,
  sortKey,
  sortDirection,
  onSortChange,
  onDeleteClick,
  onEditClick,
}: Props) {
  return (
    <section className={sectionClass}>
      <div className={headerClass}>
        <h2 className={`${titleTextClass} font-semibold text-foreground`}>Historial</h2>
        <div className={sortGroupClass} role="group" aria-label="Ordenar historial">
          <span className="mr-1 text-muted-foreground">Ordenar por</span>
          {SORT_OPTIONS.map((o) => {
            const active = sortKey === o.key;
            return (
              <button
                key={o.key}
                type="button"
                onClick={() => onSortChange(o.key)}
                aria-pressed={active}
                className={`inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 transition ${
                  active
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                {o.label}
                {active && (
                  <i
                    className={sortDirection === "asc" ? "ri-arrow-up-line" : "ri-arrow-down-line"}
                    aria-label={sortDirection === "asc" ? "ascendente" : "descendente"}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {entries.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          No hay movimientos registrados.
        </p>
      ) : (
        <ul className={listClass}>
          {entries.map((entry) => (
            <li key={entry.id} className={rowClass}>
              <div>
                <p className="font-medium text-foreground">{entry.name}</p>
                <p className="text-sm text-muted-foreground">
                  {entry.date ? formatDate(entry.date.toDate()) : "Guardando…"}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-bold text-foreground">{formatCurrency(entry.amount)}</span>
                <button
                  type="button"
                  onClick={() => onEditClick(entry)}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label="Editar movimiento"
                >
                  <i className="ri-edit-line text-lg" />
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteClick(entry.id!)}
                  className="text-destructive hover:opacity-80"
                  aria-label="Eliminar movimiento"
                >
                  <i className="ri-delete-bin-line text-lg" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function EntryHistorySkeleton() {
  return (
    <LoadingRegion className={sectionClass} label="Cargando historial">
      <div className={headerClass}>
        <SkeletonText className={titleTextClass} barClassName="w-24" />
        <div className={sortGroupClass}>
          <SkeletonText className="mr-1" barClassName="w-20" />
          {SORT_OPTIONS.map((o) => (
            <Skeleton key={o.key} className="h-8 w-16 rounded-lg" />
          ))}
        </div>
      </div>
      <div className={listClass}>
        {Array.from({ length: SKELETON_ROWS }, (_, index) => (
          <div key={index} className={rowClass}>
            <div>
              <SkeletonText className="font-medium" barClassName="w-32" />
              <SkeletonText className="text-sm" barClassName="w-40" />
            </div>
            <SkeletonText className="font-bold" barClassName="w-28" />
          </div>
        ))}
      </div>
    </LoadingRegion>
  );
}

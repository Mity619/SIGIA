import type { EntrySortKey, SortDirection } from "@/domain";
import { Skeleton } from "@/shared/components/shadcn/skeleton";
import { formatCurrency, formatDate } from "@/shared/utils/format";
import type { EntryDoc } from "../types/items.types";

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
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-foreground">Historial</h2>
        <div className="flex items-center gap-1 text-sm" role="group" aria-label="Ordenar historial">
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
        <ul className="flex flex-col gap-2">
          {entries.map((entry) => (
            <li
              key={entry.id}
              className="flex items-center justify-between rounded-xl border border-border bg-card p-4"
            >
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
    <div className="flex flex-col gap-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
          <div>
            <Skeleton className="h-4 w-28" />
            <Skeleton className="mt-2 h-3 w-36" />
          </div>
          <Skeleton className="h-5 w-20" />
        </div>
      ))}
    </div>
  );
}

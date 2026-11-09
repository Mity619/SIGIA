import { lazy, Suspense, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  annualProjection,
  itemMonthStats,
  savingsIfStopped,
  sortEntries,
  type EntrySortKey,
  type SortDirection,
} from "@/domain";
import { ConfirmDialog } from "@/shared/components/ui/ConfirmDialog";
import { Skeleton } from "@/shared/components/shadcn/skeleton";
import { useItem } from "../hooks/useItem";
import { useUserEntries } from "../hooks/useUserEntries";
import { useAllItems } from "../hooks/useAllItems";
import { useDeleteEntry } from "../hooks/useDeleteEntry";
import { toDomainItem } from "../mappers";
import { EntryHistory, EntryHistorySkeleton } from "../components/EntryHistory";
import { ItemStats, ItemStatsSkeleton } from "../components/ItemStats";
import { FrequencyBadge } from "../components/FrequencyBadge";

// Recharts se carga solo cuando se abre un detalle (no penaliza la carga inicial)
const ItemComparisonChart = lazy(() => import("../components/ItemComparisonChart"));

const ChartSkeleton = () => (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
    <Skeleton className="h-72 rounded-2xl" />
    <Skeleton className="h-72 rounded-2xl" />
  </div>
);

// HU-12: detalle de un gasto/ingreso con indicadores e historial ordenable.
export function ItemDetailPage() {
  const { id: itemId = "" } = useParams();
  const { getUserId } = useAuth();
  const uid = getUserId()!;

  const { item, loading: loadingItem } = useItem(uid, itemId);
  const { entries, docs, loading: loadingEntries } = useUserEntries(uid);
  const { itemTypeById } = useAllItems(uid);
  const { remove } = useDeleteEntry(uid);

  // Fecha de referencia fija durante la visita (mes actual para los indicadores)
  const [today] = useState(() => new Date());
  const [sortKey, setSortKey] = useState<EntrySortKey>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const itemDocs = useMemo(() => docs.filter((e) => e.itemId === itemId), [docs, itemId]);

  const sortedDocs = useMemo(
    () =>
      sortEntries(
        itemDocs.map((doc) => ({ doc, date: doc.date?.toDate() ?? today, amount: doc.amount })),
        sortKey,
        sortDirection,
      ).map((row) => row.doc),
    [itemDocs, sortKey, sortDirection, today],
  );

  const indicators = useMemo(() => {
    if (!item) return null;
    const domainItem = toDomainItem({ ...item, id: itemId });
    const itemEntries = entries.filter((e) => e.itemId === itemId);
    return {
      stats: itemMonthStats(domainItem, entries, itemTypeById, today),
      annual: annualProjection(domainItem, itemEntries, today),
      savings: savingsIfStopped(domainItem, itemEntries, today),
    };
  }, [item, itemId, entries, itemTypeById, today]);

  const handleSortChange = (key: EntrySortKey) => {
    if (key === sortKey) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("desc");
    }
  };

  const handleDelete = async () => {
    const entry = itemDocs.find((e) => e.id === entryToDelete);
    if (!entry) return;
    setDeleting(true);
    const success = await remove(entry, itemDocs);
    setDeleting(false);
    if (success) setEntryToDelete(null);
  };

  const listPath = item?.type === "income" ? "/ingresos" : "/gastos";

  if (loadingItem) {
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-6" aria-busy="true">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-9 w-64" />
        <ItemStatsSkeleton />
        <ChartSkeleton />
        <EntryHistorySkeleton />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-4 p-10 text-center">
        <i className="ri-search-line text-4xl text-primary" aria-hidden="true" />
        <p className="text-foreground">No encontramos lo que buscas. Puede que haya sido eliminado.</p>
        <Link to="/gastos" className="font-semibold text-primary">
          Volver a gastos
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <Link to={listPath} className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <i className="ri-arrow-left-line" aria-hidden="true" />
          {item.type === "income" ? "Ingresos" : "Gastos"}
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold text-foreground">{item.name}</h1>
          <FrequencyBadge frequency={item.frequency} />
        </div>
      </div>

      {loadingEntries || !indicators ? (
        <ItemStatsSkeleton />
      ) : (
        <ItemStats
          type={item.type}
          stats={indicators.stats}
          annualProjection={indicators.annual}
          savingsIfStopped={indicators.savings}
        />
      )}

      {item.type === "expense" &&
        (loadingEntries || !indicators ? (
          <ChartSkeleton />
        ) : (
          <Suspense fallback={<ChartSkeleton />}>
            <ItemComparisonChart itemName={item.name} stats={indicators.stats} />
          </Suspense>
        ))}

      {loadingEntries ? (
        <EntryHistorySkeleton />
      ) : (
        <EntryHistory
          entries={sortedDocs}
          sortKey={sortKey}
          sortDirection={sortDirection}
          onSortChange={handleSortChange}
          onDeleteClick={setEntryToDelete}
          onEditClick={(entry) => console.log("Abrir modal de edición para", entry)}
        />
      )}

      <ConfirmDialog
        open={!!entryToDelete}
        onOpenChange={(open) => !open && setEntryToDelete(null)}
        title="¿Eliminar movimiento?"
        description="Esta acción no se puede deshacer y afectará tus cálculos."
        confirmText="Sí, eliminar"
        isDestructive
        isLoading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}

import { useAuth } from "@/features/auth/hooks/useAuth";
import { useItems } from "../hooks/useItems";
import { useGroups } from "@/features/tags/hooks/useGroups";
import { ItemCard, ItemCardSkeleton } from "../components/ItemCard";
import { Button } from "@/shared/components/shadcn/button";
import { Link } from "react-router-dom";
import { useMemo } from "react";
import { filterItems } from "@/domain";
import type { TransactionType } from "../types/items.types";
import { useUserEntries } from "../hooks/useUserEntries";
import { useItemFilters } from "../hooks/useItemFilters";
import { ItemFilters } from "../components/ItemFilters";
import { toDomainItem } from "../mappers";

export function ItemsPage({ type }: { type: TransactionType }) {
  const { getUserId } = useAuth();
  const uid = getUserId()!;
  
  const { items, loading } = useItems(uid, type);
  const { groups } = useGroups(uid);
  const { entries, loading: loadingEntries } = useUserEntries(uid);
  const { filters, setFilter, clearFilters, isActive } = useItemFilters();

  // HU-11: filtros en memoria (src/domain/filters.ts)
  const visibleItems = useMemo(() => {
    if (!isActive) return items;
    const rows = items.map((doc) => ({ ...toDomainItem(doc), doc }));
    return filterItems(rows, entries, filters).map((r) => r.doc);
  }, [items, entries, filters, isActive]);

  const title = type === "expense" ? "Gastos" : "Ingresos";
  const route = type === "expense" ? "gastos" : "ingresos";
  const icon = type === "expense" ? "ri-shopping-bag-3-line" : "ri-money-dollar-circle-line";

  return (
    <div className="mx-auto max-w-5xl p-6">
      {/* Encabezado responsive (se adapta a móviles) */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-[#200020]">{title}</h1>
        {items.length > 0 && (
          <Button asChild className="bg-[#DA0081] text-white hover:bg-[#E366A7]">
            <Link to={`/${route}/nuevo`}>
              <i className="ri-add-line mr-2 text-lg" />
              Nuevo {type === "expense" ? "Gasto" : "Ingreso"}
            </Link>
          </Button>
        )}
      </div>

      {items.length > 0 && (
        <ItemFilters
          filters={filters}
          groups={groups}
          isActive={isActive}
          resultCount={visibleItems.length}
          onChange={setFilter}
          onClear={clearFilters}
        />
      )}

      {loading || (isActive && loadingEntries) ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => <ItemCardSkeleton key={i} />)}
        </div>
      ) : items.length === 0 ? (
        /* 🆕 ESTADO VACÍO MEJORADO */
        <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-gray-200 bg-gray-50/50 py-24 px-4 text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-sm">
            <i className={`${icon} text-4xl text-[#DA0081]`} />
          </div>
          <h2 className="mb-2 text-xl font-semibold text-[#200020]">
            Aún no tienes {title.toLowerCase()}
          </h2>
          <p className="mb-6 max-w-md text-sm text-gray-500">
            Comienza registrando tu primer movimiento para llevar un control exacto de tus finanzas personales.
          </p>
          <Button asChild size="lg" className="h-12 rounded-xl bg-[#DA0081] px-8 text-base font-semibold text-white shadow-md shadow-[#da008140] hover:bg-[#E366A7]">
            <Link to={`/${route}/nuevo`}>
              Crear primer {type === "expense" ? "gasto" : "ingreso"}
            </Link>
          </Button>
        </div>
      ) : visibleItems.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border-2 border-dashed border-border px-4 py-16 text-center">
          <i className="ri-search-line text-3xl text-primary" aria-hidden="true" />
          <p className="font-medium text-foreground">No hay {title.toLowerCase()} que coincidan con estos filtros.</p>
          <Button type="button" variant="outline" onClick={clearFilters}>
            Limpiar filtros
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleItems.map((item) => (
            <ItemCard 
              key={item.id} 
              item={item} 
              type={type} 
              groups={groups}
            />
          ))}
        </div>
      )}
    </div>
  );
}
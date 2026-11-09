import { useAuth } from "@/features/auth/hooks/useAuth";
import { useItems } from "../hooks/useItems";
import { useGroups } from "@/features/tags/hooks/useGroups";
import { ItemCard } from "../components/ItemCard";
import { Button } from "@/shared/components/shadcn/button";
import { Link } from "react-router-dom";
import { Skeleton } from "@/shared/components/shadcn/skeleton";
import type { TransactionType } from "../types/items.types";

export function ItemsPage({ type }: { type: TransactionType }) {
  const { getUserId } = useAuth();
  const uid = getUserId()!;
  
  const { items, loading } = useItems(uid, type);
  const { groups } = useGroups(uid);

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

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}
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
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
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
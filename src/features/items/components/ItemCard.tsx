import { Link } from "react-router-dom";
import type { ItemDoc } from "../types/items.types";
import type { GroupDoc } from "@/features/tags/types/tags.types";
import { Skeleton } from "@/shared/components/shadcn/skeleton";
import { formatCurrency, formatDate } from "@/shared/utils/format";
import { FrequencyBadge } from "./FrequencyBadge";

interface Props {
  item: ItemDoc;
  type: string;
  groups: GroupDoc[];
}

// HU-10: cada card muestra valor, ícono de etiqueta y última fecha.
export function ItemCard({ item, type, groups }: Props) {
  const itemGroups = groups.filter((g) => item.groupIds?.includes(g.id!));
  const lastDate = item.lastUsedAt?.toDate();

  return (
    <Link
      to={`/${type === "expense" ? "gastos" : "ingresos"}/${item.id}`}
      className="flex h-full w-full flex-col justify-between gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-lg font-semibold leading-tight text-foreground">{item.name}</h3>
        <span className="whitespace-nowrap text-lg font-bold text-foreground" data-testid="item-amount">
          {formatCurrency(item.lastAmount || 0)}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <FrequencyBadge frequency={item.frequency} />
        {itemGroups.map((group) => (
          <span
            key={group.id}
            className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-[11px] font-medium text-muted-foreground"
          >
            <i className={`${group.iconKey} text-sm`} aria-hidden="true" />
            {group.name}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-1.5 border-t border-border pt-3 text-xs text-muted-foreground">
        <i className="ri-time-line" aria-hidden="true" />
        <span data-testid="item-last-date">
          {lastDate ? `${type === "expense" ? "Último gasto" : "Último ingreso"}: ${formatDate(lastDate)}` : "Sin movimientos registrados"}
        </span>
      </div>
    </Link>
  );
}

/** Esqueleto con la misma estructura que ItemCard (evita saltos de diseño). */
export function ItemCardSkeleton() {
  return (
    <div className="flex h-full w-full flex-col justify-between gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-6 w-20" />
      </div>
      <div className="flex gap-1.5">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <div className="border-t border-border pt-3">
        <Skeleton className="h-4 w-40" />
      </div>
    </div>
  );
}

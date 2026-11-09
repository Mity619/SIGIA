import { Skeleton } from "@/shared/components/shadcn/skeleton";
import { formatCurrency, formatPercent } from "@/shared/utils/format";
import type { ItemMonthStats, TransactionType } from "@/domain";

interface Props {
  type: TransactionType;
  stats: ItemMonthStats;
  annualProjection: number;
  savingsIfStopped: number | null;
}

interface Tile {
  label: string;
  value: string;
  hint: string;
  icon: string;
}

// HU-12: % sobre ingresos, gasto anual proyectado y ahorro por no repetirlo (§5.1).
export function ItemStats({ type, stats, annualProjection, savingsIfStopped }: Props) {
  const isExpense = type === "expense";
  const percent = isExpense ? stats.percentOfIncome : stats.percentOfSameType;

  const tiles: Tile[] = [
    {
      label: "De tus ingresos este mes",
      value: percent === null ? "—" : formatPercent(percent),
      hint:
        percent === null
          ? "Aún no registras ingresos este mes"
          : `${formatCurrency(stats.itemTotal)} de ${formatCurrency(stats.incomeTotal)}`,
      icon: "ri-pie-chart-2-line",
    },
    {
      label: isExpense ? "Gasto anual proyectado" : "Ingreso anual proyectado",
      value: formatCurrency(annualProjection),
      hint: "Según su frecuencia y último valor",
      icon: "ri-calendar-line",
    },
  ];

  if (savingsIfStopped !== null) {
    tiles.push({
      label: "Ahorro si no lo repites",
      value: formatCurrency(savingsIfStopped),
      hint: "Lo que dejarías de gastar en un año",
      icon: "ri-hand-coin-line",
    });
  }

  return (
    <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {tiles.map((t) => (
        <div key={t.label} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <dt className="flex items-center gap-2 text-sm text-muted-foreground">
            <i className={`${t.icon} text-primary`} aria-hidden="true" />
            {t.label}
          </dt>
          <dd className="mt-2 text-2xl font-bold text-foreground">{t.value}</dd>
          <dd className="mt-1 text-xs text-muted-foreground">{t.hint}</dd>
        </div>
      ))}
    </dl>
  );
}

export function ItemStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="mt-3 h-7 w-24" />
          <Skeleton className="mt-2 h-3 w-36" />
        </div>
      ))}
    </div>
  );
}

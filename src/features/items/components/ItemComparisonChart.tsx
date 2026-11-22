import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { buildComparison, type Comparison, type ItemMonthStats } from "@/domain";
import { cn } from "@/lib/utils";
import { formatCurrency, formatShare } from "@/shared/utils/format";
import {
  comparisonGridClass,
  comparisonSectionClass,
  comparisonTitleTextClass,
  donutAreaClass,
  donutCaptionTextClass,
  donutCardClass,
  donutLegendClass,
} from "./comparisonChartLayout";

interface Props {
  itemName: string;
  stats: ItemMonthStats;
}

// Colores desde los tokens del tema (claro/oscuro)
const COLORS = ["var(--chart-1)", "var(--muted)"];

function Donut({
  comparison,
  label,
  emptyMessage,
}: {
  comparison: Comparison;
  label: string | null;
  emptyMessage: string;
}) {
  const { title, percent, slices, exceeds } = comparison;
  const summary =
    percent === null
      ? `${title}: ${emptyMessage}`
      : `${title}: ${slices[0].name} representa ${label}`;

  return (
    <figure className={donutCardClass}>
      <figcaption className={cn(donutCaptionTextClass, "font-medium text-foreground")}>
        {title}
      </figcaption>

      {percent === null ? (
        <div
          className={cn(
            donutAreaClass,
            "flex items-center justify-center px-4 text-center text-sm text-muted-foreground",
          )}
        >
          {emptyMessage}
        </div>
      ) : (
        <div className={cn(donutAreaClass, "relative w-full")} role="img" aria-label={summary}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={slices}
                dataKey="value"
                nameKey="name"
                innerRadius="62%"
                outerRadius="90%"
                startAngle={90}
                endAngle={-270}
                stroke="none"
                isAnimationActive={false}
              >
                {slices.map((s, i) => (
                  <Cell key={s.name} fill={COLORS[i]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            </PieChart>
          </ResponsiveContainer>
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-xl font-bold text-foreground">
            {label}
          </span>
        </div>
      )}

      {percent !== null && (
      <ul className={cn(donutLegendClass, "text-muted-foreground")}>
        {slices.map((s, i) => (
          <li key={s.name} className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[i] }} aria-hidden="true" />
            {s.name}: {formatCurrency(s.value)}
          </li>
        ))}
      </ul>
      )}
      {exceeds && (
        <p className="text-xs font-medium text-destructive">Este gasto supera el total del mes.</p>
      )}
    </figure>
  );
}

// HU-13: cuánto pesa un gasto frente a los gastos totales y frente a los ingresos del mes.
export default function ItemComparisonChart({ itemName, stats }: Props) {
  const vsExpenses = buildComparison(
    "Frente a tus gastos del mes",
    itemName,
    "Otros gastos",
    stats.itemTotal,
    stats.expenseTotal,
  );
  const vsIncome = buildComparison(
    "Frente a tus ingresos del mes",
    itemName,
    "Ingresos restantes",
    stats.itemTotal,
    stats.incomeTotal,
  );

  return (
    <section className={comparisonSectionClass}>
      <h2 className={cn(comparisonTitleTextClass, "font-semibold text-foreground")}>
        ¿Cuánto pesa este gasto?
      </h2>
      <div className={comparisonGridClass}>
        <Donut
          comparison={vsExpenses}
          label={formatShare(stats.itemTotal, stats.expenseTotal)}
          emptyMessage="Aún no tienes gastos registrados este mes."
        />
        <Donut
          comparison={vsIncome}
          label={formatShare(stats.itemTotal, stats.incomeTotal)}
          emptyMessage="Registra tus ingresos del mes para ver esta comparación."
        />
      </div>
    </section>
  );
}

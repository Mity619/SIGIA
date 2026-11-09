import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { buildComparison, type Comparison, type ItemMonthStats } from "@/domain";
import { formatCurrency, formatPercent } from "@/shared/utils/format";

interface Props {
  itemName: string;
  stats: ItemMonthStats;
}

// Colores desde los tokens del tema (claro/oscuro)
const COLORS = ["var(--chart-1)", "var(--muted)"];

function Donut({ comparison, emptyMessage }: { comparison: Comparison; emptyMessage: string }) {
  const { title, percent, slices, exceeds } = comparison;
  const summary =
    percent === null
      ? `${title}: ${emptyMessage}`
      : `${title}: ${slices[0].name} representa ${formatPercent(percent)}`;

  return (
    <figure className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <figcaption className="text-sm font-medium text-foreground">{title}</figcaption>

      {percent === null ? (
        <div className="flex h-48 items-center justify-center px-4 text-center text-sm text-muted-foreground">
          {emptyMessage}
        </div>
      ) : (
        <div className="relative h-48 w-full" role="img" aria-label={summary}>
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
            {formatPercent(percent)}
          </span>
        </div>
      )}

      {percent !== null && (
      <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
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
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold text-foreground">¿Cuánto pesa este gasto?</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Donut comparison={vsExpenses} emptyMessage="Aún no tienes gastos registrados este mes." />
        <Donut comparison={vsIncome} emptyMessage="Registra tus ingresos del mes para ver esta comparación." />
      </div>
    </section>
  );
}

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@/lib/utils";
import {
  formatCompactCurrency,
  formatCurrency,
  formatDate,
  formatPercent,
} from "@/shared/utils/format";
import { CURRENT_BALANCE_SHORT_LABEL } from "../constants/account.constants";
import type { BalanceComparison } from "../types/account.types";
import {
  CHART_AXIS_TICK,
  CHART_MARGIN,
  CHART_Y_AXIS_WIDTH,
  chartAreaClass,
  chartCardClass,
  chartTooltipStyle,
} from "./chartTheme";

interface Props {
  balance: number;
  comparisons: BalanceComparison[];
}

const CURRENT_COLOR = "var(--chart-1)";
const REFERENCE_COLOR = "var(--chart-4)";

const VariationValue = ({ variation }: { variation: number | null }) => {
  if (variation === null) {
    return <span className="text-sm text-muted-foreground">Sin datos para comparar</span>;
  }

  const isUp = variation > 0;
  const isDown = variation < 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-sm font-semibold",
        isUp && "text-primary",
        isDown && "text-destructive",
        !isUp && !isDown && "text-muted-foreground",
      )}
    >
      <i
        className={cn(
          isUp && "ri-arrow-up-line",
          isDown && "ri-arrow-down-line",
          !isUp && !isDown && "ri-subtract-line",
        )}
        aria-hidden="true"
      />
      {isUp ? "+" : ""}
      {formatPercent(variation)}
    </span>
  );
};

// HU-15: saldo actual frente al de ayer, hace una semana, un mes y un año (§5.1).
export default function AccountBalanceComparison({ balance, comparisons }: Props) {
  const data = [
    { label: CURRENT_BALANCE_SHORT_LABEL, balance, isCurrent: true },
    ...comparisons.map((c) => ({ label: c.shortLabel, balance: c.balance, isCurrent: false })),
  ];
  const summary = `Saldo actual ${formatCurrency(balance)}. ${comparisons
    .map((c) => `${c.label}: ${formatCurrency(c.balance)}`)
    .join(". ")}`;

  return (
    <figure className={chartCardClass}>
      <figcaption className="text-base font-semibold text-foreground">
        Saldo actual frente a fechas anteriores
      </figcaption>
      <div className={chartAreaClass} role="img" aria-label={summary}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={CHART_MARGIN}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="label"
              tick={CHART_AXIS_TICK}
              stroke="var(--border)"
              tickLine={false}
            />
            <YAxis
              tickFormatter={(value: number) => formatCompactCurrency(value)}
              tick={CHART_AXIS_TICK}
              stroke="var(--border)"
              tickLine={false}
              axisLine={false}
              width={CHART_Y_AXIS_WIDTH}
            />
            <ReferenceLine y={0} stroke="var(--border)" />
            <Tooltip
              formatter={(value) => [formatCurrency(Number(value)), "Saldo"]}
              contentStyle={chartTooltipStyle}
              cursor={{ fill: "var(--muted)", opacity: 0.5 }}
            />
            <Bar dataKey="balance" radius={[4, 4, 0, 0]} maxBarSize={48} isAnimationActive={false}>
              {data.map((entry) => (
                <Cell
                  key={entry.label}
                  fill={entry.isCurrent ? CURRENT_COLOR : REFERENCE_COLOR}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {comparisons.map((comparison) => (
          <div
            key={comparison.key}
            className="flex flex-col gap-1 rounded-xl border border-border p-3"
          >
            <dt className="text-sm text-muted-foreground">
              {comparison.label}
              <span className="sr-only"> ({formatDate(comparison.date)})</span>
            </dt>
            <dd className="font-semibold text-foreground">{formatCurrency(comparison.balance)}</dd>
            <dd>
              <VariationValue variation={comparison.variation} />
            </dd>
          </div>
        ))}
      </dl>
    </figure>
  );
}

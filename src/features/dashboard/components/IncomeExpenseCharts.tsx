import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from "recharts";
import { buildComparison, type TransactionType } from "@/domain";
import {
  CHART_AXIS_TICK,
  CHART_MARGIN,
  CHART_Y_AXIS_WIDTH,
  chartAreaClass,
  chartCardClass,
  chartTooltipStyle,
} from "@/features/accounts/components/chartTheme";
import {
  formatCompactCurrency,
  formatCurrency,
  formatMonthYear,
  formatShare,
} from "@/shared/utils/format";
import { INCOME_EXPENSE_SERIES } from "../constants/incomeExpense.constants";
import type {
  IncomeExpenseSummary,
  IncomeExpenseTotals,
  MonthlyIncomeExpense,
} from "../types/incomeExpense.types";

interface Props {
  summary: IncomeExpenseSummary;
}

const SERIES_ORDER: readonly TransactionType[] = ["expense", "income"];
const REMAINING_INCOME_COLOR = "var(--muted)";
const NO_INCOME_PERIOD = "Sin ingresos en este periodo";
const NO_INCOME_MONTH = "Sin ingresos este mes";

const describeShare = ({ expense, income }: IncomeExpenseTotals, noIncomeText: string) =>
  formatShare(expense, income) ?? noIncomeText;

const SeriesDot = ({ color }: { color: string }) => (
  <span className="size-2.5 shrink-0 rounded-full" style={{ background: color }} aria-hidden="true" />
);

const Legend = () => (
  <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
    {SERIES_ORDER.map((type) => (
      <li key={type} className="flex items-center gap-1.5">
        <SeriesDot color={INCOME_EXPENSE_SERIES[type].color} />
        {INCOME_EXPENSE_SERIES[type].label}
      </li>
    ))}
  </ul>
);

const TotalShareChart = ({ total }: { total: IncomeExpenseTotals }) => {
  const comparison = buildComparison(
    "Total del periodo",
    INCOME_EXPENSE_SERIES.expense.label,
    "Ingresos restantes",
    total.expense,
    total.income,
  );
  const share = formatShare(total.expense, total.income);
  const summary =
    share === null
      ? `${NO_INCOME_PERIOD}. Gastos: ${formatCurrency(total.expense)}.`
      : `Tus gastos (${formatCurrency(total.expense)}) representan ${share} de tus ingresos (${formatCurrency(total.income)}).`;
  const sliceColors = [INCOME_EXPENSE_SERIES.expense.color, REMAINING_INCOME_COLOR];

  return (
    <figure className={chartCardClass}>
      <figcaption className="text-base font-semibold text-foreground">Total del periodo</figcaption>

      {share === null ? (
        <div className="flex h-48 flex-col items-center justify-center gap-2 text-center">
          <i className="ri-information-line text-3xl text-muted-foreground" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">{NO_INCOME_PERIOD}</p>
        </div>
      ) : (
        <div className="relative h-48 w-full" role="img" aria-label={summary}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={comparison.slices}
                dataKey="value"
                nameKey="name"
                innerRadius="62%"
                outerRadius="90%"
                startAngle={90}
                endAngle={-270}
                stroke="var(--card)"
                strokeWidth={2}
                isAnimationActive={false}
              >
                {comparison.slices.map((slice, index) => (
                  <Cell key={slice.name} fill={sliceColors[index]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => [formatCurrency(Number(value)), name]}
                contentStyle={chartTooltipStyle}
              />
            </PieChart>
          </ResponsiveContainer>
          <span className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold text-foreground">{share}</span>
            <span className="text-xs text-muted-foreground">de tus ingresos</span>
          </span>
        </div>
      )}

      <dl className="grid grid-cols-2 gap-3">
        {SERIES_ORDER.map((type) => (
          <div key={type} className="rounded-xl bg-muted p-3">
            <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <SeriesDot color={INCOME_EXPENSE_SERIES[type].color} />
              {INCOME_EXPENSE_SERIES[type].label}
            </dt>
            <dd className="mt-1 text-sm font-semibold text-foreground sm:text-base">
              {formatCurrency(total[type])}
            </dd>
          </div>
        ))}
      </dl>

      {comparison.exceeds && (
        <p className="flex items-center gap-1.5 text-xs font-medium text-destructive">
          <i className="ri-error-warning-line" aria-hidden="true" />
          Tus gastos superan tus ingresos en este periodo.
        </p>
      )}
    </figure>
  );
};

const MonthTooltip = ({
  active,
  label,
  monthsByKey,
}: Pick<TooltipContentProps, "active" | "label"> & {
  monthsByKey: ReadonlyMap<string, MonthlyIncomeExpense>;
}) => {
  const month = active ? monthsByKey.get(String(label)) : undefined;
  if (!month) return null;

  return (
    <div className="flex flex-col gap-1 p-3 text-xs shadow-sm" style={chartTooltipStyle}>
      <p className="font-semibold capitalize">{formatMonthYear(month.monthStart)}</p>
      {SERIES_ORDER.map((type) => (
        <p key={type} className="flex items-center gap-1.5">
          <SeriesDot color={INCOME_EXPENSE_SERIES[type].color} />
          {INCOME_EXPENSE_SERIES[type].label}: {formatCurrency(month[type])}
        </p>
      ))}
      <p className="text-muted-foreground">
        Gastos sobre ingresos: {describeShare(month, NO_INCOME_MONTH)}
      </p>
    </div>
  );
};

const MonthlyComparisonChart = ({ months }: { months: MonthlyIncomeExpense[] }) => {
  const monthsByKey = new Map(months.map((month) => [month.monthKey, month]));
  const summary = `Gastos frente a ingresos por mes: ${months
    .map((month) => `${formatMonthYear(month.monthStart)}, ${describeShare(month, NO_INCOME_MONTH)}`)
    .join("; ")}.`;

  return (
    <figure className={chartCardClass}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <figcaption className="text-base font-semibold text-foreground">
          Gastos frente a ingresos por mes
        </figcaption>
        <Legend />
      </div>

      <div className={chartAreaClass} role="img" aria-label={summary}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={months} margin={CHART_MARGIN} barGap={2} barCategoryGap="20%">
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="monthKey"
              tickFormatter={(key: string) => {
                const month = monthsByKey.get(key);
                return month ? formatMonthYear(month.monthStart, "short") : key;
              }}
              tick={CHART_AXIS_TICK}
              stroke="var(--border)"
              tickLine={false}
              minTickGap={8}
            />
            <YAxis
              tickFormatter={(value: number) => formatCompactCurrency(value)}
              tick={CHART_AXIS_TICK}
              stroke="var(--border)"
              tickLine={false}
              axisLine={false}
              width={CHART_Y_AXIS_WIDTH}
            />
            <Tooltip
              cursor={{ fill: "var(--muted)", opacity: 0.5 }}
              content={({ active, label }) => (
                <MonthTooltip active={active} label={label} monthsByKey={monthsByKey} />
              )}
            />
            {SERIES_ORDER.map((type) => (
              <Bar
                key={type}
                dataKey={type}
                name={INCOME_EXPENSE_SERIES[type].label}
                fill={INCOME_EXPENSE_SERIES[type].color}
                radius={[4, 4, 0, 0]}
                isAnimationActive={false}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-medium text-foreground">% de gastos sobre ingresos</h3>
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {months.map((month) => (
            <li
              key={month.monthKey}
              className="flex flex-col rounded-xl border border-border px-3 py-2"
            >
              <span className="text-xs capitalize text-muted-foreground">
                {formatMonthYear(month.monthStart)}
              </span>
              <span className="text-sm font-semibold text-foreground">
                {describeShare(month, NO_INCOME_MONTH)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </figure>
  );
};

// HU-20: proporción de gastos frente a ingresos en total y por mes.
export default function IncomeExpenseCharts({ summary }: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <TotalShareChart total={summary.total} />
      </div>
      <div className="lg:col-span-2">
        <MonthlyComparisonChart months={summary.months} />
      </div>
    </div>
  );
}

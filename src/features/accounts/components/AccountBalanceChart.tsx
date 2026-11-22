import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  formatCompactCurrency,
  formatCurrency,
  formatDate,
  formatDayMonth,
} from "@/shared/utils/format";
import type { BalancePoint } from "../types/account.types";
import {
  CHART_AXIS_TICK,
  CHART_MARGIN,
  CHART_Y_AXIS_WIDTH,
  chartAreaClass,
  chartCaptionClass,
  chartCardClass,
  chartTooltipStyle,
} from "./chartTheme";

interface Props {
  series: BalancePoint[];
}

// HU-15: saldo acumulado al final de cada día con movimientos.
export default function AccountBalanceChart({ series }: Props) {
  const data = series.map((point) => ({ time: point.date.getTime(), balance: point.balance }));
  const first = series[0];
  const last = series[series.length - 1];
  const summary =
    first && last
      ? `Evolución del saldo desde ${formatDate(first.date)} (${formatCurrency(first.balance)}) hasta ${formatDate(last.date)} (${formatCurrency(last.balance)})`
      : "Evolución del saldo";

  return (
    <figure className={chartCardClass}>
      <figcaption className={chartCaptionClass}>
        Evolución del saldo
      </figcaption>
      <div className={chartAreaClass} role="img" aria-label={summary}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={CHART_MARGIN}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="time"
              type="number"
              scale="time"
              domain={["dataMin", "dataMax"]}
              tickFormatter={(time: number) => formatDayMonth(new Date(time))}
              tick={CHART_AXIS_TICK}
              stroke="var(--border)"
              tickLine={false}
              minTickGap={24}
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
              formatter={(value) => [formatCurrency(Number(value)), "Saldo"]}
              labelFormatter={(time) => formatDate(new Date(Number(time)))}
              contentStyle={chartTooltipStyle}
              cursor={{ stroke: "var(--muted-foreground)", strokeDasharray: "3 3" }}
            />
            <Line
              type="linear"
              dataKey="balance"
              stroke="var(--chart-1)"
              strokeWidth={2}
              dot={{ r: 4, fill: "var(--chart-1)", stroke: "var(--card)", strokeWidth: 2 }}
              activeDot={{ r: 6, fill: "var(--chart-1)", stroke: "var(--card)", strokeWidth: 2 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </figure>
  );
}

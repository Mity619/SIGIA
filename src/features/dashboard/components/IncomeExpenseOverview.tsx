import { lazy, Suspense } from "react";
import type { IncomeExpenseSummaryState } from "../hooks/useIncomeExpenseSummary";
import { DateRangeFilter } from "./DateRangeFilter";
import {
  IncomeExpenseChartsSkeleton,
  IncomeExpenseEmpty,
  IncomeExpenseError,
  IncomeExpenseInvalidRange,
} from "./IncomeExpenseStates";

// Recharts se carga aparte para no penalizar la carga inicial del panel
const IncomeExpenseCharts = lazy(() => import("./IncomeExpenseCharts"));

type Props = IncomeExpenseSummaryState;

const IncomeExpenseContent = ({ data, isLoading, error, rangeError, retry }: Props) => {
  if (rangeError) return <IncomeExpenseInvalidRange />;
  if (error) return <IncomeExpenseError message={error} onRetry={retry} />;
  if (isLoading || !data) return <IncomeExpenseChartsSkeleton />;
  if (data.movementCount === 0) return <IncomeExpenseEmpty />;

  return (
    <Suspense fallback={<IncomeExpenseChartsSkeleton />}>
      <IncomeExpenseCharts summary={data} />
    </Suspense>
  );
};

// HU-20: resumen general de gastos frente a ingresos.
export const IncomeExpenseOverview = (props: Props) => (
  <section className="mx-auto max-w-5xl space-y-4" aria-labelledby="income-expense-title">
    <div>
      <h2 id="income-expense-title" className="text-2xl font-bold text-foreground">
        Gastos frente a ingresos
      </h2>
      <p className="text-sm text-muted-foreground">
        Mira cuánto de tus ingresos se va en gastos, mes a mes y en total.
      </p>
    </div>

    <DateRangeFilter
      range={props.range}
      error={props.rangeError}
      isDefaultRange={props.isDefaultRange}
      onFromChange={props.setFrom}
      onToChange={props.setTo}
      onReset={props.resetRange}
    />

    <IncomeExpenseContent {...props} />
  </section>
);

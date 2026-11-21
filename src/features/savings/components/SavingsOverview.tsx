
import type { ChecklistFrequency } from "@/domain/period";
import type { SavingsSummary } from "@/domain/savings";
import { formatCurrency, formatDate } from "@/shared/utils/format";

interface PeriodSummary {
  frequency: ChecklistFrequency;
  label: string;
  summary: SavingsSummary;
}

interface SavingsOverviewProps {
  summaries: PeriodSummary[];
  annualSummary: SavingsSummary;
  referenceDate: Date;
  year: number;
}

export function SavingsOverview({
  summaries,
  annualSummary,
  referenceDate,
  year,
}: SavingsOverviewProps) {
  return (
    <>
      {/* Totales por periodo */}
      <section>
        <h2 className="mb-4 text-xl font-semibold text-foreground">
          Resumen de ahorros
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          {summaries.map((item) => (
            <div
              key={item.frequency}
              className="rounded-xl border border-border bg-card p-5 shadow-sm"
            >
              <p className="text-sm text-muted-foreground">
                Ahorro {item.label.toLowerCase()}
              </p>

              <p className="mt-2 text-2xl font-bold text-foreground">
                {formatCurrency(item.summary.total)}
              </p>

              <p className="mt-2 text-xs text-muted-foreground">
                {item.frequency === "daily"
                  ? formatDate(referenceDate, "short")
                  : item.frequency === "weekly"
                    ? "Semana de la fecha de referencia"
                    : item.frequency === "monthly"
                      ? "Mes de la fecha de referencia"
                      : `Año ${year}`}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Desglose anual de gastos evitados */}
      <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="mb-5">
          <h2 className="text-xl font-semibold text-foreground">
            Desglose de ahorros
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Gastos que evitaste durante {year}.
          </p>
        </div>

        {annualSummary.details.length === 0 ? (
          <div className="rounded-lg bg-muted p-5 text-center">
            <p className="text-sm text-muted-foreground">
              Todavía no tienes ahorros registrados
              para este año.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {annualSummary.details.map((item) => (
              <div
                key={item.itemId}
                className="flex items-center justify-between gap-4 py-4"
              >
                <div className="min-w-0">
                  <p className="font-medium text-foreground">
                    {item.name}
                  </p>

                  <p className="text-sm text-muted-foreground">
                    Evitado {item.count}{" "}
                    {item.count === 1 ? "vez" : "veces"}
                  </p>
                </div>

                <p className="shrink-0 font-semibold text-foreground">
                  {formatCurrency(item.amount)}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

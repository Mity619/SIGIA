
import type { ChecklistFrequency } from "@/domain/period";
import type { SavingsSummary } from "@/domain/savings";
import { LoadingRegion } from "@/shared/components/ui/loading/LoadingRegion";
import { SkeletonText } from "@/shared/components/ui/loading/SkeletonText";
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

const sectionTitleTextClass = "text-xl";
const tilesGridClass = "grid gap-4 sm:grid-cols-2";
const cardClass = "rounded-xl border border-border bg-card p-5 shadow-sm";
const tileValueTextClass = "mt-2 text-2xl";
const tileHintTextClass = "mt-2 text-xs";
const breakdownRowClass = "flex items-center justify-between gap-4 py-4";
const BREAKDOWN_SKELETON_ROWS = 3;

/** Misma forma que SavingsOverview: totales por periodo y desglose anual. */
export function SavingsOverviewSkeleton({ periodCount }: { periodCount: number }) {
  return (
    <LoadingRegion className="space-y-6" label="Cargando ahorros">
      <div>
        <SkeletonText className={`mb-4 ${sectionTitleTextClass}`} barClassName="w-52" />
        <div className={tilesGridClass}>
          {Array.from({ length: periodCount }, (_, index) => (
            <div key={index} className={cardClass}>
              <SkeletonText className="text-sm" barClassName="w-28" />
              <SkeletonText className={tileValueTextClass} barClassName="w-32" />
              <SkeletonText className={tileHintTextClass} barClassName="w-40" />
            </div>
          ))}
        </div>
      </div>

      <div className={cardClass}>
        <div className="mb-5">
          <SkeletonText className={sectionTitleTextClass} barClassName="w-48" />
          <SkeletonText className="mt-1 text-sm" barClassName="w-56" />
        </div>
        <div className="divide-y divide-border">
          {Array.from({ length: BREAKDOWN_SKELETON_ROWS }, (_, index) => (
            <div key={index} className={breakdownRowClass}>
              <div className="min-w-0">
                <SkeletonText className="font-medium" barClassName="w-32" />
                <SkeletonText className="text-sm" barClassName="w-24" />
              </div>
              <SkeletonText className="shrink-0 font-semibold" barClassName="w-24" />
            </div>
          ))}
        </div>
      </div>
    </LoadingRegion>
  );
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
        <h2 className={`mb-4 ${sectionTitleTextClass} font-semibold text-foreground`}>
          Resumen de ahorros
        </h2>

        <div className={tilesGridClass}>
          {summaries.map((item) => (
            <div
              key={item.frequency}
              className={cardClass}
            >
              <p className="text-sm text-muted-foreground">
                Ahorro {item.label.toLowerCase()}
              </p>

              <p className={`${tileValueTextClass} font-bold text-foreground`}>
                {formatCurrency(item.summary.total)}
              </p>

              <p className={`${tileHintTextClass} text-muted-foreground`}>
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
      <section className={cardClass}>
        <div className="mb-5">
          <h2 className={`${sectionTitleTextClass} font-semibold text-foreground`}>
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
                className={breakdownRowClass}
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

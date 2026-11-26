import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  chartAreaClass,
  chartCaptionClass,
  chartCardClass,
} from "@/features/accounts/components/chartTheme";
import { cn } from "@/lib/utils";
import { Button } from "@/shared/components/shadcn/button";
import { Skeleton } from "@/shared/components/shadcn/skeleton";
import { LoadingRegion } from "@/shared/components/ui/loading/LoadingRegion";
import { SkeletonText } from "@/shared/components/ui/loading/SkeletonText";
import {
  DEFAULT_RANGE_MONTHS,
  NEW_EXPENSE_PATH,
  NEW_INCOME_PATH,
} from "../constants/incomeExpense.constants";
import {
  chartsGridClass,
  donutAreaClass,
  monthlyColumnClass,
  monthlyHeaderClass,
  monthShareListClass,
  monthShareTileClass,
  monthShareTitleClass,
  totalTileClass,
  totalTilesClass,
  totalValueTextClass,
} from "./incomeExpenseLayout";

// Gastos e ingresos: una tarjeta por serie.
const TOTAL_TILE_COUNT = 2;

// Misma altura mínima que las gráficas para que cambiar de estado no mueva el diseño
const noticeClass =
  "flex min-h-96 flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border px-4 py-12 text-center";

const primaryButtonClass = "rounded-xl px-6 font-semibold hover:bg-orquidea-70";

/** Misma forma que IncomeExpenseCharts: total a la izquierda y meses a la derecha. */
export const IncomeExpenseChartsSkeleton = () => (
  <LoadingRegion className={chartsGridClass} label="Cargando gráficas">
    <div className={chartCardClass}>
      <SkeletonText className={chartCaptionClass} barClassName="w-36" />
      <div className={cn(donutAreaClass, "flex items-center justify-center")}>
        <Skeleton className="aspect-square h-full rounded-full" />
      </div>
      <div className={totalTilesClass}>
        {Array.from({ length: TOTAL_TILE_COUNT }, (_, index) => (
          <Skeleton key={index} className={totalTileClass}>
            <SkeletonText className="text-xs" barClassName="w-14 bg-background/60" />
            <SkeletonText className={totalValueTextClass} barClassName="w-24 bg-background/60" />
          </Skeleton>
        ))}
      </div>
    </div>
    <div className={cn(chartCardClass, monthlyColumnClass)}>
      <div className={monthlyHeaderClass}>
        <SkeletonText className={chartCaptionClass} barClassName="w-72" />
        <SkeletonText className="text-xs" barClassName="w-28" />
      </div>
      <Skeleton className={chartAreaClass} />
      <div>
        <SkeletonText className={monthShareTitleClass} barClassName="w-48" />
        <div className={monthShareListClass}>
          {Array.from({ length: DEFAULT_RANGE_MONTHS }, (_, index) => (
            <div key={index} className={monthShareTileClass}>
              <SkeletonText className="text-xs" barClassName="w-24" />
              <SkeletonText className="text-sm" barClassName="w-12" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </LoadingRegion>
);

const Notice = ({
  icon,
  iconClass,
  title,
  description,
  role,
  children,
}: {
  icon: string;
  iconClass: string;
  title: string;
  description: string;
  role?: "alert" | "status";
  children?: ReactNode;
}) => (
  <div className={noticeClass} role={role}>
    <i className={`${icon} text-4xl ${iconClass}`} aria-hidden="true" />
    <h3 className="text-lg font-semibold text-foreground">{title}</h3>
    <p className="max-w-md text-sm text-muted-foreground">{description}</p>
    {children && <div className="flex flex-wrap justify-center gap-3">{children}</div>}
  </div>
);

export const IncomeExpenseEmpty = () => (
  <Notice
    icon="ri-bar-chart-grouped-line"
    iconClass="text-primary"
    title="Sin movimientos en este rango"
    description="Aún no tienes movimientos en este rango. Registra tu primer gasto o ingreso, o elige otras fechas."
    role="status"
  >
    <Button asChild size="lg" className={primaryButtonClass}>
      <Link to={NEW_EXPENSE_PATH}>
        <i className="ri-shopping-bag-3-line" aria-hidden="true" />
        Registrar gasto
      </Link>
    </Button>
    <Button asChild variant="outline" size="lg" className="rounded-xl px-6">
      <Link to={NEW_INCOME_PATH}>
        <i className="ri-money-dollar-circle-line" aria-hidden="true" />
        Registrar ingreso
      </Link>
    </Button>
  </Notice>
);

export const IncomeExpenseError = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
  <Notice
    icon="ri-error-warning-line"
    iconClass="text-destructive"
    title="No pudimos cargar tus gráficas"
    description={message}
    role="alert"
  >
    <Button type="button" size="lg" onClick={onRetry} className={primaryButtonClass}>
      <i className="ri-refresh-line" aria-hidden="true" />
      Reintentar
    </Button>
  </Notice>
);

export const IncomeExpenseInvalidRange = () => (
  <Notice
    icon="ri-calendar-close-line"
    iconClass="text-muted-foreground"
    title="Revisa el rango de fechas"
    description="Corrige las fechas del filtro para ver tus gráficas."
  />
);

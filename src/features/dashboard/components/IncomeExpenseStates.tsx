import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { chartAreaClass, chartCardClass } from "@/features/accounts/components/chartTheme";
import { Button } from "@/shared/components/shadcn/button";
import { Skeleton } from "@/shared/components/shadcn/skeleton";
import { NEW_EXPENSE_PATH, NEW_INCOME_PATH } from "../constants/incomeExpense.constants";

const MONTH_SHARE_SKELETONS = 6;

// Misma altura mínima que las gráficas para que cambiar de estado no mueva el diseño
const noticeClass =
  "flex min-h-96 flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border px-4 py-12 text-center";

const primaryButtonClass = "rounded-xl px-6 font-semibold hover:bg-orquidea-70";

/** Misma forma que IncomeExpenseCharts: total a la izquierda y meses a la derecha. */
export const IncomeExpenseChartsSkeleton = () => (
  <div className="grid grid-cols-1 gap-4 lg:grid-cols-3" aria-busy="true" aria-label="Cargando gráficas">
    <div className={chartCardClass}>
      <Skeleton className="h-5 w-36" />
      <Skeleton className="mx-auto h-48 w-48 rounded-full" />
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-16 rounded-xl" />
      </div>
    </div>
    <div className={`${chartCardClass} lg:col-span-2`}>
      <Skeleton className="h-5 w-64" />
      <Skeleton className={chartAreaClass} />
      <Skeleton className="h-4 w-44" />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {Array.from({ length: MONTH_SHARE_SKELETONS }, (_, index) => (
          <Skeleton key={index} className="h-14 rounded-xl" />
        ))}
      </div>
    </div>
  </div>
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

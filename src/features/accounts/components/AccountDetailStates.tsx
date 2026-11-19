import { Link } from "react-router-dom";
import { Button } from "@/shared/components/shadcn/button";
import { Skeleton } from "@/shared/components/shadcn/skeleton";
import { ACCOUNTS_PATH } from "../constants/account.constants";
import { chartAreaClass, chartCardClass } from "./chartTheme";

const SKELETON_ROWS = 3;

export const detailPageClass = "mx-auto flex w-full max-w-3xl flex-col gap-6 px-2 pb-6 sm:px-6";

const noticeClass =
  "flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-border px-4 py-12 text-center";

export const AccountChartsSkeleton = () => (
  <>
    {Array.from({ length: 2 }, (_, index) => (
      <div key={index} className={chartCardClass}>
        <Skeleton className="h-5 w-48" />
        <Skeleton className={chartAreaClass} />
      </div>
    ))}
  </>
);

export const AccountMovementListSkeleton = () => (
  <section className="flex flex-col gap-4">
    <Skeleton className="h-6 w-36" />
    <ul className="flex flex-col gap-3">
      {Array.from({ length: SKELETON_ROWS }, (_, index) => (
        <li key={index} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
          <Skeleton className="size-10 shrink-0 rounded-full" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-5 w-20" />
        </li>
      ))}
    </ul>
  </section>
);

export const AccountDetailSkeleton = () => (
  <div className={detailPageClass} aria-busy="true" aria-label="Cargando cuenta">
    <div className="flex flex-col gap-4 pt-4">
      <Skeleton className="h-4 w-20" />
      <div className="flex items-center gap-3">
        <Skeleton className="size-12 shrink-0 rounded-full" />
        <Skeleton className="h-8 w-48" />
      </div>
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="mt-3 h-9 w-40" />
      </div>
    </div>
    <AccountChartsSkeleton />
    <AccountMovementListSkeleton />
  </div>
);

export const AccountNotFound = () => (
  <div className={detailPageClass}>
    <div className={`${noticeClass} mt-6`}>
      <i className="ri-search-line text-4xl text-primary" aria-hidden="true" />
      <p className="max-w-md text-foreground">
        No encontramos lo que buscas. Puede que haya sido eliminado.
      </p>
      <Button asChild size="lg" className="rounded-xl px-6 font-semibold hover:bg-orquidea-70">
        <Link to={ACCOUNTS_PATH}>Volver a cuentas</Link>
      </Button>
    </div>
  </div>
);

export const AccountDetailError = ({ onRetry }: { onRetry: () => void }) => (
  <div className={detailPageClass}>
    <div className={`${noticeClass} mt-6`} role="alert">
      <i className="ri-error-warning-line text-4xl text-destructive" aria-hidden="true" />
      <h2 className="text-lg font-semibold text-foreground">No pudimos cargar esta cuenta</h2>
      <p className="max-w-md text-sm text-muted-foreground">
        Revisa tu conexión a internet e inténtalo de nuevo.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Button
          type="button"
          size="lg"
          onClick={onRetry}
          className="rounded-xl px-6 font-semibold hover:bg-orquidea-70"
        >
          <i className="ri-refresh-line" aria-hidden="true" />
          Reintentar
        </Button>
        <Button asChild variant="outline" size="lg" className="rounded-xl px-6">
          <Link to={ACCOUNTS_PATH}>Volver a cuentas</Link>
        </Button>
      </div>
    </div>
  </div>
);

export const AccountEvolutionEmpty = () => (
  <div className={noticeClass}>
    <i className="ri-line-chart-line text-4xl text-primary" aria-hidden="true" />
    <h2 className="text-lg font-semibold text-foreground">Evolución del saldo</h2>
    <p className="max-w-md text-sm text-muted-foreground">
      Aún no hay suficientes movimientos para ver la evolución. Registra un gasto o un
      ingreso en esta cuenta.
    </p>
    <div className="flex flex-wrap justify-center gap-3">
      <Button asChild size="lg" className="rounded-xl px-6 font-semibold hover:bg-orquidea-70">
        <Link to="/gastos/nuevo">
          <i className="ri-shopping-bag-3-line" aria-hidden="true" />
          Registrar gasto
        </Link>
      </Button>
      <Button asChild variant="outline" size="lg" className="rounded-xl px-6">
        <Link to="/ingresos/nuevo">
          <i className="ri-money-dollar-circle-line" aria-hidden="true" />
          Registrar ingreso
        </Link>
      </Button>
    </div>
  </div>
);

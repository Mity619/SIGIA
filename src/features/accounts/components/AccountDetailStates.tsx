import { Link } from "react-router-dom";
import { Button } from "@/shared/components/shadcn/button";
import { Skeleton } from "@/shared/components/shadcn/skeleton";
import { LoadingRegion } from "@/shared/components/ui/loading/LoadingRegion";
import { SkeletonText } from "@/shared/components/ui/loading/SkeletonText";
import { ACCOUNTS_PATH, BALANCE_COMPARISON_PERIODS } from "../constants/account.constants";
import { AccountDetailHeaderSkeleton } from "./AccountDetailHeader";
import {
  movementListClass,
  movementRowClass,
  movementSectionClass,
  movementTitleClass,
} from "./AccountMovementList";
import {
  chartAreaClass,
  chartCaptionClass,
  chartCardClass,
  comparisonGridClass,
  comparisonTileClass,
} from "./chartTheme";

const SKELETON_ROWS = 3;

export const detailPageClass = "mx-auto flex w-full max-w-3xl flex-col gap-6 px-2 pb-6 sm:px-6";

const noticeClass =
  "flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-border px-4 py-12 text-center";

/** Misma forma que AccountBalanceChart + AccountBalanceComparison (fallback del lazy). */
export const AccountChartsSkeleton = () => (
  <>
    <div className={chartCardClass}>
      <SkeletonText className={chartCaptionClass} barClassName="w-40" />
      <Skeleton className={chartAreaClass} />
    </div>
    <div className={chartCardClass}>
      <SkeletonText className={chartCaptionClass} barClassName="w-72" />
      <Skeleton className={chartAreaClass} />
      <div className={comparisonGridClass}>
        {BALANCE_COMPARISON_PERIODS.map((period) => (
          <div key={period.key} className={comparisonTileClass}>
            <SkeletonText className="text-sm" barClassName="w-28" />
            <SkeletonText className="font-semibold" barClassName="w-32" />
            <SkeletonText barClassName="w-16" />
          </div>
        ))}
      </div>
    </div>
  </>
);

const AccountMovementListSkeleton = () => (
  <div className={movementSectionClass}>
    <SkeletonText className={movementTitleClass} barClassName="w-36" />
    <div className={movementListClass}>
      {Array.from({ length: SKELETON_ROWS }, (_, index) => (
        <div key={index} className={movementRowClass}>
          <Skeleton className="size-10 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1">
            <SkeletonText className="font-medium" barClassName="w-32" />
            <SkeletonText className="text-sm" barClassName="w-24" />
          </div>
          <SkeletonText className="shrink-0 font-bold" barClassName="w-24" />
        </div>
      ))}
    </div>
  </div>
);

export const AccountDetailSkeleton = () => (
  <LoadingRegion className={detailPageClass} label="Cargando cuenta">
    <AccountDetailHeaderSkeleton />
    <AccountChartsSkeleton />
    <AccountMovementListSkeleton />
  </LoadingRegion>
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

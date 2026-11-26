import { lazy, Suspense } from "react";
import { useParams } from "react-router-dom";
import { AccountDetailHeader } from "@/features/accounts/components/AccountDetailHeader";
import { AccountMovementList } from "@/features/accounts/components/AccountMovementList";
import {
  AccountChartsSkeleton,
  AccountDetailError,
  AccountDetailSkeleton,
  AccountEvolutionEmpty,
  AccountNotFound,
  detailPageClass,
} from "@/features/accounts/components/AccountDetailStates";
import { useAccountDetail } from "@/features/accounts/hooks/useAccountDetail";

// Recharts se carga solo al abrir el detalle (no penaliza la carga inicial)
const AccountBalanceChart = lazy(
  () => import("@/features/accounts/components/AccountBalanceChart"),
);
const AccountBalanceComparison = lazy(
  () => import("@/features/accounts/components/AccountBalanceComparison"),
);

// HU-15: evolución del saldo de una cuenta.
export const AccountDetail = () => {
  const { accountId = "" } = useParams();
  const { state, retry } = useAccountDetail(accountId);

  if (state.status === "loading") return <AccountDetailSkeleton />;
  if (state.status === "not-found") return <AccountNotFound />;
  if (state.status === "error") return <AccountDetailError onRetry={retry} />;

  const { account, balance, series, comparisons, movements, canShowEvolution } = state;

  return (
    <div className={detailPageClass}>
      <AccountDetailHeader account={account} balance={balance} />

      {canShowEvolution ? (
        <Suspense fallback={<AccountChartsSkeleton />}>
          <AccountBalanceChart series={series} />
          <AccountBalanceComparison balance={balance} comparisons={comparisons} />
        </Suspense>
      ) : (
        <AccountEvolutionEmpty />
      )}

      <AccountMovementList movements={movements} />
    </div>
  );
};

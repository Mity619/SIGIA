import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/shared/components/shadcn/skeleton";
import { SkeletonText } from "@/shared/components/ui/loading/SkeletonText";
import { formatCurrency } from "@/shared/utils/format";
import { ACCOUNTS_PATH } from "../constants/account.constants";
import type { AccountDoc } from "../types/account.types";

interface Props {
  account: AccountDoc;
  balance: number;
}

const headerClass = "flex flex-col gap-4 pt-4";
const titleRowClass = "flex flex-wrap items-center gap-3";
const titleTextClass = "text-2xl sm:text-3xl";
const balanceCardClass = "rounded-2xl border border-border bg-card p-5 shadow-sm";
const balanceTextClass = "mt-2 text-3xl";

export const AccountDetailHeaderSkeleton = () => (
  <div className={headerClass}>
    <SkeletonText className="text-sm" barClassName="w-20" />
    <div className={titleRowClass}>
      <Skeleton className="size-12 shrink-0 rounded-full" />
      <SkeletonText className={titleTextClass} barClassName="w-48" />
    </div>
    <div className={balanceCardClass}>
      <SkeletonText className="text-sm" barClassName="w-28" />
      <SkeletonText className={balanceTextClass} barClassName="w-40" />
    </div>
  </div>
);

export const AccountDetailHeader = ({ account, balance }: Props) => (
  <header className={headerClass}>
    <Link
      to={ACCOUNTS_PATH}
      className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
    >
      <i className="ri-arrow-left-line" aria-hidden="true" />
      Cuentas
    </Link>

    <div className={titleRowClass}>
      <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-muted text-primary">
        <i
          className={cn("text-2xl", account.default ? "ri-wallet-3-line" : "ri-bank-line")}
          aria-hidden="true"
        />
      </span>
      <h1 className={cn("min-w-0 break-words font-bold tracking-tight text-foreground", titleTextClass)}>
        {account.name}
      </h1>
      {account.default && (
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
          <i className="ri-lock-line" aria-hidden="true" />
          Por defecto
        </span>
      )}
    </div>

    <dl className={balanceCardClass}>
      <dt className="flex items-center gap-2 text-sm text-muted-foreground">
        <i className="ri-money-dollar-circle-line text-primary" aria-hidden="true" />
        Saldo actual
      </dt>
      <dd
        className={cn(
          balanceTextClass,
          "font-bold",
          balance < 0 ? "text-destructive" : "text-foreground",
        )}
      >
        {formatCurrency(balance)}
      </dd>
    </dl>
  </header>
);

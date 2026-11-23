import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/shared/components/shadcn/button";
import { Skeleton } from "@/shared/components/shadcn/skeleton";
import { LoadingRegion } from "@/shared/components/ui/loading/LoadingRegion";
import { SkeletonText } from "@/shared/components/ui/loading/SkeletonText";
import { getAccountDetailPath } from "../constants/account.constants";
import type { AccountDoc } from "../types/account.types";
import { canDeleteAccount } from "../utils/accountRules";

const SKELETON_ROWS = 3;

const listClass = "flex flex-col gap-3";
const rowClass =
  "flex items-center gap-3 rounded-xl border border-border bg-card p-3";
const noticeClass =
  "flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-border px-4 py-12 text-center";

interface Props {
  accounts: AccountDoc[];
  isLoading: boolean;
  hasError: boolean;
  onDelete: (account: AccountDoc) => void;
  onCreateFirst: () => void;
}

const AccountListSkeleton = () => (
  <LoadingRegion className={listClass} label="Cargando cuentas">
    {Array.from({ length: SKELETON_ROWS }, (_, index) => (
      <div key={index} className={rowClass}>
        <Skeleton className="size-10 shrink-0 rounded-full" />
        <SkeletonText className="min-w-0 flex-1 font-medium" barClassName="w-32" />
        <Skeleton className="h-6 w-24 shrink-0 rounded-full" />
      </div>
    ))}
  </LoadingRegion>
);

const AccountListError = () => (
  <div className={noticeClass} role="alert">
    <i
      className="ri-error-warning-line text-4xl text-destructive"
      aria-hidden="true"
    />
    <h3 className="text-lg font-semibold text-foreground">
      No pudimos cargar tus cuentas
    </h3>
    <p className="max-w-md text-sm text-muted-foreground">
      Revisa tu conexión a internet y vuelve a cargar la página.
    </p>
  </div>
);

const AccountListEmpty = ({ onCreateFirst }: Pick<Props, "onCreateFirst">) => (
  <div className={noticeClass}>
    <i className="ri-wallet-3-line text-4xl text-primary" aria-hidden="true" />
    <h3 className="text-lg font-semibold text-foreground">
      Aún no tienes cuentas
    </h3>
    <p className="max-w-md text-sm text-muted-foreground">
      Crea una cuenta para indicar dónde tienes tu dinero: bolsillo, ahorros o
      banco.
    </p>
    <Button
      type="button"
      size="lg"
      onClick={onCreateFirst}
      className="rounded-xl px-6 font-semibold hover:bg-orquidea-70"
    >
      Crear mi primera cuenta
    </Button>
  </div>
);

interface AccountRowProps {
  account: AccountDoc;
  onDelete: (account: AccountDoc) => void;
}

const AccountRow = ({ account, onDelete }: AccountRowProps) => (
  <li className={rowClass}>
    <Link
      to={getAccountDetailPath(account.id)}
      aria-label={`Ver detalle de la cuenta ${account.name}`}
      className="group -m-1 flex min-w-0 flex-1 items-center gap-3 rounded-lg p-1 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-primary">
        <i
          className={cn(
            "text-xl",
            account.default ? "ri-wallet-3-line" : "ri-bank-line",
          )}
          aria-hidden="true"
        />
      </span>
      <span className="min-w-0 flex-1 truncate font-medium text-foreground group-hover:text-primary">
        {account.name}
      </span>
      <i
        className="ri-arrow-right-s-line text-xl text-muted-foreground group-hover:text-primary"
        aria-hidden="true"
      />
    </Link>
    {canDeleteAccount(account) ? (
      <Button
        type="button"
        variant="ghost"
        size="icon-lg"
        onClick={() => onDelete(account)}
        aria-label={`Eliminar cuenta ${account.name}`}
        title="Eliminar cuenta"
        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
      >
        <i className="ri-delete-bin-line text-lg" aria-hidden="true" />
      </Button>
    ) : (
      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
        <i className="ri-lock-line" aria-hidden="true" />
        Por defecto
      </span>
    )}
  </li>
);

export const AccountList = ({
  accounts,
  isLoading,
  hasError,
  onDelete,
  onCreateFirst,
}: Props) => {
  if (isLoading) return <AccountListSkeleton />;
  if (hasError) return <AccountListError />;
  if (accounts.length === 0) {
    return <AccountListEmpty onCreateFirst={onCreateFirst} />;
  }

  return (
    <ul className={listClass}>
      {accounts.map((account) => (
        <AccountRow key={account.id} account={account} onDelete={onDelete} />
      ))}
    </ul>
  );
};

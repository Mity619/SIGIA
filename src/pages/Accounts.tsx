import { useRef } from "react";
import { AccountForm } from "@/features/accounts/components/AccountForm";
import { AccountList } from "@/features/accounts/components/AccountList";
import { useAccount } from "@/features/accounts/hooks/useAccount";
import { useAccountDeletion } from "@/features/accounts/hooks/useAccountDeletion";
import { useAccountLoadError } from "@/features/accounts/hooks/useAccountLoadError";
import { ConfirmDialog } from "@/shared/components/ui/ConfirmDialog";
import { Header } from "@/shared/components/ui/sections/Header";

export const Accounts = () => {
  //* Contexts & hooks
  const { accounts, loadingAccounts } = useAccount();
  const hasAccountsError = useAccountLoadError();
  const {
    accountToDelete,
    isDeleting,
    requestDeletion,
    cancelDeletion,
    confirmDeletion,
  } = useAccountDeletion();

  //* Refs
  const nameInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-2 pb-6 sm:px-6">
      <Header
        title="Cuentas"
        paragraph="Organiza dónde tienes tu dinero: bolsillo, ahorros o banco."
      />

      <section className="flex flex-col gap-4" aria-labelledby="new-account">
        <h2 id="new-account" className="text-lg font-semibold text-foreground">
          Nueva cuenta
        </h2>
        <AccountForm nameInputRef={nameInputRef} />
      </section>

      <section className="flex flex-col gap-4" aria-labelledby="my-accounts">
        <h2 id="my-accounts" className="text-lg font-semibold text-foreground">
          Mis cuentas
        </h2>
        <AccountList
          accounts={accounts}
          isLoading={loadingAccounts}
          hasError={hasAccountsError}
          onDelete={requestDeletion}
          onCreateFirst={() => nameInputRef.current?.focus()}
        />
      </section>

      <ConfirmDialog
        open={accountToDelete !== null}
        onOpenChange={(open) => !open && cancelDeletion()}
        title={`¿Eliminar la cuenta «${accountToDelete?.name ?? ""}»?`}
        description="Esta acción no se puede deshacer."
        confirmText="Sí, eliminar"
        isDestructive
        isLoading={isDeleting}
        onConfirm={confirmDeletion}
      />
    </div>
  );
};

import { useState } from "react";
import { useAccount } from "./useAccount";
import type { AccountDoc } from "../types/account.types";
import { canDeleteAccount } from "../utils/accountRules";

export const useAccountDeletion = () => {
  //* Context
  const { removeAccount } = useAccount();

  //* States
  const [accountToDelete, setAccountToDelete] = useState<AccountDoc | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);

  //* Handlers
  const requestDeletion = (account: AccountDoc) => {
    if (canDeleteAccount(account)) {
      setAccountToDelete(account);
    }
  };

  const cancelDeletion = () => {
    if (!isDeleting) {
      setAccountToDelete(null);
    }
  };

  const confirmDeletion = async () => {
    if (!accountToDelete || isDeleting) return;

    setIsDeleting(true);
    await removeAccount(accountToDelete.id);
    setIsDeleting(false);
    setAccountToDelete(null);
  };

  return {
    accountToDelete,
    isDeleting,
    requestDeletion,
    cancelDeletion,
    confirmDeletion,
  };
};

import { useEffect } from "react";
import { useSnackbar } from "notistack";
import { useAccount } from "./useAccount";
import { ACCOUNTS_LOAD_ERROR_MESSAGE } from "../utils/accountErrors";

export const useAccountLoadError = (): boolean => {
  const { hasAccountsError } = useAccount();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (hasAccountsError) {
      enqueueSnackbar(ACCOUNTS_LOAD_ERROR_MESSAGE, { variant: "error" });
    }
  }, [hasAccountsError, enqueueSnackbar]);

  return hasAccountsError;
};

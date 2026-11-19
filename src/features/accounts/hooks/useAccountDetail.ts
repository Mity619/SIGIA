import { useEffect, useMemo, useState } from "react";
import { useSnackbar } from "notistack";
import { resolveEntryType } from "@/domain";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useAllItems } from "@/features/items/hooks/useAllItems";
import { toDomainEntry } from "@/features/items/mappers";
import type {
  AccountDoc,
  AccountMovement,
  BalanceComparison,
  BalancePoint,
} from "../types/account.types";
import {
  buildBalanceComparisons,
  buildDailyBalanceSeries,
  calculateBalance,
  hasEnoughMovements,
  movementsUntil,
  sortMovementsByDateDesc,
} from "../utils/accountBalance";
import {
  subscribeToAccount,
  subscribeToAccountEntries,
  type AccountEntryDoc,
} from "../utils/accountDetailData";
import { ACCOUNT_DETAIL_LOAD_ERROR_MESSAGE } from "../utils/accountErrors";

export type AccountDetailState =
  | { status: "loading" }
  | { status: "not-found" }
  | { status: "error" }
  | {
      status: "ready";
      account: AccountDoc;
      balance: number;
      series: BalancePoint[];
      comparisons: BalanceComparison[];
      movements: AccountMovement[];
      canShowEvolution: boolean;
    };

type RequestResult<T> = { key: string; value: T };

const toRequestKey = (uid: string, accountId: string, attempt: number): string =>
  JSON.stringify([uid, accountId, attempt]);

export const useAccountDetail = (accountId: string) => {
  //* Contexts & hooks
  const { getUserId } = useAuth();
  const uid = getUserId() ?? "";
  const { enqueueSnackbar } = useSnackbar();
  const { itemTypeById, archivedIds, loading: loadingItems } = useAllItems(uid);

  //* States
  const [attempt, setAttempt] = useState(0);
  // Cada resultado guarda la solicitud que lo produjo: al cambiar de cuenta o reintentar,
  // los datos anteriores dejan de valer sin tener que reiniciar el estado.
  const [accountResult, setAccountResult] = useState<RequestResult<AccountDoc | null> | null>(null);
  const [entriesResult, setEntriesResult] = useState<RequestResult<AccountEntryDoc[]> | null>(null);
  const [errorRequestKey, setErrorRequestKey] = useState<string | null>(null);
  // Fecha de referencia fija durante la visita
  const [today] = useState(() => new Date());

  const requestKey = toRequestKey(uid, accountId, attempt);
  const account = accountResult?.key === requestKey ? accountResult.value : undefined;
  const entries = entriesResult?.key === requestKey ? entriesResult.value : undefined;
  const hasError = errorRequestKey === requestKey;

  useEffect(() => {
    const key = toRequestKey(uid, accountId, attempt);
    const handleError = () => setErrorRequestKey(key);
    const unsubscribeAccount = subscribeToAccount(
      uid,
      accountId,
      (value) => setAccountResult({ key, value }),
      handleError,
    );
    const unsubscribeEntries = subscribeToAccountEntries(
      uid,
      accountId,
      (value) => setEntriesResult({ key, value }),
      handleError,
    );

    return () => {
      unsubscribeAccount();
      unsubscribeEntries();
    };
  }, [uid, accountId, attempt]);

  useEffect(() => {
    if (hasError) {
      enqueueSnackbar(ACCOUNT_DETAIL_LOAD_ERROR_MESSAGE, { variant: "error" });
    }
  }, [hasError, enqueueSnackbar]);

  const movements = useMemo<AccountMovement[]>(
    () =>
      (entries ?? []).flatMap((entryDoc) => {
        // Mismo criterio que los totales: los conceptos eliminados (archivados) no cuentan
        if (archivedIds.has(entryDoc.itemId)) return [];

        const entry = toDomainEntry(entryDoc);
        const type = resolveEntryType(entry, itemTypeById);
        if (!type) return [];

        return [{ id: entry.id, name: entryDoc.name, type, amount: entry.amount, date: entry.date }];
      }),
    [entries, archivedIds, itemTypeById],
  );

  const summary = useMemo(() => {
    // Los movimientos con fecha futura aparecen en la lista, pero aún no afectan el saldo
    const pastMovements = movementsUntil(movements, today);
    return {
      balance: calculateBalance(pastMovements),
      series: buildDailyBalanceSeries(pastMovements),
      comparisons: buildBalanceComparisons(pastMovements, today),
      movements: sortMovementsByDateDesc(movements),
      canShowEvolution: hasEnoughMovements(pastMovements),
    };
  }, [movements, today]);

  const retry = () => setAttempt((current) => current + 1);

  let state: AccountDetailState;
  if (account === null) state = { status: "not-found" };
  else if (hasError) state = { status: "error" };
  else if (account === undefined || entries === undefined || loadingItems) {
    state = { status: "loading" };
  } else state = { status: "ready", account, ...summary };

  return { state, retry };
};

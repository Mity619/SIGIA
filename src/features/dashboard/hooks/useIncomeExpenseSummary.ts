import { useEffect, useMemo, useState } from "react";
import { useSnackbar } from "notistack";
import type { DateRange, DomainEntry } from "@/domain";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useAllItems } from "@/features/items/hooks/useAllItems";
import { LOAD_ERROR_MESSAGES } from "../constants/incomeExpense.constants";
import { subscribeToEntriesInRange } from "../services/entriesInRange.service";
import type {
  DateRangeInput,
  IncomeExpenseSummary,
  LoadErrorKind,
} from "../types/incomeExpense.types";
import { getDefaultDateRangeInput, validateDateRangeInput } from "../utils/dateRange";
import { buildIncomeExpenseSummary } from "../utils/incomeExpenseSummary";
import { getLoadErrorKind } from "../utils/loadErrors";

type RequestResult<T> = { key: string; value: T };

const toRequestKey = (uid: string, range: DateRange, attempt: number): string =>
  JSON.stringify([uid, range.from.getTime(), range.to.getTime(), attempt]);

const isBrowserOnline = (): boolean => navigator.onLine;

// HU-20: gastos frente a ingresos por mes y en total, para el rango elegido.
export const useIncomeExpenseSummary = () => {
  //* Contexts & hooks
  const { getUserId } = useAuth();
  const uid = getUserId() ?? "";
  const { enqueueSnackbar } = useSnackbar();
  const { itemTypeById, archivedIds, loading: loadingItems } = useAllItems(uid);

  //* States
  const [today] = useState(() => new Date());
  const defaultRange = useMemo(() => getDefaultDateRangeInput(today), [today]);
  const [rangeInput, setRangeInput] = useState<DateRangeInput>(defaultRange);
  const [attempt, setAttempt] = useState(0);
  // Cada resultado guarda la solicitud que lo produjo: al cambiar el rango o reintentar,
  // los datos anteriores dejan de valer sin reiniciar el estado.
  const [entriesResult, setEntriesResult] = useState<RequestResult<DomainEntry[]> | null>(null);
  const [errorResult, setErrorResult] = useState<RequestResult<LoadErrorKind> | null>(null);

  const validation = useMemo(() => validateDateRangeInput(rangeInput), [rangeInput]);
  const queryRange = validation.ok ? validation.range : null;
  const requestKey = uid && queryRange ? toRequestKey(uid, queryRange, attempt) : null;

  useEffect(() => {
    // Rango inválido o sin sesión: no se consulta
    if (!uid || !queryRange) return;
    const key = toRequestKey(uid, queryRange, attempt);

    return subscribeToEntriesInRange(
      uid,
      queryRange,
      ({ entries, fromCache }) => {
        setEntriesResult({ key, value: entries });
        // Sin conexión Firestore responde desde la caché; se avisa en vez de mostrar datos incompletos
        setErrorResult(fromCache && !isBrowserOnline() ? { key, value: "offline" } : null);
      },
      (error) => setErrorResult({ key, value: getLoadErrorKind(error, isBrowserOnline()) }),
    );
  }, [uid, queryRange, attempt]);

  const entries = entriesResult?.key === requestKey ? entriesResult.value : undefined;
  const errorKind = errorResult?.key === requestKey ? errorResult.value : null;
  const error = errorKind ? LOAD_ERROR_MESSAGES[errorKind] : null;

  useEffect(() => {
    if (error) enqueueSnackbar(error, { variant: "error", preventDuplicate: true });
  }, [error, requestKey, enqueueSnackbar]);

  const data = useMemo<IncomeExpenseSummary | null>(
    () =>
      entries && queryRange
        ? buildIncomeExpenseSummary(entries, itemTypeById, archivedIds, queryRange)
        : null,
    [entries, itemTypeById, archivedIds, queryRange],
  );

  const isLoading = validation.ok && !error && (!data || loadingItems);

  return {
    data,
    isLoading,
    error,
    range: rangeInput,
    rangeError: validation.ok ? null : validation.error,
    isDefaultRange: rangeInput.from === defaultRange.from && rangeInput.to === defaultRange.to,
    setFrom: (from: string) => setRangeInput((current) => ({ ...current, from })),
    setTo: (to: string) => setRangeInput((current) => ({ ...current, to })),
    resetRange: () => setRangeInput(defaultRange),
    retry: () => setAttempt((current) => current + 1),
  };
};

export type IncomeExpenseSummaryState = ReturnType<typeof useIncomeExpenseSummary>;

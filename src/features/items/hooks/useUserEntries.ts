import { useEffect, useMemo } from "react";
import { useCollection } from "@/firebase/hooks/useCollection";
import type { EntryDoc } from "../types/items.types";
import { toDomainEntry } from "../mappers";

/**
 * Todos los movimientos del usuario (gastos e ingresos), en tiempo real.
 * Se filtran y agregan en memoria con las funciones de src/domain (HU-11, HU-12, HU-13).
 */
export function useUserEntries(uid: string) {
  const col = useCollection<EntryDoc>(`users/${uid}/entries`);

  useEffect(() => {
    const unsubscribe = col.suscribe([]);
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid]);

  const entries = useMemo(() => col.results.map(toDomainEntry), [col.results]);

  // `docs` conserva los documentos originales (Timestamp) para editar/eliminar.
  return { entries, docs: col.results, loading: col.isPending, error: col.error };
}

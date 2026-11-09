import { useEffect, useMemo } from "react";
import { useCollection } from "@/firebase/hooks/useCollection";
import type { TransactionType } from "@/domain";
import type { ItemDoc } from "../types/items.types";

/**
 * Todos los conceptos del usuario (incluye archivados), para resolver el tipo de
 * movimientos antiguos que no guardaron `type`.
 */
export function useAllItems(uid: string) {
  const col = useCollection<ItemDoc>(`users/${uid}/items`);

  useEffect(() => {
    const unsubscribe = col.suscribe([]);
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid]);

  const itemTypeById = useMemo(
    () => new Map<string, TransactionType>(col.results.map((i) => [i.id, i.type])),
    [col.results],
  );

  return { items: col.results, itemTypeById, loading: col.isPending };
}

import { useEffect, useState } from "react";
import { useCollection } from "@/firebase/hooks/useCollection";
import type { ItemDoc } from "../types/items.types";

/** Un concepto por id, en tiempo real. `item` es null si no existe. */
export function useItem(uid: string, itemId: string) {
  const col = useCollection<ItemDoc>(`users/${uid}/items`);
  const [item, setItem] = useState<ItemDoc | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!itemId) return;
    const unsubscribe = col.suscribeById(itemId, (doc) => {
      setItem(doc);
      setLoaded(true);
    });
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid, itemId]);

  return { item, loading: !loaded && !col.error, error: col.error };
}

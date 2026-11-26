import {
  Timestamp,
  collection,
  onSnapshot,
  query,
  where,
  type Unsubscribe,
} from "firebase/firestore";
import type { DateRange, DomainEntry } from "@/domain";
import { db } from "@/firebase/config";
import { toDomainEntry } from "@/features/items/mappers";
import type { EntryDoc } from "@/features/items/types/items.types";

export interface EntriesInRangeSnapshot {
  entries: DomainEntry[];
  /** true si Firestore respondió desde la caché local (p. ej. sin conexión). */
  fromCache: boolean;
}

/**
 * Movimientos del usuario con fecha dentro de [from, to), en tiempo real.
 * Al ser un rango sobre un solo campo, usa el índice automático de `date`.
 */
export const subscribeToEntriesInRange = (
  userId: string,
  range: DateRange,
  onChange: (snapshot: EntriesInRangeSnapshot) => void,
  onError: (error: unknown) => void,
): Unsubscribe =>
  onSnapshot(
    query(
      collection(db, "users", userId, "entries"),
      where("date", ">=", Timestamp.fromDate(range.from)),
      where("date", "<", Timestamp.fromDate(range.to)),
    ),
    // Incluye cambios de metadatos para enterarse cuando se pierde o recupera la conexión
    { includeMetadataChanges: true },
    (snapshot) =>
      onChange({
        entries: snapshot.docs.map((entry) =>
          toDomainEntry({ ...(entry.data() as EntryDoc), id: entry.id }),
        ),
        fromCache: snapshot.metadata.fromCache,
      }),
    onError,
  );

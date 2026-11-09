import { useEffect } from 'react';
import { useCollection } from '@/firebase/hooks/useCollection';
import type { EntryDoc } from '../types/items.types';

export function useEntriesByItem(uid: string, itemId: string) {
  const col = useCollection<EntryDoc>(`users/${uid}/entries`);

  useEffect(() => {
    if (!itemId) return;
    const unsubscribe = col.suscribe([['itemId', '==', itemId]]);
    return unsubscribe;
  }, [uid, itemId]);

  // Firestore no ordena: orden en memoria por fecha desc
  const entries = [...col.results].sort(
    (a, b) => b.date.toMillis() - a.date.toMillis(),
  );

  return { entries, loading: col.isPending, error: col.error };
}
import { useEffect } from 'react';
import { useCollection } from '@/firebase/hooks/useCollection';
import type { ItemDoc, TransactionType } from '../types/items.types';

export function useItems(uid: string, type: TransactionType) {
  const col = useCollection<ItemDoc>(`users/${uid}/items`);

  useEffect(() => {
    // Filtros combinados: type + no archivados
    const unsubscribe = col.suscribe([
      ['type', '==', type],
      ['archived', '==', false],
    ]);
    return unsubscribe;
  }, [uid, type]);

  // Orden en memoria (useCollection no aplica orderBy)
  const items = [...col.results].sort((a, b) => a.name.localeCompare(b.name));

  return { items, loading: col.isPending, error: col.error };
}
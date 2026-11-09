import { useCollection } from '@/firebase/hooks/useCollection';
import type { ItemDoc } from '../types/items.types';

export function useArchiveItem(uid: string) {
  const col = useCollection<ItemDoc>(`users/${uid}/items`);
  const archive = (itemId: string) =>
    col.update(itemId, { archived: true, updatedAt: null as any });
  return { archive };
}
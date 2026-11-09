import { useCollection } from '@/firebase/hooks/useCollection';
import type { EntryDoc } from '../types/items.types';

export function useEditEntry(uid: string) {
  const col = useCollection<EntryDoc>(`users/${uid}/entries`);
  return { update: col.update, remove: col.remove };
}
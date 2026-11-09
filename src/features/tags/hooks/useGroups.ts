import { useEffect } from 'react';
import { useCollection } from '@/firebase/hooks/useCollection';
import type { GroupDoc } from '../types/tags.types';

export function useGroups(uid: string) {
  const col = useCollection<GroupDoc>(`users/${uid}/groups`);
  useEffect(() => {
    const unsubscribe = col.suscribe([]);
    return unsubscribe;
  }, [uid]);
  return { groups: col.results, loading: col.isPending, error: col.error };
}
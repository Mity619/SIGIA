import { useEffect, useMemo } from 'react';
import { useCollection } from '@/firebase/hooks/useCollection';
import type { GroupDoc } from '../types/tags.types';

const byName = (a: GroupDoc, b: GroupDoc) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' });

/** Grupos del usuario en tiempo real, ordenados alfabéticamente. */
export function useGroups(uid: string) {
  const col = useCollection<GroupDoc>(`users/${uid}/groups`);
  useEffect(() => {
    const unsubscribe = col.suscribe([]);
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid]);
  const groups = useMemo(() => [...col.results].sort(byName), [col.results]);
  return { groups, loading: col.isPending, error: col.error };
}

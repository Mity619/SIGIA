import { useState } from 'react';
import {
  arrayRemove,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  where,
  writeBatch,
} from 'firebase/firestore';
import { useSnackbar } from 'notistack';
import { db } from '@/firebase/config';

/**
 * Elimina un grupo (HU-08) y, en la misma escritura, lo quita de los conceptos y
 * movimientos que lo tenían. Así no quedan ids huérfanos en `groupIds`.
 */
export function useDeleteGroup(uid: string) {
  const { enqueueSnackbar } = useSnackbar();
  const [deleting, setDeleting] = useState(false);

  const remove = async (groupId: string): Promise<boolean> => {
    setDeleting(true);
    try {
      const tagged = (path: string) =>
        getDocs(query(collection(db, path), where('groupIds', 'array-contains', groupId)));
      const [items, entries] = await Promise.all([
        tagged(`users/${uid}/items`),
        tagged(`users/${uid}/entries`),
      ]);

      const batch = writeBatch(db);
      batch.delete(doc(db, `users/${uid}/groups`, groupId));
      for (const d of [...items.docs, ...entries.docs]) {
        batch.update(d.ref, { groupIds: arrayRemove(groupId), updatedAt: serverTimestamp() });
      }
      await batch.commit();

      enqueueSnackbar('Grupo eliminado.', { variant: 'success' });
      return true;
    } catch {
      enqueueSnackbar('No se pudo eliminar el grupo. Inténtalo de nuevo.', { variant: 'error' });
      return false;
    } finally {
      setDeleting(false);
    }
  };

  return { remove, deleting };
}

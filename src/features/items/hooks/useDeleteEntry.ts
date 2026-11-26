import { doc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { useSnackbar } from 'notistack';
import { db } from '@/firebase/config';
import type { EntryDoc } from '../types/items.types';

/**
 * Elimina un movimiento y, en la misma escritura, recalcula el "último valor" del
 * concepto con el movimiento más reciente que quede. Así la card no muestra un
 * monto que ya no existe.
 */
export function useDeleteEntry(uid: string) {
  const { enqueueSnackbar } = useSnackbar();

  const remove = async (entry: EntryDoc, allEntries: EntryDoc[]): Promise<boolean> => {
    try {
      const remaining = allEntries
        .filter((e) => e.id !== entry.id)
        .sort((a, b) => b.date.toMillis() - a.date.toMillis());
      const latest = remaining[0];

      const batch = writeBatch(db);
      batch.delete(doc(db, `users/${uid}/entries`, entry.id!));
      batch.update(doc(db, `users/${uid}/items`, entry.itemId), {
        lastAmount: latest?.amount ?? 0,
        lastUsedAt: latest?.date ?? null,
        updatedAt: serverTimestamp(),
      });
      await batch.commit();

      enqueueSnackbar('Movimiento eliminado.', { variant: 'success' });
      return true;
    } catch {
      enqueueSnackbar('No se pudo eliminar el movimiento. Inténtalo de nuevo.', { variant: 'error' });
      return false;
    }
  };

  return { remove };
}

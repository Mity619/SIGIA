import { useState } from 'react';
import { Timestamp, doc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { useSnackbar } from 'notistack';
import { db } from '@/firebase/config';
import type { EntryDoc } from '../types/items.types';

export interface EntryChanges {
  name: string;
  amount: number;
  date: Date;
  accountId: string;
}

/**
 * Edita un movimiento (HU-06 / HU-07) y, en la misma escritura, recalcula el
 * "último valor" del concepto con el movimiento más reciente DESPUÉS del cambio:
 * si se cambia la fecha, el más reciente puede pasar a ser otro.
 */
export function useUpdateEntry(uid: string) {
  const [saving, setSaving] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const update = async (
    entry: EntryDoc,
    changes: EntryChanges,
    itemEntries: EntryDoc[],
  ): Promise<boolean> => {
    setSaving(true);
    try {
      const date = Timestamp.fromDate(changes.date);
      const after = itemEntries.map((e) =>
        e.id === entry.id ? { ...e, amount: changes.amount, date } : e,
      );
      const latest = [...after].sort((a, b) => b.date.toMillis() - a.date.toMillis())[0];

      const batch = writeBatch(db);
      // itemId y type no se tocan: el movimiento sigue en el mismo concepto
      batch.update(doc(db, `users/${uid}/entries`, entry.id!), {
        name: changes.name,
        amount: changes.amount,
        date,
        accountId: changes.accountId,
        updatedAt: serverTimestamp(),
      });
      batch.update(doc(db, `users/${uid}/items`, entry.itemId), {
        lastAmount: latest?.amount ?? 0,
        lastUsedAt: latest?.date ?? null,
        updatedAt: serverTimestamp(),
      });
      await batch.commit();

      enqueueSnackbar('Movimiento actualizado.', { variant: 'success' });
      return true;
    } catch {
      enqueueSnackbar('No se pudo actualizar el movimiento. Inténtalo de nuevo.', { variant: 'error' });
      return false;
    } finally {
      setSaving(false);
    }
  };

  return { update, saving };
}

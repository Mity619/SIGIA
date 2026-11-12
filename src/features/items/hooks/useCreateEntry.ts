import { useState } from 'react';
import { Timestamp, collection, doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { useSnackbar } from 'notistack';
import { db } from '@/firebase/config';
import { getAuthErrorMessage } from '@/features/auth/utils/firebaseErrors';
import type { TransactionType, Frequency } from '../types/items.types';

interface CreateEntryInput {
  type: TransactionType;
  itemId?: string;                       // si se reutiliza (HU-05)
  newItem?: {                            // si es nuevo (HU-04)
    name: string;
    type: TransactionType;
    frequency: Frequency;
  };
  accountId: string;
  amount: number;
  date: Date;
  name: string;
  groupIds?: string[];
}

export function useCreateEntry(uid: string) {
  const [saving, setSaving] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const submit = async (input: CreateEntryInput): Promise<boolean> => {
    setSaving(true);
    try {
      // Una sola escritura atómica: o se guardan item + movimiento, o nada (HU-06: sin huérfanos).
      // Es transacción (no batch) porque al reutilizar hay que leer el concepto: un movimiento
      // con fecha anterior al último no debe cambiar el "último valor" de la card (HU-10).
      const itemsRef = collection(db, `users/${uid}/items`);
      const entriesRef = collection(db, `users/${uid}/entries`);
      const groupIds = input.groupIds || [];
      const date = Timestamp.fromDate(input.date);

      await runTransaction(db, async (tx) => {
        let itemRef;
        if (input.itemId) {
          itemRef = doc(itemsRef, input.itemId);
          const current = await tx.get(itemRef);
          if (!current.exists()) throw new Error('ITEM_NOT_FOUND');
          const lastUsedAt = current.get('lastUsedAt') as Timestamp | null | undefined;
          const isLatest = !lastUsedAt || date.toMillis() >= lastUsedAt.toMillis();
          tx.update(itemRef, {
            ...(isLatest ? { lastAmount: input.amount, lastUsedAt: date } : {}),
            groupIds,
            updatedAt: serverTimestamp(),
          });
        } else if (input.newItem) {
          itemRef = doc(itemsRef);
          tx.set(itemRef, {
            ...input.newItem,
            groupIds,
            lastAmount: input.amount,
            lastUsedAt: date,
            archived: false,
            createdAt: serverTimestamp(),
          });
        } else {
          throw new Error('ITEM_REQUIRED');
        }

        tx.set(doc(entriesRef), {
          itemId: itemRef.id,
          type: input.type,              // denormalizado para sumar ingresos/gastos por periodo
          accountId: input.accountId,
          name: input.name,
          amount: input.amount,
          date,
          groupIds,
          createdAt: serverTimestamp(),
        });
      });
      enqueueSnackbar('Movimiento registrado.', { variant: 'success' });
      return true;
    } catch (err) {
      enqueueSnackbar(getAuthErrorMessage(err), { variant: 'error' });
      return false;
    } finally {
      setSaving(false);
    }
  };

  return { submit, saving };
}

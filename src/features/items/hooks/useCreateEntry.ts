import { useState } from 'react';
import { Timestamp, collection, doc, serverTimestamp, writeBatch } from 'firebase/firestore';
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
      // Una sola escritura atómica: o se guardan item + movimiento, o nada (HU-06: sin huérfanos)
      const batch = writeBatch(db);
      const itemsRef = collection(db, `users/${uid}/items`);
      const entriesRef = collection(db, `users/${uid}/entries`);
      const groupIds = input.groupIds || [];
      const date = Timestamp.fromDate(input.date);

      let itemRef;
      if (input.itemId) {
        itemRef = doc(itemsRef, input.itemId);
        batch.update(itemRef, {
          lastAmount: input.amount,
          lastUsedAt: date,
          groupIds,
          updatedAt: serverTimestamp(),
        });
      } else if (input.newItem) {
        itemRef = doc(itemsRef);
        batch.set(itemRef, {
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

      batch.set(doc(entriesRef), {
        itemId: itemRef.id,
        type: input.type,                // denormalizado para sumar ingresos/gastos por periodo
        accountId: input.accountId,
        name: input.name,
        amount: input.amount,
        date,
        groupIds,
        createdAt: serverTimestamp(),
      });

      await batch.commit();
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

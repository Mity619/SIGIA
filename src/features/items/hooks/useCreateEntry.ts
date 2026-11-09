import { useState } from 'react';
import { Timestamp } from 'firebase/firestore';
import { useCollection } from '@/firebase/hooks/useCollection';
import { useSnackbar } from 'notistack';
import { getAuthErrorMessage } from '@/features/auth/utils/firebaseErrors';
import type { ItemDoc, EntryDoc, TransactionType, Frequency } from '../types/items.types';

interface CreateEntryInput {
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

// src/features/items/hooks/useCreateEntry.ts
// ... imports ...

export function useCreateEntry(uid: string) {
  const [saving, setSaving] = useState(false);
  const itemsCol = useCollection<ItemDoc>(`users/${uid}/items`);
  const entriesCol = useCollection<EntryDoc>(`users/${uid}/entries`);
  const { enqueueSnackbar } = useSnackbar();

  const submit = async (input: CreateEntryInput): Promise<boolean> => {
    setSaving(true);
    try {
      let itemId = input.itemId;

      if (!itemId && input.newItem) {
        const createdId = await itemsCol.add({
          ...input.newItem,
          groupIds: input.groupIds || [], 
          lastAmount: input.amount,
          lastUsedAt: Timestamp.now(),
          archived: false,
        });
        if (!createdId) throw new Error('ITEM_CREATE_FAILED');
        itemId = createdId;
      }

      // 1. Guardamos el Entry con sus propios grupos
      const entryId = await entriesCol.add({
        itemId: itemId!,
        accountId: input.accountId, 
        name: input.name,
        amount: input.amount,
        date: input.date as any, 
        groupIds: input.groupIds || [], 
      });
      if (!entryId) throw new Error('ENTRY_CREATE_FAILED');

      // 2. Actualizamos el Item para que recuerde estos grupos
      if (input.itemId) {
        await itemsCol.update(input.itemId, {
          lastAmount: input.amount,
          lastUsedAt: Timestamp.now(),
          groupIds: input.groupIds || [], 
        });
      }

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
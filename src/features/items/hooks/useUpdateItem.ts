import { useState } from 'react';
import { useSnackbar } from 'notistack';
import { useCollection } from '@/firebase/hooks/useCollection';
import type { Frequency, ItemDoc } from '../types/items.types';

export interface ItemChanges {
  name: string;
  frequency: Frequency;
  groupIds: string[];
}

/**
 * Edita un concepto (HU-06 / HU-07). Solo cambia el documento del concepto:
 * los movimientos conservan su propio nombre (HU-05).
 */
export function useUpdateItem(uid: string) {
  const col = useCollection<ItemDoc>(`users/${uid}/items`);
  const { enqueueSnackbar } = useSnackbar();
  const [saving, setSaving] = useState(false);

  const update = async (itemId: string, changes: ItemChanges): Promise<boolean> => {
    setSaving(true);
    const ok = await col.update(itemId, changes); // update ya pone updatedAt
    setSaving(false);
    enqueueSnackbar(ok ? 'Cambios guardados.' : 'No se pudieron guardar los cambios. Inténtalo de nuevo.', {
      variant: ok ? 'success' : 'error',
    });
    return ok;
  };

  return { update, saving };
}

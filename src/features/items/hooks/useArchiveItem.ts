import { useState } from 'react';
import { useSnackbar } from 'notistack';
import { useCollection } from '@/firebase/hooks/useCollection';
import type { ItemDoc } from '../types/items.types';

/**
 * "Eliminar" un concepto = archivarlo (HU-06). Sus movimientos no se borran,
 * así no quedan datos huérfanos y el historial se conserva.
 */
export function useArchiveItem(uid: string) {
  const col = useCollection<ItemDoc>(`users/${uid}/items`);
  const { enqueueSnackbar } = useSnackbar();
  const [archiving, setArchiving] = useState(false);

  const archive = async (itemId: string): Promise<boolean> => {
    setArchiving(true);
    const ok = await col.update(itemId, { archived: true }); // update ya pone updatedAt
    setArchiving(false);
    enqueueSnackbar(ok ? 'Eliminado. Su historial quedó archivado.' : 'No se pudo eliminar. Inténtalo de nuevo.', {
      variant: ok ? 'success' : 'error',
    });
    return ok;
  };

  return { archive, archiving };
}

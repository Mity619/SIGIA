import { useCollection } from '@/firebase/hooks/useCollection';
import { useSnackbar } from 'notistack';
import type { GroupDoc } from '../types/tags.types';

export function useCreateGroup(uid: string) {
  const col = useCollection<GroupDoc>(`users/${uid}/groups`);
  const { enqueueSnackbar } = useSnackbar();

  const create = async (data: Omit<GroupDoc, 'id' | 'createdAt'>) => {
    const id = await col.add(data);
    if (id) enqueueSnackbar('Grupo creado.', { variant: 'success' });
    else enqueueSnackbar('No se pudo crear el grupo.', { variant: 'error' });
    return id;
  };

  return { create, loading: col.isPending };
}
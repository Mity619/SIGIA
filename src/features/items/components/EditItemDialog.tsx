import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { entrySchema } from '../schemas/entry.schema';
import { FREQUENCY_OPTIONS } from '../constants/frequencies';
import { Button } from '@/shared/components/shadcn/button';
import { Input } from '@/shared/components/shadcn/input';
import { Field, FieldGroup, FieldLabel } from '@/shared/components/shadcn/field';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/shadcn/dialog';
import type { GroupDoc } from '@/features/tags/types/tags.types';
import type { ItemDoc } from '../types/items.types';
import type { ItemChanges } from '../hooks/useUpdateItem';

// Nombre y frecuencia con las mismas reglas que al crear (frecuencia obligatoria, HU-04).
const editItemSchema = entrySchema
  .pick({ name: true, frequency: true })
  .extend({ groupIds: entrySchema.shape.groupIds.unwrap() });

const selectClass = 'h-11 w-full rounded-xl border border-gray-200 bg-gray-50/60 px-4 text-sm';

interface Props {
  open: boolean;
  item: ItemDoc;
  groups: GroupDoc[];
  saving: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (changes: ItemChanges) => Promise<boolean>;
}

export function EditItemDialog({ open, item, groups, saving, onOpenChange, onSubmit }: Props) {
  const noun = item.type === 'income' ? 'ingreso' : 'gasto';
  const {
    register, handleSubmit, reset, setValue, watch,
    formState: { errors },
  } = useForm<ItemChanges>({ resolver: zodResolver(editItemSchema) });
  const selectedGroups = watch('groupIds') ?? [];

  useEffect(() => {
    if (open) {
      // Solo se muestran grupos que existen (un grupo eliminado no debe volver a guardarse)
      const known = new Set(groups.map((g) => g.id));
      reset({
        name: item.name,
        frequency: item.frequency,
        groupIds: (item.groupIds ?? []).filter((id) => known.has(id)),
      });
    }
  }, [open, item, groups, reset]);

  const submit = handleSubmit(async (values) => {
    const ok = await onSubmit(values);
    if (ok) onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Editar {noun}</DialogTitle>
          <DialogDescription>
            Cambia el nombre, la frecuencia o los grupos. Los movimientos ya registrados conservan su nombre.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} noValidate>
          <FieldGroup className="gap-4">
            <Field>
              <FieldLabel htmlFor="edit-item-name">Nombre</FieldLabel>
              <Input id="edit-item-name" {...register('name')} aria-invalid={!!errors.name} />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </Field>

            <Field>
              <FieldLabel htmlFor="edit-item-frequency">Frecuencia</FieldLabel>
              <select id="edit-item-frequency" className={selectClass} {...register('frequency')} aria-invalid={!!errors.frequency}>
                {FREQUENCY_OPTIONS.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
              {errors.frequency && <p className="text-xs text-red-500">{errors.frequency.message}</p>}
            </Field>

            <fieldset className="flex min-w-0 flex-col gap-2">
              <legend className="mb-1 text-sm font-medium">Grupos (opcional)</legend>
              {groups.length === 0 ? (
                <p className="text-xs text-gray-500">No tienes grupos creados aún.</p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {groups.map((g) => (
                    <label key={g.id} className="flex cursor-pointer items-center gap-2 rounded-lg border p-2 text-sm hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={selectedGroups.includes(g.id!)}
                        onChange={(e) =>
                          // Manejo explícito: con un solo grupo, register() devolvería un boolean
                          setValue(
                            'groupIds',
                            e.target.checked
                              ? [...selectedGroups, g.id!]
                              : selectedGroups.filter((id) => id !== g.id),
                          )
                        }
                        className="accent-[#DA0081]"
                      />
                      <i className={`${g.iconKey} text-lg`} aria-hidden="true" />
                      {g.name}
                    </label>
                  ))}
                </div>
              )}
            </fieldset>
          </FieldGroup>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving} className="bg-[#DA0081] text-white hover:bg-[#E366A7]">
              {saving ? 'Guardando…' : 'Guardar cambios'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { entrySchema } from '../schemas/entry.schema';
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
import { parseInputDate, toInputDate } from '@/shared/utils/date';
import type { Account } from '@/features/accounts/types/account.types';
import type { EntryDoc } from '../types/items.types';
import type { EntryChanges } from '../hooks/useUpdateEntry';

// Mismas reglas y mensajes que al crear (HU-04): no se duplican validaciones.
const editEntrySchema = entrySchema.pick({ name: true, amount: true, date: true, accountId: true });

const selectClass = 'h-11 w-full rounded-xl border border-gray-200 bg-gray-50/60 px-4 text-sm';

interface Props {
  entry: EntryDoc | null;
  accounts: Account[];
  saving: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (changes: EntryChanges) => Promise<boolean>;
}

export function EditEntryDialog({ entry, accounts, saving, onOpenChange, onSubmit }: Props) {
  const {
    register, handleSubmit, setValue, watch, reset,
    formState: { errors },
  } = useForm<EntryChanges>({ resolver: zodResolver(editEntrySchema) });

  useEffect(() => {
    if (entry) {
      reset({
        name: entry.name,
        amount: entry.amount,
        date: entry.date.toDate(),
        accountId: entry.accountId,
      });
    }
  }, [entry, reset]);

  const date = watch('date');

  const submit = handleSubmit(async (values) => {
    const ok = await onSubmit(values);
    if (ok) onOpenChange(false);
  });

  return (
    <Dialog open={!!entry} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Editar movimiento</DialogTitle>
          <DialogDescription>Los cambios se reflejan en la card, los porcentajes y las gráficas.</DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} noValidate>
          <FieldGroup className="gap-4">
            <Field>
              <FieldLabel htmlFor="edit-entry-name">Nombre</FieldLabel>
              <Input id="edit-entry-name" {...register('name')} aria-invalid={!!errors.name} />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </Field>

            <Field>
              <FieldLabel htmlFor="edit-entry-amount">Valor</FieldLabel>
              <Input
                id="edit-entry-amount"
                type="number"
                step="0.01"
                {...register('amount', { valueAsNumber: true })}
                aria-invalid={!!errors.amount}
              />
              {errors.amount && <p className="text-xs text-red-500">{errors.amount.message}</p>}
            </Field>

            <Field>
              <FieldLabel htmlFor="edit-entry-account">Cuenta</FieldLabel>
              <select id="edit-entry-account" className={selectClass} {...register('accountId')} aria-invalid={!!errors.accountId}>
                <option value="" disabled>Selecciona una cuenta</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>{acc.name}</option>
                ))}
              </select>
              {errors.accountId && <p className="text-xs text-red-500">{errors.accountId.message}</p>}
            </Field>

            <Field>
              <FieldLabel htmlFor="edit-entry-date">Fecha</FieldLabel>
              <Input
                id="edit-entry-date"
                type="date"
                value={toInputDate(date)}
                onChange={(e) =>
                  // Fecha local: evita que "9 nov" se guarde como "8 nov" en UTC-5
                  setValue('date', parseInputDate(e.target.value) as Date, { shouldValidate: true })
                }
                aria-invalid={!!errors.date}
              />
              {errors.date && <p className="text-xs text-red-500">{errors.date.message}</p>}
            </Field>
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

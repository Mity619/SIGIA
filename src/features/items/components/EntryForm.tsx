import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { entrySchema, type EntrySchema } from '../schemas/entry.schema';
import { FREQUENCY_OPTIONS } from '../constants/frequencies';
import { ItemSelector } from './ItemSelector';
import { Button } from '@/shared/components/shadcn/button';
import { Input } from '@/shared/components/shadcn/input';
import { Field, FieldGroup, FieldLabel } from '@/shared/components/shadcn/field';
import type { ItemDoc, TransactionType } from '../types/items.types';
import type { GroupDoc } from '@/features/tags/types/tags.types';
import type { Account } from '@/features/accounts/types/account.types';
import { parseInputDate, toInputDate } from '@/shared/utils/date';

interface Props {
  type: TransactionType;
  items: ItemDoc[];
  groups: GroupDoc[];
  accounts: Account[]; 
  onSubmit: (values: EntrySchema & { itemId?: string }) => Promise<boolean>;
  saving: boolean;
}

export function EntryForm({ type, items, accounts, groups, onSubmit, saving }: Props) {
  const defaultAccountId = accounts.find(a => a.default)?.id || accounts[0]?.id || "";

  const {
    register, handleSubmit, setValue, watch, reset,
    formState: { errors },
  } = useForm<EntrySchema>({
    resolver: zodResolver(entrySchema),
    defaultValues: {
      date: new Date(),
      amount: 0,
      name: '',
      itemId: '',
      frequency: undefined as any,
      accountId: defaultAccountId,
      groupIds: [],
    },
  });

  useEffect(() => {
    if (!watch('accountId') && defaultAccountId) {
      setValue('accountId', defaultAccountId);
    }
  }, [defaultAccountId, setValue, watch]);

  const selectedItemId = watch('itemId');
  const selectedDate = watch('date');

  useEffect(() => {
    if (!selectedItemId) return;
    const item = items.find((i) => i.id === selectedItemId);
    if (!item) return;
    
    setValue('name', item.name, { shouldValidate: true });
    setValue('amount', item.lastAmount ?? 0, { shouldValidate: true });
    setValue('frequency', item.frequency, { shouldValidate: true });
    setValue('groupIds', item.groupIds || [], { shouldValidate: true }); 
  }, [selectedItemId, items, setValue]);

  const onFormSubmit = handleSubmit(async (values) => {
    const ok = await onSubmit({ ...values, itemId: values.itemId || undefined });
    if (ok) reset({ date: new Date(), amount: 0, name: '', itemId: '', frequency: undefined as any, accountId: defaultAccountId, groupIds: [] });
  });

  return (
    <form onSubmit={onFormSubmit}>
      <FieldGroup className="gap-4">
        <Field>
          <FieldLabel>Reutilizar {type === 'expense' ? 'gasto' : 'ingreso'}</FieldLabel>
          <ItemSelector
            items={items}
            value={selectedItemId}
            onChange={(id) => setValue('itemId', id, { shouldValidate: true })}
          />
        </Field>

        <Field>
          <FieldLabel>Nombre</FieldLabel>
          <Input {...register('name')} aria-invalid={!!errors.name} />
          {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
        </Field>

        <Field>
          <FieldLabel>Valor</FieldLabel>
          <Input type="number" step="0.01" {...register('amount', { valueAsNumber: true })} aria-invalid={!!errors.amount} />
          {errors.amount && <p className="text-xs text-red-500">{errors.amount.message}</p>}
        </Field>

        <Field>
          <FieldLabel>Cuenta destino</FieldLabel>
          <select
            className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50/60 px-4 text-sm"
            {...register('accountId')}
            aria-invalid={!!errors.accountId}
          >
            <option value="" disabled>Selecciona una cuenta</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name} {acc.default ? '(Por defecto)' : ''}
              </option>
            ))}
          </select>
          {errors.accountId && <p className="text-xs text-red-500">{errors.accountId.message}</p>}
        </Field>

        <Field>
          <FieldLabel>Fecha</FieldLabel>
          <Input
            type="date"
            value={toInputDate(selectedDate)}
            onChange={(e) =>
              // Fecha local: evita que "9 nov" se guarde como "8 nov" en UTC-5
              setValue('date', parseInputDate(e.target.value) as Date, { shouldValidate: true })
            }
            aria-invalid={!!errors.date}
          />
          {errors.date && <p className="text-xs text-red-500">{errors.date.message}</p>}
        </Field>

        <Field>
          <FieldLabel>Frecuencia</FieldLabel>
          <select className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50/60 px-4 text-sm" {...register('frequency')} aria-invalid={!!errors.frequency}>
            <option value="">Selecciona una frecuencia</option>
            {FREQUENCY_OPTIONS.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
          {errors.frequency && <p className="text-xs text-red-500">{errors.frequency.message}</p>}
        </Field>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Grupos (Opcional)</label>
          {groups.length === 0 ? (
             <p className="text-xs text-gray-500">No tienes grupos creados aún.</p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {groups.map((g) => (
                <label key={g.id} className="flex items-center gap-2 text-sm p-2 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input type="checkbox" value={g.id} {...register("groupIds")} className="accent-[#DA0081]" />
                  <i className={`${g.iconKey} text-lg`} />
                  {g.name}
                </label>
              ))}
            </div>
          )}
        </div>

        <Button type="submit" disabled={saving} className="h-11 w-full rounded-xl bg-[#DA0081] text-white hover:bg-[#E366A7]">
          {saving ? 'Guardando…' : 'Guardar movimiento'}
        </Button>
      </FieldGroup>
    </form>
  );
}
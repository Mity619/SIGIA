import { z } from 'zod';

export const entrySchema = z.object({
  itemId: z.string().optional(),
  accountId: z.string().min(1, 'Debes seleccionar una cuenta'),
  name: z.string().trim().min(1, 'El nombre es obligatorio').max(80),
  amount: z.number({ error: 'El valor debe ser numérico' }).positive('El valor debe ser mayor a 0'),
  date: z.date({ error: 'La fecha es obligatoria' }),
  frequency: z.enum(['eventual', 'daily', 'weekly', 'monthly', 'annual'], {
    message: 'Debes seleccionar una etiqueta de tiempo',
  }),
  groupIds: z.array(z.string()).optional(),
});

export type EntrySchema = z.infer<typeof entrySchema>;
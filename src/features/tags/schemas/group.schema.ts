import { z } from 'zod';

export const groupSchema = z.object({
  name: z.string().trim().min(2, 'Mínimo 2 caracteres').max(40, 'Máximo 40 caracteres'),
  iconKey: z.string().min(1, 'Debes seleccionar un ícono'),
  tone: z.enum(['green', 'neutral', 'red']),
});

export type GroupSchema = z.infer<typeof groupSchema>;

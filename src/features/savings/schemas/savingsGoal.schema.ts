
import { z } from "zod";

export const savingsGoalSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Ingresa un nombre para la meta")
    .max(100, "Máximo 100 caracteres"),

  targetAmount: z
    .number("Ingresa un monto válido")
    .positive("El monto debe ser mayor a cero")
    .refine(
      (value) =>
        Number.isSafeInteger(Math.round(value * 100)) &&
        Math.abs(value * 100 - Math.round(value * 100)) < 1e-7,
      "El monto puede tener máximo dos decimales",
    ),

  deadline: z
    .date({ error: "Selecciona una fecha válida" })
    .refine((date) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      return date >= today;
    }, "La fecha límite no puede ser anterior a hoy"),
});

export type SavingsGoalSchema = z.infer<
  typeof savingsGoalSchema
>;

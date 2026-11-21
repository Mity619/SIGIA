
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  savingsGoalSchema,
  type SavingsGoalSchema,
} from "../schemas/savingsGoal.schema";

import { Button } from "@/shared/components/shadcn/button";
import { Input } from "@/shared/components/shadcn/input";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/shared/components/shadcn/field";
import { parseInputDate } from "@/shared/utils/date";

interface Props {
  onSubmit: (data: SavingsGoalSchema) => Promise<boolean>;
  saving: boolean;
  onCancel?: () => void;
}

export function SavingsGoalForm({
  onSubmit,
  saving,
  onCancel,
}: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SavingsGoalSchema>({
    resolver: zodResolver(savingsGoalSchema),
    defaultValues: {
      name: "",
      targetAmount: 0,
    },
  });

  const disabled = saving || isSubmitting;

  const onFormSubmit = handleSubmit(async (data) => {
    const created = await onSubmit(data);

    if (created) {
      reset();
    }
  });

  return (
    <form onSubmit={onFormSubmit}>
      <FieldGroup className="gap-4">
        <Field>
          <FieldLabel htmlFor="goal-name">
            Nombre de la meta
          </FieldLabel>

          <Input
            id="goal-name"
            placeholder="Ej. Comprar computador"
            disabled={disabled}
            aria-invalid={!!errors.name}
            {...register("name")}
          />

          {errors.name && (
            <p className="text-xs text-destructive">
              {errors.name.message}
            </p>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="goal-amount">
            Monto objetivo
          </FieldLabel>

          <Input
            id="goal-amount"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="Ej. 3000000"
            disabled={disabled}
            aria-invalid={!!errors.targetAmount}
            {...register("targetAmount", {
              valueAsNumber: true,
            })}
          />

          {errors.targetAmount && (
            <p className="text-xs text-destructive">
              {errors.targetAmount.message}
            </p>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="goal-deadline">
            Fecha límite
          </FieldLabel>

          <Input
            id="goal-deadline"
            type="date"
            disabled={disabled}
            aria-invalid={!!errors.deadline}
            {...register("deadline", {
              setValueAs: (value: string) =>
                parseInputDate(value),
            })}
          />

          {errors.deadline && (
            <p className="text-xs text-destructive">
              {errors.deadline.message}
            </p>
          )}
        </Field>

        <div className="flex justify-end gap-3">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              disabled={disabled}
              onClick={onCancel}
            >
              Cancelar
            </Button>
          )}

          <Button type="submit" disabled={disabled}>
            {disabled ? "Guardando..." : "Crear meta"}
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}

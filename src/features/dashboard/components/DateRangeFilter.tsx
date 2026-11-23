import { Button } from "@/shared/components/shadcn/button";
import { Input } from "@/shared/components/shadcn/input";
import { Label } from "@/shared/components/shadcn/label";
import { DEFAULT_RANGE_MONTHS } from "../constants/incomeExpense.constants";
import type { DateRangeInput } from "../types/incomeExpense.types";

interface Props {
  range: DateRangeInput;
  error: string | null;
  isDefaultRange: boolean;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  onReset: () => void;
}

const FROM_ID = "income-expense-from";
const TO_ID = "income-expense-to";
const ERROR_ID = "income-expense-range-error";

export const DateRangeFilter = ({
  range,
  error,
  isDefaultRange,
  onFromChange,
  onToChange,
  onReset,
}: Props) => {
  const errorProps = error ? { "aria-invalid": true, "aria-describedby": ERROR_ID } : {};

  return (
    <fieldset className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4">
      <legend className="sr-only">Rango de fechas</legend>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex flex-1 flex-col gap-1.5">
          <Label htmlFor={FROM_ID}>Fecha de inicio</Label>
          <Input
            id={FROM_ID}
            type="date"
            value={range.from}
            onChange={(event) => onFromChange(event.target.value)}
            className="h-10"
            {...errorProps}
          />
        </div>
        <div className="flex flex-1 flex-col gap-1.5">
          <Label htmlFor={TO_ID}>Fecha de fin</Label>
          <Input
            id={TO_ID}
            type="date"
            value={range.to}
            onChange={(event) => onToChange(event.target.value)}
            className="h-10"
            {...errorProps}
          />
        </div>
        <Button
          type="button"
          variant="outline"
          className="h-10"
          disabled={isDefaultRange}
          onClick={onReset}
        >
          <i className="ri-restart-line" aria-hidden="true" />
          Últimos {DEFAULT_RANGE_MONTHS} meses
        </Button>
      </div>
      <p id={ERROR_ID} role="alert" className="min-h-5 text-sm text-destructive">
        {error}
      </p>
    </fieldset>
  );
};

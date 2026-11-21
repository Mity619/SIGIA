
import type { DomainItem } from "@/domain/types";
import type { ChecklistFrequency } from "@/domain/period";
import { formatCurrency } from "@/shared/utils/format";
import { Button } from "@/shared/components/shadcn/button";

interface ChecklistProps {
  frequency: ChecklistFrequency;
  items: DomainItem[];
  checkedIds: string[];
  recordedIds?: string[];
  onToggle: (itemId: string) => void;
  onSave: () => void;
  saving?: boolean;
  disabled?: boolean;
}

const frequencyLabels: Record<ChecklistFrequency, string> = {
  daily: "Diarios",
  weekly: "Semanales",
  monthly: "Mensuales",
  annual: "Anuales",
};

export function Checklist({
  frequency,
  items,
  checkedIds,
  recordedIds = [],
  onToggle,
  onSave,
  saving = false,
  disabled = false,
}: ChecklistProps) {
  const expenses = items.filter(
    (item) =>
      item.type === "expense" &&
      item.frequency === frequency,
  );

  const checked = new Set(checkedIds);
  const recorded = new Set(recordedIds);

  const hasExpenses = expenses.length > 0;
  const isDisabled = disabled || saving;

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-xl font-semibold text-foreground">
          Gastos {frequencyLabels[frequency].toLowerCase()}
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Marca los gastos que realizaste durante este periodo.
          Los que no marques se contabilizarán como ahorro
          al guardar.
        </p>
      </div>

      {!hasExpenses ? (
        <p className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
          No tienes gastos registrados para este periodo.
        </p>
      ) : (
        <div className="space-y-3">
          {expenses.map((item) => (
            <label
              key={item.id}
              className="flex cursor-pointer items-center gap-3 rounded-xl border border-border p-4 transition-colors hover:bg-muted/50"
            >
              <input
                type="checkbox"
                checked={checked.has(item.id) || recorded.has(item.id)}
                onChange={() => onToggle(item.id)}
                disabled={isDisabled || recorded.has(item.id)}
                className="h-4 w-4 accent-primary"
              />

              <span className="min-w-0 flex-1 text-sm font-medium text-foreground">
                {item.name}

                {recorded.has(item.id) && (
                  <span className="mt-1 block text-xs font-normal text-green-600">
                    Ya registrado
                  </span>
                )}
              </span>

              <span className="shrink-0 text-sm font-semibold text-foreground">
                {formatCurrency(item.lastAmount)}
              </span>
            </label>
          ))}
        </div>
      )}

      {hasExpenses && (
        <div className="mt-6 flex justify-end">
          <Button
            type="button"
            onClick={onSave}
            disabled={isDisabled}
          >
            {saving ? "Guardando..." : "Guardar checklist"}
          </Button>
        </div>
      )}
    </section>
  );
}

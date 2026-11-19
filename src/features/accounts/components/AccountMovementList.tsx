import type { TransactionType } from "@/domain";
import { cn } from "@/lib/utils";
import { formatCurrency, formatDate } from "@/shared/utils/format";
import type { AccountMovement } from "../types/account.types";

interface Props {
  /** Ya ordenados por fecha descendente. */
  movements: AccountMovement[];
}

const MOVEMENT_STYLES: Record<
  TransactionType,
  { label: string; icon: string; sign: string; tone: string; badge: string }
> = {
  income: {
    label: "Ingreso",
    icon: "ri-arrow-left-down-line",
    sign: "+",
    tone: "text-primary",
    badge: "bg-primary/10 text-primary",
  },
  expense: {
    label: "Gasto",
    icon: "ri-arrow-right-up-line",
    sign: "−",
    tone: "text-destructive",
    badge: "bg-destructive/10 text-destructive",
  },
};

export const AccountMovementList = ({ movements }: Props) => (
  <section className="flex flex-col gap-4" aria-labelledby="account-movements">
    <h2 id="account-movements" className="text-lg font-semibold text-foreground">
      Movimientos
    </h2>

    {movements.length === 0 ? (
      <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
        Esta cuenta aún no tiene movimientos.
      </p>
    ) : (
      <ul className="flex flex-col gap-3">
        {movements.map((movement) => {
          const style = MOVEMENT_STYLES[movement.type];
          return (
            <li
              key={movement.id}
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
            >
              <span
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-full",
                  style.badge,
                )}
              >
                <i className={cn("text-xl", style.icon)} aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-foreground">{movement.name}</p>
                <p className="text-sm text-muted-foreground">
                  <span className={style.tone}>{style.label}</span>
                  {" · "}
                  {formatDate(movement.date, "short")}
                </p>
              </div>
              <span className={cn("shrink-0 font-bold", style.tone)}>
                {style.sign} {formatCurrency(movement.amount)}
              </span>
            </li>
          );
        })}
      </ul>
    )}
  </section>
);

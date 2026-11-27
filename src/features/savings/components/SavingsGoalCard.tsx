
import {
  calculateGoalProgress,
  type SavingsGoal,
} from "@/domain/savingsGoals";

import { Button } from "@/shared/components/shadcn/button";
import { Skeleton } from "@/shared/components/shadcn/skeleton";
import { SkeletonText } from "@/shared/components/ui/loading/SkeletonText";
import { formatCurrency, formatDate } from "@/shared/utils/format";

interface SavingsGoalCardProps {
  goal: SavingsGoal;
  availableSavings: number | null;
  loadingAvailable: boolean;
  allocating: boolean;
  onAllocate: (goalId: string) => void;
  onReverse: (goalId: string) => void;
}

const GOAL_STATUS_LABELS = {
  pending: "Pendiente",
  completed: "Completada",
  failed: "Vencida",
} as const;

const GOAL_STATUS_STYLES = {
  pending: "bg-muted text-muted-foreground",
  completed: "bg-success/10 text-success",
  failed: "bg-destructive/10 text-destructive",
} as const;

const cardClass = "space-y-4 rounded-xl border border-border bg-card p-5 shadow-sm";
const headerClass = "flex flex-wrap items-start justify-between gap-2";
const amountTextClass = "text-xl";
const progressTrackClass = "h-3 overflow-hidden rounded-full";
const progressInfoClass = "flex flex-wrap justify-between gap-2 text-sm";
const deadlineClass = "border-t border-border pt-3";

/** Misma forma que SavingsGoalCard en su caso más común: meta pendiente sin aportes. */
export function SavingsGoalCardSkeleton() {
  return (
    <div className={cardClass}>
      <div className={headerClass}>
        <SkeletonText className="font-semibold" barClassName="w-32" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="space-y-1">
        <SkeletonText className={amountTextClass} barClassName="w-28" />
        <SkeletonText className="text-sm" barClassName="w-24" />
      </div>
      <Skeleton className={progressTrackClass} />
      <div className={progressInfoClass}>
        <SkeletonText barClassName="w-28" />
        <SkeletonText barClassName="w-24" />
      </div>
      <div className={deadlineClass}>
        <SkeletonText className="text-sm" barClassName="w-40" />
      </div>
      <Skeleton className="h-8 w-full rounded-lg" />
    </div>
  );
}

export function SavingsGoalCard({
  goal,
  availableSavings,
  loadingAvailable,
  allocating,
  onAllocate,
  onReverse,
}: SavingsGoalCardProps) {
  const progress = calculateGoalProgress(goal);

  return (
    <div className={cardClass}>
      {/* Nombre y estado */}
      <div className={headerClass}>
        <h3 className="font-semibold text-foreground">
          {goal.name}
        </h3>

        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            GOAL_STATUS_STYLES[progress.status]
          }`}
        >
          {GOAL_STATUS_LABELS[progress.status]}
        </span>
      </div>

      {/* Monto asignado y objetivo */}
      <div className="space-y-1">
        <p className={`${amountTextClass} font-bold text-foreground`}>
          {formatCurrency(goal.savedAmount)}
        </p>

        <p className="text-sm text-muted-foreground">
          de {formatCurrency(goal.targetAmount)}
        </p>
      </div>

      {/* Barra de progreso */}
      <div
        className={`${progressTrackClass} bg-muted`}
        role="progressbar"
        aria-label={`Progreso de ${goal.name}`}
        aria-valuenow={progress.percentage}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full bg-success/90 transition-all"
          style={{
            width: `${progress.percentage}%`,
          }}
        />
      </div>

      {/* Porcentaje y dinero restante */}
      <div className={progressInfoClass}>
        <span className="font-medium text-foreground">
          {progress.percentage.toLocaleString("es-CO", {
            maximumFractionDigits: 2,
          })}{" "}
          % completado
        </span>

        <span className="text-muted-foreground">
          {progress.remaining === 0
            ? "Meta alcanzada"
            : `Faltan ${formatCurrency(progress.remaining)}`}
        </span>
      </div>

      {/* Fecha límite */}
      <div className={deadlineClass}>
        <p className="text-sm text-muted-foreground">
          Fecha límite: {formatDate(goal.deadline, "short")}
        </p>
      </div>

      {/* Aportar únicamente a metas pendientes */}
      {progress.status === "pending" && (
        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled={
            allocating ||
            loadingAvailable ||
            availableSavings === null ||
            availableSavings <= 0
          }
          onClick={() => onAllocate(goal.id)}
        >
          Asignar ahorro
        </Button>
      )}

      {/* Devolver dinero previamente asignado */}
      {goal.savedAmount > 0 && (
        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled={allocating}
          onClick={() => onReverse(goal.id)}
        >
          Devolver ahorro
        </Button>
      )}
    </div>
  );
}

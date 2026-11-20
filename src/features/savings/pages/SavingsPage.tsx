
import { useEffect, useMemo, useState } from "react";

import { useSnackbar } from "notistack";

import {
  calculateGoalProgress,
  type SavingsGoal,
} from "@/domain/savingsGoals";

import {
  createSavingsGoal,
  getSavingsGoals,
} from "@/features/savings/services/savingsGoals.service";
import { SavingsGoalForm } from "@/features/savings/components/SavingsGoalForm";
import type { SavingsGoalSchema } from "@/features/savings/schemas/savingsGoal.schema";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/shadcn/dialog";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { getSavingsPeriods } from "@/features/home-checklist/services/checklist.service";

import {
  calculateSavingsByPeriod,
  type SavingsPeriodRecord,
  type SavingsSummary,
} from "@/domain/savings";
import type { ChecklistFrequency } from "@/domain/period";

import { Button } from "@/shared/components/shadcn/button";
import { Header } from "@/shared/components/ui/sections/Header";
import {
  formatCurrency,
  formatDate,
} from "@/shared/utils/format";

const PERIODS: {
  frequency: ChecklistFrequency;
  label: string;
}[] = [
  { frequency: "daily", label: "Diario" },
  { frequency: "weekly", label: "Semanal" },
  { frequency: "monthly", label: "Mensual" },
  { frequency: "annual", label: "Anual" },
];

const GOAL_STATUS_LABELS = {
  pending: "Pendiente",
  completed: "Completada",
  failed: "Vencida",
} as const;

const GOAL_STATUS_STYLES = {
  pending: "bg-muted text-muted-foreground",
  completed: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
} as const;

export function SavingsPage() {
  const { getUserId } = useAuth();
  const uid = getUserId() ?? "";

  const { enqueueSnackbar } = useSnackbar();

  // Metas de ahorro del usuario.
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loadingGoals, setLoadingGoals] = useState(true);
  const [goalsError, setGoalsError] = useState(false);

  // Formulario de creación.
  const [goalDialogOpen, setGoalDialogOpen] = useState(false);
  const [creatingGoal, setCreatingGoal] = useState(false);

  // Año consultado y fecha de referencia.
  const [today] = useState(() => new Date());
  const [year, setYear] = useState(() => today.getFullYear());

  // Datos recuperados desde Firestore.
  const [records, setRecords] = useState<SavingsPeriodRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reload, setReload] = useState(0);

  // Permite consultar años anteriores sin cambiar
  // el día y el mes de referencia.
  const referenceDate = useMemo(
    () =>
      new Date(
        year,
        today.getMonth(),
        today.getDate(),
      ),
    [year, today],
  );

  // Una consulta al entrar o cambiar de año.
  useEffect(() => {
    let active = true;

    if (!uid) {
      return () => {
        active = false;
      };
    }

    getSavingsPeriods(uid, new Date(year, 0, 1))
      .then((data) => {
        if (!active) return;

        setRecords(data);
        setError(false);
      })
      .catch((err) => {
        if (!active) return;

        console.error("Error al consultar ahorros:", err);
        setRecords([]);
        setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [uid, year, reload]);


  // Cargar las metas del usuario una sola vez.
  useEffect(() => {
    let active = true;

    if (!uid) {
      return;
    }

    getSavingsGoals(uid)
      .then((data) => {
        if (!active) return;

        setGoals(data);
        setGoalsError(false);
      })
      .catch((error) => {
        if (!active) return;

        console.error("Error al consultar metas:", error);
        setGoalsError(true);
      })
      .finally(() => {
        if (active) {
          setLoadingGoals(false);
        }
      });

    return () => {
      active = false;
    };
  }, [uid]);

  // Los cuatro indicadores se calculan en memoria.
  const summaries = useMemo(
    () =>
      PERIODS.map(({ frequency, label }) => ({
        frequency,
        label,
        summary: calculateSavingsByPeriod(
          records,
          frequency,
          referenceDate,
        ),
      })),
    [records, referenceDate],
  );

  // El desglose anual incluye los registros
  // contabilizados dentro del año consultado.
  const annualSummary: SavingsSummary =
    summaries.find(
      (item) => item.frequency === "annual",
    )?.summary ?? { total: 0, details: [] };

  const currentYear = today.getFullYear();

  const changeYear = (direction: -1 | 1) => {
    const nextYear = year + direction;

    if (nextYear > currentYear || loading) return;

    setYear(nextYear);
    setRecords([]);
    setLoading(true);
    setError(false);
  };

  const retry = () => {
    setLoading(true);
    setError(false);
    setReload((value) => value + 1);
  };


  const handleCreateGoal = async (
    data: SavingsGoalSchema,
  ): Promise<boolean> => {
    if (!uid || creatingGoal) {
      return false;
    }

    setCreatingGoal(true);

    try {
      const id = await createSavingsGoal(uid, data);

      const newGoal: SavingsGoal = {
        id,
        name: data.name.trim(),
        targetAmount: data.targetAmount,
        savedAmount: 0,
        deadline: data.deadline,
      };

      // Actualizar la lista sin repetir la consulta a Firebase.
      setGoals((current) =>
        [...current, newGoal].sort(
          (a, b) =>
            a.deadline.getTime() - b.deadline.getTime(),
        ),
      );

      setGoalDialogOpen(false);

      enqueueSnackbar("Meta creada correctamente.", {
        variant: "success",
      });

      return true;
    } catch (error) {
      console.error("Error al crear meta:", error);

      enqueueSnackbar(
        "No se pudo crear la meta. Inténtalo de nuevo.",
        { variant: "error" },
      );

      return false;
    } finally {
      setCreatingGoal(false);
    }
  };


  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Header
        title="Mis ahorros"
        paragraph="Consulta cuánto has ahorrado al evitar tus gastos habituales."
      />

      {/* Navegación entre años */}
      <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-4">
        <Button
          type="button"
          variant="outline"
          disabled={loading}
          onClick={() => changeYear(-1)}
        >
          Anterior
        </Button>

        <div className="text-center">
          <p className="text-lg font-semibold text-foreground">
            {year}
          </p>
          <p className="text-xs text-muted-foreground">
            Año seleccionado
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          disabled={loading || year >= currentYear}
          onClick={() => changeYear(1)}
        >
          Siguiente
        </Button>
      </div>

      {loading ? (
        // Estado de carga.
        <div className="space-y-5 animate-pulse">
          <div className="grid gap-4 sm:grid-cols-2">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-28 rounded-xl bg-muted"
              />
            ))}
          </div>

          <div className="h-48 rounded-xl bg-muted" />
        </div>
      ) : error ? (
        // Error al consultar Firebase.
        <div className="rounded-xl border border-border bg-card p-6">
          <p className="text-sm text-destructive">
            No se pudieron cargar tus ahorros.
            Comprueba tu conexión e inténtalo de nuevo.
          </p>

          <Button
            type="button"
            variant="outline"
            className="mt-4"
            onClick={retry}
          >
            Reintentar
          </Button>
        </div>
      ) : (
        <>
          {/* Totales por periodo */}
          <section>
            <h2 className="mb-4 text-xl font-semibold text-foreground">
              Resumen de ahorros
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              {summaries.map((item) => (
                <div
                  key={item.frequency}
                  className="rounded-xl border border-border bg-card p-5 shadow-sm"
                >
                  <p className="text-sm text-muted-foreground">
                    Ahorro {item.label.toLowerCase()}
                  </p>

                  <p className="mt-2 text-2xl font-bold text-foreground">
                    {formatCurrency(item.summary.total)}
                  </p>

                  <p className="mt-2 text-xs text-muted-foreground">
                    {item.frequency === "daily"
                      ? formatDate(referenceDate, "short")
                      : item.frequency === "weekly"
                        ? "Semana de la fecha de referencia"
                        : item.frequency === "monthly"
                          ? "Mes de la fecha de referencia"
                          : `Año ${year}`}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Desglose anual de gastos evitados */}
          <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-5">
              <h2 className="text-xl font-semibold text-foreground">
                Desglose de ahorros
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Gastos que evitaste durante {year}.
              </p>
            </div>

            {annualSummary.details.length === 0 ? (
              <div className="rounded-lg bg-muted p-5 text-center">
                <p className="text-sm text-muted-foreground">
                  Todavía no tienes ahorros registrados
                  para este año.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {annualSummary.details.map((item) => (
                  <div
                    key={item.itemId}
                    className="flex items-center justify-between gap-4 py-4"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-foreground">
                        {item.name}
                      </p>

                      <p className="text-sm text-muted-foreground">
                        Evitado {item.count}{" "}
                        {item.count === 1 ? "vez" : "veces"}
                      </p>
                    </div>

                    <p className="shrink-0 font-semibold text-foreground">
                      {formatCurrency(item.amount)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Metas de ahorro */}
          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  Mis metas de ahorro
                </h2>
                <p className="text-sm text-muted-foreground">
                  Crea y organiza tus objetivos de ahorro.
                </p>
              </div>

              <Button
                type="button"
                onClick={() => setGoalDialogOpen(true)}
                disabled={creatingGoal || loadingGoals}
              >
                Nueva meta
              </Button>
            </div>

            {loadingGoals ? (
              <div className="animate-pulse space-y-3">
                <div className="h-24 rounded-xl bg-muted" />
                <div className="h-24 rounded-xl bg-muted" />
              </div>
            ) : goalsError ? (
              <div className="rounded-xl border bg-card p-5">
                <p className="text-sm text-destructive">
                  No se pudieron cargar tus metas de ahorro.
                </p>
              </div>
            ) : goals.length === 0 ? (
              <div className="rounded-xl border bg-card p-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Todavía no tienes metas de ahorro.
                  Crea tu primera meta para comenzar.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {goals.map((goal) => {
                  const progress = calculateGoalProgress(goal);

                  return (
                    <div
                      key={goal.id}
                      className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-sm"
                    >
                      {/* Nombre y estado */}
                      <div className="flex flex-wrap items-start justify-between gap-2">
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
                        <p className="text-xl font-bold text-foreground">
                          {formatCurrency(goal.savedAmount)}
                        </p>

                        <p className="text-sm text-muted-foreground">
                          de {formatCurrency(goal.targetAmount)}
                        </p>
                      </div>

                      {/* Barra de progreso */}
                      <div
                        className="h-3 overflow-hidden rounded-full bg-muted"
                        role="progressbar"
                        aria-label={`Progreso de ${goal.name}`}
                        aria-valuenow={progress.percentage}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      >
                        <div
                          className="h-full rounded-full bg-green-600 transition-all"
                          style={{
                            width: `${progress.percentage}%`,
                          }}
                        />
                      </div>

                      {/* Porcentaje y dinero restante */}
                      <div className="flex flex-wrap justify-between gap-2 text-sm">
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
                      <div className="border-t border-border pt-3">
                        <p className="text-sm text-muted-foreground">
                          Fecha límite: {formatDate(goal.deadline, "short")}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}
      
      <Dialog
        open={goalDialogOpen}
        onOpenChange={(open) => {
          if (!creatingGoal) {
            setGoalDialogOpen(open);
          }
        }}
      >
        <DialogContent
          showCloseButton={!creatingGoal}
          className="sm:max-w-[480px]"
        >
          <DialogHeader>
            <DialogTitle>Nueva meta de ahorro</DialogTitle>

            <DialogDescription>
              Define cuánto quieres ahorrar y la fecha
              en la que deseas alcanzar tu objetivo.
            </DialogDescription>
          </DialogHeader>

          <SavingsGoalForm
            saving={creatingGoal}
            onSubmit={handleCreateGoal}
            onCancel={() => setGoalDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

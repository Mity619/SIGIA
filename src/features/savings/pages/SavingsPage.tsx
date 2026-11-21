
import { useEffect, useMemo, useState } from "react";

import { useSnackbar } from "notistack";

import type { SavingsGoal } from "@/domain/savingsGoals";

import {
  createSavingsGoal,
  getSavingsGoals,
} from "@/features/savings/services/savingsGoals.service";
import { SavingsGoalForm } from "@/features/savings/components/SavingsGoalForm";
import { SavingsOverview } from "@/features/savings/components/SavingsOverview";
import { SavingsGoalCard } from "@/features/savings/components/SavingsGoalCard";
import {
  allocateSavingsToGoal,
  getAvailableSavingsForGoals,
  reverseSavingsAllocation,
} from "@/features/savings/services/goalAllocation.service";
import { calculateGoalAllocation } from "@/domain/goalAllocation";
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
import { Input } from "@/shared/components/shadcn/input";
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

  const [availableSavings, setAvailableSavings] = useState<number | null>(null);
  const [loadingAvailable, setLoadingAvailable] = useState(true);
  const [availableError, setAvailableError] = useState(false);
  const [balanceReload, setBalanceReload] = useState(0);

  const [allocationGoalId, setAllocationGoalId] = useState<string | null>(null);
  const [allocationAmount, setAllocationAmount] = useState("");
  const [allocating, setAllocating] = useState(false);
  const [allocationMode, setAllocationMode] = useState<
    "allocate" | "reverse"
  >("allocate");

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

  // El saldo para las metas no depende del año que se esté visualizando.
  useEffect(() => {
    let active = true;

    if (!uid) {
      return () => { active = false; };
    }

    getAvailableSavingsForGoals(uid)
      .then((result) => {
        if (!active) return;
        setAvailableSavings(result.available);
        setAvailableError(false);
      })
      .catch((err) => {
        if (!active) return;
        console.error("Error al consultar ahorro disponible:", err);
        setAvailableSavings(null);
        setAvailableError(true);
      })
      .finally(() => {
        if (active) setLoadingAvailable(false);
      });

    return () => { active = false; };
  }, [uid, balanceReload]);

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


  const selectedAllocationGoal = goals.find(
    (goal) => goal.id === allocationGoalId,
  );

  const handleAllocateSavings = async () => {
    if (!uid || !selectedAllocationGoal || availableSavings === null || allocating) {
      return;
    }

    const amount = Number(allocationAmount);
    try {
      calculateGoalAllocation(selectedAllocationGoal, amount, availableSavings);
    } catch (err) {
      enqueueSnackbar(
        err instanceof Error ? err.message : "El aporte no es válido.",
        { variant: "error" },
      );
      return;
    }

    setAllocating(true);
    try {
      const result = await allocateSavingsToGoal({
        uid,
        goalId: selectedAllocationGoal.id,
        amount,
      });

      setGoals((current) => current.map((goal) =>
        goal.id === selectedAllocationGoal.id
          ? { ...goal, savedAmount: result.newSavedAmount }
          : goal,
      ));
      setAvailableSavings(result.remainingAvailable);
      setAllocationGoalId(null);
      setAllocationAmount("");

      enqueueSnackbar(
        result.completed
          ? "¡Felicitaciones! Alcanzaste tu meta de ahorro."
          : "Ahorro asignado correctamente.",
        { variant: "success" },
      );
    } catch (err) {
      console.error("Error al asignar ahorro:", err);
      enqueueSnackbar(
        err instanceof Error ? err.message : "No se pudo asignar el ahorro.",
        { variant: "error" },
      );
      setLoadingAvailable(true);
      setBalanceReload((current) => current + 1);
    } finally {
      setAllocating(false);
    }
  };

  const handleReverseSavings = async () => {
    if (!uid || !selectedAllocationGoal || allocating) {
      return;
    }

    const amount = Number(allocationAmount);

    if (
      allocationAmount.trim() === "" ||
      !Number.isFinite(amount) ||
      amount <= 0 ||
      amount > selectedAllocationGoal.savedAmount
    ) {
      enqueueSnackbar(
        "El monto debe ser mayor a cero y no superar lo asignado a la meta.",
        { variant: "error" },
      );
      return;
    }

    setAllocating(true);

    try {
      const newSavedAmount = await reverseSavingsAllocation(
        uid,
        selectedAllocationGoal.id,
        amount,
      );

      setGoals((current) =>
        current.map((goal) =>
          goal.id === selectedAllocationGoal.id
            ? { ...goal, savedAmount: newSavedAmount }
            : goal,
        ),
      );

      setAllocationGoalId(null);
      setAllocationAmount("");

      // Consultar el saldo compartido actualizado.
      setAvailableSavings(null);
      setLoadingAvailable(true);
      setBalanceReload((current) => current + 1);

      enqueueSnackbar(
        "Ahorro devuelto correctamente.",
        { variant: "success" },
      );
    } catch (error) {
      console.error("Error al devolver ahorro:", error);

      enqueueSnackbar(
        error instanceof Error
          ? error.message
          : "No se pudo devolver el ahorro.",
        { variant: "error" },
      );
    } finally {
      setAllocating(false);
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
          <SavingsOverview
            summaries={summaries}
            annualSummary={annualSummary}
            referenceDate={referenceDate}
            year={year}
          />

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

            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-sm text-muted-foreground">
                Ahorro disponible para tus metas
              </p>
              {loadingAvailable ? (
                <p className="mt-2 text-sm text-muted-foreground">
                  Calculando ahorro disponible...
                </p>
              ) : availableError ? (
                <div className="mt-3 space-y-3">
                  <p className="text-sm text-destructive">
                    No se pudo calcular el ahorro disponible.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setLoadingAvailable(true);
                      setBalanceReload((current) => current + 1);
                    }}
                  >
                    Reintentar
                  </Button>
                </div>
              ) : (
                <p className="mt-2 text-2xl font-bold text-foreground">
                  {formatCurrency(availableSavings ?? 0)}
                </p>
              )}
              <p className="mt-2 text-xs text-muted-foreground">
                Corresponde a gastos evitados registrados, no a un saldo bancario.
              </p>
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
                {goals.map((goal) => (
                  <SavingsGoalCard
                    key={goal.id}
                    goal={goal}
                    availableSavings={availableSavings}
                    loadingAvailable={loadingAvailable}
                    allocating={allocating}
                    onAllocate={(goalId) => {
                      setAllocationMode("allocate");
                      setAllocationGoalId(goalId);
                      setAllocationAmount("");
                    }}
                    onReverse={(goalId) => {
                      setAllocationMode("reverse");
                      setAllocationGoalId(goalId);
                      setAllocationAmount("");
                    }}
                  />
                ))}
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

      <Dialog
        open={allocationGoalId !== null}
        onOpenChange={(open) => {
          if (!open && !allocating) {
            setAllocationGoalId(null);
            setAllocationAmount("");
          }
        }}
      >
        <DialogContent showCloseButton={!allocating} className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>
              {allocationMode === "reverse"
                ? "Devolver ahorro"
                : "Asignar ahorro"}
            </DialogTitle>
            <DialogDescription>
              {allocationMode === "reverse"
                ? "Indica cuánto dinero deseas devolver al ahorro disponible."
                : "Elige cuánto del ahorro disponible deseas destinar a esta meta."}
            </DialogDescription>
          </DialogHeader>

          {selectedAllocationGoal && (
            <div className="space-y-4">
              <div className="space-y-1 text-sm">
                <p className="font-medium">{selectedAllocationGoal.name}</p>
                <p className="text-muted-foreground">
                  {allocationMode === "reverse"
                    ? `Asignado a esta meta: ${formatCurrency(selectedAllocationGoal.savedAmount)}`
                    : `Disponible: ${formatCurrency(availableSavings ?? 0)}`}
                </p>
                <p className="text-muted-foreground">
                  Falta para la meta: {formatCurrency(Math.max(
                    0,
                    selectedAllocationGoal.targetAmount - selectedAllocationGoal.savedAmount,
                  ))}
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="allocation-amount" className="text-sm font-medium">
                  Monto a asignar
                </label>
                <Input
                  id="allocation-amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={allocationAmount}
                  onChange={(event) => setAllocationAmount(event.target.value)}
                  disabled={allocating}
                  placeholder="Ej. 20000"
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  disabled={allocating}
                  onClick={() => {
                    setAllocationGoalId(null);
                    setAllocationAmount("");
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  disabled={
                    allocating ||
                    allocationAmount.trim() === "" ||
                    !Number.isFinite(Number(allocationAmount)) ||
                    Number(allocationAmount) <= 0
                  }
                  onClick={
                    allocationMode === "reverse"
                      ? handleReverseSavings
                      : handleAllocateSavings
                  }
                  >
                    {allocating
                      ? "Guardando..."
                      : allocationMode === "reverse"
                        ? "Confirmar devolución"
                        : "Confirmar aporte"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

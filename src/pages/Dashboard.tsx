
import { useEffect, useState } from "react";
import { useSnackbar } from "notistack";
import { getErrorMessage } from "@/shared/errors/errorCatalog";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { useAccount } from "@/features/accounts/hooks/useAccount";
import { useItems } from "@/features/items/hooks/useItems";
import { toDomainItem } from "@/features/items/mappers";

import { Header } from "@/shared/components/ui/sections/Header";
import { Button } from "@/shared/components/shadcn/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/shadcn/dialog";
import { formatCurrency, formatDate } from "@/shared/utils/format";

import {
  checklistPeriodRange,
  type ChecklistFrequency,
} from "@/domain/period";

import { IncomeExpenseOverview } from "@/features/dashboard/components/IncomeExpenseOverview";
import { useIncomeExpenseSummary } from "@/features/dashboard/hooks/useIncomeExpenseSummary";

import {
  Checklist,
  ChecklistSkeleton,
  checklistAccountCardClass,
  checklistAccountLabelClass,
} from "@/features/home-checklist/components/Checklist";
import {
  getChecklistPeriod,
  getRecordedChecklistItemIds,
  saveChecklist,
} from "@/features/home-checklist/services/checklist.service";
import type { ChecklistPeriodDoc } from "@/features/home-checklist/types/checklist.types";

const FREQUENCIES: {
  value: ChecklistFrequency;
  label: string;
}[] = [
  { value: "daily", label: "Diarios" },
  { value: "weekly", label: "Semanales" },
  { value: "monthly", label: "Mensuales" },
  { value: "annual", label: "Anuales" },
];

export const Dashboard = () => {
  const { user, getUserId } = useAuth();
  const uid = getUserId() ?? "";

  const { accounts, loadingAccounts } = useAccount();
  const { items, loading, error } = useItems(uid, "expense");
  const { enqueueSnackbar } = useSnackbar();
  const incomeExpense = useIncomeExpenseSummary();

  // Fecha de referencia del periodo actual.
  const [date, setDate] = useState(() => new Date());
  const [now] = useState(() => Date.now());

  // Frecuencia visible y gastos seleccionados.
  const [frequency, setFrequency] =
    useState<ChecklistFrequency>("daily");
  const [checkedIds, setCheckedIds] = useState<string[]>([]);
  const [recordedIds, setRecordedIds] = useState<string[]>([]);
  const [accountId, setAccountId] = useState("");

  // Estado del periodo almacenado.
  const [savedPeriod, setSavedPeriod] =
    useState<ChecklistPeriodDoc | null>(null);
  const [checkingPeriod, setCheckingPeriod] = useState(true);
  const [periodError, setPeriodError] = useState(false);
  const [reload, setReload] = useState(0);

  // Estados del guardado y su confirmación.
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Convertir los gastos al modelo financiero del proyecto.
  const domainItems = items.map(toDomainItem);

  const currentItems = domainItems.filter(
    (item) => item.frequency === frequency,
  );

  const currentIds = new Set(
    currentItems.map((item) => item.id),
  );

  const selectedIds = checkedIds.filter((id) =>
    currentIds.has(id),
  );
  
  const currentRecordedIds = recordedIds.filter((id) =>
    currentIds.has(id),
  );

  const displayedCheckedIds = [
    ...new Set([...selectedIds, ...currentRecordedIds]),
  ];

  // Reutilizar la cuenta predeterminada si no hay selección.
  const selectedAccountId =
    accounts.some((account) => account.id === accountId)
      ? accountId
      : (accounts.find((account) => account.default)?.id ??
        accounts[0]?.id ??
        "");

  // Fechas del periodo seleccionado.
  const range = checklistPeriodRange(frequency, date);

  const lastDay = new Date(
    range.to.getFullYear(),
    range.to.getMonth(),
    range.to.getDate() - 1,
  );

  // El periodo siguiente no puede comenzar en el futuro.
  const canGoNext = range.to.getTime() <= now;

  // Navegar utilizando los límites calendario existentes.
  const changePeriod = (direction: "previous" | "next") => {
    if (saving) return;

    if (
      direction === "next" &&
      range.to.getTime() > Date.now()
    ) {
      return;
    }

    const nextDate =
      direction === "previous"
        ? new Date(
            range.from.getFullYear(),
            range.from.getMonth(),
            range.from.getDate() - 1,
          )
        : new Date(range.to);

    setDate(nextDate);
    setCheckedIds([]);
    setRecordedIds([]);
    setSavedPeriod(null);
    setCheckingPeriod(true);
    setPeriodError(false);
  };


  // Consultar una sola vez el documento del periodo seleccionado.
  useEffect(() => {
    let active = true;

    if (!uid) return;


    getChecklistPeriod(uid, frequency, date)
      .then(async (result) => {
        if (!active) return;

        setSavedPeriod(result);

        if (result) {
          // Una checklist guardada ya no necesita
          // consultar sus movimientos para mostrarse.
          setRecordedIds([]);
        } else {
          const ids = await getRecordedChecklistItemIds(
            uid,
            frequency,
            date,
          );

          if (!active) return;

          setRecordedIds(ids);
        }

        setPeriodError(false);
      })
      .catch((err) => {
        if (!active) return;

        console.error("Error al consultar checklist:", err);
        setPeriodError(true);
        setSavedPeriod(null);
      })
      .finally(() => {
        if (active) {
          setCheckingPeriod(false);
        }
      });

    return () => {
      active = false;
    };
  }, [uid, frequency, date, reload]);

  // Cambiar la frecuencia sin conservar selecciones anteriores.
  const changeFrequency = (next: ChecklistFrequency) => {
    if (saving || next === frequency) return;

    setFrequency(next);
    setDate(new Date());
    setCheckedIds([]);
    setSavedPeriod(null);
    setCheckingPeriod(true);
    setPeriodError(false);
  };

  // Marcar o desmarcar un gasto.
  const toggleItem = (itemId: string) => {
    if (recordedIds.includes(itemId)) return;

    setCheckedIds((current) =>
      current.includes(itemId)
        ? current.filter((id) => id !== itemId)
        : [...current, itemId],
    );
  };

  // Guardar la checklist una vez confirmada.
  const handleSave = async () => {
    if (
      !uid ||
      !selectedAccountId ||
      loading ||
      loadingAccounts ||
      checkingPeriod ||
      periodError ||
      savedPeriod ||
      saving
    ) {
      return;
    }

    setSaving(true);

    try {
      const result = await saveChecklist({
        uid,
        frequency,
        date,
        items: domainItems,
        checkedIds: selectedIds,
        accountId: selectedAccountId,
      });

      if (result.status === "already-exists") {
        enqueueSnackbar("Esta checklist ya fue guardada.", {
          variant: "info",
        });
      } else {
        enqueueSnackbar("Checklist guardada correctamente.", {
          variant: "success",
        });
      }

      // Consultar el resultado actualizado.
      setCheckingPeriod(true);
      setReload((value) => value + 1);
    } catch (err) {
      console.error("Error al guardar checklist:", err);

      const message = getErrorMessage(err);

      enqueueSnackbar(
        `No se pudo guardar la checklist. ${message}`,
        { variant: "error" },
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Header
        title={`Hola ${user?.username || "Usuario"}`}
        paragraph="Bienvenido a tu panel de control. Aquí puedes gestionar tus finanzas personales, ver tus gastos y ahorros, y mucho más."
      />

      <IncomeExpenseOverview {...incomeExpense} />

      <section className="mx-auto max-w-5xl space-y-5">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Checklist de gastos
          </h2>

          <p className="text-sm text-muted-foreground">
            Revisa tus gastos habituales y registra los que realizaste.
          </p>
        </div>

        {/* Selección de frecuencia */}
        <div className="flex flex-wrap gap-2">
          {FREQUENCIES.map((option) => (
            <Button
              key={option.value}
              type="button"
              variant={
                frequency === option.value
                  ? "default"
                  : "outline"
              }
              disabled={saving}
              onClick={() => changeFrequency(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4">
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              onClick={() => changePeriod("previous")}
            >
              Anterior
            </Button>

            <div className="text-center">
              <p className="text-sm font-medium text-foreground">
                {formatDate(range.from, "short")} —{" "}
                {formatDate(lastDay, "short")}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                {canGoNext ? "Periodo anterior" : "Periodo actual"}
              </p>
              
            </div>

            <Button
              type="button"
              variant="outline"
              disabled={saving || !canGoNext}
              onClick={() => changePeriod("next")}
            >
              Siguiente
            </Button>
          </div>

        {loading || loadingAccounts || checkingPeriod ? (
          <ChecklistSkeleton />
        ) : error || periodError ? (
          // Estado de error.
          <div className="rounded-xl border p-5">
            <p className="text-sm text-destructive">
              No se pudo cargar la información de la checklist.
            </p>

            {periodError && (
              <Button
                type="button"
                variant="outline"
                className="mt-3"
                onClick={() => {
                  setCheckingPeriod(true);
                  setPeriodError(false);
                  setReload((value) => value + 1);
                }}
              >
                Reintentar
              </Button>
            )}
          </div>
        ) : savedPeriod ? (
          // Periodo guardado.
          <div className="space-y-4 rounded-2xl border bg-card p-5">
            <h3 className="text-lg font-semibold">
              Periodo completado
            </h3>

            <p className="text-sm text-muted-foreground">
              Esta checklist ya fue guardada.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-muted p-4">
                <p className="text-sm text-muted-foreground">
                  Total gastado
                </p>

                <p className="text-xl font-semibold">
                  {formatCurrency(savedPeriod.totalSpent)}
                </p>
              </div>

              <div className="rounded-xl bg-muted p-4">
                <p className="text-sm text-muted-foreground">
                  Total ahorrado
                </p>

                <p className="text-xl font-semibold">
                  {formatCurrency(savedPeriod.totalSaved)}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Cuenta para registrar movimientos */}
            {currentItems.length > 0 && (
              <div className={checklistAccountCardClass}>
                <label
                  htmlFor="checklist-account"
                  className={checklistAccountLabelClass}
                >
                  Cuenta para registrar los gastos
                </label>

                <select
                  id="checklist-account"
                  value={selectedAccountId}
                  onChange={(event) =>
                    setAccountId(event.target.value)
                  }
                  disabled={saving}
                  className="w-full rounded-md border border-input bg-background p-2 text-sm"
                >
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name}
                    </option>
                  ))}
                </select>

                {accounts.length === 0 && (
                  <p className="mt-2 text-sm text-destructive">
                    Necesitas una cuenta para registrar gastos.
                  </p>
                )}
              </div>
            )}
            {/* Checklist del periodo seleccionado */}
            <Checklist
              frequency={frequency}
              items={domainItems}
              checkedIds={displayedCheckedIds}
              recordedIds={currentRecordedIds}
              onToggle={toggleItem}
              onSave={() => {
                if (range.to.getTime() > Date.now()) {
                  enqueueSnackbar(
                    "Debes esperar a que termine el periodo para guardar la checklist.",
                    { variant: "warning" },
                  );
                  return;
                }

                setConfirmOpen(true);
              }}
              saving={saving}
              disabled={!selectedAccountId}
            />
          </>
        )}
      </section>

      {/* Confirmación con el Dialog existente de SIGIA */}
      <Dialog
        open={confirmOpen}
        onOpenChange={(open) => {
          if (!saving) {
            setConfirmOpen(open);
          }
        }}
      >
        <DialogContent
          className="sm:max-w-[425px]"
          showCloseButton={!saving}
          onInteractOutside={(event) => {
            if (saving) event.preventDefault();
          }}
          onEscapeKeyDown={(event) => {
            if (saving) event.preventDefault();
          }}
        >
          <DialogHeader>
            <DialogTitle>
              ¿Guardar checklist?
            </DialogTitle>

            <DialogDescription>
              Los gastos marcados se registrarán como realizados.
              Los que dejaste sin marcar se contabilizarán como
              ahorrados.
              <br />
              <br />
              No podrás modificar esta checklist después de
              guardarla.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              onClick={() => setConfirmOpen(false)}
            >
              Cancelar
            </Button>

            <Button
              type="button"
              disabled={saving}
              onClick={() => {
                setConfirmOpen(false);
                void handleSave();
              }}
            >
              {saving ? "Guardando..." : "Confirmar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

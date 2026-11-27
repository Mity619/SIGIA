import { UserError } from "@/domain/errors";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  runTransaction,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";

import { db, auth } from "@/firebase/config";
import type { DomainItem } from "@/domain/types";
import {
  checklistPeriodRange,
  type ChecklistFrequency,
} from "@/domain/period";
import { sumAmounts } from "@/domain/money";
import { toInputDate } from "@/shared/utils/date";
import type { Account } from "@/features/accounts/types/account.types";
import type { ItemDoc } from "@/features/items/types/items.types";
import type {
  ChecklistItemRecord,
  ChecklistPeriodDoc,
} from "../types/checklist.types";
import { yearRange } from "@/domain/period";
import type { SavingsPeriodRecord } from "@/domain/savings";

interface SaveChecklistInput {
  uid: string;
  frequency: ChecklistFrequency;
  date: Date;
  items: DomainItem[];
  checkedIds: string[];
  accountId: string;
}

export type SaveChecklistResult =
  | { status: "created" }
  | { status: "already-exists" };

// Identificador estable para impedir registros duplicados.
export function getChecklistPeriodId(
  frequency: ChecklistFrequency,
  date: Date,
): string {
  const { from } = checklistPeriodRange(frequency, date);
  return `${frequency}_${toInputDate(from)}`;
}

/**
 * Guarda los movimientos realizados y los gastos evitados
 * en una única transacción de Firestore.
 */
export async function saveChecklist(
  input: SaveChecklistInput,
): Promise<SaveChecklistResult> {
  const {
    uid,
    frequency,
    date,
    items,
    checkedIds,
    accountId,
  } = input;

  if (!uid || auth.currentUser?.uid !== uid) {
    throw new UserError("Usuario no autenticado.");
  }

  if (!accountId) {
    throw new UserError("Selecciona una cuenta.");
  }

  if (Number.isNaN(date.getTime())) {
    throw new UserError("La fecha no es válida.");
  }

  const { from, to } = checklistPeriodRange(frequency, date);
  if (to.getTime() > Date.now()) {
    throw new UserError(
      "No puedes guardar la checklist hasta que termine el periodo.",
    );
  }

  const periodId = getChecklistPeriodId(frequency, date);

  const selectedItems = items.filter(
    (item) =>
      item.type === "expense" &&
      item.frequency === frequency,
  );

  const itemIds = selectedItems.map((item) => item.id);

  if (
    itemIds.some((id) => !id) ||
    new Set(itemIds).size !== itemIds.length
  ) {
    throw new UserError("La lista contiene gastos inválidos o repetidos.");
  }

  if (selectedItems.length === 0) {
    throw new UserError("No hay gastos para este periodo.");
  }

  const checked = new Set(checkedIds);

  if (
    checked.size !== checkedIds.length ||
    [...checked].some((id) => !itemIds.includes(id))
  ) {
    throw new UserError("La selección contiene gastos inválidos.");
  }

  // Consultar los movimientos que ya existen en el periodo.
  // Una sola consulta, no una consulta por cada gasto.
  const existingEntriesQuery = query(
    collection(db, `users/${uid}/entries`),
    where("date", ">=", Timestamp.fromDate(from)),
    where("date", "<", Timestamp.fromDate(to)),
  );

  const existingEntries = await getDocs(existingEntriesQuery);

  // Agrupar los montos registrados por concepto.
  const recordedAmounts = new Map<string, number[]>();

  for (const entrySnapshot of existingEntries.docs) {
    const entry = entrySnapshot.data();
    const itemId = entry.itemId;

    if (
      typeof itemId !== "string" ||
      !itemIds.includes(itemId) ||
      entry.type === "income"
    ) {
      continue;
    }

    if (
      !Number.isFinite(entry.amount) ||
      entry.amount <= 0
    ) {
      throw new UserError(
        "Uno de los movimientos existentes tiene un monto inválido.",
      );
    }

    const amounts = recordedAmounts.get(itemId) ?? [];
    amounts.push(entry.amount);
    recordedAmounts.set(itemId, amounts);
  }

  const itemsCollection = collection(db, `users/${uid}/items`);
  const entriesCollection = collection(db, `users/${uid}/entries`);

  const periodRef = doc(
    db,
    `users/${uid}/checklist_periods`,
    periodId,
  );

  const accountRef = doc(db, "accounts", accountId);

  return runTransaction(db, async (tx) => {
    // Todas las lecturas ocurren antes de cualquier escritura.
    const existingPeriod = await tx.get(periodRef);

    if (existingPeriod.exists()) {
      return { status: "already-exists" } as const;
    }

    const accountSnapshot = await tx.get(accountRef);

    if (
      !accountSnapshot.exists() ||
      (accountSnapshot.data() as Account).user_id !== uid
    ) {
      throw new UserError("La cuenta seleccionada no es válida.");
    }

    const itemSnapshots = await Promise.all(
      selectedItems.map((item) =>
        tx.get(doc(itemsCollection, item.id)),
      ),
    );

    const completed: ChecklistItemRecord[] = [];
    const saved: ChecklistItemRecord[] = [];

    const movementDate = Timestamp.fromDate(date);

    for (const snapshot of itemSnapshots) {
      if (!snapshot.exists()) {
        throw new UserError("Uno de los gastos ya no existe.");
      }

      const item = snapshot.data() as ItemDoc;

      if (
        item.archived ||
        item.type !== "expense" ||
        item.frequency !== frequency ||
        !Number.isFinite(item.lastAmount) ||
        item.lastAmount <= 0
      ) {
        throw new UserError("Uno de los gastos no es válido.");
      }

      const record: ChecklistItemRecord = {
        itemId: snapshot.id,
        name: item.name,
        amount: item.lastAmount,
      };

      const previousAmounts =
        recordedAmounts.get(snapshot.id) ?? [];

      const alreadyRecorded = previousAmounts.length > 0;

      if (alreadyRecorded || checked.has(snapshot.id)) {
        // Los movimientos manuales cuentan como realizados.
        // Si ya existen, no volvemos a crearlos.
        completed.push({
          ...record,
          amount: alreadyRecorded
            ? sumAmounts(previousAmounts)
            : record.amount,
        });

        if (!alreadyRecorded) {
          // Crear el movimiento únicamente cuando
          // todavía no existe uno para este concepto.
          tx.set(doc(entriesCollection), {
            itemId: snapshot.id,
            type: "expense",
            accountId,
            name: item.name,
            amount: item.lastAmount,
            date: movementDate,
            groupIds: item.groupIds ?? [],
            createdAt: serverTimestamp(),
          });

          const lastUsedAt = item.lastUsedAt;

          if (
            !lastUsedAt ||
            movementDate.toMillis() >= lastUsedAt.toMillis()
          ) {
            tx.update(snapshot.ref, {
              lastAmount: item.lastAmount,
              lastUsedAt: movementDate,
              updatedAt: serverTimestamp(),
            });
          }
        }
      } else {
        // Solo ahorrar gastos sin movimientos
        // existentes y que no fueron marcados.
        saved.push(record);
      }
    }

    // Un documento resume la checklist del periodo.
    tx.set(periodRef, {
      frequency,
      periodStart: Timestamp.fromDate(from),
      periodEnd: Timestamp.fromDate(to),
      completed,
      saved,
      totalSpent: sumAmounts(
        completed.map((item) => item.amount),
      ),
      totalSaved: sumAmounts(
        saved.map((item) => item.amount),
      ),
      accountId,
      createdAt: serverTimestamp(),
    });

    return { status: "created" } as const;
  });
}

/** Consulta la checklist de un periodo específico. */

export async function getChecklistPeriod(
  uid: string,
  frequency: ChecklistFrequency,
  date: Date,
): Promise<(ChecklistPeriodDoc & { id: string }) | null> {
  if (!uid || auth.currentUser?.uid !== uid) {
    throw new UserError("Usuario no autenticado.");
  }

  if (Number.isNaN(date.getTime())) {
    throw new UserError("La fecha no es válida.");
  }

  const periodId = getChecklistPeriodId(frequency, date);

  const periodRef = doc(
    db,
    `users/${uid}/checklist_periods`,
    periodId,
  );

  const snapshot = await getDoc(periodRef);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    ...(snapshot.data() as ChecklistPeriodDoc),
    id: snapshot.id,
  };
}

export async function getRecordedChecklistItemIds(
  uid: string,
  frequency: ChecklistFrequency,
  date: Date,
): Promise<string[]> {
  if (!uid || auth.currentUser?.uid !== uid) {
    throw new UserError("Usuario no autenticado.");
  }

  if (Number.isNaN(date.getTime())) {
    throw new UserError("La fecha no es válida.");
  }

  const { from, to } = checklistPeriodRange(frequency, date);

  const entriesQuery = query(
    collection(db, `users/${uid}/entries`),
    where("date", ">=", Timestamp.fromDate(from)),
    where("date", "<", Timestamp.fromDate(to)),
  );

  const snapshot = await getDocs(entriesQuery);
  const itemIds = new Set<string>();

  for (const entrySnapshot of snapshot.docs) {
    const entry = entrySnapshot.data();

    if (
      typeof entry.itemId === "string" &&
      entry.itemId.length > 0 &&
      entry.type !== "income"
    ) {
      itemIds.add(entry.itemId);
    }
  }

  return [...itemIds];
}

export async function getSavingsPeriods(
  uid: string,
  date: Date,
): Promise<SavingsPeriodRecord[]> {
  if (!uid || auth.currentUser?.uid !== uid) {
    throw new UserError("Usuario no autenticado.");
  }

  if (Number.isNaN(date.getTime())) {
    throw new UserError("La fecha no es válida.");
  }

  const { from, to } = yearRange(date);

  const periodsRef = collection(
    db,
    `users/${uid}/checklist_periods`,
  );

  const periodsQuery = query(
    periodsRef,
    where("periodStart", ">=", Timestamp.fromDate(from)),
    where("periodStart", "<", Timestamp.fromDate(to)),
  );

  const snapshot = await getDocs(periodsQuery);

  return snapshot.docs.map((document) => {
    const data = document.data() as ChecklistPeriodDoc;

    return {
      periodStart: data.periodStart.toDate(),
      periodEnd: data.periodEnd.toDate(),
      saved: data.saved.map((expense) => ({
        itemId: expense.itemId,
        name: expense.name,
        amount: expense.amount,
      })),
    };
  });
}



import {
  collection,
  doc,
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
} from "../types/checklist.types";

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
    throw new Error("Usuario no autenticado.");
  }

  if (!accountId) {
    throw new Error("Selecciona una cuenta.");
  }

  if (Number.isNaN(date.getTime())) {
    throw new Error("La fecha no es válida.");
  }

  const { from, to } = checklistPeriodRange(frequency, date);
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
    throw new Error("La lista contiene gastos inválidos o repetidos.");
  }

  if (selectedItems.length === 0) {
    throw new Error("No hay gastos para este periodo.");
  }

  const checked = new Set(checkedIds);

  if (
    checked.size !== checkedIds.length ||
    [...checked].some((id) => !itemIds.includes(id))
  ) {
    throw new Error("La selección contiene gastos inválidos.");
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
      throw new Error("La cuenta seleccionada no es válida.");
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
        throw new Error("Uno de los gastos ya no existe.");
      }

      const item = snapshot.data() as ItemDoc;

      if (
        item.archived ||
        item.type !== "expense" ||
        item.frequency !== frequency ||
        !Number.isFinite(item.lastAmount) ||
        item.lastAmount <= 0
      ) {
        throw new Error("Uno de los gastos no es válido.");
      }

      const record: ChecklistItemRecord = {
        itemId: snapshot.id,
        name: item.name,
        amount: item.lastAmount,
      };

      if (checked.has(snapshot.id)) {
        completed.push(record);

        // Los gastos realizados generan movimientos reales.
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

        // Se respeta la fecha del último movimiento.
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
      } else {
        // Los gastos evitados NO generan entries.
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

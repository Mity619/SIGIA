import {
  collection,
  doc,
  getDoc,
  getDocs,
  runTransaction,
  Timestamp,
} from "firebase/firestore";

import { auth, db } from "@/firebase/config";

import { fromCents, toCents } from "@/domain/money";

import {
  calculateAvailableSavings,
} from "@/domain/availableSavings";

import {
  calculateGoalAllocation,
} from "@/domain/goalAllocation";

import type { SavingsGoal } from "@/domain/savingsGoals";
import type { SavingsPeriodRecord } from "@/domain/savings";

interface AllocateSavingsInput {
  uid: string;
  goalId: string;
  amount: number;
}

interface AllocationResult {
  newSavedAmount: number;
  remainingAvailable: number;
  completed: boolean;
}

/**
 * Asigna ahorro registrado a una meta.
 *
 * Se consulta el historial una vez y se utiliza
 * un documento compartido para evitar conflictos
 * entre aportes simultáneos.
 */
export async function allocateSavingsToGoal({
  uid,
  goalId,
  amount,
}: AllocateSavingsInput): Promise<AllocationResult> {
  if (!uid || auth.currentUser?.uid !== uid) {
    throw new Error("Usuario no autenticado.");
  }

  if (!goalId) {
    throw new Error("Selecciona una meta válida.");
  }

  // Una consulta para recuperar el historial.
  const periodsRef = collection(
    db,
    `users/${uid}/checklist_periods`,
  );

  const periodsSnapshot = await getDocs(periodsRef);

  const records: SavingsPeriodRecord[] =
    periodsSnapshot.docs.map((snapshot) => {
      const data = snapshot.data();

      const start = data.periodStart as Timestamp;
      const end = data.periodEnd as Timestamp;

      return {
        periodStart: start.toDate(),
        periodEnd: end.toDate(),
        saved: data.saved as SavingsPeriodRecord["saved"],
      };
    });

  // El total contabilizable se calcula sin aportes
  // porque las asignaciones se controlan en un
  // documento compartido de Firestore.
  const goalRef = doc(
    db,
    `users/${uid}/savings_goals/${goalId}`,
  );

  const allocationsRef = doc(
    db,
    `users/${uid}/savings_state/allocations`,
  );

  return runTransaction(db, async (tx) => {
    // Todas las lecturas antes de las escrituras.
    const goalSnapshot = await tx.get(goalRef);
    const allocationsSnapshot = await tx.get(
      allocationsRef,
    );

    if (!goalSnapshot.exists()) {
      throw new Error("La meta no existe.");
    }

    const goalData = goalSnapshot.data();

    const goal: SavingsGoal = {
      id: goalSnapshot.id,
      name: goalData.name as string,
      targetAmount: goalData.targetAmount as number,
      savedAmount: goalData.savedAmount as number,
      deadline: (goalData.deadline as Timestamp).toDate(),
    };

    const totalAssigned = allocationsSnapshot.exists()
      ? (allocationsSnapshot.data().totalAssigned as number)
      : 0;

    if (
      !Number.isFinite(totalAssigned) ||
      totalAssigned < 0
    ) {
      throw new Error("El saldo asignado no es válido.");
    }

    const available = calculateAvailableSavings(
      records,
      [
        {
          ...goal,
          savedAmount: totalAssigned,
        },
      ],
    ).available;

    const result = calculateGoalAllocation(
      goal,
      amount,
      available,
    );

    const updatedAssigned = fromCents(
      toCents(totalAssigned) + toCents(amount),
    );

    // Ambas escrituras forman una sola transacción.
    tx.update(goalRef, {
      savedAmount: result.newSavedAmount,
    });

    tx.set(allocationsRef, {
      totalAssigned: updatedAssigned,
    });

    return result;
  });
}
/**
 * Consulta el ahorro asignable sin descargar las metas.
 * Una consulta al historial + una lectura del documento de control.
 */
export async function getAvailableSavingsForGoals(uid: string) {
  if (!uid || auth.currentUser?.uid !== uid) {
    throw new Error("Usuario no autenticado.");
  }

  const periodsRef = collection(db, `users/${uid}/checklist_periods`);
  const allocationsRef = doc(db, `users/${uid}/savings_state/allocations`);

  const [periodsSnapshot, allocationsSnapshot] = await Promise.all([
    getDocs(periodsRef),
    getDoc(allocationsRef),
  ]);

  const records: SavingsPeriodRecord[] = periodsSnapshot.docs.map((snapshot) => {
    const data = snapshot.data();
    return {
      periodStart: (data.periodStart as Timestamp).toDate(),
      periodEnd: (data.periodEnd as Timestamp).toDate(),
      saved: data.saved as SavingsPeriodRecord["saved"],
    };
  });

  const summary = calculateAvailableSavings(records, []);
  const totalAssigned = allocationsSnapshot.exists()
    ? (allocationsSnapshot.data().totalAssigned as number)
    : 0;

  if (!Number.isFinite(totalAssigned) || totalAssigned < 0) {
    throw new Error("El saldo asignado no es válido.");
  }

  return {
    totalSaved: summary.totalSaved,
    totalAssigned,
    available: fromCents(
      Math.max(0, toCents(summary.totalSaved) - toCents(totalAssigned)),
    ),
    excludedPeriods: summary.excludedPeriods,
  };
}

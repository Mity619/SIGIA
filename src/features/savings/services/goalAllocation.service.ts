import { UserError } from "@/domain/errors";
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
    throw new UserError("Usuario no autenticado.");
  }

  if (!goalId) {
    throw new UserError("Selecciona una meta válida.");
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
      throw new UserError("La meta no existe.");
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
      throw new UserError("El saldo asignado no es válido.");
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
 * Devuelve al saldo disponible una cantidad
 * previamente asignada a una meta.
 *
 * La meta y el saldo compartido se actualizan
 * en una única transacción.
 */
export async function reverseSavingsAllocation(
  uid: string,
  goalId: string,
  amount: number,
): Promise<number> {
  if (!uid || auth.currentUser?.uid !== uid) {
    throw new UserError("Usuario no autenticado.");
  }

  if (!goalId) {
    throw new UserError("Selecciona una meta válida.");
  }

  if (
    !Number.isFinite(amount) ||
    amount <= 0 ||
    !Number.isSafeInteger(Math.round(amount * 100)) ||
    Math.abs(amount * 100 - Math.round(amount * 100)) >= 1e-7
  ) {
    throw new UserError("El monto a devolver no es válido.");
  }

  const amountCents = toCents(amount);

  const goalRef = doc(
    db,
    `users/${uid}/savings_goals/${goalId}`,
  );

  const allocationsRef = doc(
    db,
    `users/${uid}/savings_state/allocations`,
  );

  return runTransaction(db, async (tx) => {
    const goalSnapshot = await tx.get(goalRef);
    const allocationsSnapshot = await tx.get(allocationsRef);

    if (!goalSnapshot.exists()) {
      throw new UserError("La meta no existe.");
    }

    if (!allocationsSnapshot.exists()) {
      throw new UserError("No existen asignaciones para devolver.");
    }

    const savedAmount = goalSnapshot.data().savedAmount;
    const totalAssigned =
      allocationsSnapshot.data().totalAssigned;

    if (
      typeof savedAmount !== "number" ||
      typeof totalAssigned !== "number" ||
      !Number.isFinite(savedAmount) ||
      !Number.isFinite(totalAssigned) ||
      savedAmount < 0 ||
      totalAssigned < 0
    ) {
      throw new UserError("Los saldos registrados no son válidos.");
    }

    const savedCents = toCents(savedAmount);
    const assignedCents = toCents(totalAssigned);

    if (
      !Number.isSafeInteger(savedCents) ||
      !Number.isSafeInteger(assignedCents)
    ) {
      throw new UserError("Los saldos registrados no son válidos.");
    }

    if (amountCents > savedCents) {
      throw new UserError(
        "No puedes devolver más de lo asignado a la meta.",
      );
    }

    if (amountCents > assignedCents) {
      throw new UserError(
        "El saldo compartido no permite esta devolución.",
      );
    }

    const newSavedAmount = fromCents(
      savedCents - amountCents,
    );

    const newTotalAssigned = fromCents(
      assignedCents - amountCents,
    );

    tx.update(goalRef, {
      savedAmount: newSavedAmount,
    });

    tx.update(allocationsRef, {
      totalAssigned: newTotalAssigned,
    });

    return newSavedAmount;
  });
}
/**
 * Consulta el ahorro asignable sin descargar las metas.
 * Una consulta al historial + una lectura del documento de control.
 */
export async function getAvailableSavingsForGoals(uid: string) {
  if (!uid || auth.currentUser?.uid !== uid) {
    throw new UserError("Usuario no autenticado.");
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
    throw new UserError("El saldo asignado no es válido.");
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

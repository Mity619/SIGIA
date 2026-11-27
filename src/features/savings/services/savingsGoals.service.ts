
import { UserError } from "@/domain/errors";
import {
  addDoc,
  collection,
  getDocs,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";

import { auth, db } from "@/firebase/config";

import type { SavingsGoal } from "@/domain/savingsGoals";
import type {
  CreateSavingsGoalInput,
  SavingsGoalDoc,
} from "../types/savingsGoals.types";

// Comprobar que la operación pertenece al usuario autenticado.
function validateUser(uid: string): void {
  if (!uid || auth.currentUser?.uid !== uid) {
    throw new UserError("Usuario no autenticado.");
  }
}

/**
 * Crea una nueva meta de ahorro.
 *
 * El monto acumulado comienza en cero.
 * Los aportes se gestionarán posteriormente.
 */
export async function createSavingsGoal(
  uid: string,
  input: CreateSavingsGoalInput,
): Promise<string> {
  validateUser(uid);

  const name = input.name.trim();

  if (!name || name.length > 100) {
    throw new UserError(
      "El nombre de la meta debe tener entre 1 y 100 caracteres.",
    );
  }

  if (
    !Number.isFinite(input.targetAmount) ||
    input.targetAmount <= 0 ||
    Math.round(input.targetAmount * 100) / 100 !==
      input.targetAmount
  ) {
    throw new UserError("El monto de la meta no es válido.");
  }

  if (
    !(input.deadline instanceof Date) ||
    Number.isNaN(input.deadline.getTime())
  ) {
    throw new UserError("La fecha límite no es válida.");
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (input.deadline.getTime() < today.getTime()) {
    throw new UserError(
      "La fecha límite no puede ser anterior a hoy.",
    );
  }

  const goalsRef = collection(
    db,
    `users/${uid}/savings_goals`,
  );

  const document = await addDoc(goalsRef, {
    name,
    targetAmount: input.targetAmount,
    savedAmount: 0,
    deadline: Timestamp.fromDate(input.deadline),
    createdAt: serverTimestamp(),
  });

  return document.id;
}

/**
 * Obtiene las metas del usuario.
 *
 * Una sola consulta, sin suscripciones adicionales.
 */
export async function getSavingsGoals(
  uid: string,
): Promise<SavingsGoal[]> {
  validateUser(uid);

  const goalsRef = collection(
    db,
    `users/${uid}/savings_goals`,
  );

  const snapshot = await getDocs(goalsRef);

  return snapshot.docs
    .map((document) => {
      const data = document.data() as SavingsGoalDoc;

      return {
        id: document.id,
        name: data.name,
        targetAmount: data.targetAmount,
        savedAmount: data.savedAmount,
        deadline: data.deadline.toDate(),
      };
    })
    .sort(
      (a, b) =>
        a.deadline.getTime() - b.deadline.getTime(),
    );
}

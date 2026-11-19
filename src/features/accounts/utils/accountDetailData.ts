import { FirebaseError } from "firebase/app";
import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "@/firebase/config";
import type { EntryDoc } from "@/features/items/types/items.types";
import { ACCOUNTS_COLLECTION } from "../constants/account.constants";
import type { Account, AccountDoc } from "../types/account.types";

export type AccountEntryDoc = EntryDoc & { id: string };

const isPermissionDenied = (error: unknown): boolean =>
  error instanceof FirebaseError && error.code === "permission-denied";

/**
 * Cuenta por id, en tiempo real. Entrega null si no existe o no pertenece al usuario:
 * una cuenta ajena (o bloqueada por las reglas) se trata igual que una inexistente.
 */
export const subscribeToAccount = (
  userId: string,
  accountId: string,
  onChange: (account: AccountDoc | null) => void,
  onError: (error: unknown) => void,
): Unsubscribe => {
  try {
    return onSnapshot(
      doc(db, ACCOUNTS_COLLECTION, accountId),
      (snapshot) => {
        if (!snapshot.exists()) {
          onChange(null);
          return;
        }
        const account: AccountDoc = { ...(snapshot.data() as Account), id: snapshot.id };
        onChange(account.user_id === userId ? account : null);
      },
      (error) => (isPermissionDenied(error) ? onChange(null) : onError(error)),
    );
  } catch {
    // Un id que no es una ruta válida de Firestore (p. ej. con "/") no puede existir.
    onChange(null);
    return () => {};
  }
};

/** Movimientos (gastos e ingresos) del usuario asignados a la cuenta, en tiempo real. */
export const subscribeToAccountEntries = (
  userId: string,
  accountId: string,
  onChange: (entries: AccountEntryDoc[]) => void,
  onError: (error: unknown) => void,
): Unsubscribe =>
  onSnapshot(
    query(collection(db, "users", userId, "entries"), where("accountId", "==", accountId)),
    (snapshot) =>
      onChange(
        snapshot.docs.map((entry) => ({ ...(entry.data() as EntryDoc), id: entry.id })),
      ),
    onError,
  );

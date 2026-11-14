import { useEffect, useState } from "react";
import {
  collection,
  doc,
  getDocs,
  limit,
  query,
  runTransaction,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useSnackbar } from "notistack";
import { db, auth } from "@/firebase/config";
import { useCollection } from "@/firebase/hooks/useCollection";
import type { UserDoc } from "@/features/auth/types/user.types";
import {
  ACCOUNTS_COLLECTION,
  DEFAULT_ACCOUNT,
  DEFAULT_ACCOUNT_ID_PREFIX,
} from "../constants/account.constants";
import type { Account, CreateAccountInput } from "../types/account.types";
import {
  ACCOUNT_NAME_ERROR_MESSAGES,
  canDeleteAccount,
  sanitizeAccountName,
  validateAccountName,
} from "../utils/accountRules";
import { getAccountErrorMessage } from "../utils/accountErrors";

export const ensureDefaultAccount = async (
  userId: string,
  newUserProfile?: UserDoc,
): Promise<UserDoc> => {
  const userRef = doc(db, "users", userId);
  const defaultAccountId = `${DEFAULT_ACCOUNT_ID_PREFIX}${userId}`;
  const defaultAccountRef = doc(db, ACCOUNTS_COLLECTION, defaultAccountId);

  return runTransaction(db, async (transaction) => {
    const [userSnapshot, defaultAccountSnapshot] = await Promise.all([
      transaction.get(userRef),
      transaction.get(defaultAccountRef),
    ]);

    if (!userSnapshot.exists() && !newUserProfile) {
      throw new Error("AUTH_USER_PROFILE_MISSING");
    }

    if (defaultAccountSnapshot.exists()) {
      const existingAccount = defaultAccountSnapshot.data() as Account;

      if (existingAccount.user_id !== userId) {
        throw new Error("ACCOUNT_DEFAULT_ID_CONFLICT");
      }

      if (
        existingAccount.name !== DEFAULT_ACCOUNT.name ||
        existingAccount.default !== DEFAULT_ACCOUNT.default
      ) {
        transaction.update(defaultAccountRef, {
          name: DEFAULT_ACCOUNT.name,
          default: DEFAULT_ACCOUNT.default,
        });
      }
    } else {
      transaction.set(defaultAccountRef, {
        user_id: userId,
        ...DEFAULT_ACCOUNT,
        createdAt: serverTimestamp(),
      });
    }

    if (!userSnapshot.exists() && newUserProfile) {
      transaction.set(userRef, {
        ...newUserProfile,
        createdAt: serverTimestamp(),
      });

      return newUserProfile;
    }

    return userSnapshot.data() as UserDoc;
  });
};

const accountHasEntries = async (
  userId: string,
  accountId: string,
): Promise<boolean> => {
  const snapshot = await getDocs(
    query(
      collection(db, `users/${userId}/entries`),
      where("accountId", "==", accountId),
      limit(1),
    ),
  );

  return !snapshot.empty;
};

const deleteAccountDocument = async (
  userId: string,
  accountId: string,
): Promise<void> => {
  const accountRef = doc(db, ACCOUNTS_COLLECTION, accountId);

  await runTransaction(db, async (transaction) => {
    const accountSnapshot = await transaction.get(accountRef);

    if (!accountSnapshot.exists()) {
      throw new Error("ACCOUNT_NOT_FOUND");
    }

    const account = accountSnapshot.data() as Account;

    if (account.user_id !== userId) {
      throw new Error("ACCOUNT_ACCESS_DENIED");
    }

    if (!canDeleteAccount(account)) {
      throw new Error("ACCOUNT_DEFAULT_CANNOT_DELETE");
    }

    // Los movimientos guardan el id de su cuenta: borrarla los dejaría huérfanos.
    if (await accountHasEntries(userId, accountId)) {
      throw new Error("ACCOUNT_HAS_ENTRIES");
    }

    transaction.delete(accountRef);
  });
};

export default function useAccountState() {
  const { enqueueSnackbar } = useSnackbar();

  const [uid, setUid] = useState<string | undefined>(auth.currentUser?.uid);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUid(user?.uid);
    });
    return unsubscribe;
  }, []);

  const accountsCol = useCollection<Account>(ACCOUNTS_COLLECTION);
  // Instancia aparte para escribir: su isPending no debe mostrar el skeleton de la lista.
  const accountsWriter = useCollection<Account>(ACCOUNTS_COLLECTION);

  useEffect(() => {
    if (!uid) return;
    const unsubscribe = accountsCol.suscribe([["user_id", "==", uid]]);
    return unsubscribe;
  }, [uid]);

  const createAccount = async (input: CreateAccountInput): Promise<boolean> => {
    if (!uid) {
      enqueueSnackbar(getAccountErrorMessage(new Error("ACCOUNT_SESSION_MISSING")), {
        variant: "error",
      });
      return false;
    }

    const name = sanitizeAccountName(input.name);
    const nameError = validateAccountName(
      name,
      accountsCol.results.map((account) => account.name),
    );

    if (nameError) {
      enqueueSnackbar(ACCOUNT_NAME_ERROR_MESSAGES[nameError], { variant: "error" });
      return false;
    }

    const id = await accountsWriter.add({ user_id: uid, name, default: false });

    if (id) enqueueSnackbar("Cuenta creada.", { variant: "success" });
    else enqueueSnackbar("No se pudo crear la cuenta. Inténtalo de nuevo.", { variant: "error" });

    return id !== null;
  };

  const removeAccount = async (accountId: string): Promise<boolean> => {
    try {
      if (!uid) throw new Error("ACCOUNT_SESSION_MISSING");

      await deleteAccountDocument(uid, accountId);
      enqueueSnackbar("Cuenta eliminada.", { variant: "success" });
      return true;
    } catch (error) {
      enqueueSnackbar(getAccountErrorMessage(error), { variant: "error" });
      return false;
    }
  };

  const accounts = [...accountsCol.results].sort((a, b) => {
    if (a.default && !b.default) return -1;
    if (!a.default && b.default) return 1;
    return a.name.localeCompare(b.name);
  });

  return {
    accounts,
    loadingAccounts: accountsCol.isPending,
    hasAccountsError: accountsCol.error !== null,
    ensureDefaultAccount,
    createAccount,
    removeAccount,
  };
}

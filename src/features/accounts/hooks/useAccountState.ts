import { useEffect, useState } from "react";
import {
  doc,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useSnackbar } from "notistack";
import { db, auth } from "@/firebase/config";
import { useCollection } from "@/firebase/hooks/useCollection";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type { UserDoc } from "@/features/auth/types/user.types";
import { getAuthErrorMessage } from "@/features/auth/utils/firebaseErrors";
import {
  DEFAULT_ACCOUNT,
  DEFAULT_ACCOUNT_ID_PREFIX,
} from "../constants/account.constants";
import type { Account } from "../types/account.types";

export const ensureDefaultAccount = async (
  userId: string,
  newUserProfile?: UserDoc,
): Promise<UserDoc> => {
  const userRef = doc(db, "users", userId);
  const defaultAccountId = `${DEFAULT_ACCOUNT_ID_PREFIX}${userId}`;
  const defaultAccountRef = doc(db, "accounts", defaultAccountId);

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

const deleteAccountDocument = async (
  userId: string,
  accountId: string,
): Promise<void> => {
  const accountRef = doc(db, "accounts", accountId);

  await runTransaction(db, async (transaction) => {
    const accountSnapshot = await transaction.get(accountRef);

    if (!accountSnapshot.exists()) {
      throw new Error("ACCOUNT_NOT_FOUND");
    }

    const account = accountSnapshot.data() as Account;

    if (account.user_id !== userId) {
      throw new Error("ACCOUNT_ACCESS_DENIED");
    }

    if (account.default !== false) {
      throw new Error("ACCOUNT_DEFAULT_CANNOT_DELETE");
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

  const accountsCol = useCollection<Account>("accounts");

  useEffect(() => {
    if (!uid) return;
    const unsubscribe = accountsCol.suscribe([["user_id", "==", uid]]);
    return unsubscribe;
  }, [uid]); 

  const removeAccount = async (userId: string, accountId: string): Promise<boolean> => {
    try {
      await deleteAccountDocument(userId, accountId);
      return true;
    } catch (error) {
      enqueueSnackbar(getAuthErrorMessage(error), { variant: "error" });
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
    ensureDefaultAccount,
    removeAccount,
  };
}

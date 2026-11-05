//* React
import { useEffect, useRef, useState } from "react";
import { useSnackbar } from "notistack";

//* Firebase
import { auth, db, provider } from "@/firebase/config";
import {
  createUserWithEmailAndPassword,
  deleteUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User as FirebaseUser,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

// * Types & utils
import type { User, UserDoc, UserLogin } from "../types/user.types";
import { getAuthErrorMessage } from "../utils/firebaseErrors";

const getOrCreateUserProfile = async (
  firebaseUser: FirebaseUser,
  fallbackUsername?: string,
): Promise<UserDoc> => {
  const userRef = doc(db, "users", firebaseUser.uid);
  const userSnapshot = await getDoc(userRef);

  if (userSnapshot.exists()) {
    return userSnapshot.data() as UserDoc;
  }

  if (!firebaseUser.email) {
    throw new Error("AUTH_USER_EMAIL_MISSING");
  }

  const profile: UserDoc = {
    username:
      fallbackUsername?.trim() ||
      firebaseUser.displayName?.trim() ||
      firebaseUser.email.split("@")[0] ||
      "Usuario",
    email: firebaseUser.email,
    photoURL: firebaseUser.photoURL || "",
  };

  await setDoc(userRef, {
    ...profile,
    createdAt: serverTimestamp(),
  });

  return profile;
};

export default function useAuthState() {
  //* States
  const [user, setUser] = useState<UserDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const { enqueueSnackbar } = useSnackbar();

  //* Refs
  // ? Es true mientras se crea el perfil (registro o Google), para que el
  // ? listener no busque un documento que todavía no existe.
  const isSyncingRef = useRef(false);

  //* Effects
  useEffect(() => {
    // ? onAuthStateChanged se ejecuta cuando el usuario inicia sesión, cierra sesión
    // ? o Firebase restaura una sesión activa al recargar la página.
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // Durante el registro, la función correspondiente carga el perfil al terminar
      if (isSyncingRef.current) return;

      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const userProfile = await getOrCreateUserProfile(firebaseUser);
        setUser(userProfile);
      } catch (error) {
        setUser(null);
        enqueueSnackbar(getAuthErrorMessage(error), { variant: "error" });
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [enqueueSnackbar]);

  //* Functions
  const registerWithEmailAndPassword = async ({
    email,
    password,
    username,
  }: User): Promise<string | null> => {
    isSyncingRef.current = true;

    try {
      // ? Se crea el usuario en Authentication
      const { user: firebaseUser } = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      try {
        const profile = await getOrCreateUserProfile(firebaseUser, username);
        setUser(profile);
      } catch (err) {
        // Sin perfil no se deja la cuenta creada
        await deleteUser(firebaseUser);
        throw err;
      }

      enqueueSnackbar("Cuenta creada correctamente.", { variant: "success" });
      return null;
    } catch (err) {
      return getAuthErrorMessage(err);
    } finally {
      isSyncingRef.current = false;
    }
  };

  const loginWithEmailAndPassword = async (
    credentials: UserLogin,
  ): Promise<string | null> => {
    isSyncingRef.current = true;
    let signedInUser: FirebaseUser | null = null;

    try {
      const { user: firebaseUser } = await signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password,
      );
      signedInUser = firebaseUser;

      const profile = await getOrCreateUserProfile(firebaseUser);
      setUser(profile);
      enqueueSnackbar("Sesión iniciada correctamente.", {
        variant: "success",
      });
      return null;
    } catch (err) {
      if (signedInUser) {
        try {
          await signOut(auth);
        } catch {
          return "No se pudo sincronizar el perfil ni cerrar la sesión. Intenta nuevamente.";
        }
      }
      return getAuthErrorMessage(err);
    } finally {
      isSyncingRef.current = false;
    }
  };

  const authWithGoogle = async (): Promise<string | null> => {
    isSyncingRef.current = true;
    let signedInUser: FirebaseUser | null = null;

    try {
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;
      signedInUser = firebaseUser;
      const profile = await getOrCreateUserProfile(firebaseUser);
      setUser(profile);
      enqueueSnackbar("Sesión iniciada con Google.", { variant: "success" });
      return null;
    } catch (error) {
      if (signedInUser) {
        try {
          await signOut(auth);
        } catch {
          return "No se pudo sincronizar el perfil ni cerrar la sesión. Intenta nuevamente.";
        }
      }
      return getAuthErrorMessage(error);
    } finally {
      isSyncingRef.current = false;
    }
  };

  const logout = async (): Promise<string | null> => {
    try {
      await signOut(auth);
      enqueueSnackbar("Sesión cerrada correctamente.", { variant: "success" });
      return null;
    } catch {
      const errorMessage = "No se pudo cerrar sesión. Intenta nuevamente.";
      enqueueSnackbar(errorMessage, { variant: "error" });
      return errorMessage;
    }
  };

  const getUserId = (): string | undefined => {
    return auth.currentUser?.uid;
  };

  return {
    user,
    loading,
    registerWithEmailAndPassword,
    loginWithEmailAndPassword,
    authWithGoogle,
    logout,
    getUserId,
  };
}

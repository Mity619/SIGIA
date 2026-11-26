import { useState, type SubmitEvent } from "react";
import { useNavigate } from "react-router";
import { useSnackbar } from "notistack";
import { useAuth } from "./useAuth";
import type { User, UserLogin } from "../types/user.types";

export const useAuthForm = (isSignup: boolean) => {
  //* Context
  const {
    registerWithEmailAndPassword,
    loginWithEmailAndPassword,
    authWithGoogle,
  } = useAuth();

  //* States
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  //* Hooks
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  //* Handlers
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  //* Functions
  const handleRegister = async () => {
    if (
      email.trim() === "" ||
      username.trim() === "" ||
      password.trim() === ""
    ) {
      return;
    }

    const credentials: User = {
      email,
      username,
      password,
    };

    const errorMessage = await registerWithEmailAndPassword(credentials);

    if (errorMessage) {
      enqueueSnackbar(errorMessage, { variant: "error" });
      return;
    }

    navigate("/login");
  };

  const handleLogin = async () => {
    if (email.trim() === "" || password.trim() === "") {
      return;
    }

    const credentials: UserLogin = {
      email,
      password,
    };

    const errorMessage = await loginWithEmailAndPassword(credentials);

    if (errorMessage) {
      enqueueSnackbar(errorMessage, { variant: "error" });
      return;
    }
    navigate("/dashboard", { replace: true });
  };

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isSignup) {
      handleRegister();
    } else {
      handleLogin();
    }
  };

  const handleGoogleAuth = async () => {
    const errorMessage = await authWithGoogle();

    if (errorMessage) {
      enqueueSnackbar(errorMessage, { variant: "error" });
      return;
    }

    navigate("/dashboard", { replace: true });
  };

  return {
    email,
    username,
    password,
    handleEmailChange,
    handleUsernameChange,
    handlePasswordChange,
    handleSubmit,
    handleGoogleAuth,
  };
};

import { useState, type ChangeEvent, type SubmitEvent } from "react";
import { useAccount } from "./useAccount";
import {
  ACCOUNT_NAME_ERROR_MESSAGES,
  validateAccountName,
} from "../utils/accountRules";

export const useAccountForm = () => {
  //* Context
  const { accounts, createAccount } = useAccount();

  //* States
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  //* Handlers
  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    setNameError(null);
  };

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSaving) return;

    const error = validateAccountName(
      name,
      accounts.map((account) => account.name),
    );

    if (error) {
      setNameError(ACCOUNT_NAME_ERROR_MESSAGES[error]);
      return;
    }

    setIsSaving(true);
    const wasCreated = await createAccount({ name });
    setIsSaving(false);

    if (wasCreated) {
      setName("");
    }
  };

  return {
    name,
    nameError,
    isSaving,
    handleNameChange,
    handleSubmit,
  };
};

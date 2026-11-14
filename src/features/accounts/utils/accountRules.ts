import { normalizeText } from "@/domain";
import { ACCOUNT_NAME_MAX_LENGTH } from "../constants/account.constants";
import type { Account } from "../types/account.types";

export type AccountNameError =
  | "ACCOUNT_NAME_REQUIRED"
  | "ACCOUNT_NAME_TOO_LONG"
  | "ACCOUNT_NAME_DUPLICATE";

export const ACCOUNT_NAME_ERROR_MESSAGES: Record<AccountNameError, string> = {
  ACCOUNT_NAME_REQUIRED: "El nombre es obligatorio",
  ACCOUNT_NAME_TOO_LONG: `El nombre no puede superar los ${ACCOUNT_NAME_MAX_LENGTH} caracteres`,
  ACCOUNT_NAME_DUPLICATE: "Ya tienes una cuenta con ese nombre",
};

export const sanitizeAccountName = (name: string): string => name.trim();

export const isAccountNameTaken = (
  name: string,
  existingNames: readonly string[],
): boolean => {
  const target = normalizeText(name);
  return existingNames.some(
    (existingName) => normalizeText(existingName) === target,
  );
};

export const validateAccountName = (
  name: string,
  existingNames: readonly string[],
): AccountNameError | null => {
  const sanitizedName = sanitizeAccountName(name);

  if (sanitizedName.length === 0) return "ACCOUNT_NAME_REQUIRED";
  if (sanitizedName.length > ACCOUNT_NAME_MAX_LENGTH) {
    return "ACCOUNT_NAME_TOO_LONG";
  }
  if (isAccountNameTaken(sanitizedName, existingNames)) {
    return "ACCOUNT_NAME_DUPLICATE";
  }

  return null;
};

// Una cuenta sin el campo `default` se trata como predeterminada: ante la duda, no se borra.
export const canDeleteAccount = (account: Pick<Account, "default">): boolean =>
  account.default === false;

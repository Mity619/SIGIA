import type { Ref } from "react";
import { Button } from "@/shared/components/shadcn/button";
import {
  Field,
  FieldError,
  FieldLabel,
} from "@/shared/components/shadcn/field";
import { Input } from "@/shared/components/shadcn/input";
import { useAccountForm } from "../hooks/useAccountForm";

const NAME_INPUT_ID = "account-name";
const NAME_ERROR_ID = "account-name-error";

interface Props {
  nameInputRef?: Ref<HTMLInputElement>;
}

export const AccountForm = ({ nameInputRef }: Props) => {
  const { name, nameError, isSaving, handleNameChange, handleSubmit } =
    useAccountForm();

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-2xl border border-border bg-card p-6 shadow-sm"
    >
      <Field data-invalid={nameError !== null}>
        <FieldLabel htmlFor={NAME_INPUT_ID}>Nombre de la cuenta</FieldLabel>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            ref={nameInputRef}
            id={NAME_INPUT_ID}
            placeholder="Ej. Ahorros"
            autoComplete="off"
            value={name}
            onChange={handleNameChange}
            aria-invalid={nameError !== null}
            aria-describedby={nameError ? NAME_ERROR_ID : undefined}
            className="h-11 rounded-xl px-4"
          />
          <Button
            type="submit"
            disabled={isSaving}
            className="h-11 rounded-xl px-6 font-semibold hover:bg-orquidea-70"
          >
            <i className="ri-add-line text-lg" aria-hidden="true" />
            {isSaving ? "Guardando…" : "Crear cuenta"}
          </Button>
        </div>
        <FieldError id={NAME_ERROR_ID}>{nameError}</FieldError>
      </Field>
    </form>
  );
};

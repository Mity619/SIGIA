import { Logo } from "@/shared/components/brand/Logo";
import { Button } from "@/shared/components/shadcn/button";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/shared/components/shadcn/field";
import { Input } from "@/shared/components/shadcn/input";
import { Skeleton } from "@/shared/components/shadcn/skeleton";
import { LoadingRegion } from "@/shared/components/ui/loading/LoadingRegion";
import { SkeletonText } from "@/shared/components/ui/loading/SkeletonText";
import { Link } from "react-router-dom";
import { useAuthForm } from "../hooks/useAuthForm";
import { GoogleIcon } from "@/shared/components/brand/GoogleIcon";
import { PASSWORD_MIN_LENGTH } from "../constants/auth.constants";

interface Props {
  isSignup?: boolean;
}

const inputClass =
  "h-11 rounded-xl border-border bg-muted/50 px-4 transition focus-visible:border-primary focus-visible:bg-card focus-visible:ring-primary/20";

const labelClass = "text-sm font-medium text-foreground";

const mainClass =
  "flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-primary/5 via-background to-orquidea-70/8 px-4 py-10";
const formClass =
  "flex w-full max-w-md flex-col rounded-3xl border border-border bg-card px-8 py-10 shadow-xl shadow-foreground/5 sm:px-10";

const LOGIN_FIELD_COUNT = 2;
const SIGNUP_FIELD_COUNT = 3;

/** Misma forma que AuthForm, mientras se comprueba si ya hay una sesión activa. */
export const AuthFormSkeleton = ({ isSignup = false }: Props) => (
  <main className={mainClass}>
    <LoadingRegion className={formClass} label="Comprobando tu sesión">
      <div className="text-center">
        <div className="mb-2 flex items-center justify-center gap-3">
          <Skeleton className="size-12 shrink-0 rounded-2xl" />
          <SkeletonText className="text-2xl" barClassName="w-44" />
        </div>
        <SkeletonText className="mt-2 py-2 text-sm" barClassName="w-64" />
      </div>

      <div className="my-8">
        <FieldGroup className="gap-5">
          {Array.from(
            { length: isSignup ? SIGNUP_FIELD_COUNT : LOGIN_FIELD_COUNT },
            (_, index) => (
              <Field key={index}>
                <SkeletonText className="text-sm leading-snug" barClassName="w-32" />
                <Skeleton className="h-11 rounded-xl" />
              </Field>
            ),
          )}
        </FieldGroup>
      </div>

      <div className="flex flex-col gap-4">
        <Skeleton className="h-11 rounded-xl" />
        <SkeletonText className="text-center text-xs" barClassName="w-4" />
        <Skeleton className="h-11 rounded-xl" />
      </div>

      <SkeletonText className="pt-6 text-center text-sm" barClassName="w-56" />
    </LoadingRegion>
  </main>
);

export const AuthForm = ({ isSignup = false }: Props) => {
  const {
    email,
    username,
    password,
    handleEmailChange,
    handleUsernameChange,
    handlePasswordChange,
    handleSubmit,
    handleGoogleAuth,
  } = useAuthForm(isSignup);

  return (
    <main className={mainClass}>
      <form className={formClass} onSubmit={handleSubmit}>
        <div className="text-center">
          <div className="mb-2 flex items-center gap-3 justify-center">
            <Logo size="lg" onlyLogo={true} />
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              {isSignup ? "Registrarse" : "Iniciar sesión"}
            </h2>
          </div>
          <p className="mt-2 py-2 text-sm text-foreground/60">
            {isSignup
              ? "Crea una cuenta para disfrutar de SIGIA"
              : "Inicia sesión para continuar en SIGIA"}
          </p>
        </div>

        <div className="my-8">
          <FieldGroup className="gap-5">
            <Field>
              <FieldLabel htmlFor="email" className={labelClass}>
                Correo electrónico
              </FieldLabel>
              <Input
                type="email"
                id="email"
                placeholder="ejemplo@sigia.com"
                required
                value={email}
                onChange={handleEmailChange}
                className={inputClass}
              />
            </Field>
            {isSignup && (
              <Field>
                <FieldLabel htmlFor="username" className={labelClass}>
                  Nombre de usuario
                </FieldLabel>
                <Input
                  id="username"
                  placeholder="ejemplo"
                  required
                  value={username}
                  onChange={handleUsernameChange}
                  className={inputClass}
                />
              </Field>
            )}
            <Field>
              <FieldLabel htmlFor="password" className={labelClass}>
                Contraseña
              </FieldLabel>
              <Input
                type="password"
                id="password"
                placeholder="********"
                required
                aria-describedby={isSignup ? "password-hint" : undefined}
                value={password}
                onChange={handlePasswordChange}
                className={inputClass}
              />
              {isSignup && (
                <p id="password-hint" className="text-xs text-muted-foreground">
                  Mínimo {PASSWORD_MIN_LENGTH} caracteres.
                </p>
              )}
            </Field>
          </FieldGroup>
        </div>

        <div className="flex flex-col gap-4">
          <Button
            size="lg"
            type="submit"
            className="h-11 rounded-xl bg-primary font-semibold text-primary-foreground shadow-md shadow-primary/25 transition hover:bg-orquidea-70"
          >
            {isSignup ? "Registrarse" : "Iniciar sesión"}
          </Button>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-muted" />o
            <span className="h-px flex-1 bg-muted" />
          </div>

          <Button
            type="button"
            variant="outline"
            size="lg"
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border-border font-medium text-foreground hover:bg-muted/50"
            onClick={handleGoogleAuth}
          >
            <GoogleIcon className="h-5 w-5" />
            Continuar con Google
          </Button>
        </div>

        <p className="pt-6 text-center text-sm text-foreground/60">
          {isSignup ? "¿Ya tienes una cuenta?" : "¿No tienes una cuenta?"}{" "}
          <Button
            variant="link"
            asChild
            className="h-auto p-0 font-semibold text-primary"
          >
            <Link to={isSignup ? "/login" : "/signup"}>
              {isSignup ? "Iniciar sesión" : "Registrarse"}
            </Link>
          </Button>
        </p>
      </form>
    </main>
  );
};

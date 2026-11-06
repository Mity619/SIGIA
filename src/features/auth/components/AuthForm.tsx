import { Logo } from "@/shared/components/brand/Logo";
import { Button } from "@/shared/components/shadcn/button";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/shared/components/shadcn/field";
import { Input } from "@/shared/components/shadcn/input";
import { Link } from "react-router-dom";
import { useAuthForm } from "../hooks/useAuthForm";

interface Props {
  isSignup?: boolean;
}

const inputClass =
  "h-11 rounded-xl border-gray-200 bg-gray-50/60 px-4 transition focus-visible:border-[#DA0081] focus-visible:bg-white focus-visible:ring-[#da008133]";

const labelClass = "text-sm font-medium text-[#200020]";

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
    <main className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-[#da00830d] via-white to-[#e366a714] px-4 py-10">
      <form
        className="flex w-full max-w-md flex-col rounded-3xl border border-gray-100 bg-white px-8 py-10 shadow-xl shadow-[#2000200d] sm:px-10"
        onSubmit={handleSubmit}
      >
        <div className="text-center">
          <div className="mb-2 flex items-center gap-3 justify-center">
            <Logo size="lg" onlyLogo={true} />
            <h2 className="text-2xl font-semibold tracking-tight text-[#200020]">
              {isSignup ? "Registrarse" : "Iniciar sesión"}
            </h2>
          </div>
          <p className="mt-2 py-2 text-sm text-[#200020]/60">
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
                value={password}
                onChange={handlePasswordChange}
                className={inputClass}
              />
            </Field>
          </FieldGroup>
        </div>

        <div className="flex flex-col gap-4">
          <Button
            size="lg"
            type="submit"
            className="h-11 rounded-xl bg-[#DA0081] font-semibold text-white shadow-md shadow-[#da008140] transition hover:bg-[#E366A7]"
          >
            {isSignup ? "Registrarse" : "Iniciar sesión"}
          </Button>

          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="h-px flex-1 bg-gray-200" />o
            <span className="h-px flex-1 bg-gray-200" />
          </div>

          <Button
            type="button"
            variant="outline"
            size="lg"
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border-gray-200 font-medium text-[#200020] hover:bg-gray-50"
            onClick={handleGoogleAuth}
          >
            <svg className="h-5 w-5" viewBox="0 0 48 48" aria-hidden="true">
              <path
                fill="#EA4335"
                d="M24 9.5c3.54 0 6.7 1.22 9.2 3.6l6.9-6.9C35.9 2.1 30.4 0 24 0 14.6 0 6.4 5.4 2.6 13.2l8 6.2C12.5 13.4 17.8 9.5 24 9.5z"
              />
              <path
                fill="#4285F4"
                d="M46.1 24.5c0-1.7-.2-3.4-.5-5H24v9.5h12.4c-.5 2.7-2 5-4.3 6.6l7 5.4c4.1-3.8 7-9.5 7-16.5z"
              />
              <path
                fill="#FBBC05"
                d="M10.6 28.4c-1-2.7-1-5.6 0-8.3l-8-6.2C.9 17.4 0 20.6 0 24s.9 6.6 2.6 9.6l8-6.2z"
              />
              <path
                fill="#34A853"
                d="M24 48c6.5 0 12-2.1 16-5.7l-7-5.4c-2 1.4-4.6 2.3-9 2.3-6.2 0-11.5-3.9-13.4-9.2l-8 6.2C6.4 42.6 14.6 48 24 48z"
              />
            </svg>
            Continuar con Google
          </Button>
        </div>

        <p className="pt-6 text-center text-sm text-[#200020]/60">
          {isSignup ? "¿Ya tienes una cuenta?" : "¿No tienes una cuenta?"}{" "}
          <Button
            variant="link"
            asChild
            className="h-auto p-0 font-semibold text-[#DA0081]"
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

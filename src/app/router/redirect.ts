// HU-02: después de iniciar sesión se vuelve a la ruta privada que se pidió.
// La ruta viaja en `location.state.from` y se valida para no redirigir a
// sitios externos ("//otro.com") ni volver a las páginas de autenticación.

export const DEFAULT_PRIVATE_PATH = "/dashboard";

const AUTH_PATHS = ["/login", "/signup"];

export interface RedirectState {
  from?: string;
}

/** Ruta interna a la que volver tras iniciar sesión. */
export const getRedirectPath = (state: unknown): string => {
  const from = (state as RedirectState | null)?.from;

  if (typeof from !== "string" || !from.startsWith("/") || from.startsWith("//")) {
    return DEFAULT_PRIVATE_PATH;
  }

  const pathname = from.split(/[?#]/)[0];
  if (pathname === "/" || AUTH_PATHS.includes(pathname)) {
    return DEFAULT_PRIVATE_PATH;
  }

  return from;
};

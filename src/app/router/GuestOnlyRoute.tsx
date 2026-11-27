//? Para este caso se crea un controlador en la ruta porque se quiere implementar la lógica de que
//? si un usuario ya está logueado pasé directamente a una página en concreta (ej. dashboard y no renderice el login)
//? De este modo se filtran rutas solo para usuarios que no tienen una sesión activa

import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getRedirectPath } from "./redirect";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { AuthFormSkeleton } from "@/features/auth/components/AuthForm";

export const GuestOnlyRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <AuthFormSkeleton />;

  return user ? <Navigate to={getRedirectPath(location.state)} replace /> : <Outlet />;
};

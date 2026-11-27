//* En React Router v.6., las rutas hijas se pasan como el componente Outlet (ya no children)
import { useAuth } from "@/features/auth/hooks/useAuth";
import { AppLayout } from "@/shared/components/layout/AppLayout";
import { PageSkeleton } from "@/shared/components/ui/sections/PageSkeleton";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import type { RedirectState } from "./redirect";

export const PrivateRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Mientras Firebase restaura la sesión se pinta el mismo layout privado,
  // para que al confirmar al usuario solo cambie el contenido.
  if (loading) {
    return (
      <AppLayout>
        <PageSkeleton />
      </AppLayout>
    );
  }

  if (user) return <Outlet />;

  // HU-02: se recuerda la ruta pedida para volver a ella después del login.
  const state: RedirectState = {
    from: `${location.pathname}${location.search}${location.hash}`,
  };
  return <Navigate to="/login" replace state={state} />;
};

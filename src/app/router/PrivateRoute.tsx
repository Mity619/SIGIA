//* En React Router v.6., las rutas hijas se pasan como el componente Outlet (ya no children)
import { useAuth } from "@/features/auth/hooks/useAuth";
import { AppLayout } from "@/shared/components/layout/AppLayout";
import { PageSkeleton } from "@/shared/components/ui/sections/PageSkeleton";
import { Navigate, Outlet } from "react-router-dom";

export const PrivateRoute = () => {
  const { user, loading } = useAuth();

  // Mientras Firebase restaura la sesión se pinta el mismo layout privado,
  // para que al confirmar al usuario solo cambie el contenido.
  if (loading) {
    return (
      <AppLayout>
        <PageSkeleton />
      </AppLayout>
    );
  }

  return user ? <Outlet /> : <Navigate to="/login" />;
};

import { useAuth } from "@/features/auth/hooks/useAuth";
import { Header } from "@/shared/components/ui/sections/Header";

// Pagina plantilla para probar en el sidebar, si algo luego lo quitan o lo trabajan

export const Expenses = () => {
  //* Contexts
  const { user } = useAuth();

  return (
    <>
      <Header
        title={`Hola ${user?.username || "Usuario"}`}
        paragraph="Bienvenido a tu panel de gastos."
      />
    </>
  );
};

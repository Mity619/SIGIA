import { useAuth } from "@/features/auth/hooks/useAuth";
import { Header } from "@/shared/components/ui/sections/Header";

export const Dashboard = () => {
  //* Contexts
  const { user } = useAuth();

  return (
    <>
      <Header
        title={`Hola ${user?.username || "Usuario"}`}
        paragraph="Bienvenido a tu panel de control. Aquí puedes gestionar tus finanzas personales, ver tus gastos y ahorros, y mucho más."
      />
    </>
  );
};

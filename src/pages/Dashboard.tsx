import { useAuth } from "@/features/auth/hooks/useAuth";
import { Header } from "@/shared/components/ui/sections/Header";

export const Dashboard = () => {
  //* Contexts
  const { user } = useAuth();

  return (
    <>
      <Header
        title={`Hola chat`}
        paragraph="Descubre tus finanzas como nunca antes"
      />
    </>
  );
};

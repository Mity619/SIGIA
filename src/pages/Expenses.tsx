import { Link } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Header } from "@/shared/components/ui/sections/Header";

export const Expenses = () => {
  //* Contexts
  const { user } = useAuth();

  //* Datos de las tarjetas
  const menuCards = [
    {
      title: "Gastos",
      description: "Administra tus egresos, suscripciones y gastos diarios.",
      icon: "ri-shopping-bag-3-line",
      route: "/gastos",
      color: "text-red-500",
      bgColor: "bg-red-50",
      hoverBorder: "hover:border-red-200",
    },
    {
      title: "Ingresos",
      description: "Registra tu salario, ventas o entradas de dinero extra.",
      icon: "ri-money-dollar-circle-line",
      route: "/ingresos",
      color: "text-green-500",
      bgColor: "bg-green-50",
      hoverBorder: "hover:border-green-200",
    },
    {
      title: "Grupos y Etiquetas",
      description: "Crea categorías personalizadas para organizar tus movimientos.",
      icon: "ri-price-tag-3-line",
      route: "/etiquetas",
      color: "text-blue-500",
      bgColor: "bg-blue-50",
      hoverBorder: "hover:border-blue-200",
    },
  ];

  return (
    <div className="mx-auto max-w-5xl p-6">
      <Header
        title={`Hola ${user?.username || "Usuario"}`}
        paragraph="Bienvenido a tu panel principal. ¿Qué te gustaría gestionar hoy?"
      />

      {/* Grid de Tarjetas */}
      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        {menuCards.map((card) => (
          <Link
            key={card.route}
            to={card.route}
            className={`group flex flex-col justify-between rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${card.hoverBorder}`}
          >
            <div>
              <div
                className={`mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl ${card.bgColor}`}
              >
                <i className={`${card.icon} text-3xl ${card.color}`} />
              </div>
              <h3 className="mb-2 text-xl font-bold text-[#200020]">
                {card.title}
              </h3>
              <p className="text-sm text-gray-500">
                {card.description}
              </p>
            </div>
            
            <div className="mt-6 flex items-center text-sm font-semibold text-[#DA0081]">
              <span>Entrar a {card.title}</span>
              <i className="ri-arrow-right-line ml-2 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

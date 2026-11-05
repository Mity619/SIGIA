import { Button } from "@/shared/components/shadcn/button";
import { Link } from "react-router-dom";
import Money from "@/assets/images/money.png";

export const Home = () => {
  return (
    <main className="h-screen w-full overflow-hidden">
      <div className="flex flex-col md:flex-row items-center justify-center h-full w-full">
        {/* Lado izquierdo: Ocupa todo el alto de borde a borde */}
        <div className="w-full md:w-3/7 h-1/2 md:h-full flex justify-center items-center p-0 overflow-hidden">
          <img
            src={Money}
            alt="Ilustración SIGIA"
            className="h-full w-full object-cover"
          />
        </div>

        {/* Lado derecho */}
        <div className="w-full md:w-5/7 h-1/2 md:h-full flex flex-col justify-between p-6 md:p-12">
          <div className="flex flex-col items-center justify-center flex-1 text-center">
            <h1 className="text-6xl md:text-9xl font-bold text-[#200020]">
              SIGIA
            </h1>
            <p className="text-base md:text-lg text-gray-700 mt-4">
              Bienvenido a <strong className="text-[#200020]">SIGIA</strong> tu
              app web de finanzas personales.
            </p>
            <p className="text-base md:text-lg text-gray-700">
              Administra tus gastos y ahorros de manera eficiente y sencilla.
            </p>
            <Button
              asChild
              className="mt-6 bg-[#DA0081] text-white hover:bg-[#5a2470]"
            >
              <Link to="/signup">Ingresar</Link>
            </Button>
          </div>

          <div className="shrink-0 text-center text-[#da0081] font-semibold cursor-pointer pt-2">
            <Link to="cualquier-cosa">¿Quiénes somos?</Link>
          </div>
        </div>
      </div>
    </main>
  );
};

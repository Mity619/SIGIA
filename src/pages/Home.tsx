import { Link } from "react-router-dom";
import { Button } from "@/shared/components/shadcn/button";
import { Logo } from "@/shared/components/brand/Logo";
import Money from "@/assets/images/money.png";

const FEATURES = [
  {
    icon: "ri-exchange-dollar-line",
    title: "Gastos e ingresos",
    description: "Registra cada movimiento en segundos.",
  },
  {
    icon: "ri-bank-card-line",
    title: "Tus cuentas",
    description: "Todo tu dinero, en un solo lugar.",
  },
  {
    icon: "ri-safe-2-line",
    title: "Metas de ahorro",
    description: "Ahorra con un objetivo claro.",
  },
];

// Barras decorativas de la tarjeta flotante (altura relativa en %).
const PREVIEW_BARS = [40, 65, 50, 80, 60, 95];

const ctaClass = "h-12 rounded-xl px-6 text-base";

export const Home = () => {
  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-[#da00830d] via-white to-[#e366a714]">
      <div className="mx-auto flex min-h-screen max-w-7xl gap-10 p-4 sm:p-6 lg:p-8">
        {/* Ilustración: solo en pantallas grandes */}
        <aside className="relative hidden w-5/12 shrink-0 overflow-hidden rounded-3xl shadow-xl shadow-[#da008126] lg:block">
          <img
            src={Money}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#200020]/80 via-[#200020]/10 to-transparent" />

          {/* Tarjeta flotante de vista previa */}
          <div className="absolute inset-x-8 bottom-8 rounded-2xl border border-white/20 bg-white/90 p-5 shadow-lg backdrop-blur">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-[#200020]/60">
                  Balance del mes
                </p>
                <p className="mt-1 text-2xl font-bold text-[#200020]">
                  $ 1.250.000
                </p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#da008114] px-2.5 py-1 text-xs font-semibold text-[#DA0081]">
                <i className="ri-arrow-up-line" aria-hidden="true" />
                12%
              </span>
            </div>
            <div className="mt-4 flex h-16 items-end gap-2" aria-hidden="true">
              {PREVIEW_BARS.map((height, index) => (
                <span
                  key={index}
                  style={{ height: `${height}%` }}
                  className={`flex-1 rounded-md ${
                    index === PREVIEW_BARS.length - 1
                      ? "bg-[#DA0081]"
                      : "bg-[#f1bfda]"
                  }`}
                />
              ))}
            </div>
          </div>
        </aside>

        {/* Contenido */}
        <section className="flex flex-1 flex-col">
          <header className="flex items-center justify-between">
            <Logo size="md" />
            <Link
              to="/cualquier-cosa"
              className="text-sm font-semibold text-[#DA0081] transition hover:text-[#5a2470]"
            >
              ¿Quiénes somos?
            </Link>
          </header>

          <div className="flex flex-1 flex-col justify-center py-12">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[#da008114] px-4 py-1 text-sm font-medium text-[#DA0081]">
              <i className="ri-sparkling-2-fill" aria-hidden="true" />
              Finanzas personales, sin complicaciones
            </span>

            <h1 className="mt-6 text-5xl font-bold leading-tight tracking-tight text-[#200020] md:text-6xl xl:text-7xl">
              Tu dinero, <br />
              <span className="text-[#DA0081]">claro y en orden.</span>
            </h1>

            <p className="mt-6 max-w-xl text-base text-[#200020]/70 md:text-lg">
              Con <strong className="text-[#200020]">SIGIA</strong> administras
              tus gastos, ingresos y ahorros de manera eficiente y sencilla.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                className={`${ctaClass} bg-[#DA0081] text-white shadow-lg shadow-[#da008140] hover:bg-[#5a2470]`}
              >
                <Link to="/login">
                  Ingresar
                  <i className="ri-arrow-right-line" aria-hidden="true" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className={`${ctaClass} border-[#f1bfda] bg-white text-[#200020] hover:bg-[#ece7f5]`}
              >
                <Link to="/signup">Crear cuenta</Link>
              </Button>
            </div>

            {/* Funcionalidades */}
            <ul className="mt-12 grid gap-4 sm:grid-cols-3">
              {FEATURES.map((feature) => (
                <li
                  key={feature.title}
                  className="rounded-2xl border bg-white/80 p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md hover:shadow-[#da008120]"
                >
                  <span className="flex size-10 items-center justify-center rounded-xl bg-[#ece7f5] text-xl text-[#DA0081]">
                    <i className={feature.icon} aria-hidden="true" />
                  </span>
                  <h2 className="mt-3 text-sm font-semibold text-[#200020]">
                    {feature.title}
                  </h2>
                  <p className="mt-1 text-sm text-[#200020]/60">
                    {feature.description}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <footer className="text-center text-sm text-[#200020]/50 lg:text-left">
            Hecho con{" "}
            <i className="ri-heart-fill text-[#DA0081]" aria-hidden="true" />
            <span className="sr-only">amor</span> por{" "}
            <Link
              to="/cualquier-cosa"
              className="font-medium text-[#200020]/70 hover:text-[#DA0081]"
            >
              Cualquier Cosa
            </Link>
          </footer>
        </section>
      </div>
    </main>
  );
};

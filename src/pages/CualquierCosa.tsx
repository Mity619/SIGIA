import { Link } from "react-router-dom";
import { Button } from "@/shared/components/shadcn/button";
import { Logo } from "@/shared/components/brand/Logo";
import { TeamMemberCard } from "@/features/team/components/TeamMemberCard";
import {
  TEAM_MEMBERS,
  TEAM_NAME,
  TEAM_TAGLINE,
} from "@/features/team/constants/team.constants";

const CURRENT_YEAR = new Date().getFullYear();

export const CualquierCosa = () => {
  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-primary/5 via-background to-orquidea-70/8">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-6 sm:px-6">
        {/* Encabezado */}
        <header className="flex items-center justify-between">
          <Link to="/" aria-label="Ir al inicio">
            <Logo size="md" />
          </Link>
          <Button asChild variant="ghost" className="text-foreground">
            <Link to="/">
              <i className="ri-arrow-left-line" aria-hidden="true" />
              Volver
            </Link>
          </Button>
        </header>

        {/* Presentación del equipo */}
        <section className="mt-12 text-center md:mt-16">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/8 px-4 py-1 text-sm font-medium text-primary">
            <i className="ri-team-fill" aria-hidden="true" />
            Equipo de desarrollo
          </span>
          <h1 className="mt-4 text-5xl font-bold tracking-tight text-foreground md:text-7xl">
            {TEAM_NAME}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-foreground/70 md:text-lg">
            {TEAM_TAGLINE}
          </p>
        </section>

        {/* Integrantes */}
        <section
          aria-label="Integrantes del equipo"
          className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {TEAM_MEMBERS.map((member) => (
            <TeamMemberCard key={member.name} member={member} />
          ))}
        </section>

        {/* Pie */}
        <footer className="mt-auto pt-12 text-center text-sm text-foreground/50">
          Hecho con <i className="ri-heart-fill text-primary" aria-hidden="true" />
          <span className="sr-only">amor</span> por {TEAM_NAME} · SIGIA ©{" "}
          {CURRENT_YEAR}
        </footer>
      </div>
    </main>
  );
};

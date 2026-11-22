import type { TeamMember } from "../types/team.types";
import alexPhoto from "@/assets/images/Alex.jpeg";
import lauraPhoto from "@/assets/images/Laura.jpeg";
import leitonPhoto from "@/assets/images/Leiton.jpeg";
import lucasPhoto from "@/assets/images/Lucas.jpeg";

export const TEAM_NAME = "Cualquier Cosa";

export const TEAM_TAGLINE =
  "Somos el equipo detrás de SIGIA: cuatro estudiantes que convirtieron las finanzas personales en algo sencillo.";

export const TEAM_MEMBERS: TeamMember[] = [
  {
    name: "Alex Silva",
    ig: "@alex_silva24",
    bio: "La tranquilidad no tiene precio",
    photo: alexPhoto,
    photoPosition: "50% 30%",
    github: "https://github.com/silva242004",
  },
  {
    name: "Laura Campo",
    ig: "@lau_ruiz04",
    bio: "Jugadora high elo de Valorant",
    photo: lauraPhoto,
    photoPosition: "50% 15%",
    github: "https://github.com/Laura-404",
  },
  {
    name: "Sebastián Leiton",
    ig: "@leiton__g",
    bio: "Jugador low elo de Valorant",
    photo: leitonPhoto,
    photoPosition: "50% 40%",
    github: "https://github.com/leiton05",
  },
  {
    name: "Lucas García",
    ig: "mity_619_",
    bio: "Cazador de tokens del Fortnite",
    photo: lucasPhoto,
    photoPosition: "50% 20%",
    github: "https://github.com/Mity619",
  },
];

export interface TeamMember {
  name: string;
  ig: string;
  bio: string;
  // URL o import de la imagen (ej. `import foto from "@/assets/images/team/foto.jpg"`).
  photo?: string;
  // Encuadre de la foto dentro del círculo (CSS object-position), ej. "50% 30%".
  photoPosition?: string;
  github?: string;
}

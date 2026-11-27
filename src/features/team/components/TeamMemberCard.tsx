import { useState } from "react";
import type { TeamMember } from "../types/team.types";

interface TeamMemberCardProps {
  member: TeamMember;
}

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");

const socialLinkClass =
  "flex size-9 items-center justify-center rounded-full bg-muted text-foreground transition hover:bg-primary hover:text-primary-foreground";

export const TeamMemberCard = ({ member }: TeamMemberCardProps) => {
  const [photoFailed, setPhotoFailed] = useState(false);
  const showPhoto = member.photo && !photoFailed;

  return (
    <article className="group flex flex-col items-center rounded-2xl border bg-card p-6 text-center shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/12">
      {/* Foto con anillo de marca */}
      <div className="rounded-full bg-gradient-to-br from-primary to-orquidea-50 p-1 transition duration-300 group-hover:scale-105">
        {showPhoto ? (
          <img
            src={member.photo}
            alt={`Foto de ${member.name}`}
            width={112}
            height={112}
            loading="lazy"
            style={{ objectPosition: member.photoPosition ?? "50% 50%" }}
            className="size-28 rounded-full border-4 border-background bg-muted object-cover"
            onError={() => setPhotoFailed(true)}
          />
        ) : (
          <div
            className="flex size-28 items-center justify-center rounded-full border-4 border-background bg-muted text-3xl font-bold text-primary"
            aria-hidden="true"
          >
            {getInitials(member.name)}
          </div>
        )}
      </div>

      <h3 className="mt-4 text-lg font-semibold text-foreground">
        {member.name}
      </h3>
      <span className="mt-1 rounded-full bg-primary/8 px-3 py-0.5 text-xs font-medium text-primary">
        {member.ig}
      </span>
      <p className="mt-3 text-sm text-foreground/70">{member.bio}</p>

      {member.github && (
        <div className="mt-4 flex gap-2">
          {member.github && (
            <a
              href={member.github}
              target="_blank"
              rel="noreferrer"
              aria-label={`GitHub de ${member.name}`}
              className={socialLinkClass}
            >
              <i className="ri-github-fill text-lg" aria-hidden="true" />
            </a>
          )}
        </div>
      )}
    </article>
  );
};

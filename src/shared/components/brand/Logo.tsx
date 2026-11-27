interface LogoProps {
  size?: "sm" | "md" | "lg";
  onlyLogo?: boolean;
}

const sizes = {
  sm: { box: "size-8 rounded-xl", icon: "text-lg", text: "text-xl" },
  md: { box: "size-10 rounded-2xl", icon: "text-2xl", text: "text-2xl" },
  lg: { box: "size-12 rounded-2xl", icon: "text-3xl", text: "text-3xl" },
};

export const Logo = ({ size = "lg", onlyLogo = false }: LogoProps) => {
  const s = sizes[size];

  return (
    <span className="flex items-center gap-3">
      <span
        className={`flex shrink-0 items-center justify-center bg-primary shadow-md shadow-primary/25 ${s.box}`}
      >
        <i
          className={`ri-money-dollar-circle-fill leading-none text-primary-foreground ${s.icon}`}
          aria-hidden="true"
        />
      </span>
      {!onlyLogo && (
        <span className={`font-bold tracking-tight text-foreground ${s.text}`}>
          SIGIA
        </span>
      )}
    </span>
  );
};

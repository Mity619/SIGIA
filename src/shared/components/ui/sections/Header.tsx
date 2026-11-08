interface HeaderProps {
  title: string;
  paragraph?: string;
}

export const Header = ({ title, paragraph }: HeaderProps) => {
  return (
    <header className="mx-auto flex max-w-2xl flex-col items-center gap-3 py-4 text-center">
      <span
        className="h-1 w-10 rounded-full bg-gradient-to-r from-[#DA0081] to-[#E366A7]"
        aria-hidden="true"
      />
      <h1 className="text-2xl font-bold tracking-tight text-[#200020] sm:text-3xl">
        {title}
      </h1>
      {paragraph && (
        <p className="max-w-md text-sm leading-relaxed text-[#200020]/60 sm:text-base">
          {paragraph}
        </p>
      )}
    </header>
  );
};

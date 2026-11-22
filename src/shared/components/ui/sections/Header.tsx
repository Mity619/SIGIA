import { Skeleton } from "@/shared/components/shadcn/skeleton";
import { SkeletonText } from "@/shared/components/ui/loading/SkeletonText";

interface HeaderProps {
  title: string;
  paragraph?: string;
}

const headerClass = "mx-auto flex max-w-2xl flex-col items-center gap-3 py-4 text-center";
const titleTextClass = "text-2xl sm:text-3xl";
const paragraphTextClass = "text-sm leading-relaxed sm:text-base";
const PARAGRAPH_SKELETON_LINES = 2;

export const Header = ({ title, paragraph }: HeaderProps) => {
  return (
    <header className={headerClass}>
      <span
        className="h-1 w-10 rounded-full bg-gradient-to-r from-[#DA0081] to-[#E366A7]"
        aria-hidden="true"
      />
      <h1 className={`${titleTextClass} font-bold tracking-tight text-[#200020]`}>
        {title}
      </h1>
      {paragraph && (
        <p className={`max-w-md ${paragraphTextClass} text-[#200020]/60`}>
          {paragraph}
        </p>
      )}
    </header>
  );
};

export const HeaderSkeleton = () => (
  <div className={headerClass}>
    <Skeleton className="h-1 w-10 rounded-full" />
    <SkeletonText className={titleTextClass} barClassName="w-48" />
    <SkeletonText
      className={`w-full max-w-md ${paragraphTextClass}`}
      lines={PARAGRAPH_SKELETON_LINES}
    />
  </div>
);

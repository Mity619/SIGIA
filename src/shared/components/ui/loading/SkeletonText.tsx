import { cn } from "@/lib/utils";
import { Skeleton } from "@/shared/components/shadcn/skeleton";

interface SkeletonTextProps {
  /** Mismas clases tipográficas que el texto real (ej. "text-sm", "mt-2 text-2xl"). */
  className?: string;
  /** Ancho o color de la barra (ej. "w-32"). */
  barClassName?: string;
  lines?: number;
}

/**
 * Línea de texto falsa: la barra mide 1em y la línea toma el line-height de las
 * clases recibidas, así ocupa exactamente el alto del texto que reemplaza.
 */
export const SkeletonText = ({ className, barClassName, lines = 1 }: SkeletonTextProps) => (
  <div aria-hidden="true" className={className}>
    {Array.from({ length: lines }, (_, index) => (
      <div key={index}>
        <Skeleton
          className={cn(
            "inline-block h-[1em] w-full max-w-full align-middle",
            lines > 1 && index === lines - 1 && "w-2/3",
            barClassName,
          )}
        />
      </div>
    ))}
  </div>
);

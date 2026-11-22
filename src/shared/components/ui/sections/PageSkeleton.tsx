import { Skeleton } from "@/shared/components/shadcn/skeleton";
import { LoadingRegion } from "@/shared/components/ui/loading/LoadingRegion";
import { HeaderSkeleton } from "./Header";

const SUMMARY_CARD_COUNT = 3;

/**
 * Contenido genérico mientras se verifica la sesión: todavía no se sabe qué datos
 * pedirá la página, así que imita la forma común (cabecera, tarjetas y un bloque).
 */
export const PageSkeleton = () => (
  <LoadingRegion className="mx-auto w-full max-w-5xl space-y-6">
    <HeaderSkeleton />
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {Array.from({ length: SUMMARY_CARD_COUNT }, (_, index) => (
        <Skeleton key={index} className="h-28 rounded-2xl" />
      ))}
    </div>
    <Skeleton className="h-64 rounded-2xl sm:h-72" />
  </LoadingRegion>
);

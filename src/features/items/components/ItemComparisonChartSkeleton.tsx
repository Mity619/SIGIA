import { cn } from "@/lib/utils";
import { Skeleton } from "@/shared/components/shadcn/skeleton";
import { LoadingRegion } from "@/shared/components/ui/loading/LoadingRegion";
import { SkeletonText } from "@/shared/components/ui/loading/SkeletonText";
import {
  comparisonGridClass,
  comparisonSectionClass,
  comparisonTitleTextClass,
  donutAreaClass,
  donutCaptionTextClass,
  donutCardClass,
  donutLegendClass,
} from "./comparisonChartLayout";

// Frente a gastos y frente a ingresos del mes.
const DONUT_COUNT = 2;

/** Misma forma que ItemComparisonChart; también es el fallback de su carga diferida. */
export function ItemComparisonChartSkeleton() {
  return (
    <LoadingRegion className={comparisonSectionClass} label="Cargando gráficas">
      <SkeletonText className={comparisonTitleTextClass} barClassName="w-56" />
      <div className={comparisonGridClass}>
        {Array.from({ length: DONUT_COUNT }, (_, index) => (
          <div key={index} className={donutCardClass}>
            <SkeletonText className={donutCaptionTextClass} barClassName="w-48" />
            <div className={cn(donutAreaClass, "flex w-full items-center justify-center")}>
              <Skeleton className="size-44 rounded-full" />
            </div>
            <SkeletonText className={donutLegendClass} barClassName="w-52" />
          </div>
        ))}
      </div>
    </LoadingRegion>
  );
}

// Layout compartido entre ItemComparisonChart (carga diferida) y su skeleton.
// Vive aparte para que el skeleton no importe Recharts.
export const comparisonSectionClass = "flex flex-col gap-3";
export const comparisonTitleTextClass = "text-lg";
export const comparisonGridClass = "grid grid-cols-1 gap-4 sm:grid-cols-2";
export const donutCardClass =
  "flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-5 shadow-sm";
export const donutCaptionTextClass = "text-sm";
export const donutAreaClass = "h-48";
export const donutLegendClass = "flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs";

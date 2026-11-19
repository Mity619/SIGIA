// Estilos compartidos de las gráficas del detalle de cuenta, siempre con tokens del tema.
export const chartCardClass =
  "flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm";
export const chartAreaClass = "h-64 w-full sm:h-72";

export const CHART_AXIS_TICK = { fill: "var(--muted-foreground)", fontSize: 12 };
export const CHART_Y_AXIS_WIDTH = 72;
export const CHART_MARGIN = { top: 8, right: 16, bottom: 0, left: 0 };

export const chartTooltipStyle = {
  background: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-xl)",
  color: "var(--popover-foreground)",
};

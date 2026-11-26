import type { ComponentProps } from "react";

interface LoadingRegionProps extends ComponentProps<"div"> {
  /** Texto que escuchan los lectores de pantalla mientras carga. */
  label?: string;
}

/**
 * Contenedor de un skeleton: anuncia la carga y recibe el mismo layout (className)
 * que la vista final. El texto oculto es absoluto, no ocupa celda de grid ni gap.
 */
export const LoadingRegion = ({
  label = "Cargando información",
  children,
  ...props
}: LoadingRegionProps) => (
  <div role="status" aria-busy="true" {...props}>
    <span className="sr-only">{label}</span>
    {children}
  </div>
);

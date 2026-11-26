import { useEffect, useRef, useState } from "react";

// Valor local para un input cuyo valor real vive en la URL.
// React Router aplica los cambios de URL dentro de startTransition: si el input
// leyera directamente de la URL, React lo volvería a pintar con el valor
// anterior entre tecla y tecla (escribir "100", borrar y escribir "5" daba "1005").
// Mientras el input tiene el foco manda el valor local; los cambios externos
// (Limpiar filtros, atrás/adelante) se copian cuando no lo tiene.
export function useDraftValue(urlValue: string) {
  const [draft, setDraft] = useState(urlValue);
  const focused = useRef(false);

  useEffect(() => {
    if (!focused.current) setDraft(urlValue);
  }, [urlValue]);

  return {
    value: draft,
    setValue: setDraft,
    onFocus: () => {
      focused.current = true;
    },
    onBlur: () => {
      focused.current = false;
    },
  };
}

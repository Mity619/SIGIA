// HU-23 · Regla: los componentes solo usan tokens del tema (src/styles/index.css).
// Falla si aparece un color fijo (#hex o paleta de Tailwind como text-red-500)
// o una fuente fija en cualquier archivo .ts/.tsx de src.
import { describe, expect, it } from "vitest";

// Contenido de todos los .ts/.tsx de src (Vite los lee al ejecutar la prueba).
const FILES = import.meta.glob<string>(["../**/*.{ts,tsx}", "!../**/*.test.{ts,tsx}"], {
  query: "?raw",
  import: "default",
  eager: true,
});

// Excepciones justificadas:
// - shadcn/: componentes generados por la librería; ya usan tokens.
// - GoogleIcon: colores oficiales de la marca Google.
const ALLOWED = ["/shared/components/shadcn/", "/brand/GoogleIcon.tsx"];

const HEX_COLOR = /#[0-9a-fA-F]{6}(?:[0-9a-fA-F]{2})?\b|#[0-9a-fA-F]{3}\b(?![0-9a-fA-F-])/;
const TAILWIND_PALETTE =
  /\b(?:text|bg|border|ring|from|via|to|shadow|accent|fill|stroke|outline|divide|decoration|placeholder)-(?:white|black|(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3})\b/;
const FIXED_FONT = /font-\[|fontFamily\s*:/;

const violations = (pattern: RegExp): string[] =>
  Object.entries(FILES)
    .filter(([file]) => !ALLOWED.some((allowed) => file.includes(allowed)))
    .flatMap(([file, content]) =>
      content
        .split("\n")
        .map((line, index) => ({ line, index }))
        .filter(({ line }) => pattern.test(line))
        .map(({ line, index }) => `${file.replace("../", "src/")}:${index + 1}  ${line.trim()}`),
    );

it("la regla revisa los archivos de src", () => {
  expect(Object.keys(FILES).length).toBeGreaterThan(50);
});

describe("tokens del tema (HU-23)", () => {
  it("no hay colores hexadecimales fijos en componentes", () => {
    expect(violations(HEX_COLOR)).toEqual([]);
  });

  it("no se usa la paleta fija de Tailwind (usar primary, muted, destructive, success…)", () => {
    expect(violations(TAILWIND_PALETTE)).toEqual([]);
  });

  it("no hay fuentes fijas (la fuente viene del tema)", () => {
    expect(violations(FIXED_FONT)).toEqual([]);
  });
});

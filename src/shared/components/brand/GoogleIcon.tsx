// Logo oficial de Google. Sus colores son de marca y no se reemplazan por
// tokens del tema: es la única excepción a la regla de colores (HU-23).
export function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.7 1.22 9.2 3.6l6.9-6.9C35.9 2.1 30.4 0 24 0 14.6 0 6.4 5.4 2.6 13.2l8 6.2C12.5 13.4 17.8 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.1 24.5c0-1.7-.2-3.4-.5-5H24v9.5h12.4c-.5 2.7-2 5-4.3 6.6l7 5.4c4.1-3.8 7-9.5 7-16.5z"
      />
      <path
        fill="#FBBC05"
        d="M10.6 28.4c-1-2.7-1-5.6 0-8.3l-8-6.2C.9 17.4 0 20.6 0 24s.9 6.6 2.6 9.6l8-6.2z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.5 0 12-2.1 16-5.7l-7-5.4c-2 1.4-4.6 2.3-9 2.3-6.2 0-11.5-3.9-13.4-9.2l-8 6.2C6.4 42.6 14.6 48 24 48z"
      />
    </svg>
  );
}

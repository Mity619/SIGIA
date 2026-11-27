import type { IconTone } from "../types/tags.types";

export function ToneSelector({ value, onChange }: { value: IconTone, onChange: (t: IconTone) => void }) {
  const tones: { id: IconTone, label: string, color: string }[] = [
    { id: "green", label: "Positivo", color: "bg-success" },
    { id: "neutral", label: "Neutro", color: "bg-muted-foreground" },
    { id: "red", label: "Alerta", color: "bg-destructive" },
  ];
  return (
    <div className="flex gap-2">
      {tones.map((t) => (
        <button
          key={t.id} type="button" onClick={() => onChange(t.id)}
          className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${value === t.id ? 'border-primary bg-primary/10' : 'border-border'}`}
        >
          <span className={`h-3 w-3 rounded-full ${t.color}`} />
          {t.label}
        </button>
      ))}
    </div>
  );
}
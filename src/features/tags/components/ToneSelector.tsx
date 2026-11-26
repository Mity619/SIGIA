import type { IconTone } from "../types/tags.types";

export function ToneSelector({ value, onChange }: { value: IconTone, onChange: (t: IconTone) => void }) {
  const tones: { id: IconTone, label: string, color: string }[] = [
    { id: "green", label: "Positivo", color: "bg-green-500" },
    { id: "neutral", label: "Neutro", color: "bg-gray-500" },
    { id: "red", label: "Alerta", color: "bg-red-500" },
  ];
  return (
    <div className="flex gap-2">
      {tones.map((t) => (
        <button
          key={t.id} type="button" onClick={() => onChange(t.id)}
          className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${value === t.id ? 'border-[#DA0081] bg-[#DA0081]/10' : 'border-gray-200'}`}
        >
          <span className={`h-3 w-3 rounded-full ${t.color}`} />
          {t.label}
        </button>
      ))}
    </div>
  );
}